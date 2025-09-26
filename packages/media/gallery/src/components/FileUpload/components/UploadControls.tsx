/**
 * UploadControls Component
 * Handles upload action controls
 */

import { Component, Show } from "solid-js";
import { Button } from "reynard-primitives";

export interface UploadControlsProps {
  autoUpload: boolean;
  hasFiles: boolean;
  isUploading: () => boolean;
  startUpload: () => void;
}

export const UploadControls: Component<UploadControlsProps> = props => {
  return (
    <Show when={!props.autoUpload && props.hasFiles}>
      <div class="upload-controls">
        <Button onClick={() => props.startUpload()} disabled={props.isUploading()} loading={props.isUploading()}>
          {props.isUploading() ? "Uploading..." : "Upload Files"}
        </Button>
      </div>
    </Show>
  );
};
