/**
 * @fileoverview Project Root Utility for Node.js/TypeScript
 *
 * 🦊 *whiskers twitch with precision* Centralized utility for determining
 * the Reynard project root directory across all Node.js/TypeScript configurations.
 *
 * @author Strategic-Fox-42 (Reynard Fox Specialist)
 * @since 1.0.0
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

/**
 * Find the project root by looking for package.json with "reynard" in the name
 * @param startDir - Directory to start searching from
 * @returns Project root path or null if not found
 */
function findProjectRoot(startDir: string): string | null {
  let currentDir = startDir;
  while (currentDir !== "/") {
    const packageJsonPath = join(currentDir, "package.json");
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
        if (packageJson.name === "reynard") {
          return currentDir;
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
    }
    currentDir = join(currentDir, "..");
  }
  return null;
}

/**
 * Get the Reynard project root directory
 * @returns Project root path
 */
export function getProjectRoot(): string {
  return PROJECT_ROOT;
}

/**
 * Get a path relative to the project root
 * @param relativePath - Path relative to project root
 * @returns Absolute path
 */
export function getProjectPath(relativePath: string): string {
  return join(PROJECT_ROOT, relativePath);
}

/**
 * Get the backend directory path
 * @returns Backend directory path
 */
export function getBackendDir(): string {
  return BACKEND_DIR;
}

/**
 * Get the E2E directory path
 * @returns E2E directory path
 */
export function getE2EDir(): string {
  return E2E_DIR;
}

/**
 * Get the examples directory path
 * @returns Examples directory path
 */
export function getExamplesDir(): string {
  return EXAMPLES_DIR;
}

/**
 * Get the packages directory path
 * @returns Packages directory path
 */
export function getPackagesDir(): string {
  return PACKAGES_DIR;
}

/**
 * Get a specific package path
 * @param packageName - Name of the package
 * @returns Package path
 */
export function getPackagePath(packageName: string): string {
  return join(PACKAGES_DIR, packageName);
}

/**
 * Get a specific example app path
 * @param appName - Name of the example app
 * @returns Example app path
 */
export function getExampleAppPath(appName: string): string {
  return join(EXAMPLES_DIR, appName);
}

// Determine project root
export const PROJECT_ROOT =
  process.env.REYNARD_PROJECT_ROOT || findProjectRoot(process.cwd()) || join(process.cwd(), "../../../..");

// Export common paths
export const BACKEND_DIR = join(PROJECT_ROOT, "backend");
export const E2E_DIR = join(PROJECT_ROOT, "e2e");
export const EXAMPLES_DIR = join(PROJECT_ROOT, "examples");
export const PACKAGES_DIR = join(PROJECT_ROOT, "packages");

// If this module is executed directly, print project info
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("🦊 Reynard Project Root Information:");
  console.log(`  Project Root: ${PROJECT_ROOT}`);
  console.log(`  Backend Dir:  ${BACKEND_DIR}`);
  console.log(`  E2E Dir:      ${E2E_DIR}`);
  console.log(`  Examples Dir: ${EXAMPLES_DIR}`);
  console.log(`  Packages Dir: ${PACKAGES_DIR}`);
}
