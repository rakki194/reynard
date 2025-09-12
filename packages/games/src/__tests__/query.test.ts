/**
 * @fileoverview Tests for ECS Query system - component filtering, iteration, and performance.
 *
 * These tests verify the query system can efficiently find entities with specific
 * component combinations and apply various filters.
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { beforeEach, describe, expect, it } from "vitest";
import { Component, ComponentType, StorageType, World } from "../../types";
import { createWorld } from "../../world";

// Test components
class Position implements Component {
  readonly __component = true;
  constructor(
    public x: number,
    public y: number,
  ) {}
}

class Velocity implements Component {
  readonly __component = true;
  constructor(
    public x: number,
    public y: number,
  ) {}
}

class Health implements Component {
  readonly __component = true;
  constructor(
    public current: number,
    public maximum: number,
  ) {}
}

class Player implements Component {
  readonly __component = true;
  constructor(public name: string) {}
}

class Enemy implements Component {
  readonly __component = true;
  constructor(public type: string) {}
}

class Bullet implements Component {
  readonly __component = true;
  constructor(public speed: number) {}
}

class Renderable implements Component {
  readonly __component = true;
  constructor(public shape: "circle" | "rectangle" | "triangle") {}
}

// Component types
// Component types will be created dynamically in beforeEach

describe("Query System", () => {
  let world: World;
  let PositionType: ComponentType<Position>;
  let VelocityType: ComponentType<Velocity>;
  let HealthType: ComponentType<Health>;
  let PlayerType: ComponentType<Player>;
  let EnemyType: ComponentType<Enemy>;
  let BulletType: ComponentType<Bullet>;
  let RenderableType: ComponentType<Renderable>;

  beforeEach(() => {
    world = createWorld();

    // Register all component types and get the type objects
    PositionType = world
      .getComponentRegistry()
      .register("Position", StorageType.Table, () => new Position(0, 0));
    VelocityType = world
      .getComponentRegistry()
      .register("Velocity", StorageType.Table, () => new Velocity(0, 0));
    HealthType = world
      .getComponentRegistry()
      .register("Health", StorageType.SparseSet, () => new Health(100, 100));
    PlayerType = world
      .getComponentRegistry()
      .register("Player", StorageType.SparseSet, () => new Player("Player"));
    EnemyType = world
      .getComponentRegistry()
      .register("Enemy", StorageType.SparseSet, () => new Enemy("Enemy"));
    BulletType = world
      .getComponentRegistry()
      .register("Bullet", StorageType.SparseSet, () => new Bullet(300));
    RenderableType = world
      .getComponentRegistry()
      .register(
        "Renderable",
        StorageType.Table,
        () => new Renderable("circle"),
      );

    // Create test entities with various component combinations
    setupTestEntities();
  });

  function setupTestEntities() {
    // Player entity
    const player = world.spawn();
    world.insert(player, new Position(100, 100));
    world.insert(player, new Velocity(0, 0));
    world.insert(player, new Health(100, 100));
    world.insert(player, new Player("TestPlayer"));
    world.insert(player, new Renderable("circle"));

    // Enemy entities
    const enemy1 = world.spawn();
    world.insert(enemy1, new Position(200, 200));
    world.insert(enemy1, new Velocity(10, 10));
    world.insert(enemy1, new Health(50, 50));
    world.insert(enemy1, new Enemy("basic"));
    world.insert(enemy1, new Renderable("rectangle"));

    const enemy2 = world.spawn();
    world.insert(enemy2, new Position(300, 300));
    world.insert(enemy2, new Velocity(15, 15));
    world.insert(enemy2, new Enemy("advanced"));

    // Bullet entities
    const bullet1 = world.spawn();
    world.insert(bullet1, new Position(150, 150));
    world.insert(bullet1, new Velocity(20, 0));
    world.insert(bullet1, new Bullet(300));

    const bullet2 = world.spawn();
    world.insert(bullet2, new Position(250, 250));
    world.insert(bullet2, new Velocity(0, 20));
    world.insert(bullet2, new Bullet(400));

    // Entity with only position
    const staticEntity = world.spawn();
    world.insert(staticEntity, new Position(400, 400));
    world.insert(staticEntity, new Renderable("triangle"));

    // Entity with only health (sparse set)
    const healthOnly = world.spawn();
    world.insert(healthOnly, new Health(25, 25));
  }

  describe("Basic Queries", () => {
    it("should query entities with single component", () => {
      const query = world.query(PositionType);
      const results: any[] = [];

      query.forEach((entity, position) => {
        results.push({ entity, position });
      });

      expect(results).toHaveLength(6); // All entities have position
      expect(results.every((r) => r.position instanceof Position)).toBe(true);
    });

    it("should query entities with multiple components", () => {
      const query = world.query(PositionType, VelocityType);
      const results: any[] = [];

      query.forEach((entity, position, velocity) => {
        results.push({ entity, position, velocity });
      });

      expect(results).toHaveLength(5); // Player, enemy1, enemy2, bullet1, bullet2
      expect(results.every((r) => r.position instanceof Position)).toBe(true);
      expect(results.every((r) => r.velocity instanceof Velocity)).toBe(true);
    });

    it("should query entities with sparse set components", () => {
      const query = world.query(HealthType);
      const results: any[] = [];

      query.forEach((entity, health) => {
        results.push({ entity, health });
      });

      expect(results).toHaveLength(3); // Player, enemy1, healthOnly
      expect(results.every((r) => r.health instanceof Health)).toBe(true);
    });

    it("should query entities with mixed storage types", () => {
      const query = world.query(PositionType, HealthType);
      const results: any[] = [];

      query.forEach((entity, position, health) => {
        results.push({ entity, position, health });
      });

      expect(results).toHaveLength(2); // Player, enemy1
      expect(results.every((r) => r.position instanceof Position)).toBe(true);
      expect(results.every((r) => r.health instanceof Health)).toBe(true);
    });
  });

  describe("Query Filters", () => {
    it("should filter entities with specific components", () => {
      const query = world.queryFiltered([PositionType], { with: [PlayerType] });
      const results: any[] = [];

      query.forEach((entity, position) => {
        results.push({ entity, position });
      });

      expect(results).toHaveLength(1);
      expect(results[0].position.x).toBe(100); // Player position
    });

    it("should filter entities without specific components", () => {
      const query = world.queryFiltered([PositionType], {
        without: [PlayerType],
      });
      const results: any[] = [];

      query.forEach((entity, position) => {
        results.push({ entity, position });
      });

      expect(results).toHaveLength(5); // All except player
      expect(results.every((r) => r.position.x !== 100)).toBe(true);
    });

    it("should filter entities with multiple required components", () => {
      const query = world.queryFiltered([PositionType], {
        with: [EnemyType, VelocityType],
      });
      const results: any[] = [];

      query.forEach((entity, position) => {
        results.push({ entity, position });
      });

      expect(results).toHaveLength(2); // enemy1, enemy2
      expect(results.every((r) => r.position.x >= 200)).toBe(true);
    });

    it("should filter entities without multiple components", () => {
      const query = world.queryFiltered([PositionType], {
        without: [EnemyType, BulletType],
      });
      const results: any[] = [];

      query.forEach((entity, position) => {
        results.push({ entity, position });
      });

      expect(results).toHaveLength(2); // player, staticEntity
      expect(results.some((r) => r.position.x === 100)).toBe(true); // player
      expect(results.some((r) => r.position.x === 400)).toBe(true); // staticEntity
    });

    it("should combine with and without filters", () => {
      const query = world.queryFiltered([PositionType], {
        with: [VelocityType],
        without: [PlayerType],
      });
      const results: any[] = [];

      query.forEach((entity, position) => {
        results.push({ entity, position });
      });

      expect(results).toHaveLength(4); // enemy1, enemy2, bullet1, bullet2
      expect(results.every((r) => r.position.x !== 100)).toBe(true); // not player
    });
  });

  describe("Change Detection Queries", () => {
    it("should query entities with added components", () => {
      // First, run a query to establish baseline
      world.query(PositionType).forEach(() => {});

      // Advance tick to establish baseline for change detection
      world.getChangeDetection().advanceTick();

      // Add a new component to an existing entity
      const staticEntity = world
        .queryFiltered([PositionType], { without: [VelocityType] })
        .first();
      if (staticEntity) {
        world.add(staticEntity.entity, VelocityType, new Velocity(5, 5));
      }

      const addedQuery = world.query(PositionType).added(VelocityType);
      const results: any[] = [];

      addedQuery.forEach((entity, position) => {
        results.push({ entity, position });
      });

      expect(results).toHaveLength(1);
      expect(results[0].position.x).toBe(400); // staticEntity
    });

    it("should query entities with changed components", () => {
      // First, run a query to establish baseline
      world.query(PositionType).forEach(() => {});

      // Advance tick to establish baseline for change detection
      world.getChangeDetection().advanceTick();

      // Modify a component
      const player = world
        .queryFiltered([PositionType], { with: [PlayerType] })
        .first();
      if (player) {
        const position = world.get(player.entity, PositionType);
        position.x = 150;
        position.y = 150;

        // Mark component as changed
        world.getChangeDetection().markChanged(player.entity, PositionType);
      }

      const changedQuery = world.query(PositionType).changed(PositionType);
      const results: any[] = [];

      changedQuery.forEach((entity, position) => {
        results.push({ entity, position });
      });

      expect(results).toHaveLength(1);
      expect(results[0].position.x).toBe(150);
    });
  });

  describe("Query Iteration", () => {
    it("should iterate over query results correctly", () => {
      const query = world.query(PositionType, VelocityType);
      const positions: number[] = [];
      const velocities: number[] = [];

      query.forEach((entity, position, velocity) => {
        positions.push(position.x);
        velocities.push(velocity.x);
      });

      expect(positions).toHaveLength(5);
      expect(velocities).toHaveLength(5);
      expect(positions).toEqual([100, 200, 300, 150, 250]);
      expect(velocities).toEqual([0, 10, 15, 20, 0]);
    });

    it("should support early termination in iteration", () => {
      const query = world.query(PositionType);
      let count = 0;

      query.forEach((entity, position) => {
        count++;
        if (count >= 3) {
          return false; // Early termination
        }
      });

      expect(count).toBe(3);
    });

    it("should handle empty query results", () => {
      const query = world.queryFiltered([PositionType], {
        with: [PlayerType, EnemyType],
      });
      const results: any[] = [];

      query.forEach((entity, position) => {
        results.push({ entity, position });
      });

      expect(results).toHaveLength(0); // No entity has both Player and Enemy
    });

    it("should provide access to entity in iteration", () => {
      const query = world.queryFiltered([PositionType], { with: [PlayerType] });
      let foundEntity = null;

      query.forEach((entity, position) => {
        foundEntity = entity;
      });

      expect(foundEntity).toBeDefined();
      expect(world.has(foundEntity, PlayerType)).toBe(true);
    });
  });

  describe("Query Performance", () => {
    it("should handle large numbers of entities efficiently", () => {
      // Create many entities
      for (let i = 0; i < 1000; i++) {
        const entity = world.spawn();
        world.insert(entity, new Position(i, i));

        if (i % 2 === 0) {
          world.insert(entity, new Velocity(i, i));
        }

        if (i % 3 === 0) {
          world.insert(entity, new Health(100, 100));
        }
      }

      const startTime = performance.now();

      // Query all entities with position
      const positionQuery = world.query(PositionType);
      let positionCount = 0;
      positionQuery.forEach(() => {
        positionCount++;
      });

      // Query entities with position and velocity
      const velocityQuery = world.query(PositionType, VelocityType);
      let velocityCount = 0;
      velocityQuery.forEach(() => {
        velocityCount++;
      });

      // Query entities with position and health
      const healthQuery = world.query(PositionType, HealthType);
      let healthCount = 0;
      healthQuery.forEach(() => {
        healthCount++;
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(positionCount).toBe(1006); // 1000 new + 6 existing
      expect(velocityCount).toBe(505); // 500 new + 5 existing
      expect(healthCount).toBe(336); // 334 new + 2 existing
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should cache query results efficiently", () => {
      const query = world.query(PositionType, VelocityType);

      // First iteration
      const start1 = performance.now();
      let count1 = 0;
      query.forEach(() => {
        count1++;
      });
      const end1 = performance.now();

      // Second iteration (should be faster due to caching)
      const start2 = performance.now();
      let count2 = 0;
      query.forEach(() => {
        count2++;
      });
      const end2 = performance.now();

      expect(count1).toBe(count2);
      expect(end2 - start2).toBeLessThanOrEqual(end1 - start1);
    });
  });

  describe("Query State Management", () => {
    it("should maintain query state across iterations", () => {
      const query = world.query(PositionType);

      // First iteration
      const firstResults: any[] = [];
      query.forEach((entity, position) => {
        firstResults.push({ entity, position });
      });

      // Second iteration
      const secondResults: any[] = [];
      query.forEach((entity, position) => {
        secondResults.push({ entity, position });
      });

      expect(firstResults).toHaveLength(secondResults.length);
      expect(
        firstResults.every(
          (r, i) =>
            r.entity.index === secondResults[i].entity.index &&
            r.position.x === secondResults[i].position.x,
        ),
      ).toBe(true);
    });

    it("should handle query state with component changes", () => {
      const query = world.query(PositionType);

      // First iteration
      let initialCount = 0;
      query.forEach(() => {
        initialCount++;
      });

      // Add a component to an entity
      const staticEntity = world
        .queryFiltered([PositionType], { without: [VelocityType] })
        .first();
      if (staticEntity) {
        world.insert(staticEntity.entity, new Velocity(5, 5));
      }

      // Second iteration should still work
      let finalCount = 0;
      query.forEach(() => {
        finalCount++;
      });

      expect(finalCount).toBe(initialCount); // Same number of entities with position
    });
  });

  describe("Error Handling", () => {
    it("should handle queries on empty world", () => {
      const emptyWorld = createWorld();
      emptyWorld.getComponentRegistry().register(PositionType);

      const query = emptyWorld.query(PositionType);
      const results: any[] = [];

      query.forEach((entity, position) => {
        results.push({ entity, position });
      });

      expect(results).toHaveLength(0);
    });

    it("should handle queries with unregistered component types", () => {
      const unregisteredType = {
        name: "Unregistered",
        id: 999,
        storage: StorageType.Table,
        create: () => ({ __component: true, value: 42 }),
      };

      expect(() => {
        world.query(unregisteredType as any);
      }).not.toThrow();

      const query = world.query(unregisteredType as any);
      const results: any[] = [];

      query.forEach((entity, component) => {
        results.push({ entity, component });
      });

      expect(results).toHaveLength(0);
    });

    it("should handle iteration errors gracefully", () => {
      const query = world.query(PositionType);

      expect(() => {
        query.forEach((entity, position) => {
          if (position.x === 100) {
            throw new Error("Test error");
          }
        });
      }).toThrow("Test error");
    });
  });
});
