/**
 * RAG Image Modal Component
 *
 * Modal for displaying image content with metadata and embedding information
 * for RAG search results.
 */
import { createSignal } from "solid-js";
import { Modal } from "reynard-components";
import { ImageDisplay } from "./ImageDisplay";
import { ImageModalHeader } from "./ImageModalHeader";
import { SimilarityScore } from "./SimilarityScore";
import { ImageMetadata } from "./ImageMetadata";
import { EmbeddingInfo } from "./EmbeddingInfo";
import { downloadImage, copyToClipboard } from "../utils/image-modal-utils";
const createImageModalHandlers = (props) => {
    const handleDownload = () => {
        downloadImage(props.imagePath, props.imageId);
    };
    const handleCopyPath = async () => {
        try {
            await copyToClipboard(props.imagePath);
            // Could add a toast notification here
        }
        catch (err) {
            console.error("Failed to copy image path:", err);
        }
    };
    const handleCopyEmbeddingVector = async () => {
        if (!props.embeddingVector)
            return;
        try {
            await copyToClipboard(JSON.stringify(props.embeddingVector));
            // Could add a toast notification here
        }
        catch (err) {
            console.error("Failed to copy embedding vector:", err);
        }
    };
    return {
        handleDownload,
        handleCopyPath,
        handleCopyEmbeddingVector,
    };
};
const createImageModalContent = (props, showMetadata, showEmbeddingInfo, setShowMetadata, setShowEmbeddingInfo, handlers) => (<div class="rag-image-modal-container">
    <ImageModalHeader imagePath={props.imagePath} imageId={props.imageId} imageDimensions={props.imageDimensions} imageSize={props.imageSize} imageFormat={props.imageFormat} showMetadata={showMetadata()} showEmbeddingInfo={showEmbeddingInfo()} onToggleMetadata={() => setShowMetadata(!showMetadata())} onToggleEmbeddingInfo={() => setShowEmbeddingInfo(!showEmbeddingInfo())} onCopyPath={handlers.handleCopyPath} onDownload={handlers.handleDownload}/>

    <div class="rag-image-content">
      <ImageDisplay imagePath={props.imagePath} previewPath={props.previewPath} imageId={props.imageId}/>

      <div class="rag-image-sidebar">
        <SimilarityScore score={props.score}/>
        
        <ImageMetadata metadata={props.imageMetadata} isVisible={showMetadata()} onToggle={() => setShowMetadata(!showMetadata())}/>

        <EmbeddingInfo embeddingVector={props.embeddingVector} isVisible={showEmbeddingInfo()} onToggle={() => setShowEmbeddingInfo(!showEmbeddingInfo())} onCopyVector={handlers.handleCopyEmbeddingVector}/>
      </div>
    </div>
  </div>);
export const RAGImageModal = (props) => {
    const [showEmbeddingInfo, setShowEmbeddingInfo] = createSignal(false);
    const [showMetadata, setShowMetadata] = createSignal(true);
    const handlers = createImageModalHandlers(props);
    return (<Modal open={props.isOpen} onClose={props.onClose} title={`Image: ${props.imageId}`} size="xl" class="rag-image-modal">
      {createImageModalContent(props, showMetadata, showEmbeddingInfo, setShowMetadata, setShowEmbeddingInfo, handlers)}
    </Modal>);
};
