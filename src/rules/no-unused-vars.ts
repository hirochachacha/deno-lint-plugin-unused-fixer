export const noUnusedVars = {
  create(context: any) {
    // deno-lint-ignore no-explicit-any
    const declaredVars = new Map<string, any>();
    const usedVars = new Set<string>();
    const functionParams = new Set<string>();

    return {
      VariableDeclarator(node: any) {
        if (node.id.type === "Identifier") {
          declaredVars.set(node.id.name, node);
        } else if (node.id.type === "ObjectPattern") {
          node.id.properties.forEach((prop: any) => {
            if (
              prop.type === "Property" && prop.value.type === "Identifier"
            ) {
              declaredVars.set(prop.value.name, node);
            }
          });
        } else if (node.id.type === "ArrayPattern") {
          node.id.elements.forEach((elem: any) => {
            if (elem?.type === "Identifier") {
              declaredVars.set(elem.name, node);
            }
          });
        }
      },

      FunctionDeclaration(node: any) {
        node.params.forEach((param: any) => {
          if (param.type === "Identifier") {
            functionParams.add(param.name);
          }
        });
      },

      FunctionExpression(node: any) {
        node.params.forEach((param: any) => {
          if (param.type === "Identifier") {
            functionParams.add(param.name);
          }
        });
      },

      ArrowFunctionExpression(node: any) {
        node.params.forEach((param: any) => {
          if (param.type === "Identifier") {
            functionParams.add(param.name);
          }
        });
      },

      Identifier(node: any) {
        const parent = node.parent;
        if (
          parent?.type !== "VariableDeclarator" ||
          (parent.type === "VariableDeclarator" && parent.id !== node)
        ) {
          if (
            parent?.type !== "Property" || parent.shorthand ||
            parent.value === node
          ) {
            usedVars.add(node.name);
          }
        }
      },

      "Program:exit"() {
        for (const [varName, declarator] of declaredVars) {
          if (!usedVars.has(varName) && !functionParams.has(varName)) {
            const parent = declarator.parent;

            context.report({
              node: declarator,
              message: `Unused variable '${varName}'`,
              fix(fixer: any) {
                if (
                  parent.type === "VariableDeclaration" &&
                  parent.declarations.length === 1
                ) {
                  return fixer.remove(parent);
                } else if (parent.type === "VariableDeclaration") {
                  const index = parent.declarations.indexOf(declarator);
                  const isLast = index === parent.declarations.length - 1;
                  const isFirst = index === 0;

                  let rangeStart = declarator.range[0];
                  let rangeEnd = declarator.range[1];

                  if (isLast && !isFirst) {
                    const prevDecl = parent.declarations[index - 1];
                    rangeStart = prevDecl.range[1];
                  } else if (!isLast) {
                    rangeEnd = parent.declarations[index + 1].range[0];
                  }

                  return fixer.removeRange([rangeStart, rangeEnd]);
                }
                return undefined;
              },
            });
          }
        }
      },
    };
  },
};
