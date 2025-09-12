/**
 * Multi-Modal File Info Component
 *
 * Displays file information including name, size, and metadata.
 */

import { Component, Show } from "solid-js";
import type { MultiModalFile } from "../types/MultiModalTypes";
import { useI18n } from "reynard-i18n";

interface MultiModalFileInfoProps {
  file: MultiModalFile;
  showMetadata?: boolean;
}

export const MultiModalFileInfo: Component<MultiModalFileInfoProps> = (
  props,
) => {
  const { t } = useI18n();
  return (
    <div class="file-info">
      <h4 class="file-name" title={props.file.name}>
        {props.file.name}
      </h4>
      <div class="file-size">
        {(props.file.size / (1024 * 1024)).toFixed(2)} MB
      </div>

      <Show when={props.showMetadata && props.file.metadata}>
        <div class="file-metadata">
          <div class="metadata-item">
            <span class="label">{t("multimodal.type")}:</span>
            <span class="value">{props.file.type}</span>
          </div>
          <div class="metadata-item">
            <span class="label">{t("multimodal.uploaded")}:</span>
            <span class="value">
              {props.file.uploadedAt.toLocaleDateString()}
            </span>
          </div>
        </div>
      </Show>
    </div>
  );
};
