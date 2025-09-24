import { createSignal } from "solid-js";
import type { Scene, Object3D } from "three";
import type { MazeCell } from "../types/maze";
import type { ThreeJS } from "../types/three";
import { useMazeWallRenderer } from "./useMazeWallRenderer";
import { useMazeMaterials } from "./useMazeMaterials";
import { useMazeCellRenderer } from "./useMazeCellRenderer";

/**
 * Composable for rendering 3D maze meshes in Three.js
 * Handles wall, floor, and exit rendering with proper materials and lighting
 */
export function useMazeRendering() {
  const [mazeMeshes, setMazeMeshes] = createSignal<Object3D[]>([]);
  const { renderCellWalls } = useMazeWallRenderer();
  const { createMazeMaterials } = useMazeMaterials();
  const { renderMazeCell } = useMazeCellRenderer();

  const renderMaze = (THREE: ThreeJS, scene: Scene, maze: MazeCell[][], mazeSize: number) => {
    // Clear existing maze
    const currentMeshes = mazeMeshes();
    currentMeshes.forEach(mesh => scene.remove(mesh));
    setMazeMeshes([]);

    const materials = createMazeMaterials(THREE);
    const newMeshes: Object3D[] = [];

    // Render floor and walls
    maze.forEach(row => {
      row.forEach(cell => {
        renderMazeCell(THREE, scene, cell, mazeSize, materials, renderCellWalls, newMeshes);
      });
    });

    setMazeMeshes(newMeshes);
  };

  return {
    mazeMeshes,
    renderMaze,
  };
}
