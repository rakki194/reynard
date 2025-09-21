/**
 * 🦊 Reynard Project Architecture Types
 * =====================================
 * 
 * Comprehensive type definitions for the Reynard project structure system,
 * providing sophisticated type safety and architectural guidance for the
 * entire Reynard ecosystem. This module defines the core types used throughout
 * the project architecture analysis, dependency management, and structural
 * validation systems.
 * 
 * The type system provides:
 * - Directory classification and categorization for architectural analysis
 * - File type definitions for comprehensive project structure understanding
 * - Relationship types for dependency mapping and architectural visualization
 * - Importance levels for prioritizing architectural components
 * - Configuration types for project structure validation and analysis
 * - Interface definitions for extensible architecture management
 * 
 * Key Features:
 * - Type Safety: Comprehensive TypeScript types for all architectural concepts
 * - Extensibility: Modular type definitions that can be extended for new use cases
 * - Documentation: Self-documenting types with clear descriptions and examples
 * - Validation: Type-based validation for architectural consistency
 * - Analysis: Types supporting sophisticated project structure analysis
 * 
 * Architecture Categories:
 * - Directory Types: Classification system for project directories
 * - File Types: Comprehensive file type definitions
 * - Relationship Types: Dependency and relationship classifications
 * - Importance Levels: Priority and significance classifications
 * - Configuration Types: Project structure configuration definitions
 * 
 * @author Reynard Development Team
 * @version 1.0.0
 */

/**
 * Directory category classification for architectural analysis.
 * 
 * Defines the classification system for project directories, enabling
 * sophisticated architectural analysis and dependency mapping. Each
 * category represents a specific architectural role within the project
 * structure.
 * 
 * @type {string}
 */
export type DirectoryCategory =
  | "source" // Source code directories containing application logic
  | "documentation" // Documentation and guides for project understanding
  | "configuration" // Configuration files and environment settings
  | "build" // Build artifacts and compilation outputs
  | "testing" // Test files and test data for quality assurance
  | "scripts" // Automation and utility scripts for development
  | "data" // Data files and datasets for application use
  | "templates" // Project templates and example implementations
  | "services" // Microservices and standalone service implementations
  | "third-party" // External dependencies and third-party code
  | "cache" // Cache and temporary files for performance
  | "tools" // Development tools and utilities for project management
  | "experimental"; // Experimental packages and prototype implementations

/**
 * File type classification
 */
export type FileType =
  | "typescript" // TypeScript source files
  | "javascript" // JavaScript source files
  | "python" // Python source files
  | "markdown" // Markdown documentation
  | "json" // JSON configuration and data
  | "yaml" // YAML configuration
  | "css" // CSS stylesheets
  | "html" // HTML files
  | "shell" // Shell scripts
  | "docker" // Docker files
  | "sql" // SQL files
  | "config" // Configuration files
  | "data" // Data files
  | "binary" // Binary files
  | "toml" // TOML configuration files
  | "sh" // Shell script files
  | "other"; // Other file types

/**
 * Directory importance level
 */
export type ImportanceLevel =
  | "critical" // Essential for project operation
  | "important" // Important for development workflow
  | "optional" // Optional but useful
  | "excluded"; // Should be excluded from most operations

/**
 * Directory relationship type
 */
export type RelationshipType =
  | "parent" // Parent directory
  | "child" // Child directory
  | "sibling" // Sibling directory
  | "dependency" // Dependency relationship
  | "generated" // Generated from this directory
  | "configures" // Configures this directory
  | "tests" // Tests this directory
  | "documents" // Documents this directory
  | "builds" // Builds this directory
  | "deploys" // Deploys this directory
  | "monitors" // Monitors this directory
  | "caches"; // Caches data for this directory

/**
 * Directory definition
 */
export interface DirectoryDefinition {
  /** Directory name */
  name: string;
  /** Full path from project root */
  path: string;
  /** Category classification */
  category: DirectoryCategory;
  /** Importance level */
  importance: ImportanceLevel;
  /** Primary file types in this directory */
  fileTypes: FileType[];
  /** Description of the directory's purpose */
  description: string;
  /** Whether this directory should be watched for changes */
  watchable: boolean;
  /** Whether this directory should be included in builds */
  buildable: boolean;
  /** Whether this directory should be included in tests */
  testable: boolean;
  /** Whether this directory should be included in linting */
  lintable: boolean;
  /** Whether this directory should be included in documentation generation */
  documentable: boolean;
  /** Related directories and their relationships */
  relationships: DirectoryRelationship[];
  /** Specific patterns to exclude from this directory */
  excludePatterns: string[];
  /** Specific patterns to include from this directory */
  includePatterns: string[];
  /** Whether this directory is optional (may not exist) */
  optional: boolean;
  /** Whether this directory contains generated files */
  generated: boolean;
  /** Whether this directory contains third-party code */
  thirdParty: boolean;
  /** Build configuration for this directory */
  buildConfig?: BuildConfiguration;
  /** Test configuration for this directory */
  testConfig?: TestConfiguration;
  /** Lint configuration for this directory */
  lintConfig?: LintConfiguration;
  /** Metadata about the directory */
  metadata?: DirectoryArchitectureMetadata;
}

/**
 * Build configuration for a directory
 */
export interface BuildConfiguration {
  /** Build command to use */
  command?: string;
  /** Build arguments */
  args?: string[];
  /** Output directory */
  outputDir?: string;
  /** Whether to run in parallel */
  parallel?: boolean;
  /** Build dependencies */
  dependencies?: string[];
  /** Environment variables for build */
  env?: Record<string, string>;
}

/**
 * Test configuration for a directory
 */
export interface TestConfiguration {
  /** Test framework to use */
  framework?: string;
  /** Test command */
  command?: string;
  /** Test arguments */
  args?: string[];
  /** Test patterns */
  patterns?: string[];
  /** Coverage configuration */
  coverage?: {
    enabled: boolean;
    threshold?: number;
    reporters?: string[];
  };
  /** Environment variables for tests */
  env?: Record<string, string>;
}

/**
 * Lint configuration for a directory
 */
export interface LintConfiguration {
  /** Lint command */
  command?: string;
  /** Lint arguments */
  args?: string[];
  /** Auto-fix enabled */
  autoFix?: boolean;
  /** Strict mode */
  strict?: boolean;
  /** Lint patterns */
  patterns?: string[];
  /** Environment variables for linting */
  env?: Record<string, string>;
}

/**
 * Directory metadata
 */
export interface DirectoryMetadata {
  /** Creation date */
  createdAt?: string;
  /** Last modified date */
  modifiedAt?: string;
  /** Author information */
  author?: string;
  /** Tags for categorization */
  tags?: string[];
  /** Performance metrics */
  metrics?: {
    fileCount?: number;
    lineCount?: number;
    complexity?: number;
  };
  /** Health status */
  health?: "healthy" | "warning" | "error";
  /** Notes and comments */
  notes?: string;
}

/**
 * Directory relationship
 */
export interface DirectoryRelationship {
  /** Related directory name */
  directory: string;
  /** Type of relationship */
  type: RelationshipType;
  /** Description of the relationship */
  description: string;
}

/**
 * Project architecture configuration
 */
export interface ProjectArchitecture {
  /** Project name */
  name: string;
  /** Project root path */
  rootPath: string;
  /** All directory definitions */
  directories: DirectoryDefinition[];
  /** Global exclude patterns */
  globalExcludePatterns: string[];
  /** Global include patterns */
  globalIncludePatterns: string[];
  /** Default file watching configuration */
  defaultWatching: {
    enabled: boolean;
    recursive: boolean;
    debounceMs: number;
  };
  /** Default build configuration */
  defaultBuild: {
    enabled: boolean;
    parallel: boolean;
    maxConcurrency: number;
  };
  /** Default testing configuration */
  defaultTesting: {
    enabled: boolean;
    framework: string;
    coverage: boolean;
  };
  /** Default linting configuration */
  defaultLinting: {
    enabled: boolean;
    autoFix: boolean;
    strict: boolean;
  };
}

/**
 * Path resolution options
 */
export interface PathResolutionOptions {
  /** Whether to resolve to absolute paths */
  absolute?: boolean;
  /** Whether to include optional directories */
  includeOptional?: boolean;
  /** Whether to include generated directories */
  includeGenerated?: boolean;
  /** Whether to include third-party directories */
  includeThirdParty?: boolean;
  /** Filter by category */
  category?: DirectoryCategory;
  /** Filter by importance level */
  importance?: ImportanceLevel;
  /** Filter by watchable directories */
  watchable?: boolean;
  /** Filter by buildable directories */
  buildable?: boolean;
  /** Filter by testable directories */
  testable?: boolean;
  /** Filter by lintable directories */
  lintable?: boolean;
  /** Filter by documentable directories */
  documentable?: boolean;
}

/**
 * Directory query result
 */
export interface DirectoryQueryResult {
  /** Matching directories */
  directories: DirectoryDefinition[];
  /** Total count */
  count: number;
  /** Query execution time in milliseconds */
  executionTime: number;
}

/**
 * Directory metadata for utility functions
 */
export interface DirectoryMetadata {
  /** Directory name */
  name: string;
  /** Directory path */
  path: string;
  /** Directory category */
  category: DirectoryCategory;
  /** Directory importance */
  importance: ImportanceLevel;
}

/**
 * Directory metadata for architecture definitions
 */
export interface DirectoryArchitectureMetadata {
  /** Tags associated with the directory */
  tags: string[];
  /** Health status of the directory */
  health: "healthy" | "warning" | "error" | "unknown";
  /** Additional notes about the directory */
  notes: string;
}

