import { Component } from "solid-js";

interface GameHUDProps {
  score: () => number;
  timeLeft: () => number;
  remainingCubes: () => number;
}

export const GameHUD: Component<GameHUDProps> = props => {
  return (
    <div class="game-hud">
      <div class="hud-item">
        <span class="hud-label">Score:</span>
        <span class="hud-value">{props.score()}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">Time:</span>
        <span class="hud-value">{Math.ceil(props.timeLeft())}s</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">Cubes:</span>
        <span class="hud-value">{props.remainingCubes()}/10</span>
      </div>
    </div>
  );
};
