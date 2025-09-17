// Lifecycle and damage systems
import { HealthType, DamageType, LifetimeType, GameTimeType, } from "../components";
/**
 * Lifetime system - removes entities when their lifetime expires.
 */
export function lifetimeSystem(world) {
    const gameTime = world.getResource(GameTimeType);
    if (!gameTime)
        return;
    const query = world.query(LifetimeType);
    const entitiesToRemove = [];
    query.forEach((entity, lifetime) => {
        const lt = lifetime;
        lt.remaining -= gameTime.deltaTime;
        if (lt.remaining <= 0) {
            entitiesToRemove.push(entity);
        }
    });
    // Remove expired entities
    for (const entity of entitiesToRemove) {
        world.despawn(entity);
    }
}
/**
 * Damage system - applies damage to entities and removes them if health reaches zero.
 */
export function damageSystem(world) {
    const query = world.query(HealthType, DamageType);
    const entitiesToRemove = [];
    query.forEach((entity, health, damage) => {
        const h = health;
        const d = damage;
        h.current -= d.amount;
        if (h.current <= 0) {
            entitiesToRemove.push(entity);
        }
    });
    // Remove dead entities
    for (const entity of entitiesToRemove) {
        world.despawn(entity);
    }
}
