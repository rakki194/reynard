// Cluster animation composable for SolidJS
import { createSignal, createMemo } from "solid-js";
import type {
  ClusterAnimation,
  PointAnimation,
  EasingType,
  EmbeddingPoint,
} from "../types";
import { applyEasing } from "../utils/easing";
import {
  createClusterPointAnimations,
  interpolateClusterPoint,
} from "../utils/clusterInterpolation";

export function useClusterAnimations() {
  const [clusterAnimations, setClusterAnimations] = createSignal<
    ClusterAnimation[]
  >([]);
  const [animationFrameId, setAnimationFrameId] = createSignal<number | null>(
    null,
  );

  const isAnimationsDisabled = createMemo(() => false);

  /**
   * Create point clustering animation
   */
  const createClusterAnimation = (
    clusterId: string,
    points: EmbeddingPoint[],
    center: [number, number, number],
    expansionRadius: number = 2,
    duration: number = 800,
    easing: EasingType = "easeOutElastic",
  ): Promise<void> => {
    if (isAnimationsDisabled()) {
      return Promise.resolve();
    }

    const animations = createClusterPointAnimations(
      points,
      center,
      expansionRadius,
    );

    const clusterAnimation: ClusterAnimation = {
      clusterId,
      points: animations,
      expansionRadius,
      duration,
      easing,
    };

    setClusterAnimations((prev) => [...prev, clusterAnimation]);

    return new Promise<void>((resolve) => {
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = applyEasing(progress, easing);

        setClusterAnimations((prev) =>
          prev.map((cluster) =>
            cluster.clusterId === clusterId
              ? { ...cluster, progress: easedProgress }
              : cluster,
          ),
        );

        if (progress < 1) {
          const id = requestAnimationFrame(animate);
          setAnimationFrameId(id);
        } else {
          setClusterAnimations((prev) =>
            prev.filter((c) => c.clusterId !== clusterId),
          );
          resolve();
        }
      };

      const id = requestAnimationFrame(animate);
      setAnimationFrameId(id);
    });
  };

  /**
   * Get interpolated points for cluster animations
   */
  const getInterpolatedClusterPoints = (originalPoints: EmbeddingPoint[]) => {
    const clusterAnims = clusterAnimations();

    if (clusterAnims.length === 0) {
      return originalPoints;
    }

    return originalPoints.map((point) => {
      const clusterAnim = clusterAnims.find((ca) =>
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
  };

  const stopAnimations = () => {
    const currentId = animationFrameId();
    if (currentId) {
      window.cancelAnimationFrame(currentId);
      setAnimationFrameId(null);
    }
    setClusterAnimations([]);
  };

  return {
    clusterAnimations,
    isAnimationsDisabled,
    createClusterAnimation,
    getInterpolatedClusterPoints,
    stopAnimations,
  };
}
