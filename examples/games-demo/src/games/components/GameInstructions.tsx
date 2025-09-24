import { Component } from "solid-js";

export const GameInstructions: Component = () => {
  return (
    <div class="game-instructions">
      <h3>🎲 Cube Collector</h3>
      <p>Click on the colorful cubes to collect them! Each cube is worth different points.</p>
      <p>Collect all 10 cubes before time runs out!</p>
    </div>
  );
};
