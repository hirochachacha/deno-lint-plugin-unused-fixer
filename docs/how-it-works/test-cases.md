



// Test data structure
interface TestCase {
  name: string;
  rule: string;
  before: string;
  after: string;
}

const testCases: TestCase[] = [
  // no-unused-imports test cases
  {
    name: "removes entire unused default import",
    rule: "no-unused-imports",
    before: `import React from 'react';
const x = 1;`,
    after: `const x = 1;`,
  },
  {
    name: "removes only unused named import",
    rule: "no-unused-imports",
    before: `import { useState, useEffect } from 'react';
const [state] = useState();`,
    after: `import { useState } from 'react';
const [state] = useState();`,
  },
  {
    name: "removes entire unused namespace import",
    rule: "no-unused-imports",
    before: `import * as utils from './utils';
const x = 1;`,
    after: `const x = 1;`,
  },
  {
    name: "keeps all used imports",
    rule: "no-unused-imports",
    before: `import React from 'react';
import { useState } from 'react';
const elem = React.createElement('div');
const [state] = useState();`,
    after: `import React from 'react';
import { useState } from 'react';
const elem = React.createElement('div');
const [state] = useState();`,
  },
  {
    name: "removes multiple unused named imports",
    rule: "no-unused-imports",
    before: `import { useState, useEffect, useCallback, useMemo } from 'react';
const [state] = useState();`,
    after: `import { useState } from 'react';
const [state] = useState();`,
  },

  // no-unused-vars test cases
  {
    name: "removes simple unused variable",
    rule: "no-unused-vars",
    before: `const unusedVar = 42;
const usedVar = 10;
console.log(usedVar);`,
    after: `const usedVar = 10;
console.log(usedVar);`,
  },
  {
    name: "removes unused destructured variables (object)",
    rule: "no-unused-vars",
    before: `const { unused1, used, unused2 } = obj;
console.log(used);`,
    after: `const { used } = obj;
console.log(used);`,
  },
  {
    name: "removes unused destructured variables (array)",
    rule: "no-unused-vars",
    before: `const [unused1, used, unused2] = array;
console.log(used);`,
    after: `const [, used] = array;
console.log(used);`,
  },
  {
    name: "removes one variable from multiple declarations",
    rule: "no-unused-vars",
    before: `const used1 = 1, unused = 2, used2 = 3;
console.log(used1, used2);`,
    after: `const used1 = 1, used2 = 3;
console.log(used1, used2);`,
  },
  {
    name: "keeps function parameters (they are exempt)",
    rule: "no-unused-vars",
    before: `function test(unused: string, used: number) {
  return used * 2;
}`,
    after: `function test(unused: string, used: number) {
  return used * 2;
}`,
  },
  {
    name: "keeps variables used in object shorthand",
    rule: "no-unused-vars",
    before: `const name = 'test';
const age = 30;
const obj = { name, age };`,
    after: `const name = 'test';
const age = 30;
const obj = { name, age };`,
  },
];

// Helper function to apply fixes from a rule
function applyFixes(code: string, rule: any): string {
  // This is a simplified version - in reality, you'd need to:
  // 1. Parse the code into an AST
  // 2. Run the rule's visitor on the AST
  // 3. Collect all the fixes
  // 4. Apply the fixes to the code

  // For demonstration, we'll just show the expected structure
  console.log(`Would apply fixes from rule to transform the code`);
  return code; // In real implementation, this would return the fixed code
}

// Run the tests
console.log("Fixer Test Cases");
console.log("================\n");

for (const testCase of testCases) {
  console.log(`📝 Test: ${testCase.name}`);
  console.log(`   Rule: ${testCase.rule}`);
  console.log("\n   Before:");
  console.log(
    testCase.before.split("\n").map((line) => `     ${line}`).join("\n"),
  );
  console.log("\n   Expected After:");
  console.log(
    testCase.after.split("\n").map((line) => `     ${line}`).join("\n"),
  );
  console.log("\n" + "─".repeat(60) + "\n");
}

// Show how a real test would work
console.log("\n🧪 Example of how a real test would work:");
console.log("─".repeat(60));
console.log(`
// 1. Parse the 'before' code into an AST
const ast = parseTypeScript(testCase.before);

// 2. Run the lint rule
const errors = [];
const visitor = rule.create({
  report: (error) => errors.push(error)
});

// 3. Walk the AST with the visitor
walkAST(ast, visitor);

// 4. Apply all the fixes
let fixedCode = testCase.before;
for (const error of errors) {
  if (error.fix) {
    fixedCode = applyFix(fixedCode, error.fix);
  }
}

// 5. Compare with expected result
assertEquals(fixedCode, testCase.after);
`);
