// This file demonstrates unused array destructured variables

const array = [1, 2, 3];

// Destructure three elements, but only use the middle one
const [first, second, third] = array;

console.log(second); // Only second is used

// Expected:
// - Linter reports "Unused variable 'first'"
// - Linter reports "Unused variable 'third'"
