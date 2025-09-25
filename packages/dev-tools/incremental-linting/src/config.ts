/**
 * 🦊 Reynard Incremental Linting Configuration
 * ============================================
 *
 * Configuration utilities for the incremental linting system.
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import type { IncrementalLintingConfig } from "./types.js";

/**
 * Create default configuration for Reynard monorepo
 */
export function createDefaultConfig(rootPath: string): IncrementalLintingConfig {
  return {
    rootPath,
    linters: [
      // TypeScript/JavaScript linting with ESLint
      {
        name: "eslint",
        enabled: true,
        command: "npx",
        args: ["eslint", "--format", "json"],
        patterns: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
        excludePatterns: ["**/node_modules/**", "**/dist/**", "**/build/**"],
        maxFileSize: 1024 * 1024, // 1MB
        timeout: 30000,
        parallel: true,
        priority: 10,
        workingDirectory: rootPath,
      },

      // Python linting with Ruff (single tool approach)
      {
        name: "ruff",
        enabled: true,
        command: "ruff",
        args: ["check", "--output-format", "json"],
        patterns: ["**/*.py"],
        excludePatterns: ["**/__pycache__/**", "**/venv/**", "**/.venv/**"],
        maxFileSize: 2 * 1024 * 1024, // 2MB
        timeout: 30000,
        parallel: true,
        priority: 10,
        workingDirectory: rootPath,
      },

      // Python type checking with MyPy
      {
        name: "mypy",
        enabled: true,
        command: "mypy",
        args: ["--show-error-codes", "--no-error-summary"],
        patterns: ["**/*.py"],
        excludePatterns: ["**/__pycache__/**", "**/venv/**", "**/.venv/**"],
        maxFileSize: 2 * 1024 * 1024, // 2MB
        timeout: 60000, // MyPy can be slower
        parallel: false, // MyPy doesn't like parallel execution
        priority: 5,
        workingDirectory: rootPath,
      },

      // Markdown linting
      {
        name: "markdownlint",
        enabled: true,
        command: "npx",
        args: ["markdownlint", "--format", "json"],
        patterns: ["**/*.md"],
        excludePatterns: ["**/node_modules/**", "**/dist/**"],
        maxFileSize: 512 * 1024, // 512KB
        timeout: 15000,
        parallel: true,
        priority: 3,
        workingDirectory: rootPath,
      },

      // Shell script linting
      {
        name: "shellcheck",
        enabled: true,
        command: "shellcheck",
        args: ["-f", "json"],
        patterns: ["**/*.sh", "**/*.bash"],
        excludePatterns: ["**/node_modules/**"],
        maxFileSize: 256 * 1024, // 256KB
        timeout: 15000,
        parallel: true,
        priority: 3,
        workingDirectory: rootPath,
      },
    ],

    includePatterns: [
      "packages/**/*",
      "backend/**/*",
      "services/**/*",
      "examples/**/*",
      "templates/**/*",
      "docs/**/*",
      "scripts/**/*",
    ],

    excludePatterns: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/htmlcov/**",
      "**/__pycache__/**",
      "**/.pytest_cache/**",
      "**/.mypy_cache/**",
      "**/venv/**",
      "**/.venv/**",
      "**/third_party/**",
      "**/.git/**",
      "**/logs/**",
      "**/tmp/**",
      "**/temp/**",
    ],

    debounceDelay: 1000, // 1 second debounce
    maxConcurrency: 4, // Limit concurrent linters
    incremental: true,
    cacheDir: join(rootPath, ".cache", "incremental-linting"),
    persistCache: true,
    maxCacheAge: 24 * 60 * 60 * 1000, // 24 hours
    autoFix: false, // Disabled by default for safety
    lintOnSave: true,
    lintOnChange: false, // Only lint on save to reduce noise
    outputFormat: "vscode",
    verbose: false,
  };
}

/**
 * Load configuration from file
 */
export async function loadConfig(configPath: string): Promise<IncrementalLintingConfig> {
  try {
    const data = await readFile(configPath, "utf-8");
    return JSON.parse(data) as IncrementalLintingConfig;
  } catch (error) {
    // If file doesn't exist or is invalid, return default config
    if (error instanceof Error && error.message.includes("ENOENT")) {
      return createDefaultConfig("/");
    }
    // For other errors (like invalid JSON), also return default config
    return createDefaultConfig("/");
  }
}

/**
 * Save configuration to file
 */
export async function saveConfig(config: IncrementalLintingConfig, configPath: string): Promise<void> {
  try {
    await mkdir(dirname(configPath), { recursive: true });
    await writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    throw new Error(`Failed to save configuration to ${configPath}: ${error}`);
  }
}

/**
 * Validate configuration
 */
export function validateConfig(config: IncrementalLintingConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.rootPath) {
    errors.push("rootPath is required");
  }

  if (!config.linters || config.linters.length === 0) {
    errors.push("At least one linter must be configured");
  }

  for (const linter of config.linters) {
    if (!linter.name) {
      errors.push("Linter name is required");
    }
    if (!linter.command) {
      errors.push(`Linter ${linter.name} command is required`);
    }
    if (!linter.patterns || linter.patterns.length === 0) {
      errors.push(`Linter ${linter.name} must have at least one pattern`);
    }
  }

  if (config.maxConcurrency < 1) {
    errors.push("maxConcurrency must be at least 1");
  }

  if (config.debounceDelay < 0) {
    errors.push("debounceDelay must be non-negative");
  }

  if (!config.includePatterns || config.includePatterns.length === 0) {
    errors.push("At least one include pattern must be specified");
  }

  if (!config.excludePatterns || config.excludePatterns.length === 0) {
    errors.push("At least one exclude pattern must be specified");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
