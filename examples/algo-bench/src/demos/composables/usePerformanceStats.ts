import { createSignal } from "solid-js";

export interface PerformanceStats {
  naiveTime: number;
  spatialTime: number;
  speedup: number;
  objectCount: number;
  collisionCount: number;
}

/**
 * Composable for managing performance statistics in spatial optimization demos
 * Tracks naive vs spatial hash algorithm performance metrics
 */
export function usePerformanceStats() {
  const [stats, setStats] = createSignal<PerformanceStats>({
    naiveTime: 0,
    spatialTime: 0,
    speedup: 0,
    objectCount: 0,
    collisionCount: 0,
  });

  const updateStats = (newStats: Partial<PerformanceStats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  const resetStats = () => {
    setStats({
      naiveTime: 0,
      spatialTime: 0,
      speedup: 0,
      objectCount: 0,
      collisionCount: 0,
    });
  };

  const calculateSpeedup = (naiveTime: number, spatialTime: number): number => {
    return naiveTime > 0 ? naiveTime / spatialTime : 0;
  };

  const getFormattedStats = () => {
    const currentStats = stats();
    return {
      naiveTime: currentStats.naiveTime.toFixed(2),
      spatialTime: currentStats.spatialTime.toFixed(2),
      speedup: currentStats.speedup.toFixed(2),
      objectCount: currentStats.objectCount,
      collisionCount: currentStats.collisionCount,
    };
  };

  return {
    stats,
    updateStats,
    resetStats,
    calculateSpeedup,
    getFormattedStats,
  };
}
