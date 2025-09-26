/**
 * 🦊 Root Services Directory Definitions
 * ======================================
 *
 * Root-level service directory definitions for the Reynard project architecture.
 * Contains microservices and standalone service implementations.
 */

import type { DirectoryDefinition } from "../types.js";
import { createDirectoryDefinition } from "../builders/directory-builder.js";
import { buildRelationships } from "../builders/relationship-builder.js";
import { MCP_METADATA, GATEKEEPER_METADATA } from "../config/metadata.js";
import { SERVICE_EXCLUDE_PATTERNS } from "../config/patterns.js";

/**
 * Root services directory definitions
 */
export const ROOT_SERVICES: DirectoryDefinition[] = [
  createDirectoryDefinition(
    "services/gatekeeper",
    "services/gatekeeper",
    "backend",
    "important",
    ["python", "json", "markdown", "toml"],
    "Authentication and authorization system - provides secure access control and user management",
    {
      relationships: buildRelationships({
        directory: "services/mcp-server",
        type: "dependency",
        description: "Used by MCP server for authentication",
      }),
      excludePatterns: [
        ...SERVICE_EXCLUDE_PATTERNS,
        "**/htmlcov/**",
        "**/*.egg-info/**",
        "**/node_modules/**",
        "**/dist/**",
        "**/build/**",
      ],
      includePatterns: ["**/*.py", "**/*.json", "**/*.md", "**/*.toml"],
      buildConfig: {
        command: "pip",
        args: ["install", "-e", "."],
        parallel: false,
      },
      testConfig: {
        framework: "pytest",
        command: "python",
        args: ["-m", "pytest"],
        coverage: {
          enabled: true,
          threshold: 85,
          reporters: ["text", "html", "xml"],
        },
      },
      metadata: GATEKEEPER_METADATA,
    }
  ),

  createDirectoryDefinition(
    "services/mcp-server",
    "services/mcp-server",
    "backend",
    "critical",
    ["python", "json", "markdown", "toml", "sh"],
    "MCP server with comprehensive development tools - provides 47+ tools across 8 categories for development workflow automation",
    {
      relationships: buildRelationships(
        { directory: "services/gatekeeper", type: "dependency", description: "Uses authentication system" },
        { directory: "backend", type: "dependency", description: "Uses backend agent naming functionality" },
        { directory: "packages", type: "dependency", description: "Uses packages" }
      ),
      excludePatterns: [
        ...SERVICE_EXCLUDE_PATTERNS,
        "**/htmlcov/**",
        "**/*.egg-info/**",
        "**/data/**",
        "**/node_modules/**",
        "**/dist/**",
        "**/build/**",
      ],
      includePatterns: ["**/*.py", "**/*.json", "**/*.md", "**/*.toml", "**/*.sh"],
      buildConfig: {
        command: "pip",
        args: ["install", "-e", "."],
        parallel: false,
        dependencies: ["services/gatekeeper"],
      },
      testConfig: {
        framework: "pytest",
        command: "python",
        args: ["-m", "pytest"],
        coverage: {
          enabled: true,
          threshold: 80,
          reporters: ["text", "html", "xml"],
        },
      },
      metadata: MCP_METADATA,
    }
  ),
];
