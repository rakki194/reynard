/**
 * RAG Image Modal Component
 *
 * Modal for displaying image content with metadata and embedding information
 * for RAG search results.
 */

import { Component, createSignal, createEffect, Show, For } from "solid-js";
import { Modal, Button, Card, Badge } from "reynard-components";
import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";
import type { ImageModalState } from "../types";

// Helper function to get icon as JSX element
const getIcon = (name: string) => {
  const icon = getIconFromRegistry(name);
  if (icon) {
    return <div innerHTML={icon as unknown as string} />;
  }
  return null;
};

export interface RAGImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imagePath: string;
  imageId: string;
  thumbnailPath?: string;
  previewPath?: string;
  imageMetadata?: Record<string, any>;
  imageDimensions?: { width: number; height: number };
  imageSize?: number;
  imageFormat?: string;
  embeddingVector?: number[];
  score: number;
}

export const RAGImageModal: Component<RAGImageModalProps> = (props) => {
  const [imageError, setImageError] = createSignal(false);
  const [imageLoading, setImageLoading] = createSignal(true);
  const [showEmbeddingInfo, setShowEmbeddingInfo] = createSignal(false);
  const [showMetadata, setShowMetadata] = createSignal(true);
  const [imageScale, setImageScale] = createSignal(1);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "Unknown";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDimensions = (dimensions?: {
    width: number;
    height: number;
  }): string => {
    if (!dimensions) return "Unknown";
    return `${dimensions.width} × ${dimensions.height}`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return "success";
    if (score >= 0.6) return "warning";
    return "error";
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 0.9) return "Excellent";
    if (score >= 0.8) return "Very Good";
    if (score >= 0.7) return "Good";
    if (score >= 0.6) return "Fair";
    return "Poor";
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = props.imagePath;
    link.download = props.imageId;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyImagePath = async () => {
    try {
      await navigator.clipboard.writeText(props.imagePath);
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy image path:", err);
    }
  };

  const copyEmbeddingVector = async () => {
    if (!props.embeddingVector) return;

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(props.embeddingVector),
      );
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy embedding vector:", err);
    }
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title={`Image: ${props.imageId}`}
      size="large"
      className="rag-image-modal"
    >
      <div class="rag-image-modal-container">
        {/* Header with image info and controls */}
        <div class="rag-image-header">
          <div class="image-info">
            <div class="image-path">{props.imagePath}</div>
            <div class="image-stats">
              {formatDimensions(props.imageDimensions)} •{" "}
              {formatFileSize(props.imageSize)} •{" "}
              {props.imageFormat?.toUpperCase()}
            </div>
          </div>

          <div class="image-controls">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setShowMetadata(!showMetadata())}
              icon={getIcon("info")}
            >
              {showMetadata() ? "Hide" : "Show"} Metadata
            </Button>

            <Button
              variant="secondary"
              size="small"
              onClick={() => setShowEmbeddingInfo(!showEmbeddingInfo())}
              icon={getIcon("brain")}
            >
              {showEmbeddingInfo() ? "Hide" : "Show"} Embedding
            </Button>

            <Button
              variant="secondary"
              size="small"
              onClick={copyImagePath}
              icon={getIcon("copy")}
            >
              Copy Path
            </Button>

            <Button
              variant="secondary"
              size="small"
              onClick={downloadImage}
              icon={getIcon("download")}
            >
              Download
            </Button>
          </div>
        </div>

        {/* Main content area */}
        <div class="rag-image-content">
          {/* Image display */}
          <div class="rag-image-display">
            <div class="image-container">
              <Show when={imageLoading()}>
                <div class="image-loading">
                  <div class="loading-spinner"></div>
                  <span>Loading image...</span>
                </div>
              </Show>

              <Show when={imageError()}>
                <div class="image-error">
                  <div class="error-icon">{getIcon("image-error")}</div>
                  <span>Failed to load image</span>
                  <Button onClick={() => setImageError(false)}>Retry</Button>
                </div>
              </Show>

              <Show when={!imageLoading() && !imageError()}>
                <img
                  src={props.previewPath || props.imagePath}
                  alt={props.imageId}
                  class="main-image"
                  style={{
                    transform: `scale(${imageScale()})`,
                  }}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                />
              </Show>
            </div>

            {/* Image controls */}
            <div class="image-zoom-controls">
              <Button
                variant="secondary"
                size="small"
                onClick={() =>
                  setImageScale(Math.max(0.25, imageScale() - 0.25))
                }
                icon={getIcon("zoom-out")}
              >
                Zoom Out
              </Button>

              <span class="zoom-level">{Math.round(imageScale() * 100)}%</span>

              <Button
                variant="secondary"
                size="small"
                onClick={() => setImageScale(Math.min(3, imageScale() + 0.25))}
                icon={getIcon("zoom-in")}
              >
                Zoom In
              </Button>

              <Button
                variant="secondary"
                size="small"
                onClick={() => setImageScale(1)}
                icon={getIcon("zoom-reset")}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Sidebar with metadata and embedding info */}
          <div class="rag-image-sidebar">
            {/* Similarity Score */}
            <Card className="score-card">
              <div class="score-header">
                <h4>Similarity Score</h4>
                <Badge variant={getScoreColor(props.score)}>
                  {getScoreLabel(props.score)}
                </Badge>
              </div>
              <div class="score-value">{(props.score * 100).toFixed(1)}%</div>
              <div class="score-bar">
                <div
                  class="score-fill"
                  style={{
                    width: `${props.score * 100}%`,
                    "background-color": `var(--color-${getScoreColor(props.score)})`,
                  }}
                />
              </div>
            </Card>

            {/* Metadata */}
            <Show when={showMetadata() && props.imageMetadata}>
              <Card className="metadata-card">
                <div class="card-header">
                  <h4>Image Metadata</h4>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => setShowMetadata(false)}
                    icon={getIcon("close")}
                  />
                </div>
                <div class="metadata-content">
                  <For each={Object.entries(props.imageMetadata || {})}>
                    {([key, value]) => (
                      <div class="metadata-item">
                        <span class="metadata-key">{key}:</span>
                        <span class="metadata-value">
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                        </span>
                      </div>
                    )}
                  </For>
                </div>
              </Card>
            </Show>

            {/* Embedding Information */}
            <Show when={showEmbeddingInfo() && props.embeddingVector}>
              <Card className="embedding-card">
                <div class="card-header">
                  <h4>Embedding Vector</h4>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => setShowEmbeddingInfo(false)}
                    icon={getIcon("close")}
                  />
                </div>
                <div class="embedding-content">
                  <div class="embedding-stats">
                    <div class="stat-item">
                      <span class="stat-label">Dimensions:</span>
                      <span class="stat-value">
                        {props.embeddingVector?.length}
                      </span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Magnitude:</span>
                      <span class="stat-value">
                        {props.embeddingVector
                          ? Math.sqrt(
                              props.embeddingVector.reduce(
                                (sum, val) => sum + val * val,
                                0,
                              ),
                            ).toFixed(4)
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div class="embedding-preview">
                    <div class="preview-label">First 10 dimensions:</div>
                    <div class="preview-values">
                      {props.embeddingVector?.slice(0, 10).map((val, index) => (
                        <span
                          class="dimension-value"
                          title={`Dimension ${index + 1}: ${val.toFixed(6)}`}
                        >
                          {val.toFixed(3)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="small"
                    onClick={copyEmbeddingVector}
                    icon={getIcon("copy")}
                    fullWidth
                  >
                    Copy Vector
                  </Button>
                </div>
              </Card>
            </Show>
          </div>
        </div>
      </div>
    </Modal>
  );
};
