/**
 * 🦊 AI Package Definitions
 * =========================
 *
 * AI and machine learning package directory definitions for the Reynard project architecture.
 * Contains packages for AI/ML functionality, annotation tools, caption systems, and related utilities.
 */

import type { DirectoryDefinition } from "../types.js";
import { createAIPackage } from "../builders/directory-builder.js";
import { buildRelationships, COMMON_RELATIONSHIPS } from "../builders/relationship-builder.js";
import { AI_METADATA } from "../config/metadata.js";

/**
 * AI packages directory definitions
 */
export const AI_PACKAGES: DirectoryDefinition[] = [
  createAIPackage(
    "packages/ai/ai-shared",
    "packages/ai/ai-shared",
    "Shared AI/ML utilities and base classes - provides common interfaces, types, and utilities for all AI/ML packages in the Reynard ecosystem",
    {
      importance: "critical",
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/ai/annotating-core", type: "dependency", description: "Used by annotation tools" },
        { directory: "packages/ai/caption-core", type: "dependency", description: "Used by caption systems" }
      ),
      metadata: AI_METADATA,
    }
  ),

  createAIPackage(
    "packages/ai/rag",
    "packages/ai/rag",
    "Retrieval-Augmented Generation (RAG) system - provides semantic search, vector embeddings, and document indexing capabilities for AI applications",
    {
      importance: "critical",
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.REPOSITORY_CORE_DEPENDENCY
      ),
      metadata: AI_METADATA,
    }
  ),

  createAIPackage(
    "packages/ai/annotating-core",
    "packages/ai/annotating-core",
    "Core annotation system - provides base annotation functionality, data structures, and interfaces for image and document annotation tools",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
        { directory: "packages/ai/annotating-florence2", type: "dependency", description: "Used by Florence2 annotator" },
        { directory: "packages/ai/annotating-joy", type: "dependency", description: "Used by Joy annotator" }
      ),
      metadata: AI_METADATA,
    }
  ),

  createAIPackage(
    "packages/ai/annotating-florence2",
    "packages/ai/annotating-florence2",
    "Florence2 model integration for image annotation - provides specialized annotation capabilities using Microsoft's Florence2 vision-language model for detailed image understanding and annotation",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
        { directory: "packages/ai/annotating-core", type: "dependency", description: "Uses core annotation system" }
      ),
      metadata: AI_METADATA,
    }
  ),

  createAIPackage(
    "packages/ai/annotating-joy",
    "packages/ai/annotating-joy",
    "Joy model integration for document annotation - provides document annotation capabilities using the Joy model for text and document understanding and annotation",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
        { directory: "packages/ai/annotating-core", type: "dependency", description: "Uses core annotation system" }
      ),
      metadata: AI_METADATA,
    }
  ),

  createAIPackage(
    "packages/ai/annotating-jtp2",
    "packages/ai/annotating-jtp2",
    "JTP2 model integration for specialized annotation tasks - provides specialized annotation capabilities using the JTP2 model for advanced annotation workflows",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
        { directory: "packages/ai/annotating-core", type: "dependency", description: "Uses core annotation system" }
      ),
      metadata: AI_METADATA,
    }
  ),

  createAIPackage(
    "packages/ai/annotating-ui",
    "packages/ai/annotating-ui",
    "User interface components for annotation tools - provides UI components, interfaces, and user experience elements for all annotation tools and workflows",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
        { directory: "packages/ai/annotating-core", type: "dependency", description: "Uses core annotation system" },
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY
      ),
      metadata: AI_METADATA,
    }
  ),

  createAIPackage(
    "packages/ai/annotating-wdv3",
    "packages/ai/annotating-wdv3",
    "WDV3 model integration for advanced annotation workflows - provides advanced annotation capabilities using the WDV3 model for complex annotation tasks and workflows",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
        { directory: "packages/ai/annotating-core", type: "dependency", description: "Uses core annotation system" }
      ),
      metadata: AI_METADATA,
    }
  ),

  createAIPackage(
    "packages/ai/caption",
    "packages/ai/caption",
    "Main caption generation package - provides unified caption generation capabilities, combining core functionality with multimodal and UI components",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
        { directory: "packages/ai/caption-core", type: "dependency", description: "Uses core caption system" },
        { directory: "packages/ai/caption-multimodal", type: "dependency", description: "Uses multimodal captions" },
        { directory: "packages/ai/caption-ui", type: "dependency", description: "Uses caption UI" }
      ),
      metadata: AI_METADATA,
    }
  ),

  createAIPackage(
    "packages/ai/caption-core",
    "packages/ai/caption-core",
    "Core caption generation system - provides base caption functionality, models, and interfaces for image and video caption generation",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
        { directory: "packages/ai/caption-multimodal", type: "dependency", description: "Used by multimodal captions" },
        { directory: "packages/ai/caption-ui", type: "dependency", description: "Used by caption UI" }
      ),
      metadata: AI_METADATA,
    }
  ),

  createAIPackage(
    "packages/ai/caption-multimodal",
    "packages/ai/caption-multimodal",
    "Multimodal caption generation for images and videos - provides caption generation capabilities that work across multiple media types including images, videos, and audio",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
        { directory: "packages/ai/caption-core", type: "dependency", description: "Uses core caption system" },
        COMMON_RELATIONSHIPS.IMAGE_DEPENDENCY,
        COMMON_RELATIONSHIPS.VIDEO_DEPENDENCY
      ),
      metadata: AI_METADATA,
    }
  ),

  createAIPackage(
    "packages/ai/caption-ui",
    "packages/ai/caption-ui",
    "User interface components for caption systems - provides UI components, interfaces, and user experience elements for caption generation and management",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
        { directory: "packages/ai/caption-core", type: "dependency", description: "Uses core caption system" },
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY
      ),
      metadata: AI_METADATA,
    }
  ),

  createAIPackage(
    "packages/ai/comfy",
    "packages/ai/comfy",
    "ComfyUI integration for AI workflow automation - provides integration with ComfyUI for visual AI workflow creation, execution, and management",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY
      ),
      metadata: AI_METADATA,
    }
  ),

  createAIPackage(
    "packages/ai/model-management",
    "packages/ai/model-management",
    "AI model lifecycle management and deployment - provides model versioning, deployment, monitoring, and lifecycle management capabilities for AI models",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/data/repository-core", type: "dependency", description: "Uses repository for model storage" }
      ),
      metadata: AI_METADATA,
    }
  ),

  createAIPackage(
    "packages/ai/multimodal",
    "packages/ai/multimodal",
    "Multimodal AI processing capabilities - provides unified processing for multiple data types including text, images, audio, and video in AI workflows",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.IMAGE_DEPENDENCY,
        COMMON_RELATIONSHIPS.VIDEO_DEPENDENCY,
        COMMON_RELATIONSHIPS.AUDIO_DEPENDENCY
      ),
      metadata: AI_METADATA,
    }
  ),

  createAIPackage(
    "packages/ai/nlweb",
    "packages/ai/nlweb",
    "Natural language web processing and analysis - provides natural language processing capabilities for web content, text analysis, and language understanding",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/data/scraping", type: "dependency", description: "Uses web scraping" }
      ),
      metadata: AI_METADATA,
    }
  ),

  createAIPackage(
    "packages/ai/tool-calling",
    "packages/ai/tool-calling",
    "AI tool calling and function execution framework - provides capabilities for AI models to call external tools, execute functions, and interact with external systems",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.AI_SHARED_DEPENDENCY,
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.API_CLIENT_DEPENDENCY
      ),
      metadata: AI_METADATA,
    }
  ),
];
