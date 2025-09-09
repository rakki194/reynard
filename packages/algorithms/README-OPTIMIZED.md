# Reynard Algorithms - Optimized API

> High-performance algorithmic building blocks with automatic optimization and memory pooling

The Reynard Algorithms package now includes a comprehensive optimization framework based on PAW (Perfect Algorithmic World) research findings. This provides automatic algorithm selection, memory pooling, and performance monitoring for maximum efficiency.

## 🦊> **Key Features**

- **Automatic Algorithm Selection**: Intelligently chooses optimal algorithms based on workload characteristics
- **Memory Pooling**: 99.91% reduction in allocation overhead through object reuse
- **Performance Monitoring**: Real-time performance tracking and optimization recommendations
- **Backward Compatibility**: Existing APIs continue to work while new optimized APIs provide enhanced performance

## 🦦> **Quick Start**

### Basic Usage

```typescript
import { detectCollisions, PerformanceMonitor } from "reynard-algorithms";

// Automatic algorithm selection and optimization
const aabbs = [
  { x: 0, y: 0, width: 100, height: 100 },
  { x: 50, y: 50, width: 100, height: 100 },
];

const collisions = detectCollisions(aabbs);
console.log(`Found ${collisions.length} collisions`);

// Performance monitoring
const monitor = new PerformanceMonitor();
const report = monitor.getPerformanceReport();
console.log(`Hit rate: ${report.summary.hitRate}%`);
```

### Advanced Configuration

```typescript
import {
  OptimizationConfig,
  configureOptimization,
  detectCollisions,
} from "reynard-algorithms";

// Configure global optimization settings
configureOptimization({
  enableMemoryPooling: true,
  enableAlgorithmSelection: true,
  algorithmSelectionStrategy: "adaptive",
  performanceThresholds: {
    maxExecutionTime: 16, // 16ms for 60fps
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    minHitRate: 90,
  },
});

// Use optimized algorithms
const collisions = detectCollisions(aabbs);
```

## 🐺> **API Reference**

### Core Functions

#### `detectCollisions(aabbs: AABB[]): CollisionPair[]`

Automatically detects collisions between AABB objects using the optimal algorithm.

```typescript
const aabbs: AABB[] = [
  { x: 0, y: 0, width: 100, height: 100 },
  { x: 50, y: 50, width: 100, height: 100 },
];

const collisions = detectCollisions(aabbs);
// Returns: [{ a: 0, b: 1, result: { colliding: true, distance: 35.36, ... } }]
```

**Features:**

- Automatic algorithm selection (naive, spatial, or optimized)
- Memory pooling for zero-allocation performance
- Performance monitoring and adaptation

#### `performSpatialQuery(queryAABB: AABB, spatialObjects: SpatialObject[]): SpatialObject[]`

Performs optimized spatial queries to find objects within a specified area.

```typescript
const spatialObjects = [
  { aabb: { x: 0, y: 0, width: 50, height: 50 }, data: "object1" },
  { aabb: { x: 100, y: 100, width: 50, height: 50 }, data: "object2" },
];

const queryAABB = { x: 0, y: 0, width: 100, height: 100 };
const nearby = performSpatialQuery(queryAABB, spatialObjects);
// Returns: [{ aabb: {...}, data: 'object1' }]
```

#### `findConnectedComponents(collisionPairs: CollisionPair[], objectCount: number): number[][]`

Finds connected components using optimized Union-Find algorithms.

```typescript
const collisionPairs = [
  { a: 0, b: 1, result: { colliding: true, distance: 0 } },
  { a: 1, b: 2, result: { colliding: true, distance: 0 } },
];

const components = findConnectedComponents(collisionPairs, 4);
// Returns: [[0, 1, 2], [3]]
```

### Performance Monitoring

#### `PerformanceMonitor`

Provides comprehensive performance monitoring and optimization recommendations.

```typescript
const monitor = new PerformanceMonitor();

// Get performance statistics
const stats = monitor.getPerformanceStats();
console.log(`Total queries: ${stats.totalQueries}`);
console.log(`Average execution time: ${stats.averageExecutionTime}ms`);

// Get memory pool statistics
const poolStats = monitor.getMemoryPoolStats();
console.log(`Pool hit rate: ${poolStats.hitRate}%`);
console.log(`Allocations avoided: ${poolStats.poolHits}`);

// Get optimization recommendations
const recommendations = monitor.getOptimizationRecommendations();
recommendations.forEach((rec) => {
  console.log(`${rec.type}: ${rec.description}`);
});

// Check for performance degradation
if (monitor.isPerformanceDegraded()) {
  console.log("Performance degradation detected!");
}

// Get comprehensive report
const report = monitor.getPerformanceReport();
console.log("Performance Report:", report);
```

### Configuration Management

#### `OptimizationConfig`

Manages optimization settings and provides convenience methods.

```typescript
const config = new OptimizationConfig();

// Update configuration
config.update({
  algorithmSelectionStrategy: "spatial",
  enableMemoryPooling: true,
});

// Convenience methods
config.enableMemoryPooling();
config.setAlgorithmStrategy("optimized");
config.setPerformanceThresholds({
  maxExecutionTime: 8,
  minHitRate: 95,
});

// Get current configuration
const currentConfig = config.getConfig();
```

#### `configureOptimization(config: Partial<OptimizedCollisionConfig>): void`

Updates global optimization configuration.

```typescript
configureOptimization({
  enableMemoryPooling: true,
  enableAlgorithmSelection: true,
  algorithmSelectionStrategy: "adaptive",
  performanceThresholds: {
    maxExecutionTime: 16,
    maxMemoryUsage: 50 * 1024 * 1024,
    minHitRate: 90,
  },
});
```

### Algorithm Selection

#### `AlgorithmSelector`

Provides intelligent algorithm selection based on workload characteristics.

```typescript
const selector = new AlgorithmSelector();

const workload = {
  objectCount: 100,
  spatialDensity: 0.5,
  overlapRatio: 0.3,
  updateFrequency: 5,
  queryPattern: "random",
};

// Select optimal collision detection algorithm
const selection = selector.selectCollisionAlgorithm(workload);
console.log(`Selected algorithm: ${selection.algorithm}`);
console.log(`Confidence: ${selection.confidence}`);
console.log(`Reasoning: ${selection.reasoning.join(", ")}`);

// Get selection statistics
const stats = selector.getSelectionStats();
console.log(`Total selections: ${stats.totalSelections}`);
console.log(`Average confidence: ${stats.averageConfidence}`);
```

### Memory Pool Management

#### `MemoryPool`

Manages memory pooling for optimal performance.

```typescript
const pool = new MemoryPool({
  spatialHashPoolSize: 20,
  unionFindPoolSize: 50,
  collisionArrayPoolSize: 100,
  enableAutoResize: true,
});

// Get pool statistics
const stats = pool.getStatistics();
console.log(`Pool hit rate: ${stats.hitRate}%`);
console.log(`Memory saved: ${stats.memorySaved} bytes`);

// Get pool information
const info = pool.getPoolInfo();
console.log(
  `Spatial hash pool: ${info.spatialHashPool.inUse}/${info.spatialHashPool.total} in use`,
);

// Optimize for specific workload
pool.optimizeForWorkload({
  objectCount: 200,
  spatialDensity: 0.8,
  updateFrequency: 15,
});

// Clean up resources
pool.destroy();
```

## 🦊> **Performance Characteristics**

### Algorithm Selection Strategy

The optimization framework automatically selects algorithms based on workload characteristics:

- **Small datasets (10-25 objects)**: Naive algorithm for optimal performance
- **Medium datasets (25-100 objects)**: Spatial algorithm with memory pooling
- **Large datasets (100+ objects)**: Optimized algorithm with full memory pooling

### Memory Pool Effectiveness

Based on PAW research findings:

- **99.91% allocation overhead reduction** through object pooling
- **95%+ pool hit rates** for typical workloads
- **5-15% overall performance improvement** in execution time
- **60-70% reduction** in peak memory usage

### Performance Monitoring

Real-time performance tracking provides:

- **Execution time monitoring** with automatic threshold detection
- **Memory usage tracking** with optimization recommendations
- **Algorithm selection statistics** with confidence metrics
- **Performance degradation detection** with automatic alerts

## 🦦> **Migration Guide**

### From Legacy API

The optimized API maintains backward compatibility while providing enhanced performance:

```typescript
// Legacy API (still supported)
import { UnionFind, SpatialHash, checkCollision } from "reynard-algorithms";

const uf = new UnionFind(100);
const spatialHash = new SpatialHash({ cellSize: 100 });
const collision = checkCollision(aabb1, aabb2);

// New Optimized API (recommended)
import { detectCollisions, findConnectedComponents } from "reynard-algorithms";

const collisions = detectCollisions(aabbs);
const components = findConnectedComponents(collisionPairs, objectCount);
```

### Performance Benefits

Migration to the optimized API provides:

- **Automatic algorithm selection** - no manual algorithm choice required
- **Memory pooling** - eliminates allocation overhead
- **Performance monitoring** - built-in optimization tracking
- **Simplified API** - single entry point for all operations

## 🐺> **Advanced Usage**

### Custom Optimization Configuration

```typescript
import {
  OptimizationConfig,
  PerformanceMonitor,
  detectCollisions,
} from "reynard-algorithms";

// Create custom configuration
const config = new OptimizationConfig({
  enableMemoryPooling: true,
  enableAlgorithmSelection: true,
  algorithmSelectionStrategy: "adaptive",
  performanceThresholds: {
    maxExecutionTime: 8, // 8ms for 120fps
    maxMemoryUsage: 25 * 1024 * 1024, // 25MB
    minHitRate: 95,
  },
});

// Monitor performance
const monitor = new PerformanceMonitor();

// Perform operations
const aabbs = generateTestData(1000);
const collisions = detectCollisions(aabbs);

// Check performance
if (monitor.isPerformanceDegraded()) {
  const recommendations = monitor.getOptimizationRecommendations();
  console.log("Optimization recommendations:", recommendations);
}
```

### Workload-Specific Optimization

```typescript
import { MemoryPool, AlgorithmSelector } from "reynard-algorithms";

// Analyze workload characteristics
const workload = {
  objectCount: 500,
  spatialDensity: 0.8,
  overlapRatio: 0.6,
  updateFrequency: 30,
  queryPattern: "clustered",
};

// Get algorithm selection
const selector = new AlgorithmSelector();
const selection = selector.selectCollisionAlgorithm(workload);

console.log(`Optimal algorithm: ${selection.algorithm}`);
console.log(
  `Expected performance: ${selection.expectedPerformance.executionTime}ms`,
);

// Optimize memory pool for workload
const pool = new MemoryPool();
pool.optimizeForWorkload(workload);
```

## 🦊> **Best Practices**

### Performance Optimization

1. **Use the optimized API** for new code
2. **Enable memory pooling** for frequent operations
3. **Monitor performance** with PerformanceMonitor
4. **Configure thresholds** based on your requirements
5. **Use adaptive algorithm selection** for varying workloads

### Memory Management

1. **Let the system manage memory pools** automatically
2. **Monitor pool hit rates** for optimization opportunities
3. **Use cleanup()** when shutting down applications
4. **Configure pool sizes** based on expected workloads

### Algorithm Selection

1. **Trust automatic selection** for most use cases
2. **Monitor selection statistics** for insights
3. **Use custom selection** only for specific requirements
4. **Update performance models** with real-world data

## 🦦> **Troubleshooting**

### Performance Issues

```typescript
const monitor = new PerformanceMonitor();

// Check if performance is degraded
if (monitor.isPerformanceDegraded()) {
  const report = monitor.getPerformanceReport();

  console.log("Performance Issues:");
  console.log(`- Execution time: ${report.summary.averageExecutionTime}ms`);
  console.log(`- Memory usage: ${report.summary.averageMemoryUsage} bytes`);
  console.log(`- Hit rate: ${report.summary.hitRate}%`);

  // Get optimization recommendations
  report.recommendations.forEach((rec) => {
    console.log(`- ${rec.description} (${rec.impact} impact)`);
  });
}
```

### Memory Pool Issues

```typescript
const pool = new MemoryPool();
const stats = pool.getStatistics();

if (stats.hitRate < 90) {
  console.log("Low pool hit rate detected");
  console.log(`Current hit rate: ${stats.hitRate}%`);
  console.log(`Pool hits: ${stats.poolHits}`);
  console.log(`Pool misses: ${stats.poolMisses}`);

  // Get optimization recommendations
  const recommendations = pool.getOptimizationRecommendations();
  recommendations.forEach((rec) => {
    console.log(`Recommendation: ${rec.description}`);
  });
}
```

## 🐺> **Conclusion**

The optimized Reynard Algorithms package provides a comprehensive solution for high-performance spatial algorithms with automatic optimization and memory pooling. The PAW optimization framework ensures optimal performance across all workload scenarios while maintaining ease of use and backward compatibility.

Key benefits:

- **99.91% allocation overhead reduction** through memory pooling
- **Automatic algorithm selection** based on workload characteristics
- **Real-time performance monitoring** with optimization recommendations
- **Simplified API** with comprehensive functionality
- **Production-ready** with extensive testing and validation

For more information, see the [PAW Optimization Research](../docs/research/algorithms/paw-algorithms/) documentation.
