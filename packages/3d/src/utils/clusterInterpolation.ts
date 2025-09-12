// Cluster interpolation utilities for animations
import type {
  EmbeddingPoint,
  PointAnimation,
  ClusterAnimation,
} from "../types";
import { applyEasing } from "./easing";

/**
 * Create cluster point animations
 */
export function createClusterPointAnimations(
  points: EmbeddingPoint[],
  center: [number, number, number],
  expansionRadius: number,
): PointAnimation[] {
  return points.map((point, index) => {
    const angle = (index / points.length) * Math.PI * 2;
    const radius = Math.random() * expansionRadius;
    const endX = center[0] + Math.cos(angle) * radius;
    const endY = center[1] + Math.sin(angle) * radius;
    const endZ = center[2] + (Math.random() - 0.5) * expansionRadius * 0.5;

    return {
      id: point.id,
      startPosition: point.position,
      endPosition: [endX, endY, endZ],
      startColor: point.color || [1, 1, 1],
      endColor: point.color || [1, 1, 1],
      startSize: point.size || 1,
      endSize: point.size || 1,
      delay: index * 50,
    };
  });
}

/**
 * Interpolate cluster point
 */
export function interpolateClusterPoint(
  point: EmbeddingPoint,
  pointAnim: PointAnimation,
  clusterAnim: ClusterAnimation,
): EmbeddingPoint {
  const progress = Math.max(
    0,
    (clusterAnim.progress || 0) - pointAnim.delay / clusterAnim.duration,
  );
  const easedProgress = applyEasing(
    Math.max(0, Math.min(1, progress)),
    clusterAnim.easing,
  );

  return {
    ...point,
    position: [
      pointAnim.startPosition[0] +
        (pointAnim.endPosition[0] - pointAnim.startPosition[0]) * easedProgress,
      pointAnim.startPosition[1] +
        (pointAnim.endPosition[1] - pointAnim.startPosition[1]) * easedProgress,
      pointAnim.startPosition[2] +
        (pointAnim.endPosition[2] - pointAnim.startPosition[2]) * easedProgress,
    ] as [number, number, number],
  };
}
