import { noUnusedImports } from "./rules/no-unused-imports.ts";
import { noUnusedVars } from "./rules/no-unused-vars.ts";

const plugin: Deno.lint.Plugin = {
  name: "unused-fixer",
  rules: {
    "no-unused-imports": noUnusedImports,
    "no-unused-vars": noUnusedVars,
  },
};

export default plugin;
