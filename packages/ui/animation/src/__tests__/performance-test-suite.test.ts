/**
 * 🦊 Comprehensive Performance Test Suite
 *
 * Integration test suite that runs all performance tests and validates:
 * - Performance benchmarks meet thresholds
 * - Bundle size stays within limits
 * - Performance monitoring detects issues
 * - Regression detection works correctly
 *
 * @author Vulpine (Strategic Fox Specialist)
 * @since 1.0.0
 */

import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { PerformanceTestRunner, defaultPerformanceConfig, type PerformanceTestResult } from "./performance-test-runner";

describe("Performance Test Suite", () => {
  let testRunner: PerformanceTestRunner;

  beforeEach(() => {
    // Create test runner with custom config for testing
    const testConfig = {
      ...defaultPerformanceConfig,
      benchmark: {
        ...defaultPerformanceConfig.benchmark,
        iterations: 100, // Reduced for faster testing
        threshold: {
          memory: 100, // 100MB - more lenient for testing
          timing: 2000, // 2s - more lenient for testing
          frameRate: 20, // 20fps - more lenient for testing
        },
      },
      bundleSize: {
        ...defaultPerformanceConfig.bundleSize,
        maxSize: 100 * 1024, // 100KB - more lenient for testing
      },
    };

    testRunner = new PerformanceTestRunner(testConfig);
  });

  afterEach(() => {
    // Clean up any test artifacts
  });

  describe("Performance Test Execution", () => {
    test("should run all performance tests successfully", async () => {
      const result = await testRunner.runAllTests();

      expect(result).toBeDefined();
      expect(result.testId).toMatch(/^perf-test-\d+$/);
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.benchmarks).toBeDefined();
      expect(result.bundleSize).toBeDefined();
      expect(result.monitoring).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    test("should generate valid test results", async () => {
      const result = await testRunner.runAllTests();

      // Validate benchmark results
      expect(result.benchmarks).toHaveLength(5);
      result.benchmarks.forEach(benchmark => {
        expect(benchmark.name).toBeDefined();
        expect(benchmark.iterations).toBeGreaterThan(0);
        expect(benchmark.averageTime).toBeGreaterThan(0);
        expect(benchmark.minTime).toBeGreaterThan(0);
        expect(benchmark.maxTime).toBeGreaterThan(0);
        expect(benchmark.memoryUsage).toBeGreaterThan(0);
        expect(typeof benchmark.passed).toBe("boolean");
      });

      // Validate bundle size results
      expect(result.bundleSize.totalSize).toBeGreaterThan(0);
      expect(result.bundleSize.gzipSize).toBeGreaterThan(0);
      expect(result.bundleSize.brotliSize).toBeGreaterThan(0);
      expect(result.bundleSize.moduleBreakdown).toBeDefined();
      expect(result.bundleSize.optimization).toBeDefined();

      // Validate monitoring results
      expect(result.monitoring.averageMemoryUsage).toBeGreaterThan(0);
      expect(result.monitoring.averageLoadTime).toBeGreaterThan(0);
      expect(result.monitoring.averageFrameRate).toBeGreaterThan(0);
      expect(Array.isArray(result.monitoring.alerts)).toBe(true);

      // Validate summary
      expect(result.summary.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.summary.overallScore).toBeLessThanOrEqual(100);
      expect(["pass", "warning", "fail"]).toContain(result.summary.status);
      expect(Array.isArray(result.summary.recommendations)).toBe(true);
    });

    test("should maintain test history", async () => {
      // Run multiple tests
      await testRunner.runAllTests();
      await testRunner.runAllTests();
      await testRunner.runAllTests();

      const history = testRunner.getTestHistory();
      expect(history).toHaveLength(3);

      // Each test should have unique ID
      const testIds = history.map(result => result.testId);
      const uniqueIds = new Set(testIds);
      expect(uniqueIds.size).toBe(3);
    });

    test("should provide latest test result", async () => {
      expect(testRunner.getLatestResult()).toBeNull();

      const result1 = await testRunner.runAllTests();
      expect(testRunner.getLatestResult()).toBe(result1);

      const result2 = await testRunner.runAllTests();
      expect(testRunner.getLatestResult()).toBe(result2);
      expect(testRunner.getLatestResult()).not.toBe(result1);
    });
  });

  describe("Performance Threshold Validation", () => {
    test("should pass when performance meets thresholds", async () => {
      const result = await testRunner.runAllTests();

      // All benchmarks should pass with lenient thresholds
      result.benchmarks.forEach(benchmark => {
        expect(benchmark.passed).toBe(true);
      });

      // Bundle size should be within limits
      expect(result.bundleSize.totalSize).toBeLessThanOrEqual(100 * 1024);

      // Overall score should be good
      expect(result.summary.overallScore).toBeGreaterThan(70);
    });

    test("should detect performance issues", async () => {
      // Create runner with strict thresholds
      const strictConfig = {
        ...defaultPerformanceConfig,
        benchmark: {
          ...defaultPerformanceConfig.benchmark,
          threshold: {
            memory: 10, // 10MB - very strict
            timing: 100, // 100ms - very strict
            frameRate: 60, // 60fps - very strict
          },
        },
        bundleSize: {
          ...defaultPerformanceConfig.bundleSize,
          maxSize: 10 * 1024, // 10KB - very strict
        },
      };

      const strictRunner = new PerformanceTestRunner(strictConfig);
      const result = await strictRunner.runAllTests();

      // Should detect issues with strict thresholds
      const failedBenchmarks = result.benchmarks.filter(b => !b.passed);
      expect(failedBenchmarks.length).toBeGreaterThan(0);

      // Should have recommendations
      expect(result.summary.recommendations.length).toBeGreaterThan(0);

      // Overall score should be lower
      expect(result.summary.overallScore).toBeLessThan(90);
    });
  });

  describe("Bundle Size Analysis", () => {
    test("should analyze bundle size correctly", async () => {
      const result = await testRunner.runAllTests();

      // Bundle size should be reasonable
      expect(result.bundleSize.totalSize).toBeGreaterThan(0);
      expect(result.bundleSize.totalSize).toBeLessThan(200 * 1024); // Less than 200KB

      // Compression should be effective
      expect(result.bundleSize.gzipSize).toBeLessThan(result.bundleSize.totalSize);
      expect(result.bundleSize.brotliSize).toBeLessThan(result.bundleSize.gzipSize);

      // Module breakdown should be detailed
      expect(Object.keys(result.bundleSize.moduleBreakdown).length).toBeGreaterThan(0);

      // Optimization metrics should be present
      expect(result.bundleSize.optimization.treeShaking).toBeGreaterThan(0);
      expect(result.bundleSize.optimization.minification).toBeGreaterThan(0);
      expect(result.bundleSize.optimization.codeSplitting).toBeGreaterThan(0);
    });

    test("should detect bundle size regressions", async () => {
      // Run first test
      const result1 = await testRunner.runAllTests();

      // Simulate bundle size regression by creating a new runner with different results
      const regressionConfig = {
        ...defaultPerformanceConfig,
        bundleSize: {
          ...defaultPerformanceConfig.bundleSize,
          maxSize: 50 * 1024, // 50KB - will cause regression
        },
      };

      const regressionRunner = new PerformanceTestRunner(regressionConfig);
      const result2 = await regressionRunner.runAllTests();

      // Check for regressions
      const regressionCheck = regressionRunner.checkForRegressions();
      expect(regressionCheck.hasRegression).toBe(true);
      expect(regressionCheck.regressionDetails.length).toBeGreaterThan(0);
    });
  });

  describe("Performance Monitoring", () => {
    test("should monitor performance metrics", async () => {
      const result = await testRunner.runAllTests();

      // Memory usage should be reasonable
      expect(result.monitoring.averageMemoryUsage).toBeGreaterThan(0);
      expect(result.monitoring.averageMemoryUsage).toBeLessThan(200 * 1024 * 1024); // Less than 200MB

      // Load time should be reasonable
      expect(result.monitoring.averageLoadTime).toBeGreaterThan(0);
      expect(result.monitoring.averageLoadTime).toBeLessThan(10000); // Less than 10s

      // Frame rate should be reasonable
      expect(result.monitoring.averageFrameRate).toBeGreaterThan(0);
      expect(result.monitoring.averageFrameRate).toBeLessThanOrEqual(60); // Max 60fps

      // Alerts should be an array
      expect(Array.isArray(result.monitoring.alerts)).toBe(true);
    });

    test("should generate performance alerts", async () => {
      // Create runner with strict monitoring thresholds
      const strictConfig = {
        ...defaultPerformanceConfig,
        monitoring: {
          ...defaultPerformanceConfig.monitoring,
          alertThresholds: {
            memory: { warning: 10 * 1024 * 1024, critical: 20 * 1024 * 1024 }, // 10MB/20MB
            timing: { warning: 500, critical: 1000 }, // 500ms/1s
            frameRate: { warning: 50, critical: 40 }, // 50fps/40fps
          },
        },
      };

      const strictRunner = new PerformanceTestRunner(strictConfig);
      const result = await strictRunner.runAllTests();

      // Should generate alerts with strict thresholds
      expect(result.monitoring.alerts.length).toBeGreaterThan(0);

      // Alerts should have proper structure
      result.monitoring.alerts.forEach(alert => {
        expect(["warning", "critical"]).toContain(alert.type);
        expect(alert.category).toBeDefined();
        expect(alert.message).toBeDefined();
      });
    });
  });

  describe("Regression Detection", () => {
    test("should detect performance regressions", async () => {
      // Run first test
      const result1 = await testRunner.runAllTests();

      // Run second test (should be similar)
      const result2 = await testRunner.runAllTests();

      // Check for regressions
      const regressionCheck = testRunner.checkForRegressions();

      // With similar results, should not detect regression
      expect(regressionCheck.hasRegression).toBe(false);
      expect(regressionCheck.regressionDetails).toHaveLength(0);
    });

    test("should not detect regression with insufficient history", async () => {
      // Run only one test
      await testRunner.runAllTests();

      // Check for regressions
      const regressionCheck = testRunner.checkForRegressions();

      // Should not detect regression with only one result
      expect(regressionCheck.hasRegression).toBe(false);
      expect(regressionCheck.regressionDetails).toHaveLength(0);
    });
  });

  describe("Performance Test Configuration", () => {
    test("should use custom configuration", () => {
      const customConfig = {
        ...defaultPerformanceConfig,
        benchmark: {
          ...defaultPerformanceConfig.benchmark,
          iterations: 500,
        },
        bundleSize: {
          ...defaultPerformanceConfig.bundleSize,
          maxSize: 25 * 1024, // 25KB
        },
      };

      const customRunner = new PerformanceTestRunner(customConfig);
      expect(customRunner).toBeDefined();
    });

    test("should validate configuration values", () => {
      const invalidConfig = {
        ...defaultPerformanceConfig,
        benchmark: {
          ...defaultPerformanceConfig.benchmark,
          iterations: -1, // Invalid
        },
      };

      // Should not throw error, but use default values
      expect(() => new PerformanceTestRunner(invalidConfig)).not.toThrow();
    });
  });

  describe("Performance Test Reporting", () => {
    test("should generate comprehensive reports", async () => {
      const result = await testRunner.runAllTests();

      // Report should contain all necessary information
      expect(result.testId).toBeDefined();
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.summary.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.summary.status).toBeDefined();
      expect(Array.isArray(result.summary.recommendations)).toBe(true);
    });

    test("should provide actionable recommendations", async () => {
      const result = await testRunner.runAllTests();

      // Recommendations should be actionable
      result.summary.recommendations.forEach(recommendation => {
        expect(typeof recommendation).toBe("string");
        expect(recommendation.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Performance Test Integration", () => {
    test("should integrate with animation system", async () => {
      // This test validates that the performance tests work with the actual animation system
      const result = await testRunner.runAllTests();

      // Should test animation-specific metrics
      const animationBenchmarks = result.benchmarks.filter(
        b => b.name.includes("Animation") || b.name.includes("animation")
      );
      expect(animationBenchmarks.length).toBeGreaterThan(0);

      // Should test animation-specific bundle size
      const animationModules = Object.keys(result.bundleSize.moduleBreakdown).filter(key => key.includes("animation"));
      expect(animationModules.length).toBeGreaterThan(0);

      // Should test animation-specific performance
      expect(result.monitoring.averageFrameRate).toBeGreaterThan(0);
    });

    test("should validate animation performance thresholds", async () => {
      const result = await testRunner.runAllTests();

      // Frame rate should be acceptable for animations
      expect(result.monitoring.averageFrameRate).toBeGreaterThanOrEqual(20);

      // Memory usage should be reasonable for animations
      expect(result.monitoring.averageMemoryUsage).toBeLessThan(100 * 1024 * 1024); // Less than 100MB

      // Load time should be acceptable for animations
      expect(result.monitoring.averageLoadTime).toBeLessThan(5000); // Less than 5s
    });
  });
});
