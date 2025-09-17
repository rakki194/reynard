/**
 * Caption generation utilities for different model types
 *
 * These functions provide specialized caption generation for various use cases:
 * - Furry tags (JTP2 model)
 * - Detailed descriptions (JoyCaption model)
 * - Anime tags (WDV3 model)
 * - General captions (Florence2 model)
 */
import type { CaptionResult } from "reynard-annotating-core";
import type { BackendAnnotationManager } from "./BackendAnnotationManager";
/**
 * Generate furry tags using JTP2 model
 */
export declare function generateFurryTags(manager: BackendAnnotationManager, imagePath: string, config?: Record<string, unknown>): Promise<CaptionResult>;
/**
 * Generate detailed caption using JoyCaption model
 */
export declare function generateDetailedCaption(manager: BackendAnnotationManager, imagePath: string, config?: Record<string, unknown>): Promise<CaptionResult>;
/**
 * Generate anime tags using WDV3 model
 */
export declare function generateAnimeTags(manager: BackendAnnotationManager, imagePath: string, config?: Record<string, unknown>): Promise<CaptionResult>;
/**
 * Generate general caption using Florence2 model
 */
export declare function generateGeneralCaption(manager: BackendAnnotationManager, imagePath: string, config?: Record<string, unknown>): Promise<CaptionResult>;
