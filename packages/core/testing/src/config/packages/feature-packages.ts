/**
 * Feature Package Configurations
 * Configuration for feature-specific packages that require i18n testing
 */

import type { PackageI18nConfig } from "../types.js";
import { createIgnorePatterns } from "../ignore-patterns.js";

export const featurePackages: PackageI18nConfig[] = [
  {
    name: "auth",
    path: "packages/auth",
    enabled: true,
    ignorePatterns: createIgnorePatterns("auth"),
    failOnHardcodedStrings: false, // Temporarily disabled for CI
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["auth", "common"],
  },
  {
    name: "chat",
    path: "packages/chat",
    enabled: true,
    ignorePatterns: createIgnorePatterns("chat"),
    failOnHardcodedStrings: false, // Temporarily disabled for CI
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["chat", "common"],
  },
  {
    name: "gallery",
    path: "packages/gallery",
    enabled: true,
    ignorePatterns: createIgnorePatterns("gallery"),
    failOnHardcodedStrings: false, // Temporarily disabled for CI
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["gallery", "common"],
  },
  {
    name: "settings",
    path: "packages/settings",
    enabled: true,
    ignorePatterns: createIgnorePatterns("settings"),
    failOnHardcodedStrings: false, // Temporarily disabled for CI
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["settings", "common"],
  },
  {
    name: "rag",
    path: "packages/rag",
    enabled: true,
    ignorePatterns: createIgnorePatterns("rag"),
    failOnHardcodedStrings: false, // Temporarily disabled for CI
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["rag", "common"],
  },
];
