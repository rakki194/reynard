// Visualization and cluster types
// Extracted from rendering.ts for modularity

import type { EmbeddingPoint, EmbeddingRenderingConfig, ClusterData, Vector3Like, ColorLike } from "./core";
import type { SceneLike, CameraLike, RendererLike } from "./threejs";

// Vector visualization props
export interface VectorVisualizationProps {
  vectors: number[][];
  labels?: string[];
  title?: string;
  width?: number;
  height?: number;
  colormap?: "viridis" | "plasma" | "inferno" | "magma" | "cividis";
  showLegend?: boolean;
  showValues?: boolean;
  className?: string;
  interactive?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableBrush?: boolean;
  enableTooltips?: boolean;
  onVectorSelect?: (index: number, vector: number[]) => void;
  onRegionSelect?: (indices: number[]) => void;
  pointOpacity?: number;
  animationSpeed?: number;
  transitionDuration?: number;
  enableAnimations?: boolean;
  animationEasing?:
    | "linear"
    | "easeInQuad"
    | "easeOutQuad"
    | "easeInOutQuad"
    | "easeInCubic"
    | "easeOutCubic"
    | "easeInOutCubic"
    | "easeInElastic"
    | "easeOutElastic"
    | "easeInOutElastic";
}

// Cluster visualization props
export interface ClusterVisualizationProps {
  clusters: ClusterData[];
  scene: SceneLike;
  camera: CameraLike;
  renderer: RendererLike;
  onClusterSelect?: (clusterId: string) => void;
  selectedClusterId?: string;
}

// Base point cloud renderer props
export interface BasePointCloudRendererProps {
  points: EmbeddingPoint[];
  config: EmbeddingRenderingConfig;
  scene: SceneLike;
  camera: CameraLike;
  renderer: RendererLike;
  onPointSelect?: (pointId: string) => void;
  selectedPointIds?: string[];
  onConfigChange?: (config: EmbeddingRenderingConfig) => void;
}
