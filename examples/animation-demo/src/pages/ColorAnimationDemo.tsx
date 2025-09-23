/**
 * 🎨 Color Animation Demo
 * 
 * Showcase of color transitions and hue shifting effects
 */

import { Component, createSignal, For } from "solid-js";
// import { useHueShifting } from "reynard-colors/utils";

export const ColorAnimationDemo: Component = () => {
  const [colorConfig, setColorConfig] = createSignal({
    baseHue: 200,
    shiftAmount: 30,
    animationDuration: 2000,
    easing: "ease-in-out"
  });

  const [isAnimating, setIsAnimating] = createSignal(false);
  const [currentHue, setCurrentHue] = createSignal(200);

  // const hueShifting = useHueShifting();

  const startColorAnimation = () => {
    setIsAnimating(true);
    const config = colorConfig();
    
    // Simulate hue shifting animation
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / config.animationDuration, 1);
      
      // Easing function
      let easedProgress = progress;
      if (config.easing === "ease-in-out") {
        easedProgress = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      } else if (config.easing === "ease-in") {
        easedProgress = progress * progress;
      } else if (config.easing === "ease-out") {
        easedProgress = 1 - Math.pow(1 - progress, 2);
      }

      const newHue = config.baseHue + (config.shiftAmount * easedProgress);
      setCurrentHue(newHue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  };

  const stopColorAnimation = () => {
    setIsAnimating(false);
    setCurrentHue(colorConfig().baseHue);
  };

  const generateColorPalette = (hue: number) => {
    return [
      `hsl(${hue}, 70%, 50%)`,
      `hsl(${hue + 30}, 70%, 50%)`,
      `hsl(${hue + 60}, 70%, 50%)`,
      `hsl(${hue + 90}, 70%, 50%)`,
      `hsl(${hue + 120}, 70%, 50%)`,
      `hsl(${hue + 150}, 70%, 50%)`,
    ];
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
              min="500"
              max="5000"
              step="250"
              value={colorConfig().animationDuration}
              onInput={(e) => setColorConfig(prev => ({
                ...prev,
                animationDuration: parseInt(e.currentTarget.value)
              }))}
            />
            <span class="control-value">{colorConfig().animationDuration}ms</span>
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
                  "animation-delay": `${index() * 100}ms`
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
          Animation Status
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
            <span class="status-label">Base Hue:</span>
            <span class="status-value">{colorConfig().baseHue}°</span>
          </div>
          <div class="status-item">
            <span class="status-label">Shift Amount:</span>
            <span class="status-value">{colorConfig().shiftAmount}°</span>
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
