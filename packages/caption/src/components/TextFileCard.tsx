/**
 * Text File Card Component for Reynard Caption System
 * 
 * Displays individual text file information in a card format.
 */

import { Component, Show } from "solid-js";
import { TextFile } from "../types/TextTypes";
import { getFileExtension, getFileIcon } from "../utils/textFileUtils";

export interface TextFileCardProps {
  file: TextFile;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  showMetadata?: boolean;
}

export const TextFileCard: Component<TextFileCardProps> = (props) => {
  const extension = getFileExtension(props.file.name);
  const icon = getFileIcon(extension);

  return (
    <div
      class="text-file-card"
      classList={{ selected: props.isSelected }}
      onClick={props.onSelect}
    >
      <div class="text-file-icon">
        <span class="file-icon">{icon}</span>
        <span class="file-extension">{extension}</span>
      </div>
      
      <div class="text-file-info">
        <h4 class="text-file-name" title={props.file.name}>
          {props.file.name}
        </h4>
        <div class="text-file-size">
          {(props.file.size / 1024).toFixed(2)} KB
        </div>
        
        <Show when={props.showMetadata && props.file.metadata}>
          <div class="text-file-metadata">
            <div class="metadata-item">
              <span class="label">Lines:</span>
              <span class="value">{props.file.metadata.lineCount}</span>
            </div>
            <div class="metadata-item">
              <span class="label">Words:</span>
              <span class="value">{props.file.metadata.wordCount}</span>
            </div>
            <div class="metadata-item">
              <span class="label">Chars:</span>
              <span class="value">{props.file.metadata.characterCount}</span>
            </div>
            <div class="metadata-item">
              <span class="label">Language:</span>
              <span class="value">{props.file.metadata.language}</span>
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
        title="Remove file"
      >
        ×
      </button>
    </div>
  );
};
