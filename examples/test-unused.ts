import { assertEquals } from "@std/assert";




const usedVariable = 10;
const { destructured1, destructured2 } = { destructured1: 1, destructured2: 2 };
const [arrayItem1, arrayItem2] = [1, 2];

export function testFunction(unusedParam: string, usedParam: number): number {
  
  console.log(usedVariable);
  console.log(destructured1);
  return usedParam * 2;
}

console.log(assertEquals);
