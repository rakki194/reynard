/**
 * 🦊 Advanced Pattern Generator Demo
 * Demonstrates ROTASE, Bernoulli, and enhanced Vogel patterns
 */

import { Component, createSignal, onMount, onCleanup } from "solid-js";
import { Card, Button, Select } from "reynard-components";
import { AdvancedPatternGenerator } from "../utils/phyllotactic/AdvancedPatternGenerator";
import { createAnimationCore } from "../utils/animation/AnimationCore";
// import type { AnimationConfig } from "../utils/animation/AnimationTypes";
import "./AdvancedPatternDemo.css";

export const AdvancedPatternDemo: Component = () => {
  console.log("🦊 AdvancedPatternDemo: Initializing");

  // State
  const [isRunning, setIsRunning] = createSignal(false);
  const [patternType, setPatternType] = createSignal<"vogel" | "rotase" | "bernoulli" | "fibonacci-sibling">("vogel");
  const [pointCount, setPointCount] = createSignal(1000);
  const [baseRadius, setBaseRadius] = createSignal(10);
  const [growthFactor, setGrowthFactor] = createSignal(1.0);
  const [enableMorphing, setEnableMorphing] = createSignal(false);
  const [enableColorHarmonics, setEnableColorHarmonics] = createSignal(true);
  const [currentPoints, setCurrentPoints] = createSignal<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = createSignal<any>(null);

  // Engines
  let patternGenerator: AdvancedPatternGenerator;
  let animationCore: ReturnType<typeof createAnimationCore>;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  // Initialize engines
  const initializeEngines = () => {
    console.log("🦊 AdvancedPatternDemo: Initializing engines");

    patternGenerator = new AdvancedPatternGenerator({
      patternType: patternType(),
      pointCount: pointCount(),
      baseRadius: baseRadius(),
      growthFactor: growthFactor(),
      enableMorphing: enableMorphing(),
      enableColorHarmonics: enableColorHarmonics(),
    });

    animationCore = createAnimationCore({
      frameRate: 60,
      maxFPS: 120,
      enableVSync: true,
      enablePerformanceMonitoring: true,
    });
  };

  // Generate pattern
  const generatePattern = () => {
    console.log("🦊 AdvancedPatternDemo: Generating pattern", patternType());
    const points = patternGenerator.generatePattern();
    setCurrentPoints(points);
    renderPoints(points);
  };

  // Render points
  const renderPoints = (points: any[]) => {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw points
    points.forEach((point, index) => {
      const size = point.size || 2;
      // const alpha = 0.8;

      ctx.fillStyle = point.color || `hsl(${(index * 137.5) % 360}, 70%, 60%)`;

      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw pattern info
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "16px Arial";
    ctx.fillText(`${patternType().toUpperCase()} Pattern`, 20, 30);
    ctx.fillText(`${points.length} points`, 20, 50);
  };

  // Animation loop
  const animate = (deltaTime: number) => {
    if (!isRunning()) return;

    // Simple rotation animation
    const points = currentPoints();
    const rotatedPoints = points.map(point => {
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

    renderPoints(rotatedPoints);

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
    patternGenerator.updateConfig({
      patternType: patternType(),
      pointCount: pointCount(),
      baseRadius: baseRadius(),
      growthFactor: growthFactor(),
      enableMorphing: enableMorphing(),
      enableColorHarmonics: enableColorHarmonics(),
    });

    generatePattern();
  };

  // Lifecycle
  onMount(() => {
    console.log("🦊 AdvancedPatternDemo: onMount - setting up canvas");
    canvas = document.getElementById("pattern-canvas") as HTMLCanvasElement;
    if (canvas) {
      ctx = canvas.getContext("2d")!;
      canvas.width = 800;
      canvas.height = 600;
    }

    initializeEngines();
    generatePattern();
  });

  onCleanup(() => {
    if (animationCore) {
      animationCore.stop();
    }
  });

  return (
    <div class="advanced-pattern-demo">
      <div class="demo-header">
        <h2>🦊 Advanced Pattern Generator</h2>
        <p>Demonstrates ROTASE, Bernoulli, and enhanced Vogel patterns</p>
      </div>

      <div class="demo-content">
        <div class="demo-controls">
          <Card class="pattern-controls">
            <h3>Pattern Configuration</h3>

            <div class="control-group">
              <label>Pattern Type</label>
              <Select
                value={patternType()}
                onChange={(e: any) => {
                  setPatternType(e.currentTarget.value);
                  updateConfig();
                }}
                options={[
                  { value: "vogel", label: "Enhanced Vogel" },
                  { value: "rotase", label: "ROTASE Model" },
                  { value: "bernoulli", label: "Bernoulli Lattice" },
                  { value: "fibonacci-sibling", label: "Fibonacci Sibling" },
                ]}
              />
            </div>

            <div class="control-group">
              <label>Point Count: {pointCount()}</label>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={pointCount()}
                onInput={(e: any) => {
                  setPointCount(parseInt(e.currentTarget.value));
                  updateConfig();
                }}
              />
            </div>

            <div class="control-group">
              <label>Base Radius: {baseRadius()}</label>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={baseRadius()}
                onInput={(e: any) => {
                  setBaseRadius(parseInt(e.currentTarget.value));
                  updateConfig();
                }}
              />
            </div>

            <div class="control-group">
              <label>Growth Factor: {growthFactor().toFixed(2)}</label>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={growthFactor()}
                onInput={(e: any) => {
                  setGrowthFactor(parseFloat(e.currentTarget.value));
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
              <label>Enable Morphing</label>
            </div>

            <div class="control-group">
              <input
                type="checkbox"
                checked={enableColorHarmonics()}
                onChange={e => setEnableColorHarmonics(e.currentTarget.checked)}
              />
              <label>Enable Color Harmonics</label>
            </div>

            <div class="control-group">
              <Button variant="secondary" onClick={generatePattern} class="control-button">
                🔄 Regenerate Pattern
              </Button>
            </div>

            <div class="control-group">
              <Button variant={isRunning() ? "danger" : "primary"} onClick={toggleAnimation} class="control-button">
                {isRunning() ? "⏹️ Stop Animation" : "▶️ Start Animation"}
              </Button>
            </div>
          </Card>

          <Card class="pattern-info">
            <h3>Pattern Information</h3>
            <div class="info-content">
              <div class="info-item">
                <span class="info-label">Type:</span>
                <span class="info-value">{patternType().toUpperCase()}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Points:</span>
                <span class="info-value">{currentPoints().length}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Base Radius:</span>
                <span class="info-value">{baseRadius()}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Growth Factor:</span>
                <span class="info-value">{growthFactor().toFixed(2)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Morphing:</span>
                <span class="info-value">{enableMorphing() ? "Enabled" : "Disabled"}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Color Harmonics:</span>
                <span class="info-value">{enableColorHarmonics() ? "Enabled" : "Disabled"}</span>
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
            <canvas id="pattern-canvas" class="demo-canvas"></canvas>
            <div class="canvas-overlay">
              <div class="overlay-info">
                <h4>{patternType().toUpperCase()} Pattern</h4>
                <p>
                  {currentPoints().length} points with {enableColorHarmonics() ? "color harmonics" : "basic colors"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div class="demo-info">
        <Card class="info-panel">
          <h3>Research-Based Pattern Types</h3>
          <div class="pattern-descriptions">
            <div class="pattern-description">
              <h4>Enhanced Vogel</h4>
              <p>Classic phyllotactic model with morphing capabilities and advanced color harmonics.</p>
            </div>
            <div class="pattern-description">
              <h4>ROTASE Model</h4>
              <p>Galactic spiral equations with Fibonacci sibling sequences for complex natural patterns.</p>
            </div>
            <div class="pattern-description">
              <h4>Bernoulli Lattice</h4>
              <p>Mathematical framework for complex, naturalistic patterns with lattice transformations.</p>
            </div>
            <div class="pattern-description">
              <h4>Fibonacci Sibling</h4>
              <p>Advanced sequence generation using Fibonacci sibling ratios for unique patterns.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
