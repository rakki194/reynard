// AI and enemy behavior systems
import { EnemyType, PlayerType, PositionType, VelocityType, } from "../components";
/**
 * Enemy AI system - simple AI for enemy movement.
 */
export function enemyAISystem(world) {
    const query = world.query(EnemyType, PositionType, VelocityType);
    const speed = 100; // pixels per second
    query.forEach((entity, enemy, position, velocity) => {
        const pos = position;
        const vel = velocity;
        // Simple AI: move towards player
        const playerQuery = world.query(PlayerType, PositionType);
        let playerPosition = null;
        playerQuery.forEach((playerEntity, player, playerPos) => {
            playerPosition = playerPos;
        });
        if (playerPosition) {
            const playerPos = playerPosition;
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
