var Spritz = require("../src/Spritz.js");

describe("Spritz", function() {
	describe("Inheritance", function() {
		it("can extend a class", function() {
			var SuperClass = function() {};
			
			SuperClass.prototype.method1 = function() {
				return "method1";
			};
			
			var SubClass = function() {};
			
			Spritz.extend(SubClass, SuperClass);
			
			var instance = new SubClass();
			
			expect(instance.method1()).toBe("method1");
		});

		it("maintains the prototype chain", function() {
			var SuperSuperClass = function() {};
			
			var SuperClass = function() {};
			Spritz.extend(SuperClass, SuperSuperClass);

			var SubClass = function() {};
			Spritz.extend(SubClass, SuperClass);

			var test = new SubClass();
			
			expect(test instanceof SubClass).toBe(true);
			expect(test instanceof SuperClass).toBe(true);
			expect(test instanceof SuperSuperClass).toBe(true);
			expect(test instanceof String).toBe(false);
		});
		
		it("can call superclass constructor", function() {
			var SuperClass = function SuperClass() {
				this.test1 = "super";
				this.test2 = "super";
			};
			
			SuperClass.prototype.test1 = "none";
			SuperClass.prototype.test2 = "none";
			
			var SubClass = function SubClass() {
				this.$super();
				this.test1 = "sub";
			};
			
			Spritz.extend(SubClass, SuperClass);
			
			var instance = new SubClass();
			
			expect(instance.test1).toBe("sub");
			expect(instance.test2).toBe("super");
		});
		
		it("can override a method", function() {
			var SuperClass = function() {};
			
			SuperClass.prototype.test = function() {
				return 'super';
			};

			var SubClass = function() {};
			Spritz.extend(SubClass, SuperClass);
			
			SubClass.prototype.test = function() {
				return 'sub';
			};

			var test = new SubClass();

			expect(test.test()).toBe('sub');
		});
		
		it("can access superclass methods", function() {
			var SuperClass = function() {};
			
			SuperClass.prototype.test = function() {
				return 'super';
			};

			var SubClass = function() {
				this.$super();
			};
			
			SubClass.prototype.test = function() {
				return this.$super.test();
			};
			
			Spritz.extend(SubClass, SuperClass);

			var test = new SubClass();

			expect(test.test()).toBe('super');
		});
		
		it("maintains existing protoype properties", function() {
			var SuperClass = function() {};
			
			var SubClass = function() {};

			SubClass.prototype.method = function() {
				return "sub";
			};
			
			Spritz.extend(SubClass, SuperClass);
			
			var instance = new SubClass();
			
			expect(instance.method()).toBe("sub");
		});
		
		it("overrides existing protoype properties", function() {
			var SuperClass = function() {};
			
			SuperClass.prototype.method = function() {
				return "super";
			};
			
			var SubClass = function() {};

			SubClass.prototype.method = function() {
				return "sub";
			};
			
			Spritz.extend(SubClass, SuperClass);
			
			var instance = new SubClass();
			
			expect(instance.method()).toBe("sub");
		});

		it("allows superclass to access subclass properties", function() {
			var SuperClass = function() {};
			
			SuperClass.prototype.method = function() {
				this.test = "super";
			};
			
			var SubClass = function() {
				this.test = "sub";
			};

			SubClass.prototype.method = function() {
				this.$super.method.call(this);
				return this.test;
			};
			SubClass.prototype.test = null;
			
			Spritz.extend(SubClass, SuperClass);
			
			var instance = new SubClass();
			
			expect(instance.method()).toBe("super");
		});
	});
	
	describe("Traits", function() {
		it("can add a trait with a method to a class", function() {
			var called = false;
			
			var TestClass = function() {};
			
			var Trait = function() {};
			
			Trait.prototype.prop = false;
			Trait.prototype.method = function() {
				called = true;
			};
			
			Spritz.spritz(TestClass, Trait);
			
			var test = new TestClass();
			
			test.method();
			
			expect(called).toBe(true);
		});
		
		it("can add a trait with state to a class", function() {
			var TestClass = function() {};
			
			var Trait = function() {};
			
			Trait.prototype.prop = false;
			Trait.prototype.method = function() {
					this.prop = true;
			};
			
			Spritz.spritz(TestClass, Trait);
			
			var test = new TestClass();
			
			test.method();
			
			expect(test.prop).toBe(true);
		});
		
		it('allows access to target property from trait method', function() {
			var TestClass = function() {};
			TestClass.prototype.test = 'test';
			
			var Trait = function() {};
			
			Trait.prototype.prop = false;
			Trait.prototype.method = function() {
					return this.test;
			};
			
			Spritz.spritz(TestClass, Trait);
			
			var test = new TestClass();
			
			expect(test.method()).toBe('test');
		});
		
		it('allows access to trait property from target method', function() {
			var TestClass = function() {};
			TestClass.prototype.method = function() {
					return this.test;
			};
			
			var Trait = function() {};
			
			Trait.prototype.prop = false;
			Trait.prototype.test = 'test';
			
			Spritz.spritz(TestClass, Trait);
			
			var test = new TestClass();
			
			expect(test.method()).toBe('test');
		});
	});
	
	describe("Talents", function() {
		it('can add a talent with a method to an instance', function() {
			var TestClass = function() {};
			
			var TestTalent = function() {};
			TestTalent.prototype.method = function() {
				return "test";
			};
			
			var test = new TestClass();
			
			Spritz.spritz(test, TestTalent);
			
			expect(test.method()).toBe("test");
		});
		
		it('can override class method with a talent', function() {
			var TestClass = function() {};
			TestClass.prototype.method = function() {
				return "class";
			}
			
			var TestTalent = function() {};
			TestTalent.prototype.method = function() {
				return "talent";
			};
			
			var test = new TestClass();
			
			Spritz.spritz(test, TestTalent);
			
			expect(test.method()).toBe("talent");			
		});
		
		it('can override trait method with a talent', function() {
			var TestClass = function() {};
			
			var TestTrait = function() {};
			TestTrait.prototype.method = function() {
				return "trait";
			}
			
			Spritz.spritz(TestClass, TestTrait);
			
			var TestTalent = function() {};
			TestTalent.prototype.method = function() {
				return "talent";
			};
			
			var test = new TestClass();
			
			expect(test.method()).toBe("trait");			

			Spritz.spritz(test, TestTalent);
			
			expect(test.method()).toBe("talent");			
		});

		
	});
	
	describe("isa() method", function() {	
		it('works for a given class', function() {
			var TestClass = function() {};
			
			var test = new TestClass();
			
			expect(Spritz.isa(test, TestClass)).toBe(true);
			expect(Spritz.isa(test, String)).toBe(false);
		});
		
		it('works for a super class', function() {
			var SuperClass = function() {};
			
			var SubClass = function() {};
			Spritz.extend(SubClass, SuperClass);

			var test = new SubClass();
			
			expect(Spritz.isa(test, SuperClass)).toBe(true);
			expect(Spritz.isa(test, String)).toBe(false);
		});
		
		it('works for a trait in the given class', function() {
			var TestClass = function() {};
			var Trait = function() {};
			
			Spritz.spritz(TestClass, Trait);

			var test = new TestClass();
			
			expect(Spritz.isa(test, Trait)).toBe(true);
			expect(Spritz.isa(test, String)).toBe(false);
		});
		
		it('works for a trait in the given super class', function() {
			var SuperClass = function() {};
			var Trait = function() {};
			
			Spritz.spritz(SuperClass, Trait);
			
			var SubClass = function() {};
			Spritz.extend(SubClass, SuperClass);

			var test = new SubClass();
			
			expect(Spritz.isa(test, Trait)).toBe(true);
			expect(Spritz.isa(test, String)).toBe(false);
		});
		
		it('works for a trait on a trait', function() {
			var SuperTrait = function() {};
			var Trait = function() {};
			
			Spritz.spritz(Trait, SuperTrait);
			
			var SubClass = function() {};
			Spritz.spritz(SubClass, Trait);

			var test = new SubClass();
			
			expect(Spritz.isa(test, SuperTrait)).toBe(true);
			expect(Spritz.isa(test, String)).toBe(false);
		});
		
		it('works for a superclass on a trait', function() {
			var SuperClass = function() {};
			var Trait = function() {};
			
			Spritz.extend(Trait, SuperClass);
			
			var SubClass = function() {};
			Spritz.spritz(SubClass, Trait);

			var test = new SubClass();
			
			expect(Spritz.isa(test, SuperClass)).toBe(true);
			expect(Spritz.isa(test, String)).toBe(false);
		});
		
		it('works for multiple traits', function() {
			var Trait1 = function() {};
			var Trait2 = function() {};
			
			var SubClass = function() {};
			Spritz.spritz(SubClass, Trait1);
			Spritz.spritz(SubClass, Trait2);

			var test = new SubClass();
			
			expect(Spritz.isa(test, Trait1)).toBe(true);
			expect(Spritz.isa(test, Trait2)).toBe(true);
			expect(Spritz.isa(test, String)).toBe(false);
		});
		
		it('works for a trait in the given instance', function() {
			var TestClass = function() {};
			var Talent = function() {};
			
			var test = new TestClass();
			
			Spritz.spritz(test, Talent);

			expect(Spritz.isa(test, Talent)).toBe(true);
			expect(Spritz.isa(test, String)).toBe(false);
		});
	});
});