/**
 * 🦊 Unified Animation Types
 * Consolidated type definitions for the Reynard animation system
 */

// Core animation types
export interface AnimationConfig {
  frameRate: number;
  maxFPS: number;
  enableVSync: boolean;
  enablePerformanceMonitoring: boolean;
}

export interface AnimationState {
  isRunning: boolean;
  frameCount: number;
  lastFrameTime: number;
  deltaTime: number;
  fps: number;
  averageFPS: number;
  performanceMetrics: {
    frameTime: number;
    renderTime: number;
    updateTime: number;
  };
}

export interface AnimationCallbacks {
  onUpdate?: (deltaTime: number, frameCount: number) => void;
  onRender?: (deltaTime: number, frameCount: number) => void;
  onFrameStart?: (currentTime: number) => void;
  onFrameEnd?: (frameTime: number, frameCount: number) => void;
}

export interface PerformanceStats {
  currentFPS: number;
  averageFPS: number;
  frameCount: number;
  frameTime: number;
  renderTime: number;
  updateTime: number;
  isRunning: boolean;
}

// Easing types
export type EasingType =
  | "linear"
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeInCubic"
  | "easeOutCubic"
  | "easeInOutCubic"
  | "easeInElastic"
  | "easeOutElastic"
  | "easeInOutElastic"
  | "easeInBounce"
  | "easeOutBounce"
  | "easeInOutBounce";

// 3D Animation types
export interface PointAnimation {
  id: string;
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  startSize: number;
  endSize: number;
  startColor: [number, number, number];
  endColor: [number, number, number];
}

export interface ClusterAnimation {
  clusterId: string;
  points: Array<{ id: string; position: [number, number, number] }>;
  center: [number, number, number];
  expansionRadius: number;
  progress: number;
}

export interface CameraAnimationState {
  position: [number, number, number];
  target: [number, number, number];
  progress: number;
}

// Staggered animation types
export interface StaggeredAnimationConfig {
  duration: number;
  delay: number;
  stagger: number;
  easing: EasingType;
  direction: "forward" | "reverse" | "center" | "random";
  onStart?: () => void;
  onComplete?: () => void;
  onItemStart?: (index: number) => void;
  onItemComplete?: (index: number) => void;
}

export interface StaggeredAnimationItem {
  index: number;
  delay: number;
  isAnimating: boolean;
  progress: number;
}

export interface UseStaggeredAnimationOptions {
  duration?: number;
  delay?: number;
  stagger?: number;
  easing?: EasingType;
  direction?: "forward" | "reverse" | "center" | "random";
  onStart?: () => void;
  onComplete?: () => void;
  onItemStart?: (index: number) => void;
  onItemComplete?: (index: number) => void;
}

export interface UseStaggeredAnimationReturn {
  items: () => StaggeredAnimationItem[];
  isAnimating: () => boolean;
  start: (itemCount: number) => Promise<void>;
  stop: () => void;
  reset: () => void;
}

// Theme animation types
export interface ThemeAnimations {
  duration: {
    fast: string;
    base: string;
    slow: string;
  };
  easing: {
    standard: string;
    decelerate: string;
    accelerate: string;
  };
  icon: string;
}

// Color animation types
export interface ColorAnimation {
  startColor: string;
  endColor: string;
  duration: number;
  easing: EasingType;
}

// Stroboscopic animation types
export interface StroboscopicConfig {
  frameRate: number;
  rotationSpeed: number;
  goldenAngle: number;
  stroboscopicThreshold: number;
  enableTemporalAliasing: boolean;
  enableMorphingEffects: boolean;
}

export interface StroboscopicState {
  isStroboscopic: boolean;
  stroboscopicPhase: number;
  apparentMotion: "growing" | "shrinking" | "frozen" | "morphing";
  temporalAliasing: number;
  morphingIntensity: number;
}

// Performance monitoring types
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  renderTime: number;
  updateTime: number;
  isStable: boolean;
  qualityLevel: number;
}

export interface PerformanceThresholds {
  minFPS: number;
  maxFrameTime: number;
  maxMemoryUsage: number;
  stabilityFrames: number;
}

// Animation engine types
export interface AnimationEngine {
  start: (callbacks: AnimationCallbacks) => void;
  stop: () => void;
  reset: () => void;
  getPerformanceStats: () => PerformanceStats;
  updateConfig: (config: Partial<AnimationConfig>) => void;
  updateCallbacks: (callbacks: AnimationCallbacks) => void;
}

// Utility types
export type Vector3 = [number, number, number];
export type Vector2 = [number, number];
export type ColorRGB = [number, number, number];
export type ColorRGBA = [number, number, number, number];

// Animation interpolation types
export interface InterpolationOptions {
  easing?: EasingType;
  duration?: number;
  delay?: number;
}

export interface AnimationInterpolator<T> {
  interpolate: (
    start: T,
    end: T,
    progress: number,
    options?: InterpolationOptions,
  ) => T;
}
