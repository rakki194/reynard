/**
 * @fileoverview Tests for ECS Archetype system - entity storage optimization and component layout management.
 *
 * These tests verify the archetype system can efficiently group entities with the same
 * component layout and provide fast access to component data.
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  Component,
  ComponentType,
  StorageType,
  World
} from "../types";
import { createWorld } from "../world";

// Test components
class Position implements Component {
  readonly __component = true;
  constructor(
    public x: number,
    public y: number,
  ) { }
}

class Velocity implements Component {
  readonly __component = true;
  constructor(
    public x: number,
    public y: number,
  ) { }
}

class Health implements Component {
  readonly __component = true;
  constructor(
    public current: number,
    public maximum: number,
  ) { }
}

class Player implements Component {
  readonly __component = true;
  constructor(public name: string) { }
}

class Enemy implements Component {
  readonly __component = true;
  constructor(public type: string) { }
}

// Component types - will be initialized in beforeEach
let PositionType: ComponentType<Position>;
let VelocityType: ComponentType<Velocity>;
let HealthType: ComponentType<Health>;
let PlayerType: ComponentType<Player>;
let EnemyType: ComponentType<Enemy>;

describe("Archetype System", () => {
  let world: World;

  beforeEach(() => {
    world = createWorld();

    // Register component types
    world.getComponentRegistry().register("Position", StorageType.Table, () => new Position(0, 0));
    world.getComponentRegistry().register("Velocity", StorageType.Table, () => new Velocity(0, 0));
    world.getComponentRegistry().register("Health", StorageType.SparseSet, () => new Health(100, 100));
    world.getComponentRegistry().register("Player", StorageType.SparseSet, () => new Player("Player"));
    world.getComponentRegistry().register("Enemy", StorageType.SparseSet, () => new Enemy("basic"));

    // Get the registered component types
    PositionType = world.getComponentRegistry().getByName("Position")!;
    VelocityType = world.getComponentRegistry().getByName("Velocity")!;
    HealthType = world.getComponentRegistry().getByName("Health")!;
    PlayerType = world.getComponentRegistry().getByName("Player")!;
    EnemyType = world.getComponentRegistry().getByName("Enemy")!;
  });

  describe("Archetype Creation", () => {
    it("should create archetypes for different component combinations", () => {
      // Create entities with different component combinations
      const entity1 = world.spawn();
      world.add(entity1, PositionType, new Position(0, 0));

      const entity2 = world.spawn();
      world.add(entity2, PositionType, new Position(10, 10));
      world.add(entity2, VelocityType, new Velocity(5, 5));

      const entity3 = world.spawn();
      world.add(entity3, PositionType, new Position(20, 20));
      world.add(entity3, VelocityType, new Velocity(10, 10));
      world.add(entity3, HealthType, new Health(100, 100));

      // Each entity should be in a different archetype
      const archetype1 = world.getArchetype(entity1);
      const archetype2 = world.getArchetype(entity2);
      const archetype3 = world.getArchetype(entity3);

      expect(archetype1).toBeDefined();
      expect(archetype2).toBeDefined();
      expect(archetype3).toBeDefined();

      expect(archetype1).not.toBe(archetype2);
      expect(archetype2).not.toBe(archetype3);
      expect(archetype1).not.toBe(archetype3);
    });

    it("should reuse archetypes for entities with same component layout", () => {
      // Create entities with same component combination
      const entity1 = world.spawn();
      world.add(entity1, PositionType, new Position(0, 0));
      world.add(entity1, VelocityType, new Velocity(5, 5));

      const entity2 = world.spawn();
      world.add(entity2, PositionType, new Position(10, 10));
      world.add(entity2, VelocityType, new Velocity(10, 10));

      // Both entities should be in the same archetype
      const archetype1 = world.getArchetype(entity1);
      const archetype2 = world.getArchetype(entity2);

      expect(archetype1).toBe(archetype2);
    });

    it("should handle empty archetypes (entities with no components)", () => {
      const entity = world.spawn();
      const archetype = world.getArchetype(entity);

      expect(archetype).toBeDefined();
      expect(archetype.getComponentCount()).toBe(0);
    });
  });

  describe("Archetype Component Layout", () => {
    it("should track component types in archetype", () => {
      const entity = world.spawn();
      world.add(entity, PositionType, new Position(0, 0));
      world.add(entity, VelocityType, new Velocity(5, 5));
      world.add(entity, HealthType, new Health(100, 100));

      const archetype = world.getArchetype(entity);

      expect(archetype.hasComponent(PositionType)).toBe(true);
      expect(archetype.hasComponent(VelocityType)).toBe(true);
      expect(archetype.hasComponent(HealthType)).toBe(true);
      expect(archetype.hasComponent(PlayerType)).toBe(false);
    });

    it("should provide component type information", () => {
      const entity = world.spawn();
      world.add(entity, PositionType, new Position(0, 0));
      world.add(entity, VelocityType, new Velocity(5, 5));

      const archetype = world.getArchetype(entity);
      const componentTypes = archetype.getComponentTypes();

      expect(componentTypes).toHaveLength(2);
      expect(componentTypes).toContain(PositionType);
      expect(componentTypes).toContain(VelocityType);
    });

    it("should handle component type ordering", () => {
      const entity1 = world.spawn();
      world.add(entity1, PositionType, new Position(0, 0));
      world.add(entity1, VelocityType, new Velocity(5, 5));

      const entity2 = world.spawn();
      world.add(entity2, VelocityType, new Velocity(10, 10));
      world.add(entity2, PositionType, new Position(20, 20));

      // Both entities should be in the same archetype despite different addition order
      const archetype1 = world.getArchetype(entity1);
      const archetype2 = world.getArchetype(entity2);

      expect(archetype1).toBe(archetype2);
    });
  });

  describe("Archetype Entity Management", () => {
    it("should track entities in archetype", () => {
      const entity1 = world.spawn();
      world.add(entity1, PositionType, new Position(0, 0));

      const entity2 = world.spawn();
      world.add(entity2, PositionType, new Position(10, 10));

      const archetype = world.getArchetype(entity1);

      expect(archetype.getEntityCount()).toBe(2);
      expect(archetype.hasEntity(entity1)).toBe(true);
      expect(archetype.hasEntity(entity2)).toBe(true);
    });

    it("should remove entities from archetype when despawned", () => {
      const entity = world.spawn();
      world.add(entity, PositionType, new Position(0, 0));

      const archetype = world.getArchetype(entity);
      expect(archetype.getEntityCount()).toBe(1);
      expect(archetype.hasEntity(entity)).toBe(true);

      world.despawn(entity);

      expect(archetype.getEntityCount()).toBe(0);
      expect(archetype.hasEntity(entity)).toBe(false);
    });

    it("should move entities between archetypes when components change", () => {
      const entity = world.spawn();
      world.add(entity, PositionType, new Position(0, 0));

      const archetype1 = world.getArchetype(entity);
      expect(archetype1.getEntityCount()).toBe(1);

      // Add another component
      world.add(entity, VelocityType, new Velocity(5, 5));

      const archetype2 = world.getArchetype(entity);
      expect(archetype2).not.toBe(archetype1);
      expect(archetype2.getEntityCount()).toBe(1);
      expect(archetype1.getEntityCount()).toBe(0);
    });

    it("should handle component removal", () => {
      const entity = world.spawn();
      world.add(entity, PositionType, new Position(0, 0));
      world.add(entity, VelocityType, new Velocity(5, 5));

      const archetype1 = world.getArchetype(entity);
      expect(archetype1.getEntityCount()).toBe(1);

      // Remove a component
      world.remove(entity, VelocityType);

      const archetype2 = world.getArchetype(entity);
      expect(archetype2).not.toBe(archetype1);
      expect(archetype2.getEntityCount()).toBe(1);
      expect(archetype1.getEntityCount()).toBe(0);
    });
  });

  describe("Archetype Performance", () => {
    it("should handle many entities efficiently", () => {
      const entities: any[] = [];

      // Create many entities with different component combinations
      for (let i = 0; i < 1000; i++) {
        const entity = world.spawn();
        world.add(entity, PositionType, new Position(i, i));

        if (i % 2 === 0) {
          world.add(entity, VelocityType, new Velocity(i, i));
        }

        if (i % 3 === 0) {
          world.add(entity, HealthType, new Health(100, 100));
        }

        entities.push(entity);
      }

      const startTime = performance.now();

      // Check archetype for each entity
      entities.forEach((entity) => {
        const archetype = world.getArchetype(entity);
        expect(archetype).toBeDefined();
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should efficiently group entities with same components", () => {
      // Create entities with same component combination
      const entities: any[] = [];

      for (let i = 0; i < 1000; i++) {
        const entity = world.spawn();
        world.add(entity, PositionType, new Position(i, i));
        world.add(entity, VelocityType, new Velocity(i, i));
        entities.push(entity);
      }

      // All entities should be in the same archetype
      const archetype = world.getArchetype(entities[0]);

      entities.forEach((entity) => {
        expect(world.getArchetype(entity)).toBe(archetype);
      });

      expect(archetype.getEntityCount()).toBe(1000);
    });

    it("should handle archetype lookups efficiently", () => {
      // Create entities with different component combinations
      const entities: any[] = [];

      for (let i = 0; i < 1000; i++) {
        const entity = world.spawn();
        world.add(entity, PositionType, new Position(i, i));

        if (i % 2 === 0) {
          world.add(entity, VelocityType, new Velocity(i, i));
        }

        entities.push(entity);
      }

      const startTime = performance.now();

      // Perform many archetype lookups
      for (let i = 0; i < 10000; i++) {
        const entity = entities[i % entities.length];
        const archetype = world.getArchetype(entity);
        expect(archetype).toBeDefined();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(200); // Should complete in under 200ms
    });
  });

  describe("Archetype Storage", () => {
    it("should store components in correct order", () => {
      const entity = world.spawn();
      world.add(entity, PositionType, new Position(10, 20));
      world.add(entity, VelocityType, new Velocity(5, 10));
      world.add(entity, HealthType, new Health(100, 100));

      const archetype = world.getArchetype(entity);
      const componentTypes = archetype.getComponentTypes();

      // Components should be stored in a consistent order
      expect(componentTypes[0]).toBe(PositionType);
      expect(componentTypes[1]).toBe(VelocityType);
      expect(componentTypes[2]).toBe(HealthType);
    });

    it("should handle sparse set components correctly", () => {
      const entity = world.spawn();
      world.add(entity, PositionType, new Position(0, 0));
      world.add(entity, HealthType, new Health(100, 100));

      const archetype = world.getArchetype(entity);

      expect(archetype.hasComponent(PositionType)).toBe(true);
      expect(archetype.hasComponent(HealthType)).toBe(true);

      // Sparse set components should be handled correctly
      const componentTypes = archetype.getComponentTypes();
      expect(componentTypes).toContain(PositionType);
      expect(componentTypes).toContain(HealthType);
    });

    it("should maintain component data integrity", () => {
      const entity = world.spawn();
      const position = new Position(10, 20);
      const velocity = new Velocity(5, 10);

      world.add(entity, PositionType, position);
      world.add(entity, VelocityType, velocity);

      const archetype = world.getArchetype(entity);

      // Component data should be accessible and correct
      const retrievedPosition = world.get(entity, PositionType);
      const retrievedVelocity = world.get(entity, VelocityType);

      expect(retrievedPosition).toBe(position);
      expect(retrievedVelocity).toBe(velocity);
      expect(retrievedPosition.x).toBe(10);
      expect(retrievedPosition.y).toBe(20);
      expect(retrievedVelocity.x).toBe(5);
      expect(retrievedVelocity.y).toBe(10);
    });
  });

  describe("Archetype Edge Cases", () => {
    it("should handle entities with no components", () => {
      const entity = world.spawn();
      const archetype = world.getArchetype(entity);

      expect(archetype).toBeDefined();
      expect(archetype.getComponentCount()).toBe(0);
      expect(archetype.getEntityCount()).toBe(1);
    });

    it("should handle entities with all components", () => {
      const entity = world.spawn();
      world.add(entity, PositionType, new Position(0, 0));
      world.add(entity, VelocityType, new Velocity(0, 0));
      world.add(entity, HealthType, new Health(100, 100));
      world.add(entity, PlayerType, new Player("Test"));
      world.add(entity, EnemyType, new Enemy("basic"));

      const archetype = world.getArchetype(entity);

      expect(archetype.getComponentCount()).toBe(5);
      expect(archetype.hasComponent(PositionType)).toBe(true);
      expect(archetype.hasComponent(VelocityType)).toBe(true);
      expect(archetype.hasComponent(HealthType)).toBe(true);
      expect(archetype.hasComponent(PlayerType)).toBe(true);
      expect(archetype.hasComponent(EnemyType)).toBe(true);
    });

    it("should handle rapid component additions and removals", () => {
      const entity = world.spawn();

      // Rapidly add and remove components
      for (let i = 0; i < 100; i++) {
        world.add(entity, PositionType, new Position(i, i));
        world.add(entity, VelocityType, new Velocity(i, i));

        if (i % 2 === 0) {
          world.add(entity, HealthType, new Health(100, 100));
        }

        if (i % 3 === 0) {
          world.remove(entity, HealthType);
        }

        if (i % 4 === 0) {
          world.remove(entity, VelocityType);
        }
      }

      // Entity should still be valid
      expect(world.isAlive(entity)).toBe(true);

      const archetype = world.getArchetype(entity);
      expect(archetype).toBeDefined();
      expect(archetype.hasComponent(PositionType)).toBe(true);
    });

    it("should handle archetype cleanup when empty", () => {
      const entity = world.spawn();
      world.add(entity, PositionType, new Position(0, 0));

      const archetype = world.getArchetype(entity);
      expect(archetype.getEntityCount()).toBe(1);

      world.despawn(entity);

      // Archetype should be empty but still exist
      expect(archetype.getEntityCount()).toBe(0);
    });
  });

  describe("Archetype Integration", () => {
    it("should work with query system", () => {
      // Create entities with different component combinations
      const entity1 = world.spawn();
      world.add(entity1, PositionType, new Position(0, 0));
      world.add(entity1, VelocityType, new Velocity(5, 5));

      const entity2 = world.spawn();
      world.add(entity2, PositionType, new Position(10, 10));
      world.add(entity2, HealthType, new Health(100, 100));

      const entity3 = world.spawn();
      world.add(entity3, PositionType, new Position(20, 20));
      world.add(entity3, VelocityType, new Velocity(10, 10));
      world.add(entity3, HealthType, new Health(50, 100));

      // Query should work correctly with archetypes
      const query = world.query(PositionType, VelocityType);
      const results: any[] = [];

      query.forEach((entity, position, velocity) => {
        results.push({ entity, position, velocity });
      });

      expect(results).toHaveLength(2); // entity1 and entity3
      expect(results[0].position.x).toBe(0);
      expect(results[1].position.x).toBe(20);
    });

    it("should work with system execution", () => {
      // Create entities
      const entity1 = world.spawn();
      world.add(entity1, PositionType, new Position(0, 0));
      world.add(entity1, VelocityType, new Velocity(5, 5));

      const entity2 = world.spawn();
      world.add(entity2, PositionType, new Position(10, 10));
      world.add(entity2, VelocityType, new Velocity(10, 10));

      // System should work with archetypes
      const movementSystem = (world: World) => {
        const query = world.query(PositionType, VelocityType);
        query.forEach((entity, position, velocity) => {
          position.x += velocity.x * 0.016;
          position.y += velocity.y * 0.016;
        });
      };

      movementSystem(world);

      // Check that positions were updated
      const pos1 = world.get(entity1, PositionType);
      const pos2 = world.get(entity2, PositionType);

      expect(pos1.x).toBeCloseTo(0.08, 2); // 0 + 5 * 0.016
      expect(pos1.y).toBeCloseTo(0.08, 2);
      expect(pos2.x).toBeCloseTo(10.16, 2); // 10 + 10 * 0.016
      expect(pos2.y).toBeCloseTo(10.16, 2);
    });
  });
});
