/**
 * 🦊 3D Animation Types
 * 
 * Type definitions for 3D animation system consolidated from the 3D package.
 * Provides comprehensive type safety for 3D animations and interactions.
 */

export interface EmbeddingPoint {
  x: number;
  y: number;
  z: number;
  color?: [number, number, number];
  size?: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface ClusterAnimation {
  clusterId: string;
  points: EmbeddingPoint[];
  center: [number, number, number];
  expansionRadius: number;
  duration: number;
  easing: EasingType;
  progress: number;
  startTime: number;
  isAnimating: boolean;
}

export interface PointAnimation {
  animationId: string;
  points: EmbeddingPoint[];
  targetPoints: EmbeddingPoint[];
  duration: number;
  easing: EasingType;
  progress: number;
  startTime: number;
  isAnimating: boolean;
}

export interface CameraAnimation {
  animationId: string;
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  startTarget: [number, number, number];
  endTarget: [number, number, number];
  duration: number;
  easing: EasingType;
  progress: number;
  startTime: number;
  isAnimating: boolean;
}

export interface ThreeDAnimationOptions {
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Easing function to use */
  easing?: EasingType;
  /** Whether to use fallback animations when package unavailable */
  useFallback?: boolean;
  /** Whether to respect global animation control */
  respectGlobalControl?: boolean;
  /** Whether to enable performance optimizations */
  performanceMode?: boolean;
}

export interface ClusterAnimationOptions extends ThreeDAnimationOptions {
  /** Cluster identifier */
  clusterId: string;
  /** Points to animate */
  points: EmbeddingPoint[];
  /** Center point for cluster animation */
  center: [number, number, number];
  /** Expansion radius for cluster */
  expansionRadius?: number;
}

export interface PointAnimationOptions extends ThreeDAnimationOptions {
  /** Animation identifier */
  animationId: string;
  /** Starting points */
  startPoints: EmbeddingPoint[];
  /** Target points */
  targetPoints: EmbeddingPoint[];
}

export interface CameraAnimationOptions extends ThreeDAnimationOptions {
  /** Animation identifier */
  animationId: string;
  /** Starting camera position */
  startPosition: [number, number, number];
  /** Target camera position */
  endPosition: [number, number, number];
  /** Starting camera target */
  startTarget: [number, number, number];
  /** Target camera target */
  endTarget: [number, number, number];
}

export interface ThreeDAnimationState {
  /** Current point animations */
  pointAnimations: PointAnimation[];
  /** Current cluster animations */
  clusterAnimations: ClusterAnimation[];
  /** Current camera animations */
  cameraAnimations: CameraAnimation[];
  /** Whether animations are currently disabled */
  isAnimationsDisabled: boolean;
  /** Current animation engine being used */
  animationEngine: "full" | "fallback" | "disabled";
}

export interface ThreeDAnimationControls {
  /** Start a cluster animation */
  createClusterAnimation: (options: ClusterAnimationOptions) => Promise<void>;
  /** Start a point animation */
  createPointAnimation: (options: PointAnimationOptions) => Promise<void>;
  /** Start a camera animation */
  createCameraAnimation: (options: CameraAnimationOptions) => Promise<void>;
  /** Stop all animations */
  stopAllAnimations: () => void;
  /** Stop specific animation */
  stopAnimation: (animationId: string) => void;
  /** Get interpolated points for current frame */
  getInterpolatedPoints: (originalPoints: EmbeddingPoint[]) => EmbeddingPoint[];
  /** Get camera animation state */
  getCameraAnimationState: () => CameraAnimation | null;
  /** Update all animations */
  updateAnimations: () => void;
}

export interface UseThreeDAnimationReturn {
  /** Current animation state */
  state: () => ThreeDAnimationState;
  /** Animation controls */
  controls: ThreeDAnimationControls;
  /** Whether animation system is available */
  isSystemAvailable: () => boolean;
  /** Current animation engine */
  animationEngine: () => "full" | "fallback" | "disabled";
  /** Whether animations are disabled */
  isAnimationsDisabled: () => boolean;
}

// Re-export easing types from the main animation package
export type { EasingType } from "../easing/easing.js";
