import { Component } from "solid-js";
import type { OKLCHColor } from "reynard-colors";

type PixelData = OKLCHColor | null;
type DrawingTool = "pencil" | "eraser" | "fill";

interface PixelCanvasProps {
  canvasWidth: number;
  canvasHeight: number;
  pixels: PixelData[][];
  tool: DrawingTool;
  onMouseDown: (x: number, y: number) => void;
  onMouseMove: (x: number, y: number) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

export const PixelCanvas: Component<PixelCanvasProps> = props => {
  return (
    <div class="editor-canvas">
      <div class="canvas-container">
        <div
          class="pixel-canvas pixel-canvas--dynamic"
          style={{
            "--grid-cols": props.canvasWidth,
            "--grid-rows": props.canvasHeight,
            "grid-template-columns": `repeat(var(--grid-cols), 1fr)`,
            "grid-template-rows": `repeat(var(--grid-rows), 1fr)`,
          }}
        >
          {props.pixels.map((row, y) =>
            row.map((pixel, x) => (
              <div
                class={`pixel-cell ${pixel ? "pixel-cell--filled" : "pixel-cell--empty"}`}
                style={{
                  "background-color": pixel ? `oklch(${pixel.l}% ${pixel.c} ${pixel.h})` : "transparent",
                }}
                onMouseDown={() => props.onMouseDown(x, y)}
                onMouseMove={() => props.onMouseMove(x, y)}
                onMouseUp={props.onMouseUp}
                onMouseLeave={props.onMouseLeave}
              />
            ))
          )}
        </div>
      </div>

      <div class="canvas-info">
        <p>
          Canvas: {props.canvasWidth} × {props.canvasHeight} pixels
        </p>
        <p>Tool: {props.tool.charAt(0).toUpperCase() + props.tool.slice(1)}</p>
      </div>
    </div>
  );
};
