import type { EmbeddingPoint, PointAnimation, ClusterAnimation } from "../types";
/**
 * Create cluster point animations
 */
export declare function createClusterPointAnimations(points: EmbeddingPoint[], center: [number, number, number], expansionRadius: number): PointAnimation[];
/**
 * Interpolate cluster point
 */
export declare function interpolateClusterPoint(point: EmbeddingPoint, pointAnim: PointAnimation, clusterAnim: ClusterAnimation): EmbeddingPoint;
