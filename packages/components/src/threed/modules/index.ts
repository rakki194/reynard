/**
 * Three.js Modules Barrel Export
 * Centralized exports for all Three.js related modules
 */

export { createThreeJSSetup } from './ThreeJSSetup';
export type { ThreeJSSetupConfig, ThreeJSObjects } from './ThreeJSSetup';

export { createPointCloud } from './PointCloudGenerator';
export type { PointCloudConfig } from './PointCloudGenerator';

export { AnimationLoop } from './AnimationLoop';
export type { AnimationObjects } from './AnimationLoop';

export { initializeThreeJS } from './ThreeJSInitializer';
export type { InitializationConfig, InitializedThreeJS } from './ThreeJSInitializer';

export { ClusterVisualizationManager } from './ClusterVisualizationManager';
export type { ClusterVisualizationConfig } from './ClusterVisualizationManager';

export { ClusterRenderer } from './ClusterRenderer';
export type { ClusterRendererConfig } from './ClusterRenderer';

export { ThreeJSSceneManager } from './ThreeJSSceneManager';
export type { SceneManagerConfig } from './ThreeJSSceneManager';

export { ThemeColorManager } from './ThemeColorManager';
export type { ThemeColorConfig } from './ThemeColorManager';

export { EmbeddingRenderer } from './EmbeddingRenderer';
export type { EmbeddingRendererConfig } from './EmbeddingRenderer';

export { EmbeddingVisualizationManager } from './EmbeddingVisualizationManager';
export type { EmbeddingVisualizationConfig } from './EmbeddingVisualizationManager';