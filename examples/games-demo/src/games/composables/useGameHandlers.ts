import type { ThreeScene, ThreeCamera, ThreeRenderer, ThreeRaycaster } from "../types/three";
import { useCubeCollectorState } from "./useCubeCollectorState";
import { useCubeInteraction } from "./useCubeInteraction";

export const useGameHandlers = (
  gameState: ReturnType<typeof useCubeCollectorState>,
  cubeInteraction: ReturnType<typeof useCubeInteraction>,
  scene: ThreeScene,
  camera: ThreeCamera,
  renderer: ThreeRenderer,
  raycaster: ThreeRaycaster,
  onScoreUpdate: (score: number) => void
) => {
  const handleCubeCollected = (cube: { id: number; mesh: unknown; points: number }) => {
    scene.remove(cube.mesh);
    gameState.collectCube(cube.id);

    const newScore = gameState.updateScore(cube.points);
    onScoreUpdate(newScore);

    if (gameState.isGameWon()) {
      setTimeout(() => {
        alert(`🎉 Congratulations! You collected all cubes! Final Score: ${newScore}`);
      }, 100);
    }
  };

  const onMouseClick = (event: MouseEvent) => {
    cubeInteraction.handleMouseClick(event, raycaster, camera, renderer, gameState.cubes(), handleCubeCollected);
  };

  return {
    onMouseClick,
    handleCubeCollected,
  };
};
