/**
 * 🦊 Media Package Definitions
 * ============================
 *
 * Media package directory definitions for the Reynard project architecture.
 * Contains packages for image, video, audio, 3D, and gallery processing.
 */

import type { DirectoryDefinition } from "../types.js";
import { createMediaPackage } from "../builders/directory-builder.js";
import { buildRelationships, COMMON_RELATIONSHIPS } from "../builders/relationship-builder.js";
import { MEDIA_METADATA } from "../config/metadata.js";

/**
 * Media packages directory definitions
 */
export const MEDIA_PACKAGES: DirectoryDefinition[] = [
  createMediaPackage(
    "packages/media/image",
    "packages/media/image",
    "Image processing and display components - provides image upload, processing, metadata extraction, gallery display, and image manipulation capabilities",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY,
        COMMON_RELATIONSHIPS.FILE_PROCESSING_DEPENDENCY
      ),
      metadata: MEDIA_METADATA,
    }
  ),

  createMediaPackage(
    "packages/media/audio",
    "packages/media/audio",
    "Audio processing, playback, and audio manipulation - provides audio processing capabilities, playback controls, audio manipulation, and audio analysis",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY,
        { directory: "packages/ai/multimodal", type: "dependency", description: "Used by multimodal AI" }
      ),
      metadata: MEDIA_METADATA,
    }
  ),

  createMediaPackage(
    "packages/media/boundingbox",
    "packages/media/boundingbox",
    "Bounding box annotation, processing, and manipulation - provides bounding box annotation tools, processing capabilities, and manipulation utilities for computer vision tasks",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY,
        { directory: "packages/ai/annotating-core", type: "dependency", description: "Used by annotation tools" }
      ),
      metadata: MEDIA_METADATA,
    }
  ),

  createMediaPackage(
    "packages/media/gallery",
    "packages/media/gallery",
    "Gallery systems with AI-powered features and download capabilities - provides gallery management, AI-powered organization, and download functionality",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY,
        COMMON_RELATIONSHIPS.IMAGE_DEPENDENCY
      ),
      metadata: MEDIA_METADATA,
    }
  ),

  createMediaPackage(
    "packages/media/gallery-ai",
    "packages/media/gallery-ai",
    "AI-powered gallery features and intelligent organization - provides AI-powered gallery organization, intelligent categorization, and smart gallery features",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/media/gallery", type: "dependency", description: "Uses gallery system" },
        { directory: "packages/ai/ai-shared", type: "dependency", description: "Uses AI utilities" }
      ),
      metadata: MEDIA_METADATA,
    }
  ),

  createMediaPackage(
    "packages/media/gallery-dl",
    "packages/media/gallery-dl",
    "Download capabilities and gallery management - provides download functionality, gallery management, and content acquisition capabilities",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/media/gallery", type: "dependency", description: "Uses gallery system" },
        COMMON_RELATIONSHIPS.FILE_PROCESSING_DEPENDENCY
      ),
      metadata: MEDIA_METADATA,
    }
  ),

  createMediaPackage(
    "packages/media/segmentation",
    "packages/media/segmentation",
    "Image and video segmentation tools and processing - provides segmentation capabilities, image/video segmentation, and computer vision processing tools",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY,
        COMMON_RELATIONSHIPS.IMAGE_DEPENDENCY,
        COMMON_RELATIONSHIPS.VIDEO_DEPENDENCY
      ),
      metadata: MEDIA_METADATA,
    }
  ),

  createMediaPackage(
    "packages/media/video",
    "packages/media/video",
    "Video processing, playback, and manipulation capabilities - provides video processing, playback controls, video manipulation, and video analysis",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY,
        { directory: "packages/ai/multimodal", type: "dependency", description: "Used by multimodal AI" }
      ),
      metadata: MEDIA_METADATA,
    }
  ),

  createMediaPackage(
    "packages/media/3d",
    "packages/media/3d",
    "3D rendering and visualization - provides Three.js integration, 3D scene management, rendering utilities, and 3D visualization components",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY,
        { directory: "packages/data/repository-core", type: "dependency", description: "Uses repository for 3D data" }
      ),
      metadata: MEDIA_METADATA,
    }
  ),
];
