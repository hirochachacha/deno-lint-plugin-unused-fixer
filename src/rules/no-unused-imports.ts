export const noUnusedImports = {
  create(context: any) {
    // deno-lint-ignore no-explicit-any
    const importedIdentifiers = new Map<string, any>();
    const usedIdentifiers = new Set<string>();

    return {
      ImportDeclaration(node: any) {
        // Skip side-effect imports (imports without specifiers)
        if (!node.specifiers || node.specifiers.length === 0) {
          return;
        }

        node.specifiers.forEach((spec: any) => {
          if (spec.type === "ImportDefaultSpecifier") {
            importedIdentifiers.set(spec.local.name, { node, spec });
          } else if (spec.type === "ImportSpecifier") {
            importedIdentifiers.set(spec.local.name, { node, spec });
          } else if (spec.type === "ImportNamespaceSpecifier") {
            importedIdentifiers.set(spec.local.name, { node, spec });
          }
        });
      },

      Identifier(node: any) {
        if (
          node.parent?.type !== "ImportSpecifier" &&
          node.parent?.type !== "ImportDefaultSpecifier" &&
          node.parent?.type !== "ImportNamespaceSpecifier" &&
          node.parent?.type !== "ExportSpecifier"
        ) {
          usedIdentifiers.add(node.name);
        }
      },

      JSXIdentifier(node: any) {
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
              fix(fixer: any) {
                return fixer.remove(importNode);
              },
            });
          } else {
            unusedSpecs.forEach((spec: any) => {
              context.report({
                node: spec,
                message: `Unused import '${spec.local.name}'`,
                fix(fixer: any) {
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
};
