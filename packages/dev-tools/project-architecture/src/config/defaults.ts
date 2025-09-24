/**
 * 🦊 Default Configuration Definitions
 * ===================================
 *
 * Default configurations for the Reynard project architecture system.
 * Provides standardized default settings for watching, building, testing,
 * and linting across all project directories.
 */

/**
 * Default file watching configuration
 */
export const DEFAULT_WATCHING = {
  enabled: true,
  recursive: true,
  debounceMs: 2000,
} as const;

/**
 * Default build configuration
 */
export const DEFAULT_BUILD = {
  enabled: true,
  parallel: true,
  maxConcurrency: 4,
} as const;

/**
 * Default testing configuration
 */
export const DEFAULT_TESTING = {
  enabled: true,
  framework: "vitest",
  coverage: true,
} as const;

/**
 * Default linting configuration
 */
export const DEFAULT_LINTING = {
  enabled: true,
  autoFix: true,
  strict: true,
} as const;

/**
 * Default build configuration for packages
 */
export const DEFAULT_PACKAGE_BUILD = {
  command: "pnpm",
  args: ["build"],
  parallel: true,
  dependencies: ["backend"],
};

/**
 * Default test configuration for packages
 */
export const DEFAULT_PACKAGE_TEST = {
  framework: "vitest",
  command: "pnpm",
  args: ["test"],
  coverage: {
    enabled: true,
    threshold: 80,
    reporters: ["text", "html"],
  },
};

/**
 * Default lint configuration for packages
 */
export const DEFAULT_PACKAGE_LINT = {
  command: "pnpm",
  args: ["lint"],
  autoFix: true,
  strict: true,
};

/**
 * Default build configuration for services
 */
export const DEFAULT_SERVICE_BUILD = {
  command: "pip",
  args: ["install", "-e", "."],
  parallel: false,
  dependencies: ["backend"],
};

/**
 * Default test configuration for services
 */
export const DEFAULT_SERVICE_TEST = {
  framework: "pytest",
  command: "python",
  args: ["-m", "pytest"],
  coverage: {
    enabled: true,
    threshold: 80,
    reporters: ["text", "html", "xml"],
  },
};

/**
 * Default lint configuration for services
 */
export const DEFAULT_SERVICE_LINT = {
  command: "python",
  args: ["-m", "ruff"],
  autoFix: true,
  strict: true,
};
