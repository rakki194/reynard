// Collision detection and physics systems

import { World } from '../../types';
import { 
  Position, 
  Health, 
  GameState,
  Player,
  Enemy,
  Bullet,
  PositionType,
  HealthType,
  PlayerType,
  EnemyType,
  BulletType,
  GameStateType
} from '../components';

/**
 * Collision system - detects collisions between entities.
 */
export function collisionSystem(world: World): void {
  const playerQuery = world.query(PlayerType, PositionType);
  const enemyQuery = world.query(EnemyType, PositionType);
  const bulletQuery = world.query(BulletType, PositionType);

  // Check player-enemy collisions
  playerQuery.forEach((playerEntity, player, playerPos) => {
    const pp = playerPos as Position;
    enemyQuery.forEach((enemyEntity, enemy, enemyPos) => {
      const ep = enemyPos as Position;
      const dx = pp.x - ep.x;
      const dy = pp.y - ep.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 30) { // Collision threshold
        // Apply damage to player
        const playerHealth = world.get(playerEntity, HealthType) as Health;
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
    const bp = bulletPos as Position;
    enemyQuery.forEach((enemyEntity, enemy, enemyPos) => {
      const ep = enemyPos as Position;
      const dx = bp.x - ep.x;
      const dy = bp.y - ep.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 20) { // Collision threshold
        // Remove bullet and enemy
        world.despawn(bulletEntity);
        world.despawn(enemyEntity);
        
        // Update score
        const gameState = world.getResource(GameStateType) as GameState;
        if (gameState) {
          gameState.score += 10;
        }
      }
    });
  });
}
