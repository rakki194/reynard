// Cluster point interpolation utility
// Handles point interpolation logic for cluster animations

import type { EmbeddingPoint, ClusterAnimation } from "../types";
import { interpolateClusterPoint } from "./clusterInterpolation";

/**
 * Get interpolated cluster points based on active animations
 */
export function getInterpolatedClusterPoints(
  originalPoints: EmbeddingPoint[],
  clusterAnimations: ClusterAnimation[],
): EmbeddingPoint[] {
  if (clusterAnimations.length === 0) {
    return originalPoints;
  }
  
  return originalPoints.map((point) => {
    const clusterAnim = clusterAnimations.find((ca) =>
      ca.points.some((pa) => pa.id === point.id),
    );
    
    if (clusterAnim && clusterAnim.progress !== undefined) {
      const pointAnim = clusterAnim.points.find((pa) => pa.id === point.id);
      if (pointAnim) {
        return interpolateClusterPoint(point, pointAnim, clusterAnim);
      }
    }
    
    return point;
  });
}
