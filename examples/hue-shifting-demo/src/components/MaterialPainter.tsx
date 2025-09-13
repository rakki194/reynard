import { Component, createSignal, createMemo, For } from "solid-js";
import type { OKLCHColor } from "reynard-colors";
import {
  getAvailableMaterials,
  getMaterialPattern,
  applyMaterialPattern,
  createCustomMaterial,
  type MaterialType,
  type MaterialPattern,
} from "reynard-colors";
import "./MaterialPainter.css";
import { Slider, Toggle } from "reynard-components";;

interface MaterialPainterProps {
  baseColor: OKLCHColor;
  onColorChange: (colors: {
    shadow: OKLCHColor;
    base: OKLCHColor;
    highlight: OKLCHColor;
  }) => void;
}

export const MaterialPainter: Component<MaterialPainterProps> = (props) => {
  const [selectedMaterial, setSelectedMaterial] =
    createSignal<MaterialType>("fabric");
  const [intensity, setIntensity] = createSignal(0.5);
  const [isCustomizing, setIsCustomizing] = createSignal(false);
  const [customPattern, setCustomPattern] = createSignal<
    Partial<MaterialPattern>
  >({});

  const availableMaterials = getAvailableMaterials();

  const materialColors = createMemo(() => {
    const material = selectedMaterial();
    const baseColor = props.baseColor;
    const shiftIntensity = intensity();

    if (material === "custom") {
      const pattern = createCustomMaterial(customPattern());
      return applyMaterialPattern(baseColor, "custom", shiftIntensity);
    }

    return applyMaterialPattern(baseColor, material, shiftIntensity);
  });

  const currentPattern = createMemo(() => {
    const material = selectedMaterial();
    if (material === "custom") {
      return createCustomMaterial(customPattern());
    }
    return getMaterialPattern(material);
  });

  // Update parent when colors change
  createMemo(() => {
    props.onColorChange(materialColors());
  });

  const handleMaterialChange = (material: MaterialType) => {
    setSelectedMaterial(material);
    if (material !== "custom") {
      setIsCustomizing(false);
    }
  };

  const handleCustomizePattern = () => {
    const current = getMaterialPattern(selectedMaterial());
    setCustomPattern({
      name: current.name + " (Custom)",
      description: current.description,
      shadowShift: current.shadowShift,
      highlightShift: current.highlightShift,
      chromaBoost: current.chromaBoost,
      lightnessRange: current.lightnessRange,
      highlightPreservation: current.highlightPreservation,
      shadowEnhancement: current.shadowEnhancement,
      midtoneAdjustment: current.midtoneAdjustment,
    });
    setSelectedMaterial("custom");
    setIsCustomizing(true);
  };

  const updateCustomPattern = (field: keyof MaterialPattern, value: any) => {
    setCustomPattern((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedPattern = (
    parent: keyof MaterialPattern,
    field: string,
    value: any,
  ) => {
    setCustomPattern((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value,
      },
    }));
  };

  return (
    <div class="material-painter">
      <div class="material-painter-header">
        <h3>Material Painter</h3>
        <p>Select a material type to apply realistic color variations</p>
      </div>

      <div class="material-selector">
        <label for="material-select">Material Type:</label>
        <select
          id="material-select"
          value={selectedMaterial()}
          onChange={(e) => handleMaterialChange(e.target.value as MaterialType)}
        >
          <For each={availableMaterials}>
            {(material) => (
              <option value={material}>
                {getMaterialPattern(material).name}
              </option>
            )}
          </For>
        </select>
      </div>

      <div class="intensity-control">
        <label for="intensity-slider">
          Intensity: {intensity().toFixed(2)}
        </label>
        <Slider
    id="intensity-slider"
    min={0}
    max={1}
    step={0.01}
  /> setIntensity(parseFloat(e.target.value))}
          class="slider"
        />
      </div>

      <div class="material-info">
        <h4>{currentPattern().name}</h4>
        <p>{currentPattern().description}</p>

        <div class="pattern-details">
          <div class="detail-group">
            <h5>Shadow Settings</h5>
            <p>Hue Shift: {currentPattern().shadowShift}°</p>
            <p>Cool Shift: {currentPattern().shadowEnhancement.coolShift}°</p>
            <p>Threshold: {currentPattern().shadowEnhancement.threshold}%</p>
          </div>

          <div class="detail-group">
            <h5>Highlight Settings</h5>
            <p>Hue Shift: {currentPattern().highlightShift}°</p>
            <p>
              Preservation:{" "}
              {currentPattern().highlightPreservation.enabled ? "Yes" : "No"}
            </p>
            <p>
              Threshold: {currentPattern().highlightPreservation.threshold}%
            </p>
          </div>

          <div class="detail-group">
            <h5>General Settings</h5>
            <p>Chroma Boost: {currentPattern().chromaBoost}</p>
            <p>Lightness Range: {currentPattern().lightnessRange}</p>
          </div>
        </div>
      </div>

      <div class="material-colors">
        <h4>Generated Colors</h4>
        <div class="color-swatches">
          <div class="color-swatch shadow">
            <div
              class="swatch-color"
              style={`background: oklch(${materialColors().shadow.l}% ${materialColors().shadow.c} ${materialColors().shadow.h})`}
            ></div>
            <span>Shadow</span>
          </div>

          <div class="color-swatch base">
            <div
              class="swatch-color"
              style={`background: oklch(${materialColors().base.l}% ${materialColors().base.c} ${materialColors().base.h})`}
            ></div>
            <span>Base</span>
          </div>

          <div class="color-swatch highlight">
            <div
              class="swatch-color"
              style={`background: oklch(${materialColors().highlight.l}% ${materialColors().highlight.c} ${materialColors().highlight.h})`}
            ></div>
            <span>Highlight</span>
          </div>
        </div>
      </div>

      <div class="customization-controls">
        <button onClick={handleCustomizePattern} class="customize-button">
          Customize Pattern
        </button>

        {isCustomizing() && (
          <div class="custom-pattern-editor">
            <h4>Custom Pattern Editor</h4>

            <div class="editor-group">
              <label>Shadow Hue Shift:</label>
              <input
                type="number"
                value={customPattern().shadowShift || 0}
                onInput={(e) =>
                  updateCustomPattern("shadowShift", parseFloat(e.target.value))
                }
              />
            </div>

            <div class="editor-group">
              <label>Highlight Hue Shift:</label>
              <input
                type="number"
                value={customPattern().highlightShift || 0}
                onInput={(e) =>
                  updateCustomPattern(
                    "highlightShift",
                    parseFloat(e.target.value),
                  )
                }
              />
            </div>

            <div class="editor-group">
              <label>Chroma Boost:</label>
              <input
                type="number"
                step="0.01"
                value={customPattern().chromaBoost || 0}
                onInput={(e) =>
                  updateCustomPattern("chromaBoost", parseFloat(e.target.value))
                }
              />
            </div>

            <div class="editor-group">
              <label>Lightness Range:</label>
              <input
                type="number"
                value={customPattern().lightnessRange || 0}
                onInput={(e) =>
                  updateCustomPattern(
                    "lightnessRange",
                    parseFloat(e.target.value),
                  )
                }
              />
            </div>

            <div class="editor-group">
              <label>
                <Toggle
    size="sm"
  />
                    updateNestedPattern(
                      "highlightPreservation",
                      "enabled",
                      e.target.checked,
                    )
                  }
                />
                Enable Highlight Preservation
              </label>
            </div>

            <div class="editor-group">
              <label>
                <Toggle
    size="sm"
  />
                    updateNestedPattern(
                      "shadowEnhancement",
                      "enabled",
                      e.target.checked,
                    )
                  }
                />
                Enable Shadow Enhancement
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
