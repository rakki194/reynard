/**
 * No-Op Animation Engine
 *
 * Provides immediate completion for disabled animations with performance monitoring.
 * Memory-efficient fallback engine that completes animations instantly without visual effects.
 *
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { log } from "../utils/Logger";

import {
  AnimationEngine,
  AnimationConfig,
  AnimationResult,
  AnimationState,
  AnimationCallbacks,
  PerformanceStats,
} from "../types/index.js";

export interface NoOpAnimationConfig extends AnimationConfig {
  /** Whether to enable performance monitoring */
  enablePerformanceMonitoring: boolean;
  /** Whether to enable memory usage tracking */
  enableMemoryTracking: boolean;
  /** Whether to log completion events */
  enableLogging: boolean;
  /** Custom completion delay in milliseconds (default: 0) */
  completionDelay: number;
  /** Animation duration for immediate completion */
  duration: number;
}

export interface NoOpPerformanceMetrics {
  /** Total number of animations completed */
  totalAnimations: number;
  /** Average completion time in milliseconds */
  averageCompletionTime: number;
  /** Total memory usage in bytes */
  totalMemoryUsage: number;
  /** Peak memory usage in bytes */
  peakMemoryUsage: number;
  /** Number of animations completed per second */
  animationsPerSecond: number;
  /** Last completion timestamp */
  lastCompletionTime: number;
}

export interface NoOpAnimationState {
  /** Whether the engine is running */
  isRunning: boolean;
  /** Frame count */
  frameCount: number;
  /** Last frame time */
  lastFrameTime: number;
  /** Delta time */
  deltaTime: number;
  /** FPS */
  fps: number;
  /** Average FPS */
  averageFPS: number;
  /** Performance metrics */
  performanceMetrics: {
    frameTime: number;
    renderTime: number;
    updateTime: number;
  };
  /** Whether the engine is active */
  isActive: boolean;
  /** No-Op specific performance metrics */
  noOpPerformanceMetrics: NoOpPerformanceMetrics;
  /** Memory usage in bytes */
  memoryUsage: number;
}

/**
 * No-Op Animation Engine
 *
 * Provides immediate completion for animations when they are disabled.
 * Optimized for performance with minimal memory footprint.
 */
export class NoOpAnimationEngine implements AnimationEngine {
  private config: NoOpAnimationConfig;
  private state: NoOpAnimationState;
  private performanceMetrics: NoOpPerformanceMetrics;
  private memoryUsage: number = 0;
  private completionTimes: number[] = [];
  private isActive: boolean = false;
  private callbacks: AnimationCallbacks = {};

  constructor(config: Partial<NoOpAnimationConfig> = {}) {
    this.config = {
      frameRate: 60,
      maxFPS: 60,
      enableVSync: false,
      enablePerformanceMonitoring: true,
      enableMemoryTracking: true,
      enableLogging: false,
      completionDelay: 0,
      duration: 0,
      ...config,
    };

    this.performanceMetrics = {
      totalAnimations: 0,
      averageCompletionTime: 0,
      totalMemoryUsage: 0,
      peakMemoryUsage: 0,
      animationsPerSecond: 0,
      lastCompletionTime: 0,
    };

    this.state = {
      isRunning: false,
      frameCount: 0,
      lastFrameTime: 0,
      deltaTime: 0,
      fps: 0,
      averageFPS: 0,
      performanceMetrics: {
        frameTime: 0,
        renderTime: 0,
        updateTime: 0,
      },
      isActive: false,
      noOpPerformanceMetrics: this.performanceMetrics,
      memoryUsage: 0,
    };

    this.initialize();
  }

  /**
   * Initialize the no-op animation engine
   */
  private initialize(): void {
    this.isActive = true;
    this.state.isActive = true;
    this.updateMemoryUsage();

    if (this.config.enableLogging) {
      log.debug("NoOpAnimationEngine: Initialized with immediate completion");
    }
  }

  /**
   * Start the animation engine
   */
  start(callbacks: AnimationCallbacks): void {
    this.state.isRunning = true;
    this.callbacks = callbacks;

    if (this.config.enableLogging) {
      log.debug("NoOpAnimationEngine: Started with immediate completion");
    }

    // Call frame start callback
    callbacks.onFrameStart?.(performance.now());

    // Complete immediately
    const frameTime = performance.now();
    this.state.frameCount++;
    this.state.lastFrameTime = frameTime;
    this.state.deltaTime = 0;
    this.state.fps = 60; // Simulate 60 FPS

    // Call update and render callbacks
    callbacks.onUpdate?.(0, this.state.frameCount);
    callbacks.onRender?.(0, this.state.frameCount);
    callbacks.onFrameEnd?.(0, this.state.frameCount);

    // Stop immediately
    this.stop();
  }

  /**
   * Stop an animation (immediate completion)
   */
  stop(): void {
    this.state.isRunning = false;

    if (this.config.enableLogging) {
      log.debug("NoOpAnimationEngine: Stopped");
    }
  }

  /**
   * Reset the animation engine
   */
  reset(): void {
    this.state.isRunning = false;
    this.state.frameCount = 0;
    this.state.lastFrameTime = 0;
    this.state.deltaTime = 0;
    this.state.fps = 0;
    this.state.averageFPS = 0;

    if (this.config.enableLogging) {
      log.debug("NoOpAnimationEngine: Reset");
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): PerformanceStats {
    return {
      currentFPS: this.state.fps,
      averageFPS: this.state.averageFPS,
      frameCount: this.state.frameCount,
      frameTime: this.state.performanceMetrics.frameTime,
      renderTime: this.state.performanceMetrics.renderTime,
      updateTime: this.state.performanceMetrics.updateTime,
      isRunning: this.state.isRunning,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.config.enableLogging) {
      log.debug("NoOpAnimationEngine: Configuration updated", config);
    }
  }

  /**
   * Update callbacks
   */
  updateCallbacks(callbacks: AnimationCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };

    if (this.config.enableLogging) {
      log.debug("NoOpAnimationEngine: Callbacks updated");
    }
  }

  /**
   * Pause an animation (no-op since we complete immediately)
   */
  async pause(): Promise<AnimationResult> {
    if (this.config.enableLogging) {
      log.debug("NoOpAnimationEngine: Pause requested (no-op)");
    }

    return {
      success: true,
      duration: 0,
      progress: 1,
      completed: true,
      cancelled: false,
      error: undefined,
      performanceMetrics: {
        startTime: performance.now(),
        endTime: performance.now(),
        duration: 0,
        memoryUsage: this.memoryUsage,
        frameCount: 1,
        averageFrameTime: 0,
      },
    };
  }

  /**
   * Resume an animation (no-op since we complete immediately)
   */
  async resume(): Promise<AnimationResult> {
    if (this.config.enableLogging) {
      log.debug("NoOpAnimationEngine: Resume requested (no-op)");
    }

    return {
      success: true,
      duration: 0,
      progress: 1,
      completed: true,
      cancelled: false,
      error: undefined,
      performanceMetrics: {
        startTime: performance.now(),
        endTime: performance.now(),
        duration: 0,
        memoryUsage: this.memoryUsage,
        frameCount: 1,
        averageFrameTime: 0,
      },
    };
  }

  /**
   * Get current animation state
   */
  getState(): NoOpAnimationState {
    return {
      ...this.state,
      noOpPerformanceMetrics: { ...this.performanceMetrics },
      memoryUsage: this.memoryUsage,
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): NoOpPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Reset performance metrics
   */
  resetPerformanceMetrics(): void {
    this.performanceMetrics = {
      totalAnimations: 0,
      averageCompletionTime: 0,
      totalMemoryUsage: 0,
      peakMemoryUsage: 0,
      animationsPerSecond: 0,
      lastCompletionTime: 0,
    };

    this.completionTimes = [];
    this.memoryUsage = 0;

    if (this.config.enableLogging) {
      log.debug("NoOpAnimationEngine: Performance metrics reset");
    }
  }

  /**
   * Check if the engine is active
   */
  isEngineActive(): boolean {
    return this.isActive;
  }

  /**
   * Activate the engine
   */
  activate(): void {
    this.isActive = true;
    this.state.isActive = true;

    if (this.config.enableLogging) {
      log.debug("NoOpAnimationEngine: Engine activated");
    }
  }

  /**
   * Deactivate the engine
   */
  deactivate(): void {
    this.isActive = false;
    this.state.isActive = false;

    if (this.config.enableLogging) {
      log.debug("NoOpAnimationEngine: Engine deactivated");
    }
  }

  /**
   * Apply properties to element immediately
   */
  private applyProperties(element: HTMLElement, properties: Record<string, any>): void {
    try {
      Object.entries(properties).forEach(([property, value]) => {
        if (typeof value === "string" || typeof value === "number") {
          element.style.setProperty(property, String(value));
        }
      });
    } catch (error) {
      if (this.config.enableLogging) {
        log.warn("NoOpAnimationEngine: Failed to apply properties", error);
      }
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(duration: number): void {
    if (!this.config.enablePerformanceMonitoring) {
      return;
    }

    const now = performance.now();
    this.performanceMetrics.totalAnimations += 1;
    this.completionTimes.push(duration);

    // Keep only last 100 completion times for rolling average
    if (this.completionTimes.length > 100) {
      this.completionTimes = this.completionTimes.slice(-100);
    }

    // Calculate average completion time
    this.performanceMetrics.averageCompletionTime =
      this.completionTimes.reduce((sum, time) => sum + time, 0) / this.completionTimes.length;

    // Calculate animations per second (rolling window)
    const oneSecondAgo = now - 1000;
    const recentCompletions = this.completionTimes.filter((_, index) => {
      const completionTime = now - (this.completionTimes.length - index - 1) * 16; // Approximate
      return completionTime > oneSecondAgo;
    });
    this.performanceMetrics.animationsPerSecond = recentCompletions.length;

    this.performanceMetrics.lastCompletionTime = now;

    // Update memory usage
    if (this.config.enableMemoryTracking) {
      this.updateMemoryUsage();
    }
  }

  /**
   * Update memory usage tracking
   */
  private updateMemoryUsage(): void {
    if (!this.config.enableMemoryTracking) {
      return;
    }

    try {
      // Estimate memory usage based on engine state
      const estimatedMemory =
        JSON.stringify(this.state).length * 2 + // State serialization
        JSON.stringify(this.performanceMetrics).length * 2 + // Metrics serialization
        this.completionTimes.length * 8; // Completion times array

      this.memoryUsage = estimatedMemory;
      this.performanceMetrics.totalMemoryUsage += estimatedMemory;
      this.performanceMetrics.peakMemoryUsage = Math.max(this.performanceMetrics.peakMemoryUsage, estimatedMemory);
    } catch (error) {
      if (this.config.enableLogging) {
        log.warn("NoOpAnimationEngine: Failed to update memory usage", error);
      }
    }
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.isActive = false;
    this.state.isActive = false;
    this.completionTimes = [];
    this.memoryUsage = 0;

    if (this.config.enableLogging) {
      log.debug("NoOpAnimationEngine: Cleaned up");
    }
  }
}

// Global no-op animation engine instance
let globalNoOpAnimationEngine: NoOpAnimationEngine | null = null;

/**
 * Get or create the global no-op animation engine
 */
export function getNoOpAnimationEngine(config?: Partial<NoOpAnimationConfig>): NoOpAnimationEngine {
  if (!globalNoOpAnimationEngine) {
    globalNoOpAnimationEngine = new NoOpAnimationEngine(config);
  }
  return globalNoOpAnimationEngine;
}

/**
 * Create a new no-op animation engine instance
 */
export function createNoOpAnimationEngine(config?: Partial<NoOpAnimationConfig>): NoOpAnimationEngine {
  return new NoOpAnimationEngine(config);
}

/**
 * Cleanup the global no-op animation engine
 */
export function cleanupNoOpAnimationEngine(): void {
  if (globalNoOpAnimationEngine) {
    globalNoOpAnimationEngine.cleanup();
    globalNoOpAnimationEngine = null;
  }
}
