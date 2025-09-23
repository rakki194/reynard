/**
 * 🌈 Gradient Animation Demo
 * 
 * Comprehensive showcase of animated gradients, color flows, and gradient effects
 */

import { Component, createSignal, For, onMount, onCleanup } from "solid-js";

export const GradientAnimationDemo: Component = () => {
  const [gradientConfig, setGradientConfig] = createSignal({
    type: "linear" as "linear" | "radial" | "conic",
    direction: 45,
    speed: 2000,
    colorCount: 4,
    colorMode: "hsl" as "hsl" | "oklch" | "rgb",
    animationType: "flow" as "flow" | "pulse" | "wave" | "spiral",
    blendMode: "normal" as "normal" | "multiply" | "screen" | "overlay" | "difference"
  });

  const [isAnimating, setIsAnimating] = createSignal(false);
  const [currentHue, setCurrentHue] = createSignal(0);
  const [animationFrame, setAnimationFrame] = createSignal(0);
  const [performance, setPerformance] = createSignal({
    fps: 60,
    frameTime: 16.67,
    isOptimized: true
  });

  // Performance monitoring
  let lastFrameTime = 0;
  let frameCount = 0;
  let fpsStartTime = Date.now();

  const updatePerformance = () => {
    const now = Date.now();
    const frameTime = now - lastFrameTime;
    lastFrameTime = now;
    
    frameCount++;
    if (now - fpsStartTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (now - fpsStartTime));
      setPerformance(prev => ({
        ...prev,
        fps,
        frameTime: Math.round(frameTime * 100) / 100,
        isOptimized: fps >= 55 && frameTime <= 20
      }));
      frameCount = 0;
      fpsStartTime = now;
    }
  };

  const generateGradientColors = (hue: number) => {
    const config = gradientConfig();
    const colors = [];
    
    for (let i = 0; i < config.colorCount; i++) {
      const hueOffset = (i * 360) / config.colorCount;
      const currentHue = (hue + hueOffset) % 360;
      
      switch (config.colorMode) {
        case "oklch":
          colors.push(`oklch(70% 0.2 ${currentHue})`);
          break;
        case "rgb":
          colors.push(hslToRgb(currentHue, 70, 50));
          break;
        case "hsl":
        default:
          colors.push(`hsl(${currentHue}, 70%, 50%)`);
      }
    }
    
    return colors;
  };

  // Helper function to convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 1/6) {
      r = c; g = x; b = 0;
    } else if (1/6 <= h && h < 2/6) {
      r = x; g = c; b = 0;
    } else if (2/6 <= h && h < 3/6) {
      r = 0; g = c; b = x;
    } else if (3/6 <= h && h < 4/6) {
      r = 0; g = x; b = c;
    } else if (4/6 <= h && h < 5/6) {
      r = x; g = 0; b = c;
    } else if (5/6 <= h && h < 1) {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const generateGradient = (hue: number) => {
    const config = gradientConfig();
    const colors = generateGradientColors(hue);
    
    switch (config.type) {
      case "linear":
        return `linear-gradient(${config.direction}deg, ${colors.join(", ")})`;
      case "radial":
        return `radial-gradient(circle, ${colors.join(", ")})`;
      case "conic":
        return `conic-gradient(from ${config.direction}deg, ${colors.join(", ")})`;
      default:
        return `linear-gradient(${config.direction}deg, ${colors.join(", ")})`;
    }
  };

  const startGradientAnimation = () => {
    setIsAnimating(true);
    setAnimationFrame(0);
    const config = gradientConfig();
    
    const startTime = Date.now();
    const animate = () => {
      if (!isAnimating()) return;
      
      updatePerformance();
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / config.speed, 1);
      
      // Debug logging
      if (elapsed % 500 < 16) { // Log every ~500ms
        console.log(`Gradient Animation: elapsed=${elapsed}ms, speed=${config.speed}ms, progress=${(progress * 100).toFixed(1)}%`);
      }
      
      // Different animation types
      let newHue = 0;
      switch (config.animationType) {
        case "flow":
          newHue = (360 * progress) % 360;
          break;
        case "pulse":
          newHue = (Math.sin(progress * Math.PI * 2) * 180 + 180) % 360;
          break;
        case "wave":
          newHue = (Math.sin(progress * Math.PI) * 180 + 180) % 360;
          break;
        case "spiral":
          newHue = (progress * 720) % 360; // Double rotation for spiral effect
          break;
      }

      setCurrentHue(newHue);
      setAnimationFrame(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setAnimationFrame(0);
      }
    };

    requestAnimationFrame(animate);
  };

  const stopGradientAnimation = () => {
    setIsAnimating(false);
    setCurrentHue(0);
  };

  const currentGradient = () => generateGradient(currentHue());

  return (
    <div class="gradient-animation-demo">
      <div class="demo-header">
        <h1 class="page-title">🌈 Gradient Animation Demo</h1>
        <p class="page-description">
          Spectacular animated gradients with flowing colors, dynamic directions, and advanced blend modes.
        </p>
      </div>

      {/* Controls */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>🎛️</span>
          Gradient Controls
        </h2>
        <div class="demo-controls">
          <div class="control-group">
            <label class="control-label">Gradient Type</label>
            <select
              value={gradientConfig().type}
              onChange={(e) => setGradientConfig(prev => ({
                ...prev,
                type: e.currentTarget.value as "linear" | "radial" | "conic"
              }))}
            >
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
              <option value="conic">Conic</option>
            </select>
          </div>

          <div class="control-group">
            <label class="control-label">Direction/Angle</label>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={gradientConfig().direction}
              onInput={(e) => setGradientConfig(prev => ({
                ...prev,
                direction: parseInt(e.currentTarget.value)
              }))}
            />
            <span class="control-value">{gradientConfig().direction}°</span>
          </div>

          <div class="control-group">
            <label class="control-label">Animation Speed (ms)</label>
            <input
              type="range"
              min="1000"
              max="8000"
              step="500"
              value={gradientConfig().speed}
              onInput={(e) => setGradientConfig(prev => ({
                ...prev,
                speed: parseInt(e.currentTarget.value)
              }))}
            />
            <span class="control-value">{gradientConfig().speed}ms</span>
          </div>

          <div class="control-group">
            <label class="control-label">Color Count</label>
            <input
              type="range"
              min="2"
              max="8"
              step="1"
              value={gradientConfig().colorCount}
              onInput={(e) => setGradientConfig(prev => ({
                ...prev,
                colorCount: parseInt(e.currentTarget.value)
              }))}
            />
            <span class="control-value">{gradientConfig().colorCount}</span>
          </div>

          <div class="control-group">
            <label class="control-label">Color Mode</label>
            <select
              value={gradientConfig().colorMode}
              onChange={(e) => setGradientConfig(prev => ({
                ...prev,
                colorMode: e.currentTarget.value as "hsl" | "oklch" | "rgb"
              }))}
            >
              <option value="hsl">HSL</option>
              <option value="oklch">OKLCH</option>
              <option value="rgb">RGB</option>
            </select>
          </div>

          <div class="control-group">
            <label class="control-label">Animation Type</label>
            <select
              value={gradientConfig().animationType}
              onChange={(e) => setGradientConfig(prev => ({
                ...prev,
                animationType: e.currentTarget.value as "flow" | "pulse" | "wave" | "spiral"
              }))}
            >
              <option value="flow">Flow</option>
              <option value="pulse">Pulse</option>
              <option value="wave">Wave</option>
              <option value="spiral">Spiral</option>
            </select>
          </div>

          <div class="control-group">
            <label class="control-label">Blend Mode</label>
            <select
              value={gradientConfig().blendMode}
              onChange={(e) => setGradientConfig(prev => ({
                ...prev,
                blendMode: e.currentTarget.value as "normal" | "multiply" | "screen" | "overlay" | "difference"
              }))}
            >
              <option value="normal">Normal</option>
              <option value="multiply">Multiply</option>
              <option value="screen">Screen</option>
              <option value="overlay">Overlay</option>
              <option value="difference">Difference</option>
            </select>
          </div>

          <div class="control-group">
            <button 
              class="control-button primary" 
              onClick={startGradientAnimation}
              disabled={isAnimating()}
            >
              {isAnimating() ? "🌈 Animating..." : "🌈 Start Animation"}
            </button>
            <button 
              class="control-button" 
              onClick={stopGradientAnimation}
              disabled={!isAnimating()}
            >
              ⏹️ Stop Animation
            </button>
          </div>
        </div>
      </div>

      {/* Gradient Showcase */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>🎨</span>
          Gradient Showcase
        </h2>
        <div class="gradient-showcase">
          <div 
            class="gradient-display"
            style={{
              "background": currentGradient(),
              "mix-blend-mode": gradientConfig().blendMode
            }}
          >
            <div class="gradient-overlay">
              <h3>Animated Gradient</h3>
              <p>Type: {gradientConfig().type}</p>
              <p>Direction: {gradientConfig().direction}°</p>
              <p>Colors: {gradientConfig().colorCount}</p>
              <p>Mode: {gradientConfig().colorMode.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Gallery */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>🖼️</span>
          Gradient Gallery
        </h2>
        <div class="gradient-gallery">
          <For each={generateGradientColors(currentHue())}>
            {(color, index) => (
              <div
                class="gradient-swatch"
                style={{
                  "background": `linear-gradient(45deg, ${color}, transparent)`,
                  "--animation-delay": `${index() * 100}ms`
                }}
              >
                <div class="gradient-info">
                  <div class="gradient-color">{color}</div>
                  <div class="gradient-index">#{index() + 1}</div>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Animation Status */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>📊</span>
          Animation Status & Performance
        </h2>
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">Is Animating:</span>
            <span class="status-value">
              {isAnimating() ? "Yes" : "No"}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Current Hue:</span>
            <span class="status-value">{Math.round(currentHue())}°</span>
          </div>
          <div class="status-item">
            <span class="status-label">Animation Progress:</span>
            <span class="status-value">{Math.round(animationFrame() * 100)}%</span>
          </div>
          <div class="status-item">
            <span class="status-label">FPS:</span>
            <span class="status-value" style={{ color: performance().isOptimized ? 'var(--color-success)' : 'var(--color-warning)' }}>
              {performance().fps}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Frame Time:</span>
            <span class="status-value">{performance().frameTime}ms</span>
          </div>
          <div class="status-item">
            <span class="status-label">Performance:</span>
            <span class="status-value" style={{ color: performance().isOptimized ? 'var(--color-success)' : 'var(--color-warning)' }}>
              {performance().isOptimized ? "Optimized" : "Needs Optimization"}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Gradient Type:</span>
            <span class="status-value">{gradientConfig().type}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Animation Type:</span>
            <span class="status-value">{gradientConfig().animationType}</span>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>💻</span>
          Code Example
        </h2>
        <pre class="code-example">
{`// Gradient Animation Demo - Advanced CSS Gradients
// Key Features:
// - Linear, radial, and conic gradient support
// - Dynamic color generation and animation
// - Blend mode effects and color space support
// - Performance monitoring and optimization
// - Real-time gradient manipulation

const generateGradient = (hue: number) => {
  const colors = generateGradientColors(hue);
  return \`linear-gradient(\${direction}deg, \${colors.join(", ")})\`;
};

// Animation loop with performance monitoring
const animate = () => {
  updatePerformance();
  const newHue = (360 * progress) % 360;
  setCurrentHue(newHue);
  if (progress < 1) requestAnimationFrame(animate);
};`}
        </pre>
      </div>
    </div>
  );
};
