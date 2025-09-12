// Cluster animation factory utility
// Creates and manages cluster animation instances

import type { ClusterAnimation, EmbeddingPoint, EasingType } from "../types";
import { createClusterPointAnimations } from "./clusterInterpolation";

export interface CreateClusterAnimationOptions {
  clusterId: string;
  points: EmbeddingPoint[];
  center: [number, number, number];
  expansionRadius?: number;
  duration?: number;
  easing?: EasingType;
}

/**
 * Create a cluster animation instance
 */
export function createClusterAnimationInstance(
  options: CreateClusterAnimationOptions,
): ClusterAnimation {
  const {
    clusterId,
    points,
    center,
    expansionRadius = 2,
    duration = 800,
    easing = "easeOutElastic",
  } = options;

  const animations = createClusterPointAnimations(points, center, expansionRadius);
  
  return {
    clusterId,
    points: animations,
    expansionRadius,
    duration,
    easing,
  };
}
