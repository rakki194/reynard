/**
 * 🦊 Dev Tools Package Definitions
 * ================================
 *
 * Development tools package directory definitions for the Reynard project architecture.
 * Contains packages for code quality, project architecture, git automation, and dev utilities.
 */

import type { DirectoryDefinition } from "../types.js";
import { createDevToolsPackage } from "../builders/directory-builder.js";
import { buildRelationships, COMMON_RELATIONSHIPS } from "../builders/relationship-builder.js";
import { DEV_TOOLS_METADATA } from "../config/metadata.js";

/**
 * Dev tools packages directory definitions
 */
export const DEV_TOOLS_PACKAGES: DirectoryDefinition[] = [
  createDevToolsPackage(
    "packages/dev-tools/project-architecture",
    "packages/dev-tools/project-architecture",
    "Project architecture definition system - provides centralized project structure definitions, VS Code task generation, health monitoring, and development workflow automation",
    {
      relationships: buildRelationships(COMMON_RELATIONSHIPS.CORE_DEPENDENCY, COMMON_RELATIONSHIPS.SCRIPTS_SIBLING),
      metadata: DEV_TOOLS_METADATA,
    }
  ),

  createDevToolsPackage(
    "packages/dev-tools/adr-system",
    "packages/dev-tools/adr-system",
    "Architecture Decision Records management and documentation - provides ADR creation, management, tracking, and documentation for architectural decisions",
    {
      relationships: buildRelationships(COMMON_RELATIONSHIPS.CORE_DEPENDENCY, {
        directory: "packages/docs/docs-generator",
        type: "dependency",
        description: "Uses docs generator",
      }),
      metadata: DEV_TOOLS_METADATA,
    }
  ),

  createDevToolsPackage(
    "packages/dev-tools/code-quality",
    "packages/dev-tools/code-quality",
    "Linting, formatting, and code quality tools - provides comprehensive code quality tools including linting, formatting, static analysis, and code quality metrics",
    {
      relationships: buildRelationships(COMMON_RELATIONSHIPS.CORE_DEPENDENCY),
      metadata: DEV_TOOLS_METADATA,
    }
  ),

  createDevToolsPackage(
    "packages/dev-tools/dev-server-management",
    "packages/dev-tools/dev-server-management",
    "Development server orchestration and management - provides development server management, orchestration, configuration, and monitoring for development workflows",
    {
      relationships: buildRelationships(COMMON_RELATIONSHIPS.CORE_DEPENDENCY, {
        directory: "packages/core/connection",
        type: "dependency",
        description: "Uses connection utilities",
      }),
      metadata: DEV_TOOLS_METADATA,
    }
  ),

  createDevToolsPackage(
    "packages/dev-tools/git-automation",
    "packages/dev-tools/git-automation",
    "Git workflow automation and repository management - provides Git automation, workflow management, repository operations, and version control utilities",
    {
      relationships: buildRelationships(COMMON_RELATIONSHIPS.CORE_DEPENDENCY),
      metadata: DEV_TOOLS_METADATA,
    }
  ),

  createDevToolsPackage(
    "packages/dev-tools/humility-parser",
    "packages/dev-tools/humility-parser",
    "Documentation parsing utilities and content processing - provides documentation parsing, content analysis, and documentation processing utilities",
    {
      relationships: buildRelationships(COMMON_RELATIONSHIPS.CORE_DEPENDENCY, {
        directory: "packages/docs/docs-generator",
        type: "dependency",
        description: "Uses docs generator",
      }),
      metadata: DEV_TOOLS_METADATA,
    }
  ),

  createDevToolsPackage(
    "packages/dev-tools/queue-watcher",
    "packages/dev-tools/queue-watcher",
    "Build queue monitoring, management, and optimization - provides build queue monitoring, task management, performance optimization, and queue analytics",
    {
      relationships: buildRelationships(COMMON_RELATIONSHIPS.CORE_DEPENDENCY, {
        directory: "packages/core/connection",
        type: "dependency",
        description: "Uses connection utilities",
      }),
      metadata: DEV_TOOLS_METADATA,
    }
  ),
];
