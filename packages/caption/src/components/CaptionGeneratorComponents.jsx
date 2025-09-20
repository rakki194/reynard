/**
 * Caption Generator Sub-components
 *
 * Sub-components for the Caption Generator to keep the main component
 * under the 140-line limit.
 */
import { For, Show } from "solid-js";
// Model Selection Component
export const ModelSelection = props => (<div class="model-selection">
    <label class="model-label">Select Model:</label>
    <div class="model-grid">
      <For each={props.generators}>
        {generator => (<button type="button" class="model-card" classList={{
            "model-card--selected": props.selectedModel === generator.name,
            "model-card--unavailable": !generator.available,
        }} onClick={() => generator.available && props.onModelSelect(generator.name)} disabled={!generator.available}>
            <div class="model-name">{generator.displayName}</div>
            <div class="model-description">{generator.description}</div>
            <Show when={!generator.available}>
              <div class="model-status">Unavailable</div>
            </Show>
          </button>)}
      </For>
    </div>
  </div>);
// Image Upload Component
export const ImageUpload = props => (<div class="image-upload">
    <label class="upload-label">Upload Image:</label>
    <div class="upload-area" classList={{
        "upload-area--drag-over": props.isDragOver,
        "upload-area--has-file": !!props.imageFile,
    }} onDragOver={e => props.onDragOver(e)} onDragLeave={e => props.onDragLeave(e)} onDrop={e => props.onDrop(e)} onClick={() => props.onFileInputClick()}>
      <input ref={props.fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
        const file = e.target.files?.[0];
        if (file)
            props.onFileSelect(file);
    }}/>

      <Show when={props.imagePreview} fallback={<div class="upload-placeholder">
            <div class="upload-icon">📷</div>
            <div class="upload-text">
              <strong>Click to upload</strong> or drag and drop
            </div>
            <div class="upload-hint">PNG, JPG, GIF up to 10MB</div>
          </div>}>
        <div class="image-preview">
          <img src={props.imagePreview} alt="Preview"/>
          <div class="image-info">
            <div class="image-name">{props.imageFile?.name}</div>
            <div class="image-size">{props.imageFile ? (props.imageFile.size / 1024 / 1024).toFixed(2) : "0"} MB</div>
          </div>
        </div>
      </Show>
    </div>
  </div>);
// Generation Results Component
export const GenerationResults = props => (<div class="generation-results">
    <h4 class="results-title">Generated Caption:</h4>
    <div class="results-content">
      <div class="caption-display">
        <div class="caption-text">{props.result.caption}</div>
      </div>
    </div>

    <div class="result-meta">
      <div class="result-info">
        <span class="result-label">Model:</span>
        <span class="result-value">{props.selectedModel}</span>
      </div>
      <div class="result-info">
        <span class="result-label">Processing Time:</span>
        <span class="result-value">{props.result.processingTime?.toFixed(2)}s</span>
      </div>
      <div class="result-info">
        <span class="result-label">Success:</span>
        <span class="result-value">{props.result.success ? "Yes" : "No"}</span>
      </div>
    </div>
  </div>);
