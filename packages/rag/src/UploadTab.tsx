/**
 * RAG Upload Tab Component
 *
 * Handles file upload functionality for the RAG system
 * with progress tracking and file type validation.
 */

import { Show } from "solid-js";
import { Card } from "reynard-components";
import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";

// Helper function to get icon as JSX element
const getIcon = (name: string) => {
  const icon = getIconFromRegistry(name);
  if (icon) {
    return <div innerHTML={icon as unknown as string} />;
  }
  return null;
};

export interface UploadTabProps {
  isUploading: boolean;
  uploadProgress: number;
  onFileSelect: (e: Event) => void;
}

export function UploadTab(props: UploadTabProps) {
  return (
    <div class="upload-tab-content">
      <Card variant="elevated" padding="lg">
        <h3>Upload Documents</h3>

        <div class="upload-area">
          <input
            type="file"
            id="file-upload"
            accept=".txt,.md,.py,.js,.ts,.json,.yaml,.yml,.html"
            onChange={props.onFileSelect}
            disabled={props.isUploading}
            class="hidden"
          />
          <label for="file-upload" class="upload-label">
            <div class="upload-icon">{getIcon("upload")}</div>
            <span>Click to upload or drag and drop</span>
            <small>
              Supports: .txt, .md, .py, .js, .ts, .json, .yaml, .html
            </small>
          </label>
        </div>

        <Show when={props.isUploading}>
          <div class="upload-progress">
            <div class="upload-progress-bar">
              <div
                class="upload-progress-fill"
                style={`width: ${props.uploadProgress}%`}
              />
            </div>
            <p>Uploading and processing document...</p>
          </div>
        </Show>
      </Card>
    </div>
  );
}
