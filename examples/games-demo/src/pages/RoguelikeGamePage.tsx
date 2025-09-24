/**
 * Rogue-like Game Showcase Page
 * Demonstrates the ECS-based rogue-like game with procedural generation
 */

import { RoguelikeGameComponent } from "reynard-games";
import { Component } from "solid-js";
import "../styles/roguelike-game.css";

export const RoguelikeGamePage: Component = () => {
  return (
    <div class="roguelike-page">
      <div class="page-header">
        <h1>🦊 Reynard Rogue-like</h1>
        <p class="page-description">
          Experience a fully functional rogue-like dungeon crawler built with Reynard's ECS system. Features procedural
          dungeon generation, AI enemies, and pixel-perfect rendering.
        </p>
      </div>

      <div class="game-container">
        <RoguelikeGameComponent width={1280} height={720} className="main-game" />
      </div>

      <div class="page-footer">
        <div class="tech-stack">
          <h3>🛠️ Technical Features</h3>
          <div class="feature-grid">
            <div class="feature-card">
              <h4>ECS Architecture</h4>
              <p>Built with Reynard's Entity-Component-System for high performance and modularity</p>
            </div>
            <div class="feature-card">
              <h4>Procedural Generation</h4>
              <p>Each dungeon is uniquely generated with rooms, corridors, and varied layouts</p>
            </div>
            <div class="feature-card">
              <h4>AI Systems</h4>
              <p>Multiple enemy types with different behaviors: wander, aggressive, and guard</p>
            </div>
            <div class="feature-card">
              <h4>Pixel Art Rendering</h4>
              <p>Crisp, retro-style graphics with proper pixel-perfect rendering</p>
            </div>
            <div class="feature-card">
              <h4>Line of Sight</h4>
              <p>Realistic vision system with exploration mechanics</p>
            </div>
            <div class="feature-card">
              <h4>Combat & Items</h4>
              <p>Turn-based combat system with item collection and inventory management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
