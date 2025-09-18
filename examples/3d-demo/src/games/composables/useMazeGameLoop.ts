import { onMount, onCleanup } from "solid-js";
import type { Camera, Object3D, Vector3 } from "three";
import type { MazeCell, PlayerPosition, GamePlayer, GameControls, MovementInput } from "../types/maze";

/**
 * Composable for managing the main game loop
 * Handles game updates, player movement, and exit detection
 */
export function useMazeGameLoop(
  gameStarted: () => boolean,
  maze: () => MazeCell[][],
  mazeSize: number,
  playerPosition: () => PlayerPosition,
  player: () => GamePlayer | undefined,
  camera: () => Camera | undefined,
  controls: () => GameControls | undefined,
  getMovementInput: () => MovementInput,
  updatePlayerPosition: (
    newX: number,
    newZ: number,
    maze: MazeCell[][],
    player: GamePlayer,
    camera: Camera,
    controls: GameControls,
    onExitFound: (score: number) => void,
    currentScore: number
  ) => void,
  onScoreUpdate: (score: number) => void,
  currentScore: () => number
) {
  let gameLoop: number;

  const gameUpdate = () => {
    const currentPlayer = player();
    const currentCamera = camera();
    const currentControls = controls();

    if (!gameStarted() || !currentPlayer || !currentCamera || !currentControls) return;

    const { deltaX, deltaZ } = getMovementInput();
    const currentPos = playerPosition();
    const newX = currentPos.x + deltaX;
    const newZ = currentPos.z + deltaZ;

    updatePlayerPosition(
      newX,
      newZ,
      maze(),
      currentPlayer,
      currentCamera,
      currentControls,
      onScoreUpdate,
      currentScore()
    );
  };

  onMount(() => {
    gameLoop = setInterval(gameUpdate, 16);
  });

  onCleanup(() => {
    if (gameLoop) clearInterval(gameLoop);
  });

  return {
    gameUpdate,
  };
}
