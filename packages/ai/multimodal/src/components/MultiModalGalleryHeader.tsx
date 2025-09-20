/**
 * Multi-Modal Gallery Header Component
 *
 * Handles gallery title, file counts, view controls, and file upload.
 */
import { For } from "solid-js";
export const MultiModalGalleryHeader = props => {
  return (
    <div class="gallery-header">
      <div class="gallery-title">
        <h2>Multi-Modal Gallery</h2>
        <div class="file-counts">
          <For each={Object.entries(props.fileCounts)}>
            {([type, count]) => (
              <button
                class="count-button"
                classList={{ active: props.filterType === type }}
                onClick={() => props.onFilterChange(type)}
              >
                {type}: {count}
              </button>
            )}
          </For>
        </div>
      </div>

      <div class="gallery-controls">
        <div class="view-controls">
          <button
            class="view-button"
            classList={{ active: props.currentView === "grid" }}
            onClick={() => props.onViewChange("grid")}
          >
            Grid
          </button>
          <button
            class="view-button"
            classList={{ active: props.currentView === "list" }}
            onClick={() => props.onViewChange("list")}
          >
            List
          </button>
          <button
            class="view-button"
            classList={{ active: props.currentView === "timeline" }}
            onClick={() => props.onViewChange("timeline")}
          >
            Timeline
          </button>
        </div>

        <input
          type="file"
          multiple
          onChange={props.onFileUpload}
          class="file-upload-input"
          disabled={props.isLoading}
          title="Upload files"
          aria-label="Upload files to gallery"
        />
      </div>
    </div>
  );
};
