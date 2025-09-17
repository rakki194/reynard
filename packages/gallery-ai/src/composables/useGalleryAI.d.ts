/**
 * useGalleryAI Composable
 *
 * Main composable for AI-enhanced gallery functionality.
 * Integrates with the annotation system to provide caption generation,
 * batch processing, and AI-powered features.
 */
import type { UseGalleryAIOptions, UseGalleryAIReturn } from "../types";
export declare const AIGalleryContext: import("solid-js").Context<UseGalleryAIReturn | undefined>;
export declare function useAIGalleryContext(): UseGalleryAIReturn;
export declare function useGalleryAI(options?: UseGalleryAIOptions): UseGalleryAIReturn;
