/**
 * 🦊 Performance-Optimized Animation Engine
 * Advanced performance optimizations for large-scale phyllotactic animations
 * Based on research findings and best practices
 */

// import { createSignal, onCleanup } from "solid-js";

export interface PerformanceConfig {
  maxPoints: number;
  targetFPS: number;
  enableAdaptiveQuality: boolean;
  enableSpatialCulling: boolean;
  enableLOD: boolean;
  enableBatching: boolean;
  enableWebWorkers: boolean;
  memoryLimit: number; // MB
}

export interface PerformanceMetrics {
  currentFPS: number;
  averageFPS: number;
  frameTime: number;
  renderTime: number;
  updateTime: number;
  memoryUsage: number;
  pointCount: number;
  qualityLevel: number;
  isThrottled: boolean;
}

export interface AdaptiveQualityLevel {
  level: number;
  pointCount: number;
  updateFrequency: number;
  renderQuality: number;
  description: string;
}

export class PerformanceOptimizedEngine {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics;
  private qualityLevels: AdaptiveQualityLevel[];
  private currentQualityLevel: number = 0;
  private frameHistory: number[] = [];
  private performanceHistory: PerformanceMetrics[] = [];
  private isThrottled: boolean = false;
  private lastUpdateTime: number = 0;
  private updateCounter: number = 0;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      maxPoints: 10000,
      targetFPS: 60,
      enableAdaptiveQuality: true,
      enableSpatialCulling: true,
      enableLOD: true,
      enableBatching: true,
      enableWebWorkers: false,
      memoryLimit: 100,
      ...config,
    };

    this.metrics = {
      currentFPS: 0,
      averageFPS: 0,
      frameTime: 0,
      renderTime: 0,
      updateTime: 0,
      memoryUsage: 0,
      pointCount: 0,
      qualityLevel: 0,
      isThrottled: false,
    };

    this.qualityLevels = this.initializeQualityLevels();
  }

  /**
   * Initialize adaptive quality levels
   */
  private initializeQualityLevels(): AdaptiveQualityLevel[] {
    this.qualityLevels = [
      {
        level: 0,
        pointCount: this.config.maxPoints,
        updateFrequency: 1,
        renderQuality: 1.0,
        description: "Ultra High Quality",
      },
      {
        level: 1,
        pointCount: Math.floor(this.config.maxPoints * 0.8),
        updateFrequency: 1,
        renderQuality: 0.9,
        description: "High Quality",
      },
      {
        level: 2,
        pointCount: Math.floor(this.config.maxPoints * 0.6),
        updateFrequency: 1,
        renderQuality: 0.8,
        description: "Medium Quality",
      },
      {
        level: 3,
        pointCount: Math.floor(this.config.maxPoints * 0.4),
        updateFrequency: 2,
        renderQuality: 0.7,
        description: "Low Quality",
      },
      {
        level: 4,
        pointCount: Math.floor(this.config.maxPoints * 0.2),
        updateFrequency: 3,
        renderQuality: 0.6,
        description: "Minimal Quality",
      },
    ];

    return this.qualityLevels;
  }

  /**
   * Update performance metrics
   */
  updateMetrics(
    frameTime: number,
    renderTime: number,
    updateTime: number,
    pointCount: number,
  ): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastUpdateTime;

    if (deltaTime > 0) {
      const currentFPS = 1000 / deltaTime;
      this.frameHistory.push(currentFPS);

      // Keep only last 60 frames
      if (this.frameHistory.length > 60) {
        this.frameHistory.shift();
      }

      const averageFPS =
        this.frameHistory.reduce((sum, fps) => sum + fps, 0) /
        this.frameHistory.length;

      this.metrics = {
        currentFPS,
        averageFPS,
        frameTime,
        renderTime,
        updateTime,
        memoryUsage: this.estimateMemoryUsage(pointCount),
        pointCount,
        qualityLevel: this.currentQualityLevel,
        isThrottled: this.isThrottled,
      };

      this.performanceHistory.push({ ...this.metrics });
      if (this.performanceHistory.length > 100) {
        this.performanceHistory.shift();
      }

      // Adaptive quality adjustment
      if (this.config.enableAdaptiveQuality) {
        this.adjustQualityLevel();
      }
    }

    this.lastUpdateTime = currentTime;
  }

  /**
   * Adjust quality level based on performance
   */
  private adjustQualityLevel(): void {
    const targetFPS = this.config.targetFPS;
    const currentFPS = this.metrics.averageFPS;
    const fpsRatio = currentFPS / targetFPS;

    // If performance is poor, reduce quality
    if (
      fpsRatio < 0.8 &&
      this.currentQualityLevel < this.qualityLevels.length - 1
    ) {
      this.currentQualityLevel++;
      this.isThrottled = true;
      console.log(
        `🦊 PerformanceOptimizedEngine: Reducing quality to level ${this.currentQualityLevel}`,
      );
    }
    // If performance is good, increase quality
    else if (fpsRatio > 1.2 && this.currentQualityLevel > 0) {
      this.currentQualityLevel--;
      this.isThrottled = false;
      console.log(
        `🦊 PerformanceOptimizedEngine: Increasing quality to level ${this.currentQualityLevel}`,
      );
    }
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(pointCount: number): number {
    // Rough estimate: each point uses ~64 bytes
    const bytesPerPoint = 64;
    const totalBytes = pointCount * bytesPerPoint;
    return totalBytes / (1024 * 1024); // Convert to MB
  }

  /**
   * Apply spatial culling to reduce rendered points
   */
  applySpatialCulling(
    points: Array<{ x: number; y: number; z?: number }>,
    viewport: { x: number; y: number; width: number; height: number },
  ): Array<{ x: number; y: number; z?: number }> {
    if (!this.config.enableSpatialCulling) return points;

    const qualityLevel = this.qualityLevels[this.currentQualityLevel];
    const maxPoints = qualityLevel.pointCount;

    if (points.length <= maxPoints) return points;

    // Simple distance-based culling
    const centerX = viewport.x + viewport.width / 2;
    const centerY = viewport.y + viewport.height / 2;

    const pointsWithDistance = points.map((point) => ({
      ...point,
      distance: Math.sqrt(
        Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2),
      ),
    }));

    // Sort by distance and take closest points
    pointsWithDistance.sort((a, b) => a.distance - b.distance);

    return pointsWithDistance
      .slice(0, maxPoints)
      .map(({ distance, ...point }) => point);
  }

  /**
   * Apply level-of-detail (LOD) optimization
   */
  applyLOD(
    points: Array<{ x: number; y: number; z?: number; size?: number }>,
    _cameraDistance: number = 1,
  ): Array<{ x: number; y: number; z?: number; size?: number }> {
    if (!this.config.enableLOD) return points;

    const qualityLevel = this.qualityLevels[this.currentQualityLevel];
    const lodFactor = qualityLevel.renderQuality;

    return points.map((point) => ({
      ...point,
      size: (point.size || 1) * lodFactor,
    }));
  }

  /**
   * Check if update should be skipped (throttling)
   */
  shouldSkipUpdate(): boolean {
    if (!this.isThrottled) return false;

    const qualityLevel = this.qualityLevels[this.currentQualityLevel];
    this.updateCounter++;

    return this.updateCounter % qualityLevel.updateFrequency !== 0;
  }

  /**
   * Get current quality level configuration
   */
  getCurrentQualityLevel(): AdaptiveQualityLevel {
    return this.qualityLevels[this.currentQualityLevel];
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(): PerformanceMetrics[] {
    return [...this.performanceHistory];
  }

  /**
   * Force quality level
   */
  setQualityLevel(level: number): void {
    if (level >= 0 && level < this.qualityLevels.length) {
      this.currentQualityLevel = level;
      this.isThrottled = level > 0;
      console.log(
        `🦊 PerformanceOptimizedEngine: Quality level set to ${level}`,
      );
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeQualityLevels();
  }

  /**
   * Get current configuration
   */
  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * Reset performance tracking
   */
  reset(): void {
    this.frameHistory = [];
    this.performanceHistory = [];
    this.currentQualityLevel = 0;
    this.isThrottled = false;
    this.updateCounter = 0;
    this.lastUpdateTime = 0;
  }
}
