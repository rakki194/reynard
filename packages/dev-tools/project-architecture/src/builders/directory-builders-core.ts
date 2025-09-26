/**
 * 🦊 Core Directory Builders
 * ==========================
 *
 * Core directory builder functions for creating directory definitions in the Reynard project architecture.
 * Provides reusable patterns and utilities for constructing core package directory definitions.
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
    categories: [category], // Initialize with primary category
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
    "core",
    "critical",
    ["typescript", "javascript", "json", "markdown"],
    description,
    {
      categories: ["core", "source", "tools"],
      relationships: [
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
    "ai",
    "important",
    ["typescript", "javascript", "json", "markdown"],
    description,
    {
      categories: ["ai", "source", "tools"],
      relationships: [
        { directory: "packages/ai/ai-shared", type: "dependency", description: "Uses AI shared utilities" },
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
        { directory: "packages/core/connection", type: "dependency", description: "Uses connection utilities" },
        { directory: "packages/core/validation", type: "dependency", description: "Uses validation utilities" },
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
    "ui",
    "important",
    ["typescript", "javascript", "json", "markdown", "css"],
    description,
    {
      categories: ["ui", "source", "frontend"],
      relationships: [
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
        { directory: "packages/ui/primitives", type: "dependency", description: "Uses primitive UI components" },
        { directory: "packages/ui/themes", type: "dependency", description: "Uses themes" },
        { directory: "packages/ui/fluent-icons", type: "dependency", description: "Uses fluent icons" },
      ],
      ...options,
    }
  );
}
