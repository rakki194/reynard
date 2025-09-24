/**
 * 🦊 Template Package Definitions
 * ===============================
 *
 * Project template directory definitions for the Reynard project architecture.
 * Contains project templates and boilerplates for quick project setup.
 */

import type { DirectoryDefinition } from "../types.js";
import { createDirectoryDefinition } from "../builders/directory-builder.js";
import { buildRelationships, COMMON_RELATIONSHIPS } from "../builders/relationship-builder.js";
import { TEMPLATES_METADATA } from "../config/metadata.js";
import { PACKAGE_EXCLUDE_PATTERNS, PACKAGE_INCLUDE_PATTERNS } from "../config/patterns.js";

/**
 * Template packages directory definitions
 */
export const TEMPLATE_PACKAGES: DirectoryDefinition[] = [
  createDirectoryDefinition(
    "templates",
    "templates",
    "templates",
    "important",
    ["typescript", "javascript", "json", "markdown", "css", "html"],
    "Project templates and boilerplates (1 package): Starter template",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.PACKAGES_DEPENDENCY,
        COMMON_RELATIONSHIPS.EXAMPLES_SIBLING
      ),
      excludePatterns: [...PACKAGE_EXCLUDE_PATTERNS],
      includePatterns: [...PACKAGE_INCLUDE_PATTERNS, "**/*.css", "**/*.html"],
      metadata: TEMPLATES_METADATA,
    }
  ),
];
