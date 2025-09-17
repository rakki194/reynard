/**
 * Animation Timing
 *
 * Timing utilities for staggered animations.
 */
import type { AnimationConfig } from "./AnimationConfig.js";
/**
 * Calculate stagger delay for a given index
 */
export declare function calculateStaggerDelay(index: number, totalItems: number, config: AnimationConfig): number;
