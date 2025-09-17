// Collision detection and physics systems
import { BulletType, EnemyType, GameStateType, HealthType, PlayerType, PositionType, } from "../components";
/**
 * Collision system - detects collisions between entities.
 */
export function collisionSystem(world) {
    const playerQuery = world.query(PlayerType, PositionType);
    const enemyQuery = world.query(EnemyType, PositionType);
    const bulletQuery = world.query(BulletType, PositionType);
    // Check player-enemy collisions
    playerQuery.forEach((playerEntity, _player, playerPos) => {
        const pp = playerPos;
        enemyQuery.forEach((enemyEntity, _enemy, enemyPos) => {
            const ep = enemyPos;
            const dx = pp.x - ep.x;
            const dy = pp.y - ep.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 30) {
                // Collision threshold
                // Apply damage to player
                const playerHealth = world.get(playerEntity, HealthType);
                if (playerHealth) {
                    playerHealth.current -= 10;
                }
                // Remove enemy
                world.despawn(enemyEntity);
            }
        });
    });
    // Check bullet-enemy collisions
    bulletQuery.forEach((bulletEntity, _bullet, bulletPos) => {
        const bp = bulletPos;
        enemyQuery.forEach((enemyEntity, _enemy, enemyPos) => {
            const ep = enemyPos;
            const dx = bp.x - ep.x;
            const dy = bp.y - ep.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 20) {
                // Collision threshold
                // Remove bullet and enemy
                world.despawn(bulletEntity);
                world.despawn(enemyEntity);
                // Update score
                const gameState = world.getResource(GameStateType);
                if (gameState) {
                    gameState.score += 10;
                }
            }
        });
    });
}
