import { createRaycasterManager } from "../utils/raycasterManager";
import { createPointInteractionHandler } from "../utils/pointInteractionHandler";
/**
 * Composable for managing point cloud event interactions
 * Orchestrates raycaster and interaction handlers
 */
export function usePointCloudEvents() {
    const raycasterManager = createRaycasterManager();
    const interactionHandler = createPointInteractionHandler();
    const handlePointClick = (event, pointCloud, points, camera, renderer, onPointSelect) => {
        if (!camera || !pointCloud)
            return;
        raycasterManager.updateMousePosition(event, renderer);
        const intersects = raycasterManager.performRaycast(camera, pointCloud);
        interactionHandler.handlePointClick(intersects, points, onPointSelect);
    };
    return {
        raycaster: raycasterManager.raycaster,
        mouse: raycasterManager.mouse,
        initializeRaycaster: raycasterManager.initialize,
        handlePointClick,
        handlePointHover: interactionHandler.handlePointHover,
        handlePointLeave: interactionHandler.handlePointLeave,
    };
}
