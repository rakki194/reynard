import { createSignal } from "solid-js";
import type {
  RaycasterLike,
  Vector2Like,
  PointsLike,
  EmbeddingPoint,
} from "../types/rendering";

export function usePointCloudEvents() {
  const [raycaster, setRaycaster] = createSignal<RaycasterLike | null>(null);
  const [mouse, setMouse] = createSignal<Vector2Like | null>(null);

  const initializeRaycaster = (threeJS: any): void => {
    setRaycaster(new threeJS.Raycaster());
    setMouse(new threeJS.Vector2());
  };

  const handlePointClick = (
    event: MouseEvent,
    pointCloud: PointsLike | null,
    points: EmbeddingPoint[],
    camera: any,
    renderer: any,
    onPointSelect?: (pointId: string) => void,
  ): void => {
    const currentRaycaster = raycaster();
    const currentMouse = mouse();
    
    if (!currentRaycaster || !currentMouse || !camera || !pointCloud) return;

    // Update mouse position
    const rect = renderer.domElement?.getBoundingClientRect();
    if (!rect) return;
    currentMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    currentMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast
    currentRaycaster.setFromCamera(currentMouse, camera);
    const intersects = currentRaycaster.intersectObject(pointCloud);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const pointIndex = intersect.index;
      if (pointIndex !== undefined && points[pointIndex]) {
        const point = points[pointIndex];
        if (onPointSelect) {
          onPointSelect(point.id);
        }
      }
    }
  };

  const handlePointHover = (
    pointId: string,
    config: any,
  ): void => {
    // Highlight point on hover
    if (config.enableHighlighting) {
      // Implementation for highlighting
    }
  };

  const handlePointLeave = (config: any): void => {
    // Remove highlight
    if (config.enableHighlighting) {
      // Implementation for removing highlight
    }
  };

  return {
    raycaster,
    mouse,
    initializeRaycaster,
    handlePointClick,
    handlePointHover,
    handlePointLeave,
  };
}
