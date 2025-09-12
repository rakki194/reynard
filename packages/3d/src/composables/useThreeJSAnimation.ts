// Three.js animation loop composable
import { createSignal, createEffect, onCleanup } from "solid-js";

export function useThreeJSAnimation() {
  const [clock, setClock] = createSignal<any>(null);
  const [animationId, setAnimationId] = createSignal<number | null>(null);

  const createClock = async () => {
    const THREE = (await import("three")) as any;
    const newClock = new THREE.Clock();
    setClock(newClock);
    return newClock;
  };

  const startAnimationLoop = (
    scene: any,
    camera: any,
    renderer: any,
    controls: any,
    onRender?: (scene: any, camera: any, renderer: any, controls: any) => void,
  ) => {
    const animate = () => {
      const currentScene = scene();
      const currentCamera = camera();
      const currentRenderer = renderer();
      const currentControls = controls();
      const currentClock = clock();

      if (
        !currentScene ||
        !currentCamera ||
        !currentRenderer ||
        !currentControls ||
        !currentClock
      )
        return;

      const _deltaTime = currentClock.getDelta();

      // Update controls (required for damping)
      currentControls.update();

      // Call onRender callback for custom rendering logic
      if (onRender) {
        onRender(currentScene, currentCamera, currentRenderer, currentControls);
      }

      // Render the scene
      currentRenderer.render(currentScene, currentCamera);

      // Continue animation loop
      const id = requestAnimationFrame(animate);
      setAnimationId(id);
    };

    animate();
  };

  const handleResize = (
    container: HTMLDivElement,
    camera: any,
    renderer: any,
    controls: any,
  ) => {
    let resizeTimeout: number | null = null;

    return () => {
      const currentCamera = camera();
      const currentRenderer = renderer();
      const currentControls = controls();

      if (!currentCamera || !currentRenderer || !currentControls) return;

      // Debounce resize events for better performance
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = window.setTimeout(() => {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const pixelRatio = Math.min(window.devicePixelRatio, 2);

        // Update camera
        currentCamera.aspect = containerWidth / containerHeight;
        currentCamera.updateProjectionMatrix();

        // Update renderer
        currentRenderer.setSize(containerWidth, containerHeight, false);
        currentRenderer.setPixelRatio(pixelRatio);

        // Update controls
        currentControls.update();
      }, 100);
    };
  };

  // Cleanup on unmount
  onCleanup(() => {
    const currentAnimationId = animationId();
    if (currentAnimationId) {
      window.cancelAnimationFrame(currentAnimationId);
    }
  });

  return {
    clock,
    animationId,
    createClock,
    startAnimationLoop,
    handleResize,
  };
}
