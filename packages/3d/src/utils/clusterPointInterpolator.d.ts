import type { EmbeddingPoint, ClusterAnimation } from "../types";
/**
 * Get interpolated cluster points based on active animations
 */
export declare function getInterpolatedClusterPoints(originalPoints: EmbeddingPoint[], clusterAnimations: ClusterAnimation[]): EmbeddingPoint[];
