// This file demonstrates that function parameters should NOT be reported as unused
// Even if a parameter isn't used, it might be required for the function signature

function testFunction(unusedParam: string, usedParam: number): number {
  // Only usedParam is actually used
  return usedParam * 2;
}

// Arrow function example


// Expected: No lint errors for unused function parameters
// Function parameters are exempt from the unused vars rule
