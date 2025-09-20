// Reynard 3D Package - Main Export
// 3D graphics and visualization components for Reynard framework using Three.js

// Export all types
export * from "./types";

// Export all utilities (excluding EasingType to avoid conflicts)
export { Easing, applyEasing, interpolate, interpolateVector3, interpolateColor } from "./utils/easing";
export * from "./utils/geometry";
export * from "./utils/performance";
export * from "./utils/clusterDetection";

// Export all composables
export * from "./composables";

// Export all components
export * from "./components";

// Export all demos
export * from "./demos";

// Main component exports for easy access
export { ThreeJSVisualization } from "./components/ThreeJSVisualization";
export { PointCloudVisualization } from "./components/PointCloudVisualization";
export { ThreeJSVisualizationDemo } from "./components/ThreeJSVisualizationDemo";
export { ClusterVisualization } from "./components/ClusterVisualization";
export { VectorVisualization } from "./components/VectorVisualization";
export { BasePointCloudRenderer } from "./components/BasePointCloudRenderer";

// Main composable exports for easy access
export { useThreeJSAnimations } from "./composables/useThreeJSAnimations";
export { useThreeJSVisualization } from "./composables/useThreeJSVisualization";
export { usePointCloud } from "./composables/usePointCloud";

// Export managers
export * from "./managers";

// Main utility exports for easy access (already exported above)
