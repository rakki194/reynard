/**
 * 🦊 Core Auth Package Definitions
 * ================================
 *
 * Core authentication package directory definitions for the Reynard project architecture.
 * Contains auth-related core packages.
 */

import type { DirectoryDefinition } from "../types.js";
import { createCorePackage } from "../builders/directory-builder.js";
import { buildRelationships, COMMON_RELATIONSHIPS } from "../builders/relationship-builder.js";
import { CORE_METADATA } from "../config/metadata.js";

/**
 * Core auth packages directory definitions
 */
export const CORE_AUTH_PACKAGES: DirectoryDefinition[] = [
  createCorePackage(
    "packages/core/auth-core",
    "packages/core/auth-core",
    "Core authentication logic and utilities - provides framework-agnostic authentication functionality including token management, authentication client, and auth orchestrator",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.VALIDATION_DEPENDENCY,
        COMMON_RELATIONSHIPS.HTTP_CLIENT_DEPENDENCY
      ),
      metadata: CORE_METADATA,
    }
  ),

  createCorePackage(
    "packages/core/auth-composables",
    "packages/core/auth-composables",
    "SolidJS authentication composables and components - provides reactive authentication state management, UI components, and SolidJS-specific authentication functionality",
    {
      fileTypes: ["typescript", "javascript", "json", "markdown"],
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/core/auth-core", type: "dependency", description: "Uses auth core functionality" },
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY
      ),
      metadata: CORE_METADATA,
    }
  ),
];
