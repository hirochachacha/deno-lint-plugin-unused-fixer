import { assertEquals } from "@std/assert";

const plugin = await import("../src/plugin.ts").then((m) => m.default);
const rule = plugin.rules["no-unused-imports"];

// deno-lint-ignore no-unused-vars
function createMockContext(code: string): {
  // deno-lint-ignore no-explicit-any
  context: any;
  // deno-lint-ignore no-explicit-any
  reports: Array<{ node: any; message: string; fix?: any }>;
} {
  // deno-lint-ignore no-explicit-any
  const reports: Array<{ node: any; message: string; fix?: any }> = [];

  const context = {
    // deno-lint-ignore no-explicit-any
    report: (report: any) => {
      reports.push(report);
    },
  };

  return { context, reports };
}

Deno.test("no-unused-imports: detects unused default import", () => {
  const code = `import React from 'react';\nconst x = 1;`;
  const { context, reports } = createMockContext(code);

  const visitor = rule.create(context);

  // Simulate AST traversal
  visitor.ImportDeclaration({
    type: "ImportDeclaration",
    specifiers: [{
      type: "ImportDefaultSpecifier",
      local: { name: "React" },
    }],
    range: [0, 26],
  });

  if (visitor["Program:exit"]) visitor["Program:exit"]();

  assertEquals(reports.length, 1);
  assertEquals(reports[0].message, "Unused import");
});

Deno.test("no-unused-imports: detects unused named import", () => {
  const code =
    `import { useState, useEffect } from 'react';\nconst x = useState();`;
  const { context, reports } = createMockContext(code);

  const visitor = rule.create(context);

  const importNode = {
    type: "ImportDeclaration",
    specifiers: [
      {
        type: "ImportSpecifier",
        local: { name: "useState" },
        range: [9, 17],
      },
      {
        type: "ImportSpecifier",
        local: { name: "useEffect" },
        range: [19, 28],
      },
    ],
    range: [0, 44],
  };

  visitor.ImportDeclaration(importNode);

  // Mark useState as used
  visitor.Identifier({ name: "useState", parent: { type: "CallExpression" } });

  if (visitor["Program:exit"]) visitor["Program:exit"]();

  assertEquals(reports.length, 1);
  assertEquals(reports[0].message, "Unused import 'useEffect'");
});

Deno.test("no-unused-imports: detects unused namespace import", () => {
  const code = `import * as utils from './utils';\nconst x = 1;`;
  const { context, reports } = createMockContext(code);

  const visitor = rule.create(context);

  visitor.ImportDeclaration({
    type: "ImportDeclaration",
    specifiers: [{
      type: "ImportNamespaceSpecifier",
      local: { name: "utils" },
    }],
    range: [0, 33],
  });

  if (visitor["Program:exit"]) visitor["Program:exit"]();

  assertEquals(reports.length, 1);
  assertEquals(reports[0].message, "Unused import");
});

Deno.test("no-unused-imports: does not report used imports", () => {
  const code =
    `import React from 'react';\nimport { useState } from 'react';\nconst x = React.createElement('div');\nconst [state] = useState();`;
  const { context, reports } = createMockContext(code);

  const visitor = rule.create(context);

  visitor.ImportDeclaration({
    type: "ImportDeclaration",
    specifiers: [{
      type: "ImportDefaultSpecifier",
      local: { name: "React" },
    }],
  });

  visitor.ImportDeclaration({
    type: "ImportDeclaration",
    specifiers: [{
      type: "ImportSpecifier",
      local: { name: "useState" },
    }],
  });

  // Mark as used
  visitor.Identifier({ name: "React", parent: { type: "MemberExpression" } });
  visitor.Identifier({ name: "useState", parent: { type: "CallExpression" } });

  if (visitor["Program:exit"]) visitor["Program:exit"]();

  assertEquals(reports.length, 0);
});

Deno.test("no-unused-imports: handles JSX identifiers", () => {
  const code =
    `import React from 'react';\nimport Button from './Button';\nconst x = <Button />;`;
  const { context, reports } = createMockContext(code);

  const visitor = rule.create(context);

  visitor.ImportDeclaration({
    type: "ImportDeclaration",
    specifiers: [{
      type: "ImportDefaultSpecifier",
      local: { name: "React" },
    }],
  });

  visitor.ImportDeclaration({
    type: "ImportDeclaration",
    specifiers: [{
      type: "ImportDefaultSpecifier",
      local: { name: "Button" },
    }],
  });

  // JSX usage
  visitor.JSXIdentifier({ name: "Button" });

  if (visitor["Program:exit"]) visitor["Program:exit"]();

  // React is unused, Button is used in JSX
  assertEquals(reports.length, 1);
  assertEquals(reports[0].message, "Unused import");
});

Deno.test("no-unused-imports: provides fix for removing entire import", () => {
  const code = `import React from 'react';\nconst x = 1;`;
  const { context, reports } = createMockContext(code);

  const visitor = rule.create(context);

  const importNode = {
    type: "ImportDeclaration",
    specifiers: [{
      type: "ImportDefaultSpecifier",
      local: { name: "React" },
    }],
    range: [0, 26],
  };

  visitor.ImportDeclaration(importNode);
  if (visitor["Program:exit"]) visitor["Program:exit"]();

  assertEquals(reports.length, 1);
  assertEquals(typeof reports[0].fix, "function");

  // Test the fix function
  const mockFixer = {
    // deno-lint-ignore no-explicit-any
    remove: (node: any) => ({ type: "remove", node }),
    removeRange: (range: [number, number]) => ({ type: "removeRange", range }),
  };

  const fixResult = reports[0].fix(mockFixer);
  assertEquals(fixResult.type, "remove");
  assertEquals(fixResult.node, importNode);
});

Deno.test("no-unused-imports: provides fix for removing specific named import", () => {
  const code = `import { useState, useEffect, useCallback } from 'react';`;
  const { context, reports } = createMockContext(code);

  const visitor = rule.create(context);

  const specifiers = [
    {
      type: "ImportSpecifier",
      local: { name: "useState" },
      range: [9, 17],
    },
    {
      type: "ImportSpecifier",
      local: { name: "useEffect" },
      range: [19, 28],
    },
    {
      type: "ImportSpecifier",
      local: { name: "useCallback" },
      range: [30, 41],
    },
  ];

  const importNode = {
    type: "ImportDeclaration",
    specifiers,
    range: [0, 57],
  };

  visitor.ImportDeclaration(importNode);

  // Only useState is used
  visitor.Identifier({ name: "useState", parent: { type: "CallExpression" } });

  if (visitor["Program:exit"]) visitor["Program:exit"]();

  // Should report 2 unused imports
  assertEquals(reports.length, 2);

  // Test that both unused imports have fix functions
  assertEquals(typeof reports[0].fix, "function");
  assertEquals(typeof reports[1].fix, "function");

  // Test fix returns removeRange
  const mockFixer = {
    // deno-lint-ignore no-explicit-any
    remove: (node: any) => ({ type: "remove", node }),
    removeRange: (range: [number, number]) => ({ type: "removeRange", range }),
  };

  const fixResult = reports[0].fix(mockFixer);
  assertEquals(fixResult.type, "removeRange");
  // Verify it's a valid range
  assertEquals(Array.isArray(fixResult.range), true);
  assertEquals(fixResult.range.length, 2);
});
