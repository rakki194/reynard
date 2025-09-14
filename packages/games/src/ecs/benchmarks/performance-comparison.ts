#!/usr/bin/env node

/**
 * @fileoverview ECS Performance Comparison with Industry Benchmarks
 *
 * This script compares your ECS performance against known industry benchmarks
 * from various ECS implementations and provides analysis.
 *
 * @example
 * ```bash
 * npx tsx performance-comparison.ts
 * ```
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { ECSBenchmarkRunner } from "./ecs-benchmark.js";

/**
 * Industry benchmark data from various ECS implementations
 */
interface IndustryBenchmark {
  name: string;
  language: string;
  entityCreation: {
    entities: number;
    timePerEntityNs: number;
    operationsPerSecond: number;
  };
  queryPerformance: {
    entities: number;
    timePerQueryUs: number;
    operationsPerSecond: number;
  };
  notes: string;
}

/**
 * Known industry benchmarks for comparison
 */
const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
  {
    name: "Bevy ECS (Rust)",
    language: "Rust",
    entityCreation: {
      entities: 1000000,
      timePerEntityNs: 21.08,
      operationsPerSecond: 47400000,
    },
    queryPerformance: {
      entities: 1000000,
      timePerQueryUs: 40,
      operationsPerSecond: 25000,
    },
    notes: "High-performance Rust ECS with zero-cost abstractions",
  },
  {
    name: "Unity DOTS",
    language: "C#",
    entityCreation: {
      entities: 1000000,
      timePerEntityNs: 45.2,
      operationsPerSecond: 22100000,
    },
    queryPerformance: {
      entities: 1000000,
      timePerQueryUs: 85,
      operationsPerSecond: 11765,
    },
    notes: "Production-ready ECS with Burst compiler optimizations",
  },
  {
    name: "Wolf ECS (JavaScript)",
    language: "JavaScript",
    entityCreation: {
      entities: 100000,
      timePerEntityNs: 1200,
      operationsPerSecond: 833000,
    },
    queryPerformance: {
      entities: 100000,
      timePerQueryUs: 2.6,
      operationsPerSecond: 378471,
    },
    notes: "High-performance JavaScript ECS library",
  },
  {
    name: "Bitecs (JavaScript)",
    language: "JavaScript",
    entityCreation: {
      entities: 100000,
      timePerEntityNs: 1500,
      operationsPerSecond: 667000,
    },
    queryPerformance: {
      entities: 100000,
      timePerQueryUs: 3.0,
      operationsPerSecond: 335064,
    },
    notes: "TypeScript ECS with ArrayBuffer-based storage",
  },
  {
    name: "EnTT (C++)",
    language: "C++",
    entityCreation: {
      entities: 1000000,
      timePerEntityNs: 35.5,
      operationsPerSecond: 28100000,
    },
    queryPerformance: {
      entities: 1000000,
      timePerQueryUs: 55,
      operationsPerSecond: 18182,
    },
    notes: "Fast and modern C++ ECS library",
  },
];

/**
 * Performance comparison results
 */
interface ComparisonResult {
  benchmark: IndustryBenchmark;
  yourECS: {
    entityCreation: {
      timePerEntityUs: number;
      operationsPerSecond: number;
    };
    queryPerformance: {
      timePerQueryUs: number;
      operationsPerSecond: number;
    };
  };
  comparison: {
    entityCreationRatio: number; // Your ECS time / Industry time
    queryPerformanceRatio: number; // Your ECS time / Industry time
    overallScore: number; // 0-100, higher is better
  };
}

/**
 * Runs performance comparison against industry benchmarks
 */
async function runPerformanceComparison(): Promise<void> {
  console.log("🦊> ECS Performance Comparison with Industry Benchmarks");
  console.log("=".repeat(70));

  try {
    // Run your ECS benchmarks
    console.log("🧪 Running your ECS benchmarks...");
    const runner = new ECSBenchmarkRunner({
      entityCounts: [1000, 10000, 100000],
      iterations: 50,
      enableMemoryTracking: false,
    });

    // Get entity creation results
    const entityResults = await runner.benchmarkEntityCreation();
    const queryResults = await runner.benchmarkQueries();

    // Extract performance metrics for 100,000 entities
    const entity100k = entityResults.find((r) => r.entityCount === 100000);
    const query100k = queryResults.find(
      (r) => r.entityCount === 100000 && r.operation === "query(Position)",
    );

    if (!entity100k || !query100k) {
      console.error("❌ Could not find 100k entity benchmark results");
      return;
    }

    const yourECSMetrics = {
      entityCreation: {
        timePerEntityUs: entity100k.averageTimeUs / entity100k.entityCount,
        operationsPerSecond: entity100k.operationsPerSecond,
      },
      queryPerformance: {
        timePerQueryUs: query100k.averageTimeUs,
        operationsPerSecond: query100k.operationsPerSecond,
      },
    };

    console.log("📊 Your ECS Performance:");
    console.log(
      `   Entity Creation (100k): ${yourECSMetrics.entityCreation.timePerEntityUs.toFixed(2)}μs per entity`,
    );
    console.log(
      `   Query Performance (100k): ${yourECSMetrics.queryPerformance.timePerQueryUs.toFixed(2)}μs per query`,
    );
    console.log("");

    // Compare with industry benchmarks
    console.log("🏆 Industry Comparison:");
    console.log("=".repeat(70));

    const comparisons: ComparisonResult[] = [];

    for (const benchmark of INDUSTRY_BENCHMARKS) {
      // Convert industry benchmarks to comparable units
      const industryEntityTimeUs =
        benchmark.entityCreation.timePerEntityNs / 1000; // ns to μs
      const industryQueryTimeUs = benchmark.queryPerformance.timePerQueryUs;

      const entityRatio =
        yourECSMetrics.entityCreation.timePerEntityUs / industryEntityTimeUs;
      const queryRatio =
        yourECSMetrics.queryPerformance.timePerQueryUs / industryQueryTimeUs;

      // Calculate overall score (lower ratio = better performance)
      const overallScore = Math.max(
        0,
        100 - ((entityRatio + queryRatio) / 2) * 50,
      );

      const comparison: ComparisonResult = {
        benchmark,
        yourECS: yourECSMetrics,
        comparison: {
          entityCreationRatio: entityRatio,
          queryPerformanceRatio: queryRatio,
          overallScore,
        },
      };

      comparisons.push(comparison);

      // Print comparison
      console.log(`\n${benchmark.name} (${benchmark.language}):`);
      console.log(
        `   Entity Creation: ${entityRatio.toFixed(2)}x ${entityRatio > 1 ? "slower" : "faster"}`,
      );
      console.log(
        `   Query Performance: ${queryRatio.toFixed(2)}x ${queryRatio > 1 ? "slower" : "faster"}`,
      );
      console.log(`   Overall Score: ${overallScore.toFixed(1)}/100`);
      console.log(`   Notes: ${benchmark.notes}`);
    }

    // Find best and worst comparisons
    const bestComparison = comparisons.reduce((best, current) =>
      current.comparison.overallScore > best.comparison.overallScore
        ? current
        : best,
    );
    const worstComparison = comparisons.reduce((worst, current) =>
      current.comparison.overallScore < worst.comparison.overallScore
        ? current
        : worst,
    );

    console.log("\n🎯 Performance Analysis:");
    console.log("=".repeat(70));
    console.log(
      `🏆 Best Match: ${bestComparison.benchmark.name} (${bestComparison.comparison.overallScore.toFixed(1)}/100)`,
    );
    console.log(
      `📉 Biggest Gap: ${worstComparison.benchmark.name} (${worstComparison.comparison.overallScore.toFixed(1)}/100)`,
    );

    // Calculate average performance
    const avgEntityRatio =
      comparisons.reduce(
        (sum, c) => sum + c.comparison.entityCreationRatio,
        0,
      ) / comparisons.length;
    const avgQueryRatio =
      comparisons.reduce(
        (sum, c) => sum + c.comparison.queryPerformanceRatio,
        0,
      ) / comparisons.length;
    const avgScore =
      comparisons.reduce((sum, c) => sum + c.comparison.overallScore, 0) /
      comparisons.length;

    console.log(`\n📊 Average Performance:`);
    console.log(
      `   Entity Creation: ${avgEntityRatio.toFixed(2)}x industry average`,
    );
    console.log(
      `   Query Performance: ${avgQueryRatio.toFixed(2)}x industry average`,
    );
    console.log(`   Overall Score: ${avgScore.toFixed(1)}/100`);

    // Performance recommendations
    console.log("\n💡 Optimization Recommendations:");
    if (avgEntityRatio > 2) {
      console.log(
        "   🔧 Entity creation is slower than industry average - consider optimizing entity allocation",
      );
    }
    if (avgQueryRatio > 2) {
      console.log(
        "   🔧 Query performance is slower than industry average - consider optimizing component storage",
      );
    }
    if (avgScore > 80) {
      console.log(
        "   🎉 Excellent performance! Your ECS is competitive with industry leaders",
      );
    } else if (avgScore > 60) {
      console.log("   👍 Good performance with room for optimization");
    } else {
      console.log(
        "   ⚠️  Performance needs improvement - consider architectural changes",
      );
    }

    // Language-specific insights
    const jsBenchmarks = comparisons.filter(
      (c) => c.benchmark.language === "JavaScript",
    );
    if (jsBenchmarks.length > 0) {
      const jsAvgScore =
        jsBenchmarks.reduce((sum, c) => sum + c.comparison.overallScore, 0) /
        jsBenchmarks.length;
      console.log(
        `\n🌐 JavaScript ECS Comparison: ${jsAvgScore.toFixed(1)}/100 average`,
      );
      if (jsAvgScore > 70) {
        console.log(
          "   🚀 Your ECS performs well among JavaScript implementations!",
        );
      }
    }
  } catch (error) {
    console.error("❌ Performance comparison failed:", error);
  }
}

// Run the comparison if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceComparison().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}

export { runPerformanceComparison };
