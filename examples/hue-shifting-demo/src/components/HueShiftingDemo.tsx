import { Component, createSignal, createMemo } from "solid-js";
import { ColorPicker } from "./ColorPicker";
import { ColorRamp } from "./ColorRamp";
import { MaterialSelector } from "./MaterialSelector";
import { PixelArtPreview } from "./PixelArtPreview";
import { HueShiftControls } from "./HueShiftControls";
import type { OKLCHColor } from "reynard-colors";
import { basicHueShift, generateHueShiftRamp, materialHueShift } from "../utils/hueShiftingAlgorithms";
import "./HueShiftingDemo.css";

export const HueShiftingDemo: Component = () => {
  const [baseColor, setBaseColor] = createSignal<OKLCHColor>({
    l: 60,
    c: 0.2,
    h: 120
  });
  
  const [selectedMaterial, setSelectedMaterial] = createSignal<keyof typeof MATERIAL_PATTERNS>("fabric");
  const [shiftIntensity, setShiftIntensity] = createSignal(0.3);
  const [rampStops, setRampStops] = createSignal(5);
  
  const MATERIAL_PATTERNS = {
    metal: { shadowShift: 30, highlightShift: 15, chromaBoost: 0.15, lightnessRange: 50 },
    skin: { shadowShift: 20, highlightShift: 25, chromaBoost: 0.08, lightnessRange: 35 },
    fabric: { shadowShift: 15, highlightShift: 10, chromaBoost: 0.05, lightnessRange: 40 },
    plastic: { shadowShift: 10, highlightShift: 20, chromaBoost: 0.12, lightnessRange: 45 }
  };
  
  const hueShiftedColors = createMemo(() => {
    const base = baseColor();
    const material = selectedMaterial();
    const intensity = shiftIntensity();
    
    if (material === "custom") {
      return {
        shadow: basicHueShift(base, "shadow", intensity),
        base: base,
        highlight: basicHueShift(base, "highlight", intensity)
      };
    }
    
    return materialHueShift(base, material, intensity);
  });
  
  const colorRamp = createMemo(() => {
    return generateHueShiftRamp(baseColor(), rampStops());
  });
  
  return (
    <div class="hue-shifting-demo">
      <header class="demo-header">
        <h2>OKLCH Hue Shifting Interactive Demo</h2>
        <p>
          Explore how OKLCH color space enables perceptually uniform hue shifting 
          for pixel art games. Adjust the controls below to see real-time changes.
        </p>
      </header>
      
      <div class="demo-grid">
        <div class="controls-panel">
          <section class="control-section">
            <h3>Base Color</h3>
            <ColorPicker
              color={baseColor()}
              onColorChange={setBaseColor}
            />
          </section>
          
          <section class="control-section">
            <h3>Material Type</h3>
            <MaterialSelector
              selected={selectedMaterial()}
              onMaterialChange={setSelectedMaterial}
            />
          </section>
          
          <section class="control-section">
            <h3>Hue Shift Controls</h3>
            <HueShiftControls
              intensity={shiftIntensity()}
              onIntensityChange={setShiftIntensity}
              rampStops={rampStops()}
              onRampStopsChange={setRampStops}
            />
          </section>
        </div>
        
        <div class="preview-panel">
          <section class="preview-section">
            <h3>Material-Based Shifting</h3>
            <div class="color-showcase">
              <div class="color-swatch">
                <div 
                  class="swatch-color shadow"
                  style={{
                    "background-color": `oklch(${hueShiftedColors().shadow.l}% ${hueShiftedColors().shadow.c} ${hueShiftedColors().shadow.h})`
                  }}
                />
                <span>Shadow</span>
              </div>
              <div class="color-swatch">
                <div 
                  class="swatch-color base"
                  style={{
                    "background-color": `oklch(${hueShiftedColors().base.l}% ${hueShiftedColors().base.c} ${hueShiftedColors().base.h})`
                  }}
                />
                <span>Base</span>
              </div>
              <div class="color-swatch">
                <div 
                  class="swatch-color highlight"
                  style={{
                    "background-color": `oklch(${hueShiftedColors().highlight.l}% ${hueShiftedColors().highlight.c} ${hueShiftedColors().highlight.h})`
                  }}
                />
                <span>Highlight</span>
              </div>
            </div>
          </section>
          
          <section class="preview-section">
            <h3>Color Ramp</h3>
            <ColorRamp colors={colorRamp()} />
          </section>
          
          <section class="preview-section">
            <h3>Pixel Art Preview</h3>
            <PixelArtPreview
              baseColor={baseColor()}
              material={selectedMaterial()}
              intensity={shiftIntensity()}
            />
          </section>
        </div>
      </div>
      
      <div class="demo-info">
        <h3>How It Works</h3>
        <div class="info-grid">
          <div class="info-card">
            <h4>Perceptual Uniformity</h4>
            <p>
              OKLCH ensures that equal changes in color values produce equal 
              visual changes, making hue shifting predictable and consistent.
            </p>
          </div>
          <div class="info-card">
            <h4>Material Awareness</h4>
            <p>
              Different materials have different light interaction patterns. 
              Metal reflects differently than skin or fabric.
            </p>
          </div>
          <div class="info-card">
            <h4>Real-time Preview</h4>
            <p>
              See your changes instantly in the pixel art preview, helping 
              you understand the visual impact of different settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
