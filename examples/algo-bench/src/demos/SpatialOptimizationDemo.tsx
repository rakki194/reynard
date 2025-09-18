import { Component, createSignal } from "solid-js";
import { SpatialDemoControls } from "./components/SpatialDemoControls";
import { SpatialDemoCanvas } from "./components/SpatialDemoCanvas";
import { PerformanceComparison } from "./components/PerformanceComparison";
import { usePerformanceStats } from "./composables/usePerformanceStats";
import { useBenchmarkAlgorithms } from "./composables/useBenchmarkAlgorithms";
import { useObjectGeneration } from "./composables/useObjectGeneration";
import { useSpatialAnimation } from "./composables/useSpatialAnimation";
import { useSpatialEffects } from "./composables/useSpatialEffects";

interface SpatialOptimizationDemoProps {
  onStatsUpdate: (stats: Record<string, string | number>) => void;
}

export const SpatialOptimizationDemo: Component<SpatialOptimizationDemoProps> = props => {
  const [objectCount, setObjectCount] = createSignal(50);
  const [isRunning, setIsRunning] = createSignal(false);

  // Use composables for modular functionality
  const { stats, updateStats, getFormattedStats } = usePerformanceStats();
  const { runBenchmark } = useBenchmarkAlgorithms();
  const { objects, generateObjects } = useObjectGeneration();

  // Initialize animation and effects
  const animation = useSpatialAnimation(
    isRunning,
    objects,
    runBenchmark,
    updateStats,
    getFormattedStats,
    () => props.onStatsUpdate
  );

  useSpatialEffects(objectCount, generateObjects, isRunning, animation);

  return (
    <div class="spatial-demo">
      <SpatialDemoControls
        objectCount={objectCount()}
        isRunning={isRunning()}
        onObjectCountChange={setObjectCount}
        onToggleRunning={() => setIsRunning(!isRunning())}
        onRegenerate={() => generateObjects(objectCount())}
      />

      <SpatialDemoCanvas objects={objects()} stats={stats()} />

      <PerformanceComparison stats={stats()} />
    </div>
  );
};
