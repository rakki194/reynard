/**
 * Video Grid Content Component for Reynard Caption System
 * 
 * Renders the main content area of the video grid.
 */

import { Component, For, Show } from "solid-js";
import { VideoFile } from "./types/VideoTypes";
import { VideoFileCard } from "./VideoFileCard";
import { VideoPlayer } from "./VideoPlayer";

export interface VideoGridContentProps {
  class?: string;
  videoFiles: () => VideoFile[];
  selectedFile: () => VideoFile | null;
  isLoading: () => boolean;
  error: () => string | null;
  showMetadata?: boolean;
  onFileUpload: (event: Event) => void;
  onFileSelect: (file: VideoFile) => void;
  onFileRemove: (fileId: string) => void;
  onClosePlayer: () => void;
}

export const VideoGridContent: Component<VideoGridContentProps> = (props) => {
  return (
    <div class={`video-grid ${props.class || ""}`}>
      {/* File Upload */}
      <div class="video-upload-section">
        <input
          type="file"
          multiple
          accept="video/*"
          onChange={props.onFileUpload}
          class="video-upload-input"
          disabled={props.isLoading()}
          title="Select video files to upload"
          aria-label="Upload video files"
        />
        <Show when={props.isLoading()}>
          <div class="loading-indicator">Processing videos...</div>
        </Show>
        <Show when={props.error()}>
          <div class="error-message">{props.error()}</div>
        </Show>
      </div>

      {/* Video Files Grid */}
      <div class="video-files-grid">
        <For each={props.videoFiles()}>
          {(file) => (
            <VideoFileCard
              file={file}
              isSelected={props.selectedFile()?.id === file.id}
              onSelect={() => props.onFileSelect(file)}
              onRemove={() => props.onFileRemove(file.id)}
              showMetadata={props.showMetadata}
            />
          )}
        </For>
      </div>

      {/* Selected Video Player */}
      <Show when={props.selectedFile()}>
        <VideoPlayer
          file={props.selectedFile()!}
          onClose={props.onClosePlayer}
        />
      </Show>
    </div>
  );
};
