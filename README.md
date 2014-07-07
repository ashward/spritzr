# Spritzr
## Build Status
[![Build Status](https://travis-ci.org/ashward/spritzr.svg?branch=master)](https://travis-ci.org/ashward/spritzr)
## API
### Inheritance
Spritzr has an `extend` function which implements a basic single inheritance model.

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

		Spritzr.extend(Person, Animal);

		var steve = new Person("Steve");

		expect(steve.greet()).toBe("Hi, I'm a human called Steve");
		expect(steve instanceof Person).toBe(true);
		expect(steve instanceof Animal).toBe(true);

		// We also provide an isa() function which acts like instanceof
		expect(Spritzr.isa(steve, Animal)).toBe(true);
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

Spritzr.extend(Mammal, Animal);
```

##### Scope fudging when calling a super class method
When you call a super class method using `this.$super.method()` then the scope gets lost somewhere along the way, which means that `this` within the super method is not pointing to the correct object. There are two ways around this:

1. Ensure you always call `this.$super()` from within the constructor. This has access to the real object and will cache it for later within the $super object. You can then just call `this.$super.method()` to call the super class method.
2. Pass in othe correct scope when you call the method by using `this.$super.method.call(this, arg1, arg2 ... )`. 

### Traits
Classes can be extended with multiple traits, which are a bit like interfaces in Java but can also contain method implementations and properties.

```js
		var Animal = function() { };

		var Mammal = function() { };
		Spritzr.extend(Mammal, Animal); // Mammal is an extension of Animal

		var Amphibian = function() { };
		Spritzr.extend(Amphibian, Animal); // Amphibian is an extension of Animal

		var Bird = function() { };
		Spritzr.extend(Bird, Animal); // Bird is an extension of Animal

		// We create a LaysEggs trait, which can be a class or a plain old object
		var LaysEggs = function() { };
		LaysEggs.prototype.layEgg = function() {
			return new Egg();
		};

		// And we can apply the trait to specific classes
		Spritzr.spritz(Amphibian, LaysEggs); // All Amphibians can now lay eggs
		Spritzr.spritz(Bird, LaysEggs); // All Birds can now lay eggs

		// Then we can use isa() to work out if an object has a specific trait
		var cat = new Mammal();
		expect(Spritzr.isa(cat, LaysEggs)).toBe(false);

		var frog = new Amphibian();
		expect(Spritzr.isa(frog, LaysEggs)).toBe(true);

		var parrot = new Bird();
		expect(Spritzr.isa(parrot, LaysEggs)).toBe(true);

		// Traits are also inherited through class extension
		var Emu = function() { };
		Spritzr.extend(Emu, Bird); // Emu extends Bird

		var emu = new Emu();
		expect(Spritzr.isa(emu, LaysEggs)).toBe(true);
		
		// or from other traits
		var Monotreme = function() { };
		Spritzr.spritz(Monotreme, LaysEggs);
		
		var Platypus = function() { };
		Spritzr.extend(Platypus, Mammal); // A platypus is a mammal
		Spritzr.spritz(Platypus, Monotreme); // But also a monotreme
		
		var ducky = new Platypus();
		expect(Spritzr.isa(ducky, LaysEggs)).toBe(true);
```
