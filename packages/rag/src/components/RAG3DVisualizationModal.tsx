/**
 * RAG 3D Visualization Modal Component
 *
 * Advanced 3D embedding visualization with dimensionality reduction
 * and interactive point cloud exploration.
 */

import { Component, createEffect } from "solid-js";
import { Modal } from "reynard-components";
import { use3DVisualizationParams, use3DVisualizationData } from "../composables";
import { ModalContent } from "./3DVisualization";
import type { RAGQueryHit } from "../types";

export interface RAG3DVisualizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  searchResults: RAGQueryHit[];
  queryEmbedding?: number[];
}

export const RAG3DVisualizationModal: Component<
  RAG3DVisualizationModalProps
> = (props) => {
  // Use parameter management composable
  const params = use3DVisualizationParams();
  
  // Use visualization data composable
  const visualizationData = use3DVisualizationData(
    () => props.searchResults,
    () => props.queryEmbedding,
    () => params.reductionMethod(),
    () => params.pointSize()
  );

  // Load data when modal opens
  createEffect(() => {
    if (props.isOpen && props.searchResults.length > 0) {
      visualizationData.loadEmbeddingData();
    }
  });

  return (
    <Modal
      open={props.isOpen}
      onClose={props.onClose}
      title="3D Embedding Visualization"
      size="xl"
      class="rag-3d-modal"
    >
      <ModalContent
        searchQuery={props.searchQuery}
        searchResults={props.searchResults}
        params={params}
        visualizationData={visualizationData}
      />
    </Modal>
  );
};
