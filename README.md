# Deno Lint Plugin - Unused Code Fixer

A Deno lint plugin that detects and automatically fixes unused imports and
variables in your TypeScript/JavaScript code.

## Features

- **no-unused-imports**: Detects and removes unused imports
  - Default imports: `import React from 'react'`
  - Named imports: `import { useState, useEffect } from 'react'`
  - Namespace imports: `import * as utils from './utils'`

- **no-unused-vars**: Detects and removes unused variables
  - Simple variables: `const unused = 42`
  - Object destructuring: `const { unused, used } = obj`
  - Array destructuring: `const [unused, used] = array`
  - Multiple declarations: `const a = 1, unused = 2, b = 3`

## Project Structure

```
.
├── src/
│   └── plugin.ts                  # Main plugin implementation
├── tests/
│   ├── fixtures/                  # Test fixtures showing what rules detect
│   │   ├── no-unused-imports/    # Import test cases
│   │   └── no-unused-vars/       # Variable test cases
│   ├── no-unused-imports.test.ts # Tests for import rule
│   └── no-unused-vars.test.ts    # Tests for variable rule
├── examples/
│   └── test-unused.ts            # Example file with unused code
├── docs/
│   └── how-it-works/             # Detailed documentation
│       ├── fixer-examples.md     # Before/after examples
│       └── fixer-flow.md         # Step-by-step explanation
├── mod.ts                        # Main entry point
├── deno.json                     # Deno configuration
└── README.md                     # This file
```

## Installation

1. Clone this repository
2. Configure your `deno.json` to include the plugin:

```json
{
  "lint": {
    "plugins": ["./path/to/src/plugin.ts"],
    "rules": {
      "include": [
        "unused-fixer/no-unused-imports",
        "unused-fixer/no-unused-vars"
      ]
    }
  }
}
```

## Usage

Run the linter on your code:

```bash
# Lint a specific file
deno lint your-file.ts

# Lint all files in a directory
deno lint src/

# Auto-fix issues (when Deno supports it)
deno lint --fix
```

## Development

### Running Tests

```bash
# Run all tests
deno task test

# Run tests with type checking
deno test --allow-read

# Run specific test file
deno test tests/no-unused-imports.test.ts --allow-read --no-check
```

### Understanding the Code

- **src/plugin.ts**: Contains the lint rule implementations
- **tests/**: Unit tests that verify the rules work correctly
- **tests/fixtures/**: Real TypeScript files demonstrating what the rules detect
- **docs/how-it-works/**: Detailed documentation about how the fixers work

## How It Works

The plugin uses Deno's lint API to:

1. Parse your code into an Abstract Syntax Tree (AST)
2. Track all imports and variable declarations
3. Track all usages of identifiers
4. Report unused items with automatic fix functions
5. The fixes remove only the unused parts, preserving valid code

## Examples

### Unused Import Removal

Before:

```typescript
import { useEffect, useState } from "react";
const [count] = useState(0);
```

After:

```typescript
import { useState } from "react";
const [count] = useState(0);
```

### Unused Variable Removal

Before:

```typescript
const unused = 42;
const used = 10;
console.log(used);
```

After:

```typescript
const used = 10;
console.log(used);
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for your changes
4. Ensure all tests pass
5. Submit a pull request

## License

MIT
