/**
 * @fileoverview Tests for ECS Change Detection system - component modification tracking and change queries.
 * 
 * These tests verify the change detection system can properly track when components
 * are added, modified, or removed, and provide efficient change-based queries.
 * 
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  World,
  ComponentType,
  ResourceType,
  StorageType,
  Component,
  Resource,
  Tick,
  ComponentTicks
} from '../types';
import { createWorld } from '../world';

// Test components
class Position implements Component {
  readonly __component = true;
  constructor(public x: number, public y: number) {}
}

class Velocity implements Component {
  readonly __component = true;
  constructor(public x: number, public y: number) {}
}

class Health implements Component {
  readonly __component = true;
  constructor(public current: number, public maximum: number) {}
}

class Player implements Component {
  readonly __component = true;
  constructor(public name: string) {}
}

// Test resources
class GameTime implements Resource {
  readonly __resource = true;
  constructor(public deltaTime: number, public totalTime: number) {}
}

// Component types
const PositionType: ComponentType<Position> = {
  name: 'Position',
  id: 0,
  storage: StorageType.Table,
  create: () => new Position(0, 0)
};

const VelocityType: ComponentType<Velocity> = {
  name: 'Velocity',
  id: 1,
  storage: StorageType.Table,
  create: () => new Velocity(0, 0)
};

const HealthType: ComponentType<Health> = {
  name: 'Health',
  id: 2,
  storage: StorageType.SparseSet,
  create: () => new Health(100, 100)
};

const PlayerType: ComponentType<Player> = {
  name: 'Player',
  id: 3,
  storage: StorageType.SparseSet,
  create: () => new Player('Player')
};

// Resource types
const GameTimeType: ResourceType<GameTime> = {
  name: 'GameTime',
  id: 0,
  create: () => new GameTime(0, 0)
};

describe('Change Detection System', () => {
  let world: World;
  let gameTime: GameTime;

  beforeEach(() => {
    world = createWorld();
    
    // Register component types
    world.getComponentRegistry().register(PositionType);
    world.getComponentRegistry().register(VelocityType);
    world.getComponentRegistry().register(HealthType);
    world.getComponentRegistry().register(PlayerType);
    
    // Register resource types
    world.getResourceRegistry().register(GameTimeType);
    
    // Add resources
    gameTime = new GameTime(16.67, 1000);
    world.addResource(GameTimeType, gameTime);
  });

  describe('Tick System', () => {
    it('should create and manage ticks', () => {
      const tick1 = world.getChangeDetection().createTick();
      const tick2 = world.getChangeDetection().createTick();
      
      expect(tick1).toBeDefined();
      expect(tick2).toBeDefined();
      expect(tick1).not.toBe(tick2);
      
      // Ticks should be comparable
      expect(tick1.isNewerThan(tick2)).toBe(false);
      expect(tick2.isNewerThan(tick1)).toBe(true);
    });

    it('should advance ticks over time', () => {
      const tick1 = world.getChangeDetection().createTick();
      
      // Simulate time passing
      world.getChangeDetection().advanceTick();
      
      const tick2 = world.getChangeDetection().createTick();
      
      expect(tick2.isNewerThan(tick1)).toBe(true);
      expect(tick1.isNewerThan(tick2)).toBe(false);
    });

    it('should handle tick wrapping', () => {
      // Create many ticks to test wrapping behavior
      const ticks: Tick[] = [];
      
      for (let i = 0; i < 1000; i++) {
        ticks.push(world.getChangeDetection().createTick());
        world.getChangeDetection().advanceTick();
      }
      
      // All ticks should be unique
      const uniqueTicks = new Set(ticks.map(t => t.value));
      expect(uniqueTicks.size).toBe(1000);
      
      // Ticks should be in order
      for (let i = 1; i < ticks.length; i++) {
        expect(ticks[i].isNewerThan(ticks[i - 1])).toBe(true);
      }
    });
  });

  describe('Component Change Tracking', () => {
    it('should track component additions', () => {
      const entity = world.spawn();
      
      // First tick - no components
      const tick1 = world.getChangeDetection().createTick();
      world.getChangeDetection().advanceTick();
      
      // Add component
      world.add(entity, PositionType, new Position(10, 20));
      
      // Second tick - component added
      const tick2 = world.getChangeDetection().createTick();
      
      // Check that component was added in tick2
      const componentTicks = world.getChangeDetection().getComponentTicks(entity, PositionType);
      expect(componentTicks).toBeDefined();
      expect(componentTicks.addedTick.isNewerThan(tick1)).toBe(true);
      expect(componentTicks.addedTick.isNewerThan(tick2)).toBe(false);
    });

    it('should track component modifications', () => {
      const entity = world.spawn();
      const position = new Position(10, 20);
      
      // Add component
      world.add(entity, PositionType, position);
      const tick1 = world.getChangeDetection().createTick();
      world.getChangeDetection().advanceTick();
      
      // Modify component
      position.x = 30;
      position.y = 40;
      
      const tick2 = world.getChangeDetection().createTick();
      
      // Check that component was modified in tick2
      const componentTicks = world.getChangeDetection().getComponentTicks(entity, PositionType);
      expect(componentTicks).toBeDefined();
      expect(componentTicks.changedTick.isNewerThan(tick1)).toBe(true);
      expect(componentTicks.changedTick.isNewerThan(tick2)).toBe(false);
    });

    it('should track component removals', () => {
      const entity = world.spawn();
      const position = new Position(10, 20);
      
      // Add component
      world.add(entity, PositionType, position);
      const tick1 = world.getChangeDetection().createTick();
      world.getChangeDetection().advanceTick();
      
      // Remove component
      world.remove(entity, PositionType);
      
      const tick2 = world.getChangeDetection().createTick();
      
      // Check that component was removed in tick2
      const componentTicks = world.getChangeDetection().getComponentTicks(entity, PositionType);
      expect(componentTicks).toBeDefined();
      expect(componentTicks.removedTick.isNewerThan(tick1)).toBe(true);
      expect(componentTicks.removedTick.isNewerThan(tick2)).toBe(false);
    });

    it('should handle multiple component changes', () => {
      const entity = world.spawn();
      
      // Add multiple components
      world.add(entity, PositionType, new Position(10, 20));
      world.add(entity, VelocityType, new Velocity(5, 10));
      world.add(entity, HealthType, new Health(100, 100));
      
      const tick1 = world.getChangeDetection().createTick();
      world.getChangeDetection().advanceTick();
      
      // Modify some components
      const position = world.get(entity, PositionType);
      const velocity = world.get(entity, VelocityType);
      
      position.x = 30;
      velocity.x = 15;
      
      const tick2 = world.getChangeDetection().createTick();
      
      // Check that only modified components have changed ticks
      const positionTicks = world.getChangeDetection().getComponentTicks(entity, PositionType);
      const velocityTicks = world.getChangeDetection().getComponentTicks(entity, VelocityType);
      const healthTicks = world.getChangeDetection().getComponentTicks(entity, HealthType);
      
      expect(positionTicks.changedTick.isNewerThan(tick1)).toBe(true);
      expect(velocityTicks.changedTick.isNewerThan(tick1)).toBe(true);
      expect(healthTicks.changedTick.isNewerThan(tick1)).toBe(false);
    });
  });

  describe('Change-Based Queries', () => {
    beforeEach(() => {
      // Create test entities
      const entity1 = world.spawn();
      world.add(entity1, PositionType, new Position(10, 20));
      world.add(entity1, VelocityType, new Velocity(5, 10));
      
      const entity2 = world.spawn();
      world.add(entity2, PositionType, new Position(30, 40));
      world.add(entity2, HealthType, new Health(100, 100));
      
      const entity3 = world.spawn();
      world.add(entity3, PositionType, new Position(50, 60));
      world.add(entity3, VelocityType, new Velocity(15, 20));
      world.add(entity3, HealthType, new Health(50, 100));
    });

    it('should query entities with added components', () => {
      // First tick - establish baseline
      const tick1 = world.getChangeDetection().createTick();
      world.getChangeDetection().advanceTick();
      
      // Add new component to existing entity
      const entity = world.spawn();
      world.add(entity, PositionType, new Position(70, 80));
      world.add(entity, VelocityType, new Velocity(25, 30));
      
      const tick2 = world.getChangeDetection().createTick();
      
      // Query for entities with added Velocity component
      const addedQuery = world.query(PositionType).added(VelocityType);
      const results: any[] = [];
      
      addedQuery.forEach((entity, position) => {
        results.push({ entity, position });
      });
      
      expect(results).toHaveLength(1);
      expect(results[0].position.x).toBe(70);
    });

    it('should query entities with changed components', () => {
      // First tick - establish baseline
      const tick1 = world.getChangeDetection().createTick();
      world.getChangeDetection().advanceTick();
      
      // Modify existing components
      const position = world.get(world.query(PositionType).first().entity, PositionType);
      position.x = 100;
      position.y = 200;
      
      const tick2 = world.getChangeDetection().createTick();
      
      // Query for entities with changed Position component
      const changedQuery = world.query(PositionType).changed(PositionType);
      const results: any[] = [];
      
      changedQuery.forEach((entity, position) => {
        results.push({ entity, position });
      });
      
      expect(results).toHaveLength(1);
      expect(results[0].position.x).toBe(100);
    });

    it('should query entities with removed components', () => {
      // First tick - establish baseline
      const tick1 = world.getChangeDetection().createTick();
      world.getChangeDetection().advanceTick();
      
      // Remove component from existing entity
      const entity = world.query(PositionType, VelocityType).first().entity;
      world.remove(entity, VelocityType);
      
      const tick2 = world.getChangeDetection().createTick();
      
      // Query for entities with removed Velocity component
      const removedQuery = world.query(PositionType).removed(VelocityType);
      const results: any[] = [];
      
      removedQuery.forEach((entity, position) => {
        results.push({ entity, position });
      });
      
      expect(results).toHaveLength(1);
    });

    it('should handle complex change queries', () => {
      // First tick - establish baseline
      const tick1 = world.getChangeDetection().createTick();
      world.getChangeDetection().advanceTick();
      
      // Make various changes
      const entity1 = world.spawn();
      world.add(entity1, PositionType, new Position(90, 100));
      world.add(entity1, VelocityType, new Velocity(35, 40));
      
      const entity2 = world.query(PositionType, HealthType).first().entity;
      const position = world.get(entity2, PositionType);
      position.x = 150;
      
      const entity3 = world.query(PositionType, VelocityType).first().entity;
      world.remove(entity3, VelocityType);
      
      const tick2 = world.getChangeDetection().createTick();
      
      // Query for entities with added Velocity component
      const addedQuery = world.query(PositionType).added(VelocityType);
      const addedResults: any[] = [];
      addedQuery.forEach((entity, position) => {
        addedResults.push({ entity, position });
      });
      
      // Query for entities with changed Position component
      const changedQuery = world.query(PositionType).changed(PositionType);
      const changedResults: any[] = [];
      changedQuery.forEach((entity, position) => {
        changedResults.push({ entity, position });
      });
      
      // Query for entities with removed Velocity component
      const removedQuery = world.query(PositionType).removed(VelocityType);
      const removedResults: any[] = [];
      removedQuery.forEach((entity, position) => {
        removedResults.push({ entity, position });
      });
      
      expect(addedResults).toHaveLength(1);
      expect(changedResults).toHaveLength(1);
      expect(removedResults).toHaveLength(1);
      
      expect(addedResults[0].position.x).toBe(90);
      expect(changedResults[0].position.x).toBe(150);
    });
  });

  describe('Change Detection Performance', () => {
    it('should handle many entities efficiently', () => {
      // Create many entities
      const entities: any[] = [];
      
      for (let i = 0; i < 1000; i++) {
        const entity = world.spawn();
        world.add(entity, PositionType, new Position(i, i));
        world.add(entity, VelocityType, new Velocity(i, i));
        entities.push(entity);
      }
      
      // First tick - establish baseline
      const tick1 = world.getChangeDetection().createTick();
      world.getChangeDetection().advanceTick();
      
      // Modify some entities
      for (let i = 0; i < 100; i++) {
        const entity = entities[i];
        const position = world.get(entity, PositionType);
        position.x += 1;
        position.y += 1;
      }
      
      const tick2 = world.getChangeDetection().createTick();
      
      const startTime = performance.now();
      
      // Query for changed entities
      const changedQuery = world.query(PositionType).changed(PositionType);
      let changedCount = 0;
      changedQuery.forEach(() => {
        changedCount++;
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(changedCount).toBe(100);
      expect(duration).toBeLessThan(50); // Should complete in under 50ms
    });

    it('should handle frequent changes efficiently', () => {
      const entity = world.spawn();
      world.add(entity, PositionType, new Position(0, 0));
      
      const startTime = performance.now();
      
      // Make many changes
      for (let i = 0; i < 1000; i++) {
        const tick = world.getChangeDetection().createTick();
        world.getChangeDetection().advanceTick();
        
        const position = world.get(entity, PositionType);
        position.x = i;
        position.y = i;
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });
  });

  describe('Change Detection Edge Cases', () => {
    it('should handle entities with no components', () => {
      const entity = world.spawn();
      
      const tick1 = world.getChangeDetection().createTick();
      world.getChangeDetection().advanceTick();
      
      // Try to get component ticks for non-existent component
      const componentTicks = world.getChangeDetection().getComponentTicks(entity, PositionType);
      expect(componentTicks).toBeUndefined();
    });

    it('should handle component ticks for despawned entities', () => {
      const entity = world.spawn();
      world.add(entity, PositionType, new Position(10, 20));
      
      const tick1 = world.getChangeDetection().createTick();
      world.getChangeDetection().advanceTick();
      
      world.despawn(entity);
      
      // Component ticks should still be accessible
      const componentTicks = world.getChangeDetection().getComponentTicks(entity, PositionType);
      expect(componentTicks).toBeDefined();
    });

    it('should handle rapid component additions and removals', () => {
      const entity = world.spawn();
      
      // Rapidly add and remove components
      for (let i = 0; i < 100; i++) {
        const tick = world.getChangeDetection().createTick();
        world.getChangeDetection().advanceTick();
        
        world.add(entity, PositionType, new Position(i, i));
        
        const tick2 = world.getChangeDetection().createTick();
        world.getChangeDetection().advanceTick();
        
        world.remove(entity, PositionType);
      }
      
      // Entity should still be valid
      expect(world.isAlive(entity)).toBe(true);
    });

    it('should handle tick overflow', () => {
      // Create many ticks to test overflow behavior
      const ticks: Tick[] = [];
      
      for (let i = 0; i < 10000; i++) {
        ticks.push(world.getChangeDetection().createTick());
        world.getChangeDetection().advanceTick();
      }
      
      // All ticks should be unique
      const uniqueTicks = new Set(ticks.map(t => t.value));
      expect(uniqueTicks.size).toBe(10000);
      
      // Ticks should be in order
      for (let i = 1; i < ticks.length; i++) {
        expect(ticks[i].isNewerThan(ticks[i - 1])).toBe(true);
      }
    });
  });

  describe('Change Detection Integration', () => {
    it('should work with system execution', () => {
      // Create entities
      const entity1 = world.spawn();
      world.add(entity1, PositionType, new Position(0, 0));
      world.add(entity1, VelocityType, new Velocity(5, 10));
      
      const entity2 = world.spawn();
      world.add(entity2, PositionType, new Position(10, 20));
      world.add(entity2, VelocityType, new Velocity(15, 20));
      
      // First tick - establish baseline
      const tick1 = world.getChangeDetection().createTick();
      world.getChangeDetection().advanceTick();
      
      // System that modifies positions
      const movementSystem = (world: World) => {
        const query = world.query(PositionType, VelocityType);
        query.forEach((entity, position, velocity) => {
          position.x += velocity.x * 0.016;
          position.y += velocity.y * 0.016;
        });
      };
      
      movementSystem(world);
      
      const tick2 = world.getChangeDetection().createTick();
      
      // Query for entities with changed positions
      const changedQuery = world.query(PositionType).changed(PositionType);
      const results: any[] = [];
      
      changedQuery.forEach((entity, position) => {
        results.push({ entity, position });
      });
      
      expect(results).toHaveLength(2);
      expect(results[0].position.x).toBeCloseTo(0.08, 2);
      expect(results[1].position.x).toBeCloseTo(10.24, 2);
    });

    it('should work with query filters', () => {
      // Create entities
      const entity1 = world.spawn();
      world.add(entity1, PositionType, new Position(0, 0));
      world.add(entity1, VelocityType, new Velocity(5, 10));
      
      const entity2 = world.spawn();
      world.add(entity2, PositionType, new Position(10, 20));
      world.add(entity2, HealthType, new Health(100, 100));
      
      // First tick - establish baseline
      const tick1 = world.getChangeDetection().createTick();
      world.getChangeDetection().advanceTick();
      
      // Modify positions
      const position1 = world.get(entity1, PositionType);
      const position2 = world.get(entity2, PositionType);
      
      position1.x = 100;
      position2.x = 200;
      
      const tick2 = world.getChangeDetection().createTick();
      
      // Query for entities with changed positions and velocity
      const changedQuery = world.query(PositionType).changed(PositionType).with(VelocityType);
      const results: any[] = [];
      
      changedQuery.forEach((entity, position) => {
        results.push({ entity, position });
      });
      
      expect(results).toHaveLength(1);
      expect(results[0].position.x).toBe(100);
    });
  });
});
