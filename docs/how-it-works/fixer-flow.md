# How Fixer Tests Work

This document explains the complete flow from code → AST → lint → fix → result.

## Example: Removing an Unused Import

### 1️⃣ Original Code

```typescript
import { useEffect, useState } from "react";
const [count, setCount] = useState(0);
```

### 2️⃣ AST Representation (simplified)

```javascript
{
  type: "ImportDeclaration",
  specifiers: [
    {
      type: "ImportSpecifier",
      local: { name: "useState" },
      range: [9, 17]  // Characters 9-17: "useState"
    },
    {
      type: "ImportSpecifier", 
      local: { name: "useEffect" },
      range: [19, 28]  // Characters 19-28: "useEffect"
    }
  ],
  range: [0, 44]  // The entire import statement
}
```

### 3️⃣ Linter Analysis

- ✓ `useState` is used (found in `useState()` call)
- ✗ `useEffect` is NOT used anywhere

### 4️⃣ Fixer Function Called

The linter reports:

```javascript
{
  node: /* useEffect specifier */,
  message: "Unused import 'useEffect'",
  fix(fixer) {
    // Since useState comes first, we need to remove
    // from the comma after useState to the end of useEffect
    return fixer.removeRange([17, 28]);
    //                        ↑    ↑
    //                        |    └─ End of "useEffect"
    //                        └─ End of "useState"
  }
}
```

### 5️⃣ Result After Fix

```typescript
import { useState } from "react";
const [count, setCount] = useState(0);
```

### 6️⃣ How Tests Verify This

```javascript
// The test creates a mock fixer:
const mockFixer = {
  removeRange: (range) => ({ type: "removeRange", range }),
};

// Calls the fix function:
const fixResult = error.fix(mockFixer);

// Verifies the correct range was targeted:
assertEquals(fixResult.range[0], 17); // After "useState"
assertEquals(fixResult.range[1], 28); // After "useEffect"

// The actual Deno linter would then:
// 1. Take the original code
// 2. Remove characters 17-28
// 3. Produce the fixed code
```

## Key Points

- Tests work with AST nodes and character positions
- Fixers use `removeRange()` or `remove()` to delete code
- Tests verify the correct ranges are targeted
- The actual code transformation happens in the linter
