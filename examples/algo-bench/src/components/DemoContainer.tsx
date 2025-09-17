import { Component, createEffect, onCleanup } from "solid-js";
import type { DemoType } from "../App";
import { AABBCollisionDemo } from "../demos/AABBCollisionDemo";
import { SpatialOptimizationDemo } from "../demos/SpatialOptimizationDemo";
import { PerformanceBenchmarkDemo } from "../demos/PerformanceBenchmarkDemo";
import { InteractivePhysicsDemo } from "../demos/InteractivePhysicsDemo";

interface DemoContainerProps {
  demo: DemoType;
  onStatsUpdate: (stats: any) => void;
  onBackToMenu: () => void;
}

export const DemoContainer: Component<DemoContainerProps> = props => {
  const renderDemo = () => {
    switch (props.demo) {
      case "aabb-collision":
        return <AABBCollisionDemo onStatsUpdate={props.onStatsUpdate} />;
      case "spatial-optimization":
        return <SpatialOptimizationDemo onStatsUpdate={props.onStatsUpdate} />;
      case "performance-benchmark":
        return <PerformanceBenchmarkDemo onStatsUpdate={props.onStatsUpdate} />;
      case "interactive-physics":
        return <InteractivePhysicsDemo onStatsUpdate={props.onStatsUpdate} />;
      default:
        return <div>Demo not found</div>;
    }
  };

  return (
    <div class="demo-container">
      <div class="demo-header">
        <button class="back-button" onClick={props.onBackToMenu}>
          ← Back to Demos
        </button>
        <h2 class="demo-title">{props.demo.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</h2>
      </div>

      <div class="demo-content">{renderDemo()}</div>
    </div>
  );
};
