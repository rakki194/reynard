/**
 * 🦊 Stroboscopic Animation Demo
 * Demonstrates advanced stroboscopic effects based on research
 */

import { Component, createSignal, onMount, onCleanup } from "solid-js";
import { Card, Button } from "reynard-components";
import { StroboscopicEngine } from "../utils/animation/StroboscopicEngine";
import { createAnimationCore } from "../utils/animation/AnimationCore";
// import type { AnimationConfig } from "../utils/animation/AnimationTypes";
import "./StroboscopicDemo.css";

export const StroboscopicDemo: Component = () => {
  console.log("🦊 StroboscopicDemo: Initializing");

  // State
  const [isRunning, setIsRunning] = createSignal(false);
  const [rotationSpeed, setRotationSpeed] = createSignal(1.0);
  const [frameRate, setFrameRate] = createSignal(60);
  const [enableMorphing, setEnableMorphing] = createSignal(true);
  const [enableTemporalAliasing, setEnableTemporalAliasing] = createSignal(true);
  const [stroboscopicState, setStroboscopicState] = createSignal<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = createSignal<any>(null);

  // Engines
  let stroboscopicEngine: StroboscopicEngine;
  let animationCore: ReturnType<typeof createAnimationCore>;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  // Initialize engines
  const initializeEngines = () => {
    console.log("🦊 StroboscopicDemo: Initializing engines");

    stroboscopicEngine = new StroboscopicEngine({
      frameRate: frameRate(),
      rotationSpeed: rotationSpeed(),
      enableTemporalAliasing: enableTemporalAliasing(),
      enableMorphingEffects: enableMorphing(),
    });

    animationCore = createAnimationCore({
      frameRate: frameRate(),
      maxFPS: 120,
      enableVSync: true,
      enablePerformanceMonitoring: true,
    });
  };

  // Generate phyllotactic points
  const generatePhyllotacticPoints = (count: number = 1000) => {
    const points = [];
    const goldenAngle = (137.5 * Math.PI) / 180;
    const centerX = 400;
    const centerY = 300;

    for (let i = 0; i < count; i++) {
      const radius = 10 * Math.sqrt(i);
      const angle = i * goldenAngle;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      points.push({
        x,
        y,
        radius,
        angle,
        index: i,
      });
    }

    return points;
  };

  // Render points
  const renderPoints = (points: any[], stroboscopicIntensity: number = 0) => {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw points
    points.forEach((point, index) => {
      const size = 2 + Math.sin(index * 0.1) * 1;
      const alpha = 0.8 + stroboscopicIntensity * 0.2;

      // Color based on golden angle
      const hue = ((point.angle * 180) / Math.PI) % 360;
      ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;

      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw stroboscopic indicator
    if (stroboscopicIntensity > 0) {
      ctx.fillStyle = `rgba(255, 255, 0, ${stroboscopicIntensity})`;
      ctx.fillRect(10, 10, 20, 20);
    }
  };

  // Animation loop
  let points = generatePhyllotacticPoints();
  let currentAngle = 0;

  const animate = (deltaTime: number) => {
    if (!isRunning()) return;

    // Update rotation
    currentAngle += (rotationSpeed() * deltaTime) / 16.67;

    // Apply stroboscopic effects
    const stroboscopicState = stroboscopicEngine.calculateStroboscopicEffect(deltaTime);
    setStroboscopicState(stroboscopicState);

    // Transform points
    let transformedPoints = points;
    if (stroboscopicState.isStroboscopic) {
      transformedPoints = stroboscopicEngine
        .applyStroboscopicTransform(points, deltaTime)
        .map((point, index) => ({ ...point, index }));
    }

    // Rotate points
    const rotatedPoints = transformedPoints.map(point => {
      const cos = Math.cos(currentAngle);
      const sin = Math.sin(currentAngle);
      const dx = point.x - 400;
      const dy = point.y - 300;

      return {
        ...point,
        x: 400 + dx * cos - dy * sin,
        y: 300 + dx * sin + dy * cos,
      };
    });

    // Render
    renderPoints(rotatedPoints, stroboscopicState.temporalAliasing);

    // Update performance metrics
    setPerformanceMetrics(animationCore.getPerformanceStats());
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
    stroboscopicEngine.updateConfig({
      frameRate: frameRate(),
      rotationSpeed: rotationSpeed(),
      enableTemporalAliasing: enableTemporalAliasing(),
      enableMorphingEffects: enableMorphing(),
    });

    animationCore.updateConfig({
      frameRate: frameRate(),
    });
  };

  // Lifecycle
  onMount(() => {
    console.log("🦊 StroboscopicDemo: onMount - setting up canvas");
    canvas = document.getElementById("stroboscopic-canvas") as HTMLCanvasElement;
    if (canvas) {
      ctx = canvas.getContext("2d")!;
      canvas.width = 800;
      canvas.height = 600;
    }

    initializeEngines();
    renderPoints(points);
  });

  onCleanup(() => {
    if (animationCore) {
      animationCore.stop();
    }
  });

  return (
    <div class="stroboscopic-demo">
      <div class="demo-header">
        <h2>🦊 Advanced Stroboscopic Animation</h2>
        <p>Demonstrates cutting-edge stroboscopic effects based on research</p>
      </div>

      <div class="demo-content">
        <div class="demo-controls">
          <Card class="control-panel">
            <h3>Animation Controls</h3>

            <div class="control-group">
              <Button variant={isRunning() ? "danger" : "primary"} onClick={toggleAnimation} class="control-button">
                {isRunning() ? "⏹️ Stop" : "▶️ Start"}
              </Button>
            </div>

            <div class="control-group">
              <label>Rotation Speed: {rotationSpeed().toFixed(2)}</label>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={rotationSpeed()}
                onInput={(e: any) => {
                  setRotationSpeed(parseFloat(e.currentTarget.value));
                  updateConfig();
                }}
              />
            </div>

            <div class="control-group">
              <label>Frame Rate: {frameRate()}</label>
              <input
                type="range"
                min="30"
                max="120"
                step="10"
                value={frameRate()}
                onInput={(e: any) => {
                  setFrameRate(parseInt(e.currentTarget.value));
                  updateConfig();
                }}
              />
            </div>

            <div class="control-group">
              <input
                type="checkbox"
                checked={enableMorphing()}
                onChange={e => setEnableMorphing(e.currentTarget.checked)}
              />
              <label>Enable Morphing Effects</label>
            </div>

            <div class="control-group">
              <input
                type="checkbox"
                checked={enableTemporalAliasing()}
                onChange={e => setEnableTemporalAliasing(e.currentTarget.checked)}
              />
              <label>Enable Temporal Aliasing</label>
            </div>
          </Card>

          <Card class="status-panel">
            <h3>Stroboscopic Status</h3>
            <div class="status-info">
              <div class="status-item">
                <span class="status-label">Active:</span>
                <span class={`status-value ${stroboscopicState()?.isStroboscopic ? "active" : "inactive"}`}>
                  {stroboscopicState()?.isStroboscopic ? "Yes" : "No"}
                </span>
              </div>
              <div class="status-item">
                <span class="status-label">Motion:</span>
                <span class="status-value">{stroboscopicState()?.apparentMotion || "None"}</span>
              </div>
              <div class="status-item">
                <span class="status-label">Phase:</span>
                <span class="status-value">{stroboscopicState()?.stroboscopicPhase?.toFixed(3) || "0.000"}</span>
              </div>
              <div class="status-item">
                <span class="status-label">Intensity:</span>
                <span class="status-value">{stroboscopicState()?.temporalAliasing?.toFixed(3) || "0.000"}</span>
              </div>
            </div>
          </Card>

          <Card class="performance-panel">
            <h3>Performance Metrics</h3>
            <div class="performance-info">
              <div class="performance-item">
                <span class="performance-label">FPS:</span>
                <span class="performance-value">{performanceMetrics()?.currentFPS?.toFixed(1) || "0.0"}</span>
              </div>
              <div class="performance-item">
                <span class="performance-label">Frame Time:</span>
                <span class="performance-value">{performanceMetrics()?.frameTime?.toFixed(2) || "0.00"}ms</span>
              </div>
              <div class="performance-item">
                <span class="performance-label">Render Time:</span>
                <span class="performance-value">{performanceMetrics()?.renderTime?.toFixed(2) || "0.00"}ms</span>
              </div>
            </div>
          </Card>
        </div>

        <div class="demo-visualization">
          <Card class="canvas-container">
            <canvas id="stroboscopic-canvas" class="demo-canvas"></canvas>
            <div class="canvas-overlay">
              <div class="overlay-info">
                <h4>Phyllotactic Spiral with Stroboscopic Effects</h4>
                <p>Yellow indicator shows stroboscopic activity</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div class="demo-info">
        <Card class="info-panel">
          <h3>Research-Based Features</h3>
          <ul>
            <li>
              <strong>Temporal Aliasing:</strong> Mathematical model for stroboscopic effects
            </li>
            <li>
              <strong>Morphing Effects:</strong> Advanced pattern transformations
            </li>
            <li>
              <strong>Golden Angle Sync:</strong> 137.5° synchronization for optimal effects
            </li>
            <li>
              <strong>Performance Monitoring:</strong> Real-time metrics and optimization
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
