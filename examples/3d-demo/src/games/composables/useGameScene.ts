import type {
  ThreeScene,
  ThreeJS,
  ThreeAmbientLight,
  ThreeDirectionalLight,
  ThreeGridHelper,
  ThreeRaycaster,
  ThreeVector2,
} from "../types/three";

export const useGameScene = () => {
  const setupLighting = async (scene: ThreeScene) => {
    const THREE = (await import("three")) as unknown as ThreeJS;

    const ambientLight: ThreeAmbientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight: ThreeDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
  };

  const setupGround = async (scene: ThreeScene) => {
    const THREE = (await import("three")) as unknown as ThreeJS;
    const gridHelper: ThreeGridHelper = new THREE.GridHelper(20, 20);
    gridHelper.position.y = -1;
    scene.add(gridHelper);
  };

  const setupRaycaster = async (): Promise<{ raycaster: ThreeRaycaster; mouse: ThreeVector2 }> => {
    const THREE = (await import("three")) as unknown as ThreeJS;
    return {
      raycaster: new THREE.Raycaster(),
      mouse: new THREE.Vector2(),
    };
  };

  return {
    setupLighting,
    setupGround,
    setupRaycaster,
  };
};
