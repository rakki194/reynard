/**
 * Multi-Modal Gallery Content Component
 *
 * Handles the main content area with different view modes.
 */
import { Show } from "solid-js";
import { MultiModalGrid } from "./MultiModalGrid";
import { MultiModalList } from "./MultiModalList";
import { MultiModalTimeline } from "./MultiModalTimeline";
export const MultiModalGalleryContent = props => {
  return (
    <div class="gallery-content">
      <Show when={props.currentView === "grid"}>
        <MultiModalGrid
          files={props.files}
          selectedFile={props.selectedFile}
          onFileSelect={props.onFileSelect}
          onFileRemove={props.onFileRemove}
          showMetadata={props.showMetadata}
        />
      </Show>

      <Show when={props.currentView === "list"}>
        <MultiModalList
          files={props.files}
          selectedFile={props.selectedFile}
          onFileSelect={props.onFileSelect}
          onFileRemove={props.onFileRemove}
          showMetadata={props.showMetadata}
        />
      </Show>

      <Show when={props.currentView === "timeline"}>
        <MultiModalTimeline
          files={props.files}
          selectedFile={props.selectedFile}
          onFileSelect={props.onFileSelect}
          onFileRemove={props.onFileRemove}
          showMetadata={props.showMetadata}
        />
      </Show>
    </div>
  );
};
