import type { ThreeScene, ThreeCamera, ThreeRenderer, ThreeRaycaster, ThreeJS } from "../types/three";
import { useCubeCreation } from "./useCubeCreation";
import { useGameScene } from "./useGameScene";

export const useGameSetup = () => {
  const cubeCreation = useCubeCreation();
  const gameScene = useGameScene();

  const setupGameScene = async (
    _scene: ThreeScene,
    _camera: ThreeCamera,
    _renderer: ThreeRenderer,
    onSceneReady: (scene: ThreeScene, camera: ThreeCamera, renderer: ThreeRenderer, raycaster: ThreeRaycaster) => void
  ) => {
    const THREE = (await import("three")) as unknown as ThreeJS;
    const raycasterData = await gameScene.setupRaycaster();
    const raycaster = raycasterData.raycaster;

    await gameScene.setupLighting(_scene);
    await gameScene.setupGround(_scene);

    const newCubes = await cubeCreation.createCollectibleCubes(_scene, THREE);

    onSceneReady(_scene, _camera, _renderer, raycaster);
    return newCubes;
  };

  return {
    setupGameScene,
  };
};
