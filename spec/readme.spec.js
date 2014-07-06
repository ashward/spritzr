// Tests the code from the examples to make sure they're correct!
var Spritz = require("../src/Spritz.js");

describe("Spritz README.md", function() {
	it("Inheritance", function() {
		function Animal(type) {
			this.type = type;
		};
		Animal.prototype.type = null;

		Animal.prototype.greet = function() {
			return "Hi, I'm a " + this.type + " called " + this.name;
		};

		// We need to explicitly call the super constructor using a handy $super property.
		function Person(name) {
			this.$super("person");
			this.name = name;
		};
		Person.prototype.name = null;

		Spritz.extend(Person, Animal);

		var steve = new Person("Steve");

		expect(steve.greet()).toBe("Hi, I'm a person called Steve");
		expect(steve instanceof Person).toBe(true);
		expect(steve instanceof Animal).toBe(true);

		// Spritz also provides an isa() function which acts like instanceof
		expect(Spritz.isa(steve, Animal)).toBe(true);
		
		// We can also override methods and properties of the super class
		// but still access them using $super
		var Tony = function Tony() {
			this.$super("Tony");
		};
		Spritz.extend(Tony, Person);
		
		Tony.prototype.greet = function() {
			var normalGreeting = this.$super.greet();
			
			return normalGreeting + ", y'all!";
		};
		
		var tony = new Tony();
		expect(tony.greet()).toBe("Hi, I'm a person called Tony, y'all!");
	});
	
	it("Traits", function() {
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
	});
});