/**
 * 🎛️ Animation Controls Component
 * 
 * Global animation controls for the demo app
 */

import { Component, createSignal, Show } from "solid-js";
// import { useAnimationControl } from "reynard-core/composables";

export const AnimationControls: Component = () => {
  // Mock animation control functions for demo
  const isAnimationsDisabled = () => false;
  const toggleAnimations = () => {};
  const setPerformanceMode = (_mode: string) => {};
  
  const [showControls, setShowControls] = createSignal(false);

  return (
    <div class="animation-controls">
      <button
        class="controls-toggle"
        onClick={() => setShowControls(!showControls())}
        title="Toggle animation controls"
      >
        🎛️ Controls
      </button>
      
      <Show when={showControls()}>
        <div class="controls-panel">
          <div class="control-group">
            <label class="control-label">
              <input
                type="checkbox"
                checked={!isAnimationsDisabled()}
                onChange={() => toggleAnimations()}
              />
              Enable Animations
            </label>
          </div>
          
          <div class="control-group">
            <label class="control-label">
              Performance Mode:
              <select
                onChange={(e) => setPerformanceMode(e.currentTarget.value as "normal" | "high" | "low")}
              >
                <option value="normal">Normal</option>
                <option value="high">High Performance</option>
                <option value="low">Low Performance</option>
              </select>
            </label>
          </div>
          
          <div class="control-group">
            <button
              class="control-button"
              onClick={() => {
                // Reset all animations
                window.location.reload();
              }}
            >
              🔄 Reset All
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
};
