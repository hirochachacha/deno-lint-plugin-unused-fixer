// This file demonstrates object property shorthand usage
// Variables used in object shorthand should NOT be reported as unused

const name = "John";
const age = 30;

// Using object property shorthand
const person = { name, age }; // Both name and age are used here

console.log(person);

// Expected: No lint errors - variables used in shorthand are considered used
