/**
 * Specialized Package Configurations
 * Configuration for specialized packages that require i18n testing
 */

import type { PackageI18nConfig } from "../types.js";
import { createIgnorePatterns } from "../ignore-patterns.js";

export const specializedPackages: PackageI18nConfig[] = [
  {
    name: "monaco",
    path: "packages/monaco",
    enabled: true,
    ignorePatterns: createIgnorePatterns("monaco"),
    failOnHardcodedStrings: true,
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["monaco", "common"],
  },
  {
    name: "3d",
    path: "packages/3d",
    enabled: true,
    ignorePatterns: createIgnorePatterns("threeD"),
    failOnHardcodedStrings: true,
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["3d", "common"],
  },
  {
    name: "games",
    path: "packages/games",
    enabled: true,
    ignorePatterns: createIgnorePatterns("games"),
    failOnHardcodedStrings: true,
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["games", "common"],
  },
  {
    name: "i18n",
    path: "packages/i18n",
    enabled: true,
    ignorePatterns: createIgnorePatterns("i18n"),
    failOnHardcodedStrings: true,
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["i18n", "common"],
  },
  {
    name: "core",
    path: "packages/core",
    enabled: true,
    ignorePatterns: createIgnorePatterns("core"),
    failOnHardcodedStrings: true,
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["core", "common"],
  },
];
