import { Component, createSignal, createMemo, For } from "solid-js";
import type { OKLCHColor } from "reynard-colors";
import {
  pureHueShift,
  generateHueShiftRamp,
  createComplementaryPair,
  createTriadicSet,
  createTetradicSet,
  createAnalogousSet,
  batchHueShift,
  easedHueShift,
  EasingFunctions,
} from "reynard-colors";
import "./TrueHueShifter.css";
import { Slider } from "reynard-components";

interface TrueHueShifterProps {
  baseColor: OKLCHColor;
  onColorChange: (colors: OKLCHColor[]) => void;
}

export const TrueHueShifter: Component<TrueHueShifterProps> = (props) => {
  const [hueShift, setHueShift] = createSignal(0);
  const [rampStops, setRampStops] = createSignal(5);
  const [rampRange, setRampRange] = createSignal(60);
  const [selectedPreset, setSelectedPreset] = createSignal<string>("custom");
  const [easingFunction, setEasingFunction] =
    createSignal<keyof typeof EasingFunctions>("linear");

  const shiftedColor = createMemo(() => {
    return pureHueShift(props.baseColor, hueShift());
  });

  const hueRamp = createMemo(() => {
    return generateHueShiftRamp(props.baseColor, rampStops(), rampRange());
  });

  const presetColors = createMemo(() => {
    const base = props.baseColor;

    switch (selectedPreset()) {
      case "complementary":
        return createComplementaryPair(base);
      case "triadic":
        return createTriadicSet(base);
      case "tetradic":
        return createTetradicSet(base);
      case "analogous":
        return createAnalogousSet(base, 5, 60);
      case "ramp":
        return hueRamp();
      case "eased":
        const easedColors: OKLCHColor[] = [];
        for (let i = 0; i < rampStops(); i++) {
          const t = i / (rampStops() - 1);
          const eased = easedHueShift(
            base,
            rampRange(),
            t,
            EasingFunctions[easingFunction()],
          );
          easedColors.push(eased);
        }
        return easedColors;
      default:
        return [base, shiftedColor()];
    }
  });

  // Update parent when colors change
  createMemo(() => {
    props.onColorChange(presetColors());
  });

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
  };

  const applyHueShift = (deltaH: number) => {
    setHueShift((prev) => prev + deltaH);
  };

  return (
    <div class="true-hue-shifter">
      <div class="hue-shifter-header">
        <h3>True Hue Shifting</h3>
        <p>Pure OKLCH hue shifts that preserve lightness and chroma</p>
      </div>

      <div class="hue-controls">
        <div class="hue-shift-control">
          <label for="hue-shift-slider">Hue Shift: {hueShift()}°</label>
          <Slider
    id="hue-shift-slider"
    min={-180}
    max={180}
    step={1}
  /> setHueShift(parseInt(e.target.value))}
            class="slider"
          />
          <div class="hue-buttons">
            <button onClick={() => applyHueShift(-30)}>-30°</button>
            <button onClick={() => applyHueShift(-15)}>-15°</button>
            <button onClick={() => applyHueShift(-5)}>-5°</button>
            <button onClick={() => setHueShift(0)}>Reset</button>
            <button onClick={() => applyHueShift(5)}>+5°</button>
            <button onClick={() => applyHueShift(15)}>+15°</button>
            <button onClick={() => applyHueShift(30)}>+30°</button>
          </div>
        </div>

        <div class="preset-selector">
          <label for="preset-select">Color Harmony:</label>
          <select
            id="preset-select"
            value={selectedPreset()}
            onChange={(e) => handlePresetChange(e.target.value)}
          >
            <option value="custom">Custom Shift</option>
            <option value="complementary">Complementary</option>
            <option value="triadic">Triadic</option>
            <option value="tetradic">Tetradic</option>
            <option value="analogous">Analogous</option>
            <option value="ramp">Hue Ramp</option>
            <option value="eased">Eased Ramp</option>
          </select>
        </div>

        {(selectedPreset() === "ramp" || selectedPreset() === "eased") && (
          <div class="ramp-controls">
            <div class="control-group">
              <label for="ramp-stops">Ramp Stops:</label>
              <Slider
    id="ramp-stops"
    min={3}
    max={9}
    step={1}
  /> setRampStops(parseInt(e.target.value))}
                class="slider"
              />
              <span>{rampStops()}</span>
            </div>

            <div class="control-group">
              <label for="ramp-range">Hue Range:</label>
              <Slider
    id="ramp-range"
    min={30}
    max={180}
    step={5}
  /> setRampRange(parseInt(e.target.value))}
                class="slider"
              />
              <span>{rampRange()}°</span>
            </div>
          </div>
        )}

        {selectedPreset() === "eased" && (
          <div class="easing-controls">
            <label for="easing-select">Easing Function:</label>
            <select
              id="easing-select"
              value={easingFunction()}
              onChange={(e) =>
                setEasingFunction(
                  e.target.value as keyof typeof EasingFunctions,
                )
              }
            >
              <option value="linear">Linear</option>
              <option value="easeInOut">Ease In-Out</option>
              <option value="easeIn">Ease In</option>
              <option value="easeOut">Ease Out</option>
              <option value="bounce">Bounce</option>
            </select>
          </div>
        )}
      </div>

      <div class="color-display">
        <h4>Generated Colors</h4>
        <div class="color-swatches">
          <For each={presetColors()}>
            {(color, index) => (
              <div class="color-swatch">
                <div
                  class="swatch-color"
                  style={`background: oklch(${color.l}% ${color.c} ${color.h})`}
                ></div>
                <span>#{index() + 1}</span>
                <div class="color-info">
                  <div>L: {color.l.toFixed(1)}%</div>
                  <div>C: {color.c.toFixed(3)}</div>
                  <div>H: {color.h.toFixed(1)}°</div>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="hue-info">
        <h4>Hue Shifting Properties</h4>
        <div class="info-grid">
          <div class="info-item">
            <strong>Base Color:</strong>
            <div>L: {props.baseColor.l.toFixed(1)}%</div>
            <div>C: {props.baseColor.c.toFixed(3)}</div>
            <div>H: {props.baseColor.h.toFixed(1)}°</div>
          </div>

          <div class="info-item">
            <strong>Shifted Color:</strong>
            <div>L: {shiftedColor().l.toFixed(1)}% (preserved)</div>
            <div>C: {shiftedColor().c.toFixed(3)} (preserved)</div>
            <div>H: {shiftedColor().h.toFixed(1)}° (shifted)</div>
          </div>

          <div class="info-item">
            <strong>Shift Amount:</strong>
            <div>{hueShift()}°</div>
          </div>
        </div>
      </div>

      <div class="hue-explanation">
        <h4>What is True Hue Shifting?</h4>
        <p>
          True hue shifting in OKLCH preserves the lightness (L) and chroma (C)
          values while only modifying the hue (H) component. This ensures
          perceptually uniform color changes that maintain the original
          brightness and saturation.
        </p>
        <p>
          Unlike color ramping (which modifies all three components), pure hue
          shifting is mathematically correct for creating color harmonies and
          maintaining visual consistency across different hues.
        </p>
      </div>
    </div>
  );
};
