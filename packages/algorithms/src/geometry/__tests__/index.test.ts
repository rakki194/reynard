import { describe, it, expect } from 'vitest';

describe('Geometry Index', () => {
  it('should export collision detection algorithms', async () => {
      const module = await import('../index');
    
    expect(module.checkCollision).toBeDefined();
    expect(module.SpatialHash).toBeDefined();
  });

  it('should export shape algorithms', async () => {
      const module = await import('../index');
    
    expect(module.PointOps).toBeDefined();
    expect(module.LineOps).toBeDefined();
    expect(module.CircleOps).toBeDefined();
    expect(module.RectangleOps).toBeDefined();
    expect(module.PolygonOps).toBeDefined();
  });

  it('should export vector algorithms', async () => {
      const module = await import('../index');
    
    expect(module.VectorOps).toBeDefined();
  });

  it('should export transformation algorithms', async () => {
      const module = await import('../index');
    
    expect(module.TransformOps).toBeDefined();
  });

  it('should export all types', async () => {
      const module = await import('../index');
    
    // Types won't be available at runtime, but module should load
    expect(module).toBeDefined();
  });
});
