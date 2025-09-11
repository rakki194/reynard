import { Component } from "solid-js";
import "./MaterialInfo.css";

export const MaterialInfo: Component = () => {
  return (
    <div class="material-info">
      <h3>Understanding Material Properties</h3>
      <div class="info-grid">
        <div class="info-card">
          <h4>Shadow Shift</h4>
          <p>
            How much the hue shifts toward cooler colors in shadows. 
            Higher values create more dramatic color temperature changes.
          </p>
        </div>
        <div class="info-card">
          <h4>Highlight Shift</h4>
          <p>
            How much the hue shifts toward warmer colors in highlights. 
            Affects the overall warmth of the material.
          </p>
        </div>
        <div class="info-card">
          <h4>Chroma Boost</h4>
          <p>
            How much the color saturation increases. Higher values 
            create more vibrant, saturated materials.
          </p>
        </div>
        <div class="info-card">
          <h4>Lightness Range</h4>
          <p>
            The total range of lightness values from shadow to highlight. 
            Controls the overall contrast of the material.
          </p>
        </div>
      </div>
    </div>
  );
};
