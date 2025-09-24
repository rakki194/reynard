/**
 * Game Selector Component
 * Main menu for selecting different games and demos
 */

import { Component } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { Button } from "reynard-components-core";
import { ThemeToggle } from "./ThemeToggle";
import "../styles/game-selector.css";

interface GameSelectorProps {
  onGameSelect: (game: "roguelike" | "3d-games") => void;
}

export const GameSelector: Component<GameSelectorProps> = (props) => {
  return (
    <div class="game-selector">
      <header class="app-header">
        <div class="header-content">
          <h1>
            <span class="reynard-logo">🦊</span>
            Reynard Games Demo
          </h1>
          <p>Interactive Games and Visualizations powered by Reynard Framework</p>
          <div class="header-controls">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main class="game-selection">
        <div class="games-grid">
          <div class="game-card" onClick={() => props.onGameSelect("roguelike")}>
            <div class="game-icon">🎮</div>
            <h3>Rogue-like Dungeon Crawler</h3>
            <p>Experience a fully functional rogue-like dungeon crawler built with Reynard's ECS system. Features procedural dungeon generation, AI enemies, and pixel-perfect rendering.</p>
            <div class="game-features">
              <span class="feature-tag">ECS Architecture</span>
              <span class="feature-tag">Procedural Generation</span>
              <span class="feature-tag">AI Systems</span>
              <span class="feature-tag">Pixel Art</span>
            </div>
            <Button variant="primary" size="lg" class="play-button">
              Play Game
            </Button>
          </div>

          <div class="game-card" onClick={() => props.onGameSelect("3d-games")}>
            <div class="game-icon">🎲</div>
            <h3>3D Interactive Games</h3>
            <p>Collection of 3D games and visualizations powered by Three.js. Includes cube collector, space shooter, maze explorer, and particle demos.</p>
            <div class="game-features">
              <span class="feature-tag">Three.js</span>
              <span class="feature-tag">3D Graphics</span>
              <span class="feature-tag">Interactive</span>
              <span class="feature-tag">Multiple Games</span>
            </div>
            <Button variant="primary" size="lg" class="play-button">
              Play Games
            </Button>
          </div>
        </div>

        <div class="tech-info">
          <h3>🛠️ Technical Features</h3>
          <div class="tech-grid">
            <div class="tech-item">
              <h4>ECS System</h4>
              <p>Entity-Component-System architecture for high-performance game logic</p>
            </div>
            <div class="tech-item">
              <h4>3D Rendering</h4>
              <p>WebGL-powered 3D graphics with Three.js integration</p>
            </div>
            <div class="tech-item">
              <h4>Procedural Generation</h4>
              <p>Algorithmic content generation for infinite replayability</p>
            </div>
            <div class="tech-item">
              <h4>AI Systems</h4>
              <p>Intelligent NPCs with various behavior patterns</p>
            </div>
          </div>
        </div>
      </main>

      <footer class="app-footer">
        <p>
          Built with 🦊 Reynard Framework •
          <a href="https://github.com/rakki194/reynard" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
};