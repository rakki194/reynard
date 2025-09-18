import { createSignal } from "solid-js";
import type { Scene, Camera, Object3D, Vector3 } from "three";
import type { MazeCell, PlayerPosition, GamePlayer, GameControls } from "../types/maze";

/**
 * Composable for handling player movement and collision detection in the maze
 * Manages position updates, wall collision, and exit detection
 */
export function usePlayerMovement(mazeSize: number) {
  const [playerPosition, setPlayerPosition] = createSignal<PlayerPosition>({ x: 0, z: 0 });
  const [exitFound, setExitFound] = createSignal(false);

  const canMoveTo = (x: number, z: number, maze: MazeCell[][]): boolean => {
    if (x < 0 || x >= mazeSize || z < 0 || z >= mazeSize) return false;

    const currentCell =
      maze[Math.floor(playerPosition().x + mazeSize / 2)][Math.floor(playerPosition().z + mazeSize / 2)];
    const targetCell = maze[x][z];

    // Check if there's a wall between current and target position
    const dx = x - (playerPosition().x + mazeSize / 2);
    const dz = z - (playerPosition().z + mazeSize / 2);

    if (Math.abs(dx) + Math.abs(dz) !== 1) return false; // Only allow adjacent moves

    if (dx === 1 && currentCell.walls.east) return false;
    if (dx === -1 && currentCell.walls.west) return false;
    if (dz === 1 && currentCell.walls.south) return false;
    if (dz === -1 && currentCell.walls.north) return false;

    return true;
  };

  const updatePlayerPosition = (
    newX: number,
    newZ: number,
    maze: MazeCell[][],
    player: GamePlayer,
    camera: Camera,
    controls: GameControls,
    onExitFound: (score: number) => void,
    currentScore: number
  ) => {
    const targetGridX = Math.floor(newX + mazeSize / 2);
    const targetGridZ = Math.floor(newZ + mazeSize / 2);

    if (canMoveTo(targetGridX, targetGridZ, maze)) {
      setPlayerPosition({ x: newX, z: newZ });
      player.position.set(newX, 0.9, newZ);
      camera.position.set(newX, 1.6, newZ);
      controls.target.set(newX, 1.6, newZ - 1);

      // Check if reached exit
      if (targetGridX === mazeSize - 1 && targetGridZ === mazeSize - 1 && !exitFound()) {
        setExitFound(true);
        const newScore = currentScore + 1000;
        onExitFound(newScore);
        alert(`🎉 Congratulations! You found the exit! Score: ${newScore}`);
      }
    }
  };

  const resetPlayer = () => {
    setPlayerPosition({ x: 0, z: 0 });
    setExitFound(false);
  };

  return {
    playerPosition,
    exitFound,
    updatePlayerPosition,
    resetPlayer,
  };
}
