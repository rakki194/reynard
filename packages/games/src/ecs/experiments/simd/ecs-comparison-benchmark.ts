// Benchmark comparing WebAssembly SIMD vs Reynard ECS package

import { PositionSystemSIMD } from './position-system-simd.js';
import { BenchmarkResults } from './benchmark-types.js';
import { TestDataGenerator } from './test-data-generator.js';
import { ECSBenchmarkRunner } from './benchmark-runner.js';
import { ECSSystemSetup } from './system-setup.js';
import { BenchmarkResultsFormatter } from './benchmark-results.js';

export class ECSComparisonBenchmark {
  private simdSystem: PositionSystemSIMD;
  private systemSetup: ECSSystemSetup;
  private benchmarkRunner!: ECSBenchmarkRunner;
  private isInitialized: boolean = false;

  constructor(private maxEntities: number = 100000) {
    this.simdSystem = new PositionSystemSIMD(maxEntities);
    this.systemSetup = new ECSSystemSetup(maxEntities);
  }

  /**
   * Initialize both systems
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('Initializing ECS comparison benchmark...');
    
    await this.simdSystem.initialize();
    await this.systemSetup.initialize();
    
    this.benchmarkRunner = new ECSBenchmarkRunner(
      this.simdSystem,
      this.systemSetup.getWorld(),
      (entityCount) => this.setupTestData(entityCount)
    );

    this.isInitialized = true;
    console.log('ECS comparison benchmark initialized');
  }

  /**
   * Setup test data for both systems
   */
  private setupTestData(entityCount: number): void {
    const testData = TestDataGenerator.generateTestData(entityCount);
    this.simdSystem.clear();

    for (const data of testData) {
      this.simdSystem.addEntity(data.position, data.velocity, data.acceleration, data.mass);
    }

    this.systemSetup.setupTestData(entityCount);
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
    const results: BenchmarkResults = { simd: [], reynard: [] };

    for (const entityCount of entityCounts) {
      console.log(`\n=== Benchmarking with ${entityCount} entities ===`);
      await this.runBenchmarkSuite(entityCount, results);
    }

    console.log('\n=== Comparison Benchmark Complete ===');
    BenchmarkResultsFormatter.printResults(results);
  }

  private async runBenchmarkSuite(entityCount: number, results: BenchmarkResults): Promise<void> {
    const positionResults = await this.benchmarkRunner.benchmarkPositionUpdates(entityCount, 1000);
    results.simd.push(positionResults.simd);
    results.reynard.push(positionResults.reynard);

    const collisionResults = await this.benchmarkRunner.benchmarkCollisionDetection(entityCount, Math.max(10, 1000 / entityCount));
    results.simd.push(collisionResults.simd);
    results.reynard.push(collisionResults.reynard);

    const spatialResults = await this.benchmarkRunner.benchmarkSpatialQueries(entityCount, 1000);
    results.simd.push(spatialResults.simd);
    results.reynard.push(spatialResults.reynard);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.simdSystem.destroy();
    this.isInitialized = false;
  }
}
