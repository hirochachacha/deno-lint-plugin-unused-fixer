import { assertEquals } from "@std/assert";

const plugin = await import("../src/plugin.ts").then((m) => m.default);
const rule = plugin.rules["no-unused-vars"];

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

Deno.test("no-unused-vars: detects unused simple variable", () => {
  const code =
    `const unusedVar = 42;\nconst usedVar = 10;\nconsole.log(usedVar);`;
  const { context, reports } = createMockContext(code);

  const visitor = rule.create(context);

  // Simulate variable declaration
  const declarator = {
    type: "VariableDeclarator",
    id: { type: "Identifier", name: "unusedVar" },
    range: [6, 20],
    parent: {
      type: "VariableDeclaration",
      declarations: [{
        type: "VariableDeclarator",
        id: { type: "Identifier", name: "unusedVar" },
        range: [6, 20],
      }],
    },
  };

  visitor.VariableDeclarator(declarator);

  visitor.VariableDeclarator({
    type: "VariableDeclarator",
    id: { type: "Identifier", name: "usedVar" },
    parent: { type: "VariableDeclaration", declarations: [] },
  });

  // Mark usedVar as used
  visitor.Identifier({
    name: "usedVar",
    parent: { type: "CallExpression" },
  });

  if (visitor["Program:exit"]) visitor["Program:exit"]();

  assertEquals(reports.length, 1);
  assertEquals(reports[0].message, "Unused variable 'unusedVar'");
});

Deno.test("no-unused-vars: detects unused destructured object variable", () => {
  const code = `const { unused1, unused2, used } = obj;\nconsole.log(used);`;
  const { context, reports } = createMockContext(code);

  const visitor = rule.create(context);

  const declarator = {
    type: "VariableDeclarator",
    id: {
      type: "ObjectPattern",
      properties: [
        { type: "Property", value: { type: "Identifier", name: "unused1" } },
        { type: "Property", value: { type: "Identifier", name: "unused2" } },
        { type: "Property", value: { type: "Identifier", name: "used" } },
      ],
    },
    parent: { type: "VariableDeclaration", declarations: [] },
  };

  visitor.VariableDeclarator(declarator);

  // Mark 'used' as used
  visitor.Identifier({
    name: "used",
    parent: { type: "CallExpression" },
  });

  if (visitor["Program:exit"]) visitor["Program:exit"]();

  assertEquals(reports.length, 2);
  const messages = reports.map((r) => r.message).sort();
  assertEquals(messages[0], "Unused variable 'unused1'");
  assertEquals(messages[1], "Unused variable 'unused2'");
});

Deno.test("no-unused-vars: detects unused array destructured variable", () => {
  const code = `const [first, second, third] = array;\nconsole.log(second);`;
  const { context, reports } = createMockContext(code);

  const visitor = rule.create(context);

  const declarator = {
    type: "VariableDeclarator",
    id: {
      type: "ArrayPattern",
      elements: [
        { type: "Identifier", name: "first" },
        { type: "Identifier", name: "second" },
        { type: "Identifier", name: "third" },
      ],
    },
    parent: { type: "VariableDeclaration", declarations: [] },
  };

  visitor.VariableDeclarator(declarator);

  // Mark 'second' as used
  visitor.Identifier({
    name: "second",
    parent: { type: "CallExpression" },
  });

  if (visitor["Program:exit"]) visitor["Program:exit"]();

  assertEquals(reports.length, 2);
  const unusedVars = reports.map((r) => r.message).sort();
  assertEquals(unusedVars[0], "Unused variable 'first'");
  assertEquals(unusedVars[1], "Unused variable 'third'");
});

Deno.test("no-unused-vars: ignores function parameters", () => {
  const code = `function test(param1, param2) {\n  console.log(param2);\n}`;
  const { context, reports } = createMockContext(code);

  const visitor = rule.create(context);

  // Function declaration with parameters
  visitor.FunctionDeclaration({
    type: "FunctionDeclaration",
    params: [
      { type: "Identifier", name: "param1" },
      { type: "Identifier", name: "param2" },
    ],
  });

  // Mark param2 as used
  visitor.Identifier({
    name: "param2",
    parent: { type: "CallExpression" },
  });

  if (visitor["Program:exit"]) visitor["Program:exit"]();

  // Function parameters should not be reported as unused
  assertEquals(reports.length, 0);
});

Deno.test("no-unused-vars: handles arrow function parameters", () => {
  const code = `const fn = (a, b, c) => { return b + c; };`;
  const { context, reports } = createMockContext(code);

  const visitor = rule.create(context);

  visitor.ArrowFunctionExpression({
    type: "ArrowFunctionExpression",
    params: [
      { type: "Identifier", name: "a" },
      { type: "Identifier", name: "b" },
      { type: "Identifier", name: "c" },
    ],
  });

  // Mark b and c as used
  visitor.Identifier({ name: "b", parent: { type: "BinaryExpression" } });
  visitor.Identifier({ name: "c", parent: { type: "BinaryExpression" } });

  if (visitor["Program:exit"]) visitor["Program:exit"]();

  // Function parameters should not be reported
  assertEquals(reports.length, 0);
});

Deno.test("no-unused-vars: detects used variable in object shorthand", () => {
  const code = `const name = 'test';\nconst obj = { name };`;
  const { context, reports } = createMockContext(code);

  const visitor = rule.create(context);

  visitor.VariableDeclarator({
    type: "VariableDeclarator",
    id: { type: "Identifier", name: "name" },
    parent: { type: "VariableDeclaration", declarations: [] },
  });

  // Object property shorthand
  visitor.Identifier({
    name: "name",
    parent: { type: "Property", shorthand: true },
  });

  if (visitor["Program:exit"]) visitor["Program:exit"]();

  // Variable used in shorthand should not be reported
  assertEquals(reports.length, 0);
});

Deno.test("no-unused-vars: provides fix for removing entire declaration", () => {
  const code = `const unusedVar = 42;`;
  const { context, reports } = createMockContext(code);

  const visitor = rule.create(context);

  const parent = {
    type: "VariableDeclaration",
    declarations: [{
      type: "VariableDeclarator",
      id: { type: "Identifier", name: "unusedVar" },
      range: [6, 20],
    }],
  };

  const declarator = {
    type: "VariableDeclarator",
    id: { type: "Identifier", name: "unusedVar" },
    range: [6, 20],
    parent,
  };

  visitor.VariableDeclarator(declarator);
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
  assertEquals(fixResult.node, parent);
});

Deno.test("no-unused-vars: provides fix for removing one of multiple declarations", () => {
  const code = `const used = 1, unused = 2, alsoUsed = 3;`;
  const { context, reports } = createMockContext(code);

  const visitor = rule.create(context);

  const declarations = [
    {
      type: "VariableDeclarator",
      id: { type: "Identifier", name: "used" },
      range: [6, 14],
    },
    {
      type: "VariableDeclarator",
      id: { type: "Identifier", name: "unused" },
      range: [16, 26],
    },
    {
      type: "VariableDeclarator",
      id: { type: "Identifier", name: "alsoUsed" },
      range: [28, 41],
    },
  ];

  const parent = {
    type: "VariableDeclaration",
    declarations,
  };

  declarations.forEach((decl) => {
    decl.parent = parent;
    visitor.VariableDeclarator(decl);
  });

  // Mark some as used
  visitor.Identifier({ name: "used", parent: { type: "BinaryExpression" } });
  visitor.Identifier({
    name: "alsoUsed",
    parent: { type: "BinaryExpression" },
  });

  if (visitor["Program:exit"]) visitor["Program:exit"]();

  assertEquals(reports.length, 1);
  assertEquals(reports[0].message, "Unused variable 'unused'");

  // Test the fix
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
  // The range should be reasonable
  assertEquals(fixResult.range[0] < fixResult.range[1], true);
});

Deno.test("no-unused-vars: exported variables should not be flagged", () => {
  const reports: any[] = [];
  const mockContext = {
    report: (report: any) => reports.push(report),
  };

  const visitor = rule.create(mockContext);

  // Test export const
  const exportDecl = {
    type: "ExportNamedDeclaration",
    parent: null,
  };

  const varDecl = {
    type: "VariableDeclaration",
    declarations: [],
    parent: exportDecl,
  };

  const declarator = {
    type: "VariableDeclarator",
    id: { type: "Identifier", name: "exported" },
    parent: varDecl,
  };

  varDecl.declarations = [declarator];

  // Visit the node
  visitor.VariableDeclarator(declarator);

  // Run the exit check
  if (visitor["Program:exit"]) visitor["Program:exit"]();

  // Should not report exported variable as unused
  assertEquals(reports.length, 0);
});

Deno.test("no-unused-vars: destructured exports should not be flagged", () => {
  const reports: any[] = [];
  const mockContext = {
    report: (report: any) => reports.push(report),
  };

  const visitor = rule.create(mockContext);

  // Test export const { a, b } = obj
  const exportDecl = {
    type: "ExportNamedDeclaration",
    parent: null,
  };

  const varDecl = {
    type: "VariableDeclaration",
    declarations: [],
    parent: exportDecl,
  };

  const declarator = {
    type: "VariableDeclarator",
    id: {
      type: "ObjectPattern",
      properties: [
        { type: "Property", value: { type: "Identifier", name: "theme" } },
        { type: "Property", value: { type: "Identifier", name: "lang" } },
      ],
    },
    parent: varDecl,
  };

  varDecl.declarations = [declarator];

  // Visit the node
  visitor.VariableDeclarator(declarator);

  // Run the exit check
  if (visitor["Program:exit"]) visitor["Program:exit"]();

  // Should not report exported destructured variables as unused
  assertEquals(reports.length, 0);
});

Deno.test("no-unused-vars: handles null elements in array pattern", () => {
  const code = `const [, second, , fourth] = array;`;
  const { context, reports } = createMockContext(code);

  const visitor = rule.create(context);

  const declarator = {
    type: "VariableDeclarator",
    id: {
      type: "ArrayPattern",
      elements: [
        null,
        { type: "Identifier", name: "second" },
        null,
        { type: "Identifier", name: "fourth" },
      ],
    },
    parent: { type: "VariableDeclaration", declarations: [] },
  };

  visitor.VariableDeclarator(declarator);

  // Don't use any variables
  if (visitor["Program:exit"]) visitor["Program:exit"]();

  // Should report both non-null elements as unused
  assertEquals(reports.length, 2);
  const messages = reports.map((r) => r.message).sort();
  assertEquals(messages[0], "Unused variable 'fourth'");
  assertEquals(messages[1], "Unused variable 'second'");
});
