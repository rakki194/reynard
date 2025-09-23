/**
 * 🎨 Color Animation Demo
 * 
 * Comprehensive showcase of color transitions, hue shifting effects, and advanced color theory
 */

import { Component, createSignal, For, onMount, onCleanup } from "solid-js";
// import { useHueShifting } from "reynard-colors/utils";

export const ColorAnimationDemo: Component = () => {
  const [colorConfig, setColorConfig] = createSignal({
    baseHue: 200,
    shiftAmount: 30,
    animationDuration: 4000, // Increased from 2000ms to 4000ms for smoother animation
    easing: "ease-in-out",
    saturation: 70,
    lightness: 50,
    colorMode: "hsl" as "hsl" | "oklch" | "rgb",
    animationType: "hue-shift" as "hue-shift" | "rainbow" | "pulse" | "wave"
  });

  const [isAnimating, setIsAnimating] = createSignal(false);
  const [currentHue, setCurrentHue] = createSignal(200);
  const [animationFrame, setAnimationFrame] = createSignal(0);
  const [performance, setPerformance] = createSignal({
    fps: 60,
    frameTime: 16.67,
    isOptimized: true
  });

  // const hueShifting = useHueShifting();

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

  const startColorAnimation = () => {
    setIsAnimating(true);
    setAnimationFrame(0);
    const config = colorConfig();
    
    const startTime = Date.now();
    const animate = () => {
      if (!isAnimating()) return;
      
      updatePerformance();
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / config.animationDuration, 1);
      
      // Debug logging
      if (elapsed % 500 < 16) { // Log every ~500ms
        console.log(`Animation: elapsed=${elapsed}ms, duration=${config.animationDuration}ms, progress=${(progress * 100).toFixed(1)}%`);
      }
      
      // Advanced easing functions
      let easedProgress = progress;
      switch (config.easing) {
        case "ease-in-out":
          easedProgress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          break;
        case "ease-in":
          easedProgress = progress * progress;
          break;
        case "ease-out":
          easedProgress = 1 - Math.pow(1 - progress, 2);
          break;
        case "linear":
        default:
          easedProgress = progress;
      }

      // Different animation types
      let newHue = config.baseHue;
      switch (config.animationType) {
        case "hue-shift":
          newHue = config.baseHue + (config.shiftAmount * easedProgress);
          break;
        case "rainbow":
          newHue = (config.baseHue + (360 * easedProgress)) % 360;
          break;
        case "pulse":
          newHue = config.baseHue + (Math.sin(progress * Math.PI * 2) * (config.shiftAmount * 0.5));
          break;
        case "wave":
          newHue = config.baseHue + (Math.sin(progress * Math.PI) * (config.shiftAmount * 0.3));
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

  const stopColorAnimation = () => {
    setIsAnimating(false);
    setCurrentHue(colorConfig().baseHue);
  };

  const generateColorPalette = (hue: number) => {
    const config = colorConfig();
    const { saturation, lightness, colorMode } = config;
    
    // Advanced color harmony generation
    const harmonies = {
      monochromatic: [hue, hue, hue, hue, hue, hue],
      analogous: [hue, hue + 30, hue + 60, hue - 30, hue - 60, hue + 90],
      complementary: [hue, hue + 180, hue + 30, hue + 210, hue - 30, hue + 150],
      triadic: [hue, hue + 120, hue + 240, hue + 60, hue + 180, hue + 300],
      tetradic: [hue, hue + 90, hue + 180, hue + 270, hue + 45, hue + 225],
      splitComplementary: [hue, hue + 150, hue + 210, hue + 30, hue + 60, hue + 120]
    };

    const currentHarmony = harmonies.analogous; // Default to analogous
    
    return currentHarmony.map((h, index) => {
      const adjustedHue = (h + 360) % 360; // Normalize hue
      const adjustedSaturation = saturation + (index * 5); // Vary saturation slightly
      const adjustedLightness = lightness + (Math.sin(index) * 10); // Vary lightness slightly
      
      switch (colorMode) {
        case "oklch":
          return `oklch(${adjustedLightness}% ${adjustedSaturation / 100} ${adjustedHue})`;
        case "rgb":
          return hslToRgb(adjustedHue, adjustedSaturation, adjustedLightness);
        case "hsl":
        default:
          return `hsl(${adjustedHue}, ${adjustedSaturation}%, ${adjustedLightness}%)`;
      }
    });
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

  const colorPalette = () => generateColorPalette(currentHue());

  return (
    <div class="color-animation-demo">
      <div class="demo-header">
        <h1 class="page-title">🎨 Color Animation Demo</h1>
        <p class="page-description">
          Beautiful color transitions and hue shifting effects with customizable timing and easing.
        </p>
      </div>

      {/* Controls */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>🎛️</span>
          Color Controls
        </h2>
        <div class="demo-controls">
          <div class="control-group">
            <label class="control-label">Base Hue</label>
            <input
              type="range"
              min="0"
              max="360"
              step="10"
              value={colorConfig().baseHue}
              onInput={(e) => setColorConfig(prev => ({
                ...prev,
                baseHue: parseInt(e.currentTarget.value)
              }))}
            />
            <span class="control-value">{colorConfig().baseHue}°</span>
          </div>

          <div class="control-group">
            <label class="control-label">Shift Amount</label>
            <input
              type="range"
              min="10"
              max="180"
              step="10"
              value={colorConfig().shiftAmount}
              onInput={(e) => setColorConfig(prev => ({
                ...prev,
                shiftAmount: parseInt(e.currentTarget.value)
              }))}
            />
            <span class="control-value">{colorConfig().shiftAmount}°</span>
          </div>

          <div class="control-group">
            <label class="control-label">Animation Duration (ms)</label>
            <input
              type="range"
              min="1000"
              max="8000"
              step="500"
              value={colorConfig().animationDuration}
              onInput={(e) => setColorConfig(prev => ({
                ...prev,
                animationDuration: parseInt(e.currentTarget.value)
              }))}
            />
            <span class="control-value">{colorConfig().animationDuration}ms</span>
          </div>

          <div class="control-group">
            <label class="control-label">Saturation</label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={colorConfig().saturation}
              onInput={(e) => setColorConfig(prev => ({
                ...prev,
                saturation: parseInt(e.currentTarget.value)
              }))}
            />
            <span class="control-value">{colorConfig().saturation}%</span>
          </div>

          <div class="control-group">
            <label class="control-label">Lightness</label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={colorConfig().lightness}
              onInput={(e) => setColorConfig(prev => ({
                ...prev,
                lightness: parseInt(e.currentTarget.value)
              }))}
            />
            <span class="control-value">{colorConfig().lightness}%</span>
          </div>

          <div class="control-group">
            <label class="control-label">Color Mode</label>
            <select
              value={colorConfig().colorMode}
              onChange={(e) => setColorConfig(prev => ({
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
              value={colorConfig().animationType}
              onChange={(e) => setColorConfig(prev => ({
                ...prev,
                animationType: e.currentTarget.value as "hue-shift" | "rainbow" | "pulse" | "wave"
              }))}
            >
              <option value="hue-shift">Hue Shift</option>
              <option value="rainbow">Rainbow</option>
              <option value="pulse">Pulse</option>
              <option value="wave">Wave</option>
            </select>
          </div>

          <div class="control-group">
            <label class="control-label">Easing</label>
            <select
              value={colorConfig().easing}
              onChange={(e) => setColorConfig(prev => ({
                ...prev,
                easing: e.currentTarget.value
              }))}
            >
              <option value="ease-in-out">Ease In Out</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="linear">Linear</option>
            </select>
          </div>

          <div class="control-group">
            <button 
              class="control-button primary" 
              onClick={startColorAnimation}
              disabled={isAnimating()}
            >
              {isAnimating() ? "🎨 Animating..." : "🎨 Start Animation"}
            </button>
            <button 
              class="control-button" 
              onClick={stopColorAnimation}
              disabled={!isAnimating()}
            >
              ⏹️ Stop Animation
            </button>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>🌈</span>
          Color Palette
        </h2>
        <div class="color-palette">
          <For each={colorPalette()}>
            {(color, index) => (
              <div
                class="color-swatch"
                style={{
                  "background-color": color,
                  "--animation-delay": `${index() * 100}ms`
                }}
              >
                <div class="color-info">
                  <div class="color-hex">{color}</div>
                  <div class="color-index">#{index() + 1}</div>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Color Showcase */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>🎪</span>
          Color Showcase
        </h2>
        <div class="color-showcase">
          <div class="showcase-item primary" style={{ "background-color": colorPalette()[0] }}>
            <h4>Primary</h4>
            <p>Main brand color</p>
          </div>
          <div class="showcase-item secondary" style={{ "background-color": colorPalette()[1] }}>
            <h4>Secondary</h4>
            <p>Supporting color</p>
          </div>
          <div class="showcase-item accent" style={{ "background-color": colorPalette()[2] }}>
            <h4>Accent</h4>
            <p>Highlight color</p>
          </div>
          <div class="showcase-item success" style={{ "background-color": colorPalette()[3] }}>
            <h4>Success</h4>
            <p>Positive actions</p>
          </div>
          <div class="showcase-item warning" style={{ "background-color": colorPalette()[4] }}>
            <h4>Warning</h4>
            <p>Caution states</p>
          </div>
          <div class="showcase-item error" style={{ "background-color": colorPalette()[5] }}>
            <h4>Error</h4>
            <p>Error states</p>
          </div>
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
            <span class="status-label">Color Mode:</span>
            <span class="status-value">{colorConfig().colorMode.toUpperCase()}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Animation Type:</span>
            <span class="status-value">{colorConfig().animationType.replace('-', ' ')}</span>
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
{`import { useHueShifting } from "reynard-colors/utils";

const hueShifting = useHueShifting();

// Generate color palette
const palette = generateColorPalette(hue);

// Animate hue shift
const animateHue = (startHue, endHue, duration) => {
  const startTime = Date.now();
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentHue = startHue + (endHue - startHue) * progress;
    // Update colors...
    if (progress < 1) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
};`}
        </pre>
      </div>
    </div>
  );
};
