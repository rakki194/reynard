/**
 * 🦊 Core Package Definitions
 * ===========================
 *
 * Core package directory definitions for the Reynard project architecture.
 * Contains fundamental packages that provide base functionality for the entire ecosystem.
 */

import type { DirectoryDefinition } from "../types.js";
import { createCorePackage } from "../builders/directory-builder.js";
import { buildRelationships, COMMON_RELATIONSHIPS } from "../builders/relationship-builder.js";
import { CORE_METADATA } from "../config/metadata.js";

/**
 * Core packages directory definitions
 */
export const CORE_PACKAGES: DirectoryDefinition[] = [
  createCorePackage(
    "packages/core/core",
    "packages/core/core",
    "Core utilities and modules for Reynard framework - provides base classes, utilities, security, image processing, and fundamental framework capabilities",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.VALIDATION_DEPENDENCY,
        { directory: "packages/ui/components-core", type: "dependency", description: "Used by UI components" },
        { directory: "packages/ai/ai-shared", type: "dependency", description: "Used by AI packages" }
      ),
      metadata: CORE_METADATA,
    }
  ),

  createCorePackage(
    "packages/core/testing",
    "packages/core/testing",
    "Testing utilities and shared test infrastructure - provides test helpers, mocks, utilities, and testing patterns used across all Reynard packages",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.VALIDATION_DEPENDENCY
      ),
      metadata: CORE_METADATA,
    }
  ),

  createCorePackage(
    "packages/core/http-client",
    "packages/core/http-client",
    "HTTP client with middleware support - provides robust HTTP client functionality with retry logic, circuit breaker patterns, and middleware support for authentication and error handling",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.VALIDATION_DEPENDENCY
      ),
      metadata: CORE_METADATA,
    }
  ),


  createCorePackage(
    "packages/core/composables",
    "packages/core/composables",
    "Reusable logic and state management - provides composable functions, state management utilities, and reusable logic patterns for consistent application behavior",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.VALIDATION_DEPENDENCY
      ),
      metadata: CORE_METADATA,
    }
  ),

  createCorePackage(
    "packages/core/config",
    "packages/core/config",
    "Environment configuration and settings management - provides configuration utilities, environment management, and settings validation for application configuration",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.VALIDATION_DEPENDENCY
      ),
      metadata: CORE_METADATA,
    }
  ),

  createCorePackage(
    "packages/core/connection",
    "packages/core/connection",
    "Connection utilities and validation - provides connection management utilities, validation, and WebSocket functionality (HTTP client functionality moved to http-client package)",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.VALIDATION_DEPENDENCY,
        COMMON_RELATIONSHIPS.HTTP_CLIENT_DEPENDENCY,
        { directory: "packages/services/api-client", type: "dependency", description: "Used by API client" }
      ),
      metadata: CORE_METADATA,
    }
  ),

  createCorePackage(
    "packages/core/features",
    "packages/core/features",
    "Feature flags and conditional functionality - provides feature flag management, conditional feature activation, and feature toggling capabilities",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/core/config", type: "dependency", description: "Uses configuration utilities" }
      ),
      metadata: CORE_METADATA,
    }
  ),

  createCorePackage(
    "packages/core/i18n",
    "packages/core/i18n",
    "Internationalization and localization - provides multi-language support, translation management, and localization utilities for global applications",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/core/config", type: "dependency", description: "Uses configuration utilities" }
      ),
      metadata: CORE_METADATA,
    }
  ),

  createCorePackage(
    "packages/core/settings",
    "packages/core/settings",
    "User preferences and application settings - provides user settings management, preferences storage, and application configuration management",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/core/config", type: "dependency", description: "Uses configuration utilities" },
        COMMON_RELATIONSHIPS.VALIDATION_DEPENDENCY
      ),
      metadata: CORE_METADATA,
    }
  ),

  createCorePackage(
    "packages/core/validation",
    "packages/core/validation",
    "Data validation utilities and schemas - provides validation frameworks, schema validation, data validation utilities, and type checking capabilities",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY
      ),
      metadata: CORE_METADATA,
    }
  ),
];
