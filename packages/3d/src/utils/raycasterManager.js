import { createSignal } from "solid-js";
/**
 * Manages raycaster and mouse position for 3D interactions
 * Follows the 50-line axiom for focused responsibility
 */
export function createRaycasterManager() {
    const [raycaster, setRaycaster] = createSignal(null);
    const [mouse, setMouse] = createSignal(null);
    const initialize = (threeJS) => {
        const three = threeJS;
        setRaycaster(new three.Raycaster());
        setMouse(new three.Vector2());
    };
    const updateMousePosition = (event, renderer) => {
        const currentMouse = mouse();
        if (!currentMouse)
            return;
        const rendererObj = renderer;
        const rect = rendererObj.domElement?.getBoundingClientRect();
        if (!rect)
            return;
        currentMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        currentMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const performRaycast = (camera, pointCloud) => {
        const currentRaycaster = raycaster();
        const currentMouse = mouse();
        if (!currentRaycaster || !currentMouse)
            return [];
        currentRaycaster.setFromCamera(currentMouse, camera);
        return currentRaycaster.intersectObject(pointCloud);
    };
    return {
        raycaster,
        mouse,
        initialize,
        updateMousePosition,
        performRaycast,
    };
}
