/**
 * Image Grid Component for Reynard Caption System
 *
 * Leverages existing GalleryGrid infrastructure and ImageThumbnailGenerator
 * for comprehensive image file handling and display.
 */

import { Component, createSignal, createEffect, For, Show } from "solid-js";
import {
  ImageThumbnailGenerator,
  ImageMetadataExtractor,
} from "reynard-file-processing";
import { ImageFile, ImageMetadata } from "./types/ImageTypes";
import { useI18n } from "reynard-i18n";

export interface ImageGridProps {
  /** Initial image files to display */
  initialFiles?: ImageFile[];
  /** Callback when files are selected */
  onFileSelect?: (file: ImageFile) => void;
  /** Callback when files are removed */
  onFileRemove?: (fileId: string) => void;
  /** Callback when caption generation is requested */
  onGenerateCaption?: (file: ImageFile) => void;
  /** Maximum number of files to display */
  maxFiles?: number;
  /** Whether to show file metadata */
  showMetadata?: boolean;
  /** Whether caption generation is in progress */
  isGenerating?: boolean;
  /** Custom CSS class */
  class?: string;
}

export const ImageGrid: Component<ImageGridProps> = (props) => {
  const { t } = useI18n();
  const [imageFiles, setImageFiles] = createSignal<ImageFile[]>(
    props.initialFiles || [],
  );
  const [selectedFile, setSelectedFile] = createSignal<ImageFile | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Initialize processors using existing infrastructure
  const thumbnailGenerator = new ImageThumbnailGenerator({
    size: [200, 200],
    format: "webp",
    quality: 85,
    maintainAspectRatio: true,
  });

  const metadataExtractor = new ImageMetadataExtractor();

  // Handle file selection
  const handleFileSelect = (file: ImageFile) => {
    setSelectedFile(file);
    props.onFileSelect?.(file);
  };

  // Handle file removal
  const handleFileRemove = (fileId: string) => {
    setImageFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (selectedFile()?.id === fileId) {
      setSelectedFile(null);
    }
    props.onFileRemove?.(fileId);
  };

  // Handle caption generation
  const handleGenerateCaption = (file: ImageFile) => {
    props.onGenerateCaption?.(file);
  };

  // Process uploaded files
  const processImageFile = async (file: File): Promise<ImageFile> => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate thumbnail using existing infrastructure
      const thumbnailResult = await thumbnailGenerator.generateThumbnail(file);
      if (!thumbnailResult.success) {
        throw new Error(
          thumbnailResult.error || t("image.failedToGenerateThumbnail"),
        );
      }

      // Extract metadata using existing infrastructure
      const metadata = await metadataExtractor.extractMetadata(file);

      const imageFile: ImageFile = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        thumbnail: thumbnailResult.data as Blob,
        metadata,
        uploadedAt: new Date(),
      };

      return imageFile;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process image file";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) return;

    const maxFiles = props.maxFiles || 20;
    const filesToProcess = Array.from(files).slice(0, maxFiles);

    try {
      const processedFiles = await Promise.all(
        filesToProcess.map(processImageFile),
      );

      setImageFiles((prev) => [...prev, ...processedFiles]);
    } catch (err) {
      console.error(t("image.failedToProcessImageFiles"), err);
    }
  };

  // Cleanup on unmount
  createEffect(() => {
    return () => {
      thumbnailGenerator.destroy();
    };
  });

  return (
    <div class={`image-grid ${props.class || ""}`}>
      {/* File Upload */}
      <div class="image-upload-section">
        <label for="image-upload" class="upload-label">
          Upload Images
        </label>
        <input
          id="image-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          class="image-upload-input"
          disabled={isLoading()}
          title={t("image.selectImageFilesToUpload")}
        />
        <Show when={isLoading()}>
          <div class="loading-indicator">{t("image.processingImages")}</div>
        </Show>
        <Show when={error()}>
          <div class="error-message">{error()}</div>
        </Show>
      </div>

      {/* Images Grid */}
      <div class="images-grid">
        <For each={imageFiles()}>
          {(file) => (
            <ImageFileCard
              file={file}
              isSelected={selectedFile()?.id === file.id}
              onSelect={() => handleFileSelect(file)}
              onRemove={() => handleFileRemove(file.id)}
              onGenerateCaption={() => handleGenerateCaption(file)}
              showMetadata={props.showMetadata}
              isGenerating={props.isGenerating}
            />
          )}
        </For>
      </div>

      {/* Selected Image Viewer */}
      <Show when={selectedFile()}>
        <ImageViewer
          file={selectedFile()!}
          onClose={() => setSelectedFile(null)}
          onGenerateCaption={() => handleGenerateCaption(selectedFile()!)}
          isGenerating={props.isGenerating}
        />
      </Show>
    </div>
  );
};

// Image File Card Component
interface ImageFileCardProps {
  file: ImageFile;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onGenerateCaption: () => void;
  showMetadata?: boolean;
  isGenerating?: boolean;
}

const ImageFileCard: Component<ImageFileCardProps> = (props) => {
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
      class="image-file-card"
      classList={{ selected: props.isSelected }}
      onClick={props.onSelect}
    >
      <div class="image-thumbnail">
        <Show
          when={thumbnailUrl()}
          fallback={
            <div class="thumbnail-placeholder">{t("image.imageIcon")}</div>
          }
        >
          <img src={thumbnailUrl()!} alt={props.file.name} />
        </Show>
        <div class="image-overlay">
          <div class="image-actions">
            <button
              class="action-button generate-button"
              onClick={(e) => {
                e.stopPropagation();
                props.onGenerateCaption();
              }}
              disabled={props.isGenerating}
            >
              {props.isGenerating ? "⏳" : "🤖"}
            </button>
            <button
              class="action-button remove-button"
              onClick={(e) => {
                e.stopPropagation();
                props.onRemove();
              }}
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <div class="image-info">
        <h4 class="image-name" title={props.file.name}>
          {props.file.name}
        </h4>
        <div class="image-size">
          {(props.file.size / (1024 * 1024)).toFixed(2)} MB
        </div>

        <Show when={props.showMetadata && props.file.metadata}>
          <div class="image-metadata">
            <div class="metadata-item">
              <span class="label">Dimensions:</span>
              <span class="value">
                {props.file.metadata.width}×{props.file.metadata.height}
              </span>
            </div>
            <div class="metadata-item">
              <span class="label">Format:</span>
              <span class="value">{props.file.metadata.format}</span>
            </div>
            <div class="metadata-item">
              <span class="label">Color Space:</span>
              <span class="value">{props.file.metadata.colorSpace}</span>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
};

// Image Viewer Component
interface ImageViewerProps {
  file: ImageFile;
  onClose: () => void;
  onGenerateCaption: () => void;
  isGenerating?: boolean;
}

const ImageViewer: Component<ImageViewerProps> = (props) => {
  return (
    <div class="image-viewer-modal">
      <div class="image-viewer-content">
        <button class="close-button" onClick={props.onClose}>
          ×
        </button>

        <div class="image-viewer-header">
          <h2>{props.file.name}</h2>
          <div class="image-viewer-actions">
            <button
              class="generate-caption-button"
              onClick={props.onGenerateCaption}
              disabled={props.isGenerating}
            >
              {props.isGenerating
                ? "⏳ Generating Caption..."
                : "🤖 Generate Caption"}
            </button>
          </div>
        </div>

        <div class="image-viewer-body">
          <img
            src={props.file.url}
            alt={props.file.name}
            class="viewer-image"
          />

          <Show when={props.file.metadata}>
            <div class="image-metadata-panel">
              <h3>Image Information</h3>
              <div class="metadata-grid">
                <div class="metadata-item">
                  <span class="label">Dimensions:</span>
                  <span class="value">
                    {props.file.metadata.width}×{props.file.metadata.height}
                  </span>
                </div>
                <div class="metadata-item">
                  <span class="label">Format:</span>
                  <span class="value">{props.file.metadata.format}</span>
                </div>
                <div class="metadata-item">
                  <span class="label">Color Space:</span>
                  <span class="value">{props.file.metadata.colorSpace}</span>
                </div>
                <div class="metadata-item">
                  <span class="label">File Size:</span>
                  <span class="value">
                    {(props.file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};
