// This file demonstrates array destructuring with holes (skipped elements)
// The linter should only report actual variable names, not the holes

const array = [1, 2, 3, 4];

// Using commas to skip elements we don't need
const [, second, , fourth] = array;

// Neither second nor fourth are used
console.log("done");

// Expected:
// - Linter reports "Unused variable 'second'"
// - Linter reports "Unused variable 'fourth'"
// - No errors for the holes (empty slots)
