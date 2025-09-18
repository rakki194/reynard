import { createSignal } from "solid-js";

/**
 * Animation loop composable for spatial optimization demo
 * Handles animation frame management and benchmark execution
 */
export function useSpatialAnimation(
  isRunning: () => boolean,
  objects: () => any[],
  runBenchmark: (count: number) => any,
  updateStats: (stats: any) => void,
  getFormattedStats: () => Record<string, string | number>,
  onStatsUpdate: () => (stats: Record<string, string | number>) => void
) {
  const [animationFrameId, setAnimationFrameId] = createSignal<number>();

  const animate = () => {
    if (!isRunning()) return;

    const currentObjects = objects();
    if (currentObjects.length > 0) {
      const result = runBenchmark(currentObjects.length);
      updateStats({
        naiveTime: result.naiveTime,
        spatialTime: result.spatialTime,
        speedup: result.speedup,
        objectCount: result.objectCount,
        collisionCount: result.collisionCount,
      });
      onStatsUpdate()(getFormattedStats());
    }

    const id = requestAnimationFrame(animate);
    setAnimationFrameId(id);
  };

  const startAnimation = () => {
    if (isRunning()) {
      const id = requestAnimationFrame(animate);
      setAnimationFrameId(id);
    }
  };

  const stopAnimation = () => {
    const id = animationFrameId();
    if (id) {
      window.cancelAnimationFrame(id);
      setAnimationFrameId(undefined);
    }
  };

  return {
    startAnimation,
    stopAnimation,
    animationFrameId,
  };
}
