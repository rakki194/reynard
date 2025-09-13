/**
 * 🦊 Animation Types
 * Type definitions for the modular animation system
 */

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
  onFrameStart?: (frameTime: number) => void;
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
