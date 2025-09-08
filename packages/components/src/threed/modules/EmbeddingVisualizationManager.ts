/**
 * Embedding Visualization Manager Module
 * Orchestrates the initialization and management of embedding visualizations
 */

import { EmbeddingRenderer, ThreeJSSceneManager, ThemeColorManager } from './index';

export interface EmbeddingVisualizationConfig {
  width: number;
  height: number;
  theme: string;
  embeddingCount: number;
  container: HTMLElement;
}

export class EmbeddingVisualizationManager {
  private sceneManager: ThreeJSSceneManager | null = null;
  private embeddingRenderer: EmbeddingRenderer | null = null;
  private themeManager: ThemeColorManager | null = null;
  private config: EmbeddingVisualizationConfig;

  constructor(config: EmbeddingVisualizationConfig) {
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
    
    // Initialize embedding renderer
    this.embeddingRenderer = new EmbeddingRenderer({
      theme: this.config.theme,
      embeddingCount: this.config.embeddingCount,
      scene,
      THREE
    });

    this.embeddingRenderer.createEmbeddingVisualization({
      theme: this.config.theme,
      embeddingCount: this.config.embeddingCount,
      scene,
      THREE
    });

    // Start animation
    this.sceneManager.startAnimation(() => {
      if (this.embeddingRenderer) {
        this.embeddingRenderer.animate();
      }
    });

    return true;
  }

  updateTheme(newTheme: string) {
    if (!this.sceneManager || !this.embeddingRenderer || !this.themeManager) return;

    import('three').then(THREE => {
      this.themeManager!.updateTheme(newTheme);
      this.embeddingRenderer!.updateTheme(newTheme, THREE);
      this.sceneManager!.updateBackgroundColor(THREE as any, this.themeManager!.getBackgroundColor());
    });
  }

  dispose() {
    if (this.sceneManager) {
      this.sceneManager.dispose();
    }
    if (this.embeddingRenderer) {
      this.embeddingRenderer.dispose();
    }
  }
}
