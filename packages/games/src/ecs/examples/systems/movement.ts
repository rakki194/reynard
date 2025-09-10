// Movement and physics systems

import { World } from "../../types";
import {
  GameTime,
  GameTimeType,
  Position,
  PositionType,
  Velocity,
  VelocityType,
} from "../components";

/**
 * Movement system - updates entity positions based on velocity.
 */
export function movementSystem(world: World): void {
  const gameTime = world.getResource(GameTimeType) as GameTime;
  if (!gameTime) return;

  const query = world.query(PositionType, VelocityType);
  query.forEach((_entity, position, velocity) => {
    const pos = position as Position;
    const vel = velocity as Velocity;
    pos.x += vel.x * gameTime.deltaTime;
    pos.y += vel.y * gameTime.deltaTime;
  });
}
