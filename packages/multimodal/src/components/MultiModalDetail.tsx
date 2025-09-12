/**
 * Multi-Modal Detail Component
 *
 * Displays detailed view of a selected file with
 * appropriate media player or viewer.
 */

import { Component, Show } from "solid-js";
import type { MultiModalDetailProps } from "../types/MultiModalTypes";
import { useI18n } from "reynard-i18n";

export const MultiModalDetail: Component<MultiModalDetailProps> = (props) => {
  const { t } = useI18n();
  return (
    <div class="multi-modal-detail-modal">
      <div class="detail-content">
        <button class="close-button" onClick={props.onClose}>
          ×
        </button>

        <div class="detail-header">
          <h2>{props.file.name}</h2>
          <div class="detail-meta">
            {props.file.fileType} •{" "}
            {(props.file.size / (1024 * 1024)).toFixed(2)} MB •{" "}
            {props.file.uploadedAt.toLocaleString()}
          </div>
        </div>

        <div class="detail-body">
          <Show when={props.file.fileType === "image"}>
            <img
              src={props.file.url}
              alt={props.file.name}
              class="detail-image"
            />
          </Show>

          <Show when={props.file.fileType === "video"}>
            <video src={props.file.url} controls class="detail-video" />
          </Show>

          <Show when={props.file.fileType === "audio"}>
            <div class="detail-audio">
              <audio src={props.file.url} controls />
            </div>
          </Show>

          <Show when={props.file.fileType === "text"}>
            <div class="detail-text-editor">
              <pre>{String(props.file.content || "")}</pre>
            </div>
          </Show>

          <Show when={props.file.fileType === "document"}>
            <div class="detail-document">
              <p>{t("multimodal.documentPreviewNotAvailable")}</p>
              <a
                href={props.file.url}
                download={props.file.name}
                class="download-button"
              >
                {t("multimodal.downloadDocument")}
              </a>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};
