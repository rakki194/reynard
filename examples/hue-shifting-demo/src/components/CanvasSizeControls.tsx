import { Component } from "solid-js";

interface CanvasSizeControlsProps {
  canvasWidth: number;
  canvasHeight: number;
  onResizeCanvas: (width: number, height: number) => void;
}

export const CanvasSizeControls: Component<CanvasSizeControlsProps> = (
  props,
) => {
  return (
    <section class="control-section">
      <h3>Canvas Size</h3>
      <div class="canvas-size-controls">
        <div class="size-input">
          <label for="canvas-width">Width:</label>
          <input
            id="canvas-width"
            type="number"
            min="4"
            max="64"
            value={props.canvasWidth}
            onInput={(e) =>
              props.onResizeCanvas(parseInt(e.target.value), props.canvasHeight)
            }
          />
        </div>
        <div class="size-input">
          <label for="canvas-height">Height:</label>
          <input
            id="canvas-height"
            type="number"
            min="4"
            max="64"
            value={props.canvasHeight}
            onInput={(e) =>
              props.onResizeCanvas(props.canvasWidth, parseInt(e.target.value))
            }
          />
        </div>
      </div>
      <div class="preset-sizes">
        <button onClick={() => props.onResizeCanvas(8, 8)}>8×8</button>
        <button onClick={() => props.onResizeCanvas(16, 16)}>16×16</button>
        <button onClick={() => props.onResizeCanvas(32, 32)}>32×32</button>
      </div>
    </section>
  );
};
