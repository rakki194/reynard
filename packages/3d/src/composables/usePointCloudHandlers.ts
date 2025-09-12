// Point cloud interaction handlers composable
// Manages point selection and hover event handling

import type { TouchEvent, MouseEvent } from "../types";

export function usePointCloudHandlers(
  raycaster: () => unknown,
  mouse: () => unknown,
  handlePointSelection: (
    event: MouseEvent | TouchEvent,
    camera: unknown,
    scene: unknown,
    raycaster: unknown,
    mouse: unknown,
  ) => void,
  handlePointHover: (
    event: MouseEvent | TouchEvent,
    camera: unknown,
    scene: unknown,
    raycaster: unknown,
    mouse: unknown,
  ) => void,
) {
  // Interaction handlers with validation
  const createPointSelectionHandler =
    (camera: unknown, scene: unknown) => (event: MouseEvent | TouchEvent) => {
      const ray = raycaster();
      const mousePos = mouse();

      if (!ray || !mousePos) {
        console.warn(
          "Raycaster or mouse not initialized. Call eventsModule.initializeRaycaster() first.",
        );
        return;
      }

      handlePointSelection(event, camera, scene, ray, mousePos);
    };

  const createPointHoverHandler =
    (camera: unknown, scene: unknown) => (event: MouseEvent | TouchEvent) => {
      const ray = raycaster();
      const mousePos = mouse();

      if (!ray || !mousePos) {
        console.warn(
          "Raycaster or mouse not initialized. Call eventsModule.initializeRaycaster() first.",
        );
        return;
      }

      handlePointHover(event, camera, scene, ray, mousePos);
    };

  return {
    createPointSelectionHandler,
    createPointHoverHandler,
  };
}
