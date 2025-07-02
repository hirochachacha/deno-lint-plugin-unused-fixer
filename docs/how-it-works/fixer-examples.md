# Fixer Examples - Before and After

This document shows how the fixers transform code by providing clear
before/after examples.

## no-unused-imports

### Removes entire unused default import

When a default import is unused, the entire import line is removed.

**Before:**

```typescript
import React from "react";
const x = 1;
```

**After:**

```typescript
const x = 1;
```

### Removes specific unused named imports

Only removes the unused imports (useEffect, useCallback), keeps useState.

**Before:**

```typescript
import { useCallback, useEffect, useState } from "react";
const [state] = useState();
```

**After:**

```typescript
import { useState } from "react";
const [state] = useState();
```

### Removes entire import when all named imports unused

When all named imports are unused, removes the entire import statement.

**Before:**

```typescript
import { useCallback, useEffect } from "react";
const x = 1;
```

**After:**

```typescript
const x = 1;
```

## no-unused-vars

### Removes unused simple variable

Removes the entire const declaration for unused variable.

**Before:**

```typescript
const unused = 42;
const used = 10;
console.log(used);
```

**After:**

```typescript
const used = 10;
console.log(used);
```

### Removes unused variable from multiple declarations

Removes only 'unused = 2' from the declaration list.

**Before:**

```typescript
const a = 1, unused = 2, b = 3;
console.log(a, b);
```

**After:**

```typescript
const a = 1, b = 3;
console.log(a, b);
```

### Handles destructured object with mixed usage

Removes only unused properties from object destructuring.

**Before:**

```typescript
const { unused1, used, unused2 } = obj;
console.log(used);
```

**After:**

```typescript
const { used } = obj;
console.log(used);
```

### Handles destructured array with mixed usage

Converts unused array elements to holes (empty slots).

**Before:**

```typescript
const [unused1, used, unused2] = array;
console.log(used);
```

**After:**

```typescript
const [, used] = array;
console.log(used);
```

## How These Are Tested

The test files (`tests/no-unused-imports.test.ts` and
`tests/no-unused-vars.test.ts`) verify these transformations by:

1. Creating mock AST nodes representing the "before" code
2. Running the lint rule to get fix functions
3. Calling the fix functions with a mock fixer
4. Verifying the fixer was called with correct arguments

For example, when removing `unused = 2` from `const a = 1, unused = 2, b = 3;`:

- The fixer.removeRange() should be called with [14, 26]
- Position 14 is after "a = 1"
- Position 26 is before ", b = 3"
- This removes ", unused = 2" from the code

The real Deno linter then applies these fixes to produce the "after" code.
