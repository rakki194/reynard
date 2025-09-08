/**
 * Cluster Visualization Manager Module
 * Orchestrates the initialization and management of cluster visualizations
 */

import { ClusterRenderer, ThreeJSSceneManager, ThemeColorManager } from './index';

export interface ClusterVisualizationConfig {
  width: number;
  height: number;
  theme: string;
  clusterCount: number;
  container: HTMLElement;
}

export class ClusterVisualizationManager {
  private sceneManager: ThreeJSSceneManager | null = null;
  private clusterRenderer: ClusterRenderer | null = null;
  private themeManager: ThemeColorManager | null = null;
  private config: ClusterVisualizationConfig;

  constructor(config: ClusterVisualizationConfig) {
    this.config = config;
  }

  async initialize() {
    const THREE = await import('three');
    
    // Initialize theme manager
    this.themeManager = new ThemeColorManager({ theme: this.config.theme });
    
    // Initialize scene manager
    this.sceneManager = new ThreeJSSceneManager({
      width: this.config.width,
      height: this.config.height,
      backgroundColor: this.themeManager.getBackgroundColor(),
      container: this.config.container
    });

    const { scene } = await this.sceneManager.initialize(THREE as any);
    
    // Initialize cluster renderer
    this.clusterRenderer = new ClusterRenderer({
      theme: this.config.theme,
      clusterCount: this.config.clusterCount,
      pointCount: 50,
      scene,
      THREE
    });

    this.clusterRenderer.createClusters({
      theme: this.config.theme,
      clusterCount: this.config.clusterCount,
      pointCount: 50,
      scene,
      THREE
    });

    // Start animation
    this.sceneManager.startAnimation(() => {
      if (this.clusterRenderer) {
        this.clusterRenderer.animate();
      }
    });

    return true;
  }

  updateTheme(newTheme: string) {
    if (!this.sceneManager || !this.clusterRenderer || !this.themeManager) return;

    import('three').then(THREE => {
      this.themeManager!.updateTheme(newTheme);
      
      this.clusterRenderer!.createClusters({
        theme: newTheme,
        clusterCount: this.config.clusterCount,
        pointCount: 50,
        scene: this.sceneManager!.scene,
        THREE
      });

      this.sceneManager!.updateBackgroundColor(THREE as any, this.themeManager!.getBackgroundColor());
    });
  }

  dispose() {
    if (this.sceneManager) {
      this.sceneManager.dispose();
    }
    if (this.clusterRenderer) {
      this.clusterRenderer.dispose();
    }
  }
}
