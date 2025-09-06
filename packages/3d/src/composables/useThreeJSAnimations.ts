// Three.js animation composable for SolidJS
// Adapted from yipyap's animation system

import { createSignal, onCleanup, createMemo } from 'solid-js';
import type { 
  PointAnimation, 
  CameraAnimation, 
  ClusterAnimation, 
  EasingType,
  EmbeddingPoint
} from '../types';
import { Easing, applyEasing } from '../utils/easing';

// Animation state interface
interface AnimationState {
  isAnimating: boolean;
  progress: number;
  startTime: number;
  duration: number;
  easing: EasingType;
}

export function useThreeJSAnimations() {
  // Animation state
  const [currentAnimation, setCurrentAnimation] = createSignal<AnimationState | null>(null);
  const [pointAnimations, setPointAnimations] = createSignal<PointAnimation[]>([]);
  const [cameraAnimation, setCameraAnimation] = createSignal<CameraAnimation | null>(null);
  const [clusterAnimations, setClusterAnimations] = createSignal<ClusterAnimation[]>([]);

  // Animation frame ID
  const [animationFrameId, setAnimationFrameId] = createSignal<number | null>(null);

  // Check if animations are disabled
  const isAnimationsDisabled = createMemo(() => false); // Can be connected to app settings

  /**
   * Create smooth transition between reduction methods
   */
  const createReductionTransition = (
    startPoints: EmbeddingPoint[],
    endPoints: EmbeddingPoint[],
    duration: number = 1000,
    easing: EasingType = 'easeInOutCubic'
  ): Promise<void> => {
    if (isAnimationsDisabled()) {
      return Promise.resolve();
    }

    const animations: PointAnimation[] = startPoints.map((startPoint, _index) => {
      const endPoint = endPoints.find(p => p.id === startPoint.id) || startPoint;
      return {
        id: startPoint.id,
        startPosition: startPoint.position,
        endPosition: endPoint.position,
        startColor: startPoint.color || [1, 1, 1],
        endColor: endPoint.color || [1, 1, 1],
        startSize: startPoint.size || 1,
        endSize: endPoint.size || 1,
        delay: Math.random() * 200, // Stagger animation start
      };
    });

    setPointAnimations(animations);

    const animationState: AnimationState = {
      isAnimating: true,
      progress: 0,
      startTime: performance.now(),
      duration,
      easing,
    };

    setCurrentAnimation(animationState);

    return new Promise<void>(resolve => {
      const animate = (currentTime: number) => {
        const elapsed = currentTime - animationState.startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = applyEasing(progress, easing);

        animationState.progress = easedProgress;
        setCurrentAnimation({ ...animationState });

        if (progress < 1) {
          const id = requestAnimationFrame(animate);
          setAnimationFrameId(id);
        } else {
          setCurrentAnimation(null);
          setPointAnimations([]);
          resolve();
        }
      };

      const id = requestAnimationFrame(animate);
      setAnimationFrameId(id);
    });
  };

  /**
   * Create point clustering animation
   */
  const createClusterAnimation = (
    clusterId: string,
    points: EmbeddingPoint[],
    center: [number, number, number],
    expansionRadius: number = 2,
    duration: number = 800,
    easing: EasingType = 'easeOutElastic'
  ): Promise<void> => {
    if (isAnimationsDisabled()) {
      return Promise.resolve();
    }

    const animations: PointAnimation[] = points.map((point, index) => {
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
        delay: index * 50, // Stagger cluster expansion
      };
    });

    const clusterAnimation: ClusterAnimation = {
      clusterId,
      points: animations,
      expansionRadius,
      duration,
      easing,
    };

    setClusterAnimations(prev => [...prev, clusterAnimation]);

    return new Promise<void>(resolve => {
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = applyEasing(progress, easing);

        // Update cluster animation progress
        setClusterAnimations(prev =>
          prev.map(cluster => 
            cluster.clusterId === clusterId 
              ? { ...cluster, progress: easedProgress } 
              : cluster
          )
        );

        if (progress < 1) {
          const id = requestAnimationFrame(animate);
          setAnimationFrameId(id);
        } else {
          setClusterAnimations(prev => prev.filter(c => c.clusterId !== clusterId));
          resolve();
        }
      };

      const id = requestAnimationFrame(animate);
      setAnimationFrameId(id);
    });
  };

  /**
   * Create camera fly-to animation
   */
  const createCameraFlyTo = (
    targetPosition: [number, number, number],
    targetLookAt: [number, number, number],
    duration: number = 1500,
    easing: EasingType = 'easeInOutCubic'
  ): Promise<CameraAnimation> => {
    if (isAnimationsDisabled()) {
      return Promise.resolve({
        startPosition: [0, 0, 0],
        endPosition: targetPosition,
        startTarget: [0, 0, 0],
        endTarget: targetLookAt,
        duration,
        easing,
      });
    }

    return new Promise<CameraAnimation>(resolve => {
      const animation: CameraAnimation = {
        startPosition: [0, 0, 0], // Will be set by component
        endPosition: targetPosition,
        startTarget: [0, 0, 0], // Will be set by component
        endTarget: targetLookAt,
        duration,
        easing,
      };

      setCameraAnimation(animation);
      resolve(animation);
    });
  };

  /**
   * Get interpolated point positions for current animation
   */
  const getInterpolatedPoints = (originalPoints: EmbeddingPoint[]) => {
    const currentAnim = currentAnimation();
    const pointAnims = pointAnimations();
    const clusterAnims = clusterAnimations();

    if (!currentAnim && clusterAnims.length === 0) {
      return originalPoints;
    }

    return originalPoints.map(point => {
      // Check for point animation
      const pointAnim = pointAnims.find(pa => pa.id === point.id);
      if (pointAnim && currentAnim) {
        const progress = Math.max(0, currentAnim.progress - pointAnim.delay / currentAnim.duration);
        const easedProgress = applyEasing(Math.max(0, Math.min(1, progress)), currentAnim.easing);

        return {
          ...point,
          position: [
            pointAnim.startPosition[0] + (pointAnim.endPosition[0] - pointAnim.startPosition[0]) * easedProgress,
            pointAnim.startPosition[1] + (pointAnim.endPosition[1] - pointAnim.startPosition[1]) * easedProgress,
            pointAnim.startPosition[2] + (pointAnim.endPosition[2] - pointAnim.startPosition[2]) * easedProgress,
          ],
          color: [
            pointAnim.startColor[0] + (pointAnim.endColor[0] - pointAnim.startColor[0]) * easedProgress,
            pointAnim.startColor[1] + (pointAnim.endColor[1] - pointAnim.startColor[1]) * easedProgress,
            pointAnim.startColor[2] + (pointAnim.endColor[2] - pointAnim.startColor[2]) * easedProgress,
          ],
          size: pointAnim.startSize + (pointAnim.endSize - pointAnim.startSize) * easedProgress,
        };
      }

      // Check for cluster animation
      const clusterAnim = clusterAnims.find(ca => ca.points.some(pa => pa.id === point.id));
      if (clusterAnim && clusterAnim.progress !== undefined) {
        const pointAnim = clusterAnim.points.find(pa => pa.id === point.id);
        if (pointAnim) {
          const progress = Math.max(0, clusterAnim.progress - pointAnim.delay / clusterAnim.duration);
          const easedProgress = applyEasing(Math.max(0, Math.min(1, progress)), clusterAnim.easing);

          return {
            ...point,
            position: [
              pointAnim.startPosition[0] + (pointAnim.endPosition[0] - pointAnim.startPosition[0]) * easedProgress,
              pointAnim.startPosition[1] + (pointAnim.endPosition[1] - pointAnim.startPosition[1]) * easedProgress,
              pointAnim.startPosition[2] + (pointAnim.endPosition[2] - pointAnim.startPosition[2]) * easedProgress,
            ],
          };
        }
      }

      return point;
    });
  };

  /**
   * Get camera animation state
   */
  const getCameraAnimationState = () => {
    const anim = cameraAnimation();
    if (!anim) return null;

    const currentAnim = currentAnimation();
    if (!currentAnim) return null;

    const progress = currentAnim.progress;

    return {
      position: [
        anim.startPosition[0] + (anim.endPosition[0] - anim.startPosition[0]) * progress,
        anim.startPosition[1] + (anim.endPosition[1] - anim.startPosition[1]) * progress,
        anim.startPosition[2] + (anim.endPosition[2] - anim.startPosition[2]) * progress,
      ],
      target: [
        anim.startTarget[0] + (anim.endTarget[0] - anim.startTarget[0]) * progress,
        anim.startTarget[1] + (anim.endTarget[1] - anim.startTarget[1]) * progress,
        anim.startTarget[2] + (anim.endTarget[2] - anim.startTarget[2]) * progress,
      ],
    };
  };

  /**
   * Stop all animations
   */
  const stopAllAnimations = () => {
    const currentId = animationFrameId();
    if (currentId) {
      window.cancelAnimationFrame(currentId);
      setAnimationFrameId(null);
    }

    setCurrentAnimation(null);
    setPointAnimations([]);
    setCameraAnimation(null);
    setClusterAnimations([]);
  };

  // Cleanup on unmount
  onCleanup(() => {
    stopAllAnimations();
  });

  return {
    // State
    currentAnimation,
    pointAnimations,
    cameraAnimation,
    clusterAnimations,
    isAnimationsDisabled,

    // Methods
    createReductionTransition,
    createClusterAnimation,
    createCameraFlyTo,
    getInterpolatedPoints,
    getCameraAnimationState,
    stopAllAnimations,
    updateAnimations: () => {
      const current = currentAnimation();
      if (!current || !current.isAnimating) return;

      const now = performance.now();
      const elapsed = now - current.startTime;
      const progress = Math.min(elapsed / current.duration, 1);

      if (progress >= 1) {
        // Animation complete
        setCurrentAnimation(null);
        setPointAnimations([]);
        setCameraAnimation(null);
        setClusterAnimations([]);
      } else {
        // Update animation progress
        setCurrentAnimation(prev => prev ? { ...prev, progress } : null);
      }
    },

    // Utilities
    Easing,
  };
}
