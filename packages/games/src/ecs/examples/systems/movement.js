// Movement and physics systems
import { GameTimeType, PositionType, VelocityType, } from "../components";
/**
 * Movement system - updates entity positions based on velocity.
 */
export function movementSystem(world) {
    const gameTime = world.getResource(GameTimeType);
    if (!gameTime)
        return;
    const query = world.query(PositionType, VelocityType);
    query.forEach((_entity, position, velocity) => {
        const pos = position;
        const vel = velocity;
        pos.x += vel.x * gameTime.deltaTime;
        pos.y += vel.y * gameTime.deltaTime;
    });
}
