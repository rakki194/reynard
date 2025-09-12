/**
 * Multi-Modal File Card Component
 *
 * Displays individual files in card format with thumbnail,
 * metadata, and interaction controls.
 */

import { Component } from "solid-js";
import type { MultiModalFileCardProps } from "../types/MultiModalTypes";
import { getTypeColor } from "../utils/FileProcessingUtils";
import { MultiModalFileThumbnail } from "./MultiModalFileThumbnail";
import { MultiModalFileInfo } from "./MultiModalFileInfo";
import { useI18n } from "reynard-i18n";

export const MultiModalFileCard: Component<MultiModalFileCardProps> = (
  props,
) => {
  const { t } = useI18n();
  return (
    <div
      class="multi-modal-file-card"
      classList={{
        selected: props.isSelected,
        [`size-${props.size || "medium"}`]: true,
        [`type-${props.file.fileType}`]: true,
      }}
      onClick={() => props.onSelect()}
      style={{ "--type-color": getTypeColor(props.file.fileType) }}
    >
      <MultiModalFileThumbnail file={props.file} />
      <MultiModalFileInfo file={props.file} showMetadata={props.showMetadata} />

      <button
        class="remove-button"
        onClick={(e) => {
          e.stopPropagation();
          props.onRemove();
        }}
        title={t("multimodal.removeFile")}
      >
        ×
      </button>
    </div>
  );
};
