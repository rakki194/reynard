import { Component, For, createEffect } from "solid-js";
import { MATERIALS } from "../data/materialData";
import "./MaterialSelector.css";

interface MaterialSelectorProps {
  selectedMaterial: keyof typeof import("../utils/hueShiftingAlgorithms").MATERIAL_PATTERNS;
  onMaterialSelect: (
    material: keyof typeof import("../utils/hueShiftingAlgorithms").MATERIAL_PATTERNS,
  ) => void;
}

export const MaterialSelector: Component<MaterialSelectorProps> = (props) => {
  // Debug logging
  createEffect(() => {
    console.log("=== MATERIAL SELECTOR DEBUG ===");
    console.log("MATERIALS array:", MATERIALS);
    MATERIALS.forEach((material, index) => {
      console.log(`Material ${index}:`, {
        key: material.key,
        name: material.name,
        icon: material.icon,
        iconLength: material.icon?.length,
        iconType: typeof material.icon,
      });
    });
  });

  return (
    <div class="material-selector">
      <h3>Select Material</h3>
      <div class="material-cards">
        <For each={MATERIALS}>
          {(material) => (
            <button
              class={`material-card ${props.selectedMaterial === material.key ? "selected" : ""}`}
              onClick={() => props.onMaterialSelect(material.key)}
            >
              <div class="material-icon" innerHTML={material.icon}></div>
              <div class="material-info">
                <h4>{material.name}</h4>
                <p>{material.description}</p>
              </div>
              <div
                class={`material-preview ${props.selectedMaterial === material.key ? "selected" : ""}`}
                style={{
                  "--preview-color": `oklch(${material.exampleColor.l}% ${material.exampleColor.c} ${material.exampleColor.h})`,
                }}
              />
            </button>
          )}
        </For>
      </div>
    </div>
  );
};
