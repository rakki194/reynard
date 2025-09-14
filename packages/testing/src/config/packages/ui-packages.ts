/**
 * UI Package Configurations
 * Configuration for UI-focused packages that require i18n testing
 */

import type { PackageI18nConfig } from "../types.js";
import { createIgnorePatterns } from "../ignore-patterns.js";

export const uiPackages: PackageI18nConfig[] = [
  {
    name: "components",
    path: "packages/components",
    enabled: true,
    ignorePatterns: createIgnorePatterns(),
    failOnHardcodedStrings: true,
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["components", "common"],
  },
  {
    name: "ui",
    path: "packages/ui",
    enabled: true,
    ignorePatterns: createIgnorePatterns(),
    failOnHardcodedStrings: true,
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["ui", "common"],
  },
  {
    name: "floating-panel",
    path: "packages/floating-panel",
    enabled: true,
    ignorePatterns: createIgnorePatterns("floatingPanel"),
    failOnHardcodedStrings: true,
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["floating-panel", "common"],
  },
  {
    name: "themes",
    path: "packages/themes",
    enabled: true,
    ignorePatterns: createIgnorePatterns("themes"),
    failOnHardcodedStrings: true,
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["themes", "common"],
  },
];
