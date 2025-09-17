/**
 * 🦊 3D Phyllotactic Canvas
 * Canvas component for 3D phyllotactic visualization
 */

import { Component, onMount } from "solid-js";
import { Card } from "reynard-components";

interface Phyllotactic3DCanvasProps {
  currentPoints: () => any[];
  height: () => number;
  spiralPitch: () => number;
  onCanvasReady: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
}

export const Phyllotactic3DCanvas: Component<Phyllotactic3DCanvasProps> = props => {
  let canvas: HTMLCanvasElement | undefined;

  onMount(() => {
    if (canvas) {
      const ctx = canvas.getContext("2d")!;
      canvas.width = 800;
      canvas.height = 600;
      props.onCanvasReady(canvas, ctx);
    }
  });

  return (
    <Card class="canvas-container">
      <canvas ref={canvas!} id="3d-canvas" class="demo-canvas"></canvas>
      <div class="canvas-overlay">
        <div class="overlay-info">
          <h4>3D Phyllotactic Spiral</h4>
          <p>{props.currentPoints().length} points in 3D space</p>
          <p>
            Height: {props.height()}, Pitch: {props.spiralPitch().toFixed(2)}
          </p>
        </div>
      </div>
    </Card>
  );
};
