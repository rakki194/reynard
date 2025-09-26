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
export function createDependency(directory: string, description: string): DirectoryRelationship {
  return {
    directory,
    type: "dependency",
    description,
  };
}

/**
 * Create a sibling relationship
 */
export function createSibling(directory: string, description: string): DirectoryRelationship {
  return {
    directory,
    type: "sibling",
    description,
  };
}

/**
 * Create a parent relationship
 */
export function createParent(directory: string, description: string): DirectoryRelationship {
  return {
    directory,
    type: "parent",
    description,
  };
}

/**
 * Create a child relationship
 */
export function createChild(directory: string, description: string): DirectoryRelationship {
  return {
    directory,
    type: "child",
    description,
  };
}

/**
 * Create a tests relationship
 */
export function createTests(directory: string, description: string): DirectoryRelationship {
  return {
    directory,
    type: "tests",
    description,
  };
}

/**
 * Create a documents relationship
 */
export function createDocuments(directory: string, description: string): DirectoryRelationship {
  return {
    directory,
    type: "documents",
    description,
  };
}

/**
 * Create a configures relationship
 */
export function createConfigures(directory: string, description: string): DirectoryRelationship {
  return {
    directory,
    type: "configures",
    description,
  };
}

/**
 * Create a generated relationship
 */
export function createGenerated(directory: string, description: string): DirectoryRelationship {
  return {
    directory,
    type: "generated",
    description,
  };
}

// Re-export patterns and helpers from separate files
export { COMMON_RELATIONSHIPS } from "./relationship-patterns.js";
export {
  addCoreDependencies,
  addUIDependencies,
  addAIDependencies,
  addComprehensiveUIDependencies,
  addComprehensiveAIDependencies,
  addServiceDependencies,
  addDataDependencies,
  addMediaDependencies,
} from "./relationship-helpers.js";

/**
 * Build relationship array from common patterns
 */
export function buildRelationships(...patterns: DirectoryRelationship[]): DirectoryRelationship[] {
  return patterns;
}
