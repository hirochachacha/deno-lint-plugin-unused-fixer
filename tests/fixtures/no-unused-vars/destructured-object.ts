// This file demonstrates unused destructured object variables

const obj = {
  prop1: "value1",
  prop2: "value2",
  prop3: "value3",
};

// Destructure three properties, but only use one
const { prop1, prop2, prop3 } = obj;

console.log(prop2); // Only prop2 is used

// Expected:
// - Linter reports "Unused variable 'prop1'"
// - Linter reports "Unused variable 'prop3'"
