import { Component } from "solid-js";
import { useCubeCollectorState } from "./composables/useCubeCollectorState";
import { useCubeInteraction } from "./composables/useCubeInteraction";
import { useGameLoop } from "./composables/useGameLoop";
import { useGameSetup } from "./composables/useGameSetup";
import { useGameHandlers } from "./composables/useGameHandlers";
import { useGameLifecycle } from "./composables/useGameLifecycle";
import type { ThreeScene, ThreeCamera, ThreeRenderer, ThreeRaycaster } from "./types/three";
import { GameHUD } from "./components/GameHUD";
import { GameInstructions } from "./components/GameInstructions";
import { GameViewport } from "./components/GameViewport";

interface CubeCollectorGameProps {
  onScoreUpdate: (score: number) => void;
}

export const CubeCollectorGame: Component<CubeCollectorGameProps> = props => {
  const gameState = useCubeCollectorState();
  const cubeInteraction = useCubeInteraction();
  const gameLoop = useGameLoop();
  const gameSetup = useGameSetup();
  useGameLifecycle(gameState, gameLoop);

  let scene: ThreeScene;
  let camera: ThreeCamera;
  let renderer: ThreeRenderer;
  let raycaster: ThreeRaycaster;

  const onSceneReady = (
    _scene: ThreeScene,
    _camera: ThreeCamera,
    _renderer: ThreeRenderer,
    _raycaster: ThreeRaycaster
  ) => {
    scene = _scene;
    camera = _camera;
    renderer = _renderer;
    raycaster = _raycaster;

    const handlers = useGameHandlers(
      gameState,
      cubeInteraction,
      scene,
      camera,
      renderer,
      raycaster,
      props.onScoreUpdate
    );
    renderer.domElement.addEventListener("click", handlers.onMouseClick);
    gameState.setGameStarted(true);
  };

  const setupGameScene = async (
    _scene: ThreeScene,
    _camera: ThreeCamera,
    _renderer: ThreeRenderer,
    controls: unknown
  ) => {
    const newCubes = await gameSetup.setupGameScene(_scene, _camera, _renderer, controls, onSceneReady);
    gameState.setCubes(newCubes);
  };

  return (
    <div class="cube-collector-game">
      <GameHUD
        score={gameState.score}
        timeLeft={gameState.timeLeft}
        remainingCubes={() => gameState.getRemainingCubes().length}
      />

      <GameInstructions />

      <GameViewport onSceneReady={setupGameScene} />
    </div>
  );
};
