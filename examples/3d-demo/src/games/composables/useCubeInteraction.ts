import type { CollectibleCube } from "./useCubeCollectorState";
import type { ThreeRaycaster, ThreeCamera, ThreeRenderer } from "../types/three";

export const useCubeInteraction = () => {
  const handleMouseClick = (
    event: MouseEvent,
    raycaster: ThreeRaycaster,
    camera: ThreeCamera,
    renderer: ThreeRenderer,
    cubes: CollectibleCube[],
    onCubeCollected: (cube: CollectibleCube) => void
  ) => {
    if (!raycaster || !camera || !renderer) return;

    const mouse = calculateMousePosition(event, renderer);
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(cubes.filter(cube => !cube.collected).map(cube => cube.mesh));

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      const cube = cubes.find(c => c.mesh === clickedMesh);

      if (cube && !cube.collected) {
        onCubeCollected(cube);
      }
    }
  };

  const calculateMousePosition = (event: MouseEvent, renderer: ThreeRenderer) => {
    const rect = renderer.domElement.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((event.clientY - rect.top) / rect.height) * 2 + 1,
    };
  };

  return {
    handleMouseClick,
    calculateMousePosition,
  };
};
