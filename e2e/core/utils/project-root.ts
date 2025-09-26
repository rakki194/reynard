/**
 * @fileoverview Project Root Utility for E2E Testing
 *
 * 🦊 *whiskers twitch with organizational precision* Centralized utility for
 * determining the Reynard project root directory across all E2E test configurations.
 *
 * @author Strategic-Fox-42 (Reynard Fox Specialist)
 * @since 1.0.0
 */

import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 🦊 Get the Reynard project root directory
 *
 * This function determines the project root by:
 * 1. Looking for environment variable REYNARD_PROJECT_ROOT
 * 2. Walking up from current file location to find package.json with "reynard" in name
 * 3. Falling back to a reasonable default
 *
 * @returns The absolute path to the Reynard project root
 */
export function getProjectRoot(): string {
  // Check environment variable first
  if (process.env.REYNARD_PROJECT_ROOT) {
    const envRoot = process.env.REYNARD_PROJECT_ROOT;
    if (existsSync(envRoot)) {
      return envRoot;
    }
  }

  // Walk up from current file location to find project root
  let currentDir = __dirname;

  // Go up from e2e/core/utils to find project root
  // e2e/core/utils -> e2e/core -> e2e -> project root
  for (let i = 0; i < 3; i++) {
    currentDir = dirname(currentDir);

    // Check if this directory contains a package.json with "reynard" in the name
    const packageJsonPath = join(currentDir, "package.json");
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = require(packageJsonPath);
        if (packageJson.name && packageJson.name.toLowerCase().includes("reynard")) {
          return currentDir;
        }
      } catch (error) {
        // Continue searching if package.json is invalid
        continue;
      }
    }
  }

  // Fallback: assume we're in the project structure and go up 3 levels
  // from e2e/core/utils to project root
  const fallbackRoot = dirname(dirname(dirname(__dirname)));

  if (existsSync(fallbackRoot)) {
    return fallbackRoot;
  }

  // Last resort: use current working directory
  return process.cwd();
}

/**
 * 🦊 Get a path relative to the project root
 *
 * @param relativePath - Path relative to project root
 * @returns Absolute path
 */
export function getProjectPath(relativePath: string): string {
  return join(getProjectRoot(), relativePath);
}

/**
 * 🦊 Get the E2E directory path
 *
 * @returns Absolute path to the E2E directory
 */
export function getE2EDir(): string {
  return getProjectPath("e2e");
}

/**
 * 🦊 Get the backend directory path
 *
 * @returns Absolute path to the backend directory
 */
export function getBackendDir(): string {
  return getProjectPath("backend");
}

/**
 * 🦊 Get the examples directory path
 *
 * @returns Absolute path to the examples directory
 */
export function getExamplesDir(): string {
  return getProjectPath("examples");
}

/**
 * 🦊 Get a specific example app path
 *
 * @param appName - Name of the example app
 * @returns Absolute path to the example app
 */
export function getExampleAppPath(appName: string): string {
  return getProjectPath(join("examples", appName));
}

// Export the project root as a constant for convenience
export const PROJECT_ROOT = getProjectRoot();
export const E2E_DIR = getE2EDir();
export const BACKEND_DIR = getBackendDir();
export const EXAMPLES_DIR = getExamplesDir();
