/**
 * i18n Testing Configuration Utilities
 * Helper functions for working with i18n testing configuration
 */

import type { PackageI18nConfig } from "./types.js";
import { defaultI18nTestingConfig } from "./main-config.js";
import { resolve } from "path";

/**
 * Get configuration for a specific package
 */
export function getPackageI18nConfig(packageName: string): PackageI18nConfig | undefined {
  const pkg = defaultI18nTestingConfig.packages.find(pkg => pkg.name === packageName);
  if (pkg) {
    return {
      ...pkg,
      path: resolvePackagePath(pkg.path),
    };
  }
  return undefined;
}

/**
 * Get all enabled packages for i18n testing
 */
export function getEnabledPackages(): PackageI18nConfig[] {
  return defaultI18nTestingConfig.packages
    .filter(pkg => pkg.enabled)
    .map(pkg => ({
      ...pkg,
      path: resolvePackagePath(pkg.path),
    }));
}

/**
 * Get all package paths for i18n testing
 */
export function getEnabledPackagePaths(): string[] {
  return getEnabledPackages().map(pkg => pkg.path);
}

/**
 * Resolve package path relative to the Reynard root directory
 */
function resolvePackagePath(relativePath: string): string {
  const currentDir = process.cwd();
  console.log(`🔍 Resolving path for: ${relativePath}`);
  console.log(`🔍 Current directory: ${currentDir}`);
  
  // Try to find the Reynard root directory by looking for package.json with "reynard" in name
  let searchDir = currentDir;
  let rootDir = currentDir;

  // Walk up the directory tree to find the root
  while (searchDir !== "/") {
    try {
      const packageJsonPath = resolve(searchDir, "package.json");
      const fs = require("fs");
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        // Look for the main Reynard package.json (not the testing package)
        if (packageJson.name && packageJson.name === "reynard") {
          rootDir = searchDir;
          break;
        }
      }
    } catch (error) {
      // Continue searching
    }
    searchDir = resolve(searchDir, "..");
  }

  const result = resolve(rootDir, relativePath);
  console.log(`🔍 Found root: ${rootDir}, result: ${result}`);
  return result;
}

/**
 * Get all namespaces used across packages
 */
export function getAllNamespaces(): string[] {
  const namespaces = new Set<string>();
  getEnabledPackages().forEach(pkg => {
    pkg.namespaces.forEach(ns => namespaces.add(ns));
  });
  return Array.from(namespaces);
}
