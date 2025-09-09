// Lifecycle and damage systems

import { World } from "../../types";
import {
  Health,
  Damage,
  Lifetime,
  GameTime,
  HealthType,
  DamageType,
  LifetimeType,
  GameTimeType,
} from "../components";

/**
 * Lifetime system - removes entities when their lifetime expires.
 */
export function lifetimeSystem(world: World): void {
  const gameTime = world.getResource(GameTimeType) as GameTime;
  if (!gameTime) return;

  const query = world.query(LifetimeType);
  const entitiesToRemove: any[] = [];

  query.forEach((entity, lifetime) => {
    const lt = lifetime as Lifetime;
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
export function damageSystem(world: World): void {
  const query = world.query(HealthType, DamageType);
  const entitiesToRemove: any[] = [];

  query.forEach((entity, health, damage) => {
    const h = health as Health;
    const d = damage as Damage;
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
