import { Component } from "solid-js";
import type { GameType } from "../App";

interface GameSelectorProps {
  onGameSelect: (game: GameType) => void;
}

interface GameOption {
  id: GameType;
  title: string;
  description: string;
  icon: string;
  difficulty: "Easy" | "Medium" | "Hard";
  features: string[];
}

const gameOptions: GameOption[] = [
  {
    id: "cube-collector",
    title: "Cube Collector",
    description: "Collect colorful cubes while avoiding obstacles in this physics-based adventure!",
    icon: "🎲",
    difficulty: "Easy",
    features: ["Physics Simulation", "Score System", "Progressive Difficulty"]
  },
  {
    id: "space-shooter",
    title: "Space Shooter",
    description: "Defend against alien invaders in this fast-paced space combat game!",
    icon: "🚀",
    difficulty: "Medium",
    features: ["Particle Effects", "Enemy AI", "Power-ups"]
  },
  {
    id: "maze-explorer",
    title: "Maze Explorer",
    description: "Navigate through procedurally generated 3D mazes with first-person controls!",
    icon: "🧩",
    difficulty: "Hard",
    features: ["Procedural Generation", "First-Person Controls", "Dynamic Lighting"]
  },
  {
    id: "particle-demo",
    title: "Particle Playground",
    description: "Create beautiful particle effects and explore the power of WebGL rendering!",
    icon: "✨",
    difficulty: "Easy",
    features: ["Interactive Particles", "Real-time Effects", "Visual Art"]
  }
];

export const GameSelector: Component<GameSelectorProps> = (props) => {
  return (
    <div class="game-selector">
      <div class="selector-header">
        <h2>Choose Your 3D Adventure</h2>
        <p>Select a game or demo to experience the power of Reynard's 3D capabilities</p>
      </div>
      
      <div class="games-grid">
        {gameOptions.map((game) => (
          <div 
            class="game-card"
            onClick={() => props.onGameSelect(game.id)}
          >
            <div class="game-icon">{game.icon}</div>
            <div class="game-content">
              <h3>{game.title}</h3>
              <p class="game-description">{game.description}</p>
              <div class="game-meta">
                <span class={`difficulty difficulty-${game.difficulty.toLowerCase()}`}>
                  {game.difficulty}
                </span>
              </div>
              <div class="game-features">
                {game.features.map((feature) => (
                  <span class="feature-tag">{feature}</span>
                ))}
              </div>
            </div>
            <div class="game-action">
              <button class="play-button">
                Play Now
                <span class="play-icon">▶️</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
