/**
 * 🦊 Metadata Definitions
 * ======================
 *
 * Common metadata definitions for the Reynard project architecture system.
 * Provides standardized metadata templates and tag definitions.
 */

import type { DirectoryArchitectureMetadata } from "../types.js";

/**
 * Common tags for different directory categories
 */
export const TAGS = {
  CORE: ["core", "source", "typescript"],
  AI: ["ai", "ml", "machine-learning", "typescript"],
  UI: ["ui", "components", "frontend", "typescript"],
  SERVICES: ["services", "api", "backend", "typescript"],
  DATA: ["data", "repository", "storage", "typescript"],
  MEDIA: ["media", "image", "video", "audio", "typescript"],
  DEV_TOOLS: ["dev-tools", "development", "typescript"],
  DOCS: ["documentation", "docs", "markdown"],
  EXAMPLES: ["examples", "demos", "typescript"],
  TEMPLATES: ["templates", "boilerplate", "typescript"],
  TESTING: ["testing", "tests", "e2e", "typescript"],
  SCRIPTS: ["scripts", "automation", "python"],
  INFRASTRUCTURE: ["infrastructure", "deployment", "config"],
  PYTHON: ["python", "backend", "services"],
  MCP: ["mcp", "development-tools", "automation"],
  AGENT_NAMING: ["agent-naming", "spirits", "naming"],
  GATEKEEPER: ["authentication", "authorization", "security"],
} as const;

/**
 * Health status definitions
 */
export const HEALTH_STATUS = {
  HEALTHY: "healthy",
  WARNING: "warning",
  ERROR: "error",
  UNKNOWN: "unknown",
} as const;

/**
 * Default metadata for core packages
 */
export const CORE_METADATA: DirectoryArchitectureMetadata = {
  tags: [...TAGS.CORE],
  health: HEALTH_STATUS.HEALTHY,
  notes: "Core framework package",
};

/**
 * Default metadata for AI packages
 */
export const AI_METADATA: DirectoryArchitectureMetadata = {
  tags: [...TAGS.AI],
  health: HEALTH_STATUS.HEALTHY,
  notes: "AI and machine learning package",
};

/**
 * Default metadata for UI packages
 */
export const UI_METADATA: DirectoryArchitectureMetadata = {
  tags: [...TAGS.UI],
  health: HEALTH_STATUS.HEALTHY,
  notes: "User interface package",
};

/**
 * Default metadata for service packages
 */
export const SERVICE_METADATA: DirectoryArchitectureMetadata = {
  tags: [...TAGS.SERVICES],
  health: HEALTH_STATUS.HEALTHY,
  notes: "Service layer package",
};

/**
 * Default metadata for data packages
 */
export const DATA_METADATA: DirectoryArchitectureMetadata = {
  tags: [...TAGS.DATA],
  health: HEALTH_STATUS.HEALTHY,
  notes: "Data processing package",
};

/**
 * Default metadata for media packages
 */
export const MEDIA_METADATA: DirectoryArchitectureMetadata = {
  tags: [...TAGS.MEDIA],
  health: HEALTH_STATUS.HEALTHY,
  notes: "Media processing package",
};

/**
 * Default metadata for dev tools packages
 */
export const DEV_TOOLS_METADATA: DirectoryArchitectureMetadata = {
  tags: [...TAGS.DEV_TOOLS],
  health: HEALTH_STATUS.HEALTHY,
  notes: "Development tools package",
};

/**
 * Default metadata for documentation packages
 */
export const DOCS_METADATA: DirectoryArchitectureMetadata = {
  tags: [...TAGS.DOCS],
  health: HEALTH_STATUS.HEALTHY,
  notes: "Documentation package",
};

/**
 * Default metadata for example packages
 */
export const EXAMPLES_METADATA: DirectoryArchitectureMetadata = {
  tags: [...TAGS.EXAMPLES],
  health: HEALTH_STATUS.HEALTHY,
  notes: "Example application",
};

/**
 * Default metadata for template packages
 */
export const TEMPLATES_METADATA: DirectoryArchitectureMetadata = {
  tags: [...TAGS.TEMPLATES],
  health: HEALTH_STATUS.HEALTHY,
  notes: "Project template",
};

/**
 * Default metadata for testing packages
 */
export const TESTING_METADATA: DirectoryArchitectureMetadata = {
  tags: [...TAGS.TESTING],
  health: HEALTH_STATUS.HEALTHY,
  notes: "Testing package",
};

/**
 * Default metadata for script packages
 */
export const SCRIPTS_METADATA: DirectoryArchitectureMetadata = {
  tags: [...TAGS.SCRIPTS],
  health: HEALTH_STATUS.HEALTHY,
  notes: "Automation script",
};

/**
 * Default metadata for infrastructure packages
 */
export const INFRASTRUCTURE_METADATA: DirectoryArchitectureMetadata = {
  tags: [...TAGS.INFRASTRUCTURE],
  health: HEALTH_STATUS.HEALTHY,
  notes: "Infrastructure package",
};

/**
 * Default metadata for Python services
 */
export const PYTHON_SERVICE_METADATA: DirectoryArchitectureMetadata = {
  tags: [...TAGS.PYTHON],
  health: HEALTH_STATUS.HEALTHY,
  notes: "Python service",
};

/**
 * Default metadata for MCP server
 */
export const MCP_METADATA: DirectoryArchitectureMetadata = {
  tags: [...TAGS.MCP],
  health: HEALTH_STATUS.HEALTHY,
  notes: "Comprehensive MCP server with 47+ development tools and ECS world simulation",
};

/**
 * Default metadata for agent naming service
 */
export const AGENT_NAMING_METADATA: DirectoryArchitectureMetadata = {
  tags: [...TAGS.AGENT_NAMING],
  health: HEALTH_STATUS.HEALTHY,
  notes: "Pure Python agent naming system with no external dependencies",
};

/**
 * Default metadata for gatekeeper service
 */
export const GATEKEEPER_METADATA: DirectoryArchitectureMetadata = {
  tags: [...TAGS.GATEKEEPER],
  health: HEALTH_STATUS.HEALTHY,
  notes: "FastAPI-based authentication and authorization system",
};
