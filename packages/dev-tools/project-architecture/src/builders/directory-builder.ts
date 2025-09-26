/**
 * 🦊 Directory Builder
 * ===================
 *
 * Builder functions for creating directory definitions in the Reynard project architecture.
 * Provides reusable patterns and utilities for constructing directory definitions.
 *
 * This module re-exports all directory builder functions from specialized modules
 * to maintain the 140-line axiom while providing comprehensive functionality.
 */

// Re-export core directory builders
export {
  createDirectoryDefinition,
  createCorePackage,
  createAIPackage,
  createUIPackage,
} from "./directory-builders-core.js";

// Re-export extended directory builders
export {
  createServicePackage,
  createDataPackage,
  createMediaPackage,
  createDevToolsPackage,
  createDocsPackage,
  createBackendPackage,
  createFrontendPackage,
  createInfrastructurePackage,
} from "./directory-builders-extended.js";
