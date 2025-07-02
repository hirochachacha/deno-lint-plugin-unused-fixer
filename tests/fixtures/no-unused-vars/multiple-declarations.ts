// This file demonstrates multiple variable declarations on one line
// The linter should be able to remove just the unused ones

const used1 = 1, used2 = 3; // 'unused' is never used

console.log(used1);
console.log(used2);

// Expected:
// - Linter reports "Unused variable 'unused'"
// - Fix removes only 'unused = 2' while preserving the other declarations
