import { createSignal, createEffect, onCleanup } from "solid-js";

export interface SceneManagementConfig {
  scene: any;
  camera: any;
  renderer: any;
  points: any[];
  config: any;
  onPointSelect?: (pointId: string) => void;
}

export function useSceneManagement(config: SceneManagementConfig) {
  const [isInitialized, setIsInitialized] = createSignal(false);
  const [pointCloudRenderer, setPointCloudRenderer] = createSignal<any>(null);
  const [pointCloudEvents, setPointCloudEvents] = createSignal<any>(null);
  const [thumbnailSprites, setThumbnailSprites] = createSignal<any[]>([]);
  const [textSprites, setTextSprites] = createSignal<any[]>([]);

  const clearScene = () => {
    // Remove existing point cloud
    if (pointCloudRenderer()) {
      pointCloudRenderer().clearPointCloud(config.scene);
    }

    // Remove thumbnail sprites
    if (pointCloudRenderer()) {
      pointCloudRenderer().spriteManager().disposeSprites(thumbnailSprites(), config.scene);
    }
    setThumbnailSprites([]);

    // Remove text sprites
    if (pointCloudRenderer()) {
      pointCloudRenderer().spriteManager().disposeSprites(textSprites(), config.scene);
    }
    setTextSprites([]);
  };

  const initializeScene = async () => {
    if (!config.scene || !config.camera || !config.renderer) return;

    try {
      // Import and initialize point cloud renderer
      const { usePointCloudInitialization } = await import("./usePointCloudInitialization");
      const initialization = usePointCloudInitialization();

      const renderer = await initialization.initializeRenderer(
        config.scene,
        config.camera,
        config.renderer,
        config.points,
        config.config,
        config.onPointSelect
      );

      setPointCloudRenderer(renderer);
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize scene:", error);
    }
  };

  createEffect(() => {
    initializeScene();
  });

  onCleanup(() => {
    clearScene();
    if (pointCloudRenderer()) {
      pointCloudRenderer().dispose();
    }
  });

  return {
    isInitialized,
    pointCloudRenderer,
    pointCloudEvents,
    thumbnailSprites,
    textSprites,
    setThumbnailSprites,
    setTextSprites,
    clearScene,
  };
}
