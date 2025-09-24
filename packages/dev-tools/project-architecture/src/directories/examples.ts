/**
 * 🦊 Example Package Definitions
 * ==============================
 *
 * Example application directory definitions for the Reynard project architecture.
 * Contains example applications demonstrating various features and usage patterns.
 */

import type { DirectoryDefinition } from "../types.js";
import { createDirectoryDefinition } from "../builders/directory-builder.js";
import { buildRelationships, COMMON_RELATIONSHIPS } from "../builders/relationship-builder.js";
import { EXAMPLES_METADATA } from "../config/metadata.js";
import { PACKAGE_EXCLUDE_PATTERNS, PACKAGE_INCLUDE_PATTERNS } from "../config/patterns.js";

/**
 * Example packages directory definitions
 */
export const EXAMPLE_PACKAGES: DirectoryDefinition[] = [
  createDirectoryDefinition(
    "examples",
    "examples",
    "templates",
    "important",
    ["typescript", "javascript", "json", "markdown", "css", "html"],
    "Example applications and usage demonstrations (22 packages): 3D demo, algorithm bench, auth app, basic app, clock, comfy demo, comprehensive dashboard, ECS agent tracker, email app, embedding visualization, error demo, features app, file test, hue shifting, i18n demo, icons demo, image caption, multi-theme, prompt note, RAG demo, test app, tutorial app",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.PACKAGES_DEPENDENCY,
        COMMON_RELATIONSHIPS.TEMPLATES_SIBLING
      ),
      excludePatterns: [...PACKAGE_EXCLUDE_PATTERNS],
      includePatterns: [...PACKAGE_INCLUDE_PATTERNS, "**/*.css", "**/*.html"],
      metadata: EXAMPLES_METADATA,
    }
  ),
];
