/**
 * Feature Package Configurations
 * Configuration for feature-specific packages that require i18n testing
 */
import { createIgnorePatterns } from "../ignore-patterns.js";
export const featurePackages = [
    {
        name: "auth",
        path: "packages/auth",
        enabled: true,
        ignorePatterns: createIgnorePatterns("auth"),
        failOnHardcodedStrings: true,
        validateCompleteness: true,
        testRTL: true,
        namespaces: ["auth", "common"],
    },
    {
        name: "chat",
        path: "packages/chat",
        enabled: true,
        ignorePatterns: createIgnorePatterns("chat"),
        failOnHardcodedStrings: true,
        validateCompleteness: true,
        testRTL: true,
        namespaces: ["chat", "common"],
    },
    {
        name: "gallery",
        path: "packages/gallery",
        enabled: true,
        ignorePatterns: createIgnorePatterns("gallery"),
        failOnHardcodedStrings: true,
        validateCompleteness: true,
        testRTL: true,
        namespaces: ["gallery", "common"],
    },
    {
        name: "settings",
        path: "packages/settings",
        enabled: true,
        ignorePatterns: createIgnorePatterns("settings"),
        failOnHardcodedStrings: true,
        validateCompleteness: true,
        testRTL: true,
        namespaces: ["settings", "common"],
    },
    {
        name: "rag",
        path: "packages/rag",
        enabled: true,
        ignorePatterns: createIgnorePatterns("rag"),
        failOnHardcodedStrings: true,
        validateCompleteness: true,
        testRTL: true,
        namespaces: ["rag", "common"],
    },
];
