/**
 * 3D Visualization Parameters Composable
 * 
 * Manages all parameter state for 3D embedding visualization
 * including reduction methods, algorithm parameters, and display settings.
 */

import { createSignal } from "solid-js";

export interface TsneParams {
  perplexity: number;
  learning_rate: number;
  early_exaggeration: number;
  max_iter: number;
  metric: string;
  method: string;
}

export interface UmapParams {
  n_neighbors: number;
  min_dist: number;
  learning_rate: number;
  spread: number;
  metric: string;
  local_connectivity: number;
}

export interface PcaParams {
  n_components: number;
  variance_threshold: number;
  whiten: boolean;
  svd_solver: string;
}

export interface VisualizationSettings {
  pointSize: number;
  enableHighlighting: boolean;
  showSimilarityPaths: boolean;
  showSimilarityRadius: boolean;
  radiusThreshold: number;
}

export function use3DVisualizationParams() {
  // Reduction method state
  const [reductionMethod, setReductionMethod] = createSignal<
    "tsne" | "umap" | "pca"
  >("tsne");

  // Algorithm parameters
  const [tsneParams, setTsneParams] = createSignal<TsneParams>({
    perplexity: 30,
    learning_rate: 200,
    early_exaggeration: 12,
    max_iter: 1000,
    metric: "euclidean",
    method: "barnes_hut",
  });

  const [umapParams, setUmapParams] = createSignal<UmapParams>({
    n_neighbors: 15,
    min_dist: 0.1,
    learning_rate: 1.0,
    spread: 1.0,
    metric: "euclidean",
    local_connectivity: 1,
  });

  const [pcaParams, setPcaParams] = createSignal<PcaParams>({
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

  // Control panel visibility
  const [showParameterControls, setShowParameterControls] = createSignal(false);

  return {
    // Reduction method
    reductionMethod,
    setReductionMethod,
    
    // Algorithm parameters
    tsneParams,
    setTsneParams,
    umapParams,
    setUmapParams,
    pcaParams,
    setPcaParams,
    
    // Visualization settings
    pointSize,
    setPointSize,
    enableHighlighting,
    setEnableHighlighting,
    showSimilarityPaths,
    setShowSimilarityPaths,
    showSimilarityRadius,
    setShowSimilarityRadius,
    radiusThreshold,
    setRadiusThreshold,
    
    // Control visibility
    showParameterControls,
    setShowParameterControls,
  };
}
