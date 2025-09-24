/**
 * 🦊 Reynard Project Architecture Definition
 * ==========================================
 *
 * Centralized definition of the Reynard project structure with semantic
 * and syntactic pathing, relationships, and comprehensive documentation.
 * 
 * This is the main orchestrator that composes all modular architecture definitions.
 */

import type { ProjectArchitecture } from "./types.js";

// Import all directory modules
import { CORE_PACKAGES } from "./directories/core.js";
import { AI_PACKAGES } from "./directories/ai.js";
import { UI_PACKAGES } from "./directories/ui.js";
import { SERVICE_PACKAGES } from "./directories/services.js";
import { DATA_PACKAGES } from "./directories/data.js";
import { MEDIA_PACKAGES } from "./directories/media.js";
import { DEV_TOOLS_PACKAGES } from "./directories/dev-tools.js";
import { DOCS_PACKAGES } from "./directories/docs.js";
import { EXAMPLE_PACKAGES } from "./directories/examples.js";
import { TEMPLATE_PACKAGES } from "./directories/templates.js";
import { TESTING_DIRECTORIES } from "./directories/testing.js";
import { SCRIPTS_DIRECTORIES } from "./directories/scripts.js";
import { INFRASTRUCTURE_DIRECTORIES } from "./directories/infrastructure.js";
import { ROOT_SERVICES } from "./directories/services-root.js";

// Import configuration modules
import { 
  DEFAULT_WATCHING, 
  DEFAULT_BUILD, 
  DEFAULT_TESTING, 
  DEFAULT_LINTING 
} from "./config/defaults.js";
import { 
  GLOBAL_EXCLUDE_PATTERNS, 
  GLOBAL_INCLUDE_PATTERNS 
} from "./config/patterns.js";

/**
 * Reynard Project Architecture Definition
 *
 * This is the single source of truth for all project structure information.
 * All tools, watchers, and build systems should use this definition.
 */
export const REYNARD_ARCHITECTURE: ProjectArchitecture = {
  name: "Reynard",
  rootPath: "/home/kade/runeset/reynard",

  directories: [
    // Core packages
    ...CORE_PACKAGES,
    
    // AI packages
    ...AI_PACKAGES,
    
    // UI packages
    ...UI_PACKAGES,
    
    // Service packages
    ...SERVICE_PACKAGES,
    
    // Data packages
    ...DATA_PACKAGES,
    
    // Media packages
    ...MEDIA_PACKAGES,
    
    // Dev tools packages
    ...DEV_TOOLS_PACKAGES,
    
    // Documentation packages
    ...DOCS_PACKAGES,
    
    // Example packages
    ...EXAMPLE_PACKAGES,
    
    // Template packages
    ...TEMPLATE_PACKAGES,
    
    // Testing directories
    ...TESTING_DIRECTORIES,
    
    // Scripts directories
    ...SCRIPTS_DIRECTORIES,
    
    // Infrastructure directories
    ...INFRASTRUCTURE_DIRECTORIES,
    
    // Root services
    ...ROOT_SERVICES,
  ],

  // Global patterns
  globalExcludePatterns: [...GLOBAL_EXCLUDE_PATTERNS],
  globalIncludePatterns: [...GLOBAL_INCLUDE_PATTERNS],

  // Default configurations
  defaultWatching: DEFAULT_WATCHING,
  defaultBuild: DEFAULT_BUILD,
  defaultTesting: DEFAULT_TESTING,
  defaultLinting: DEFAULT_LINTING,
};

/**
 * Get all directories that should be watched for changes
 */
export function getWatchableDirectories(): string[] {
  return REYNARD_ARCHITECTURE.directories
    .filter(dir => dir.watchable && dir.importance !== "excluded")
    .map(dir => dir.path);
}

/**
 * Get all directories that should be included in builds
 */
export function getBuildableDirectories(): string[] {
  return REYNARD_ARCHITECTURE.directories
    .filter(dir => dir.buildable && dir.importance !== "excluded")
    .map(dir => dir.path);
}

/**
 * Get all directories that should be included in testing
 */
export function getTestableDirectories(): string[] {
  return REYNARD_ARCHITECTURE.directories
    .filter(dir => dir.testable && dir.importance !== "excluded")
    .map(dir => dir.path);
}

/**
 * Get all directories that should be included in linting
 */
export function getLintableDirectories(): string[] {
  return REYNARD_ARCHITECTURE.directories
    .filter(dir => dir.lintable && dir.importance !== "excluded")
    .map(dir => dir.path);
}

/**
 * Get all directories that should be included in documentation generation
 */
export function getDocumentableDirectories(): string[] {
  return REYNARD_ARCHITECTURE.directories
    .filter(dir => dir.documentable && dir.importance !== "excluded")
    .map(dir => dir.path);
}

/**
 * Get all global exclude patterns
 */
export function getGlobalExcludePatterns(): string[] {
  return REYNARD_ARCHITECTURE.globalExcludePatterns;
}

/**
 * Get all global include patterns
 */
export function getGlobalIncludePatterns(): string[] {
  return REYNARD_ARCHITECTURE.globalIncludePatterns;
}
