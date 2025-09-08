// Movement and physics systems

import { World } from '../../types';
import { 
  Position, 
  Velocity, 
  GameTime,
  PositionType,
  VelocityType,
  GameTimeType
} from '../components';

/**
 * Movement system - updates entity positions based on velocity.
 */
export function movementSystem(world: World): void {
  const gameTime = world.getResource(GameTimeType) as GameTime;
  if (!gameTime) return;

  const query = world.query(PositionType, VelocityType);
  query.forEach((entity, position, velocity) => {
    const pos = position as Position;
    const vel = velocity as Velocity;
    pos.x += vel.x * gameTime.deltaTime;
    pos.y += vel.y * gameTime.deltaTime;
  });
}
