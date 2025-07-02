// This file demonstrates both lint rules

// 1. Unused imports
 // unused default import
import { useState } from "react"; // some unused
 // unused namespace

// 2. Unused variables

const usedConst = 100;

const { unused1, used1, unused2 } = { unused1: 1, used1: 2, unused2: 3 };
const [unusedItem, usedItem] = [1, 2];

// Using only some imports
const [count, setCount] = useState(0);

// Using only some destructured values
console.log(used1);
console.log(usedItem);
console.log(usedConst);

// Expected fixes:
// 1. Remove unused imports: React, useEffect, useCallback, lodash
// 2. Remove unused variables: unusedConst, unused1, unused2, unusedItem
