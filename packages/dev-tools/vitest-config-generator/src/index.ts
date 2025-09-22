/**
 * 🦊 Vitest Configuration Generator - Main Export
 * Main entry point for the Vitest configuration generator
 */

export { VitestConfigGenerator } from "./vitestConfigGenerator.js";
export { ProjectConfigGenerator } from "./projectConfigGenerator.js";
export { ConfigWriter } from "./configWriter.js";
// VitestConfigLogger removed - now using ReynardLogger from catalyst

export type {
  VitestProjectConfig,
  VitestGlobalConfig,
  GeneratorConfig,
  GeneratorResult,
  ProjectConfigOptions,
} from "./types.js";

// Re-export for convenience
export { VitestConfigGenerator as default } from "./vitestConfigGenerator.js";
