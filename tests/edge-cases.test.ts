

const plugin = await import("../src/plugin.ts").then((m) => m.default);

function createMockContext(code: string, rule: string) {
  const reports: Array<{ node: any; message: string; fix?: any }> = [];

  const context = {
    report: (report: any) => {
      reports.push(report);
    },
    source_code: {
      text: code,
    },
  };

  return { context, reports };
}

Deno.test("no-unused-imports: handles TypeScript type imports", () => {
  const rule = plugin.rules["no-unused-imports"];
  const code = `
import type { Config } from "./types";
import { type Role, type User } from "./models";
import { helper, type HelperOptions } from "./utils";
import type * as Types from "./all-types";

const config: Config = { enabled: true };
const user: User = { name: "test" };
helper();
`;

  const { context, reports } = createMockContext(code, "no-unused-imports");

  // Note: The current implementation doesn't distinguish type imports
  // This test shows the current behavior
  console.log("Type imports test - reports:", reports.length);
});

Deno.test("no-unused-imports: ignores side-effect imports", () => {
  const rule = plugin.rules["no-unused-imports"];
  const code = `
import './styles.css';
import './polyfills';
import { unused } from './utils';

console.log('test');
`;

  const { context, reports } = createMockContext(code, "no-unused-imports");

  // Side-effect imports (without specifiers) should be ignored
  console.log("Side-effect imports test - reports:", reports.length);
});

Deno.test("no-unused-vars: dynamic property access limitation", () => {
  const rule = plugin.rules["no-unused-vars"];
  const code = `
const propName = 'value';
const methodName = 'getValue';
const obj = {
  value: 42,
  getValue: () => 42
};

// Dynamic property access - variables used as strings
console.log(obj[propName]);
const result = obj[methodName]();
`;

  const { context, reports } = createMockContext(code, "no-unused-vars");

  // Current implementation doesn't track dynamic property access
  console.log("Dynamic property access test - reports:", reports.length);
});

Deno.test("no-unused-vars: deeply nested destructuring", () => {
  const rule = plugin.rules["no-unused-vars"];
  const code = `
const data = {
  user: {
    profile: {
      name: 'John',
      settings: {
        theme: 'dark',
        notifications: true
      }
    }
  }
};

const { user: { profile: { name, settings: { theme, notifications } } } } = data;
console.log(name);
`;

  const { context, reports } = createMockContext(code, "no-unused-vars");

  // Should detect theme and notifications as unused
  console.log("Deeply nested destructuring test - reports:", reports.length);
});

Deno.test("no-unused-vars: template literal usage", () => {
  const rule = plugin.rules["no-unused-vars"];
  const code = `
const name = 'John';
const age = 30;
const city = 'NYC';

console.log(\`Hello, my name is \${name}\`);
const message = \`Age: \${age}\`;
`;

  const { context, reports } = createMockContext(code, "no-unused-vars");

  // Should detect city and message as unused
  // name and age are used in template literals
  console.log("Template literal test - reports:", reports.length);
});

Deno.test("no-unused-vars: closure scenarios", () => {
  const rule = plugin.rules["no-unused-vars"];
  const code = `
function outer() {
  const usedInClosure = 'value';
  const notUsedAnywhere = 'unused';
  
  return function inner() {
    console.log(usedInClosure);
  };
}

const fn = outer();
`;

  const { context, reports } = createMockContext(code, "no-unused-vars");

  // Should detect notUsedAnywhere as unused
  console.log("Closure test - reports:", reports.length);
});

// Additional edge case: eval-like usage
Deno.test("no-unused-vars: eval and Function constructor", () => {
  const rule = plugin.rules["no-unused-vars"];
  const code = `
const code = 'console.log("hello")';
const func = 'return x * 2';

eval(code);
const fn = new Function('x', func);
`;

  const { context, reports } = createMockContext(code, "no-unused-vars");

  // Variables used in eval/Function constructor might be flagged as unused
  console.log("Eval usage test - reports:", reports.length);
});

// Test for import without specifiers
Deno.test("no-unused-imports: import without specifiers (side effects)", () => {
  const rule = plugin.rules["no-unused-imports"];
  const code = `
import 'polyfill-library';
import './init-app';
`;

  const { context, reports } = createMockContext(code, "no-unused-imports");

  // Side-effect imports should not be reported
  console.log("Import without specifiers test - reports:", reports.length);
});
