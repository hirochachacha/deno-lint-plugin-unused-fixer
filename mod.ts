/**
 * Deno Lint Plugin - Unused Code Fixer
 *
 * This plugin provides lint rules to detect and fix unused imports and variables.
 *
 * @module
 */

export { default } from "./src/plugin.ts";

// Re-export the plugin for convenience
import plugin from "./src/plugin.ts";

export const rules = plugin.rules;
export const name = plugin.name;
