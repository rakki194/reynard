/**
 * No-Op Animation Engine
 * 
 * Provides immediate completion for disabled animations with performance monitoring.
 * Memory-efficient fallback engine that completes animations instantly without visual effects.
 * 
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { AnimationEngine, AnimationConfig, AnimationResult, AnimationState } from "../types";

export interface NoOpAnimationConfig extends AnimationConfig {
  /** Whether to enable performance monitoring */
  enablePerformanceMonitoring: boolean;
  /** Whether to enable memory usage tracking */
  enableMemoryTracking: boolean;
  /** Whether to log completion events */
  enableLogging: boolean;
  /** Custom completion delay in milliseconds (default: 0) */
  completionDelay: number;
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

export interface NoOpAnimationState extends AnimationState {
  /** Whether the engine is active */
  isActive: boolean;
  /** Current performance metrics */
  performanceMetrics: NoOpPerformanceMetrics;
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

  constructor(config: Partial<NoOpAnimationConfig> = {}) {
    this.config = {
      duration: 0,
      easing: "linear",
      delay: 0,
      iterations: 1,
      direction: "normal",
      fillMode: "both",
      enablePerformanceMonitoring: true,
      enableMemoryTracking: true,
      enableLogging: false,
      completionDelay: 0,
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
      isAnimating: false,
      progress: 0,
      currentTime: 0,
      isActive: false,
      performanceMetrics: this.performanceMetrics,
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
      console.log("NoOpAnimationEngine: Initialized with immediate completion");
    }
  }

  /**
   * Start an animation with immediate completion
   */
  async start(
    element: HTMLElement,
    properties: Record<string, any>,
    config?: Partial<NoOpAnimationConfig>
  ): Promise<AnimationResult> {
    const startTime = performance.now();
    const mergedConfig = { ...this.config, ...config };

    if (this.config.enableLogging) {
      console.log("NoOpAnimationEngine: Starting immediate completion animation", { properties, config: mergedConfig });
    }

    // Update state
    this.state.isAnimating = true;
    this.state.progress = 0;
    this.state.currentTime = 0;

    // Apply properties immediately
    this.applyProperties(element, properties);

    // Wait for completion delay if specified
    if (mergedConfig.completionDelay > 0) {
      await this.delay(mergedConfig.completionDelay);
    }

    // Complete immediately
    const completionTime = performance.now();
    const duration = completionTime - startTime;

    // Update performance metrics
    this.updatePerformanceMetrics(duration);

    // Update state
    this.state.isAnimating = false;
    this.state.progress = 1;
    this.state.currentTime = mergedConfig.duration || 0;

    const result: AnimationResult = {
      success: true,
      duration,
      progress: 1,
      completed: true,
      cancelled: false,
      error: null,
      performanceMetrics: {
        startTime,
        endTime: completionTime,
        duration,
        memoryUsage: this.memoryUsage,
        frameCount: 1,
        averageFrameTime: duration,
      },
    };

    if (this.config.enableLogging) {
      console.log("NoOpAnimationEngine: Animation completed immediately", result);
    }

    return result;
  }

  /**
   * Stop an animation (immediate completion)
   */
  async stop(): Promise<AnimationResult> {
    const stopTime = performance.now();

    if (this.config.enableLogging) {
      console.log("NoOpAnimationEngine: Stopping animation with immediate completion");
    }

    // Update state
    this.state.isAnimating = false;
    this.state.progress = 1;
    this.state.currentTime = this.config.duration || 0;

    const result: AnimationResult = {
      success: true,
      duration: 0,
      progress: 1,
      completed: true,
      cancelled: false,
      error: null,
      performanceMetrics: {
        startTime: stopTime,
        endTime: stopTime,
        duration: 0,
        memoryUsage: this.memoryUsage,
        frameCount: 1,
        averageFrameTime: 0,
      },
    };

    return result;
  }

  /**
   * Pause an animation (no-op since we complete immediately)
   */
  async pause(): Promise<AnimationResult> {
    if (this.config.enableLogging) {
      console.log("NoOpAnimationEngine: Pause requested (no-op)");
    }

    return {
      success: true,
      duration: 0,
      progress: this.state.progress,
      completed: true,
      cancelled: false,
      error: null,
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
      console.log("NoOpAnimationEngine: Resume requested (no-op)");
    }

    return {
      success: true,
      duration: 0,
      progress: this.state.progress,
      completed: true,
      cancelled: false,
      error: null,
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
      performanceMetrics: { ...this.performanceMetrics },
      memoryUsage: this.memoryUsage,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<NoOpAnimationConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (this.config.enableLogging) {
      console.log("NoOpAnimationEngine: Configuration updated", this.config);
    }
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
      console.log("NoOpAnimationEngine: Performance metrics reset");
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
      console.log("NoOpAnimationEngine: Engine activated");
    }
  }

  /**
   * Deactivate the engine
   */
  deactivate(): void {
    this.isActive = false;
    this.state.isActive = false;

    if (this.config.enableLogging) {
      console.log("NoOpAnimationEngine: Engine deactivated");
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
        console.warn("NoOpAnimationEngine: Failed to apply properties", error);
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
      this.performanceMetrics.peakMemoryUsage = Math.max(
        this.performanceMetrics.peakMemoryUsage,
        estimatedMemory
      );
    } catch (error) {
      if (this.config.enableLogging) {
        console.warn("NoOpAnimationEngine: Failed to update memory usage", error);
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
      console.log("NoOpAnimationEngine: Cleaned up");
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
