require("./Polyfill");

(function() {
	var Spritzr = {
		_superFunction : function() {
			if(typeof arguments.callee.caller.prototype == "function") {
				return arguments.callee.caller.prototype.apply(this, arguments);
			}
		},
		
		/**
		 * This is a marker for tracking methods overwritten by talents
		 */
		_noPreviousMethod : {},
			
		/**
		 * Extends SubClass with superClass in a single-inheritance model. Note
		 * that this implements prototype inheritance (like Prototype.js) rather
		 * than just copying properties (like jQuery). <aside>Not sure how good
		 * an idea this is, but let's roll with it!</aside>
		 * <p>
		 * Also adds a property '<code>$super</code>' to the prototype to
		 * allow access to the superclass methods.
		 * 
		 * @param subject
		 *            the sub class to extend
		 * @param obj
		 *            the super class to extend the sub class with
		 */
		extend : function(subClass, superClass) {
			if (typeof (superClass) == "function") {
				// Set up the prototype chain
				var prevProto = subClass.prototype;

				subClass.prototype = (function() {
					var proto = function() {
						this.constructor = subClass;

						// Copy any existing prototype properties across
						for ( var i in prevProto) {
							if(prevProto.hasOwnProperty(i)) {
								this[i] = prevProto[i];
							}
						}
						
						// Set up the faux "$super" reference
						var $super = function() {
							// Cache a reference to the real object while we can
							if(this instanceof subClass) {
								$super.instance = this;
							}
							if(typeof arguments.callee.caller.prototype.__proto__.constructor == "function") {
								return arguments.callee.caller.prototype.__proto__.constructor.apply(this, arguments);
							}
						};
						
						// And copy the superclass prototype functions across
						for ( var i in superClass.prototype) {
							if(typeof superClass.prototype[i] == "function") {
								$super[i] = function() {
									var t;
									
									if($super.instance && (this == $super)) {
										t = $super.instance;
									} else {
										t = this;
									}
									
									return superClass.prototype[i].apply(t, arguments);
								};
							}
						};				
						
						this.$super = $super;
					};

					proto.prototype = superClass.prototype;

					var p = new proto();

					return p;
				})();

				// And then
				var spritz = Spritzr._getSpritzrVarCreate(subClass);
				spritz.parent = superClass;
			} else {
				throw new Error("Can only extend 'classes'");
			}
		},

		/**
		 * Spritzes (mixes in) an existing class or instance with the given
		 * object.<br />
		 * If subject is a class/function then obj will become a 'trait' and
		 * apply to the class.<br />
		 * If subject is an instance then obj becomes a talent and will only
		 * apply to this one instance.
		 */
		spritz : function(subject, obj) {
			if (typeof (subject) == "function") {
				var spritz = Spritzr._getSpritzrVarCreate(subject);

				if (typeof (obj) == "function") {
					for ( var key in obj.prototype) {
						subject.prototype[key] = obj.prototype[key];
					}
				} else {
					for ( var key in obj) {
						subject.prototype[key] = obj[key];
					}
				}

				spritz.traits.push(obj);
			} else {
				var spritz = Spritzr._getSpritzrVarCreate(subject);

				var getPropsFrom, clazz;
				
				if (typeof (obj) == "function") {
					getPropsFrom = obj.prototype;
					clazz = obj;
				} else {
					getPropsFrom = obj;
					clazz = obj.constructor;
				}

				for(var key in getPropsFrom) {
					if(typeof spritz.removed[key] == "undefined") {
						if((typeof subject[key] !== "undefined")
							&& subject.hasOwnProperty(key)) {
							spritz.removed[key] = subject[key];
						} else {
							spritz.removed[key] = Spritzr._noPreviousMethod;
						}
					}
					subject[key] = getPropsFrom[key];
				}
				
				if (typeof (obj) == "function") {
					obj.call(subject);	// Call the constructor with the subject as 'this'
				}

				spritz.talents.push(obj);
				spritz.talentClasses.push(clazz);
			}
		},
		
		/**
		 * Does the opposite of <code>spritz()</code>, although currently only removes talents
		 * from instances (does not work on traits on classes).
		 * 
		 * @param subject
		 * @param obj
		 */
		unspritz : function(subject, obj) {
			if (typeof (subject) != "function") {
				var spritz = Spritzr._getSpritzrVar(subject);
				
				if(spritz) {
					var i = spritz.talentClasses.indexOf(obj);
					if(i > -1) {
						spritz.talents.splice(i, 1);
						spritz.talentClasses.splice(i, 1);
					}
				}
				
				// Go through all the talent properties and reinstate existing methods
				for(key in obj.prototype) {
					// Check if the defined method is actually the trait method
					if(subject[key] === obj.prototype[key]) {
						var found = false;
						
						for(var i = spritz.talents.length - 1; i >= 0; --i) {
							var talent = spritz.talents[i];
							
							if(typeof talent.prototype[key] !== "undefined") {
								subject[key] = talent.prototype[key];
								found = true;
								break;
							}
						}
						
						if(!found) {
							if(typeof spritz.removed[key] !== 'undefined') {
								if(spritz.removed[key] === Spritzr._noPreviousMethod) {
									// The object previously didn't have the method defined.
									delete subject[key];
								} else {
									subject[key] = spritz.removed[key];
								}
								delete spritz.removed[key];
							} else {
								delete subject[key];
							}
						}
					}
				}
			}
		},

		/**
		 * Returns <code>true</code> if: <br>
		 * <ul>
		 * <li><code>instance instanceof type</code> is <code>true</code>
		 * <li>instance has the given type as a class trait
		 * <li>instance has the given type as an instance talent
		 * </ul>
		 * 
		 * @param instance
		 *            the instance to test
		 * @param type
		 *            the type to test <code>subject</code>
		 */
		isa : function(instance, type) {
			if (instance instanceof type) {
				return true;
			}

			var spritz = Spritzr._getSpritzrVar(instance);

			if (spritz && (spritz.talentClasses.indexOf(type) > -1)) {
				return true;
			}

			return Spritzr.inherits(instance.constructor, type);
		},

		/**
		 * Checks whether the given class has inherited the given type (either
		 * as a super class or a trait)
		 * 
		 * @param clazz
		 *            the class to test
		 * @param type
		 *            the type to test against
		 */
		inherits : function(clazz, type) {
			// TODO Add cycle checking
			if (clazz === type) {
				return true;
			}

			var spritz = Spritzr._getSpritzrVar(clazz);

			// If it's not been spritzed then we won't do anything
			if (!spritz) {
				return false;
			}

			if (spritz.parent === type) {
				return true;
			}

			// If we have that trait
			if (spritz.traits.indexOf(type) > -1) {
				return true;
			}

			// If the parent inherits it
			if (spritz.parent && Spritzr.inherits(spritz.parent, type)) {
				return true;
			}

			// If one of the traits inherits it
			for ( var i in spritz.traits) {
				if (Spritzr.inherits(spritz.traits[i], type)) {
					return true;
				}
			}

			return false;
		},

		_getSpritzrVarCreate : function(obj) {
			if (!obj._$spritz) {
				obj._$spritz = {
					parent : null,

					traits : [],
					talents : [],	// The actual talent instances
					talentClasses : [],
					
					removed : {}
				};
			}

			return obj._$spritz;
		},

		_getSpritzrVar : function(obj) {
			return obj._$spritz;
		}
	};
/*
 * // Support node.js, AMD and plain ol' JS. if (typeof module !== 'undefined' &&
 * typeof module.exports !== 'undefined') { module.exports = Spritzr; } else {
 * if (typeof define === 'function' && define.amd) { define([], function() {
 * return Spritzr; }); } else { window.Spritzr = Spritzr; } }
 */
	module.exports = Spritzr;
})();