/**
 * Multi-Modal File Thumbnail Component
 *
 * Handles thumbnail display with fallback to file type icon.
 */

import { Component, createSignal, createEffect, Show } from "solid-js";
import type { MultiModalFile } from "../types/MultiModalTypes";
import { getFileIcon, getTypeColor } from "../utils/FileProcessingUtils";

interface MultiModalFileThumbnailProps {
  file: MultiModalFile;
}

export const MultiModalFileThumbnail: Component<
  MultiModalFileThumbnailProps
> = (props) => {
  const [thumbnailUrl, setThumbnailUrl] = createSignal<string | null>(null);

  // Create thumbnail URL
  createEffect(() => {
    if (props.file.thumbnail) {
      const url = URL.createObjectURL(props.file.thumbnail);
      setThumbnailUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  });

  return (
    <div class="file-thumbnail">
      <Show
        when={thumbnailUrl()}
        fallback={
          <div class="thumbnail-placeholder">
            {getFileIcon(props.file.fileType)}
          </div>
        }
      >
        <img src={thumbnailUrl()!} alt={props.file.name} />
      </Show>
      <div
        class="file-type-badge"
        style={{ background: getTypeColor(props.file.fileType) }}
      >
        {props.file.fileType.toUpperCase()}
      </div>
    </div>
  );
};
