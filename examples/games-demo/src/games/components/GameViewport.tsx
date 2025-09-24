import { Component } from "solid-js";
import { ThreeJSVisualization } from "reynard-3d";
import type { ThreeScene, ThreeCamera, ThreeRenderer } from "../types/three";

interface GameViewportProps {
  onSceneReady: (
    _scene: ThreeScene,
    _camera: ThreeCamera,
    _renderer: ThreeRenderer,
    controls: unknown
  ) => Promise<void>;
}

export const GameViewport: Component<GameViewportProps> = props => {
  return (
    <div class="game-viewport">
      <ThreeJSVisualization
        backgroundColor="#87CEEB"
        enableDamping={true}
        dampingFactor={0.05}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={20}
        onSceneReady={props.onSceneReady}
        className="cube-game-canvas"
      />
    </div>
  );
};
