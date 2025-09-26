/**
 * 🦊 Specialized Directory Builders
 * =================================
 *
 * Specialized directory builder functions for creating specialized directory definitions
 * in the Reynard project architecture. Provides builders for dev tools, documentation,
 * backend, frontend, and infrastructure packages.
 */

import type { DirectoryDefinition } from "../types.js";
import { createDirectoryDefinition } from "./directory-builders-core.js";

/**
 * Create a dev tools package directory definition
 */
export function createDevToolsPackage(
  name: string,
  path: string,
  description: string,
  options: Partial<DirectoryDefinition> = {}
): DirectoryDefinition {
  return createDirectoryDefinition(
    name,
    path,
    "tools",
    "important",
    ["typescript", "javascript", "json", "markdown"],
    description,
    {
      categories: ["tools", "source", "infrastructure"],
      relationships: [
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
        { directory: "scripts", type: "sibling", description: "Related automation scripts" },
      ],
      ...options,
    }
  );
}

/**
 * Create a documentation package directory definition
 */
export function createDocsPackage(
  name: string,
  path: string,
  description: string,
  options: Partial<DirectoryDefinition> = {}
): DirectoryDefinition {
  return createDirectoryDefinition(
    name,
    path,
    "documentation",
    "important",
    ["typescript", "javascript", "json", "markdown"],
    description,
    {
      categories: ["documentation", "source", "tools"],
      relationships: [
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
        { directory: "packages/ui/ui", type: "dependency", description: "Uses UI components" },
        { directory: "docs", type: "documents", description: "Generates documentation" },
      ],
      ...options,
    }
  );
}

/**
 * Create a backend package directory definition
 */
export function createBackendPackage(
  name: string,
  path: string,
  description: string,
  options: Partial<DirectoryDefinition> = {}
): DirectoryDefinition {
  return createDirectoryDefinition(
    name,
    path,
    "backend",
    "critical",
    ["python", "javascript", "json", "markdown", "yaml", "toml", "sql"],
    description,
    {
      categories: ["backend", "services", "infrastructure"],
      relationships: [
        { directory: "backend", type: "sibling", description: "Related backend services" },
        { directory: "packages/services/api-client", type: "dependency", description: "Uses API client" },
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
      ],
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
          threshold: 80,
          reporters: ["text", "html", "xml"],
        },
      },
      ...options,
    }
  );
}

/**
 * Create a frontend package directory definition
 */
export function createFrontendPackage(
  name: string,
  path: string,
  description: string,
  options: Partial<DirectoryDefinition> = {}
): DirectoryDefinition {
  return createDirectoryDefinition(
    name,
    path,
    "frontend",
    "important",
    ["typescript", "javascript", "json", "markdown", "css", "html"],
    description,
    {
      categories: ["frontend", "ui", "examples"],
      relationships: [
        { directory: "packages/ui/components-core", type: "dependency", description: "Uses UI components" },
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
        { directory: "packages/ui/themes", type: "dependency", description: "Uses themes" },
        { directory: "packages/ui/primitives", type: "dependency", description: "Uses primitive components" },
      ],
      ...options,
    }
  );
}

/**
 * Create an infrastructure package directory definition
 */
export function createInfrastructurePackage(
  name: string,
  path: string,
  description: string,
  options: Partial<DirectoryDefinition> = {}
): DirectoryDefinition {
  return createDirectoryDefinition(
    name,
    path,
    "infrastructure",
    "important",
    ["typescript", "javascript", "json", "markdown", "yaml", "docker"],
    description,
    {
      categories: ["infrastructure", "tools", "configuration"],
      relationships: [
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
        {
          directory: "packages/dev-tools/project-architecture",
          type: "dependency",
          description: "Uses project architecture tools",
        },
        { directory: "scripts", type: "sibling", description: "Related automation scripts" },
      ],
      ...options,
    }
  );
}
