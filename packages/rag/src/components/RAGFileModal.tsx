/**
 * RAG File Modal Component
 *
 * Modal for displaying file content with syntax highlighting
 * and chunk navigation for RAG search results.
 */

import { Component } from "solid-js";
import { Modal } from "reynard-components";
import type { RAGModality } from "../types";
import { useFileModal } from "../composables/useFileModal";
import { FileModalHeader } from "./FileModalHeader";
import { ChunkNavigation } from "./ChunkNavigation";
import { FileContentDisplay } from "./FileContentDisplay";
import { FileModalFooter } from "./FileModalFooter";

export interface RAGFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string;
  fileName: string;
  fileContent: string;
  chunkIndex?: number;
  chunkText?: string;
  modality: RAGModality;
}

export const RAGFileModal: Component<RAGFileModalProps> = props => {
  const modalState = useFileModal(props);
  const { showLineNumbers, wrapLines, fontSize, contentChunks, selectedChunk } = modalState;

  return (
    <Modal
      open={props.isOpen}
      onClose={props.onClose}
      title={`File: ${props.fileName}`}
      size="lg"
      class="rag-file-modal"
    >
      <div class="rag-file-modal-container">
        <FileModalHeader
          filePath={props.filePath}
          fileContent={props.fileContent}
          showLineNumbers={showLineNumbers()}
          onToggleLineNumbers={() => modalState.setShowLineNumbers(!showLineNumbers())}
          wrapLines={wrapLines()}
          onToggleWrapLines={() => modalState.setWrapLines(!wrapLines())}
          fontSize={fontSize()}
          onFontSizeChange={modalState.setFontSize}
          onCopy={modalState.handleCopy}
          onDownload={modalState.handleDownload}
        />

        <ChunkNavigation
          chunks={contentChunks()}
          selectedChunk={selectedChunk()}
          onChunkChange={modalState.setSelectedChunk}
          chunkIndex={props.chunkIndex}
          chunkText={props.chunkText}
        />

        <FileContentDisplay
          fileContent={props.fileContent}
          fileName={props.fileName}
          showLineNumbers={showLineNumbers()}
          wrapLines={wrapLines()}
          fontSize={fontSize()}
        />

        <FileModalFooter fileName={props.fileName} modality={props.modality} chunkIndex={props.chunkIndex} />
      </div>
    </Modal>
  );
};
