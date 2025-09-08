import { describe, it, expect, beforeEach } from 'vitest';
import { createWorld } from '../world';
import { Component, Resource, StorageType } from '../types';

// Simple test components
class Position implements Component {
  readonly __component = true;
  constructor(public x: number, public y: number) {}
}

class Velocity implements Component {
  readonly __component = true;
  constructor(public x: number, public y: number) {}
}

// Simple test resource
class GameTime implements Resource {
  readonly __resource = true;
  constructor(public deltaTime: number) {}
}

describe('Simple World Test', () => {
  let world: any;

  beforeEach(() => {
    world = createWorld();
    
    // Register component types
    world.getComponentRegistry().register('Position', StorageType.Table, () => new Position(0, 0));
    world.getComponentRegistry().register('Velocity', StorageType.Table, () => new Velocity(0, 0));
    
    // Register resource types
    world.getResourceRegistry().register('GameTime', () => new GameTime(0));
  });

  it('should spawn and despawn entities', () => {
    const entity = world.spawnEmpty();
    expect(world.contains(entity)).toBe(true);
    
    world.despawn(entity);
    expect(world.contains(entity)).toBe(false);
  });

  it('should add and retrieve components', () => {
    const entity = world.spawnEmpty();
    const position = new Position(10, 20);
    
    world.insert(entity, position);
    
    // Get the component type from registry
    const positionType = world.getComponentRegistry().getByName('Position');
    const retrieved = world.get(entity, positionType);
    
    expect(retrieved).toBeDefined();
    expect(retrieved.x).toBe(10);
    expect(retrieved.y).toBe(20);
  });

  it('should add and retrieve resources', () => {
    const gameTime = new GameTime(16.67);
    world.insertResource(gameTime);
    
    // Get the resource type from registry
    const gameTimeType = world.getResourceRegistry().getByName('GameTime');
    const retrieved = world.getResource(gameTimeType);
    
    expect(retrieved).toBeDefined();
    expect(retrieved.deltaTime).toBe(16.67);
  });
});

