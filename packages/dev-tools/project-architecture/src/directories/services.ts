/**
 * 🦊 Service Package Definitions
 * ==============================
 *
 * Service package directory definitions for the Reynard project architecture.
 * Contains packages for authentication, API clients, chat, email, and service management.
 */

import type { DirectoryDefinition } from "../types.js";
import { createServicePackage } from "../builders/directory-builder.js";
import { buildRelationships, COMMON_RELATIONSHIPS } from "../builders/relationship-builder.js";
import { SERVICE_METADATA } from "../config/metadata.js";

/**
 * Service packages directory definitions
 */
export const SERVICE_PACKAGES: DirectoryDefinition[] = [
  createServicePackage(
    "packages/services/auth",
    "packages/services/auth",
    "Authentication and authorization services - unified interface that re-exports from modular auth packages (auth-core, auth-composables, http-client) providing backward compatibility and simplified integration",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.VALIDATION_DEPENDENCY,
        COMMON_RELATIONSHIPS.HTTP_CLIENT_DEPENDENCY,
        { directory: "packages/core/auth-core", type: "dependency", description: "Uses auth core functionality" },
        { directory: "packages/core/auth-composables", type: "dependency", description: "Uses auth composables" },
        COMMON_RELATIONSHIPS.API_CLIENT_DEPENDENCY
      ),
      metadata: SERVICE_METADATA,
    }
  ),

  createServicePackage(
    "packages/services/chat",
    "packages/services/chat",
    "Chat functionality and real-time communication - provides chat services, real-time messaging, communication protocols, and chat management",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/core/connection", type: "dependency", description: "Uses connection utilities" },
        COMMON_RELATIONSHIPS.API_CLIENT_DEPENDENCY
      ),
      metadata: SERVICE_METADATA,
    }
  ),

  createServicePackage(
    "packages/services/email",
    "packages/services/email",
    "Email services and communication utilities - provides email sending, email processing, email templates, and email communication services",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/core/connection", type: "dependency", description: "Uses connection utilities" },
        COMMON_RELATIONSHIPS.API_CLIENT_DEPENDENCY
      ),
      metadata: SERVICE_METADATA,
    }
  ),

  createServicePackage(
    "packages/services/service-manager",
    "packages/services/service-manager",
    "Service orchestration and management utilities - provides service management, orchestration, service discovery, and service coordination capabilities",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/core/connection", type: "dependency", description: "Uses connection utilities" },
        COMMON_RELATIONSHIPS.API_CLIENT_DEPENDENCY
      ),
      metadata: SERVICE_METADATA,
    }
  ),

  createServicePackage(
    "packages/services/api-client",
    "packages/services/api-client",
    "API client utilities - provides HTTP client, request/response handling, authentication, error handling, and API communication utilities",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/core/connection", type: "dependency", description: "Uses connection utilities" },
        COMMON_RELATIONSHIPS.AUTH_DEPENDENCY
      ),
      metadata: SERVICE_METADATA,
    }
  ),
];
