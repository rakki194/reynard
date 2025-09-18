import { Component, createSignal, createEffect } from "solid-js";
import { type AABB } from "reynard-algorithms";
import { type PerformanceStats } from "../composables/usePerformanceStats";
import { useSpatialCanvasRenderer } from "../composables/useSpatialCanvasRenderer";

interface SpatialDemoCanvasProps {
  objects: AABB[];
  stats: PerformanceStats;
}

/**
 * Canvas component for spatial optimization demo visualization
 * Renders the spatial hash grid, objects, and performance overlay
 */
export const SpatialDemoCanvas: Component<SpatialDemoCanvasProps> = props => {
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement>();
  const { render } = useSpatialCanvasRenderer();

  // Re-render when objects or stats change
  createEffect(() => {
    const canvas = canvasRef();
    if (canvas) {
      render(canvas, props.objects, props.stats);
    }
  });

  return (
    <div class="demo-canvas-container">
      <canvas ref={setCanvasRef} width={800} height={500} class="demo-canvas" />
      <div class="canvas-overlay">
        <p>Spatial Hash Grid Visualization • Each cell is 50x50 pixels</p>
      </div>
    </div>
  );
};
