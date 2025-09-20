/**
 * @fileoverview Barrel exports for docs generator config
 */

// Re-export all types explicitly
export type { DocTheme, DocNavigation, DocFooter, DocSearchConfig, DocAnalytics, DocSocial } from "./types/site";
export type { GeneratorConfig } from "./types/core";
export type { PackageConfig, TemplateConfig, ExampleConfig, ExampleInfo, PackageInfo } from "./types/package";
export type { ApiParameter, ApiReturn, ApiInfo } from "./types/api";

// Re-export utilities
export { loadConfig, validateConfig, mergeConfig } from "./utils";
export { defaultGeneratorConfig } from "./defaults";
