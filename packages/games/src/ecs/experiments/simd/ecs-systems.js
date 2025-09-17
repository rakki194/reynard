// ECS system definitions for benchmark
import { createComponentType, system } from "../../index.js";
// Define components for Reynard ECS
const Position = createComponentType("Position");
const Velocity = createComponentType("Velocity");
const Acceleration = createComponentType("Acceleration");
const Mass = createComponentType("Mass");
export class ECSSystems {
    static createPositionUpdateSystem() {
        return system("positionUpdateSystem", (world) => {
            const queryResult = world.query(Position, Velocity, Acceleration, Mass);
            queryResult.forEach((entity, pos, vel, acc, _mass) => {
                const position = pos;
                const velocity = vel;
                const acceleration = acc;
                // Update velocity
                velocity.vx += acceleration.ax * 0.016; // Fixed delta time for now
                velocity.vy += acceleration.ay * 0.016;
                // Update position
                position.x += velocity.vx * 0.016;
                position.y += velocity.vy * 0.016;
            });
        });
    }
    static createCollisionSystem() {
        return system("collisionSystem", (world) => {
            const query = world.query(Position);
            const collisions = [];
            const entities = [];
            const positions = [];
            // Collect entities and positions
            query.forEach((entity, position) => {
                entities.push(entity);
                positions.push(position);
            });
            for (let i = 0; i < entities.length; i++) {
                for (let j = i + 1; j < entities.length; j++) {
                    const dx = positions[i].x - positions[j].x;
                    const dy = positions[i].y - positions[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 20) {
                        // Fixed radius for now
                        collisions.push(i, j);
                    }
                }
            }
        });
    }
    static createSpatialQuerySystem() {
        return system("spatialQuerySystem", (world) => {
            const query = world.query(Position);
            const results = [];
            const entities = [];
            const positions = [];
            const queryX = 0;
            const queryY = 0;
            const radius = 100;
            // Collect entities and positions
            query.forEach((entity, position) => {
                entities.push(entity);
                positions.push(position);
            });
            for (let i = 0; i < entities.length; i++) {
                const dx = positions[i].x - queryX;
                const dy = positions[i].y - queryY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < radius) {
                    results.push(i);
                }
            }
        });
    }
}
