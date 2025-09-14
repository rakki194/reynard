/**
 * Media Package Configurations
 * Configuration for media and visualization packages that require i18n testing
 */

import type { PackageI18nConfig } from "../types.js";
import { createIgnorePatterns } from "../ignore-patterns.js";

export const mediaPackages: PackageI18nConfig[] = [
  {
    name: "charts",
    path: "packages/charts",
    enabled: true,
    ignorePatterns: createIgnorePatterns("charts"),
    failOnHardcodedStrings: true,
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["charts", "common"],
  },
  {
    name: "caption",
    path: "packages/caption",
    enabled: true,
    ignorePatterns: createIgnorePatterns("caption"),
    failOnHardcodedStrings: true,
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["caption", "common"],
  },
  {
    name: "boundingbox",
    path: "packages/boundingbox",
    enabled: true,
    ignorePatterns: createIgnorePatterns("boundingBox"),
    failOnHardcodedStrings: true,
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["boundingbox", "common"],
  },
  {
    name: "audio",
    path: "packages/audio",
    enabled: true,
    ignorePatterns: createIgnorePatterns("audio"),
    failOnHardcodedStrings: true,
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["audio", "common"],
  },
  {
    name: "video",
    path: "packages/video",
    enabled: true,
    ignorePatterns: createIgnorePatterns("video"),
    failOnHardcodedStrings: true,
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["video", "common"],
  },
  {
    name: "image",
    path: "packages/image",
    enabled: true,
    ignorePatterns: createIgnorePatterns("image"),
    failOnHardcodedStrings: true,
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["image", "common"],
  },
  {
    name: "multimodal",
    path: "packages/multimodal",
    enabled: true,
    ignorePatterns: createIgnorePatterns("multimodal"),
    failOnHardcodedStrings: true,
    validateCompleteness: true,
    testRTL: true,
    namespaces: ["multimodal", "common"],
  },
];
