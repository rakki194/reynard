// Input and player control systems

import { World } from "../../types";
import {
  Position,
  Velocity,
  InputState,
  Player,
  Bullet,
  Lifetime,
  PositionType,
  VelocityType,
  PlayerType,
  InputStateType,
} from "../components";

/**
 * Player input system - handles player movement based on input.
 */
export function playerInputSystem(world: World): void {
  const inputState = world.getResource(InputStateType) as InputState;
  if (!inputState) return;

  const query = world.query(PlayerType, VelocityType);
  const speed = 200; // pixels per second

  query.forEach((entity, player, velocity) => {
    const vel = velocity as Velocity;
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
export function shootingSystem(world: World): void {
  const inputState = world.getResource(InputStateType) as InputState;
  if (!inputState) return;

  const query = world.query(PlayerType, PositionType);
  const bulletSpeed = 300; // pixels per second

  query.forEach((entity, player, position) => {
    const pos = position as Position;
    if (inputState.keys.has("Space")) {
      // Create bullet
      const bullet = world.spawn(
        new Position(pos.x, pos.y),
        new Velocity(0, -bulletSpeed),
        new Bullet(bulletSpeed),
        new Lifetime(3), // 3 second lifetime
      );
    }
  });
}
