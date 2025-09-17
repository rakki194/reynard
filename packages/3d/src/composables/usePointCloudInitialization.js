import { createSignal } from "solid-js";
import { usePointCloudRenderer } from "./usePointCloudRenderer";
import { usePointCloudEvents } from "./usePointCloudEvents";
export function usePointCloudInitialization() {
    const [isInitialized, setIsInitialized] = createSignal(false);
    const [thumbnailSprites, setThumbnailSprites] = createSignal([]);
    const [textSprites, setTextSprites] = createSignal([]);
    let threeJS = null;
    let pointCloudRenderer = null;
    let pointCloudEvents = null;
    const initializeRenderer = async (scene, camera, renderer, points, config, onPointSelect) => {
        // Initialize Three.js
        if (!threeJS) {
            const THREE = (await import("three")).default;
            threeJS = THREE;
            // Initialize composables
            pointCloudRenderer = usePointCloudRenderer(threeJS);
            pointCloudEvents = usePointCloudEvents();
            pointCloudEvents.initializeRaycaster(THREE);
        }
        // Clear existing objects
        clearScene(scene);
        // Create point cloud
        await createPointCloud(scene, camera, renderer, points, config, onPointSelect);
        // Create thumbnails if enabled
        if (config.enableThumbnails) {
            await createThumbnailSprites(scene, points, config);
        }
        // Create text sprites if enabled
        if (config.enableTextSprites) {
            await createTextSprites(scene, points, config);
        }
        setIsInitialized(true);
    };
    const clearScene = (scene) => {
        // Remove existing point cloud
        if (pointCloudRenderer) {
            pointCloudRenderer.clearPointCloud(scene);
        }
        // Remove thumbnail sprites
        if (pointCloudRenderer) {
            pointCloudRenderer
                .spriteManager()
                .disposeSprites(thumbnailSprites(), scene);
        }
        setThumbnailSprites([]);
        // Remove text sprites
        if (pointCloudRenderer) {
            pointCloudRenderer.spriteManager().disposeSprites(textSprites(), scene);
        }
        setTextSprites([]);
    };
    const createPointCloud = async (scene, camera, renderer, points, config, onPointSelect) => {
        if (!pointCloudRenderer || !points || points.length === 0)
            return;
        const handlePointClick = (event) => {
            if (pointCloudEvents && pointCloudRenderer) {
                pointCloudEvents.handlePointClick(event, pointCloudRenderer.pointCloud(), points, camera, renderer, onPointSelect);
            }
        };
        await pointCloudRenderer.createPointCloud(points, config, scene, handlePointClick);
    };
    const createThumbnailSprites = async (scene, points, config) => {
        if (!pointCloudRenderer || !pointCloudEvents || !points)
            return;
        const sprites = await pointCloudRenderer
            .spriteManager()
            .createThumbnailSprites(points, config, scene, (pointId) => pointCloudEvents.handlePointHover(pointId, config), () => pointCloudEvents.handlePointLeave(config));
        setThumbnailSprites(sprites);
    };
    const createTextSprites = async (scene, points, config) => {
        if (!pointCloudRenderer || !points)
            return;
        const sprites = await pointCloudRenderer
            .spriteManager()
            .createTextSprites(points, config, scene);
        setTextSprites(sprites);
    };
    const dispose = () => {
        if (pointCloudRenderer) {
            pointCloudRenderer.dispose();
        }
    };
    return {
        isInitialized,
        thumbnailSprites,
        textSprites,
        pointCloudRenderer: () => pointCloudRenderer,
        pointCloudEvents: () => pointCloudEvents,
        initializeRenderer,
        clearScene,
        dispose,
    };
}
