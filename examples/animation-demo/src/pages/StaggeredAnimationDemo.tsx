/**
 * 🎭 Staggered Animation Demo
 * 
 * Showcase of staggered animation effects
 */

import { Component, createSignal, For } from "solid-js";
import { useStaggeredAnimation } from "reynard-animation";

export const StaggeredAnimationDemo: Component = () => {
  const [items, setItems] = createSignal([
    { id: 1, text: "First Item", color: "var(--color-primary)" },
    { id: 2, text: "Second Item", color: "var(--color-secondary)" },
    { id: 3, text: "Third Item", color: "var(--color-accent)" },
    { id: 4, text: "Fourth Item", color: "var(--color-success)" },
    { id: 5, text: "Fifth Item", color: "var(--color-warning)" },
  ]);

  const [animationConfig, setAnimationConfig] = createSignal({
    duration: 500,
    delay: 100,
    stagger: 50,
    direction: "forward" as "forward" | "reverse" | "center" | "random"
  });

  const staggeredAnimation = useStaggeredAnimation(animationConfig());

  const startAnimation = () => {
    staggeredAnimation.start(items().length);
  };

  const stopAnimation = () => {
    staggeredAnimation.stop();
  };

  const addItem = () => {
    const newId = Math.max(...items().map(i => i.id)) + 1;
    const colors = [
      "var(--color-primary)",
      "var(--color-secondary)", 
      "var(--color-accent)",
      "var(--color-success)",
      "var(--color-warning)",
      "var(--color-error)"
    ];
    const newItem = {
      id: newId,
      text: `Item ${newId}`,
      color: colors[newId % colors.length]
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = () => {
    if (items().length > 1) {
      setItems(prev => prev.slice(0, -1));
    }
  };

  return (
    <div class="staggered-animation-demo">
      <div class="demo-header">
        <h1 class="page-title">🎭 Staggered Animation Demo</h1>
        <p class="page-description">
          Experience sequential animation effects with customizable timing and direction.
        </p>
      </div>

      {/* Controls */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>🎛️</span>
          Animation Controls
        </h2>
        <div class="demo-controls">
          <div class="control-group">
            <label class="control-label">Duration (ms)</label>
            <input
              type="range"
              min="200"
              max="1000"
              step="100"
              value={animationConfig().duration}
              onInput={(e) => setAnimationConfig(prev => ({
                ...prev,
                duration: parseInt(e.currentTarget.value)
              }))}
            />
            <span class="control-value">{animationConfig().duration}ms</span>
          </div>

          <div class="control-group">
            <label class="control-label">Delay (ms)</label>
            <input
              type="range"
              min="0"
              max="500"
              step="50"
              value={animationConfig().delay}
              onInput={(e) => setAnimationConfig(prev => ({
                ...prev,
                delay: parseInt(e.currentTarget.value)
              }))}
            />
            <span class="control-value">{animationConfig().delay}ms</span>
          </div>

          <div class="control-group">
            <label class="control-label">Stagger (ms)</label>
            <input
              type="range"
              min="25"
              max="200"
              step="25"
              value={animationConfig().stagger}
              onInput={(e) => setAnimationConfig(prev => ({
                ...prev,
                stagger: parseInt(e.currentTarget.value)
              }))}
            />
            <span class="control-value">{animationConfig().stagger}ms</span>
          </div>

          <div class="control-group">
            <label class="control-label">Direction</label>
            <select
              value={animationConfig().direction}
              onChange={(e) => setAnimationConfig(prev => ({
                ...prev,
                direction: e.currentTarget.value as "forward" | "reverse" | "center" | "random"
              }))}
            >
              <option value="forward">Forward</option>
              <option value="reverse">Reverse</option>
              <option value="center">Center</option>
              <option value="random">Random</option>
            </select>
          </div>

          <div class="control-group">
            <button class="control-button primary" onClick={startAnimation}>
              ▶️ Start Animation
            </button>
            <button class="control-button" onClick={stopAnimation}>
              ⏹️ Stop Animation
            </button>
          </div>

          <div class="control-group">
            <button class="control-button" onClick={addItem}>
              ➕ Add Item
            </button>
            <button class="control-button" onClick={removeItem}>
              ➖ Remove Item
            </button>
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
              {staggeredAnimation.isAnimating() ? "Yes" : "No"}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Total Items:</span>
            <span class="status-value">{items().length}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Animation Items:</span>
            <span class="status-value">{staggeredAnimation.items().length}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Duration:</span>
            <span class="status-value">{animationConfig().duration}ms</span>
          </div>
        </div>
      </div>

      {/* Animated Items */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>🎪</span>
          Animated Items
        </h2>
        <div class="animation-showcase">
          <For each={items()}>
            {(item, index) => {
              const animationItem = staggeredAnimation.items()[index()];
              return (
                <div
                  class="showcase-item"
                  style={{
                    "background-color": item.color,
                    "animation-delay": `${animationItem?.delay || 0}ms`,
                    "opacity": animationItem?.isAnimating ? "1" : "0.7",
                    "transform": `scale(${Math.max(animationItem?.progress || 0.1, 0.1)})`,
                    "transition": "all 0.3s ease"
                  }}
                >
                  <div class="item-content">
                    <div class="item-text">{item.text}</div>
                    <div class="item-delay">
                      Delay: {animationItem?.delay || 0}ms
                    </div>
                    <div class="item-progress">
                      Progress: {Math.round((animationItem?.progress || 0) * 100)}%
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>

      {/* Code Example */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>💻</span>
          Code Example
        </h2>
        <pre class="code-example">
{`import { useStaggeredAnimation } from "reynard-animation";

const staggeredAnimation = useStaggeredAnimation({
  duration: 500,
  delay: 100,
  stagger: 50,
  direction: "forward"
});

// Start animation with item count
await staggeredAnimation.start(itemCount);

// Check status
console.log(staggeredAnimation.isAnimating());
console.log(staggeredAnimation.items());
console.log(staggeredAnimation.items().length);`}
        </pre>
      </div>
    </div>
  );
};
