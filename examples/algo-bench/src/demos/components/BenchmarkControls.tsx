import { Component } from "solid-js";

interface BenchmarkControlsProps {
  isRunning: boolean;
  currentTest: number;
  onStart: () => void;
  onClear: () => void;
}

/**
 * Control panel for benchmark execution
 * Provides start/stop and clear functionality
 */
export const BenchmarkControls: Component<BenchmarkControlsProps> = props => {
  return (
    <div class="demo-controls">
      <div class="control-group">
        <button
          class={`control-button ${props.isRunning ? "active" : ""}`}
          onClick={() => props.onStart()}
          disabled={props.isRunning}
        >
          {props.isRunning ? `🔄 Running Test ${props.currentTest}/8...` : "🚀 Start Benchmark"}
        </button>

        <button class="control-button" onClick={() => props.onClear()} disabled={props.isRunning}>
          🗑️ Clear Results
        </button>
      </div>
    </div>
  );
};
