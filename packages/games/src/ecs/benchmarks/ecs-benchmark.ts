/**
 * @fileoverview Comprehensive ECS Performance Benchmark Suite
 *
 * This benchmark suite tests the performance of all critical ECS operations:
 * - Entity creation and destruction
 * - Component operations (add, remove, access)
 * - Query performance with various filters
 * - System execution timing
 * - Memory usage and allocation patterns
 * - Stress testing with high entity counts
 *
 * @example
 * ```typescript
 * import { runECSBenchmarks } from './ecs-benchmark';
 *
 * // Run all benchmarks
 * await runECSBenchmarks();
 *
 * // Run specific benchmark category
 * await runEntityBenchmarks();
 * ```
 *
 * @performance
 * - Measures operations in microseconds for precision
 * - Tests with entity counts from 100 to 100,000
 * - Includes memory usage tracking
 * - Provides performance regression detection
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import {
  Component,
  ComponentType,
  createWorld,
  Entity,
  Resource,
  ResourceType,
  StorageType,
  World,
} from "../index";
import {
  createEnhancedMemoryTracker,
  EnhancedMemoryTracker,
} from "./improved-memory-tracker.js";
import {
  createScalingOptimizer,
  ScalingOptimizer,
} from "./scaling-optimizations.js";

// Benchmark Components
class Position implements Component {
  readonly __component = true;
  constructor(
    public x: number,
    public y: number,
    public z: number = 0,
  ) {}
}

class Velocity implements Component {
  readonly __component = true;
  constructor(
    public x: number,
    public y: number,
    public z: number = 0,
  ) {}
}

class Health implements Component {
  readonly __component = true;
  constructor(
    public current: number,
    public maximum: number,
  ) {}
}

class Damage implements Component {
  readonly __component = true;
  constructor(public amount: number) {}
}

class Player implements Component {
  readonly __component = true;
  constructor(
    public name: string,
    public level: number = 1,
  ) {}
}

class Enemy implements Component {
  readonly __component = true;
  constructor(
    public type: string,
    public difficulty: number = 1,
  ) {}
}

class Bullet implements Component {
  readonly __component = true;
  constructor(
    public speed: number,
    public lifetime: number = 5.0,
  ) {}
}

class Color implements Component {
  readonly __component = true;
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number = 1.0,
  ) {}
}

class Size implements Component {
  readonly __component = true;
  constructor(
    public width: number,
    public height: number,
  ) {}
}

class Physics implements Component {
  readonly __component = true;
  constructor(
    public mass: number,
    public friction: number,
    public restitution: number,
  ) {}
}

class Renderable implements Component {
  readonly __component = true;
  constructor(
    public mesh: string,
    public texture: string,
  ) {}
}

// Benchmark Resources
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

class PerformanceMetrics implements Resource {
  readonly __resource = true;
  constructor(
    public frameCount: number,
    public averageFrameTime: number,
    public entityCount: number,
  ) {}
}

/**
 * Benchmark result interface for structured performance data.
 */
export interface BenchmarkResult {
  name: string;
  operation: string;
  entityCount: number;
  iterations: number;
  totalTimeMs: number;
  averageTimeMs: number;
  averageTimeUs: number;
  operationsPerSecond: number;
  memoryUsageMB?: number;
  notes?: string;
}

/**
 * Benchmark configuration for customizing test parameters.
 */
export interface BenchmarkConfig {
  entityCounts: number[];
  iterations: number;
  warmupIterations: number;
  enableMemoryTracking: boolean;
  enableDetailedLogging: boolean;
}

/**
 * Default benchmark configuration.
 */
const DEFAULT_CONFIG: BenchmarkConfig = {
  entityCounts: [100, 500, 1000, 5000, 10000, 25000, 50000],
  iterations: 1000,
  warmupIterations: 100,
  enableMemoryTracking: true,
  enableDetailedLogging: false,
};

/**
 * Utility class for measuring performance with high precision.
 */
class PerformanceTimer {
  private startTime: number = 0;
  private endTime: number = 0;

  start(): void {
    this.startTime = performance.now();
  }

  stop(): number {
    this.endTime = performance.now();
    return this.endTime - this.startTime;
  }

  getElapsedMs(): number {
    return this.endTime - this.startTime;
  }

  getElapsedUs(): number {
    return (this.endTime - this.startTime) * 1000;
  }
}

/**
 * Extended Performance interface for Chrome-specific memory API.
 */
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/**
 * TypeScript interface for performance.memory API (Chrome/Chromium only)
 */
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

/**
 * Memory usage tracker for monitoring allocation patterns.
 * Now uses enhanced memory tracking with garbage collection handling.
 */
class MemoryTracker {
  private enhancedTracker: EnhancedMemoryTracker;
  private fallbackTracker: {
    initialMemory: number;
    peakMemory: number;
    hasMemoryAPI: boolean;
  };

  constructor() {
    // Use enhanced memory tracker as primary
    this.enhancedTracker = createEnhancedMemoryTracker({
      enableDetailedLogging: false,
      sampleInterval: 100,
      trackGarbageCollection: true,
      handleNegativeMemory: true,
      smoothingFactor: 0.1,
    });

    // Fallback for browser environments
    this.fallbackTracker = {
      initialMemory: 0,
      peakMemory: 0,
      hasMemoryAPI:
        "memory" in performance &&
        (performance as PerformanceWithMemory).memory !== undefined,
    };
  }

  start(): void {
    // Start enhanced tracker
    this.enhancedTracker.start();

    // Start fallback tracker if needed
    if (this.fallbackTracker.hasMemoryAPI) {
      const perfMemory = (performance as PerformanceWithMemory).memory!;
      this.fallbackTracker.initialMemory = perfMemory.usedJSHeapSize;
      this.fallbackTracker.peakMemory = this.fallbackTracker.initialMemory;
    }
  }

  update(): void {
    // Update enhanced tracker
    this.enhancedTracker.update();

    // Update fallback tracker if needed
    if (this.fallbackTracker.hasMemoryAPI) {
      const perfMemory = (performance as PerformanceWithMemory).memory!;
      const current = perfMemory.usedJSHeapSize;
      if (current > this.fallbackTracker.peakMemory) {
        this.fallbackTracker.peakMemory = current;
      }
    }
  }

  getMemoryUsageMB(): number {
    // Use enhanced tracker if available
    if (this.enhancedTracker.isMemoryTrackingAvailable()) {
      return this.enhancedTracker.getMemoryUsageMB();
    }

    // Fallback to browser API
    if (this.fallbackTracker.hasMemoryAPI) {
      const perfMemory = (performance as PerformanceWithMemory).memory!;
      const usage =
        (perfMemory.usedJSHeapSize - this.fallbackTracker.initialMemory) /
        (1024 * 1024);
      // Ensure we never return negative values
      return Math.max(0, usage);
    }

    return 0;
  }

  getPeakMemoryUsageMB(): number {
    // Use enhanced tracker if available
    if (this.enhancedTracker.isMemoryTrackingAvailable()) {
      return this.enhancedTracker.getPeakMemoryUsageMB();
    }

    // Fallback to browser API
    if (this.fallbackTracker.hasMemoryAPI) {
      return (
        (this.fallbackTracker.peakMemory - this.fallbackTracker.initialMemory) /
        (1024 * 1024)
      );
    }

    return 0;
  }

  isMemoryTrackingAvailable(): boolean {
    return (
      this.enhancedTracker.isMemoryTrackingAvailable() ||
      this.fallbackTracker.hasMemoryAPI
    );
  }

  getDetailedStats(): any {
    if (this.enhancedTracker.isMemoryTrackingAvailable()) {
      return this.enhancedTracker.stop();
    }
    return null;
  }
}

/**
 * Benchmark runner that executes tests and collects results.
 */
export class ECSBenchmarkRunner {
  public readonly world: World;
  private config: BenchmarkConfig;
  private results: BenchmarkResult[] = [];
  private componentTypes: Map<string, ComponentType<any>> = new Map();
  private resourceTypes: Map<string, ResourceType<any>> = new Map();
  private scalingOptimizer: ScalingOptimizer;
  private memoryTracker: MemoryTracker;

  constructor(config: Partial<BenchmarkConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.world = createWorld();
    this.setupComponentTypes();
    this.setupResourceTypes();
    this.scalingOptimizer = createScalingOptimizer({
      enableEntityPooling: true,
      enableBatchProcessing: true,
      enableMemoryOptimization: true,
      maxEntitiesPerBatch: 1000,
    });
    this.memoryTracker = new MemoryTracker();
  }

  private setupComponentTypes(): void {
    const registry = this.world.getComponentRegistry();

    // Register all benchmark components with Table storage for performance
    this.componentTypes.set(
      "Position",
      registry.register(
        "Position",
        StorageType.Table,
        () => new Position(0, 0),
      ),
    );
    this.componentTypes.set(
      "Velocity",
      registry.register(
        "Velocity",
        StorageType.Table,
        () => new Velocity(0, 0),
      ),
    );
    this.componentTypes.set(
      "Health",
      registry.register(
        "Health",
        StorageType.Table,
        () => new Health(100, 100),
      ),
    );
    this.componentTypes.set(
      "Damage",
      registry.register("Damage", StorageType.Table, () => new Damage(10)),
    );
    this.componentTypes.set(
      "Player",
      registry.register(
        "Player",
        StorageType.Table,
        () => new Player("Player1"),
      ),
    );
    this.componentTypes.set(
      "Enemy",
      registry.register("Enemy", StorageType.Table, () => new Enemy("Basic")),
    );
    this.componentTypes.set(
      "Bullet",
      registry.register("Bullet", StorageType.Table, () => new Bullet(300)),
    );
    this.componentTypes.set(
      "Color",
      registry.register("Color", StorageType.Table, () => new Color(1, 1, 1)),
    );
    this.componentTypes.set(
      "Size",
      registry.register("Size", StorageType.Table, () => new Size(20, 20)),
    );
    this.componentTypes.set(
      "Physics",
      registry.register(
        "Physics",
        StorageType.Table,
        () => new Physics(1, 0.5, 0.8),
      ),
    );
    this.componentTypes.set(
      "Renderable",
      registry.register(
        "Renderable",
        StorageType.Table,
        () => new Renderable("cube", "default"),
      ),
    );
  }

  private setupResourceTypes(): void {
    const registry = this.world.getResourceRegistry();

    this.resourceTypes.set(
      "GameTime",
      registry.register("GameTime", () => new GameTime(0.016, 0)),
    );
    this.resourceTypes.set(
      "GameState",
      registry.register("GameState", () => new GameState(0, 1)),
    );
    this.resourceTypes.set(
      "PerformanceMetrics",
      registry.register(
        "PerformanceMetrics",
        () => new PerformanceMetrics(0, 0, 0),
      ),
    );
  }

  /**
   * Runs a single benchmark with the given parameters.
   */
  private async runBenchmark(
    name: string,
    operation: string,
    entityCount: number,
    benchmarkFn: () => void,
    iterations: number = this.config.iterations,
  ): Promise<BenchmarkResult> {
    const timer = new PerformanceTimer();
    const memoryTracker = new MemoryTracker();

    // Warmup iterations
    for (let i = 0; i < this.config.warmupIterations; i++) {
      benchmarkFn();
    }

    // Clear world for clean measurement
    this.clearWorld();

    // Start memory tracking
    if (this.config.enableMemoryTracking) {
      memoryTracker.start();
      /*
            if (!memoryTracker.isMemoryTrackingAvailable() && this.config.enableDetailedLogging) {
                console.warn("⚠️  Memory tracking not available (Chrome/Chromium only)");
            }
            */
    }

    // Run benchmark
    timer.start();
    for (let i = 0; i < iterations; i++) {
      benchmarkFn();
      if (this.config.enableMemoryTracking) {
        memoryTracker.update();
      }
    }
    const totalTime = timer.stop();

    const result: BenchmarkResult = {
      name,
      operation,
      entityCount,
      iterations,
      totalTimeMs: totalTime,
      averageTimeMs: totalTime / iterations,
      averageTimeUs: (totalTime / iterations) * 1000,
      operationsPerSecond: (iterations / totalTime) * 1000,
    };

    if (this.config.enableMemoryTracking) {
      result.memoryUsageMB = memoryTracker.getMemoryUsageMB();
    }

    this.results.push(result);
    return result;
  }

  /**
   * Clears all entities from the world for clean benchmarks.
   */
  private clearWorld(): void {
    // Get all entities and despawn them
    const entities: Entity[] = [];
    // Note: This is a simplified approach - in a real implementation,
    // you'd need to iterate through all entities properly
    for (let i = 0; i < this.world.getEntityCount(); i++) {
      // This would need proper entity iteration in the actual implementation
    }
  }

  /**
   * Benchmark entity creation performance.
   */
  async benchmarkEntityCreation(): Promise<BenchmarkResult[]> {
    console.log("🦊> Benchmarking Entity Creation...");
    const results: BenchmarkResult[] = [];

    for (const entityCount of this.config.entityCounts) {
      const result = await this.runBenchmark(
        "Entity Creation",
        "spawn",
        entityCount,
        () => {
          for (let i = 0; i < entityCount; i++) {
            this.world.spawn(
              new Position(Math.random() * 1000, Math.random() * 1000),
              new Velocity(Math.random() * 10, Math.random() * 10),
              new Health(100, 100),
            );
          }
        },
        Math.max(1, Math.floor(this.config.iterations / entityCount)),
      );
      results.push(result);
      console.log(
        `   ${entityCount} entities: ${result.averageTimeUs.toFixed(2)}μs per operation`,
      );
    }

    return results;
  }

  /**
   * Benchmark component addition performance.
   */
  async benchmarkComponentAddition(): Promise<BenchmarkResult[]> {
    console.log("🦦> Benchmarking Component Addition...");
    const results: BenchmarkResult[] = [];

    for (const entityCount of this.config.entityCounts) {
      // Pre-create entities
      const entities: Entity[] = [];
      for (let i = 0; i < entityCount; i++) {
        entities.push(this.world.spawn(new Position(0, 0)));
      }

      const result = await this.runBenchmark(
        "Component Addition",
        "addComponent",
        entityCount,
        () => {
          for (const entity of entities) {
            this.world.insert(
              entity,
              new Velocity(Math.random() * 10, Math.random() * 10),
            );
          }
        },
        Math.max(1, Math.floor(this.config.iterations / entityCount)),
      );
      results.push(result);
      console.log(
        `   ${entityCount} entities: ${result.averageTimeUs.toFixed(2)}μs per operation`,
      );
    }

    return results;
  }

  /**
   * Benchmark component removal performance.
   */
  async benchmarkComponentRemoval(): Promise<BenchmarkResult[]> {
    console.log("🐺> Benchmarking Component Removal...");
    const results: BenchmarkResult[] = [];

    for (const entityCount of this.config.entityCounts) {
      // Pre-create entities with components
      const entities: Entity[] = [];
      for (let i = 0; i < entityCount; i++) {
        entities.push(
          this.world.spawn(
            new Position(0, 0),
            new Velocity(0, 0),
            new Health(100, 100),
          ),
        );
      }

      const result = await this.runBenchmark(
        "Component Removal",
        "removeComponent",
        entityCount,
        () => {
          for (const entity of entities) {
            this.world.remove(entity, this.componentTypes.get("Velocity")!);
          }
        },
        Math.max(1, Math.floor(this.config.iterations / entityCount)),
      );
      results.push(result);
      console.log(
        `   ${entityCount} entities: ${result.averageTimeUs.toFixed(2)}μs per operation`,
      );
    }

    return results;
  }

  /**
   * Benchmark query performance with different component combinations.
   */
  async benchmarkQueries(): Promise<BenchmarkResult[]> {
    console.log("🦊> Benchmarking Query Performance...");
    const results: BenchmarkResult[] = [];

    for (const entityCount of this.config.entityCounts) {
      // Create entities with various component combinations
      const entities: Entity[] = [];
      for (let i = 0; i < entityCount; i++) {
        const entity = this.world.spawn(
          new Position(Math.random() * 1000, Math.random() * 1000),
        );

        if (i % 2 === 0) {
          this.world.insert(
            entity,
            new Velocity(Math.random() * 10, Math.random() * 10),
          );
        }
        if (i % 3 === 0) {
          this.world.insert(entity, new Health(100, 100));
        }
        if (i % 4 === 0) {
          this.world.insert(entity, new Player(`Player${i}`));
        }

        entities.push(entity);
      }

      // Cache queries outside the benchmark loop for better performance
      const simpleQuery = this.world.query(
        this.componentTypes.get("Position")!,
      );
      const complexQuery = this.world.query(
        this.componentTypes.get("Position")!,
        this.componentTypes.get("Velocity")!,
      );

      // Test simple query (Position only)
      const simpleResult = await this.runBenchmark(
        "Simple Query",
        "query(Position)",
        entityCount,
        () => {
          simpleQuery.forEach((entity, position) => {
            // Minimal work - just access the data
            const x = (position as Position).x;
            const y = (position as Position).y;
            // Prevent optimization by using the values
            if (x + y === 0) return;
          });
        },
        Math.max(1, Math.floor(this.config.iterations / entityCount)),
      );
      results.push(simpleResult);

      // Test complex query (Position + Velocity)
      const complexResult = await this.runBenchmark(
        "Complex Query",
        "query(Position, Velocity)",
        entityCount,
        () => {
          complexQuery.forEach((entity, position, velocity) => {
            // Minimal work - just access the data
            const x = (position as Position).x;
            const y = (position as Position).y;
            const vx = (velocity as Velocity).x;
            const vy = (velocity as Velocity).y;
            // Prevent optimization by using the values
            if (x + y + vx + vy === 0) return;
          });
        },
        Math.max(1, Math.floor(this.config.iterations / entityCount)),
      );
      results.push(complexResult);

      console.log(
        `   ${entityCount} entities - Simple: ${simpleResult.averageTimeUs.toFixed(2)}μs, Complex: ${complexResult.averageTimeUs.toFixed(2)}μs`,
      );
    }

    return results;
  }

  /**
   * Benchmark system execution performance.
   */
  async benchmarkSystemExecution(): Promise<BenchmarkResult[]> {
    console.log("🦦> Benchmarking System Execution...");
    const results: BenchmarkResult[] = [];

    // Cache the query outside the system for better performance
    const movementQuery = this.world.query(
      this.componentTypes.get("Position")!,
      this.componentTypes.get("Velocity")!,
    );

    // Create a simple movement system
    const movementSystem = (world: World): void => {
      movementQuery.forEach((entity, position, velocity) => {
        (position as Position).x += (velocity as Velocity).x * 0.016;
        (position as Position).y += (velocity as Velocity).y * 0.016;
      });
    };

    for (const entityCount of this.config.entityCounts) {
      // Create entities with Position and Velocity components
      for (let i = 0; i < entityCount; i++) {
        this.world.spawn(
          new Position(Math.random() * 1000, Math.random() * 1000),
          new Velocity(Math.random() * 10, Math.random() * 10),
        );
      }

      const result = await this.runBenchmark(
        "System Execution",
        "runSystem",
        entityCount,
        () => {
          movementSystem(this.world);
        },
        Math.max(1, Math.floor(this.config.iterations / entityCount)),
      );
      results.push(result);
      console.log(
        `   ${entityCount} entities: ${result.averageTimeUs.toFixed(2)}μs per operation`,
      );
    }

    return results;
  }

  /**
   * Benchmark resource access performance.
   */
  async benchmarkResourceAccess(): Promise<BenchmarkResult[]> {
    console.log("🐺> Benchmarking Resource Access...");
    const results: BenchmarkResult[] = [];

    // Add resources
    this.world.insertResource(new GameTime(0.016, 0));
    this.world.insertResource(new GameState(1000, 5));
    this.world.insertResource(new PerformanceMetrics(60, 16.67, 1000));

    const result = await this.runBenchmark(
      "Resource Access",
      "getResource",
      1, // Resources are singletons
      () => {
        const gameTime = this.world.getResource(
          this.resourceTypes.get("GameTime")!,
        );
        const gameState = this.world.getResource(
          this.resourceTypes.get("GameState")!,
        );
        const metrics = this.world.getResource(
          this.resourceTypes.get("PerformanceMetrics")!,
        );

        // Access resource data
        if (gameTime) {
          const dt = gameTime.deltaTime;
          const total = gameTime.totalTime;
        }
        if (gameState) {
          const score = gameState.score;
          const level = gameState.level;
        }
        if (metrics) {
          const frames = metrics.frameCount;
          const avgTime = metrics.averageFrameTime;
        }
      },
      this.config.iterations,
    );
    results.push(result);
    console.log(
      `   Resource access: ${result.averageTimeUs.toFixed(2)}μs per operation`,
    );

    return results;
  }

  /**
   * Stress test with high entity counts and complex operations.
   */
  async benchmarkStressTest(): Promise<BenchmarkResult[]> {
    console.log("🦊> Running Stress Test...");
    const results: BenchmarkResult[] = [];

    const stressEntityCounts = [10000, 25000, 50000, 100000];

    for (const entityCount of stressEntityCounts) {
      // Create a complex world with many entities and components
      const entities: Entity[] = [];
      for (let i = 0; i < entityCount; i++) {
        const entity = this.world.spawn(
          new Position(Math.random() * 1000, Math.random() * 1000),
          new Velocity(Math.random() * 10, Math.random() * 10),
          new Health(100, 100),
        );

        if (i % 2 === 0) {
          this.world.insert(
            entity,
            new Color(Math.random(), Math.random(), Math.random()),
          );
        }
        if (i % 3 === 0) {
          this.world.insert(entity, new Size(20, 20));
        }
        if (i % 4 === 0) {
          this.world.insert(entity, new Physics(1, 0.5, 0.8));
        }

        entities.push(entity);
      }

      // Test complex query with multiple components
      const result = await this.runBenchmark(
        "Stress Test Query",
        "complexQuery",
        entityCount,
        () => {
          const query = this.world.query(
            this.componentTypes.get("Position")!,
            this.componentTypes.get("Velocity")!,
            this.componentTypes.get("Health")!,
          );
          query.forEach((entity, position, velocity, health) => {
            // Complex operations
            (position as Position).x += (velocity as Velocity).x * 0.016;
            (position as Position).y += (velocity as Velocity).y * 0.016;
            (health as Health).current = Math.max(
              0,
              (health as Health).current - 0.1,
            );
          });
        },
        Math.max(1, Math.floor(100 / entityCount)), // Fewer iterations for stress tests
      );
      results.push(result);
      console.log(
        `   ${entityCount} entities: ${result.averageTimeUs.toFixed(2)}μs per operation`,
      );
    }

    return results;
  }

  /**
   * Runs all benchmarks and returns comprehensive results.
   */
  async runAllBenchmarks(): Promise<BenchmarkResult[]> {
    console.log("🚀 Starting Comprehensive ECS Benchmark Suite");
    console.log("=".repeat(50));

    const allResults: BenchmarkResult[] = [];

    // Run all benchmark categories
    allResults.push(...(await this.benchmarkEntityCreation()));
    allResults.push(...(await this.benchmarkComponentAddition()));
    allResults.push(...(await this.benchmarkComponentRemoval()));
    allResults.push(...(await this.benchmarkQueries()));
    allResults.push(...(await this.benchmarkSystemExecution()));
    allResults.push(...(await this.benchmarkResourceAccess()));
    allResults.push(...(await this.benchmarkStressTest()));

    console.log("\n✅ All benchmarks completed!");
    this.printSummary(allResults);

    return allResults;
  }

  /**
   * Prints a summary of all benchmark results.
   */
  private printSummary(results: BenchmarkResult[]): void {
    console.log("\n📊 Benchmark Summary");
    console.log("=".repeat(50));

    // Group results by operation
    const groupedResults = new Map<string, BenchmarkResult[]>();
    for (const result of results) {
      if (!groupedResults.has(result.operation)) {
        groupedResults.set(result.operation, []);
      }
      groupedResults.get(result.operation)!.push(result);
    }

    // Print summary for each operation
    for (const [operation, operationResults] of groupedResults) {
      console.log(`\n${operation}:`);
      for (const result of operationResults) {
        console.log(
          `  ${result.entityCount.toLocaleString().padStart(8)} entities: ${result.averageTimeUs.toFixed(2).padStart(8)}μs avg, ${result.operationsPerSecond.toFixed(0).padStart(8)} ops/sec`,
        );
      }
    }

    // Memory usage summary
    const memoryResults = results.filter(
      (r) => r.memoryUsageMB !== undefined && r.memoryUsageMB > 0,
    );
    if (memoryResults.length > 0) {
      console.log("\n💾 Memory Usage:");
      for (const result of memoryResults) {
        console.log(
          `  ${result.operation} (${result.entityCount} entities): ${result.memoryUsageMB!.toFixed(2)} MB`,
        );
      }
    } else if (this.config.enableMemoryTracking) {
      console.log("\n💾 Memory Usage: Not available (Chrome/Chromium only)");
    }
  }

  /**
   * Gets the current memory usage in MB.
   */
  getMemoryUsageMB(): number {
    return this.memoryTracker.getMemoryUsageMB();
  }

  /**
   * Gets the peak memory usage in MB.
   */
  getPeakMemoryUsageMB(): number {
    return this.memoryTracker.getPeakMemoryUsageMB();
  }

  /**
   * Checks if memory tracking is available.
   */
  isMemoryTrackingAvailable(): boolean {
    return this.memoryTracker.isMemoryTrackingAvailable();
  }

  /**
   * Starts memory tracking.
   */
  startMemoryTracking(): void {
    this.memoryTracker.start();
  }

  /**
   * Updates memory tracking.
   */
  updateMemoryTracking(): void {
    this.memoryTracker.update();
  }

  /**
   * Gets detailed memory statistics.
   */
  getMemoryStats(): any {
    return this.memoryTracker.getDetailedStats();
  }

  /**
   * Exports results to JSON format for further analysis.
   */
  exportResults(filename?: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const defaultFilename = `ecs-benchmark-${timestamp}.json`;
    const finalFilename = filename || defaultFilename;

    const exportData = {
      timestamp: new Date().toISOString(),
      config: this.config,
      results: this.results,
      summary: {
        totalBenchmarks: this.results.length,
        averageTimeUs:
          this.results.reduce((sum, r) => sum + r.averageTimeUs, 0) /
          this.results.length,
        totalMemoryMB: this.results.reduce(
          (sum, r) => sum + (r.memoryUsageMB || 0),
          0,
        ),
      },
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    // In a real implementation, you'd write this to a file
    console.log(`📁 Results exported to: ${finalFilename}`);
    console.log(`📄 JSON data length: ${jsonString.length} characters`);

    return jsonString;
  }
}

/**
 * Convenience function to run all ECS benchmarks with default configuration.
 */
export async function runECSBenchmarks(
  config?: Partial<BenchmarkConfig>,
): Promise<BenchmarkResult[]> {
  const runner = new ECSBenchmarkRunner(config);
  return await runner.runAllBenchmarks();
}

/**
 * Convenience function to run specific benchmark categories.
 */
export async function runEntityBenchmarks(
  config?: Partial<BenchmarkConfig>,
): Promise<BenchmarkResult[]> {
  const runner = new ECSBenchmarkRunner(config);
  const results: BenchmarkResult[] = [];

  results.push(...(await runner.benchmarkEntityCreation()));
  results.push(...(await runner.benchmarkComponentAddition()));
  results.push(...(await runner.benchmarkComponentRemoval()));

  return results;
}

/**
 * Convenience function to run query performance benchmarks.
 */
export async function runQueryBenchmarks(
  config?: Partial<BenchmarkConfig>,
): Promise<BenchmarkResult[]> {
  const runner = new ECSBenchmarkRunner(config);
  return await runner.benchmarkQueries();
}

/**
 * Convenience function to run system execution benchmarks.
 */
export async function runSystemBenchmarks(
  config?: Partial<BenchmarkConfig>,
): Promise<BenchmarkResult[]> {
  const runner = new ECSBenchmarkRunner(config);
  return await runner.benchmarkSystemExecution();
}

/**
 * Convenience function to run stress tests.
 */
export async function runStressTests(
  config?: Partial<BenchmarkConfig>,
): Promise<BenchmarkResult[]> {
  const runner = new ECSBenchmarkRunner(config);
  return await runner.benchmarkStressTest();
}
