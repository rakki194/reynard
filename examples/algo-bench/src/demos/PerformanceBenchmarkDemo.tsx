import { Component, createEffect, onCleanup } from "solid-js";
import { useBenchmarkExecution, type BenchmarkStats } from "./composables/useBenchmarkExecution";
import { useChartRenderer } from "./composables/useChartRenderer";
import { BenchmarkControls } from "./components/BenchmarkControls";
import { BenchmarkChart } from "./components/BenchmarkChart";
import { BenchmarkResults } from "./components/BenchmarkResults";

interface PerformanceBenchmarkDemoProps {
  onStatsUpdate: (stats: BenchmarkStats) => void;
}

/**
 * Performance benchmark demo component
 * Orchestrates benchmark execution, chart rendering, and results display
 */
export const PerformanceBenchmarkDemo: Component<PerformanceBenchmarkDemoProps> = props => {
  const { isRunning, results, currentTest, startBenchmark, clearResults } = useBenchmarkExecution();
  const { canvasRef, renderChart } = useChartRenderer();

  let animationFrameId: number;

  // Animation loop
  const animate = () => {
    renderChart(results());
    animationFrameId = requestAnimationFrame(animate);
  };

  // Effects
  createEffect(() => {
    if (isRunning()) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    }
  });

  onCleanup(() => {
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
    }
  });

  const handleStart = () => {
    startBenchmark(props.onStatsUpdate);
  };

  return (
    <div class="benchmark-demo">
      <BenchmarkControls
        isRunning={isRunning()}
        currentTest={currentTest()}
        onStart={handleStart}
        onClear={clearResults}
      />

      <BenchmarkChart canvasRef={canvasRef} />

      <BenchmarkResults results={results()} />
    </div>
  );
};
