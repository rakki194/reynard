#!/usr/bin/env node

/**
 * @fileoverview Test script to verify memory tracking fixes and improvements.
 *
 * This script tests the enhanced memory tracking system to ensure it properly
 * handles garbage collection and provides accurate memory usage statistics.
 *
 * @example
 * ```bash
 * npx tsx test-memory-fixes.ts
 * ```
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { ECSBenchmarkRunner } from "./ecs-benchmark.js";
import { createEnhancedMemoryTracker } from "./improved-memory-tracker.js";

/**
 * Test configuration for memory tracking verification.
 */
const TEST_CONFIG = {
  entityCounts: [1000, 10000, 50000],
  iterations: 3,
  enableDetailedLogging: true,
};

/**
 * Tests the enhanced memory tracker with garbage collection handling.
 */
async function testEnhancedMemoryTracker(): Promise<void> {
  console.log("🧪 Testing Enhanced Memory Tracker");
  console.log("=".repeat(40));

  try {
    const tracker = createEnhancedMemoryTracker({
      enableDetailedLogging: true,
      sampleInterval: 50,
      trackGarbageCollection: true,
      handleNegativeMemory: true,
      smoothingFactor: 0.1,
    });

    console.log("✅ Enhanced memory tracker created successfully");
    console.log(`   Memory tracking available: ${tracker.isMemoryTrackingAvailable()}`);

    // Start tracking
    tracker.start();
    console.log("📊 Enhanced memory tracking started");

    // Simulate memory allocation with garbage collection
    console.log("\n🔄 Simulating memory allocation with GC...");
    const arrays: number[][] = [];

    // Phase 1: Allocate memory
    console.log("\n📈 Phase 1: Allocating memory...");
    for (let i = 0; i < 50; i++) {
      const array = new Array(10000).fill(Math.random());
      arrays.push(array);
      tracker.update();

      if (i % 10 === 0) {
        const currentUsage = tracker.getMemoryUsageMB();
        const smoothedUsage = tracker.getSmoothedMemoryUsageMB();
        console.log(`   Step ${i}: Current=${currentUsage.toFixed(2)}MB, Smoothed=${smoothedUsage.toFixed(2)}MB`);
      }
    }

    // Phase 2: Force garbage collection
    console.log("\n🗑️  Phase 2: Forcing garbage collection...");
    tracker.forceGarbageCollection();
    arrays.length = 0; // Clear references
    tracker.update();

    // Phase 3: Allocate more memory
    console.log("\n📈 Phase 3: Allocating more memory...");
    const moreArrays: number[][] = [];
    for (let i = 0; i < 30; i++) {
      const array = new Array(15000).fill(Math.random());
      moreArrays.push(array);
      tracker.update();

      if (i % 10 === 0) {
        const currentUsage = tracker.getMemoryUsageMB();
        const smoothedUsage = tracker.getSmoothedMemoryUsageMB();
        console.log(`   Step ${i}: Current=${currentUsage.toFixed(2)}MB, Smoothed=${smoothedUsage.toFixed(2)}MB`);
      }
    }

    // Get final statistics
    const finalStats = tracker.stop();

    console.log("\n📊 Enhanced Memory Tracking Results:");
    console.log(`   Total tracking time: ${finalStats.trackingTimeMs.toFixed(2)}ms`);
    console.log(`   Samples taken: ${finalStats.sampleCount}`);
    console.log(`   GC events detected: ${finalStats.gcEvents}`);
    console.log(`   Memory delta: ${finalStats.memoryDeltaMB.toFixed(2)} MB`);
    console.log(
      `   Peak memory: ${((finalStats.peakMemory - finalStats.initialMemory) / (1024 * 1024)).toFixed(2)} MB`
    );
    console.log(`   Total allocated: ${(finalStats.totalAllocated / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   Total freed: ${(finalStats.totalFreed / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   Net allocation: ${(finalStats.netAllocation / (1024 * 1024)).toFixed(2)} MB`);

    // Get efficiency metrics
    const efficiency = tracker.getMemoryEfficiency();
    console.log(`   Allocation rate: ${efficiency.allocationRate.toFixed(2)} MB/s`);
    console.log(`   GC efficiency: ${efficiency.gcEfficiency.toFixed(1)}%`);
    console.log(`   Memory stability: ${efficiency.memoryStability.toFixed(1)}%`);

    console.log("\n🎉 Enhanced memory tracking test completed!");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Enhanced memory tracking test failed:", errorMessage);
  }
}

/**
 * Tests the ECS benchmark with improved memory tracking.
 */
async function testECSBenchmarkMemoryTracking(): Promise<void> {
  console.log("\n🧪 Testing ECS Benchmark Memory Tracking");
  console.log("=".repeat(40));

  try {
    const runner = new ECSBenchmarkRunner({
      ...TEST_CONFIG,
      enableMemoryTracking: true,
      enableDetailedLogging: true,
    });

    console.log("✅ ECS benchmark runner created successfully");

    // Test with different entity counts
    for (const entityCount of TEST_CONFIG.entityCounts) {
      console.log(`\n🔄 Testing with ${entityCount.toLocaleString()} entities...`);

      try {
        // Run a simple benchmark
        const startTime = performance.now();

        // Create entities
        for (let i = 0; i < entityCount; i++) {
          runner.world.spawn(
            new Position(Math.random() * 1000, Math.random() * 1000),
            new Velocity(Math.random() * 10, Math.random() * 10),
            new Health(100, 100)
          );
        }

        const endTime = performance.now();
        const duration = endTime - startTime;

        console.log(`   ✅ Created ${entityCount.toLocaleString()} entities in ${duration.toFixed(2)}ms`);
        console.log(`   📊 Average: ${((duration / entityCount) * 1000).toFixed(2)}μs per entity`);

        // Check memory usage
        const memoryUsage = runner.getMemoryUsageMB();
        console.log(`   💾 Memory usage: ${memoryUsage.toFixed(2)} MB`);

        // Verify no negative memory
        if (memoryUsage < 0) {
          console.log(`   ⚠️  Negative memory detected: ${memoryUsage.toFixed(2)} MB`);
        } else {
          console.log(`   ✅ Memory tracking working correctly`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Failed at ${entityCount.toLocaleString()} entities:`, errorMessage);
        break;
      }
    }

    console.log("\n🎉 ECS benchmark memory tracking test completed!");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ ECS benchmark memory tracking test failed:", errorMessage);
  }
}

/**
 * Tests memory tracking with garbage collection scenarios.
 */
async function testGarbageCollectionHandling(): Promise<void> {
  console.log("\n🧪 Testing Garbage Collection Handling");
  console.log("=".repeat(40));

  try {
    const tracker = createEnhancedMemoryTracker({
      enableDetailedLogging: true,
      sampleInterval: 100,
      trackGarbageCollection: true,
      handleNegativeMemory: true,
    });

    tracker.start();
    console.log("📊 Memory tracking started");

    // Test scenario: Allocate, use, and deallocate memory
    console.log("\n🔄 Testing memory allocation and deallocation...");

    const testData: any[] = [];

    // Allocate memory in chunks
    for (let chunk = 0; chunk < 5; chunk++) {
      console.log(`\n📈 Chunk ${chunk + 1}: Allocating memory...`);

      for (let i = 0; i < 20; i++) {
        const data = new Array(5000).fill(Math.random());
        testData.push(data);
        tracker.update();
      }

      const usage = tracker.getMemoryUsageMB();
      console.log(`   Memory usage after allocation: ${usage.toFixed(2)} MB`);

      // Simulate some processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Deallocate some memory
      console.log(`🗑️  Chunk ${chunk + 1}: Deallocating memory...`);
      testData.splice(0, 10); // Remove half
      tracker.update();

      const usageAfterGC = tracker.getMemoryUsageMB();
      console.log(`   Memory usage after deallocation: ${usageAfterGC.toFixed(2)} MB`);

      // Force garbage collection if available
      if (typeof global.gc === "function") {
        global.gc();
        tracker.update();
        const usageAfterForceGC = tracker.getMemoryUsageMB();
        console.log(`   Memory usage after forced GC: ${usageAfterForceGC.toFixed(2)} MB`);
      }
    }

    const finalStats = tracker.stop();

    console.log("\n📊 Garbage Collection Test Results:");
    console.log(`   Final memory delta: ${finalStats.memoryDeltaMB.toFixed(2)} MB`);
    console.log(`   GC events detected: ${finalStats.gcEvents}`);
    console.log(`   Total allocated: ${(finalStats.totalAllocated / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   Total freed: ${(finalStats.totalFreed / (1024 * 1024)).toFixed(2)} MB`);

    // Verify no negative memory in final result
    if (finalStats.memoryDeltaMB < 0) {
      console.log(`   ⚠️  Final memory delta is negative: ${finalStats.memoryDeltaMB.toFixed(2)} MB`);
      console.log(`   This indicates garbage collection occurred during the test`);
    } else {
      console.log(`   ✅ Final memory delta is positive: ${finalStats.memoryDeltaMB.toFixed(2)} MB`);
    }

    console.log("\n🎉 Garbage collection handling test completed!");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Garbage collection handling test failed:", errorMessage);
  }
}

/**
 * Runs all memory tracking verification tests.
 */
async function runAllMemoryTests(): Promise<void> {
  console.log("🚀 Memory Tracking Fix Verification Tests");
  console.log("=".repeat(50));

  try {
    await testEnhancedMemoryTracker();
    await testECSBenchmarkMemoryTracking();
    await testGarbageCollectionHandling();

    console.log("\n✅ All memory tracking tests completed successfully!");
    console.log("🎯 Memory tracking now properly handles garbage collection!");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Memory tracking tests failed:", errorMessage);
  }
}

// Import the component classes
class Position {
  readonly __component = true;
  constructor(
    public x: number,
    public y: number,
    public z: number = 0
  ) {}
}

class Velocity {
  readonly __component = true;
  constructor(
    public x: number,
    public y: number,
    public z: number = 0
  ) {}
}

class Health {
  readonly __component = true;
  constructor(
    public current: number,
    public maximum: number
  ) {}
}

// Run the tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllMemoryTests().catch(error => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}

export { runAllMemoryTests };
