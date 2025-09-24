import type { Scene, Object3D } from "three";
import type { MazeCell } from "../types/maze";
import type { ThreeJS, ThreeMesh } from "../types/three";

/**
 * Composable for rendering individual maze cells
 * Handles floor, exit, and wall rendering for each cell
 */
export function useMazeCellRenderer() {
  const renderMazeCell = (
    THREE: ThreeJS,
    scene: Scene,
    cell: MazeCell,
    mazeSize: number,
    materials: any,
    renderCellWalls: any,
    newMeshes: Object3D[]
  ) => {
    const x = cell.x - mazeSize / 2;
    const z = cell.z - mazeSize / 2;

    // Floor
    const floor: ThreeMesh = new THREE.Mesh(materials.floorGeometry, materials.floorMaterial);
    floor.position.set(x, -1, z);
    floor.receiveShadow = true;
    scene.add(floor);
    newMeshes.push(floor);

    // Exit at the end
    if (cell.x === mazeSize - 1 && cell.z === mazeSize - 1) {
      const exit: ThreeMesh = new THREE.Mesh(materials.exitGeometry, materials.exitMaterial);
      exit.position.set(x, -0.9, z);
      scene.add(exit);
      newMeshes.push(exit);
    }

    // Render walls
    renderCellWalls(THREE, scene, cell, x, z, materials.wallGeometry, materials.wallMaterial, newMeshes);
  };

  return {
    renderMazeCell,
  };
}
