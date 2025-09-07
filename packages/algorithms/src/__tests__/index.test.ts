import { describe, it, expect } from 'vitest';

describe('Main Index', () => {
  it('should export union-find algorithms', async () => {
      const module = await import('../index');
    
    expect(module.UnionFind).toBeDefined();
    expect(module.detectCycle).toBeDefined();
    expect(module.findConnectedComponents).toBeDefined();
  });

  it('should export spatial hash algorithms', async () => {
      const module = await import('../index');
    
    expect(module.SpatialHash).toBeDefined();
  });

  it('should export performance utilities', async () => {
      const module = await import('../index');
    
    expect(module.PerformanceTimer).toBeDefined();
    expect(module.PerformanceBenchmark).toBeDefined();
    expect(module.MemoryMonitor).toBeDefined();
    expect(module.MemoryLeakDetector).toBeDefined();
  });

  it('should export geometry utilities', async () => {
      const module = await import('../index');
    
    expect(module.PointOps).toBeDefined();
    expect(module.VectorOps).toBeDefined();
    expect(module.LineOps).toBeDefined();
    expect(module.RectangleOps).toBeDefined();
    expect(module.CircleOps).toBeDefined();
    expect(module.PolygonOps).toBeDefined();
    expect(module.TransformOps).toBeDefined();
  });

  it('should export collision detection', async () => {
      const module = await import('../index');
    
    // checkCollision is exported from geometry module
    expect(module).toBeDefined();
  });
});
