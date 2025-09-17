// Rendering and game state systems
import { ColorType, GameStateType, HealthType, PlayerType, PositionType, } from "../components";
/**
 * Rendering system - prepares entities for rendering.
 */
export function renderingSystem(world) {
    // This would typically interface with a rendering engine
    // For now, we'll just log the entities that need to be rendered
    const query = world.query(PositionType, ColorType);
    console.log("Rendering entities:");
    query.forEach((entity, position, color) => {
        const pos = position;
        const col = color;
        console.log(`Entity ${entity.index}: pos(${pos.x}, ${pos.y}), color(${col.r}, ${col.g}, ${col.b})`);
    });
}
/**
 * Game state system - manages overall game state.
 */
export function gameStateSystem(world) {
    const gameState = world.getResource(GameStateType);
    if (!gameState)
        return;
    // Check if player is dead
    const playerQuery = world.query(PlayerType, HealthType);
    let playerAlive = false;
    playerQuery.forEach((_entity, _player, health) => {
        const h = health;
        if (h.current > 0) {
            playerAlive = true;
        }
    });
    if (!playerAlive && !gameState.isGameOver) {
        gameState.isGameOver = true;
        console.log("Game Over! Final Score:", gameState.score);
    }
}
