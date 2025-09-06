# reynard-algorithms

> Algorithm primitives and data structures for Reynard applications

A comprehensive collection of reusable algorithmic building blocks including Union-Find, collision detection, spatial hashing, performance utilities, and geometry operations.

## Features

- **Union-Find Algorithm** - Efficient set operations and cycle detection
- **AABB Collision Detection** - Spatial queries and overlap detection  
- **Spatial Hashing** - Efficient spatial partitioning and nearest neighbor queries
- **Performance Utilities** - Benchmarking, profiling, and monitoring tools
- **Geometry Operations** - 2D geometric calculations and transformations

## Installation

```bash
npm install reynard-algorithms
```

## Quick Start

```typescript
import {
  UnionFind,
  detectCycle,
  checkCollision,
  SpatialHash,
  PerformanceTimer,
  PointOps,
  VectorOps,
} from 'reynard-algorithms';

// Union-Find for connected components
const uf = new UnionFind(10);
uf.union(0, 1);
uf.union(1, 2);
console.log(uf.connected(0, 2)); // true

// Collision detection
const aabb1 = { x: 0, y: 0, width: 100, height: 100 };
const aabb2 = { x: 50, y: 50, width: 100, height: 100 };
const collision = checkCollision(aabb1, aabb2);
console.log(collision.colliding); // true

// Spatial hashing
const spatialHash = new SpatialHash({ cellSize: 100 });
spatialHash.insert({ id: '1', x: 50, y: 50, data: { name: 'object1' } });
const nearby = spatialHash.queryRadius(0, 0, 100);

// Performance monitoring
const timer = new PerformanceTimer();
timer.start();
// ... perform operation
const duration = timer.stop();

// Geometry operations
const point1 = PointOps.create(0, 0);
const point2 = PointOps.create(3, 4);
const distance = PointOps.distance(point1, point2); // 5
```

## API Reference

### Union-Find Algorithm

```typescript
import { UnionFind, detectCycle, findConnectedComponents } from 'reynard-algorithms';

const uf = new UnionFind(10);
uf.union(0, 1);
uf.connected(0, 1); // true
uf.getSetSize(0); // 2
uf.getStats(); // Performance statistics

// Utility functions
const hasCycle = detectCycle([[0, 1], [1, 2], [2, 0]]); // true
const components = findConnectedComponents([[0, 1], [2, 3]]); // [[0, 1], [2, 3]]
```

### AABB Collision Detection

```typescript
import { checkCollision, batchCollisionDetection, AABB } from 'reynard-algorithms';

const aabb1: AABB = { x: 0, y: 0, width: 100, height: 100 };
const aabb2: AABB = { x: 50, y: 50, width: 100, height: 100 };

const result = checkCollision(aabb1, aabb2);
console.log(result.colliding); // true
console.log(result.overlapArea); // 2500

// Batch collision detection
const aabbs = [aabb1, aabb2, { x: 200, y: 200, width: 50, height: 50 }];
const collisions = batchCollisionDetection(aabbs);
```

### Spatial Hashing

```typescript
import { SpatialHash, createOptimizedSpatialHash } from 'reynard-algorithms';

const spatialHash = new SpatialHash<{ name: string }>({
  cellSize: 100,
  maxObjectsPerCell: 50,
});

spatialHash.insert({
  id: '1',
  x: 50,
  y: 50,
  data: { name: 'object1' },
});

const objectsInRect = spatialHash.queryRect(0, 0, 100, 100);
const objectsInRadius = spatialHash.queryRadius(0, 0, 100);
const nearest = spatialHash.findNearest(0, 0);
```

### Performance Utilities

```typescript
import {
  PerformanceTimer,
  MemoryMonitor,
  throttle,
  debounce,
  PerformanceBenchmark,
} from 'reynard-algorithms';

// Performance timing
const timer = new PerformanceTimer();
timer.start();
// ... perform operation
const duration = timer.stop();

// Memory monitoring
const monitor = new MemoryMonitor();
const usage = monitor.measure();

// Throttling and debouncing
const throttledFn = throttle(() => console.log('throttled'), 1000);
const debouncedFn = debounce(() => console.log('debounced'), 500);

// Performance benchmarking
const benchmark = new PerformanceBenchmark();
const metrics = await benchmark.run(() => {
  // Function to benchmark
}, 10);
```

### Geometry Operations

```typescript
import {
  PointOps,
  VectorOps,
  LineOps,
  RectangleOps,
  CircleOps,
  PolygonOps,
  TransformOps,
} from 'reynard-algorithms';

// Point operations
const point1 = PointOps.create(0, 0);
const point2 = PointOps.create(3, 4);
const distance = PointOps.distance(point1, point2); // 5
const midpoint = PointOps.midpoint(point1, point2); // { x: 1.5, y: 2 }

// Vector operations
const vector1 = VectorOps.create(1, 0);
const vector2 = VectorOps.create(0, 1);
const dot = VectorOps.dot(vector1, vector2); // 0
const magnitude = VectorOps.magnitude(vector1); // 1

// Rectangle operations
const rect = RectangleOps.create(0, 0, 100, 50);
const area = RectangleOps.area(rect); // 5000
const center = RectangleOps.center(rect); // { x: 50, y: 25 }

// Transform operations
const transform = TransformOps.combine(
  TransformOps.translate(10, 20),
  TransformOps.scale(2, 2)
);
const transformedPoint = TransformOps.applyToPoint(transform, point1);
```

## Performance Considerations

### Union-Find Algorithm

- **Time Complexity**: O(α(n)) for union and find operations (where α is the inverse Ackermann function)
- **Space Complexity**: O(n) where n is the number of elements
- **Optimizations**: Path compression and union by rank

### AABB Collision Detection

- **Time Complexity**: O(1) for single collision check, O(n²) for naive batch detection
- **Space Complexity**: O(n) for batch detection
- **Optimizations**: Spatial hashing for batch operations

### Spatial Hashing

- **Time Complexity**: O(1) average case for queries, O(n) worst case
- **Space Complexity**: O(n) where n is the number of objects
- **Optimizations**: Dynamic cell sizing, automatic cleanup

### Performance Utilities

- **Memory Overhead**: Minimal for basic operations
- **Accuracy**: High-precision timing using `performance.now()`
- **Optimizations**: Efficient memory monitoring, throttling, and debouncing

### Geometry Operations

- **Time Complexity**: O(1) for most operations, O(n) for polygon operations
- **Space Complexity**: O(1) for most operations, O(n) for polygon operations
- **Optimizations**: Efficient mathematical calculations, minimal object creation

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

## License

MIT License - see [LICENSE](../../LICENSE) for details.
