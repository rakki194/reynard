/**
 * RAG 3D Visualization Modal Component
 *
 * Advanced 3D embedding visualization with dimensionality reduction
 * and interactive point cloud exploration.
 */
import { Component } from "solid-js";
import type { RAGQueryHit } from "../types";
export interface RAG3DVisualizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    searchQuery: string;
    searchResults: RAGQueryHit[];
    queryEmbedding?: number[];
}
export declare const RAG3DVisualizationModal: Component<RAG3DVisualizationModalProps>;
