/**
 * 🦊 Relationship Builder
 * ======================
 *
 * Builder functions for creating directory relationships in the Reynard project architecture.
 * Provides reusable patterns for defining relationships between directories.
 */

import type { DirectoryRelationship } from "../types.js";

/**
 * Create a dependency relationship
 */
export function createDependency(
  directory: string,
  description: string
): DirectoryRelationship {
  return {
    directory,
    type: "dependency",
    description,
  };
}

/**
 * Create a sibling relationship
 */
export function createSibling(
  directory: string,
  description: string
): DirectoryRelationship {
  return {
    directory,
    type: "sibling",
    description,
  };
}

/**
 * Create a parent relationship
 */
export function createParent(
  directory: string,
  description: string
): DirectoryRelationship {
  return {
    directory,
    type: "parent",
    description,
  };
}

/**
 * Create a child relationship
 */
export function createChild(
  directory: string,
  description: string
): DirectoryRelationship {
  return {
    directory,
    type: "child",
    description,
  };
}

/**
 * Create a tests relationship
 */
export function createTests(
  directory: string,
  description: string
): DirectoryRelationship {
  return {
    directory,
    type: "tests",
    description,
  };
}

/**
 * Create a documents relationship
 */
export function createDocuments(
  directory: string,
  description: string
): DirectoryRelationship {
  return {
    directory,
    type: "documents",
    description,
  };
}

/**
 * Create a configures relationship
 */
export function createConfigures(
  directory: string,
  description: string
): DirectoryRelationship {
  return {
    directory,
    type: "configures",
    description,
  };
}

/**
 * Create a generated relationship
 */
export function createGenerated(
  directory: string,
  description: string
): DirectoryRelationship {
  return {
    directory,
    type: "generated",
    description,
  };
}

/**
 * Common relationship patterns
 */
export const COMMON_RELATIONSHIPS = {
  // Core package relationships
  CORE_DEPENDENCY: createDependency("packages/core/core", "Uses core utilities"),
  VALIDATION_DEPENDENCY: createDependency("packages/core/validation", "Uses validation utilities"),
  HTTP_CLIENT_DEPENDENCY: createDependency("packages/core/http-client", "Uses HTTP client"),
  
  // AI package relationships
  AI_SHARED_DEPENDENCY: createDependency("packages/ai/ai-shared", "Uses AI shared utilities"),
  ANNOTATING_CORE_DEPENDENCY: createDependency("packages/ai/annotating-core", "Uses core annotation system"),
  CAPTION_CORE_DEPENDENCY: createDependency("packages/ai/caption-core", "Uses core caption system"),
  
  // UI package relationships
  UI_COMPONENTS_DEPENDENCY: createDependency("packages/ui/components-core", "Uses UI components"),
  FLUENT_ICONS_DEPENDENCY: createDependency("packages/ui/fluent-icons", "Uses fluent icons"),
  THEMES_DEPENDENCY: createDependency("packages/ui/themes", "Uses themes"),
  COLORS_DEPENDENCY: createDependency("packages/ui/colors", "Uses colors"),
  
  // Service package relationships
  API_CLIENT_DEPENDENCY: createDependency("packages/services/api-client", "Uses API client"),
  AUTH_DEPENDENCY: createDependency("packages/services/auth", "Uses auth service"),
  
  // Data package relationships
  REPOSITORY_CORE_DEPENDENCY: createDependency("packages/data/repository-core", "Uses repository system"),
  FILE_PROCESSING_DEPENDENCY: createDependency("packages/data/file-processing", "Uses file processing"),
  
  // Media package relationships
  IMAGE_DEPENDENCY: createDependency("packages/media/image", "Uses image processing"),
  VIDEO_DEPENDENCY: createDependency("packages/media/video", "Uses video processing"),
  AUDIO_DEPENDENCY: createDependency("packages/media/audio", "Uses audio processing"),
  
  // Dev tools relationships
  SCRIPTS_SIBLING: createSibling("scripts", "Related automation scripts"),
  
  // Documentation relationships
  DOCS_DOCUMENTS: createDocuments("docs", "Generates documentation"),
  
  // Backend relationships
  BACKEND_SIBLING: createSibling("backend", "Related backend services"),
  
  // Examples and templates relationships
  PACKAGES_DEPENDENCY: createDependency("packages", "Uses packages"),
  EXAMPLES_SIBLING: createSibling("examples", "Related examples"),
  TEMPLATES_SIBLING: createSibling("templates", "Related templates"),
  
  // Testing relationships
  PACKAGES_TESTS: createTests("packages", "Tests packages"),
  EXAMPLES_TESTS: createTests("examples", "Tests examples"),
} as const;

/**
 * Build relationship array from common patterns
 */
export function buildRelationships(...patterns: DirectoryRelationship[]): DirectoryRelationship[] {
  return patterns;
}

/**
 * Add core dependencies to relationships
 */
export function addCoreDependencies(relationships: DirectoryRelationship[]): DirectoryRelationship[] {
  return [
    COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
    COMMON_RELATIONSHIPS.VALIDATION_DEPENDENCY,
    ...relationships,
  ];
}

/**
 * Add UI dependencies to relationships
 */
export function addUIDependencies(relationships: DirectoryRelationship[]): DirectoryRelationship[] {
  return [
    COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
    COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY,
    ...relationships,
  ];
}

/**
 * Add AI dependencies to relationships
 */
export function addAIDependencies(relationships: DirectoryRelationship[]): DirectoryRelationship[] {
  return [
    COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
    COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
    ...relationships,
  ];
}
