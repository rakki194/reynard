// Rogue-like game systems for ECS
import { AIType, EnemyType, HealthType, InventoryType, PlayerType, PositionType, RoguelikeItemType, VisionType, } from "./components";
import { CameraType, DungeonMapType, GameStateType, MessageLogType, PlayerInputType, } from "./resources";
// === Input System ===
export function inputSystem(world) {
    const input = world.getResource(PlayerInputType);
    const gameState = world.getResource(GameStateType);
    if (!input || !gameState || gameState.state !== "playing")
        return;
    // Handle keyboard input
    const query = world.query(PositionType, PlayerType);
    query.forEach((_entity, position, _player) => {
        const pos = position;
        let moved = false;
        let newX = pos.x;
        let newY = pos.y;
        // Movement keys
        if (input.keys.has("ArrowUp") ||
            input.keys.has("w") ||
            input.keys.has("W")) {
            newY = Math.max(0, pos.y - 1);
            moved = true;
        }
        if (input.keys.has("ArrowDown") ||
            input.keys.has("s") ||
            input.keys.has("S")) {
            newY = Math.min(24, pos.y + 1);
            moved = true;
        }
        if (input.keys.has("ArrowLeft") ||
            input.keys.has("a") ||
            input.keys.has("A")) {
            newX = Math.max(0, pos.x - 1);
            moved = true;
        }
        if (input.keys.has("ArrowRight") ||
            input.keys.has("d") ||
            input.keys.has("D")) {
            newX = Math.min(79, pos.x + 1);
            moved = true;
        }
        // Check if movement is valid (not into wall)
        if (moved) {
            const dungeon = world.getResource(DungeonMapType);
            if (dungeon && isValidMove(dungeon, newX, newY)) {
                pos.x = newX;
                pos.y = newY;
                // Update camera to follow player
                const camera = world.getResource(CameraType);
                if (camera) {
                    camera.x = newX;
                    camera.y = newY;
                }
                // Mark tile as explored
                if (dungeon.tiles[newY] && dungeon.tiles[newY][newX]) {
                    dungeon.tiles[newY][newX].explored = true;
                }
            }
        }
        // Clear input after processing
        input.keys.clear();
    });
}
// === AI System ===
export function aiSystem(world) {
    const gameState = world.getResource(GameStateType);
    if (!gameState || gameState.state !== "playing")
        return;
    const query = world.query(PositionType, AIType, EnemyType);
    query.forEach((entity, position, ai, enemy) => {
        const pos = position;
        const aiComp = ai;
        switch (aiComp.type) {
            case "wander":
                wanderAI(world, entity.index, pos, aiComp);
                break;
            case "aggressive":
                aggressiveAI(world, entity.index, pos, aiComp);
                break;
            case "guard":
                guardAI(world, entity.index, pos, aiComp);
                break;
        }
    });
}
// === Vision System ===
export function visionSystem(world) {
    const dungeon = world.getResource(DungeonMapType);
    const playerQuery = world.query(PositionType, VisionType, PlayerType);
    if (!dungeon)
        return;
    // Clear all visibility
    for (let y = 0; y < dungeon.height; y++) {
        for (let x = 0; x < dungeon.width; x++) {
            dungeon.tiles[y][x].visible = false;
        }
    }
    // Calculate player vision
    playerQuery.forEach((_entity, position, vision) => {
        const pos = position;
        const visionComp = vision;
        calculateVision(dungeon, pos.x, pos.y, visionComp.radius);
    });
}
// === Combat System ===
export function combatSystem(world) {
    const gameState = world.getResource(GameStateType);
    if (!gameState || gameState.state !== "playing")
        return;
    // Check for combat between entities
    const playerQuery = world.query(PositionType, HealthType, PlayerType);
    const enemyQuery = world.query(PositionType, HealthType, EnemyType);
    playerQuery.forEach((_playerEntity, playerPos, _playerHealth) => {
        const playerPosition = playerPos;
        enemyQuery.forEach((enemyEntity, enemyPos, enemyHealth) => {
            const enemyPosition = enemyPos;
            const enemyHealthComp = enemyHealth;
            if (playerPosition.x === enemyPosition.x &&
                playerPosition.y === enemyPosition.y) {
                // Combat occurs
                const damage = 10; // Base damage
                enemyHealthComp.current -= damage;
                const messageLog = world.getResource(MessageLogType);
                if (messageLog) {
                    addMessage(messageLog, `You deal ${damage} damage!`, "#ff6b6b");
                }
                if (enemyHealthComp.current <= 0) {
                    // Enemy dies
                    world.despawn(enemyEntity);
                    addMessage(messageLog, "Enemy defeated!", "#4ecdc4");
                }
            }
        });
    });
}
// === Item System ===
export function itemSystem(world) {
    const playerQuery = world.query(PositionType, InventoryType, PlayerType);
    const itemQuery = world.query(PositionType, RoguelikeItemType);
    playerQuery.forEach((_playerEntity, playerPos, inventory) => {
        const playerPosition = playerPos;
        const playerInventory = inventory;
        itemQuery.forEach((itemEntity, itemPos, item) => {
            const itemPosition = itemPos;
            const itemComp = item;
            if (playerPosition.x === itemPosition.x &&
                playerPosition.y === itemPosition.y) {
                // Player picks up item
                if (playerInventory.items.length < playerInventory.maxSize) {
                    playerInventory.items.push(itemComp.name);
                    world.despawn(itemEntity);
                    const messageLog = world.getResource(MessageLogType);
                    addMessage(messageLog, `Picked up ${itemComp.name}`, "#ffd93d");
                }
                else {
                    const messageLog = world.getResource(MessageLogType);
                    addMessage(messageLog, "Inventory full!", "#ff6b6b");
                }
            }
        });
    });
}
// === Game State System ===
export function gameStateSystem(world) {
    const gameState = world.getResource(GameStateType);
    if (!gameState)
        return;
    // Check for game over conditions
    const playerQuery = world.query(HealthType, PlayerType);
    playerQuery.forEach((_entity, health) => {
        const playerHealth = health;
        if (playerHealth.current <= 0) {
            gameState.state = "gameOver";
            const messageLog = world.getResource(MessageLogType);
            addMessage(messageLog, "Game Over! Press R to restart.", "#ff6b6b");
        }
    });
}
// === Helper Functions ===
function isValidMove(dungeon, x, y) {
    if (x < 0 || x >= dungeon.width || y < 0 || y >= dungeon.height) {
        return false;
    }
    return dungeon.tiles[y][x].type === "floor";
}
function wanderAI(world, _entity, position, _ai) {
    if (Math.random() < 0.1) {
        // 10% chance to move each turn
        const directions = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
        ];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const newX = position.x + direction.x;
        const newY = position.y + direction.y;
        const dungeon = world.getResource(DungeonMapType);
        if (dungeon && isValidMove(dungeon, newX, newY)) {
            position.x = newX;
            position.y = newY;
        }
    }
}
function aggressiveAI(world, _entity, position, _ai) {
    // Find nearest player
    const playerQuery = world.query(PositionType, PlayerType);
    let nearestPlayer = null;
    let minDistance = Infinity;
    playerQuery.forEach((_playerEntity, playerPos) => {
        const playerPosition = playerPos;
        const distance = Math.abs(position.x - playerPosition.x) +
            Math.abs(position.y - playerPosition.y);
        if (distance < minDistance) {
            minDistance = distance;
            nearestPlayer = playerPosition;
        }
    });
    if (nearestPlayer && minDistance <= 5) {
        // Move towards player
        const dx = nearestPlayer.x - position.x;
        const dy = nearestPlayer.y - position.y;
        let newX = position.x;
        let newY = position.y;
        if (Math.abs(dx) > Math.abs(dy)) {
            newX += dx > 0 ? 1 : -1;
        }
        else {
            newY += dy > 0 ? 1 : -1;
        }
        const dungeon = world.getResource(DungeonMapType);
        if (dungeon && isValidMove(dungeon, newX, newY)) {
            position.x = newX;
            position.y = newY;
        }
    }
}
function guardAI(world, _entity, position, _ai) {
    // Guard AI - stays in place unless player is very close
    const playerQuery = world.query(PositionType, PlayerType);
    playerQuery.forEach((_playerEntity, playerPos) => {
        const playerPosition = playerPos;
        const distance = Math.abs(position.x - playerPosition.x) +
            Math.abs(position.y - playerPosition.y);
        if (distance <= 2) {
            // Switch to aggressive behavior
            _ai.type = "aggressive";
        }
    });
}
function calculateVision(dungeon, centerX, centerY, radius) {
    // Simple line-of-sight calculation
    for (let y = Math.max(0, centerY - radius); y <= Math.min(dungeon.height - 1, centerY + radius); y++) {
        for (let x = Math.max(0, centerX - radius); x <= Math.min(dungeon.width - 1, centerX + radius); x++) {
            const distance = Math.abs(x - centerX) + Math.abs(y - centerY);
            if (distance <= radius) {
                if (hasLineOfSight(dungeon, centerX, centerY, x, y)) {
                    dungeon.tiles[y][x].visible = true;
                    dungeon.tiles[y][x].explored = true;
                }
            }
        }
    }
}
function hasLineOfSight(dungeon, x1, y1, x2, y2) {
    // Simple line-of-sight using Bresenham's line algorithm
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    let x = x1;
    let y = y1;
    while (true) {
        if (dungeon.tiles[y][x].type === "wall") {
            return false;
        }
        if (x === x2 && y === y2) {
            break;
        }
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
    return true;
}
function addMessage(messageLog, text, color) {
    messageLog.messages.push({
        text,
        color,
        timestamp: Date.now(),
    });
    // Keep only the last maxMessages
    if (messageLog.messages.length > messageLog.maxMessages) {
        messageLog.messages.shift();
    }
}
