/**
 * Simple Three.js Visualization Component
 * A modular Three.js implementation using extracted modules
 */

import { Component, createSignal, onMount, onCleanup } from "solid-js";
import { initializeThreeJS, type InitializedThreeJS } from "./modules";

interface SimpleThreeDVisualizationProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  pointCount?: number;
}

export const SimpleThreeDVisualization: Component<
  SimpleThreeDVisualizationProps
> = (props) => {
  const [container, setContainer] = createSignal<HTMLDivElement>();
  const [isInitialized, setIsInitialized] = createSignal(false);

  let threeJSInstance: InitializedThreeJS | null = null;

  const handleInitialization = async () => {
    if (!container() || isInitialized()) return;

    try {
      const config = {
        width: props.width || 400,
        height: props.height || 300,
        backgroundColor: props.backgroundColor || "#1a1a1a",
        pointCount: props.pointCount || 1000,
        colorPalette: [
          0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3, 0x54a0ff,
          0x5f27cd,
        ],
      };

      threeJSInstance = await initializeThreeJS(container()!, config);
      threeJSInstance.animationLoop.start();
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize Three.js:", error);
    }
  };

  onMount(() => {
    handleInitialization();
  });

  onCleanup(() => {
    if (threeJSInstance?.animationLoop) {
      threeJSInstance.animationLoop.stop();
    }
    if (threeJSInstance?.objects.renderer && container()) {
      container()?.removeChild(threeJSInstance.objects.renderer.domElement);
    }
  });

  return <div ref={setContainer} class="simple-threed-container" />;
};
