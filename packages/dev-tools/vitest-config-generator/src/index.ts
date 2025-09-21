/**
 * 🦊 Vitest Configuration Generator - Main Export
 * Main entry point for the Vitest configuration generator
 */

export { VitestConfigGenerator } from "./vitestConfigGenerator.js";
export { ProjectConfigGenerator } from "./projectConfigGenerator.js";
export { ConfigWriter } from "./configWriter.js";
export { VitestConfigLogger } from "./logger.js";

export type {
  VitestProjectConfig,
  VitestGlobalConfig,
  GeneratorConfig,
  GeneratorResult,
  ProjectConfigOptions,
} from "./types.js";

// Re-export for convenience
export { VitestConfigGenerator as default } from "./vitestConfigGenerator.js";
