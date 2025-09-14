/**
 * 🦊 3D Visualization Canvas
 * Canvas component for 3D visualization
 */

import {
  Component,
  createSignal,
  onMount,
  onCleanup,
  createMemo,
} from "solid-js";
import { useOKLCHColors } from "reynard-themes";
import {
  VisualizationCore,
  type DataPoint,
  type VisualizationConfig,
} from "./VisualizationCore";
import { DataProcessor, type ProcessedData } from "./DataProcessor";
import { createAnimationEngine } from "../../utils/animationEngine";
import { oklchToRgbString } from "./colorUtils";
import { PointCloud3D } from "./PointCloud3D";
import { initializeThreeJS } from "./ThreeJSInitializer";
import * as THREE from "three";

interface Visualization3DCanvasProps {
  data: DataPoint[];
  config?: Partial<VisualizationConfig>;
  width?: number;
  height?: number;
  isAnimating: () => boolean;
  processedData: () => ProcessedData | null;
  onInitializationError?: (error: string) => void;
  onInitializationComplete?: () => void;
}

export const Visualization3DCanvas: Component<Visualization3DCanvasProps> = (
  props,
) => {
  const oklchColors = useOKLCHColors();

  // State
  const [visualizationCore] = createSignal(new VisualizationCore(props.config));
  const [isInitializing, setIsInitializing] = createSignal(false);
  const [initializationError, setInitializationError] = createSignal<
    string | null
  >(null);

  // Refs
  let containerRef: HTMLDivElement | undefined;
  let scene: THREE.Scene | null = null;
  let camera: THREE.Camera | null = null;
  let renderer: THREE.WebGLRenderer | null = null;
  let controls: any = null;
  let pointCloud3D: PointCloud3D | null = null;

  // Create animation engine at component level to ensure proper cleanup
  const animationEngine = createAnimationEngine();

  // Generate colors for data points
  const pointColors = createMemo(() => {
    const data = props.processedData();
    if (!data) return [];

    return visualizationCore().generateColors(data.points);
  });

  // Initialize Three.js scene
  const initializeScene = async () => {
    if (!containerRef) return;

    try {
      setIsInitializing(true);
      setInitializationError(null);

      const backgroundOklch = oklchColors.getColor("background");
      const backgroundColor = oklchToRgbString(backgroundOklch);

      const result = await initializeThreeJS({
        width: props.width || 800,
        height: props.height || 600,
        backgroundColor,
        container: containerRef,
      });

      // Assign the initialized objects
      scene = result.scene;
      camera = result.camera;
      renderer = result.renderer;
      controls = result.controls;
      pointCloud3D = result.pointCloud3D;

      // Create point cloud
      createPointCloud();

      // Start render loop
      animationEngine.start({
        onRender: render,
      });

      setIsInitializing(false);
      props.onInitializationComplete?.();
    } catch (error) {
      console.error("Failed to initialize Three.js:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to initialize 3D scene";
      setInitializationError(errorMessage);
      setIsInitializing(false);
      props.onInitializationError?.(errorMessage);
    }
  };

  // Create point cloud
  const createPointCloud = () => {
    if (!pointCloud3D) return;

    const data = props.processedData();
    const colors = pointColors();

    if (data && colors.length > 0) {
      pointCloud3D.createPointCloud(data, colors);
    }
  };

  // Render scene
  const render = () => {
    if (!renderer || !scene || !camera) {
      // console.log("🦊 Render skipped - missing components:", { renderer: !!renderer, scene: !!scene, camera: !!camera });
      return;
    }

    // Update controls
    if (controls) {
      controls.update();
    }

    // Rotate point cloud if animating
    if (props.isAnimating() && pointCloud3D) {
      pointCloud3D.updateRotation(0.002, 0.005);
    }

    // Render scene
    renderer.render(scene, camera);

    // Debug: Log render info occasionally
    if (Math.random() < 0.01) {
      // 1% chance to log
      console.log("🦊 Rendering scene:", {
        sceneChildren: scene.children.length,
        cameraPosition: camera.position,
        rendererSize: {
          width: renderer.domElement.width,
          height: renderer.domElement.height,
        },
      });
    }
  };

  // Reset camera
  const resetCamera = () => {
    if (camera && controls) {
      camera.position.set(0, 0, 5);
      controls.reset();
    }
  };

  // Lifecycle
  onMount(() => {
    initializeScene();
  });

  onCleanup(() => {
    if (animationEngine) {
      animationEngine.stop();
    }

    if (pointCloud3D) {
      pointCloud3D.dispose();
    }

    if (renderer && containerRef) {
      containerRef.removeChild(renderer.domElement);
    }

    if (renderer) {
      renderer.dispose();
    }
  });

  return (
    <div class="canvas-wrapper">
      {isInitializing() && (
        <div class="loading-overlay">
          <div class="loading-spinner">🦊</div>
          <p>Initializing 3D scene...</p>
        </div>
      )}
      {initializationError() && (
        <div class="error-overlay">
          <div class="error-icon">⚠️</div>
          <p>Error: {initializationError()}</p>
          <button onClick={() => initializeScene()}>Retry</button>
        </div>
      )}
      <div
        ref={containerRef}
        class="threejs-container"
        style={{
          width: "800px",
          height: "600px",
        }}
      />
    </div>
  );
};
