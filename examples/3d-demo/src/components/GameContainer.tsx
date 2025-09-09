import { Component, Show } from "solid-js";
import type { GameType } from "../App";
import { CubeCollectorGame } from "../games/CubeCollectorGame";
import { SpaceShooterGame } from "../games/SpaceShooterGame";
import { MazeExplorerGame } from "../games/MazeExplorerGame";
import { ParticleDemo } from "../games/ParticleDemo";

interface GameContainerProps {
  game: GameType;
  onScoreUpdate: (score: number) => void;
  onBackToMenu: () => void;
}

export const GameContainer: Component<GameContainerProps> = (props) => {
  return (
    <div class="game-container">
      <div class="game-header">
        <button class="back-button" onClick={props.onBackToMenu}>
          ← Back to Menu
        </button>
        <div class="game-title">
          {props.game === "cube-collector" && "🎲 Cube Collector"}
          {props.game === "space-shooter" && "🚀 Space Shooter"}
          {props.game === "maze-explorer" && "🧩 Maze Explorer"}
          {props.game === "particle-demo" && "✨ Particle Playground"}
        </div>
        <div class="game-score">
          Score: <span class="score-value">0</span>
        </div>
      </div>

      <div class="game-viewport">
        <Show when={props.game === "cube-collector"}>
          <CubeCollectorGame onScoreUpdate={props.onScoreUpdate} />
        </Show>

        <Show when={props.game === "space-shooter"}>
          <SpaceShooterGame onScoreUpdate={props.onScoreUpdate} />
        </Show>

        <Show when={props.game === "maze-explorer"}>
          <MazeExplorerGame onScoreUpdate={props.onScoreUpdate} />
        </Show>

        <Show when={props.game === "particle-demo"}>
          <ParticleDemo onScoreUpdate={props.onScoreUpdate} />
        </Show>
      </div>
    </div>
  );
};
