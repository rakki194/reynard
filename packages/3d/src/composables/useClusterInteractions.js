// Cluster interactions composable for SolidJS
// Orchestrates modular cluster interaction functionality
import { createSignal, createEffect, onCleanup } from "solid-js";
import { setupClusterRaycaster } from "./useClusterRaycasterUtils";
export function useClusterInteractions(config) {
    const [hoveredCluster, setHoveredCluster] = createSignal(null);
    // Setup raycaster and event listeners
    createEffect(async () => {
        if (!config.renderer || !config.camera)
            return;
        const cleanup = await setupClusterRaycaster(config.renderer, config.camera, config.hullMeshes, setHoveredCluster, config.onClusterSelect);
        onCleanup(cleanup);
    });
    return {
        hoveredCluster,
        setHoveredCluster,
    };
}
