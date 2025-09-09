#!/usr/bin/env node

/**
 * PAW Benchmark Runner
 *
 * Executes comprehensive benchmarks comparing PAW algorithms
 * against the original NEXUS implementation.
 */

import { performance } from "perf_hooks";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock implementations for Node.js environment
global.performance = performance;

// Mock the algorithms for demonstration
class MockSpatialCollisionOptimizer {
  constructor(config = {}) {
    this.config = {
      cellSize: 100,
      maxObjectsPerCell: 50,
      enableCaching: true,
      cacheSize: 1000,
      hybridThreshold: 100,
      ...config,
    };
    this.cache = new Map();
  }

  detectCollisions(aabbs) {
    const start = performance.now();
    const collisions = [];

    // Simulate spatial hash optimization
    const cellSize = this.config.cellSize;
    const cells = new Map();

    // Insert objects into spatial cells
    aabbs.forEach((aabb, index) => {
      const cellX = Math.floor(aabb.x / cellSize);
      const cellY = Math.floor(aabb.y / cellSize);
      const cellKey = `${cellX},${cellY}`;

      if (!cells.has(cellKey)) {
        cells.set(cellKey, []);
      }
      cells.get(cellKey).push({ index, aabb });
    });

    // Check collisions within cells and neighboring cells
    const processed = new Set();
    for (let i = 0; i < aabbs.length; i++) {
      if (processed.has(i)) continue;

      const aabb = aabbs[i];
      const cellX = Math.floor(aabb.x / cellSize);
      const cellY = Math.floor(aabb.y / cellSize);

      // Check current cell and neighboring cells
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const cellKey = `${cellX + dx},${cellY + dy}`;
          const cellObjects = cells.get(cellKey) || [];

          for (const obj of cellObjects) {
            const j = obj.index;
            if (j <= i || processed.has(j)) continue;

            if (this.checkCollision(aabb, obj.aabb)) {
              collisions.push({ a: i, b: j });
            }
          }
        }
      }

      processed.add(i);
    }

    const end = performance.now();
    return collisions;
  }

  checkCollision(a, b) {
    return !(
      a.x + a.width <= b.x ||
      b.x + b.width <= a.x ||
      a.y + a.height <= b.y ||
      b.y + b.height <= a.y
    );
  }
}

class MockUnionFind {
  constructor(size) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = new Array(size).fill(0);
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return false;

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }

    return true;
  }

  getAllComponents() {
    const components = new Map();
    for (let i = 0; i < this.parent.length; i++) {
      const root = this.find(i);
      if (!components.has(root)) {
        components.set(root, []);
      }
      components.get(root).push(i);
    }
    return Array.from(components.values());
  }
}

class MockBatchUnionFind extends MockUnionFind {
  constructor(size, batchSize = 100) {
    super(size);
    this.batchSize = batchSize;
    this.pendingUnions = [];
  }

  batchUnion(pairs) {
    this.pendingUnions.push(...pairs);

    if (this.pendingUnions.length >= this.batchSize) {
      this.processBatch();
    }
  }

  processBatch() {
    for (const [x, y] of this.pendingUnions) {
      this.union(x, y);
    }
    this.pendingUnions = [];
  }
}

// Benchmark configuration
const config = {
  iterations: 100,
  warmupRounds: 10,
  objectCounts: [10, 25, 50, 100, 200],
  overlapDensities: [0.1, 0.3, 0.5, 0.7],
  spatialConfigs: [
    { cellSize: 50, maxObjectsPerCell: 25 },
    { cellSize: 100, maxObjectsPerCell: 50 },
    { cellSize: 200, maxObjectsPerCell: 100 },
  ],
};

// Generate test data
function generateTestData(objectCount, overlapDensity) {
  const aabbs = [];
  const baseSize = 50;
  const maxSize = 150;

  for (let i = 0; i < objectCount; i++) {
    const size = baseSize + Math.random() * (maxSize - baseSize);
    let x, y;
    let attempts = 0;

    do {
      x = Math.random() * (800 - size);
      y = Math.random() * (600 - size);
      attempts++;
    } while (
      attempts < 100 &&
      Math.random() < overlapDensity &&
      hasOverlap(aabbs, { x, y, width: size, height: size })
    );

    aabbs.push({ x, y, width: size, height: size });
  }

  return aabbs;
}

function hasOverlap(existing, newBox) {
  return existing.some((box) => checkCollision(box, newBox));
}

function checkCollision(a, b) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

// Benchmark functions
function benchmarkNexusNaive(aabbs) {
  const times = [];
  let collisionCount = 0;

  // Warmup
  for (let i = 0; i < config.warmupRounds; i++) {
    nexusNaiveCollisionDetection(aabbs);
  }

  // Benchmark
  for (let i = 0; i < config.iterations; i++) {
    const start = performance.now();
    collisionCount = nexusNaiveCollisionDetection(aabbs);
    const end = performance.now();
    times.push(end - start);
  }

  return calculateMetrics("NEXUS-Naive", times, collisionCount);
}

function benchmarkPAWSpatial(aabbs, spatialConfig) {
  const optimizer = new MockSpatialCollisionOptimizer(spatialConfig);
  const times = [];
  let collisionCount = 0;

  // Warmup
  for (let i = 0; i < config.warmupRounds; i++) {
    optimizer.detectCollisions(aabbs);
  }

  // Benchmark
  for (let i = 0; i < config.iterations; i++) {
    const start = performance.now();
    const collisions = optimizer.detectCollisions(aabbs);
    const end = performance.now();

    collisionCount = collisions.length;
    times.push(end - start);
  }

  return calculateMetrics("PAW-Spatial", times, collisionCount, spatialConfig);
}

function benchmarkPAWUnionFind(aabbs) {
  const times = [];
  let collisionCount = 0;

  // Warmup
  for (let i = 0; i < config.warmupRounds; i++) {
    pawUnionFindCollisionDetection(aabbs);
  }

  // Benchmark
  for (let i = 0; i < config.iterations; i++) {
    const start = performance.now();
    collisionCount = pawUnionFindCollisionDetection(aabbs);
    const end = performance.now();
    times.push(end - start);
  }

  return calculateMetrics("PAW-UnionFind", times, collisionCount);
}

function nexusNaiveCollisionDetection(aabbs) {
  let collisionCount = 0;

  for (let i = 0; i < aabbs.length; i++) {
    for (let j = i + 1; j < aabbs.length; j++) {
      if (checkCollision(aabbs[i], aabbs[j])) {
        collisionCount++;
      }
    }
  }

  return collisionCount;
}

function pawUnionFindCollisionDetection(aabbs) {
  const unionFind = new MockBatchUnionFind(aabbs.length);

  // Find all collisions and union connected components
  for (let i = 0; i < aabbs.length; i++) {
    for (let j = i + 1; j < aabbs.length; j++) {
      if (checkCollision(aabbs[i], aabbs[j])) {
        unionFind.union(i, j);
      }
    }
  }

  // Count connected components
  const components = unionFind.getAllComponents();
  return components.reduce((total, component) => total + component.length, 0);
}

function calculateMetrics(algorithm, times, collisionCount, config = null) {
  const sortedTimes = [...times].sort((a, b) => a - b);
  const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
  const variance =
    times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) /
    times.length;
  const standardDeviation = Math.sqrt(variance);

  return {
    algorithm,
    config,
    metrics: {
      meanTime: mean,
      medianTime: sortedTimes[Math.floor(sortedTimes.length / 2)],
      p95Time: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
      p99Time: sortedTimes[Math.floor(sortedTimes.length * 0.99)],
      minTime: sortedTimes[0],
      maxTime: sortedTimes[sortedTimes.length - 1],
      standardDeviation,
      collisionCount,
    },
    iterations: times.length,
  };
}

// Main benchmark execution
async function runBenchmarks() {
  console.log("🦊> Starting PAW Algorithm Benchmark Suite...");
  const results = [];

  for (const objectCount of config.objectCounts) {
    for (const overlapDensity of config.overlapDensities) {
      console.log(
        `\n🦦> Benchmarking ${objectCount} objects with ${(overlapDensity * 100).toFixed(0)}% overlap density`,
      );

      const testData = generateTestData(objectCount, overlapDensity);

      // Benchmark NEXUS naive approach
      const nexusResult = benchmarkNexusNaive(testData);
      nexusResult.objectCount = objectCount;
      nexusResult.overlapDensity = overlapDensity;
      results.push(nexusResult);

      // Benchmark PAW Union-Find
      const unionFindResult = benchmarkPAWUnionFind(testData);
      unionFindResult.objectCount = objectCount;
      unionFindResult.overlapDensity = overlapDensity;
      results.push(unionFindResult);

      // Benchmark PAW Spatial with different configurations
      for (const spatialConfig of config.spatialConfigs) {
        const spatialResult = benchmarkPAWSpatial(testData, spatialConfig);
        spatialResult.objectCount = objectCount;
        spatialResult.overlapDensity = overlapDensity;
        results.push(spatialResult);
      }
    }
  }

  console.log("🐺> Benchmark suite completed!");

  // Generate summary
  generateSummary(results);

  // Save results
  const outputPath = path.join(__dirname, "benchmark-results.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        config,
        results,
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  console.log(`\n📊 Results saved to: ${outputPath}`);
  return results;
}

function generateSummary(results) {
  console.log("\n📈 PAW Benchmark Summary");
  console.log("=".repeat(50));

  const nexusResults = results.filter((r) => r.algorithm === "NEXUS-Naive");
  const pawResults = results.filter((r) => r.algorithm !== "NEXUS-Naive");

  console.log("\n🦊> Performance Improvements over NEXUS:");
  console.log("Object Count | Algorithm      | Improvement");
  console.log("-".repeat(50));

  for (const nexusResult of nexusResults) {
    const pawResultsForCount = pawResults.filter(
      (r) =>
        r.objectCount === nexusResult.objectCount &&
        r.overlapDensity === nexusResult.overlapDensity,
    );

    for (const pawResult of pawResultsForCount) {
      const improvement =
        ((nexusResult.metrics.meanTime - pawResult.metrics.meanTime) /
          nexusResult.metrics.meanTime) *
        100;
      console.log(
        `${nexusResult.objectCount.toString().padStart(11)} | ${pawResult.algorithm.padEnd(14)} | ${improvement.toFixed(1)}%`,
      );
    }
  }

  // Calculate overall improvements
  const overallImprovements = {};
  for (const pawResult of pawResults) {
    const nexusResult = nexusResults.find(
      (r) =>
        r.objectCount === pawResult.objectCount &&
        r.overlapDensity === pawResult.overlapDensity,
    );

    if (nexusResult) {
      const improvement =
        ((nexusResult.metrics.meanTime - pawResult.metrics.meanTime) /
          nexusResult.metrics.meanTime) *
        100;
      if (!overallImprovements[pawResult.algorithm]) {
        overallImprovements[pawResult.algorithm] = [];
      }
      overallImprovements[pawResult.algorithm].push(improvement);
    }
  }

  console.log("\n🐺> Overall Performance Improvements:");
  for (const [algorithm, improvements] of Object.entries(overallImprovements)) {
    const avgImprovement =
      improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
    const maxImprovement = Math.max(...improvements);
    console.log(
      `${algorithm}: ${avgImprovement.toFixed(1)}% average, ${maxImprovement.toFixed(1)}% maximum`,
    );
  }
}

// Run benchmarks if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBenchmarks().catch(console.error);
}

export { runBenchmarks, config };
