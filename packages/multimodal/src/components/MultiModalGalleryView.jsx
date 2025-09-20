/**
 * Multi-Modal Gallery View Component
 *
 * Handles the JSX rendering for the multi-modal gallery.
 */
import { Show } from "solid-js";
import { MultiModalGalleryHeader } from "./MultiModalGalleryHeader";
import { MultiModalGalleryContent } from "./MultiModalGalleryContent";
import { MultiModalDetail } from "./MultiModalDetail";
export const MultiModalGalleryView = props => {
    return (<div class={`multi-modal-gallery ${props.class || ""}`}>
      <MultiModalGalleryHeader fileCounts={props.fileCounts} filterType={props.filterType} onFilterChange={props.onFilterChange} currentView={props.currentView} onViewChange={props.onViewChange} onFileUpload={props.onFileUpload} isLoading={props.isLoading}/>

      {/* Loading and Error States */}
      <Show when={props.isLoading}>
        <div class="loading-indicator">Processing files...</div>
      </Show>
      <Show when={props.error}>
        <div class="error-message">{props.error}</div>
      </Show>

      <MultiModalGalleryContent files={props.filteredFiles} selectedFile={props.selectedFile} currentView={props.currentView} onFileSelect={props.onFileSelect} onFileRemove={props.onFileRemove} showMetadata={props.showMetadata}/>

      {/* File Detail Modal */}
      <Show when={props.selectedFile}>
        <MultiModalDetail file={props.selectedFile} onClose={props.onCloseDetail} onModify={() => props.onFileModify(props.selectedFile)} editable={props.editable}/>
      </Show>
    </div>);
};
