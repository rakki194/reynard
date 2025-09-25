/**
 * 🦊 3D Animation Utilities
 *
 * Utility functions for 3D animations consolidated from the 3D package.
 * Provides interpolation, easing, and animation execution functions.
 */

import type {
  EmbeddingPoint,
  ClusterAnimation,
  PointAnimation,
  CameraAnimation,
  EasingType,
} from "./ThreeDAnimationTypes.js";
import { Easing } from "../easing/easing.js";

/**
 * Interpolate between two 3D vectors with easing
 */
export function interpolateVector3(
  start: [number, number, number],
  end: [number, number, number],
  t: number,
  easing: EasingType = "linear"
): [number, number, number] {
  const easedT = Easing[easing](t);
  return [
    start[0] + (end[0] - start[0]) * easedT,
    start[1] + (end[1] - start[1]) * easedT,
    start[2] + (end[2] - start[2]) * easedT,
  ];
}

/**
 * Interpolate between two embedding points
 */
export function interpolateEmbeddingPoint(
  start: EmbeddingPoint,
  end: EmbeddingPoint,
  t: number,
  easing: EasingType = "linear"
): EmbeddingPoint {
  const easedT = Easing[easing](t);

  return {
    x: start.x + (end.x - start.x) * easedT,
    y: start.y + (end.y - start.y) * easedT,
    z: start.z + (end.z - start.z) * easedT,
    color:
      start.color && end.color
        ? ([
            start.color[0] + (end.color[0] - start.color[0]) * easedT,
            start.color[1] + (end.color[1] - start.color[1]) * easedT,
            start.color[2] + (end.color[2] - start.color[2]) * easedT,
          ] as [number, number, number])
        : start.color || end.color,
    size:
      start.size !== undefined && end.size !== undefined
        ? start.size + (end.size - start.size) * easedT
        : start.size || end.size,
    label: start.label || end.label,
    metadata: start.metadata || end.metadata,
  };
}

/**
 * Get interpolated cluster points
 */
export function getInterpolatedClusterPoints(
  originalPoints: EmbeddingPoint[],
  clusterAnimations: ClusterAnimation[]
): EmbeddingPoint[] {
  if (clusterAnimations.length === 0) {
    return originalPoints;
  }

  return originalPoints.map(point => {
    let interpolatedPoint = { ...point };

    // Apply each cluster animation
    for (const clusterAnimation of clusterAnimations) {
      if (clusterAnimation.isAnimating) {
        const progress = clusterAnimation.progress;
        const easedProgress = Easing[clusterAnimation.easing](progress);

        // Calculate distance from cluster center
        const distance = Math.sqrt(
          Math.pow(point.x - clusterAnimation.center[0], 2) +
            Math.pow(point.y - clusterAnimation.center[1], 2) +
            Math.pow(point.z - clusterAnimation.center[2], 2)
        );

        // Apply expansion effect
        if (distance < clusterAnimation.expansionRadius) {
          const expansionFactor = 1 + easedProgress * 0.5; // 50% expansion
          const directionX = (point.x - clusterAnimation.center[0]) / distance;
          const directionY = (point.y - clusterAnimation.center[1]) / distance;
          const directionZ = (point.z - clusterAnimation.center[2]) / distance;

          interpolatedPoint.x = clusterAnimation.center[0] + directionX * distance * expansionFactor;
          interpolatedPoint.y = clusterAnimation.center[1] + directionY * distance * expansionFactor;
          interpolatedPoint.z = clusterAnimation.center[2] + directionZ * distance * expansionFactor;
        }
      }
    }

    return interpolatedPoint;
  });
}

/**
 * Get interpolated point positions for point animations
 */
export function getInterpolatedPointPositions(
  originalPoints: EmbeddingPoint[],
  pointAnimations: PointAnimation[]
): EmbeddingPoint[] {
  if (pointAnimations.length === 0) {
    return originalPoints;
  }

  return originalPoints.map((point, index) => {
    let interpolatedPoint = { ...point };

    // Find matching point animation
    for (const pointAnimation of pointAnimations) {
      if (pointAnimation.isAnimating && index < pointAnimation.targetPoints.length) {
        const progress = pointAnimation.progress;
        const targetPoint = pointAnimation.targetPoints[index];

        interpolatedPoint = interpolateEmbeddingPoint(point, targetPoint, progress, pointAnimation.easing);
      }
    }

    return interpolatedPoint;
  });
}

/**
 * Execute cluster animation
 */
export async function executeClusterAnimation(options: {
  duration: number;
  easing: EasingType;
  onProgress: (progress: number) => void;
  onComplete: () => void;
}): Promise<void> {
  const { duration, easing, onProgress, onComplete } = options;
  const startTime = performance.now();

  return new Promise(resolve => {
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = Easing[easing](progress);

      onProgress(easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
}

/**
 * Execute point animation
 */
export async function executePointAnimation(options: {
  duration: number;
  easing: EasingType;
  onProgress: (progress: number) => void;
  onComplete: () => void;
}): Promise<void> {
  return executeClusterAnimation(options); // Same implementation
}

/**
 * Execute camera animation
 */
export async function executeCameraAnimation(options: {
  duration: number;
  easing: EasingType;
  onProgress: (progress: number) => void;
  onComplete: () => void;
}): Promise<void> {
  return executeClusterAnimation(options); // Same implementation
}

/**
 * Create cluster animation instance
 */
export function createClusterAnimationInstance(options: {
  clusterId: string;
  points: EmbeddingPoint[];
  center: [number, number, number];
  expansionRadius: number;
  duration: number;
  easing: EasingType;
}): ClusterAnimation {
  return {
    clusterId: options.clusterId,
    points: options.points,
    center: options.center,
    expansionRadius: options.expansionRadius,
    duration: options.duration,
    easing: options.easing,
    progress: 0,
    startTime: performance.now(),
    isAnimating: true,
  };
}

/**
 * Create point animation instance
 */
export function createPointAnimationInstance(options: {
  animationId: string;
  startPoints: EmbeddingPoint[];
  targetPoints: EmbeddingPoint[];
  duration: number;
  easing: EasingType;
}): PointAnimation {
  return {
    animationId: options.animationId,
    points: options.startPoints,
    targetPoints: options.targetPoints,
    duration: options.duration,
    easing: options.easing,
    progress: 0,
    startTime: performance.now(),
    isAnimating: true,
  };
}

/**
 * Create camera animation instance
 */
export function createCameraAnimationInstance(options: {
  animationId: string;
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  startTarget: [number, number, number];
  endTarget: [number, number, number];
  duration: number;
  easing: EasingType;
}): CameraAnimation {
  return {
    animationId: options.animationId,
    startPosition: options.startPosition,
    endPosition: options.endPosition,
    startTarget: options.startTarget,
    endTarget: options.endTarget,
    duration: options.duration,
    easing: options.easing,
    progress: 0,
    startTime: performance.now(),
    isAnimating: true,
  };
}

/**
 * Calculate distance between two 3D points
 */
export function calculateDistance3D(point1: [number, number, number], point2: [number, number, number]): number {
  return Math.sqrt(
    Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2) + Math.pow(point2[2] - point1[2], 2)
  );
}

/**
 * Normalize 3D vector
 */
export function normalizeVector3(vector: [number, number, number]): [number, number, number] {
  const length = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
  if (length === 0) return [0, 0, 0];

  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

/**
 * Calculate center point of embedding points
 */
export function calculateCenterPoint(points: EmbeddingPoint[]): [number, number, number] {
  if (points.length === 0) return [0, 0, 0];

  const sum = points.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y,
      z: acc.z + point.z,
    }),
    { x: 0, y: 0, z: 0 }
  );

  return [sum.x / points.length, sum.y / points.length, sum.z / points.length];
}

/**
 * Check if animations should be disabled
 */
export function shouldDisable3DAnimations(): boolean {
  if (typeof window === "undefined") return true;

  // Check for reduced motion preference
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return true;
  }

  // Check for performance mode
  if (document.documentElement.classList.contains("performance-mode")) {
    return true;
  }

  // Check for animations disabled globally
  if (document.documentElement.classList.contains("animations-disabled")) {
    return true;
  }

  return false;
}

/**
 * Check if 3D animation package is available
 */
export function is3DAnimationPackageAvailable(): boolean {
  try {
    // Try to access 3D animation functions
    return typeof interpolateVector3 === "function";
  } catch {
    return false;
  }
}
