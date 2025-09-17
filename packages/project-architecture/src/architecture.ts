/**
 * 🦊 Reynard Project Architecture Definition
 *
 * Centralized definition of the Reynard project structure with semantic
 * and syntactic pathing, relationships, and comprehensive documentation.
 */

import type { 
  ProjectArchitecture
} from "./types.js";

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
    // === SOURCE CODE DIRECTORIES ===
    {
      name: "packages",
      path: "packages",
      category: "source",
      importance: "critical",
      fileTypes: ["typescript", "javascript", "json", "markdown"],
      description: "Main source code packages - all TypeScript/JavaScript packages live here",
      watchable: true,
      buildable: true,
      testable: true,
      lintable: true,
      documentable: true,
      relationships: [
        { directory: "examples", type: "sibling", description: "Examples use packages" },
        { directory: "templates", type: "sibling", description: "Templates use packages" },
        { directory: "e2e", type: "tests", description: "E2E tests test packages" }
      ],
      excludePatterns: ["**/node_modules/**", "**/dist/**", "**/build/**"],
      includePatterns: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.json", "**/*.md"],
      optional: false,
      generated: false,
      thirdParty: false
    },
    
    {
      name: "backend",
      path: "backend",
      category: "source",
      importance: "critical",
      fileTypes: ["python", "json", "yaml", "markdown", "sql"],
      description: "Python backend services and API",
      watchable: true,
      buildable: true,
      testable: true,
      lintable: true,
      documentable: true,
      relationships: [
        { directory: "services", type: "sibling", description: "Related microservices" },
        { directory: "scripts", type: "sibling", description: "Backend automation scripts" }
      ],
      excludePatterns: ["**/__pycache__/**", "**/venv/**", "**/dist/**", "**/build/**"],
      includePatterns: ["**/*.py", "**/*.json", "**/*.yaml", "**/*.yml", "**/*.md", "**/*.sql"],
      optional: false,
      generated: false,
      thirdParty: false
    },
    
    {
      name: "services",
      path: "services",
      category: "services",
      importance: "important",
      fileTypes: ["python", "json", "yaml", "markdown"],
      description: "Microservices and standalone service components",
      watchable: true,
      buildable: true,
      testable: true,
      lintable: true,
      documentable: true,
      relationships: [
        { directory: "backend", type: "sibling", description: "Related backend services" },
        { directory: "scripts", type: "sibling", description: "Service automation scripts" }
      ],
      excludePatterns: ["**/__pycache__/**", "**/venv/**", "**/dist/**", "**/build/**"],
      includePatterns: ["**/*.py", "**/*.json", "**/*.yaml", "**/*.yml", "**/*.md"],
      optional: false,
      generated: false,
      thirdParty: false
    },
    
    // === DOCUMENTATION DIRECTORIES ===
    {
      name: "docs",
      path: "docs",
      category: "documentation",
      importance: "critical",
      fileTypes: ["markdown", "yaml", "json", "html"],
      description: "Project documentation, guides, and API references",
      watchable: true,
      buildable: false,
      testable: false,
      lintable: true,
      documentable: true,
      relationships: [
        { directory: "packages", type: "documents", description: "Documents package APIs" },
        { directory: "backend", type: "documents", description: "Documents backend APIs" }
      ],
      excludePatterns: ["**/node_modules/**", "**/dist/**", "**/build/**"],
      includePatterns: ["**/*.md", "**/*.mdx", "**/*.yaml", "**/*.yml", "**/*.json", "**/*.html"],
      optional: false,
      generated: false,
      thirdParty: false
    },
    
    {
      name: ".cursor/docs",
      path: ".cursor/docs",
      category: "documentation",
      importance: "important",
      fileTypes: ["markdown"],
      description: "Cursor IDE specific documentation and guides",
      watchable: true,
      buildable: false,
      testable: false,
      lintable: true,
      documentable: true,
      relationships: [
        { directory: "docs", type: "sibling", description: "IDE-specific documentation" }
      ],
      excludePatterns: [],
      includePatterns: ["**/*.md"],
      optional: true,
      generated: false,
      thirdParty: false
    },
    
    {
      name: ".cursor/prompts",
      path: ".cursor/prompts",
      category: "documentation",
      importance: "important",
      fileTypes: ["markdown"],
      description: "Cursor IDE prompt templates and configurations",
      watchable: true,
      buildable: false,
      testable: false,
      lintable: true,
      documentable: false,
      relationships: [
        { directory: ".cursor/docs", type: "sibling", description: "IDE configuration" }
      ],
      excludePatterns: [],
      includePatterns: ["**/*.md"],
      optional: true,
      generated: false,
      thirdParty: false
    },
    
    {
      name: ".cursor/rules",
      path: ".cursor/rules",
      category: "configuration",
      importance: "important",
      fileTypes: ["markdown"],
      description: "Cursor IDE rules and coding standards",
      watchable: true,
      buildable: false,
      testable: false,
      lintable: true,
      documentable: false,
      relationships: [
        { directory: ".cursor/prompts", type: "sibling", description: "IDE configuration" }
      ],
      excludePatterns: [],
      includePatterns: ["**/*.md"],
      optional: true,
      generated: false,
      thirdParty: false
    },
    
    // === TEMPLATES AND EXAMPLES ===
    {
      name: "examples",
      path: "examples",
      category: "templates",
      importance: "important",
      fileTypes: ["typescript", "javascript", "json", "markdown", "css", "html"],
      description: "Example applications and usage demonstrations",
      watchable: true,
      buildable: true,
      testable: true,
      lintable: true,
      documentable: true,
      relationships: [
        { directory: "packages", type: "dependency", description: "Uses packages" },
        { directory: "templates", type: "sibling", description: "Related templates" }
      ],
      excludePatterns: ["**/node_modules/**", "**/dist/**", "**/build/**"],
      includePatterns: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.json", "**/*.md", "**/*.css", "**/*.html"],
      optional: false,
      generated: false,
      thirdParty: false
    },
    
    {
      name: "templates",
      path: "templates",
      category: "templates",
      importance: "important",
      fileTypes: ["typescript", "javascript", "json", "markdown", "css", "html"],
      description: "Project templates and boilerplates",
      watchable: true,
      buildable: true,
      testable: true,
      lintable: true,
      documentable: true,
      relationships: [
        { directory: "packages", type: "dependency", description: "Uses packages" },
        { directory: "examples", type: "sibling", description: "Related examples" }
      ],
      excludePatterns: ["**/node_modules/**", "**/dist/**", "**/build/**"],
      includePatterns: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.json", "**/*.md", "**/*.css", "**/*.html"],
      optional: false,
      generated: false,
      thirdParty: false
    },
    
    // === TESTING DIRECTORIES ===
    {
      name: "e2e",
      path: "e2e",
      category: "testing",
      importance: "important",
      fileTypes: ["typescript", "javascript", "json", "markdown"],
      description: "End-to-end tests and test configurations",
      watchable: true,
      buildable: true,
      testable: true,
      lintable: true,
      documentable: true,
      relationships: [
        { directory: "packages", type: "tests", description: "Tests packages" },
        { directory: "examples", type: "tests", description: "Tests examples" }
      ],
      excludePatterns: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/test-results/**", "**/playwright-report/**"],
      includePatterns: ["**/*.ts", "**/*.js", "**/*.json", "**/*.md"],
      optional: false,
      generated: false,
      thirdParty: false
    },
    
    // === AUTOMATION AND SCRIPTS ===
    {
      name: "scripts",
      path: "scripts",
      category: "scripts",
      importance: "important",
      fileTypes: ["python", "shell", "javascript", "json", "markdown"],
      description: "Automation scripts, utilities, and development tools",
      watchable: true,
      buildable: false,
      testable: true,
      lintable: true,
      documentable: true,
      relationships: [
        { directory: "backend", type: "sibling", description: "Backend automation" },
        { directory: "services", type: "sibling", description: "Service automation" }
      ],
      excludePatterns: ["**/__pycache__/**", "**/venv/**", "**/dist/**", "**/build/**"],
      includePatterns: ["**/*.py", "**/*.sh", "**/*.js", "**/*.json", "**/*.md"],
      optional: false,
      generated: false,
      thirdParty: false
    },
    
    
    // === DATA AND CONFIGURATION ===
    {
      name: "data",
      path: "data",
      category: "data",
      importance: "optional",
      fileTypes: ["json", "yaml", "sql", "data"],
      description: "Data files, datasets, and configuration data",
      watchable: true,
      buildable: false,
      testable: false,
      lintable: false,
      documentable: true,
      relationships: [
        { directory: "backend", type: "dependency", description: "Backend data" }
      ],
      excludePatterns: ["**/cache/**", "**/tmp/**"],
      includePatterns: ["**/*.json", "**/*.yaml", "**/*.yml", "**/*.sql", "**/*.csv", "**/*.tsv"],
      optional: true,
      generated: false,
      thirdParty: false
    },
    
    {
      name: "todos",
      path: "todos",
      category: "documentation",
      importance: "optional",
      fileTypes: ["markdown"],
      description: "TODO lists and task tracking",
      watchable: true,
      buildable: false,
      testable: false,
      lintable: true,
      documentable: false,
      relationships: [],
      excludePatterns: [],
      includePatterns: ["**/*.md"],
      optional: true,
      generated: false,
      thirdParty: false
    },
    
    // === INFRASTRUCTURE ===
    {
      name: "nginx",
      path: "nginx",
      category: "configuration",
      importance: "optional",
      fileTypes: ["config", "shell"],
      description: "Nginx configuration and deployment scripts",
      watchable: true,
      buildable: false,
      testable: false,
      lintable: true,
      documentable: true,
      relationships: [
        { directory: "backend", type: "configures", description: "Configures backend" }
      ],
      excludePatterns: [],
      includePatterns: ["**/*.conf", "**/*.sh", "**/*.md"],
      optional: true,
      generated: false,
      thirdParty: false
    },
    
    {
      name: "fenrir",
      path: "fenrir",
      category: "tools",
      importance: "optional",
      fileTypes: ["python", "json", "markdown"],
      description: "Fenrir development tools and utilities",
      watchable: true,
      buildable: true,
      testable: true,
      lintable: true,
      documentable: true,
      relationships: [
        { directory: "scripts", type: "sibling", description: "Development tools" }
      ],
      excludePatterns: ["**/__pycache__/**", "**/venv/**", "**/dist/**", "**/build/**"],
      includePatterns: ["**/*.py", "**/*.json", "**/*.md"],
      optional: true,
      generated: false,
      thirdParty: false
    },
    
    // === THIRD-PARTY CODE ===
    {
      name: "third_party",
      path: "third_party",
      category: "third-party",
      importance: "excluded",
      fileTypes: ["python", "javascript", "typescript", "json", "markdown", "other"],
      description: "Third-party dependencies and external code",
      watchable: false,
      buildable: false,
      testable: false,
      lintable: false,
      documentable: false,
      relationships: [],
      excludePatterns: ["**/*"],
      includePatterns: [],
      optional: true,
      generated: false,
      thirdParty: true
    }
  ],
  
  // Global patterns
  globalExcludePatterns: [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "**/.nyc_output/**",
    "**/.cache/**",
    "**/tmp/**",
    "**/venv/**",
    "**/__pycache__/**",
    "**/.pytest_cache/**",
    "**/.mypy_cache/**",
    "**/.tox/**",
    "**/.coverage/**",
    "**/.eggs/**",
    "**/.eggs-info/**",
    "**/reynard.*.egg-info/**",
    "**/test-results/**",
    "**/playwright-report/**",
    "**/dombench-results/**",
    "**/results/**",
    "**/.tsbuildinfo",
    "**/pnpm-lock.yaml",
    "**/package-lock.json",
    "**/yarn.lock",
    "**/.DS_Store",
    "**/Thumbs.db",
    "**/.env",
    "**/.env.*",
    "**/.git/**",
    "**/.vscode/**"
  ],
  
  globalIncludePatterns: [
    "**/*.ts",
    "**/*.tsx", 
    "**/*.js",
    "**/*.jsx",
    "**/*.py",
    "**/*.md",
    "**/*.mdx",
    "**/*.json",
    "**/*.yaml",
    "**/*.yml",
    "**/*.css",
    "**/*.html",
    "**/*.htm",
    "**/*.sh",
    "**/*.sql",
    "**/*.conf"
  ],
  
  // Default configurations
  defaultWatching: {
    enabled: true,
    recursive: true,
    debounceMs: 2000
  },
  
  defaultBuild: {
    enabled: true,
    parallel: true,
    maxConcurrency: 4
  },
  
  defaultTesting: {
    enabled: true,
    framework: "vitest",
    coverage: true
  },
  
  defaultLinting: {
    enabled: true,
    autoFix: true,
    strict: true
  }
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
