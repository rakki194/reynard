/**
 * 🦊 Data Package Definitions
 * ===========================
 *
 * Data package directory definitions for the Reynard project architecture.
 * Contains packages for data processing, repositories, file handling, and storage.
 */

import type { DirectoryDefinition } from "../types.js";
import { createDataPackage } from "../builders/directory-builder.js";
import { buildRelationships, COMMON_RELATIONSHIPS } from "../builders/relationship-builder.js";
import { DATA_METADATA } from "../config/metadata.js";

/**
 * Data packages directory definitions
 */
export const DATA_PACKAGES: DirectoryDefinition[] = [
  createDataPackage(
    "packages/data/repository-core",
    "packages/data/repository-core",
    "Repository core system - provides data persistence, 3D data handling, chart data management, and unified repository abstraction layer",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/ai/rag", type: "dependency", description: "Used by RAG system" },
        { directory: "packages/data/unified-repository", type: "dependency", description: "Used by unified repository" }
      ),
      metadata: DATA_METADATA,
    }
  ),

  createDataPackage(
    "packages/data/repository-multimodal",
    "packages/data/repository-multimodal",
    "Multimodal data repository for complex data types - provides repository capabilities for handling complex multimodal data including images, videos, audio, and text combinations",
    {
      relationships: buildRelationships(
        { directory: "packages/data/repository-core", type: "dependency", description: "Uses core repository system" },
        { directory: "packages/ai/multimodal", type: "dependency", description: "Used by multimodal AI" }
      ),
      metadata: DATA_METADATA,
    }
  ),

  createDataPackage(
    "packages/data/repository-search",
    "packages/data/repository-search",
    "Search and indexing capabilities for data repositories - provides search functionality, indexing, query processing, and search optimization for repository data",
    {
      relationships: buildRelationships(
        { directory: "packages/data/repository-core", type: "dependency", description: "Uses core repository system" },
        { directory: "packages/ai/rag", type: "dependency", description: "Used by RAG system" }
      ),
      metadata: DATA_METADATA,
    }
  ),

  createDataPackage(
    "packages/data/repository-storage",
    "packages/data/repository-storage",
    "Storage abstraction layer and data persistence - provides storage abstraction, data persistence, caching, and storage optimization for repository systems",
    {
      relationships: buildRelationships(
        { directory: "packages/data/repository-core", type: "dependency", description: "Uses core repository system" },
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY
      ),
      metadata: DATA_METADATA,
    }
  ),

  createDataPackage(
    "packages/data/scraping",
    "packages/data/scraping",
    "Web scraping utilities and data extraction tools - provides web scraping capabilities, data extraction, content parsing, and web data collection utilities",
    {
      relationships: buildRelationships(COMMON_RELATIONSHIPS.CORE_DEPENDENCY, {
        directory: "packages/ai/nlweb",
        type: "dependency",
        description: "Used by natural language web processing",
      }),
      metadata: DATA_METADATA,
    }
  ),

  createDataPackage(
    "packages/data/unified-repository",
    "packages/data/unified-repository",
    "Unified repository abstraction layer - provides unified interface for all repository types, abstracting differences between storage systems and data types",
    {
      relationships: buildRelationships(
        { directory: "packages/data/repository-core", type: "dependency", description: "Uses core repository system" },
        {
          directory: "packages/data/repository-multimodal",
          type: "dependency",
          description: "Uses multimodal repository",
        },
        { directory: "packages/data/repository-search", type: "dependency", description: "Uses search repository" },
        { directory: "packages/data/repository-storage", type: "dependency", description: "Uses storage repository" }
      ),
      metadata: DATA_METADATA,
    }
  ),

  createDataPackage(
    "packages/data/file-processing",
    "packages/data/file-processing",
    "File processing and management - provides file upload, conversion, metadata extraction, format detection, and file manipulation utilities",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/media/image", type: "dependency", description: "Used by image processing" },
        { directory: "packages/data/repository-core", type: "dependency", description: "Used by repository system" }
      ),
      metadata: DATA_METADATA,
    }
  ),
];
