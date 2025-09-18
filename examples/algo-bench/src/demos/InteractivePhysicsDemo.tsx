import { Component } from "solid-js";
import { usePhysicsDemo } from "./composables/usePhysicsDemo";
import { PhysicsControls } from "./components/PhysicsControls";
import { PhysicsStatsComponent } from "./components/PhysicsStats";
import { PhysicsCanvas } from "./components/PhysicsCanvas";
import type { PhysicsStats as PhysicsStatsType } from "./types";

interface InteractivePhysicsDemoProps {
  onStatsUpdate: (stats: PhysicsStatsType) => void;
}

/**
 * Interactive physics demo component orchestrating all physics simulation modules
 * Follows the 140-line axiom by delegating to specialized composables and components
 */
export const InteractivePhysicsDemo: Component<InteractivePhysicsDemoProps> = props => {
  const demo = usePhysicsDemo(stats => props.onStatsUpdate(stats));

  return (
    <div class="physics-demo">
      <PhysicsControls
        gravity={demo.gravity()}
        damping={demo.damping()}
        isRunning={demo.isRunning()}
        onGravityChange={demo.setGravity}
        onDampingChange={demo.setDamping}
        onToggleRunning={() => demo.setIsRunning(!demo.isRunning())}
        onReset={() => {}}
      />

      <PhysicsCanvas
        width={800}
        height={500}
        onMouseMove={demo.mouseInteractions.handleMouseMove}
        onMouseDown={demo.mouseInteractions.handleMouseDown}
        onMouseUp={demo.mouseInteractions.handleMouseUp}
        onClick={demo.mouseInteractions.handleMouseClick}
        onCanvasRef={demo.setCanvasRef}
      />

      <PhysicsStatsComponent
        objects={() => demo.objects().filter(obj => !obj.isStatic).length}
        collisions={() => 0}
        stats={demo.stats()}
      />
    </div>
  );
};
