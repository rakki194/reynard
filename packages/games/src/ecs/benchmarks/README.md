# ECS Performance Benchmark Suite

🦊> A comprehensive performance testing framework for the Reynard ECS system,
    designed to measure and optimize critical operations with the cunning
    precision of a fox!

## Overview

This benchmark suite provides thorough performance testing for all critical ECS operations:

- **Entity Operations**: Creation, destruction, and lifecycle management
- **Component Operations**: Addition, removal, and access patterns
- **Query Performance**: Simple and complex component queries with filters
- **System Execution**: Timing and efficiency of system functions
- **Resource Access**: Global resource management performance
- **Stress Testing**: High entity count scenarios and breaking points
- **Memory Usage**: Allocation patterns and memory efficiency

## Quick Start

### Basic Usage

```typescript
import { runECSBenchmarks } from './ecs-benchmark';

// Run all benchmarks with default settings
const results = await runECSBenchmarks();
console.log(`Completed ${results.length} benchmark tests`);
```

### Command Line Interface

```bash
# Run all benchmarks
npx ts-node run-benchmarks.ts

# Run specific categories
npx ts-node run-benchmarks.ts --category entity
npx ts-node run-benchmarks.ts --category query
npx ts-node run-benchmarks.ts --category system
npx ts-node run-benchmarks.ts --category stress

# Custom configuration
npx ts-node run-benchmarks.ts --entities 1000,5000,10000 --iterations 500

# Export results
npx ts-node run-benchmarks.ts --export results.json --memory
```

## Benchmark Categories

### 🦊> Entity Benchmarks

Tests entity creation, component addition, and component removal performance:

```typescript
import { runEntityBenchmarks } from './ecs-benchmark';

const results = await runEntityBenchmarks({
  entityCounts: [100, 500, 1000, 5000, 10000],
  iterations: 1000,
});
```

**Operations Tested:**

- Entity spawning with multiple components
- Component addition to existing entities
- Component removal from entities
- Entity destruction and cleanup

### 🦦> Query Benchmarks

Measures query performance with various component combinations:

```typescript
import { runQueryBenchmarks } from './ecs-benchmark';

const results = await runQueryBenchmarks({
  entityCounts: [1000, 5000, 10000, 25000],
  iterations: 500,
});
```

**Query Types:**

- Simple queries (single component)
- Complex queries (multiple components)
- Filtered queries (with/without components)
- Change detection queries

### 🐺> System Benchmarks

Tests system execution timing and efficiency:

```typescript
import { runSystemBenchmarks } from './ecs-benchmark';

const results = await runSystemBenchmarks({
  entityCounts: [1000, 5000, 10000],
  iterations: 1000,
});
```

**System Types:**

- Movement systems (Position + Velocity)
- Health systems (Health + Damage)
- Rendering systems (Position + Color + Size)
- Complex multi-component systems

### 🔥> Stress Tests

High entity count scenarios to find performance limits:

```typescript
import { runStressTests } from './ecs-benchmark';

const results = await runStressTests({
  entityCounts: [10000, 25000, 50000, 100000],
  iterations: 100,
});
```

**Stress Scenarios:**

- Massive entity creation
- Complex query operations
- System execution with high entity counts
- Memory usage under load

## Configuration Options

### BenchmarkConfig Interface

```typescript
interface BenchmarkConfig {
  entityCounts: number[];        // Entity counts to test
  iterations: number;            // Iterations per benchmark
  warmupIterations: number;      // Warmup iterations
  enableMemoryTracking: boolean; // Track memory usage
  enableDetailedLogging: boolean; // Verbose output
}
```

### Default Configuration

```typescript
const DEFAULT_CONFIG: BenchmarkConfig = {
  entityCounts: [100, 500, 1000, 5000, 10000, 25000, 50000],
  iterations: 1000,
  warmupIterations: 100,
  enableMemoryTracking: true,
  enableDetailedLogging: false,
};
```

## Advanced Usage

### Custom Benchmark Runner

```typescript
import { ECSBenchmarkRunner } from './ecs-benchmark';

const runner = new ECSBenchmarkRunner({
  entityCounts: [1000, 5000, 10000],
  iterations: 500,
  enableMemoryTracking: true,
});

// Run specific benchmarks
const entityResults = await runner.benchmarkEntityCreation();
const queryResults = await runner.benchmarkQueries();

// Export results
const jsonData = runner.exportResults('my-benchmark.json');
```

### Performance Regression Testing

```typescript
// Run baseline benchmarks
const baselineResults = await runECSBenchmarks(baselineConfig);

// Save baseline data
const baselineData = {
  timestamp: new Date().toISOString(),
  results: baselineResults,
  summary: {
    avgTimeUs: baselineResults.reduce((sum, r) => sum + r.averageTimeUs, 0) /
      baselineResults.length,
    totalMemoryMB: baselineResults.reduce((sum, r) => 
      sum + (r.memoryUsageMB || 0), 0),
  },
};

// Later: Run comparison benchmarks
const comparisonResults = await runECSBenchmarks(baselineConfig);

// Compare and detect regressions
const timeDiff = comparisonData.avgTimeUs - baselineData.summary.avgTimeUs;
const timeDiffPercent = (timeDiff / baselineData.summary.avgTimeUs) * 100;

if (timeDiffPercent > 10) {
  console.log("⚠️ Performance regression detected!");
}
```

## Benchmark Results

### BenchmarkResult Interface

```typescript
interface BenchmarkResult {
  name: string;              // Benchmark name
  operation: string;         // Operation type
  entityCount: number;       // Number of entities tested
  iterations: number;        // Number of iterations
  totalTimeMs: number;       // Total execution time
  averageTimeMs: number;     // Average time per iteration
  averageTimeUs: number;     // Average time in microseconds
  operationsPerSecond: number; // Operations per second
  memoryUsageMB?: number;    // Memory usage (if enabled)
  notes?: string;            // Additional notes
}
```

### Sample Output

```text
🦊> Reynard ECS Benchmark Suite
==================================================
Category: all
Entity Counts: 100, 500, 1000, 5000, 10000, 25000, 50000
Iterations: 1000
Memory Tracking: enabled

🦊> Benchmarking Entity Creation...
   100 entities: 45.23μs per operation
   500 entities: 52.18μs per operation
   1000 entities: 58.94μs per operation
   5000 entities: 67.32μs per operation
   10000 entities: 75.89μs per operation
   25000 entities: 89.45μs per operation
   50000 entities: 102.34μs per operation

📊 Benchmark Summary
==================================================

spawn:
     100 entities:    45.23μs avg,   22123 ops/sec
     500 entities:    52.18μs avg,   19164 ops/sec
    1000 entities:    58.94μs avg,   16966 ops/sec
    5000 entities:    67.32μs avg,   14854 ops/sec
   10000 entities:    75.89μs avg,   13177 ops/sec
   25000 entities:    89.45μs avg,   11180 ops/sec
   50000 entities:   102.34μs avg,    9771 ops/sec

💾 Memory Usage:
  spawn (100 entities): 0.12 MB
  spawn (500 entities): 0.58 MB
  spawn (1000 entities): 1.15 MB
  spawn (5000 entities): 5.72 MB
  spawn (10000 entities): 11.45 MB
  spawn (25000 entities): 28.67 MB
  spawn (50000 entities): 57.34 MB

⏱️  Total benchmark time: 1247.89ms
```

## Performance Optimization Tips

### 🦊> Entity Management

- **Batch Operations**: Use commands for deferred entity operations
- **Entity Pools**: Reuse entities when possible
- **Generational Indexing**: Leverage built-in use-after-free protection

### 🦦> Component Storage

- **Table Storage**: Use for frequently accessed components
- **SparseSet Storage**: Use for optional components
- **Component Layout**: Group related components together

### 🐺> Query Optimization

- **Query Caching**: Cache query objects outside hot paths
- **Filter Efficiency**: Use appropriate query filters
- **Component Access**: Minimize component lookups

### 🔥> System Performance

- **System Dependencies**: Minimize system dependencies for parallel execution
- **Bulk Operations**: Process entities in batches
- **Resource Access**: Cache resource references

## Examples

See the `example.ts` file for comprehensive usage examples:

- Basic benchmark execution
- Custom configuration
- Category-specific testing
- Performance regression testing
- Stress testing
- Result analysis and export

## Command Line Options

```bash
Options:
  -c, --category <type>    Run specific benchmark category
                          (all, entity, query, system, stress)
  -e, --entities <list>    Comma-separated entity counts
  -i, --iterations <num>   Number of iterations per benchmark
  -w, --warmup <num>       Number of warmup iterations
  -m, --memory            Enable memory usage tracking
  -x, --export <file>     Export results to JSON file
  -h, --help              Show help message
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: ECS Performance Tests
on: [push, pull_request]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npx ts-node packages/games/src/ecs/benchmarks/run-benchmarks.ts
          --export benchmark-results.json
      - name: Upload benchmark results
        uses: actions/upload-artifact@v2
        with:
          name: benchmark-results
          path: benchmark-results.json
```

## Troubleshooting

### Common Issues

1. **Out of Memory**: Reduce entity counts or enable memory tracking
2. **Slow Benchmarks**: Reduce iterations or entity counts for faster testing
3. **Inconsistent Results**: Increase warmup iterations or run multiple times

### Performance Tips

- Run benchmarks on dedicated hardware for consistent results
- Close other applications during benchmarking
- Use release builds for accurate performance measurements
- Consider CPU frequency scaling and thermal throttling

## Contributing

When adding new benchmarks:

1. Follow the existing naming conventions
2. Include comprehensive documentation
3. Add appropriate error handling
4. Test with various entity counts
5. Include memory usage tracking when relevant

## License

This benchmark suite is part of the Reynard ECS system and follows the
same licensing terms.
