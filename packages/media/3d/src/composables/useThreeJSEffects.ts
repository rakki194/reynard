// Three.js effects and lifecycle management
import { createEffect } from "solid-js";
import type { ThreeJSVisualizationProps } from "../types";

// Three.js type definitions
interface ThreeScene {
  background: { r: number; g: number; b: number } | null;
  add: (object: ThreeObject) => void;
}

interface ThreeObject {
  position?: { set: (x: number, y: number, z: number) => void };
  castShadow?: boolean;
  [key: string]: unknown;
}

interface ThreeCamera {
  aspect: number;
  updateProjectionMatrix: () => void;
  position: { set: (x: number, y: number, z: number) => void };
  lookAt: (x: number, y: number, z: number) => void;
}

interface ThreeRenderer {
  setSize: (width: number, height: number, updateStyle: boolean) => void;
  setPixelRatio: (ratio: number) => void;
  render: (scene: ThreeScene, camera: ThreeCamera) => void;
  domElement: HTMLCanvasElement;
}

interface ThreeControls {
  update: () => void;
  enabled: boolean;
  target: { set: (x: number, y: number, z: number) => void };
}

interface InitializationResult {
  sceneComposable: {
    scene: () => ThreeScene | null;
    camera: () => ThreeCamera | null;
    renderer: () => ThreeRenderer | null;
  };
  controlsComposable: {
    controls: () => ThreeControls | null;
  };
  animationComposable: {
    startAnimationLoop: (
      scene: () => ThreeScene | null,
      camera: () => ThreeCamera | null,
      renderer: () => ThreeRenderer | null,
      controls: () => ThreeControls | null,
      onRender?: (scene: ThreeScene, camera: ThreeCamera, renderer: ThreeRenderer, controls: ThreeControls) => void
    ) => void;
    handleResize: (
      container: HTMLDivElement,
      camera: () => ThreeCamera | null,
      renderer: () => ThreeRenderer | null,
      controls: () => ThreeControls | null
    ) => () => void;
  };
}

export function useThreeJSEffects(
  props: ThreeJSVisualizationProps,
  initialization: InitializationResult,
  isLoading: () => boolean
) {
  /**
   * Start animation loop when scene is ready
   */
  createEffect(() => {
    if (
      initialization.sceneComposable.scene() &&
      initialization.sceneComposable.camera() &&
      initialization.sceneComposable.renderer() &&
      initialization.controlsComposable.controls() &&
      !isLoading()
    ) {
      initialization.animationComposable.startAnimationLoop(
        initialization.sceneComposable.scene,
        initialization.sceneComposable.camera,
        initialization.sceneComposable.renderer,
        initialization.controlsComposable.controls,
        props.onRender
      );
    }
  });

  /**
   * Handle resize using animation composable
   */
  const handleResize = (container: HTMLDivElement) => {
    return initialization.animationComposable.handleResize(
      container,
      initialization.sceneComposable.camera,
      initialization.sceneComposable.renderer,
      initialization.controlsComposable.controls
    );
  };

  return { handleResize };
}
