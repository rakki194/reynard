/**
 * 🦊 Scripts Directory Definitions
 * ================================
 *
 * Scripts directory definitions for the Reynard project architecture.
 * Contains automation scripts, utilities, and development tools.
 */

import type { DirectoryDefinition } from "../types.js";
import { createDirectoryDefinition } from "../builders/directory-builder.js";
import { buildRelationships, COMMON_RELATIONSHIPS } from "../builders/relationship-builder.js";
import { SCRIPTS_METADATA } from "../config/metadata.js";
import { SERVICE_EXCLUDE_PATTERNS } from "../config/patterns.js";

/**
 * Scripts directory definitions
 */
export const SCRIPTS_DIRECTORIES: DirectoryDefinition[] = [
  createDirectoryDefinition(
    "scripts",
    "scripts",
    "scripts",
    "important",
    ["python", "shell", "javascript", "json", "markdown"],
    "Automation scripts, utilities, and development tools (2 packages): CSS validation and workflow validation tools",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.BACKEND_SIBLING
      ),
      excludePatterns: [
        ...SERVICE_EXCLUDE_PATTERNS,
        "**/venv/**",
        "**/dist/**",
        "**/build/**",
      ],
      includePatterns: ["**/*.py", "**/*.sh", "**/*.js", "**/*.json", "**/*.md"],
      buildable: false,
      metadata: SCRIPTS_METADATA,
    }
  ),
];
