import type { EmbeddingPoint, PointAnimation, AnimationState } from "../types";
/**
 * Interpolate a single point based on animation state
 */
export declare function interpolatePoint(point: EmbeddingPoint, pointAnim: PointAnimation, animationState: AnimationState): EmbeddingPoint;
/**
 * Create point animations from start and end points
 */
export declare function createPointAnimations(startPoints: EmbeddingPoint[], endPoints: EmbeddingPoint[]): PointAnimation[];
