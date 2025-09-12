import { createSignal } from "solid-js";
import type { RaycasterLike, Vector2Like } from "../types/rendering";

/**
 * Manages raycaster and mouse position for 3D interactions
 * Follows the 50-line axiom for focused responsibility
 */
export function createRaycasterManager() {
  const [raycaster, setRaycaster] = createSignal<RaycasterLike | null>(null);
  const [mouse, setMouse] = createSignal<Vector2Like | null>(null);

  const initialize = (threeJS: unknown): void => {
    const three = threeJS as { Raycaster: new () => RaycasterLike; Vector2: new () => Vector2Like };
    setRaycaster(new three.Raycaster());
    setMouse(new three.Vector2());
  };

  const updateMousePosition = (event: MouseEvent, renderer: unknown): void => {
    const currentMouse = mouse();
    if (!currentMouse) return;

    const rendererObj = renderer as { domElement?: { getBoundingClientRect: () => DOMRect } };
    const rect = rendererObj.domElement?.getBoundingClientRect();
    if (!rect) return;

    currentMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    currentMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const performRaycast = (camera: unknown, pointCloud: unknown) => {
    const currentRaycaster = raycaster();
    const currentMouse = mouse();
    
    if (!currentRaycaster || !currentMouse) return [];

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
