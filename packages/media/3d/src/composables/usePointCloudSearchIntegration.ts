// Point cloud search integration composable
// Extracted from usePointCloud for modularity

import { createSignal, createMemo } from "solid-js";
import type { Point3D, SearchIntegrationSettings } from "../types";

export function usePointCloudSearchIntegration(searchIntegration: () => SearchIntegrationSettings = () => ({})) {
  // Search integration settings
  const enableSearchIntegration = createMemo(() => searchIntegration().enableSearchIntegration ?? false);
  const searchQueryEmbedding = createMemo(() => searchIntegration().searchQueryEmbedding);
  const searchResults = createMemo(() => searchIntegration().searchResults || []);
  const reductionMethod = createMemo(() => searchIntegration().reductionMethod || "tsne");
  const transformedData = createMemo(() => searchIntegration().transformedData || []);
  const originalIndices = createMemo(() => searchIntegration().originalIndices || []);
  const highlightQueryPoint = createMemo(() => searchIntegration().highlightQueryPoint ?? true);
  const showSimilarityPaths = createMemo(() => searchIntegration().showSimilarityPaths ?? true);
  const showSimilarityRadius = createMemo(() => searchIntegration().showSimilarityRadius ?? true);
  const radiusThreshold = createMemo(() => searchIntegration().radiusThreshold || 0.8);
  const maxPathLength = createMemo(() => searchIntegration().maxPathLength || 5);
  const queryPointColor = createMemo(() => searchIntegration().queryPointColor || [1, 0, 0]);
  const pathColor = createMemo(() => searchIntegration().pathColor || [0, 1, 1]);
  const radiusColor = createMemo(() => searchIntegration().radiusColor || [1, 0, 1]);

  // Search integration state
  const [searchIntegrationData, setSearchIntegrationData] = createSignal<unknown>(null);
  const [queryPointMesh, setQueryPointMesh] = createSignal<unknown>(null);
  const [pathMeshes, setPathMeshes] = createSignal<unknown[]>([]);
  const [radiusMesh, setRadiusMesh] = createSignal<unknown>(null);

  /**
   * Process points with search integration highlighting
   */
  const processPointsWithSearchIntegration = (points: Point3D[]): Point3D[] => {
    const searchData = searchIntegrationData();

    if (!searchData || !enableSearchIntegration()) {
      return points;
    }

    // Apply search integration highlighting
    return points.map(point => {
      const highlightedPoint = { ...point };

      // Check if point is in highlighted results
      const isHighlighted = (searchData as any).highlighted_results?.some(
        (result: { original_index: string | number }) => result.original_index === point.id
      );

      if (isHighlighted) {
        highlightedPoint.color = queryPointColor() as [number, number, number];
        highlightedPoint.size = (point.size || 2) * 2;
      }

      return highlightedPoint;
    });
  };

  return {
    // Settings
    enableSearchIntegration,
    searchQueryEmbedding,
    searchResults,
    reductionMethod,
    transformedData,
    originalIndices,
    highlightQueryPoint,
    showSimilarityPaths,
    showSimilarityRadius,
    radiusThreshold,
    maxPathLength,
    queryPointColor,
    pathColor,
    radiusColor,

    // State
    searchIntegrationData,
    queryPointMesh,
    pathMeshes,
    radiusMesh,

    // Methods
    setSearchIntegrationData,
    setQueryPointMesh,
    setPathMeshes,
    setRadiusMesh,
    processPointsWithSearchIntegration,
  };
}
