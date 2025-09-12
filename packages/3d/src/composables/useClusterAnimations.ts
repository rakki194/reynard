// Cluster animation composable for SolidJS
// Orchestrates modular cluster animation functionality

import { createSignal, createMemo } from "solid-js";
import type {
  ClusterAnimation,
  EasingType,
  EmbeddingPoint,
} from "../types";
import { executeClusterAnimation } from "../utils/clusterAnimationExecutor";
import { getInterpolatedClusterPoints } from "../utils/clusterPointInterpolator";
import { createClusterAnimationInstance } from "../utils/clusterAnimationFactory";

export function useClusterAnimations() {
  const [clusterAnimations, setClusterAnimations] = createSignal<ClusterAnimation[]>([]);
  const isAnimationsDisabled = createMemo(() => false);

  const createClusterAnimation = (
    clusterId: string,
    points: EmbeddingPoint[],
    center: [number, number, number],
    expansionRadius: number = 2,
    duration: number = 800,
    easing: EasingType = "easeOutElastic",
  ): Promise<void> => {
    if (isAnimationsDisabled()) return Promise.resolve();
    
    const clusterAnimation = createClusterAnimationInstance({
      clusterId,
      points,
      center,
      expansionRadius,
      duration,
      easing,
    });

    setClusterAnimations((prev) => [...prev, clusterAnimation]);

    return executeClusterAnimation({
      duration,
      easing,
      onProgress: (progress) => {
        setClusterAnimations((prev) =>
          prev.map((cluster) =>
            cluster.clusterId === clusterId
              ? { ...cluster, progress }
              : cluster,
          ),
        );
      },
      onComplete: () => {
        setClusterAnimations((prev) =>
          prev.filter((c) => c.clusterId !== clusterId),
        );
      },
    });
  };

  return {
    clusterAnimations,
    isAnimationsDisabled,
    createClusterAnimation,
    getInterpolatedClusterPoints: (points: EmbeddingPoint[]) => 
      getInterpolatedClusterPoints(points, clusterAnimations()),
    stopAnimations: () => setClusterAnimations([]),
  };
}
