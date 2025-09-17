// Input and player control systems
import { Bullet, InputStateType, Lifetime, PlayerType, Position, PositionType, Velocity, VelocityType, } from "../components";
/**
 * Player input system - handles player movement based on input.
 */
export function playerInputSystem(world) {
    const inputState = world.getResource(InputStateType);
    if (!inputState)
        return;
    const query = world.query(PlayerType, VelocityType);
    const speed = 200; // pixels per second
    query.forEach((_entity, _player, velocity) => {
        const vel = velocity;
        // Reset velocity
        vel.x = 0;
        vel.y = 0;
        // Apply movement based on input
        if (inputState.keys.has("ArrowLeft") || inputState.keys.has("KeyA")) {
            vel.x = -speed;
        }
        if (inputState.keys.has("ArrowRight") || inputState.keys.has("KeyD")) {
            vel.x = speed;
        }
        if (inputState.keys.has("ArrowUp") || inputState.keys.has("KeyW")) {
            vel.y = -speed;
        }
        if (inputState.keys.has("ArrowDown") || inputState.keys.has("KeyS")) {
            vel.y = speed;
        }
    });
}
/**
 * Shooting system - creates bullets when player shoots.
 */
export function shootingSystem(world) {
    const inputState = world.getResource(InputStateType);
    if (!inputState)
        return;
    const query = world.query(PlayerType, PositionType);
    const bulletSpeed = 300; // pixels per second
    query.forEach((_entity, _player, position) => {
        const pos = position;
        if (inputState.keys.has("Space")) {
            // Create bullet
            world.spawn(new Position(pos.x, pos.y), new Velocity(0, -bulletSpeed), new Bullet(bulletSpeed), new Lifetime(3));
        }
    });
}
