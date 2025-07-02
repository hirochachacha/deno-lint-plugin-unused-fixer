# Deno Lint Plugin - Unused Code Fixer

## Project Overview

This is a Deno lint plugin that detects and automatically fixes unused imports
and variables in TypeScript/JavaScript code.

## Key Components

### Rules

- **no-unused-imports**: Detects and removes unused imports (default, named, and
  namespace imports)
- **no-unused-vars**: Detects and removes unused variables (simple vars,
  destructuring, multiple declarations)

### Project Structure

- `src/plugin.ts`: Main plugin entry point
- `src/rules/`: Individual rule implementations
- `tests/`: Unit tests and test fixtures
- `examples/`: Example files demonstrating the rules

## Testing Commands

```bash
# Run all tests
deno task test

# Run tests with type checking
deno test --allow-read

# Run specific test file
deno test tests/no-unused-imports.test.ts --allow-read --no-check
```

## Important Notes

- The plugin is designed to work with Deno's lint API
- Fixes are implemented to remove only unused parts while preserving valid code
- Test fixtures in `tests/fixtures/` demonstrate various edge cases
