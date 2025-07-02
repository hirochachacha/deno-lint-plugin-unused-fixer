const plugin: Deno.lint.Plugin = {
  name: "unused-fixer",
  rules: {
    "no-unused-imports": {
      create(context) {
        // deno-lint-ignore no-explicit-any
        const importedIdentifiers = new Map<string, any>();
        const usedIdentifiers = new Set<string>();

        return {
          ImportDeclaration(node) {
            node.specifiers?.forEach((spec) => {
              if (spec.type === "ImportDefaultSpecifier") {
                importedIdentifiers.set(spec.local.name, { node, spec });
              } else if (spec.type === "ImportSpecifier") {
                importedIdentifiers.set(spec.local.name, { node, spec });
              } else if (spec.type === "ImportNamespaceSpecifier") {
                importedIdentifiers.set(spec.local.name, { node, spec });
              }
            });
          },

          Identifier(node) {
            if (
              node.parent?.type !== "ImportSpecifier" &&
              node.parent?.type !== "ImportDefaultSpecifier" &&
              node.parent?.type !== "ImportNamespaceSpecifier" &&
              node.parent?.type !== "ExportSpecifier"
            ) {
              usedIdentifiers.add(node.name);
            }
          },

          JSXIdentifier(node) {
            usedIdentifiers.add(node.name);
          },

          "Program:exit"() {
            // deno-lint-ignore no-explicit-any
            const importGroups = new Map<any, any[]>();

            for (const [name, info] of importedIdentifiers) {
              if (!usedIdentifiers.has(name)) {
                if (!importGroups.has(info.node)) {
                  importGroups.set(info.node, []);
                }
                importGroups.get(info.node)!.push(info.spec);
              }
            }

            for (const [importNode, unusedSpecs] of importGroups) {
              if (importNode.specifiers?.length === unusedSpecs.length) {
                context.report({
                  node: importNode,
                  message: "Unused import",
                  fix(fixer) {
                    return fixer.remove(importNode);
                  },
                });
              } else {
                unusedSpecs.forEach((spec) => {
                  context.report({
                    node: spec,
                    message: `Unused import '${spec.local.name}'`,
                    fix(fixer) {
                      const specifiers = importNode.specifiers;
                      const index = specifiers.indexOf(spec);
                      const isLast = index === specifiers.length - 1;
                      const isFirst = index === 0;

                      if (specifiers.length === 1) {
                        return fixer.remove(importNode);
                      }

                      let rangeStart = spec.range[0];
                      let rangeEnd = spec.range[1];

                      if (isLast && !isFirst) {
                        const prevSpec = specifiers[index - 1];
                        rangeStart = prevSpec.range[1];
                      } else if (!isLast) {
                        rangeEnd = specifiers[index + 1].range[0];
                      }

                      return fixer.removeRange([rangeStart, rangeEnd]);
                    },
                  });
                });
              }
            }
          },
        };
      },
    },

    "no-unused-vars": {
      create(context) {
        // deno-lint-ignore no-explicit-any
        const declaredVars = new Map<string, any>();
        const usedVars = new Set<string>();
        const functionParams = new Set<string>();

        return {
          VariableDeclarator(node) {
            if (node.id.type === "Identifier") {
              declaredVars.set(node.id.name, node);
            } else if (node.id.type === "ObjectPattern") {
              node.id.properties.forEach((prop) => {
                if (
                  prop.type === "Property" && prop.value.type === "Identifier"
                ) {
                  declaredVars.set(prop.value.name, node);
                }
              });
            } else if (node.id.type === "ArrayPattern") {
              node.id.elements.forEach((elem) => {
                if (elem?.type === "Identifier") {
                  declaredVars.set(elem.name, node);
                }
              });
            }
          },

          FunctionDeclaration(node) {
            node.params.forEach((param) => {
              if (param.type === "Identifier") {
                functionParams.add(param.name);
              }
            });
          },

          FunctionExpression(node) {
            node.params.forEach((param) => {
              if (param.type === "Identifier") {
                functionParams.add(param.name);
              }
            });
          },

          ArrowFunctionExpression(node) {
            node.params.forEach((param) => {
              if (param.type === "Identifier") {
                functionParams.add(param.name);
              }
            });
          },

          Identifier(node) {
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
                  fix(fixer) {
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
    },
  },
};

export default plugin;
