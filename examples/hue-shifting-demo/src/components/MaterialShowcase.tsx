import { Component, createSignal, createMemo } from "solid-js";
import type { OKLCHColor } from "reynard-colors";
import { materialHueShift, MATERIAL_PATTERNS } from "../utils/hueShiftingAlgorithms";
import { MaterialSelector } from "./MaterialSelector";
import { MaterialDemo } from "./MaterialDemo";
import { MaterialInfo } from "./MaterialInfo";
import "./MaterialShowcase.css";

export const MaterialShowcase: Component = () => {
  const [selectedMaterial, setSelectedMaterial] = createSignal<keyof typeof MATERIAL_PATTERNS>("metal");
  const [baseColor] = createSignal<OKLCHColor>({
    l: 60,
    c: 0.2,
    h: 120,
  });

  const materialColors = createMemo(() => {
    return materialHueShift(baseColor(), selectedMaterial(), 1.0);
  });

  return (
    <div class="material-showcase">
      <header class="showcase-header">
        <h2>Material-Based Hue Shifting</h2>
        <p>
          Different materials interact with light in unique ways. Explore how each material type affects hue shifting
          patterns.
        </p>
      </header>

      <div class="showcase-grid">
        <MaterialSelector selectedMaterial={selectedMaterial()} onMaterialSelect={setSelectedMaterial} />

        <MaterialDemo selectedMaterial={selectedMaterial()} materialColors={materialColors()} />
      </div>

      <MaterialInfo />
    </div>
  );
};
