// Tests the code from the examples to make sure they're correct!
var Spritzr = require("../src/Spritzr.js");

describe("Spritzr README.md", function() {
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

Spritzr.extend(Person, Animal);

var steve = new Person("Steve");

expect(steve.greet()).toBe("Hi, I'm a person called Steve");
expect(steve instanceof Person).toBe(true);
expect(steve instanceof Animal).toBe(true);

// Spritzr also provides an isa() function which acts like instanceof
expect(Spritzr.isa(steve, Animal)).toBe(true);

// We can also override methods and properties of the super class
// but still access them using $super
var Tony = function Tony() {
	this.$super("Tony");
};
Spritzr.extend(Tony, Person);

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

	});
	
	it('Talents', function() {
		
// We have a class describing people
var Person = function(firstName, lastName) {
	this.firstName = firstName;
	this.lastName = lastName;
};
Person.prototype.firstName = null;
Person.prototype.lastName = null;
Person.prototype.getDisplayName = function() {
	return this.firstName + ' ' + this.lastName;
};

var sharon = new Person("Sharon", "Ackerman");
var tony = new Person("Tony", "Jones");

// We can define a talent to describe friendship
var Friend = function(nickname) {
	this.nickname = nickname;
};
Friend.prototype.nickname = null;
Friend.prototype.getDisplayName = function() {
	return this.firstName + ' "' + this.nickname + '" ' + this.lastName;
};

// And add a new talent to our friends
Spritzr.spritz(sharon, new Friend('The Shazza'));

// We can then check for existence of the talent to find out if a person is our friend
expect(Spritzr.isa(sharon, Friend)).toBe(true);
expect(Spritzr.isa(tony, Friend)).toBe(false);

// And the methods should be overridden appropriately
expect(sharon.getDisplayName()).toBe('Sharon "The Shazza" Ackerman');
expect(tony.getDisplayName()).toBe('Tony Jones');

// We can also remove talents from an instance using the amazing titled unspritz function
Spritzr.unspritz(sharon, Friend);
expect(sharon.getDisplayName()).toBe('Sharon Ackerman');

// We don't need to instantiate the talent first either - the constructor will automatically be called
var HasAccount = function() {
	this.username = (this.firstName.substr(0,1) + this.lastName).toLowerCase();
};
HasAccount.prototype.username = null;

Spritzr.spritz(tony, HasAccount); // This adds the methods/properties and calls the constructor

expect(Spritzr.isa(tony, HasAccount)).toBe(true);
expect(tony.username).toBe("tjones");

	});
});