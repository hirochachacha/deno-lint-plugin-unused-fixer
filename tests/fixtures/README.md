# Test Fixtures

This directory contains human-readable examples that demonstrate what the lint
rules detect and fix.

## no-unused-imports

Tests for detecting and removing unused imports:

- **unused-default-import.ts** - Default import that's never used
- **unused-named-import.ts** - Named imports where some are unused
- **unused-namespace-import.ts** - Namespace import (`import * as`) that's never
  used
- **used-imports.ts** - Properly used imports (no errors expected)
- **jsx-identifiers.tsx** - JSX component usage detection

## no-unused-vars

Tests for detecting and removing unused variables:

- **simple-unused-var.ts** - Basic unused variable declaration
- **destructured-object.ts** - Unused variables from object destructuring
- **destructured-array.ts** - Unused variables from array destructuring
- **function-parameters.ts** - Function parameters (should NOT be reported)
- **object-shorthand.ts** - Variables used in object shorthand syntax
- **multiple-declarations.ts** - Multiple vars declared on one line
- **array-holes.ts** - Array destructuring with skipped elements

## Running the Linter on These Files

To see the linter in action on these fixtures:

```bash
# Run the linter on a specific file
deno lint test-fixtures/no-unused-imports/unused-default-import.ts

# Run the linter on all fixtures
deno lint test-fixtures/
```

## Understanding the Tests

Each fixture file contains:

1. Comments explaining the scenario
2. Code that demonstrates the issue
3. Expected behavior comments at the bottom

The actual test files (`no-unused-imports.test.ts` and `no-unused-vars.test.ts`)
programmatically verify these scenarios by:

- Creating mock AST nodes that represent the code structure
- Running the lint rules against these nodes
- Verifying the expected errors and fixes are generated
