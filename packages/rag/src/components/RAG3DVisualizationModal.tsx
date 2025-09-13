/**
 * RAG 3D Visualization Modal Component
 *
 * Advanced 3D embedding visualization with dimensionality reduction
 * and interactive point cloud exploration.
 */

import {
  Component,
  createSignal,
  createEffect,
  Show,
  createMemo,
} from "solid-js";
import { Modal, Button, Select, Slider, Toggle } from "reynard-components";;
import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";
import type { ThreeDModalState, RAGQueryHit, EmbeddingPoint } from "../types";

// Helper function to get icon as JSX element
const getIcon = (name: string) => {
  const icon = getIconFromRegistry(name);
  if (icon) {
    return <div innerHTML={icon as unknown as string} />;
  }
  return null;
};

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
  // State for 3D visualization
  const [reductionMethod, setReductionMethod] = createSignal<
    "tsne" | "umap" | "pca"
  >("tsne");
  const [transformedData, setTransformedData] = createSignal<number[][]>([]);
  const [originalIndices, setOriginalIndices] = createSignal<number[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Parameter controls state
  const [showParameterControls, setShowParameterControls] = createSignal(false);
  const [tsneParams, setTsneParams] = createSignal({
    perplexity: 30,
    learning_rate: 200,
    early_exaggeration: 12,
    max_iter: 1000,
    metric: "euclidean",
    method: "barnes_hut",
  });
  const [umapParams, setUmapParams] = createSignal({
    n_neighbors: 15,
    min_dist: 0.1,
    learning_rate: 1.0,
    spread: 1.0,
    metric: "euclidean",
    local_connectivity: 1,
  });
  const [pcaParams, setPcaParams] = createSignal({
    n_components: 3,
    variance_threshold: 0.95,
    whiten: false,
    svd_solver: "auto",
  });

  // Visualization settings
  const [pointSize, setPointSize] = createSignal(2);
  const [enableHighlighting, setEnableHighlighting] = createSignal(true);
  const [showSimilarityPaths, setShowSimilarityPaths] = createSignal(true);
  const [showSimilarityRadius, setShowSimilarityRadius] = createSignal(true);
  const [radiusThreshold, setRadiusThreshold] = createSignal(0.8);

  // Create embedding points for visualization
  const embeddingPoints = createMemo((): EmbeddingPoint[] => {
    if (transformedData().length === 0 || props.searchResults.length === 0) {
      return [];
    }

    return transformedData().map((point, index) => {
      const originalIndex = originalIndices()[index];
      const result = props.searchResults[originalIndex];

      // Color based on similarity score
      const score = result?.score || 0;
      const colorIntensity = Math.max(0.1, score);

      return {
        id: `point-${index}`,
        position: [point[0], point[1], point[2]] as [number, number, number],
        color: [colorIntensity, 1 - colorIntensity, 0.5] as [
          number,
          number,
          number,
        ],
        size: pointSize(),
        metadata: {
          score,
          originalIndex,
          result,
        },
        originalIndex,
      };
    });
  });

  // Load embedding data and perform dimensionality reduction
  const loadEmbeddingData = async () => {
    if (props.searchResults.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Extract embeddings from search results
      const embeddings = props.searchResults
        .map((result) => result.embedding_vector)
        .filter((embedding): embedding is number[] => embedding !== undefined);

      if (embeddings.length === 0) {
        throw new Error("No embedding vectors found in search results");
      }

      // Add query embedding if available
      if (props.queryEmbedding) {
        embeddings.unshift(props.queryEmbedding);
      }

      // Perform dimensionality reduction
      const method = reductionMethod();
      const reducedData = await performDimensionalityReduction(
        embeddings,
        method,
      );

      setTransformedData(reducedData);
      setOriginalIndices(
        Array.from({ length: reducedData.length }, (_, i) => i),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load embedding data",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Mock dimensionality reduction function (replace with actual implementation)
  const performDimensionalityReduction = async (
    embeddings: number[][],
    method: "tsne" | "umap" | "pca",
  ): Promise<number[][]> => {
    // This is a mock implementation - replace with actual dimensionality reduction
    return embeddings.map((_, index) => [
      Math.random() * 10 - 5,
      Math.random() * 10 - 5,
      Math.random() * 10 - 5,
    ]);
  };

  // Load data when modal opens
  createEffect(() => {
    if (props.isOpen && props.searchResults.length > 0) {
      loadEmbeddingData();
    }
  });

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="3D Embedding Visualization"
      size="large"
      className="rag-3d-modal"
    >
      <div class="rag-3d-visualization-container">
        {/* Controls Panel */}
        <div class="rag-3d-controls">
          <div class="control-group">
            <label>Reduction Method</label>
            <Select
              value={reductionMethod()}
              onChange={(value) =>
                setReductionMethod(value as "tsne" | "umap" | "pca")
              }
              options={[
                { value: "tsne", label: "t-SNE" },
                { value: "umap", label: "UMAP" },
                { value: "pca", label: "PCA" },
              ]}
            />
          </div>

          <div class="control-group">
            <label>Point Size</label>
            <Slider
              value={pointSize()}
              onChange={setPointSize}
              min={1}
              max={10}
              step={0.5}
            />
          </div>

          <div class="control-group">
            <label>
              <Toggle
    size="sm"
  /> setEnableHighlighting(e.target.checked)}
              />
              Enable Highlighting
            </label>
          </div>

          <div class="control-group">
            <label>
              <Toggle
    size="sm"
  /> setShowSimilarityPaths(e.target.checked)}
              />
              Show Similarity Paths
            </label>
          </div>

          <div class="control-group">
            <label>
              <Toggle
    size="sm"
  /> setShowSimilarityRadius(e.target.checked)}
              />
              Show Similarity Radius
            </label>
          </div>

          <div class="control-group">
            <label>Radius Threshold</label>
            <Slider
              value={radiusThreshold()}
              onChange={setRadiusThreshold}
              min={0.1}
              max={1.0}
              step={0.1}
            />
          </div>

          <Button
            variant="secondary"
            onClick={() => setShowParameterControls(!showParameterControls())}
            icon={getIcon("settings")}
          >
            Advanced Parameters
          </Button>

          <Button
            variant="primary"
            onClick={loadEmbeddingData}
            disabled={isLoading()}
            icon={getIcon("refresh")}
          >
            {isLoading() ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {/* Parameter Controls */}
        <Show when={showParameterControls()}>
          <div class="rag-3d-parameters">
            <Show when={reductionMethod() === "tsne"}>
              <div class="parameter-group">
                <h4>t-SNE Parameters</h4>
                <div class="parameter-row">
                  <label>Perplexity</label>
                  <Slider
                    value={tsneParams().perplexity}
                    onChange={(value) =>
                      setTsneParams((prev) => ({ ...prev, perplexity: value }))
                    }
                    min={5}
                    max={50}
                    step={1}
                  />
                </div>
                <div class="parameter-row">
                  <label>Learning Rate</label>
                  <Slider
                    value={tsneParams().learning_rate}
                    onChange={(value) =>
                      setTsneParams((prev) => ({
                        ...prev,
                        learning_rate: value,
                      }))
                    }
                    min={10}
                    max={1000}
                    step={10}
                  />
                </div>
              </div>
            </Show>

            <Show when={reductionMethod() === "umap"}>
              <div class="parameter-group">
                <h4>UMAP Parameters</h4>
                <div class="parameter-row">
                  <label>N Neighbors</label>
                  <Slider
                    value={umapParams().n_neighbors}
                    onChange={(value) =>
                      setUmapParams((prev) => ({ ...prev, n_neighbors: value }))
                    }
                    min={2}
                    max={100}
                    step={1}
                  />
                </div>
                <div class="parameter-row">
                  <label>Min Distance</label>
                  <Slider
                    value={umapParams().min_dist}
                    onChange={(value) =>
                      setUmapParams((prev) => ({ ...prev, min_dist: value }))
                    }
                    min={0.01}
                    max={1.0}
                    step={0.01}
                  />
                </div>
              </div>
            </Show>

            <Show when={reductionMethod() === "pca"}>
              <div class="parameter-group">
                <h4>PCA Parameters</h4>
                <div class="parameter-row">
                  <label>Components</label>
                  <Slider
                    value={pcaParams().n_components}
                    onChange={(value) =>
                      setPcaParams((prev) => ({ ...prev, n_components: value }))
                    }
                    min={2}
                    max={10}
                    step={1}
                  />
                </div>
              </div>
            </Show>
          </div>
        </Show>

        {/* 3D Visualization */}
        <div class="rag-3d-visualization">
          <Show when={isLoading()}>
            <div class="rag-3d-loading">
              <div class="loading-spinner"></div>
              <span>Loading embedding visualization...</span>
            </div>
          </Show>

          <Show when={error()}>
            <div class="rag-3d-error">
              <span>Error: {error()}</span>
              <Button onClick={loadEmbeddingData}>Retry</Button>
            </div>
          </Show>

          <Show when={!isLoading() && !error() && embeddingPoints().length > 0}>
            <div class="rag-3d-point-cloud">
              {/* This would integrate with the existing reynard-3d package */}
              <div class="placeholder-3d-visualization">
                <p>3D Point Cloud Visualization</p>
                <p>Points: {embeddingPoints().length}</p>
                <p>Method: {reductionMethod().toUpperCase()}</p>
                <p>Query: "{props.searchQuery}"</p>
              </div>
            </div>
          </Show>
        </div>

        {/* Info Panel */}
        <div class="rag-3d-info">
          <div class="info-item">
            <strong>Search Query:</strong> {props.searchQuery}
          </div>
          <div class="info-item">
            <strong>Results:</strong> {props.searchResults.length} items
          </div>
          <div class="info-item">
            <strong>Method:</strong> {reductionMethod().toUpperCase()}
          </div>
          <div class="info-item">
            <strong>Points:</strong> {embeddingPoints().length}
          </div>
        </div>
      </div>
    </Modal>
  );
};
