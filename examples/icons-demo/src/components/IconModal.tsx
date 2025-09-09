/**
 * Icon Modal Component
 * Shows detailed information about a selected icon
 */

import { Component, createMemo } from "solid-js";
import { getIcon, allIcons } from "reynard-fluent-icons";

interface IconModalProps {
  iconName: string;
  onClose: () => void;
}

export const IconModal: Component<IconModalProps> = (props) => {
  const iconData = createMemo(
    () => allIcons[props.iconName as keyof typeof allIcons],
  );
  const iconElement = createMemo(() => getIcon(props.iconName));
  const metadata = createMemo(() => iconData()?.metadata);

  return (
    <div class="icon-modal" onClick={props.onClose}>
      <div class="modal-content" onClick={(e) => e.stopPropagation()}>
        <div class="modal-header">
          <h2 class="modal-title">{metadata()?.name}</h2>
          <button class="close-button" onClick={props.onClose}>
            ×
          </button>
        </div>

        <div class="modal-icon-display">
          {iconElement() && <div innerHTML={iconElement()!} />}
        </div>

        <div class="modal-details">
          <div class="detail-row">
            <span class="detail-label">Description:</span>
            <span class="detail-value">{metadata()?.description}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Tags:</span>
            <span class="detail-value">
              {metadata()?.tags?.join(", ") || "None"}
            </span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Keywords:</span>
            <span class="detail-value">
              {metadata()?.keywords?.join(", ") || "None"}
            </span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Icon Name:</span>
            <span class="detail-value">{props.iconName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
