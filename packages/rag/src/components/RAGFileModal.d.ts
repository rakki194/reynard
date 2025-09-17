/**
 * RAG File Modal Component
 *
 * Modal for displaying file content with syntax highlighting
 * and chunk navigation for RAG search results.
 */
import { Component } from "solid-js";
import type { RAGModality } from "../types";
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
export declare const RAGFileModal: Component<RAGFileModalProps>;
