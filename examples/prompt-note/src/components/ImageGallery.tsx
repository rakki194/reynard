/**
 * ImageGallery Component
 * Displays uploaded images with caption generation capabilities
 */

import { Component, For, Show } from "solid-js";
import { Button, Card } from "reynard-components";
import { useNotifications } from "reynard-core";
// Define ImageItem interface locally
interface ImageItem {
  id: string;
  name: string;
  url: string;
  caption?: string;
  tags?: string[];
  generatedAt?: Date;
  model?: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  onFileUpload: (files: File[]) => void;
  onImageSelect: (image: ImageItem) => void;
  onGenerateCaption: (image: ImageItem) => void;
  onDeleteImage: (imageId: string) => void;
  selectedImage: ImageItem | null;
}

export const ImageGallery: Component<ImageGalleryProps> = (props) => {
  const { notify } = useNotifications();

  const handleFileInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    if (files.length === 0) return;

    // Filter for image files only
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      notify("Only image files are supported", "warning");
    }

    if (imageFiles.length > 0) {
      props.onFileUpload(imageFiles);
    }

    // Reset input
    input.value = "";
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer!.dropEffect = "copy";
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      props.onFileUpload(imageFiles);
    } else {
      notify("Please drop image files only", "warning");
    }
  };

  return (
    <div class="image-gallery">
      {/* File Upload Area */}
      <Card class="upload-area" padding="lg">
        <div class="drop-zone" onDragOver={handleDragOver} onDrop={handleDrop}>
          <div class="upload-content">
            <div class="upload-icon">📁</div>
            <h3>Upload Images</h3>
            <p>Drag and drop images here or click to browse</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              class="file-input"
              aria-label="Upload image files"
              title="Click to select image files"
            />
            <Button
              variant="primary"
              onClick={() => {
                const input = document.querySelector(
                  ".file-input",
                ) as HTMLInputElement;
                input?.click();
              }}
            >
              Choose Files
            </Button>
          </div>
        </div>
      </Card>

      {/* Images Grid */}
      <Show when={props.images.length > 0}>
        <div class="images-grid">
          <For each={props.images}>
            {(image) => (
              <Card
                class={`image-card ${props.selectedImage?.id === image.id ? "selected" : ""}`}
                padding="md"
              >
                <div class="image-container">
                  <img
                    src={image.url}
                    alt={image.name}
                    onClick={() => props.onImageSelect(image)}
                  />

                  <div class="image-overlay">
                    <div class="image-actions">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => props.onGenerateCaption(image)}
                        disabled={!image.caption}
                      >
                        {image.caption
                          ? "🔄 Regenerate"
                          : "🤖 Generate Caption"}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => props.onDeleteImage(image.id)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </div>

                <div class="image-info">
                  <h4 class="image-name">{image.name}</h4>

                  <Show when={image.caption}>
                    <div class="caption-preview">
                      <strong>Caption:</strong>
                      <p>{image.caption}</p>
                    </div>
                  </Show>

                  <Show when={image.tags && image.tags.length > 0}>
                    <div class="tags-preview">
                      <strong>Tags:</strong>
                      <div class="tag-list">
                        <For each={image.tags}>
                          {(tag) => <span class="tag">{tag}</span>}
                        </For>
                      </div>
                    </div>
                  </Show>

                  <Show when={image.generatedAt}>
                    <div class="generation-info">
                      <small>
                        Generated with {image.model} at{" "}
                        {image.generatedAt?.toLocaleTimeString()}
                      </small>
                    </div>
                  </Show>
                </div>
              </Card>
            )}
          </For>
        </div>
      </Show>

      <Show when={props.images.length === 0}>
        <Card class="empty-state" padding="lg">
          <div class="empty-content">
            <div class="empty-icon">🖼️</div>
            <h3>No Images Yet</h3>
            <p>Upload some images to get started with AI caption generation!</p>
          </div>
        </Card>
      </Show>
    </div>
  );
};
