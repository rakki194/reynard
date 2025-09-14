/**
 * 🦊 Three.js Initializer
 * Handles Three.js scene initialization and setup
 */

import * as THREE from "three";
import { useThreeJSVisualization } from "reynard-3d";
import { oklchToRgbString } from "./colorUtils";
import { PointCloud3D } from "./PointCloud3D";
import type { ProcessedData } from "./DataProcessor";
import type { ColorMapping } from "./VisualizationCore";

export interface ThreeJSInitializerConfig {
  width: number;
  height: number;
  backgroundColor: string;
  container: HTMLDivElement;
}

export interface ThreeJSInitializerResult {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  controls: any;
  pointCloud3D: PointCloud3D;
}

export async function initializeThreeJS(
  config: ThreeJSInitializerConfig,
): Promise<ThreeJSInitializerResult> {
  const { width, height, backgroundColor, container } = config;

  // Use Reynard 3D composable for Three.js setup
  const threeJS = useThreeJSVisualization({
    width,
    height,
    backgroundColor,
  });

  // Force a layout calculation to ensure dimensions are available
  container.offsetHeight;

  // Debug container dimensions
  console.log("🦊 Container dimensions before initialization:", {
    clientWidth: container.clientWidth,
    clientHeight: container.clientHeight,
    offsetWidth: container.offsetWidth,
    offsetHeight: container.offsetHeight,
    computedStyle: {
      width: window.getComputedStyle(container).width,
      height: window.getComputedStyle(container).height,
      display: window.getComputedStyle(container).display,
      visibility: window.getComputedStyle(container).visibility,
    },
  });

  // Initialize the scene with the container
  await threeJS.initializeScene(container);

  // Wait for the camera to be properly initialized
  const waitForCamera = () => {
    return new Promise<void>((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 100; // 1 second timeout

      const checkCamera = () => {
        attempts++;
        const cameraInstance = threeJS.camera();
        if (cameraInstance && cameraInstance.position) {
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error("Camera initialization timeout"));
        } else {
          setTimeout(checkCamera, 10);
        }
      };
      checkCamera();
    });
  };

  await waitForCamera();

  // Get the Three.js objects
  const scene = threeJS.scene();
  const camera = threeJS.camera();
  const renderer = threeJS.renderer();
  const controls = threeJS.controls();

  // Set camera position
  if (camera && camera.position) {
    camera.position.set(0, 0, 5);
  }

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  scene.add(directionalLight);

  // Create point cloud manager
  const pointCloud3D = new PointCloud3D({ scene });

  // Debug renderer size after initialization
  console.log("🦊 Renderer size after initialization:", {
    width: renderer.domElement.width,
    height: renderer.domElement.height,
    clientWidth: renderer.domElement.clientWidth,
    clientHeight: renderer.domElement.clientHeight,
  });

  return {
    scene,
    camera,
    renderer,
    controls,
    pointCloud3D,
  };
}
