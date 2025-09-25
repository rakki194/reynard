/**
 * 🦊 Architecture Helper Functions
 * Helper functions for integrating with the Reynard project architecture
 */

import {
  getTestableDirectories,
  getGlobalExcludePatterns,
  queryDirectories,
  type DirectoryDefinition as ArchitectureDirectoryDefinition,
} from "reynard-project-architecture";
import type { DirectoryDefinition } from "./types.js";

/**
 * Get testable directories using architecture.ts
 * This replaces the hardcoded directory scanning with proper architecture integration
 */
export function getArchitectureTestableDirectories(): string[] {
  return getTestableDirectories();
}

/**
 * Get directory definitions from architecture.ts
 * This provides rich metadata including test configurations
 */
export function getArchitectureDirectoryDefinitions(): ArchitectureDirectoryDefinition[] {
  return queryDirectories({
    testable: true,
    includeOptional: false,
    includeGenerated: false,
    includeThirdParty: false,
  }).directories;
}

/**
 * Convert architecture directory definition to our internal format
 */
export function convertArchitectureDirectory(archDir: ArchitectureDirectoryDefinition): DirectoryDefinition {
  return {
    name: archDir.name,
    path: archDir.path,
    category: archDir.category,
    importance: archDir.importance,
    testable: archDir.testable,
    includePatterns: archDir.includePatterns,
    excludePatterns: archDir.excludePatterns,
    fileTypes: archDir.fileTypes,
    description: archDir.description,
    watchable: archDir.watchable,
    buildable: archDir.buildable,
    lintable: archDir.lintable,
    documentable: archDir.documentable,
    relationships: archDir.relationships,
    optional: archDir.optional,
    generated: archDir.generated,
    thirdParty: archDir.thirdParty,
  };
}

/**
 * Get global exclude patterns from architecture.ts
 */
export function getArchitectureGlobalExcludePatterns(): string[] {
  return getGlobalExcludePatterns();
}
