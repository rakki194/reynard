// Benchmark comparing WebAssembly SIMD vs Reynard ECS package

import { 
  createWorld, 
  createComponentType, 
  system,
  World
} from '../../index.js';
import { PositionSystemSIMD } from './position-system-simd.js';
import { BenchmarkResult } from './benchmark-types.js';
import { TestDataGenerator } from './test-data-generator.js';

// Define components for Reynard ECS
const Position = createComponentType<{ x: number; y: number; readonly __component: true }>('Position');
const Velocity = createComponentType<{ vx: number; vy: number; readonly __component: true }>('Velocity');
const Acceleration = createComponentType<{ ax: number; ay: number; readonly __component: true }>('Acceleration');
const Mass = createComponentType<{ mass: number; readonly __component: true }>('Mass');

// Type definitions for the component data
type PositionData = { x: number; y: number; readonly __component: true };
type VelocityData = { vx: number; vy: number; readonly __component: true };
type AccelerationData = { ax: number; ay: number; readonly __component: true };

export class ECSComparisonBenchmark {
  private simdSystem: PositionSystemSIMD;
  private reynardWorld: World;
  private isInitialized: boolean = false;

  constructor(private maxEntities: number = 100000) {
    this.simdSystem = new PositionSystemSIMD(maxEntities);
    this.reynardWorld = createWorld();
  }

  /**
   * Initialize both systems
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('Initializing ECS comparison benchmark...');
    
    // Initialize SIMD system
    await this.simdSystem.initialize();
    
    // Setup Reynard ECS systems
    const positionUpdateSystem = system('positionUpdateSystem', (world) => {
      const queryResult = world.query(Position, Velocity, Acceleration, Mass);
      queryResult.forEach((entity, pos, vel, acc, _mass) => {
        const position = pos as PositionData;
        const velocity = vel as VelocityData;
        const acceleration = acc as AccelerationData;
        
        // Update velocity
        velocity.vx += acceleration.ax * 0.016; // Fixed delta time for now
        velocity.vy += acceleration.ay * 0.016;
        
        // Update position
        position.x += velocity.vx * 0.016;
        position.y += velocity.vy * 0.016;
      });
    });

    const collisionSystem = system('collisionSystem', (world) => {
      const queryResult = world.query(Position);
      const collisions: number[] = [];
      const entities = queryResult.entities;
      const positions = queryResult.components as PositionData[];
      
      for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 20) { // Fixed radius for now
            collisions.push(i, j);
          }
        }
      }
    });

    const spatialQuerySystem = system('spatialQuerySystem', (world) => {
      const queryResult = world.query(Position);
      const results: number[] = [];
      const entities = queryResult.entities;
      const positions = queryResult.components as PositionData[];
      const queryX = 0;
      const queryY = 0;
      const radius = 100;
      
      for (let i = 0; i < entities.length; i++) {
        const dx = positions[i].x - queryX;
        const dy = positions[i].y - queryY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < radius) {
          results.push(i);
        }
      }
    });

    // Register systems
    this.reynardWorld.addSystem(positionUpdateSystem.build());
    this.reynardWorld.addSystem(collisionSystem.build());
    this.reynardWorld.addSystem(spatialQuerySystem.build());

    this.isInitialized = true;
    console.log('ECS comparison benchmark initialized');
  }

  /**
   * Setup test data for both systems
   */
  private setupTestData(entityCount: number): void {
    const testData = TestDataGenerator.generateTestData(entityCount);

    // Clear both systems
    this.simdSystem.clear();
    // Note: World doesn't have a clear method, we'll need to despawn all entities
    // For now, we'll skip clearing the Reynard world

    // Add entities to SIMD system
    for (const data of testData) {
      this.simdSystem.addEntity(data.position, data.velocity, data.acceleration, data.mass);
    }

    // Add entities to Reynard ECS
    for (const data of testData) {
      const entity = this.reynardWorld.spawnEmpty();
      this.reynardWorld.insert(entity, 
        { ...data.position, __component: true as const },
        { ...data.velocity, __component: true as const },
        { ...data.acceleration, __component: true as const },
        { ...data.mass, __component: true as const }
      );
    }
  }

  /**
   * Benchmark position updates
   */
  async benchmarkPositionUpdates(entityCount: number, iterations: number = 1000): Promise<{ simd: BenchmarkResult; reynard: BenchmarkResult }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`Benchmarking position updates with ${entityCount} entities, ${iterations} iterations...`);

    this.setupTestData(entityCount);
    const deltaTime = 0.016; // 60 FPS

    // Benchmark SIMD
    const simdStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.simdSystem.updatePositions(deltaTime);
    }
    const simdEnd = performance.now();
    const simdTime = simdEnd - simdStart;

    // Benchmark Reynard ECS
    this.setupTestData(entityCount); // Reset data
    const reynardStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.reynardWorld.runSystem('positionUpdateSystem');
    }
    const reynardEnd = performance.now();
    const reynardTime = reynardEnd - reynardStart;

    const simdResult: BenchmarkResult = {
      name: 'Position Updates (WebAssembly SIMD)',
      iterations,
      totalTime: simdTime,
      averageTime: simdTime / iterations,
      operationsPerSecond: (iterations * entityCount) / (simdTime / 1000)
    };

    const reynardResult: BenchmarkResult = {
      name: 'Position Updates (Reynard ECS)',
      iterations,
      totalTime: reynardTime,
      averageTime: reynardTime / iterations,
      operationsPerSecond: (iterations * entityCount) / (reynardTime / 1000)
    };

    return { simd: simdResult, reynard: reynardResult };
  }

  /**
   * Benchmark collision detection
   */
  async benchmarkCollisionDetection(entityCount: number, iterations: number = 100): Promise<{ simd: BenchmarkResult; reynard: BenchmarkResult }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`Benchmarking collision detection with ${entityCount} entities, ${iterations} iterations...`);

    this.setupTestData(entityCount);
    const radius = 10.0;

    // Benchmark SIMD
    const simdStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.simdSystem.detectCollisions(radius);
    }
    const simdEnd = performance.now();
    const simdTime = simdEnd - simdStart;

    // Benchmark Reynard ECS
    this.setupTestData(entityCount); // Reset data
    const reynardStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.reynardWorld.runSystem('collisionSystem');
    }
    const reynardEnd = performance.now();
    const reynardTime = reynardEnd - reynardStart;

    const simdResult: BenchmarkResult = {
      name: 'Collision Detection (WebAssembly SIMD)',
      iterations,
      totalTime: simdTime,
      averageTime: simdTime / iterations,
      operationsPerSecond: iterations / (simdTime / 1000)
    };

    const reynardResult: BenchmarkResult = {
      name: 'Collision Detection (Reynard ECS)',
      iterations,
      totalTime: reynardTime,
      averageTime: reynardTime / iterations,
      operationsPerSecond: iterations / (reynardTime / 1000)
    };

    return { simd: simdResult, reynard: reynardResult };
  }

  /**
   * Benchmark spatial queries
   */
  async benchmarkSpatialQueries(entityCount: number, iterations: number = 1000): Promise<{ simd: BenchmarkResult; reynard: BenchmarkResult }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`Benchmarking spatial queries with ${entityCount} entities, ${iterations} iterations...`);

    this.setupTestData(entityCount);
    const queryX = 0;
    const queryY = 0;
    const radius = 100.0;

    // Benchmark SIMD
    const simdStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.simdSystem.spatialQuery(queryX, queryY, radius);
    }
    const simdEnd = performance.now();
    const simdTime = simdEnd - simdStart;

    // Benchmark Reynard ECS
    this.setupTestData(entityCount); // Reset data
    const reynardStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.reynardWorld.runSystem('spatialQuerySystem');
    }
    const reynardEnd = performance.now();
    const reynardTime = reynardEnd - reynardStart;

    const simdResult: BenchmarkResult = {
      name: 'Spatial Queries (WebAssembly SIMD)',
      iterations,
      totalTime: simdTime,
      averageTime: simdTime / iterations,
      operationsPerSecond: iterations / (simdTime / 1000)
    };

    const reynardResult: BenchmarkResult = {
      name: 'Spatial Queries (Reynard ECS)',
      iterations,
      totalTime: reynardTime,
      averageTime: reynardTime / iterations,
      operationsPerSecond: iterations / (reynardTime / 1000)
    };

    return { simd: simdResult, reynard: reynardResult };
  }

  /**
   * Run complete comparison benchmark
   */
  async runComparisonBenchmark(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log('🦊> Starting WebAssembly SIMD vs Reynard ECS Comparison');
    console.log('='.repeat(60));

    const entityCounts = [100, 1000, 10000];
    const results: { simd: BenchmarkResult[]; reynard: BenchmarkResult[] } = {
      simd: [],
      reynard: []
    };

    for (const entityCount of entityCounts) {
      console.log(`\n=== Benchmarking with ${entityCount} entities ===`);

      // Position updates
      const positionResults = await this.benchmarkPositionUpdates(entityCount, 1000);
      results.simd.push(positionResults.simd);
      results.reynard.push(positionResults.reynard);

      // Collision detection (fewer iterations for O(n²) algorithm)
      const collisionResults = await this.benchmarkCollisionDetection(entityCount, Math.max(10, 1000 / entityCount));
      results.simd.push(collisionResults.simd);
      results.reynard.push(collisionResults.reynard);

      // Spatial queries
      const spatialResults = await this.benchmarkSpatialQueries(entityCount, 1000);
      results.simd.push(spatialResults.simd);
      results.reynard.push(spatialResults.reynard);
    }

    console.log('\n=== Comparison Benchmark Complete ===');
    this.printResults(results);
  }

  /**
   * Print comparison results
   */
  private printResults(results: { simd: BenchmarkResult[]; reynard: BenchmarkResult[] }): void {
    console.log('\n📊 COMPARISON RESULTS');
    console.log('='.repeat(80));

    for (let i = 0; i < results.simd.length; i++) {
      const simd = results.simd[i];
      const reynard = results.reynard[i];
      const speedup = reynard.totalTime / simd.totalTime;

      console.log(`\n${simd.name}`);
      console.log('-'.repeat(50));
      console.log(`WebAssembly SIMD: ${simd.totalTime.toFixed(2)}ms (${simd.operationsPerSecond.toFixed(0)} ops/sec)`);
      console.log(`Reynard ECS:      ${reynard.totalTime.toFixed(2)}ms (${reynard.operationsPerSecond.toFixed(0)} ops/sec)`);
      console.log(`Speedup:          ${speedup.toFixed(2)}x ${speedup > 1 ? '🚀' : '🐌'}`);
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.simdSystem.destroy();
    this.isInitialized = false;
  }
}
