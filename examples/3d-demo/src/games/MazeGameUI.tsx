import { Component } from "solid-js";
import { ThreeJSVisualization } from "reynard-3d";
import type { MazeGameUIProps } from "./types/maze";

export const MazeGameUI: Component<MazeGameUIProps> = props => {
  return (
    <div class="maze-explorer-game">
      <div class="game-hud">
        <div class="hud-item">
          <span class="hud-label">Score:</span>
          <span class="hud-value">{props.score()}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">Position:</span>
          <span class="hud-value">
            ({Math.floor(props.playerPosition().x + props.mazeSize / 2)},{" "}
            {Math.floor(props.playerPosition().z + props.mazeSize / 2)})
          </span>
        </div>
        <div class="hud-item">
          <span class="hud-label">Status:</span>
          <span class="hud-value">{props.exitFound() ? "Exit Found!" : "Exploring..."}</span>
        </div>
      </div>

      <div class="game-instructions">
        <h3>🧩 Maze Explorer</h3>
        <p>Use WASD or Arrow Keys to navigate through the 3D maze.</p>
        <p>Find the golden exit at the far corner to win!</p>
        <p>🖱️ Mouse to look around • First-person view</p>
      </div>

      <div class="game-viewport">
        <ThreeJSVisualization
          backgroundColor="#111111"
          enableDamping={true}
          dampingFactor={0.05}
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          onSceneReady={props.onSceneReady}
          className="maze-game-canvas"
        />
      </div>
    </div>
  );
};
