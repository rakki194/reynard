/**
 * Animation Hook
 * Handles animation loop for OKLCH showcase
 */

import { createSignal, onMount, onCleanup, type Accessor } from "solid-js";

export const useAnimation = (animationSpeed: Accessor<number>) => {
  const [animationFrame, setAnimationFrame] = createSignal(0);
  let animationId: number | undefined;

  // Animation loop
  onMount(() => {
    const animate = () => {
      setAnimationFrame(prev => prev + animationSpeed());
      animationId = window.requestAnimationFrame(animate);
    };
    animationId = window.requestAnimationFrame(animate);
  });

  onCleanup(() => {
    if (animationId) {
      window.cancelAnimationFrame(animationId);
    }
  });

  return animationFrame;
};
