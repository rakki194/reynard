/**
 * 🦊 Service Directory Builders
 * =============================
 *
 * Service directory builder functions for creating service-related directory definitions
 * in the Reynard project architecture. Provides builders for services, data, and media packages.
 */

import type { DirectoryDefinition } from "../types.js";
import { createDirectoryDefinition } from "./directory-builders-core.js";

/**
 * Create a service package directory definition
 */
export function createServicePackage(
  name: string,
  path: string,
  description: string,
  options: Partial<DirectoryDefinition> = {}
): DirectoryDefinition {
  return createDirectoryDefinition(
    name,
    path,
    "services",
    "important",
    ["typescript", "javascript", "json", "markdown"],
    description,
    {
      categories: ["services", "source", "backend"],
      relationships: [
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
        { directory: "packages/core/http-client", type: "dependency", description: "Uses HTTP client" },
        { directory: "packages/core/i18n", type: "dependency", description: "Uses internationalization" },
      ],
      ...options,
    }
  );
}

/**
 * Create a data package directory definition
 */
export function createDataPackage(
  name: string,
  path: string,
  description: string,
  options: Partial<DirectoryDefinition> = {}
): DirectoryDefinition {
  return createDirectoryDefinition(
    name,
    path,
    "data",
    "important",
    ["typescript", "javascript", "json", "markdown"],
    description,
    {
      categories: ["data", "source", "backend"],
      relationships: [
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
        { directory: "packages/data/repository-core", type: "dependency", description: "Uses repository system" },
      ],
      ...options,
    }
  );
}

/**
 * Create a media package directory definition
 */
export function createMediaPackage(
  name: string,
  path: string,
  description: string,
  options: Partial<DirectoryDefinition> = {}
): DirectoryDefinition {
  return createDirectoryDefinition(
    name,
    path,
    "media",
    "important",
    ["typescript", "javascript", "json", "markdown"],
    description,
    {
      categories: ["media", "source", "ui"],
      relationships: [
        { directory: "packages/core/core", type: "dependency", description: "Uses core utilities" },
        { directory: "packages/media/image", type: "dependency", description: "Uses image processing" },
      ],
      ...options,
    }
  );
}
