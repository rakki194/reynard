// AI and enemy behavior systems

import { World } from "../../types";
import { EnemyType, PlayerType, Position, PositionType, Velocity, VelocityType } from "../components";

/**
 * Enemy AI system - simple AI for enemy movement.
 */
export function enemyAISystem(world: World): void {
  const query = world.query(EnemyType, PositionType, VelocityType);
  const speed = 100; // pixels per second

  query.forEach((entity, enemy, position, velocity) => {
    const pos = position as Position;
    const vel = velocity as Velocity;
    // Simple AI: move towards player
    const playerQuery = world.query(PlayerType, PositionType);
    let playerPosition: Position | null = null;

    playerQuery.forEach((playerEntity, player, playerPos) => {
      playerPosition = playerPos as Position;
    });

    if (playerPosition) {
      const playerPos = playerPosition as Position;
      const dx = playerPos.x - pos.x;
      const dy = playerPos.y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        vel.x = (dx / distance) * speed;
        vel.y = (dy / distance) * speed;
      }
    }
  });
}
