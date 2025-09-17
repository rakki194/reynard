import { Component } from "solid-js";
import { Slider } from "reynard-components";
import { MATERIAL_PATTERNS, type MaterialType } from "../composables/useMaterialEffects";

interface MaterialControlsProps {
  selectedMaterial: MaterialType;
  shiftIntensity: number;
  onMaterialChange: (material: MaterialType) => void;
  onIntensityChange: (intensity: number) => void;
}

export const MaterialControls: Component<MaterialControlsProps> = props => {
  return (
    <>
      <section class="control-section">
        <h3>Material Type</h3>
        <div class="material-buttons">
          {Object.entries(MATERIAL_PATTERNS).map(([key]) => (
            <button
              class={`material-button ${props.selectedMaterial === key ? "selected" : ""}`}
              onClick={() => props.onMaterialChange(key as MaterialType)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section class="control-section">
        <h3>Shift Intensity</h3>
        <div class="intensity-control">
          <Slider
            id="shift-intensity"
            min={0}
            max={1}
            step={0.01}
            onChange={e => props.onIntensityChange(parseFloat(e.target.value))}
            class="intensity-slider"
          />
          <label for="shift-intensity" class="sr-only">
            Shift Intensity
          </label>
          <span class="intensity-value">{props.shiftIntensity.toFixed(2)}</span>
        </div>
      </section>
    </>
  );
};
