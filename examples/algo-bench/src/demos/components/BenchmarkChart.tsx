import { Component } from "solid-js";

interface BenchmarkChartProps {
  canvasRef: (element: HTMLCanvasElement) => void;
}

/**
 * Chart visualization component for benchmark results
 * Displays performance comparison between naive and spatial hash algorithms
 */
export const BenchmarkChart: Component<BenchmarkChartProps> = props => {
  return (
    <div class="demo-canvas-container">
      <canvas ref={props.canvasRef} width={800} height={500} class="demo-canvas" />
      <div class="canvas-overlay">
        <p>Performance Comparison Chart • Red: Naive O(n²) • Teal: Spatial Hash O(n)</p>
      </div>
    </div>
  );
};
