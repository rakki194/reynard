import { Component, createSignal, createEffect } from "solid-js";
import type { OKLCHColor } from "reynard-colors";
import "./ColorPicker.css";

interface ColorPickerProps {
  color: OKLCHColor;
  onColorChange: (color: OKLCHColor) => void;
}

export const ColorPicker: Component<ColorPickerProps> = (props) => {
  const [lightness, setLightness] = createSignal(props.color.l);
  const [chroma, setChroma] = createSignal(props.color.c);
  const [hue, setHue] = createSignal(props.color.h);

  createEffect(() => {
    const newColor: OKLCHColor = {
      l: lightness(),
      c: chroma(),
      h: hue(),
    };
    props.onColorChange(newColor);
  });

  const colorString = () => `oklch(${lightness()}% ${chroma()} ${hue()})`;

  return (
    <div class="color-picker">
      <div class="color-preview">
        <div
          class="preview-color"
          style={{ "background-color": colorString() }}
        />
        <div class="color-values">
          <span class="color-string">{colorString()}</span>
        </div>
      </div>

      <div class="color-controls">
        <div class="control-group">
          <label for="lightness-slider">
            Lightness: {Math.round(lightness())}%
          </label>
          <input
            id="lightness-slider"
            type="range"
            min="0"
            max="100"
            step="1"
            value={lightness()}
            onInput={(e) => setLightness(parseFloat(e.target.value))}
            class="slider lightness-slider"
          />
        </div>

        <div class="control-group">
          <label for="chroma-slider">Chroma: {chroma().toFixed(2)}</label>
          <input
            id="chroma-slider"
            type="range"
            min="0"
            max="0.4"
            step="0.01"
            value={chroma()}
            onInput={(e) => setChroma(parseFloat(e.target.value))}
            class="slider chroma-slider"
          />
        </div>

        <div class="control-group">
          <label for="hue-slider">Hue: {Math.round(hue())}°</label>
          <input
            id="hue-slider"
            type="range"
            min="0"
            max="360"
            step="1"
            value={hue()}
            onInput={(e) => setHue(parseFloat(e.target.value))}
            class="slider hue-slider"
          />
        </div>
      </div>

      <div class="preset-colors">
        <h4>Preset Colors</h4>
        <div class="preset-grid">
          {PRESET_COLORS.map((preset) => (
            <button
              class="preset-color"
              style={{
                "background-color": `oklch(${preset.l}% ${preset.c} ${preset.h})`,
              }}
              onClick={() => {
                setLightness(preset.l);
                setChroma(preset.c);
                setHue(preset.h);
              }}
              title={`${preset.name} - oklch(${preset.l}% ${preset.c} ${preset.h})`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const PRESET_COLORS: Array<OKLCHColor & { name: string }> = [
  { l: 60, c: 0.2, h: 0, name: "Red" },
  { l: 60, c: 0.2, h: 60, name: "Yellow" },
  { l: 60, c: 0.2, h: 120, name: "Green" },
  { l: 60, c: 0.2, h: 180, name: "Cyan" },
  { l: 60, c: 0.2, h: 240, name: "Blue" },
  { l: 60, c: 0.2, h: 300, name: "Magenta" },
  { l: 50, c: 0.1, h: 0, name: "Dark Red" },
  { l: 70, c: 0.15, h: 120, name: "Light Green" },
  { l: 40, c: 0.25, h: 240, name: "Deep Blue" },
  { l: 80, c: 0.1, h: 60, name: "Light Yellow" },
  { l: 30, c: 0.2, h: 0, name: "Very Dark Red" },
  { l: 90, c: 0.05, h: 0, name: "Very Light" },
];
