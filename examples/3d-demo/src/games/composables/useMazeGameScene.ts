import type { Scene, Camera, WebGLRenderer, Object3D } from "three";
import type { GameControls, SceneSetupCallback, GamePlayer } from "../types/maze";
import type { ThreeJS, ThreeMesh, ThreeAmbientLight, ThreeDirectionalLight } from "../types/three";

/**
 * Composable for setting up the 3D maze game scene
 * Handles scene initialization, lighting, and player creation
 */
export function useMazeGameScene() {
  const setupGameScene = async (
    scene: Scene,
    camera: Camera,
    renderer: WebGLRenderer,
    controls: GameControls,
    onSceneReady: SceneSetupCallback
  ): Promise<{ player: GamePlayer; THREE: ThreeJS }> => {
    // Lazy load Three.js
    const THREE = (await import("three")) as unknown as ThreeJS;
    const { BoxGeometry, MeshStandardMaterial, Mesh, AmbientLight, DirectionalLight, Fog } = THREE;

    // Setup maze environment
    scene.fog = new Fog(0x222222, 1, 50);
    scene.background = new THREE.Color(0x111111);

    // Add lighting
    const ambientLight: ThreeAmbientLight = new AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight: ThreeDirectionalLight = new DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create player (first-person view)
    const playerGeometry = new BoxGeometry(0.5, 1.8, 0.5);
    const playerMaterial = new MeshStandardMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.1,
    });
    const player: ThreeMesh = new Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 0.9, 0);
    scene.add(player);

    // Position camera for first-person view
    camera.position.set(0, 1.6, 0);
    controls.target.set(0, 1.6, -1);

    onSceneReady();

    return { player, THREE };
  };

  return {
    setupGameScene,
  };
}
