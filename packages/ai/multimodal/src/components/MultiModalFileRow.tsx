/**
 * Multi-Modal File Row Component
 *
 * Displays individual files in list row format with
 * compact information display.
 */
import { getFileIcon } from "../utils/FileProcessingUtils";
import { useI18n } from "reynard-i18n";
export const MultiModalFileRow = props => {
  const { t } = useI18n();
  return (
    <div class="multi-modal-file-row" classList={{ selected: props.isSelected }} onClick={props.onSelect}>
      <div class="file-icon">{getFileIcon(props.file.fileType)}</div>
      <div class="file-name">{props.file.name}</div>
      <div class="file-type">{props.file.fileType}</div>
      <div class="file-size">{(props.file.size / (1024 * 1024)).toFixed(2)} MB</div>
      <div class="file-date">{props.file.uploadedAt.toLocaleDateString()}</div>
      <button
        class="remove-button"
        onClick={e => {
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
