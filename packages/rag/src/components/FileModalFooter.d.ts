/**
 * File Modal Footer Component
 *
 * Footer section with file metadata for the RAG file modal.
 */
import { Component } from "solid-js";
import type { RAGModality } from "../types";
export interface FileModalFooterProps {
    fileName: string;
    modality: RAGModality;
    chunkIndex?: number;
}
export declare const FileModalFooter: Component<FileModalFooterProps>;
