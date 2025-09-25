/**
 * 🦊 Testing Directory Definitions
 * ================================
 *
 * Testing directory definitions for the Reynard project architecture.
 * Contains end-to-end tests and test configurations.
 */

import type { DirectoryDefinition } from "../types.js";
import { createDirectoryDefinition } from "../builders/directory-builder.js";
import { buildRelationships, COMMON_RELATIONSHIPS } from "../builders/relationship-builder.js";
import { TESTING_METADATA } from "../config/metadata.js";
import { PACKAGE_EXCLUDE_PATTERNS } from "../config/patterns.js";

/**
 * Testing directory definitions
 */
export const TESTING_DIRECTORIES: DirectoryDefinition[] = [
  createDirectoryDefinition(
    "e2e",
    "e2e",
    "testing",
    "important",
    ["typescript", "javascript", "json", "markdown"],
    "End-to-end tests and test configurations (1 package): Comprehensive E2E testing suite",
    {
      relationships: buildRelationships(COMMON_RELATIONSHIPS.PACKAGES_TESTS, COMMON_RELATIONSHIPS.EXAMPLES_TESTS),
      excludePatterns: [...PACKAGE_EXCLUDE_PATTERNS, "**/test-results/**", "**/playwright-report/**"],
      includePatterns: ["**/*.ts", "**/*.js", "**/*.json", "**/*.md"],
      metadata: TESTING_METADATA,
    }
  ),
];
