import { Component, createSignal, createMemo } from "solid-js";
import type { OKLCHColor } from "reynard-colors";
import { materialHueShift, MATERIAL_PATTERNS } from "../utils/hueShiftingAlgorithms";
import "./MaterialShowcase.css";

export const MaterialShowcase: Component = () => {
  const [selectedMaterial, setSelectedMaterial] = createSignal<keyof typeof MATERIAL_PATTERNS>("metal");
  const [baseColor, setBaseColor] = createSignal<OKLCHColor>({
    l: 60,
    c: 0.2,
    h: 120
  });
  
  const materialColors = createMemo(() => {
    return materialHueShift(baseColor(), selectedMaterial(), 1.0);
  });
  
  const materials = [
    {
      key: "metal" as const,
      name: "Metal",
      description: "Reflective surface with cool shadows and warm highlights",
      icon: "⚙️",
      exampleColor: { l: 50, c: 0.08, h: 0 }
    },
    {
      key: "skin" as const,
      name: "Skin",
      description: "Organic material with warm shadows and highlights",
      icon: "👤",
      exampleColor: { l: 70, c: 0.12, h: 30 }
    },
    {
      key: "fabric" as const,
      name: "Fabric",
      description: "Soft material with subtle hue shifts",
      icon: "🧵",
      exampleColor: { l: 60, c: 0.2, h: 240 }
    },
    {
      key: "plastic" as const,
      name: "Plastic",
      description: "Synthetic material with moderate hue shifts",
      icon: "🔲",
      exampleColor: { l: 55, c: 0.15, h: 120 }
    }
  ];
  
  return (
    <div class="material-showcase">
      <header class="showcase-header">
        <h2>Material-Based Hue Shifting</h2>
        <p>
          Different materials interact with light in unique ways. Explore how 
          each material type affects hue shifting patterns.
        </p>
      </header>
      
      <div class="showcase-grid">
        <div class="material-selector">
          <h3>Select Material</h3>
          <div class="material-cards">
            {materials.map((material) => (
              <button
                class={`material-card ${selectedMaterial() === material.key ? 'selected' : ''}`}
                onClick={() => setSelectedMaterial(material.key)}
              >
                <div class="material-icon">{material.icon}</div>
                <div class="material-info">
                  <h4>{material.name}</h4>
                  <p>{material.description}</p>
                </div>
                <div 
                  class="material-preview"
                  style={{
                    "background-color": `oklch(${material.exampleColor.l}% ${material.exampleColor.c} ${material.exampleColor.h})`
                  }}
                />
              </button>
            ))}
          </div>
        </div>
        
        <div class="material-demo">
          <h3>Material Properties</h3>
          <div class="properties-display">
            {Object.entries(MATERIAL_PATTERNS[selectedMaterial()]).map(([key, value]) => (
              <div class="property-item">
                <span class="property-name">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                <span class="property-value">{value}</span>
              </div>
            ))}
          </div>
          
          <h3>Color Variations</h3>
          <div class="color-variations">
            <div class="color-variation">
              <div 
                class="variation-swatch shadow"
                style={{
                  "background-color": `oklch(${materialColors().shadow.l}% ${materialColors().shadow.c} ${materialColors().shadow.h})`
                }}
              />
              <div class="variation-info">
                <h4>Shadow</h4>
                <code>oklch({materialColors().shadow.l}% {materialColors().shadow.c} {materialColors().shadow.h})</code>
              </div>
            </div>
            
            <div class="color-variation">
              <div 
                class="variation-swatch base"
                style={{
                  "background-color": `oklch(${materialColors().base.l}% ${materialColors().base.c} ${materialColors().base.h})`
                }}
              />
              <div class="variation-info">
                <h4>Base</h4>
                <code>oklch({materialColors().base.l}% {materialColors().base.c} {materialColors().base.h})</code>
              </div>
            </div>
            
            <div class="color-variation">
              <div 
                class="variation-swatch highlight"
                style={{
                  "background-color": `oklch(${materialColors().highlight.l}% ${materialColors().highlight.c} ${materialColors().highlight.h})`
                }}
              />
              <div class="variation-info">
                <h4>Highlight</h4>
                <code>oklch({materialColors().highlight.l}% {materialColors().highlight.c} {materialColors().highlight.h})</code>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
    </div>
  );
};
