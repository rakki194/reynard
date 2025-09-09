/**
 * Three.js Scene Setup Module
 * Handles the initialization of Three.js scene, camera, and renderer
 */

export interface ThreeJSSetupConfig {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface ThreeJSObjects {
  scene: any;
  camera: any;
  renderer: any;
}

export const createThreeJSSetup = async (
  container: HTMLDivElement,
  config: ThreeJSSetupConfig,
): Promise<ThreeJSObjects> => {
  const THREE = await import("three");

  // Create scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(config.backgroundColor);

  // Create camera
  const camera = new THREE.PerspectiveCamera(
    75,
    config.width / config.height,
    0.1,
    1000,
  );
  camera.position.z = 5;

  // Create renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(config.width, config.height);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  return { scene, camera, renderer };
};
