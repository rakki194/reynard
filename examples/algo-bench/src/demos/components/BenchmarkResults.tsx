import { Component, For } from "solid-js";
import type { BenchmarkResult } from "../composables/useBenchmarkAlgorithms";

interface BenchmarkResultsProps {
  results: BenchmarkResult[];
}

/**
 * Results table component for benchmark data
 * Displays performance metrics in a structured table format
 */
export const BenchmarkResults: Component<BenchmarkResultsProps> = props => {
  return (
    <div class="benchmark-results">
      {props.results.length > 0 && (
        <div class="results-table">
          <h3>Benchmark Results</h3>
          <table>
            <thead>
              <tr>
                <th>Objects</th>
                <th>Naive Time (ms)</th>
                <th>Spatial Time (ms)</th>
                <th>Speedup</th>
                <th>Collisions</th>
              </tr>
            </thead>
            <tbody>
              <For each={props.results}>
                {result => (
                  <tr>
                    <td>{result.objectCount}</td>
                    <td>{result.naiveTime.toFixed(2)}</td>
                    <td>{result.spatialTime.toFixed(2)}</td>
                    <td class={result.speedup > 2 ? "highlight" : ""}>{result.speedup.toFixed(2)}x</td>
                    <td>{result.collisionCount}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
