# Spritz
## API
### Inheritance
Spritz has an `extend` function which implements a basic single inheritance model.

The prototype chain is maintained so that `instanceof` works as expected.

```js
		var Animal = function(type) {
			this.type = type;
		};
		Animal.prototype.type = null;

		Animal.prototype.greet = function() {
			return "Hi, I'm a " + this.type + " called " + this.name;
		};

		// We need to explicitly call the super constructor using a handy $super property.
		var Person = function(name) {
			this.$super("human");
			this.name = name;
		};
		Person.prototype.name = null;

		Spritz.extend(Person, Animal);

		var steve = new Person("Steve");

		expect(steve.greet()).toBe("Hi, I'm a human called Steve");
		expect(steve instanceof Person).toBe(true);
		expect(steve instanceof Animal).toBe(true);

		// We also provide an isa() function which acts like instanceof
		expect(Spritz.isa(steve, Animal)).toBe(true);
```

#### Gotchas

###### Super constructor not explicitly called
When extending a class, the super class constructor will not be implicitly called when the sub class is instantiated. Therefor you should call the `$super()` constructor from within the subclass constructor; for example:

```js
var Animal = function() {
	// Set up animaly stuff
};

var Mammal = function() {
	this.$super();	// Call the Animal() constructor
	// Set up mammalian stuff like live babies and stuff.
};

Spritz.extend(Mammal, Animal);
```

##### Scope fudging when calling a super class method
When you call a super class method using `this.$super.method()` then the scope gets lost somewhere along the way, which means that `this` within the super method is not the corrent object. There are two ways around this:

1. Ensure you always call `this.$super()` from within the constructor. This has access to the real object and will cache it for later within the $super object. You can then just call `this.$super.method()` to call the super class method.
2. Pass in othe correct scope when you call the method by using `this.$super.method.call(this, arg1, arg2 ... )`. 

### Traits
Classes can be extended with multiple traits, which are a bit like interfaces in Java but can also contain method implementations and properties.

```js
		var Animal = function() { };

		var Mammal = function() { };
		Spritz.extend(Mammal, Animal);

		var Amphibian = function() { };
		Spritz.extend(Amphibian, Animal);

		var Bird = function() { };
		Spritz.extend(Bird, Animal);

		var Egg = function() { };

		// We create a LaysEggs trait, which can be a class or a plain old object
		var LaysEggs = function() { };
		LaysEggs.prototype.layEgg = function() {
			return new Egg();
		};

		// And we can apply the trait to specific classes
		Spritz.spritz(Amphibian, LaysEggs);
		Spritz.spritz(Bird, LaysEggs);

		// Then we can use isa() to work out if an object has a specific trait
		var cat = new Mammal();
		expect(Spritz.isa(cat, LaysEggs)).toBe(false);

		var frog = new Amphibian();
		expect(Spritz.isa(frog, LaysEggs)).toBe(true);

		var parrot = new Bird();
		expect(Spritz.isa(parrot, LaysEggs)).toBe(true);

		// Traits are also inherited through class extension
		var Emu = function() { };
		Spritz.extend(Emu, Bird);

		var emu = new Emu();
		expect(Spritz.isa(emu, LaysEggs)).toBe(true);
		
		// or from other traits
		var Monotreme = function() { };
		Spritz.spritz(Monotreme, LaysEggs);
		
		var Platypus = function() { };
		Spritz.extend(Platypus, Mammal); // A platypus is a mammal
		Spritz.spritz(Platypus, Monotreme); // But also a monotreme
		
		var ducky = new Platypus();
		expect(Spritz.isa(ducky, LaysEggs)).toBe(true);
```