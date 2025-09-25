/**
 * 🦊 Infrastructure Directory Definitions
 * ======================================
 *
 * Infrastructure directory definitions for the Reynard project architecture.
 * Contains deployment, configuration, and infrastructure-related directories.
 */

import type { DirectoryDefinition } from "../types.js";
import { createDirectoryDefinition } from "../builders/directory-builder.js";
import { buildRelationships, COMMON_RELATIONSHIPS } from "../builders/relationship-builder.js";
import { INFRASTRUCTURE_METADATA } from "../config/metadata.js";
import { SERVICE_EXCLUDE_PATTERNS } from "../config/patterns.js";

/**
 * Infrastructure directory definitions
 */
export const INFRASTRUCTURE_DIRECTORIES: DirectoryDefinition[] = [
  createDirectoryDefinition(
    "data",
    "data",
    "data",
    "optional",
    ["json", "yaml", "sql", "data"],
    "Data files, datasets, and configuration data",
    {
      relationships: buildRelationships({ directory: "backend", type: "dependency", description: "Backend data" }),
      excludePatterns: ["**/cache/**", "**/tmp/**"],
      includePatterns: ["**/*.json", "**/*.yaml", "**/*.yml", "**/*.sql", "**/*.csv", "**/*.tsv"],
      buildable: false,
      testable: false,
      lintable: false,
      optional: true,
      metadata: INFRASTRUCTURE_METADATA,
    }
  ),

  createDirectoryDefinition(
    "nginx",
    "nginx",
    "configuration",
    "optional",
    ["config", "shell"],
    "Nginx configuration and deployment scripts",
    {
      relationships: buildRelationships({
        directory: "backend",
        type: "configures",
        description: "Configures backend",
      }),
      includePatterns: ["**/*.conf", "**/*.sh", "**/*.md"],
      buildable: false,
      testable: false,
      optional: true,
      metadata: INFRASTRUCTURE_METADATA,
    }
  ),

  createDirectoryDefinition(
    "fenrir",
    "fenrir",
    "tools",
    "optional",
    ["python", "json", "markdown"],
    "Fenrir development tools and utilities",
    {
      relationships: buildRelationships(COMMON_RELATIONSHIPS.SCRIPTS_SIBLING),
      excludePatterns: [...SERVICE_EXCLUDE_PATTERNS, "**/venv/**", "**/dist/**", "**/build/**"],
      includePatterns: ["**/*.py", "**/*.json", "**/*.md"],
      optional: true,
      metadata: INFRASTRUCTURE_METADATA,
    }
  ),

  createDirectoryDefinition(
    "experimental",
    "experimental",
    "tools",
    "optional",
    ["python", "javascript", "typescript", "json", "markdown"],
    "Experimental packages and prototypes (1 package): Phoenix control system",
    {
      relationships: buildRelationships(COMMON_RELATIONSHIPS.BACKEND_SIBLING),
      excludePatterns: [...SERVICE_EXCLUDE_PATTERNS, "**/venv/**", "**/dist/**", "**/build/**"],
      includePatterns: ["**/*.py", "**/*.js", "**/*.ts", "**/*.json", "**/*.md"],
      optional: true,
      metadata: INFRASTRUCTURE_METADATA,
    }
  ),

  createDirectoryDefinition(
    ".vscode",
    ".vscode",
    "configuration",
    "optional",
    ["json", "markdown"],
    "VS Code workspace configuration (1 package): IDE settings and tasks",
    {
      relationships: [],
      includePatterns: ["**/*.json", "**/*.md"],
      buildable: false,
      testable: false,
      optional: true,
      metadata: INFRASTRUCTURE_METADATA,
    }
  ),

  createDirectoryDefinition(
    "third_party",
    "third_party",
    "third-party",
    "excluded",
    ["python", "javascript", "typescript", "json", "markdown", "other"],
    "Third-party dependencies and external code (3 packages): P4RS3LT0NGV3, pawprint frontend, yipyap",
    {
      relationships: [],
      excludePatterns: ["**/*"],
      includePatterns: [],
      watchable: false,
      buildable: false,
      testable: false,
      lintable: false,
      documentable: false,
      optional: true,
      thirdParty: true,
      metadata: INFRASTRUCTURE_METADATA,
    }
  ),
];
