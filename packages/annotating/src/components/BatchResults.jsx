/**
 * Batch Results Component
 *
 * Displays results from batch processing with export functionality.
 */
import { For, Show } from "solid-js";
export const BatchResults = (props) => {
    const completedFiles = () => props.files.filter((f) => f.status === "completed" && f.result);
    const totalFiles = () => props.files.length;
    const successRate = () => totalFiles() > 0
        ? Math.round((completedFiles().length / totalFiles()) * 100)
        : 0;
    const errorCount = () => props.files.filter((f) => f.status === "error").length;
    return (<Show when={props.showResults}>
      <div class={`results-section ${props.class || ""}`}>
        <div class="results-header">
          <h4>Results</h4>
          <button onClick={props.onExportResults} class="export-button">
            Export Results
          </button>
        </div>

        <div class="results-summary">
          <div class="summary-stat">
            <span class="stat-label">Total Processed:</span>
            <span class="stat-value">{completedFiles().length}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Success Rate:</span>
            <span class="stat-value">{successRate()}%</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Errors:</span>
            <span class="stat-value error">{errorCount()}</span>
          </div>
        </div>

        <div class="results-list">
          <For each={completedFiles()}>
            {(file) => (<div class="result-item">
                <div class="result-file">{file.file.name}</div>
                <div class="result-caption">
                  {file.result?.caption || "No caption generated"}
                </div>
                <div class="result-meta">
                  <span>Generator: {file.generatorName}</span>
                  <span>Time: {file.result?.processingTime?.toFixed(2)}s</span>
                  <span>Type: {file.result?.captionType}</span>
                </div>
              </div>)}
          </For>
        </div>
      </div>
    </Show>);
};
