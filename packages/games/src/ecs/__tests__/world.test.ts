/**
 * @fileoverview Tests for ECS World system - entity management, component operations, and resource handling.
 *
 * These tests verify the core World functionality including spawning/despawning entities,
 * component management, resource operations, and query capabilities.
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  Component,
  ComponentType,
  Resource,
  ResourceType,
  StorageType,
  World,
} from "../types";
import { createWorld } from "../world";

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

// Test resources
class GameTime implements Resource {
  readonly __resource = true;
  constructor(
    public deltaTime: number,
    public totalTime: number,
  ) {}
}

class GameState implements Resource {
  readonly __resource = true;
  constructor(
    public score: number,
    public level: number,
  ) {}
}

// Component and resource types will be created dynamically in beforeEach

describe("World System", () => {
  let world: World;
  let PositionType: ComponentType<Position>;
  let VelocityType: ComponentType<Velocity>;
  let HealthType: ComponentType<Health>;
  let PlayerType: ComponentType<Player>;
  let GameTimeType: ResourceType<GameTime>;
  let GameStateType: ResourceType<GameState>;

  beforeEach(() => {
    world = createWorld();

    // Register component types and get the type objects
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

    // Register resource types and get the type objects
    GameTimeType = world
      .getResourceRegistry()
      .register("GameTime", () => new GameTime(0, 0));
    GameStateType = world
      .getResourceRegistry()
      .register("GameState", () => new GameState(0, 1));
  });

  describe("Entity Management", () => {
    it("should spawn entities with unique IDs", () => {
      const entity1 = world.spawnEmpty();
      const entity2 = world.spawnEmpty();

      expect(entity1).toBeDefined();
      expect(entity2).toBeDefined();
      expect(entity1.index).not.toBe(entity2.index);
    });

    it("should despawn entities correctly", () => {
      const entity = world.spawnEmpty();
      expect(world.contains(entity)).toBe(true);

      world.despawn(entity);
      expect(world.contains(entity)).toBe(false);
    });

    it("should reuse entity indices after despawn", () => {
      const entity1 = world.spawnEmpty();
      const index1 = entity1.index;

      world.despawn(entity1);
      const entity2 = world.spawnEmpty();

      expect(entity2.index).toBe(index1);
      expect(entity2.generation).toBe(entity1.generation + 1);
    });

    it("should prevent use-after-free with generational indexing", () => {
      const entity1 = world.spawnEmpty();
      const index = entity1.index;
      const generation = entity1.generation;

      world.despawn(entity1);

      // Try to access the old entity - should fail
      expect(world.contains(entity1)).toBe(false);

      // Spawn new entity at same index
      const entity2 = world.spawnEmpty();
      expect(entity2.index).toBe(index);
      expect(entity2.generation).toBe(generation + 1);

      // Old entity should still be invalid
      expect(world.contains(entity1)).toBe(false);
      expect(world.contains(entity2)).toBe(true);
    });

    it("should handle multiple spawn/despawn cycles", () => {
      const entities: any[] = [];

      // Spawn 10 entities
      for (let i = 0; i < 10; i++) {
        entities.push(world.spawnEmpty());
      }

      // Despawn every other entity
      for (let i = 0; i < 10; i += 2) {
        world.despawn(entities[i]);
      }

      // Check alive status
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          expect(world.contains(entities[i])).toBe(false);
        } else {
          expect(world.contains(entities[i])).toBe(true);
        }
      }
    });
  });

  describe("Component Management", () => {
    it("should add components to entities", () => {
      const entity = world.spawnEmpty();
      const position = new Position(10, 20);

      world.insert(entity, position);

      const retrieved = world.get(entity, PositionType);
      expect(retrieved).toBe(position);
      expect(retrieved.x).toBe(10);
      expect(retrieved.y).toBe(20);
    });

    it("should remove components from entities", () => {
      const entity = world.spawnEmpty();
      const position = new Position(10, 20);

      world.insert(entity, position);
      expect(world.get(entity, PositionType)).toBe(position);

      world.remove(entity, PositionType);
      expect(world.get(entity, PositionType)).toBeUndefined();
    });

    it("should check if entity has component", () => {
      const entity = world.spawnEmpty();
      const position = new Position(10, 20);

      expect(world.has(entity, PositionType)).toBe(false);

      world.insert(entity, position);
      expect(world.has(entity, PositionType)).toBe(true);

      world.remove(entity, PositionType);
      expect(world.has(entity, PositionType)).toBe(false);
    });

    it("should handle multiple components per entity", () => {
      const entity = world.spawnEmpty();
      const position = new Position(10, 20);
      const velocity = new Velocity(5, 10);
      const health = new Health(100, 100);

      world.insert(entity, position);
      world.insert(entity, velocity);
      world.insert(entity, health);

      expect(world.has(entity, PositionType)).toBe(true);
      expect(world.has(entity, VelocityType)).toBe(true);
      expect(world.has(entity, HealthType)).toBe(true);

      expect(world.get(entity, PositionType)).toBe(position);
      expect(world.get(entity, VelocityType)).toBe(velocity);
      expect(world.get(entity, HealthType)).toBe(health);
    });

    it("should handle component updates", () => {
      const entity = world.spawnEmpty();
      const position1 = new Position(10, 20);
      const position2 = new Position(30, 40);

      world.insert(entity, position1);
      expect(world.get(entity, PositionType)).toBe(position1);

      world.insert(entity, position2);
      expect(world.get(entity, PositionType)).toBe(position2);
      expect(world.get(entity, PositionType).x).toBe(30);
      expect(world.get(entity, PositionType).y).toBe(40);
    });

    it("should handle sparse set storage correctly", () => {
      const entity1 = world.spawnEmpty();
      const entity2 = world.spawnEmpty();
      const entity3 = world.spawnEmpty();

      const health1 = new Health(100, 100);
      const health3 = new Health(50, 100);

      // Add health to entities 1 and 3, skip entity 2
      world.insert(entity1, health1);
      world.insert(entity3, health3);

      expect(world.has(entity1, HealthType)).toBe(true);
      expect(world.has(entity2, HealthType)).toBe(false);
      expect(world.has(entity3, HealthType)).toBe(true);

      expect(world.get(entity1, HealthType)).toBe(health1);
      expect(world.get(entity2, HealthType)).toBeUndefined();
      expect(world.get(entity3, HealthType)).toBe(health3);
    });
  });

  describe("Resource Management", () => {
    it("should add resources to world", () => {
      const gameTime = new GameTime(16.67, 1000);
      world.insertResource(gameTime);

      const retrieved = world.getResource(GameTimeType);
      expect(retrieved).toBe(gameTime);
      expect(retrieved.deltaTime).toBe(16.67);
      expect(retrieved.totalTime).toBe(1000);
    });

    it("should update existing resources", () => {
      const gameTime1 = new GameTime(16.67, 1000);
      const gameTime2 = new GameTime(33.33, 2000);

      world.insertResource(gameTime1);
      expect(world.getResource(GameTimeType)).toBe(gameTime1);

      world.insertResource(gameTime2);
      expect(world.getResource(GameTimeType)).toBe(gameTime2);
      expect(world.getResource(GameTimeType).totalTime).toBe(2000);
    });

    it("should check if resource exists", () => {
      expect(world.hasResource(GameTimeType)).toBe(false);

      const gameTime = new GameTime(16.67, 1000);
      world.insertResource(gameTime);

      expect(world.hasResource(GameTimeType)).toBe(true);
    });

    it("should remove resources", () => {
      const gameTime = new GameTime(16.67, 1000);
      world.insertResource(gameTime);

      expect(world.hasResource(GameTimeType)).toBe(true);

      world.removeResource(GameTimeType);
      expect(world.hasResource(GameTimeType)).toBe(false);
      expect(world.getResource(GameTimeType)).toBeUndefined();
    });

    it("should handle multiple resources", () => {
      const gameTime = new GameTime(16.67, 1000);
      const gameState = new GameState(100, 2);

      world.insertResource(gameTime);
      world.insertResource(gameState);

      expect(world.hasResource(GameTimeType)).toBe(true);
      expect(world.hasResource(GameStateType)).toBe(true);

      expect(world.getResource(GameTimeType)).toBe(gameTime);
      expect(world.getResource(GameStateType)).toBe(gameState);
    });
  });

  describe("Query System", () => {
    beforeEach(() => {
      // Create test entities with different component combinations
      const entity1 = world.spawnEmpty();
      world.insert(entity1, new Position(10, 20));
      world.insert(entity1, new Velocity(5, 10));

      const entity2 = world.spawnEmpty();
      world.insert(entity2, new Position(30, 40));
      world.insert(entity2, new Health(100, 100));

      const entity3 = world.spawnEmpty();
      world.insert(entity3, new Position(50, 60));
      world.insert(entity3, new Velocity(15, 20));
      world.insert(entity3, new Health(50, 100));

      const entity4 = world.spawnEmpty();
      world.insert(entity4, new Player("TestPlayer"));
    });

    it("should query entities with single component", () => {
      const query = world.query(PositionType);
      const results: any[] = [];

      query.forEach((entity, position) => {
        results.push({ entity, position });
      });

      expect(results).toHaveLength(3);
      expect(results[0].position.x).toBe(10);
      expect(results[1].position.x).toBe(30);
      expect(results[2].position.x).toBe(50);
    });

    it("should query entities with multiple components", () => {
      const query = world.query(PositionType, VelocityType);
      const results: any[] = [];

      query.forEach((entity, position, velocity) => {
        results.push({ entity, position, velocity });
      });

      expect(results).toHaveLength(2);
      expect(results[0].position.x).toBe(10);
      expect(results[0].velocity.x).toBe(5);
      expect(results[1].position.x).toBe(50);
      expect(results[1].velocity.x).toBe(15);
    });

    it("should query entities with sparse set components", () => {
      const query = world.query(HealthType);
      const results: any[] = [];

      query.forEach((entity, health) => {
        results.push({ entity, health });
      });

      expect(results).toHaveLength(2);
      expect(results[0].health.current).toBe(100);
      expect(results[1].health.current).toBe(50);
    });

    it("should handle empty queries", () => {
      const query = world.query(PlayerType);
      const results: any[] = [];

      query.forEach((entity, player) => {
        results.push({ entity, player });
      });

      expect(results).toHaveLength(1);
      expect(results[0].player.name).toBe("TestPlayer");
    });

    it("should support query filters", () => {
      // Query entities with Position but without Velocity
      const query = world.queryFiltered([PositionType], {
        without: [VelocityType],
      });
      const results: any[] = [];

      query.forEach((entity, position) => {
        results.push({ entity, position });
      });

      expect(results).toHaveLength(1);
      expect(results[0].position.x).toBe(30);
    });
  });

  describe("Commands System", () => {
    it("should spawn entities immediately", () => {
      const commands = world.commands();
      const entity = commands.spawn();

      // Entity should be alive immediately
      expect(world.contains(entity)).toBe(true);
    });

    it("should defer component additions", () => {
      const entity = world.spawnEmpty();
      const commands = world.commands();
      const position = new Position(10, 20);

      commands.insert(entity, position);

      // Component should be added immediately
      expect(world.has(entity, PositionType)).toBe(true);
      expect(world.get(entity, PositionType)).toBe(position);
    });

    it("should defer entity despawning", () => {
      const entity = world.spawnEmpty();
      expect(world.contains(entity)).toBe(true);

      const commands = world.commands();
      commands.despawn(entity);

      // Entity should still be alive
      expect(world.contains(entity)).toBe(true);

      // Apply commands
      commands.apply();

      // Entity should now be despawned
      expect(world.contains(entity)).toBe(false);
    });

    it("should batch multiple commands", () => {
      const commands = world.commands();

      // Spawn multiple entities
      const entity1 = commands.spawn();
      const entity2 = commands.spawn();

      // Add components
      commands.insert(entity1, new Position(10, 20));
      commands.insert(entity2, new Position(30, 40));
      commands.insert(entity1, new Velocity(5, 10));

      // Everything should be applied immediately
      expect(world.contains(entity1)).toBe(true);
      expect(world.contains(entity2)).toBe(true);
      expect(world.has(entity1, PositionType)).toBe(true);
      expect(world.has(entity2, PositionType)).toBe(true);
      expect(world.has(entity1, VelocityType)).toBe(true);
      expect(world.has(entity2, VelocityType)).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should handle operations on despawned entities", () => {
      const entity = world.spawnEmpty();
      world.despawn(entity);

      // Operations on despawned entities should be safe (not throw errors)
      expect(() => {
        world.insert(entity, new Position(10, 20));
      }).not.toThrow();

      expect(() => {
        world.remove(entity, PositionType);
      }).not.toThrow();

      expect(() => {
        world.get(entity, PositionType);
      }).not.toThrow(); // get returns undefined for non-existent entities

      expect(() => {
        world.has(entity, PositionType);
      }).not.toThrow(); // has returns false for non-existent entities
    });

    it("should handle unregistered component types", () => {
      const entity = world.spawnEmpty();

      // Operations with unregistered types should throw errors
      expect(() => {
        world.insert(entity, { __component: true, value: 42 });
      }).toThrow();
    });
  });
});
