import { onMount, onCleanup } from "solid-js";
import { useCubeCollectorState } from "./useCubeCollectorState";
import { useGameLoop } from "./useGameLoop";

export const useGameLifecycle = (
  gameState: ReturnType<typeof useCubeCollectorState>,
  gameLoop: ReturnType<typeof useGameLoop>
) => {
  let gameLoopInterval: ReturnType<typeof setInterval>;

  const gameUpdate = () => {
    if (!gameState.gameStarted()) return;

    gameLoop.animateCubes(gameState.cubes());
    gameLoop.updateTimer(gameState.timeLeft(), gameState.setTimeLeft);

    if (gameState.timeLeft() <= 0) {
      alert(`⏰ Time's up! Final Score: ${gameState.score()}`);
    }
  };

  onMount(() => {
    gameLoopInterval = setInterval(gameUpdate, 16);
  });

  onCleanup(() => {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
  });

  return {
    gameLoopInterval,
  };
};
