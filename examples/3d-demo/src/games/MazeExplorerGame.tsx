import { Component, createSignal } from "solid-js";
import type { Scene, Camera, WebGLRenderer } from "three";
import { useMazeGeneration } from "./composables/useMazeGeneration";
import { useMazeRendering } from "./composables/useMazeRendering";
import { usePlayerMovement } from "./composables/usePlayerMovement";
import { useGameControls } from "./composables/useGameControls";
import { useMazeGameScene } from "./composables/useMazeGameScene";
import { useMazeGameLoop } from "./composables/useMazeGameLoop";
import { MazeGameUI } from "./MazeGameUI";
import type {
  GamePlayer,
  GameControls,
  SceneReadyHandler,
  MazeGameLogic,
  SceneHandlerResult,
  MazeCell,
  GameSceneSetupFunction,
} from "./types/maze";
import type { ThreeJS } from "./types/three";

interface MazeExplorerGameProps {
  onScoreUpdate: (score: number) => void;
}

const createSceneHandler = (
  generateMaze: () => void,
  renderMaze: (THREE: ThreeJS, scene: Scene, maze: MazeCell[][], mazeSize: number) => void,
  maze: () => MazeCell[][],
  mazeSize: number,
  setupControls: () => void,
  setGameStarted: (started: boolean) => void,
  setupGameScene: GameSceneSetupFunction
): SceneHandlerResult => {
  let scene: Scene | undefined;
  let camera: Camera | undefined;
  let renderer: WebGLRenderer | undefined;
  let controls: GameControls | undefined;
  let player: GamePlayer | undefined;

  const handleSceneReady: SceneReadyHandler = async (_scene, _camera, _renderer, _controls) => {
    scene = _scene;
    camera = _camera;
    renderer = _renderer;
    controls = _controls;

    const { player: newPlayer, THREE } = await setupGameScene(scene, camera, renderer, controls, () => {
      generateMaze();
      renderMaze(THREE, scene!, maze(), mazeSize);
      setupControls();
      setGameStarted(true);
    });

    player = newPlayer;
  };

  return { handleSceneReady, player: () => player, camera: () => camera, controls: () => controls };
};

const createMazeGameLogic = (props: MazeExplorerGameProps): MazeGameLogic => {
  const [score, setScore] = createSignal(0);
  const [gameStarted, setGameStarted] = createSignal(false);
  const mazeSize = 15;

  // Initialize composables
  const { maze, generateMaze } = useMazeGeneration(mazeSize);
  const { renderMaze } = useMazeRendering();
  const { playerPosition, exitFound, updatePlayerPosition } = usePlayerMovement(mazeSize);
  const { setupControls, getMovementInput } = useGameControls();
  const { setupGameScene } = useMazeGameScene();

  const { handleSceneReady, player, camera, controls } = createSceneHandler(
    generateMaze,
    renderMaze,
    maze,
    mazeSize,
    setupControls,
    setGameStarted,
    setupGameScene
  );

  // Initialize game loop
  useMazeGameLoop(
    gameStarted,
    maze,
    mazeSize,
    playerPosition,
    player,
    camera,
    controls,
    getMovementInput,
    updatePlayerPosition,
    (newScore: number) => {
      setScore(newScore);
      props.onScoreUpdate(newScore);
    },
    score
  );

  return {
    score,
    playerPosition,
    exitFound,
    mazeSize,
    handleSceneReady,
  };
};

export const MazeExplorerGame: Component<MazeExplorerGameProps> = props => {
  const { score, playerPosition, exitFound, mazeSize, handleSceneReady } = createMazeGameLogic(props);

  return (
    <MazeGameUI
      score={score}
      playerPosition={playerPosition}
      exitFound={exitFound}
      mazeSize={mazeSize}
      onSceneReady={handleSceneReady}
    />
  );
};
