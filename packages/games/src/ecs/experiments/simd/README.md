# SIMD ECS Experiment

This experiment compares SIMD-accelerated ECS operations against their non-SIMD counterparts.

## Experiment: Position Update System

We're testing SIMD acceleration on the most computationally intensive ECS operation: position updates with
velocity integration.

### Components Tested

- **Position**: 2D position (x, y) as Float32Array
- **Velocity**: 2D velocity (vx, vy) as Float32Array
- **Mass**: Scalar mass values as Float32Array

### Operations

1. **Position Integration**: `position += velocity * deltaTime`
2. **Velocity Integration**: `velocity += acceleration * deltaTime`
3. **Collision Detection**: Simple AABB collision detection
4. **Spatial Queries**: Find entities within radius

### Implementations

- **Non-SIMD**: Pure TypeScript with TypedArrays
- **SIMD**: WebAssembly with SIMD instructions
- **Parallel**: Web Workers with SharedArrayBuffer

### Benchmark Results

See `benchmark-results.md` for detailed performance comparisons.

## Files

- `position-system.ts` - Non-SIMD implementation
- `position-system-simd.ts` - SIMD WebAssembly wrapper
- `position-system-parallel.ts` - Web Worker parallel implementation
- `benchmark.ts` - Performance testing suite
- `rust-src/` - Rust source code for WebAssembly compilation
