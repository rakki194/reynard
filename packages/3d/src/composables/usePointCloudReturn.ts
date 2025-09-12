// Point cloud return object composable
// Extracted from usePointCloud for modularity

export function createPointCloudReturn(
  threeJSInit: any,
  interactions: any,
  eventsModule: any,
  searchIntegrationModule: any,
  settingsModule: any,
  stateModule: any,
  processedPoints: any,
  createPointSelectionHandler: any,
  createPointHoverHandler: any,
) {
  return {
    // Three.js state
    isLoading: threeJSInit.isLoading,
    error: threeJSInit.error,
    threeJS: threeJSInit.threeJS,
    textureLoader: threeJSInit.textureLoader,
    raycaster: eventsModule.raycaster,
    mouse: eventsModule.mouse,

    // Point cloud state
    pointCloud: stateModule.pointCloud,
    visiblePoints: stateModule.visiblePoints,
    renderStats: stateModule.renderStats,

    // Interaction state
    hoveredPoint: interactions.hoveredPoint,
    selectedPoints: interactions.selectedPoints,
    isDragging: interactions.isDragging,
    dragStart: interactions.dragStart,
    tooltipPosition: interactions.tooltipPosition,
    selectionGroups: interactions.selectionGroups,

    // Search integration state
    searchIntegrationData: searchIntegrationModule.searchIntegrationData,
    queryPointMesh: searchIntegrationModule.queryPointMesh,
    pathMeshes: searchIntegrationModule.pathMeshes,
    radiusMesh: searchIntegrationModule.radiusMesh,

    // Settings
    maxPoints: settingsModule.maxPoints,
    pointSize: settingsModule.pointSize,
    enableInstancing: settingsModule.enableInstancing,
    enableLOD: settingsModule.enableLOD,
    enableCulling: settingsModule.enableCulling,
    lodDistance: settingsModule.lodDistance,
    lodLevels: settingsModule.lodLevels,
    lodLevel: () => 0, // Legacy property for compatibility
    frustumCulled: () => 0, // Legacy property for compatibility
    occlusionCulled: () => 0, // Legacy property for compatibility
    enableHighlighting: settingsModule.enableHighlighting,
    highlightColor: settingsModule.highlightColor,
    highlightSize: settingsModule.highlightSize,

    // Search integration settings
    enableSearchIntegration: searchIntegrationModule.enableSearchIntegration,
    searchQueryEmbedding: searchIntegrationModule.searchQueryEmbedding,
    searchResults: searchIntegrationModule.searchResults,
    reductionMethod: searchIntegrationModule.reductionMethod,
    transformedData: searchIntegrationModule.transformedData,
    originalIndices: searchIntegrationModule.originalIndices,
    highlightQueryPoint: searchIntegrationModule.highlightQueryPoint,
    showSimilarityPaths: searchIntegrationModule.showSimilarityPaths,
    showSimilarityRadius: searchIntegrationModule.showSimilarityRadius,
    radiusThreshold: searchIntegrationModule.radiusThreshold,
    maxPathLength: searchIntegrationModule.maxPathLength,
    queryPointColor: searchIntegrationModule.queryPointColor,
    pathColor: searchIntegrationModule.pathColor,
    radiusColor: searchIntegrationModule.radiusColor,

    // Processed data
    processedPoints,

    // Methods
    initializeThreeJS: threeJSInit.initializeThreeJS,
    initializeRaycaster: eventsModule.initializeRaycaster,
    createPointSelectionHandler,
    createPointHoverHandler,
    setSelectedPoints: interactions.setSelectedPoints,
    setHoveredPoint: interactions.setHoveredPoint,
    setTooltipPosition: interactions.setTooltipPosition,
    setSearchIntegrationData: searchIntegrationModule.setSearchIntegrationData,
    setQueryPointMesh: searchIntegrationModule.setQueryPointMesh,
    setPathMeshes: searchIntegrationModule.setPathMeshes,
    setRadiusMesh: searchIntegrationModule.setRadiusMesh,
    setPointCloud: stateModule.setPointCloud,
    setVisiblePoints: stateModule.setVisiblePoints,
    setRenderStats: stateModule.setRenderStats,
  };
}
