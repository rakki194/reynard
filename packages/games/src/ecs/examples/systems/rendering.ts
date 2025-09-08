// Rendering and game state systems

import { World } from '../../types';
import { 
  Position, 
  Color, 
  Health,
  GameState,
  Player,
  PositionType,
  ColorType,
  HealthType,
  PlayerType,
  GameStateType
} from '../components';

/**
 * Rendering system - prepares entities for rendering.
 */
export function renderingSystem(world: World): void {
  // This would typically interface with a rendering engine
  // For now, we'll just log the entities that need to be rendered
  const query = world.query(PositionType, ColorType);
  
  console.log('Rendering entities:');
  query.forEach((entity, position, color) => {
    const pos = position as Position;
    const col = color as Color;
    console.log(`Entity ${entity.index}: pos(${pos.x}, ${pos.y}), color(${col.r}, ${col.g}, ${col.b})`);
  });
}

/**
 * Game state system - manages overall game state.
 */
export function gameStateSystem(world: World): void {
  const gameState = world.getResource(GameStateType) as GameState;
  if (!gameState) return;

  // Check if player is dead
  const playerQuery = world.query(PlayerType, HealthType);
  let playerAlive = false;
  
  playerQuery.forEach((entity, player, health) => {
    const h = health as Health;
    if (h.current > 0) {
      playerAlive = true;
    }
  });

  if (!playerAlive && !gameState.isGameOver) {
    gameState.isGameOver = true;
    console.log('Game Over! Final Score:', gameState.score);
  }
}
