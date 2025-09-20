/**
 * Core Features
 *
 * Core feature definitions for typical applications.
 */

import type { FeatureDefinition } from "../core/types.js";

export const CORE_FEATURES: FeatureDefinition[] = [
  {
    id: "file-management",
    name: "File Management",
    description: "Manage and organize files in the system",
    dependencies: [{ services: ["FileProcessingService"], required: true }],
    category: "core",
    priority: "critical",
    tags: ["storage", "filesystem"],
    icon: "folder",
  },
  {
    id: "user-authentication",
    name: "User Authentication",
    description: "User login, logout, and session management",
    dependencies: [{ services: ["AuthService"], required: true }],
    category: "core",
    priority: "critical",
    tags: ["security", "auth"],
    icon: "user",
  },
  {
    id: "data-persistence",
    name: "Data Persistence",
    description: "Store and retrieve data from databases",
    dependencies: [{ services: ["DatabaseService"], required: true }],
    category: "core",
    priority: "critical",
    tags: ["database", "storage"],
    icon: "database",
  },
  {
    id: "api-gateway",
    name: "API Gateway",
    description: "Centralized API management and routing",
    dependencies: [{ services: ["GatewayService"], required: true }],
    category: "core",
    priority: "critical",
    tags: ["api", "gateway"],
    icon: "gateway",
  },
  {
    id: "logging",
    name: "Logging",
    description: "Application logging and monitoring",
    dependencies: [{ services: ["LoggingService"], required: true }],
    category: "core",
    priority: "high",
    tags: ["logging", "monitoring"],
    icon: "log",
  },
  {
    id: "error-handling",
    name: "Error Handling",
    description: "Global error handling and reporting",
    dependencies: [{ services: ["ErrorService"], required: true }],
    category: "core",
    priority: "high",
    tags: ["error", "handling"],
    icon: "error",
  },
  {
    id: "configuration",
    name: "Configuration",
    description: "Application configuration management",
    dependencies: [{ services: ["ConfigService"], required: true }],
    category: "core",
    priority: "high",
    tags: ["config", "settings"],
    icon: "settings",
  },
  {
    id: "caching",
    name: "Caching",
    description: "Data caching for improved performance",
    dependencies: [{ services: ["CacheService"], required: true }],
    category: "core",
    priority: "medium",
    tags: ["cache", "performance"],
    icon: "cache",
  },
];
