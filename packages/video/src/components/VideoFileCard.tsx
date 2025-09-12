/**
 * Video File Card Component for Reynard Caption System
 *
 * Displays individual video file information with thumbnail and metadata.
 */

import { Component, createSignal, createEffect, Show } from "solid-js";
import { VideoFile } from "./types/VideoTypes";
import { useI18n } from "reynard-i18n";

export interface VideoFileCardProps {
  file: VideoFile;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  showMetadata?: boolean;
}

export const VideoFileCard: Component<VideoFileCardProps> = (props) => {
  const { t } = useI18n();
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
    <div
      class="video-file-card"
      classList={{ selected: props.isSelected }}
      onClick={props.onSelect}
    >
      <div class="video-thumbnail">
        <Show
          when={thumbnailUrl()}
          fallback={
            <div class="thumbnail-placeholder">
              {t("video.thumbnailPlaceholder")}
            </div>
          }
        >
          <img src={thumbnailUrl()!} alt={props.file.name} />
        </Show>
        <div class="play-overlay">
          <div class="play-button">▶</div>
        </div>
      </div>

      <div class="video-info">
        <h4 class="video-name" title={props.file.name}>
          {props.file.name}
        </h4>
        <div class="video-size">
          {(props.file.size / (1024 * 1024)).toFixed(2)} MB
        </div>

        <Show when={props.showMetadata && props.file.metadata}>
          <div class="video-metadata">
            <div class="metadata-item">
              <span class="label">{t("video.duration")}:</span>
              <span class="value">
                {Math.floor(props.file.metadata.duration / 60)}:
                {Math.floor(props.file.metadata.duration % 60)
                  .toString()
                  .padStart(2, "0")}
              </span>
            </div>
            <div class="metadata-item">
              <span class="label">{t("video.resolution")}:</span>
              <span class="value">
                {props.file.metadata.width}×{props.file.metadata.height}
              </span>
            </div>
            <div class="metadata-item">
              <span class="label">{t("video.fps")}:</span>
              <span class="value">{props.file.metadata.fps}</span>
            </div>
          </div>
        </Show>
      </div>

      <button
        class="remove-button"
        onClick={(e) => {
          e.stopPropagation();
          props.onRemove();
        }}
        title={t("video.removeVideo")}
      >
        ×
      </button>
    </div>
  );
};
