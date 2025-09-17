/**
 * Batch File List Component
 *
 * Displays and manages the list of files in the batch.
 */
import { For } from "solid-js";
export const BatchFileList = (props) => {
    return (<div class={`file-list ${props.class || ""}`}>
      <div class="file-list-header">
        <h4>Files ({props.files.length})</h4>
        <div class="file-list-actions">
          <button onClick={props.onProcessBatch} disabled={props.isProcessing || props.files.length === 0} class="process-button">
            {props.isProcessing ? "Processing..." : "Process Batch"}
          </button>
          <button onClick={props.onClearBatch} disabled={props.isProcessing} class="clear-button">
            Clear All
          </button>
        </div>
      </div>

      <div class="files-grid">
        <For each={props.files}>
          {(file) => (<div class={`file-item ${file.status}`}>
              <div class="file-info">
                <div class="file-name">{file.file.name}</div>
                <div class="file-generator">
                  <select value={file.generatorName} onChange={(e) => props.onUpdateFileConfig(file.id, {
                generatorName: e.currentTarget.value,
            })} disabled={props.isProcessing} aria-label={`Select generator for ${file.file.name}`}>
                    <For each={props.availableGenerators}>
                      {(generator) => (<option value={generator}>{generator}</option>)}
                    </For>
                  </select>
                </div>
              </div>

              <div class="file-status">
                <div class={`status-indicator ${file.status}`}>
                  {file.status === "pending" && "⏳"}
                  {file.status === "processing" && "🔄"}
                  {file.status === "completed" && "✅"}
                  {file.status === "error" && "❌"}
                </div>
                <div class="status-text">
                  {file.status === "processing" && file.progress && (<span>{file.progress}%</span>)}
                  {file.status === "error" && file.error && (<span class="error-text">{file.error}</span>)}
                </div>
              </div>

              <button onClick={() => props.onRemoveFile(file.id)} disabled={props.isProcessing} class="remove-button" aria-label={`Remove ${file.file.name} from batch`}>
                ✕
              </button>
            </div>)}
        </For>
      </div>
    </div>);
};
