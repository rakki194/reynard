/**
 * 🦊 Relationship Helpers
 * =======================
 *
 * Helper functions for building relationship arrays from common patterns.
 * Provides convenient functions for adding different types of dependencies.
 */

import type { DirectoryRelationship } from "../types.js";
import { COMMON_RELATIONSHIPS } from "./relationship-patterns.js";

/**
 * Add core dependencies to relationships
 */
export function addCoreDependencies(relationships: DirectoryRelationship[]): DirectoryRelationship[] {
  return [COMMON_RELATIONSHIPS.CORE_DEPENDENCY, COMMON_RELATIONSHIPS.VALIDATION_DEPENDENCY, ...relationships];
}

/**
 * Add UI dependencies to relationships
 */
export function addUIDependencies(relationships: DirectoryRelationship[]): DirectoryRelationship[] {
  return [COMMON_RELATIONSHIPS.CORE_DEPENDENCY, COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY, ...relationships];
}

/**
 * Add AI dependencies to relationships
 */
export function addAIDependencies(relationships: DirectoryRelationship[]): DirectoryRelationship[] {
  return [COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY, COMMON_RELATIONSHIPS.CORE_DEPENDENCY, ...relationships];
}

/**
 * Add comprehensive UI dependencies to relationships
 */
export function addComprehensiveUIDependencies(relationships: DirectoryRelationship[]): DirectoryRelationship[] {
  return [
    COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
    COMMON_RELATIONSHIPS.PRIMITIVES_DEPENDENCY,
    COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY,
    COMMON_RELATIONSHIPS.THEMES_DEPENDENCY,
    COMMON_RELATIONSHIPS.COLORS_DEPENDENCY,
    COMMON_RELATIONSHIPS.FLUENT_ICONS_DEPENDENCY,
    ...relationships,
  ];
}

/**
 * Add comprehensive AI dependencies to relationships
 */
export function addComprehensiveAIDependencies(relationships: DirectoryRelationship[]): DirectoryRelationship[] {
  return [
    COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
    COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
    COMMON_RELATIONSHIPS.CONNECTION_DEPENDENCY,
    COMMON_RELATIONSHIPS.VALIDATION_DEPENDENCY,
    ...relationships,
  ];
}

/**
 * Add service dependencies to relationships
 */
export function addServiceDependencies(relationships: DirectoryRelationship[]): DirectoryRelationship[] {
  return [
    COMMON_RELATIONSHIPS.API_CLIENT_DEPENDENCY,
    COMMON_RELATIONSHIPS.HTTP_CLIENT_DEPENDENCY,
    COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
    ...relationships,
  ];
}

/**
 * Add data dependencies to relationships
 */
export function addDataDependencies(relationships: DirectoryRelationship[]): DirectoryRelationship[] {
  return [COMMON_RELATIONSHIPS.REPOSITORY_CORE_DEPENDENCY, COMMON_RELATIONSHIPS.CORE_DEPENDENCY, ...relationships];
}

/**
 * Add media dependencies to relationships
 */
export function addMediaDependencies(relationships: DirectoryRelationship[]): DirectoryRelationship[] {
  return [COMMON_RELATIONSHIPS.IMAGE_DEPENDENCY, COMMON_RELATIONSHIPS.CORE_DEPENDENCY, ...relationships];
}
