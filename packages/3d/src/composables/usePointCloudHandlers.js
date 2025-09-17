// Point cloud interaction handlers composable
// Manages point selection and hover event handling
export function usePointCloudHandlers(raycaster, mouse, handlePointSelection, handlePointHover) {
    // Interaction handlers with validation
    const createPointSelectionHandler = (camera, scene) => (event) => {
        const ray = raycaster();
        const mousePos = mouse();
        if (!ray || !mousePos) {
            console.warn("Raycaster or mouse not initialized. Call eventsModule.initializeRaycaster() first.");
            return;
        }
        handlePointSelection(event, camera, scene, ray, mousePos);
    };
    const createPointHoverHandler = (camera, scene) => (event) => {
        const ray = raycaster();
        const mousePos = mouse();
        if (!ray || !mousePos) {
            console.warn("Raycaster or mouse not initialized. Call eventsModule.initializeRaycaster() first.");
            return;
        }
        handlePointHover(event, camera, scene, ray, mousePos);
    };
    return {
        createPointSelectionHandler,
        createPointHoverHandler,
    };
}
