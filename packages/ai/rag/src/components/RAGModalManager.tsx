/**
 * RAG Modal Manager Component
 *
 * Centralized modal state management and coordination.
 * Extracted from RAGSearch.tsx to follow the 140-line axiom.
 */
import { Show } from "solid-js";
import { RAGFileModal } from "./RAGFileModal";
import { RAGImageModal } from "./RAGImageModal";
import { RAG3DVisualizationModal } from "./RAG3DVisualizationModal";
import type { FileModalState, ImageModalState, ThreeDModalState } from "../types";

export interface RAGModalManagerProps {
  // Modal states
  fileModalState: () => FileModalState;
  setFileModalState: (state: FileModalState) => void;

  imageModalState: () => ImageModalState;
  setImageModalState: (state: ImageModalState) => void;

  threeDModalState: () => ThreeDModalState;
  setThreeDModalState: (state: ThreeDModalState) => void;

  // Handlers
  onFileModalClose: () => void;
  onImageModalClose: () => void;
  on3DModalClose: () => void;
}

export function RAGModalManager(props: RAGModalManagerProps) {
  return (
    <div class="rag-modal-manager">
      {/* File Modal */}
      <Show when={props.fileModalState().isOpen}>
        <RAGFileModal
          isOpen={props.fileModalState().isOpen}
          filePath={props.fileModalState().filePath}
          fileName={props.fileModalState().fileName}
          fileContent={props.fileModalState().fileContent}
          chunkIndex={props.fileModalState().chunkIndex}
          chunkText={props.fileModalState().chunkText}
          onClose={props.onFileModalClose}
        />
      </Show>

      {/* Image Modal */}
      <Show when={props.imageModalState().isOpen}>
        <RAGImageModal
          isOpen={props.imageModalState().isOpen}
          imagePath={props.imageModalState().imagePath}
          imageId={props.imageModalState().imageId}
          thumbnailPath={props.imageModalState().thumbnailPath}
          previewPath={props.imageModalState().previewPath}
          imageMetadata={props.imageModalState().imageMetadata}
          imageDimensions={props.imageModalState().imageDimensions}
          imageSize={props.imageModalState().imageSize}
          imageFormat={props.imageModalState().imageFormat}
          embeddingVector={props.imageModalState().embeddingVector}
          score={props.imageModalState().score}
          onClose={props.onImageModalClose}
        />
      </Show>

      {/* 3D Visualization Modal */}
      <Show when={props.threeDModalState().isOpen}>
        <RAG3DVisualizationModal
          isOpen={props.threeDModalState().isOpen}
          searchQuery={props.threeDModalState().searchQuery}
          searchResults={props.threeDModalState().searchResults}
          queryEmbedding={props.threeDModalState().queryEmbedding}
          onClose={props.on3DModalClose}
        />
      </Show>
    </div>
  );
}
