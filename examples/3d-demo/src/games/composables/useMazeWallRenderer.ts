import type { Scene, Object3D } from "three";
import type { MazeCell } from "../types/maze";
import type { ThreeJS, ThreeMesh } from "../types/three";

/**
 * Composable for rendering individual maze walls
 * Handles wall creation and positioning logic
 */
export function useMazeWallRenderer() {
  const createWall = (
    THREE: ThreeJS,
    wallGeometry: any,
    wallMaterial: any,
    x: number,
    y: number,
    z: number,
    rotationY = 0
  ): ThreeMesh => {
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, y, z);
    wall.rotation.y = rotationY;
    wall.castShadow = true;
    return wall;
  };

  const renderCellWalls = (
    THREE: ThreeJS,
    scene: Scene,
    cell: MazeCell,
    x: number,
    z: number,
    wallGeometry: any,
    wallMaterial: any,
    meshes: Object3D[]
  ) => {
    if (cell.walls.north) {
      const wall = createWall(THREE, wallGeometry, wallMaterial, x, 0, z - 0.5);
      scene.add(wall);
      meshes.push(wall);
    }
    if (cell.walls.south) {
      const wall = createWall(THREE, wallGeometry, wallMaterial, x, 0, z + 0.5);
      scene.add(wall);
      meshes.push(wall);
    }
    if (cell.walls.east) {
      const wall = createWall(THREE, wallGeometry, wallMaterial, x + 0.5, 0, z, Math.PI / 2);
      scene.add(wall);
      meshes.push(wall);
    }
    if (cell.walls.west) {
      const wall = createWall(THREE, wallGeometry, wallMaterial, x - 0.5, 0, z, Math.PI / 2);
      scene.add(wall);
      meshes.push(wall);
    }
  };

  return {
    createWall,
    renderCellWalls,
  };
}
