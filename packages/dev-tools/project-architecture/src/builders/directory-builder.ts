/**
 * 🦊 Directory Builder
 * ===================
 *
 * Builder functions for creating directory definitions in the Reynard project architecture.
 * Provides reusable patterns and utilities for constructing directory definitions.
 */

import type { DirectoryDefinition, DirectoryCategory, ImportanceLevel, FileType } from "../types.js";
import { PACKAGE_EXCLUDE_PATTERNS, PACKAGE_INCLUDE_PATTERNS } from "../config/patterns.js";
import { DEFAULT_PACKAGE_BUILD, DEFAULT_PACKAGE_TEST, DEFAULT_PACKAGE_LINT } from "../config/defaults.js";

/**
 * Base directory definition builder
 */
export function createDirectoryDefinition(
  name: string,
  path: string,
  category: DirectoryCategory,
  importance: ImportanceLevel,
  fileTypes: FileType[],
  description: string,
  options: Partial<DirectoryDefinition> = {}
): DirectoryDefinition {
  return {
    name,
    path,
    category,
    importance,
    fileTypes,
    description,
    watchable: true,
    buildable: true,
    testable: true,
    lintable: true,
    documentable: true,
    relationships: [],
    excludePatterns: [...PACKAGE_EXCLUDE_PATTERNS],
    includePatterns: [...PACKAGE_INCLUDE_PATTERNS],
    optional: false,
    generated: false,
    thirdParty: false,
    buildConfig: DEFAULT_PACKAGE_BUILD,
    testConfig: DEFAULT_PACKAGE_TEST,
    lintConfig: DEFAULT_PACKAGE_LINT,
    ...options,
  };
}

/**
 * Create a core package directory definition
 */
export function createCorePackage(
  name: string,
  path: string,
  description: string,
  options: Partial<DirectoryDefinition> = {}
): DirectoryDefinition {
  return createDirectoryDefinition(
    name,
    path,
    "source",
    "critical",
    ["typescript", "javascript", "json", "markdown"],
    description,
    {
      relationships: [
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
        { directory: "packages/core/validation", type: "dependency", description: "Uses validation utilities" },
      ],
      ...options,
    }
  );
}

/**
 * Create an AI package directory definition
 */
export function createAIPackage(
  name: string,
  path: string,
  description: string,
  options: Partial<DirectoryDefinition> = {}
): DirectoryDefinition {
  return createDirectoryDefinition(
    name,
    path,
    "source",
    "important",
    ["typescript", "javascript", "json", "markdown"],
    description,
    {
      relationships: [
        { directory: "packages/ai/ai-shared", type: "dependency", description: "Uses AI shared utilities" },
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
      ],
      ...options,
    }
  );
}

/**
 * Create a UI package directory definition
 */
export function createUIPackage(
  name: string,
  path: string,
  description: string,
  options: Partial<DirectoryDefinition> = {}
): DirectoryDefinition {
  return createDirectoryDefinition(
    name,
    path,
    "source",
    "important",
    ["typescript", "javascript", "json", "markdown", "css"],
    description,
    {
      relationships: [
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
        { directory: "packages/ui/components-core", type: "dependency", description: "Uses UI components" },
      ],
      ...options,
    }
  );
}

/**
 * Create a service package directory definition
 */
export function createServicePackage(
  name: string,
  path: string,
  description: string,
  options: Partial<DirectoryDefinition> = {}
): DirectoryDefinition {
  return createDirectoryDefinition(
    name,
    path,
    "source",
    "important",
    ["typescript", "javascript", "json", "markdown"],
    description,
    {
      relationships: [
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
        { directory: "packages/services/api-client", type: "dependency", description: "Uses API client" },
      ],
      ...options,
    }
  );
}

/**
 * Create a data package directory definition
 */
export function createDataPackage(
  name: string,
  path: string,
  description: string,
  options: Partial<DirectoryDefinition> = {}
): DirectoryDefinition {
  return createDirectoryDefinition(
    name,
    path,
    "source",
    "important",
    ["typescript", "javascript", "json", "markdown"],
    description,
    {
      relationships: [
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
        { directory: "packages/data/repository-core", type: "dependency", description: "Uses repository system" },
      ],
      ...options,
    }
  );
}

/**
 * Create a media package directory definition
 */
export function createMediaPackage(
  name: string,
  path: string,
  description: string,
  options: Partial<DirectoryDefinition> = {}
): DirectoryDefinition {
  return createDirectoryDefinition(
    name,
    path,
    "source",
    "important",
    ["typescript", "javascript", "json", "markdown"],
    description,
    {
      relationships: [
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
        { directory: "packages/ui/components-core", type: "dependency", description: "Uses UI components" },
      ],
      ...options,
    }
  );
}

/**
 * Create a dev tools package directory definition
 */
export function createDevToolsPackage(
  name: string,
  path: string,
  description: string,
  options: Partial<DirectoryDefinition> = {}
): DirectoryDefinition {
  return createDirectoryDefinition(
    name,
    path,
    "tools",
    "important",
    ["typescript", "javascript", "json", "markdown"],
    description,
    {
      relationships: [
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
        { directory: "scripts", type: "sibling", description: "Related automation scripts" },
      ],
      ...options,
    }
  );
}

/**
 * Create a documentation package directory definition
 */
export function createDocsPackage(
  name: string,
  path: string,
  description: string,
  options: Partial<DirectoryDefinition> = {}
): DirectoryDefinition {
  return createDirectoryDefinition(
    name,
    path,
    "documentation",
    "important",
    ["typescript", "javascript", "json", "markdown"],
    description,
    {
      relationships: [
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
        { directory: "packages/ui/ui", type: "dependency", description: "Uses UI components" },
        { directory: "docs", type: "documents", description: "Generates documentation" },
      ],
      ...options,
    }
  );
}
