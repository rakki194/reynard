// Three.js initialization orchestrator
// Coordinates scene, controls, and animation composables

import { createSignal } from "solid-js";
import type { ThreeJSVisualizationProps } from "../types";
import { useThreeJSScene, type SceneConfig } from "./useThreeJSScene";
import { useThreeJSControls, type ControlsConfig } from "./useThreeJSControls";
import { useThreeJSAnimation } from "./useThreeJSAnimation";

export function useThreeJSInitialization(props: ThreeJSVisualizationProps) {
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Initialize composables
  const sceneConfig: SceneConfig = {
    width: props.width || 800,
    height: props.height || 600,
    backgroundColor: props.backgroundColor || "#000000",
  };

  const controlsConfig: ControlsConfig = {
    enableDamping: props.enableDamping ?? true,
    dampingFactor: props.dampingFactor ?? 0.05,
    enableZoom: props.enableZoom ?? true,
    enablePan: props.enablePan ?? true,
    enableRotate: props.enableRotate ?? true,
    minDistance: props.minDistance ?? 1,
    maxDistance: props.maxDistance ?? 100,
    maxPolarAngle: props.maxPolarAngle ?? Math.PI,
    autoRotate: props.autoRotate ?? false,
    enableCameraAnimations: props.enableCameraAnimations ?? true,
  };

  const sceneComposable = useThreeJSScene(sceneConfig);
  const controlsComposable = useThreeJSControls(controlsConfig);
  const animationComposable = useThreeJSAnimation();

  /**
   * Initialize complete Three.js scene
   */
  const initializeScene = async (container: HTMLDivElement) => {
    try {
      setIsLoading(true);
      setError("");

      // Create scene, camera, and renderer
      await sceneComposable.createScene(container);

      // Create controls
      await controlsComposable.createControls(
        sceneComposable.camera(),
        sceneComposable.renderer(),
        props.onControlsChange ? () => props.onControlsChange?.({}) : undefined,
        props.onCameraAnimationStart,
        props.onCameraAnimationEnd,
      );

      // Create clock for animations
      await animationComposable.createClock();

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to initialize Three.js scene:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize 3D scene",
      );
      setIsLoading(false);
    }
  };

  return {
    // State
    isLoading,
    error,

    // Composables
    sceneComposable,
    controlsComposable,
    animationComposable,

    // Methods
    initializeScene,
  };
}
