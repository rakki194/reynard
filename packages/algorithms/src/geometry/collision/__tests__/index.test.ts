import { describe, it, expect } from 'vitest';

describe('AABB Collision Index', () => {
  it('should export all AABB types', async () => {
    const module = await import('../index');
    
    // Check that types are exported (they won't be available at runtime, but the module should load)
    expect(module).toBeDefined();
  });

  it('should export AABB operations', async () => {
      const module = await import('../index');
    
    expect(module.pointInAABB).toBeDefined();
    expect(module.unionAABB).toBeDefined();
    expect(module.intersectionAABB).toBeDefined();
    expect(module.expandAABB).toBeDefined();
    expect(module.containsAABB).toBeDefined();
    expect(module.areAABBsTouching).toBeDefined();
  });

  it('should export AABB collision detection', async () => {
      const module = await import('../index');
    
    expect(module.checkCollision).toBeDefined();
  });

  it('should export AABB utilities', async () => {
      const module = await import('../index');
    
    expect(module.getAABBArea).toBeDefined();
    expect(module.getAABBPerimeter).toBeDefined();
  });

  it('should export AABB spatial hash', async () => {
      const module = await import('../index');
    
    expect(module.SpatialHash).toBeDefined();
  });

  it('should export batch collision detection', async () => {
      const module = await import('../index');
    
    expect(module.batchCollisionDetection).toBeDefined();
    expect(module.batchCollisionWithSpatialHash).toBeDefined();
  });

  it('should export collision algorithms', async () => {
      const module = await import('../index');
    
    expect(module).toBeDefined();
  });
});
