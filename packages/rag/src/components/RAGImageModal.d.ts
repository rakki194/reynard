/**
 * RAG Image Modal Component
 *
 * Modal for displaying image content with metadata and embedding information
 * for RAG search results.
 */
import { Component } from "solid-js";
export interface RAGImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imagePath: string;
    imageId: string;
    thumbnailPath?: string;
    previewPath?: string;
    imageMetadata?: Record<string, unknown>;
    imageDimensions?: {
        width: number;
        height: number;
    };
    imageSize?: number;
    imageFormat?: string;
    embeddingVector?: number[];
    score: number;
}
export declare const RAGImageModal: Component<RAGImageModalProps>;
