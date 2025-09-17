import { createSignal, createEffect, onCleanup } from "solid-js";
export function useSceneManagement(config) {
    const [isInitialized, setIsInitialized] = createSignal(false);
    const [pointCloudRenderer, setPointCloudRenderer] = createSignal(null);
    const [pointCloudEvents, setPointCloudEvents] = createSignal(null);
    const [thumbnailSprites, setThumbnailSprites] = createSignal([]);
    const [textSprites, setTextSprites] = createSignal([]);
    const clearScene = () => {
        // Remove existing point cloud
        if (pointCloudRenderer()) {
            pointCloudRenderer().clearPointCloud(config.scene);
        }
        // Remove thumbnail sprites
        if (pointCloudRenderer()) {
            pointCloudRenderer()
                .spriteManager()
                .disposeSprites(thumbnailSprites(), config.scene);
        }
        setThumbnailSprites([]);
        // Remove text sprites
        if (pointCloudRenderer()) {
            pointCloudRenderer()
                .spriteManager()
                .disposeSprites(textSprites(), config.scene);
        }
        setTextSprites([]);
    };
    const initializeScene = async () => {
        if (!config.scene || !config.camera || !config.renderer)
            return;
        try {
            // Import and initialize point cloud renderer
            const { usePointCloudInitialization } = await import("./usePointCloudInitialization");
            const initialization = usePointCloudInitialization();
            const renderer = await initialization.initializeRenderer(config.scene, config.camera, config.renderer, config.points, config.config, config.onPointSelect);
            setPointCloudRenderer(renderer);
            setIsInitialized(true);
        }
        catch (error) {
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
