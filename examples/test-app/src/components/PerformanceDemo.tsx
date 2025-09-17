/**
 * 🦊 Performance Optimization Demo
 * Demonstrates adaptive quality, spatial culling, and LOD optimization
 */

import { Component, createSignal, onMount, onCleanup } from "solid-js";
import { Card, Button } from "reynard-components";
import { PerformanceOptimizedEngine } from "../utils/animation/PerformanceOptimizedEngine";
import { createAnimationCore } from "../utils/animation/AnimationCore";
// import type { AnimationConfig } from "../utils/animation/AnimationTypes";
import "./PerformanceDemo.css";

export const PerformanceDemo: Component = () => {
  console.log("🦊 PerformanceDemo: Initializing");

  // State
  const [isRunning, setIsRunning] = createSignal(false);
  const [maxPoints, setMaxPoints] = createSignal(10000);
  const [targetFPS, setTargetFPS] = createSignal(60);
  const [enableAdaptiveQuality, setEnableAdaptiveQuality] = createSignal(true);
  const [enableSpatialCulling, setEnableSpatialCulling] = createSignal(true);
  const [enableLOD, setEnableLOD] = createSignal(true);
  const [enableBatching, setEnableBatching] = createSignal(true);
  const [currentPoints, setCurrentPoints] = createSignal<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = createSignal<any>(null);
  const [qualityLevel, setQualityLevel] = createSignal<any>(null);

  // Engines
  let performanceEngine: PerformanceOptimizedEngine;
  let animationCore: ReturnType<typeof createAnimationCore>;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  // Initialize engines
  const initializeEngines = () => {
    console.log("🦊 PerformanceDemo: Initializing engines");

    performanceEngine = new PerformanceOptimizedEngine({
      maxPoints: maxPoints(),
      targetFPS: targetFPS(),
      enableAdaptiveQuality: enableAdaptiveQuality(),
      enableSpatialCulling: enableSpatialCulling(),
      enableLOD: enableLOD(),
      enableBatching: enableBatching(),
    });

    animationCore = createAnimationCore({
      frameRate: targetFPS(),
      maxFPS: targetFPS() * 2,
      enableVSync: true,
      enablePerformanceMonitoring: true,
    });
  };

  // Generate test points
  const generateTestPoints = (count: number) => {
    const points = [];
    const centerX = 400;
    const centerY = 300;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 50 + Math.random() * 200;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      points.push({
        x,
        y,
        size: 1 + Math.random() * 3,
        color: `hsl(${(i * 137.5) % 360}, 70%, 60%)`,
        index: i,
      });
    }

    return points;
  };

  // Render points with performance optimizations
  const renderPoints = (points: any[]) => {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply spatial culling
    const culledPoints = performanceEngine.applySpatialCulling(points, {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
    });

    // Apply LOD
    const lodPoints = performanceEngine.applyLOD(culledPoints);

    // Render points
    lodPoints.forEach((point, index) => {
      const size = point.size || 2;
      // const alpha = 0.8;

      ctx.fillStyle = (point as any).color || `hsl(${(index * 137.5) % 360}, 70%, 60%)`;

      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw performance info
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "16px Arial";
    ctx.fillText(`Original: ${points.length} points`, 20, 30);
    ctx.fillText(`Rendered: ${lodPoints.length} points`, 20, 50);
    ctx.fillText(`Culling: ${((1 - lodPoints.length / points.length) * 100).toFixed(1)}%`, 20, 70);
  };

  // Animation loop
  let allPoints = generateTestPoints(maxPoints());

  const animate = (deltaTime: number) => {
    if (!isRunning()) return;

    // Check if update should be skipped (throttling)
    if (performanceEngine.shouldSkipUpdate()) {
      return;
    }

    // Rotate points
    const rotatedPoints = allPoints.map(point => {
      const centerX = 400;
      const centerY = 300;
      const angle = deltaTime * 0.001;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const dx = point.x - centerX;
      const dy = point.y - centerY;

      return {
        ...point,
        x: centerX + dx * cos - dy * sin,
        y: centerY + dx * sin + dy * cos,
      };
    });

    setCurrentPoints(rotatedPoints);
    renderPoints(rotatedPoints);

    // Update performance metrics
    const frameStartTime = performance.now();
    const renderStartTime = performance.now();
    const updateStartTime = performance.now();

    const frameTime = performance.now() - frameStartTime;
    const renderTime = performance.now() - renderStartTime;
    const updateTime = performance.now() - updateStartTime;

    performanceEngine.updateMetrics(frameTime, renderTime, updateTime, rotatedPoints.length);

    setPerformanceMetrics(performanceEngine.getMetrics());
    setQualityLevel(performanceEngine.getCurrentQualityLevel());
  };

  // Start/stop animation
  const toggleAnimation = () => {
    if (isRunning()) {
      setIsRunning(false);
      animationCore.stop();
    } else {
      setIsRunning(true);
      animationCore.start({
        onUpdate: animate,
        onRender: () => {
          // Render handled in animate
        },
      });
    }
  };

  // Update configuration
  const updateConfig = () => {
    performanceEngine.updateConfig({
      maxPoints: maxPoints(),
      targetFPS: targetFPS(),
      enableAdaptiveQuality: enableAdaptiveQuality(),
      enableSpatialCulling: enableSpatialCulling(),
      enableLOD: enableLOD(),
      enableBatching: enableBatching(),
    });

    animationCore.updateConfig({
      frameRate: targetFPS(),
    });

    // Regenerate points
    allPoints = generateTestPoints(maxPoints());
    setCurrentPoints(allPoints);
    renderPoints(allPoints);
  };

  // Force quality level
  const forceQualityLevel = (level: number) => {
    performanceEngine.setQualityLevel(level);
    setQualityLevel(performanceEngine.getCurrentQualityLevel());
  };

  // Lifecycle
  onMount(() => {
    console.log("🦊 PerformanceDemo: onMount - setting up canvas");
    canvas = document.getElementById("performance-canvas") as HTMLCanvasElement;
    if (canvas) {
      ctx = canvas.getContext("2d")!;
      canvas.width = 800;
      canvas.height = 600;
    }

    initializeEngines();
    allPoints = generateTestPoints(maxPoints());
    setCurrentPoints(allPoints);
    renderPoints(allPoints);
  });

  onCleanup(() => {
    if (animationCore) {
      animationCore.stop();
    }
  });

  return (
    <div class="performance-demo">
      <div class="demo-header">
        <h2>🦊 Performance Optimization Demo</h2>
        <p>Demonstrates adaptive quality, spatial culling, and LOD optimization</p>
      </div>

      <div class="demo-content">
        <div class="demo-controls">
          <Card class="performance-controls">
            <h3>Performance Configuration</h3>

            <div class="control-group">
              <label>Max Points: {maxPoints()}</label>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={maxPoints()}
                onInput={(e: any) => {
                  setMaxPoints(parseInt(e.currentTarget.value));
                  updateConfig();
                }}
              />
            </div>

            <div class="control-group">
              <label>Target FPS: {targetFPS()}</label>
              <input
                type="range"
                min="30"
                max="120"
                step="10"
                value={targetFPS()}
                onInput={(e: any) => {
                  setTargetFPS(parseInt(e.currentTarget.value));
                  updateConfig();
                }}
              />
            </div>

            <div class="control-group">
              <input
                type="checkbox"
                checked={enableAdaptiveQuality()}
                onChange={e => setEnableAdaptiveQuality(e.currentTarget.checked)}
              />
              <label>Enable Adaptive Quality</label>
            </div>

            <div class="control-group">
              <input
                type="checkbox"
                checked={enableSpatialCulling()}
                onChange={e => setEnableSpatialCulling(e.currentTarget.checked)}
              />
              <label>Enable Spatial Culling</label>
            </div>

            <div class="control-group">
              <input type="checkbox" checked={enableLOD()} onChange={e => setEnableLOD(e.currentTarget.checked)} />
              <label>Enable Level of Detail</label>
            </div>

            <div class="control-group">
              <input
                type="checkbox"
                checked={enableBatching()}
                onChange={e => setEnableBatching(e.currentTarget.checked)}
              />
              <label>Enable Batching</label>
            </div>

            <div class="control-group">
              <Button
                variant="secondary"
                onClick={() => {
                  allPoints = generateTestPoints(maxPoints());
                  setCurrentPoints(allPoints);
                  renderPoints(allPoints);
                }}
                class="control-button"
              >
                🔄 Regenerate Points
              </Button>
            </div>

            <div class="control-group">
              <Button variant={isRunning() ? "danger" : "primary"} onClick={toggleAnimation} class="control-button">
                {isRunning() ? "⏹️ Stop Animation" : "▶️ Start Animation"}
              </Button>
            </div>
          </Card>

          <Card class="quality-controls">
            <h3>Quality Level Control</h3>

            <div class="control-group">
              <label>Force Quality Level</label>
              <div class="quality-buttons">
                <Button variant="secondary" size="sm" onClick={() => forceQualityLevel(0)}>
                  Ultra High
                </Button>
                <Button variant="secondary" size="sm" onClick={() => forceQualityLevel(1)}>
                  High
                </Button>
                <Button variant="secondary" size="sm" onClick={() => forceQualityLevel(2)}>
                  Medium
                </Button>
                <Button variant="secondary" size="sm" onClick={() => forceQualityLevel(3)}>
                  Low
                </Button>
                <Button variant="secondary" size="sm" onClick={() => forceQualityLevel(4)}>
                  Minimal
                </Button>
              </div>
            </div>

            <div class="quality-info">
              <div class="quality-item">
                <span class="quality-label">Current Level:</span>
                <span class="quality-value">{qualityLevel()?.level || 0}</span>
              </div>
              <div class="quality-item">
                <span class="quality-label">Description:</span>
                <span class="quality-value">{qualityLevel()?.description || "Ultra High Quality"}</span>
              </div>
              <div class="quality-item">
                <span class="quality-label">Point Count:</span>
                <span class="quality-value">{qualityLevel()?.pointCount || maxPoints()}</span>
              </div>
              <div class="quality-item">
                <span class="quality-label">Update Frequency:</span>
                <span class="quality-value">{qualityLevel()?.updateFrequency || 1}</span>
              </div>
            </div>
          </Card>

          <Card class="metrics-panel">
            <h3>Performance Metrics</h3>
            <div class="metrics-info">
              <div class="metrics-item">
                <span class="metrics-label">FPS:</span>
                <span class="metrics-value">{performanceMetrics()?.currentFPS?.toFixed(1) || "0.0"}</span>
              </div>
              <div class="metrics-item">
                <span class="metrics-label">Average FPS:</span>
                <span class="metrics-value">{performanceMetrics()?.averageFPS?.toFixed(1) || "0.0"}</span>
              </div>
              <div class="metrics-item">
                <span class="metrics-label">Frame Time:</span>
                <span class="metrics-value">{performanceMetrics()?.frameTime?.toFixed(2) || "0.00"}ms</span>
              </div>
              <div class="metrics-item">
                <span class="metrics-label">Render Time:</span>
                <span class="metrics-value">{performanceMetrics()?.renderTime?.toFixed(2) || "0.00"}ms</span>
              </div>
              <div class="metrics-item">
                <span class="metrics-label">Update Time:</span>
                <span class="metrics-value">{performanceMetrics()?.updateTime?.toFixed(2) || "0.00"}ms</span>
              </div>
              <div class="metrics-item">
                <span class="metrics-label">Memory Usage:</span>
                <span class="metrics-value">{performanceMetrics()?.memoryUsage?.toFixed(1) || "0.0"}MB</span>
              </div>
              <div class="metrics-item">
                <span class="metrics-label">Throttled:</span>
                <span class={`metrics-value ${performanceMetrics()?.isThrottled ? "throttled" : "normal"}`}>
                  {performanceMetrics()?.isThrottled ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <div class="demo-visualization">
          <Card class="canvas-container">
            <canvas id="performance-canvas" class="demo-canvas"></canvas>
            <div class="canvas-overlay">
              <div class="overlay-info">
                <h4>Performance Optimized Rendering</h4>
                <p>Original: {currentPoints().length} points</p>
                <p>Quality Level: {qualityLevel()?.level || 0}</p>
                <p>Target FPS: {targetFPS()}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div class="demo-info">
        <Card class="info-panel">
          <h3>Performance Optimization Features</h3>
          <div class="optimization-descriptions">
            <div class="optimization-description">
              <h4>Adaptive Quality</h4>
              <p>Automatically adjusts quality level based on performance to maintain target FPS.</p>
            </div>
            <div class="optimization-description">
              <h4>Spatial Culling</h4>
              <p>Reduces rendered points by culling objects outside the viewport or at distance.</p>
            </div>
            <div class="optimization-description">
              <h4>Level of Detail (LOD)</h4>
              <p>Reduces detail for distant objects to improve performance without visual impact.</p>
            </div>
            <div class="optimization-description">
              <h4>Update Throttling</h4>
              <p>Skips updates when performance is poor to maintain smooth rendering.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
