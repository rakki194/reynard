// Example systems for ECS games

import { World } from '../types';
import { 
  Position, 
  Velocity, 
  Health, 
  Damage, 
  Lifetime, 
  GameTime, 
  GameState,
  InputState,
  Player,
  Enemy,
  Bullet
} from './components';

/**
 * Movement system - updates entity positions based on velocity.
 */
export function movementSystem(world: World): void {
  const gameTime = world.getResource(GameTime);
  if (!gameTime) return;

  const query = world.query(Position, Velocity);
  query.forEach((entity, position, velocity) => {
    position.x += velocity.x * gameTime.deltaTime;
    position.y += velocity.y * gameTime.deltaTime;
  });
}

/**
 * Lifetime system - removes entities when their lifetime expires.
 */
export function lifetimeSystem(world: World): void {
  const gameTime = world.getResource(GameTime);
  if (!gameTime) return;

  const query = world.query(Lifetime);
  const entitiesToRemove: any[] = [];

  query.forEach((entity, lifetime) => {
    lifetime.remaining -= gameTime.deltaTime;
    if (lifetime.remaining <= 0) {
      entitiesToRemove.push(entity);
    }
  });

  // Remove expired entities
  for (const entity of entitiesToRemove) {
    world.despawn(entity);
  }
}

/**
 * Damage system - applies damage to entities and removes them if health reaches zero.
 */
export function damageSystem(world: World): void {
  const query = world.query(Health, Damage);
  const entitiesToRemove: any[] = [];

  query.forEach((entity, health, damage) => {
    health.current -= damage.amount;
    
    if (health.current <= 0) {
      entitiesToRemove.push(entity);
    }
  });

  // Remove dead entities
  for (const entity of entitiesToRemove) {
    world.despawn(entity);
  }
}

/**
 * Player input system - handles player movement based on input.
 */
export function playerInputSystem(world: World): void {
  const inputState = world.getResource(InputState);
  if (!inputState) return;

  const query = world.query(Player, Velocity);
  const speed = 200; // pixels per second

  query.forEach((entity, player, velocity) => {
    // Reset velocity
    velocity.x = 0;
    velocity.y = 0;

    // Apply movement based on input
    if (inputState.keys.has('ArrowLeft') || inputState.keys.has('KeyA')) {
      velocity.x = -speed;
    }
    if (inputState.keys.has('ArrowRight') || inputState.keys.has('KeyD')) {
      velocity.x = speed;
    }
    if (inputState.keys.has('ArrowUp') || inputState.keys.has('KeyW')) {
      velocity.y = -speed;
    }
    if (inputState.keys.has('ArrowDown') || inputState.keys.has('KeyS')) {
      velocity.y = speed;
    }
  });
}

/**
 * Enemy AI system - simple AI for enemy movement.
 */
export function enemyAISystem(world: World): void {
  const query = world.query(Enemy, Position, Velocity);
  const speed = 100; // pixels per second

  query.forEach((entity, enemy, position, velocity) => {
    // Simple AI: move towards player
    const playerQuery = world.query(Player, Position);
    let playerPosition: Position | null = null;
    
    playerQuery.forEach((playerEntity, player, playerPos) => {
      playerPosition = playerPos;
    });

    if (playerPosition) {
      const dx = playerPosition.x - position.x;
      const dy = playerPosition.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        velocity.x = (dx / distance) * speed;
        velocity.y = (dy / distance) * speed;
      }
    }
  });
}

/**
 * Collision system - detects collisions between entities.
 */
export function collisionSystem(world: World): void {
  const playerQuery = world.query(Player, Position);
  const enemyQuery = world.query(Enemy, Position);
  const bulletQuery = world.query(Bullet, Position);

  // Check player-enemy collisions
  playerQuery.forEach((playerEntity, player, playerPos) => {
    enemyQuery.forEach((enemyEntity, enemy, enemyPos) => {
      const dx = playerPos.x - enemyPos.x;
      const dy = playerPos.y - enemyPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 30) { // Collision threshold
        // Apply damage to player
        const playerHealth = world.get(playerEntity, Health);
        if (playerHealth) {
          playerHealth.current -= 10;
        }
        
        // Remove enemy
        world.despawn(enemyEntity);
      }
    });
  });

  // Check bullet-enemy collisions
  bulletQuery.forEach((bulletEntity, bullet, bulletPos) => {
    enemyQuery.forEach((enemyEntity, enemy, enemyPos) => {
      const dx = bulletPos.x - enemyPos.x;
      const dy = bulletPos.y - enemyPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 20) { // Collision threshold
        // Remove bullet and enemy
        world.despawn(bulletEntity);
        world.despawn(enemyEntity);
        
        // Update score
        const gameState = world.getResource(GameState);
        if (gameState) {
          gameState.score += 10;
        }
      }
    });
  });
}

/**
 * Shooting system - creates bullets when player shoots.
 */
export function shootingSystem(world: World): void {
  const inputState = world.getResource(InputState);
  if (!inputState) return;

  const query = world.query(Player, Position);
  const bulletSpeed = 300; // pixels per second

  query.forEach((entity, player, position) => {
    if (inputState.keys.has('Space')) {
      // Create bullet
      const bullet = world.spawn(
        new Position(position.x, position.y),
        new Velocity(0, -bulletSpeed),
        new Bullet(bulletSpeed),
        new Lifetime(3) // 3 second lifetime
      );
    }
  });
}

/**
 * Rendering system - prepares entities for rendering.
 */
export function renderingSystem(world: World): void {
  // This would typically interface with a rendering engine
  // For now, we'll just log the entities that need to be rendered
  const query = world.query(Position, Color);
  
  console.log('Rendering entities:');
  query.forEach((entity, position, color) => {
    console.log(`Entity ${entity.index}: pos(${position.x}, ${position.y}), color(${color.r}, ${color.g}, ${color.b})`);
  });
}

/**
 * Game state system - manages overall game state.
 */
export function gameStateSystem(world: World): void {
  const gameState = world.getResource(GameState);
  if (!gameState) return;

  // Check if player is dead
  const playerQuery = world.query(Player, Health);
  let playerAlive = false;
  
  playerQuery.forEach((entity, player, health) => {
    if (health.current > 0) {
      playerAlive = true;
    }
  });

  if (!playerAlive && !gameState.isGameOver) {
    gameState.isGameOver = true;
    console.log('Game Over! Final Score:', gameState.score);
  }
}
