/**
 * Reynard Annotating WDv3
 *
 * Configuration package for the WDv3 generator.
 * This package provides configuration schemas and metadata for the WDv3 generator
 * that runs on the FastAPI backend.
 */

export * from "./config/wdv3-config.js";

// Re-export types from core
export type { CaptionGeneratorConfig } from "reynard-annotating-core";
