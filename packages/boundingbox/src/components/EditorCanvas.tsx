/**
 * Editor Canvas Component
 *
 * Handles canvas rendering and drawing overlay
 */

import type { Component } from "solid-js";
import { Show } from "solid-js";
import type { BoundingBox } from "../types";

export interface EditorCanvasProps {
  canvasRef: (element: HTMLCanvasElement) => void;
  containerWidth: number;
  containerHeight: number;
  isDrawing: () => boolean;
  newBox: () => Partial<BoundingBox> | null;
  className?: string;
}

export const EditorCanvas: Component<EditorCanvasProps> = (props) => {
  const {
    canvasRef,
    containerWidth,
    containerHeight,
    isDrawing,
    newBox,
    className = "",
  } = props;

  return (
    <div class={`canvas-container ${className}`}>
      <canvas
        ref={canvasRef}
        class="bounding-box-canvas"
        width={containerWidth}
        height={containerHeight}
      />

      <Show when={isDrawing() && newBox()}>
        <div
          class="drawing-overlay"
          data-x={newBox()!.x}
          data-y={newBox()!.y}
          data-width={newBox()!.width}
          data-height={newBox()!.height}
        />
      </Show>
    </div>
  );
};
