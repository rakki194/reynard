/**
 * Multi-Modal Gallery Header Component
 *
 * Handles gallery title, file counts, view controls, and file upload.
 */

import { Component, For } from "solid-js";
import type { MediaType, GalleryView, FileCounts } from "../types/MultiModalTypes";

interface MultiModalGalleryHeaderProps {
  fileCounts: FileCounts;
  filterType: MediaType | "all";
  onFilterChange: (type: MediaType | "all") => void;
  currentView: GalleryView;
  onViewChange: (view: GalleryView) => void;
  onFileUpload: (event: Event) => void;
  isLoading: boolean;
}

export const MultiModalGalleryHeader: Component<MultiModalGalleryHeaderProps> = props => {
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
                onClick={() => props.onFilterChange(type as MediaType | "all")}
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
