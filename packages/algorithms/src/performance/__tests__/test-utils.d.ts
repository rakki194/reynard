/**
 * Test utilities for performance tests
 *
 * Shared test data, helper functions, and mocking utilities for performance testing.
 *
 * @module algorithms/performance/__tests__/test-utils
 */
import type { PerformanceBudget, PerformanceMetrics } from "../types";
/**
 * Creates a standard performance budget for testing
 */
export declare function createTestBudget(overrides?: Partial<PerformanceBudget>): PerformanceBudget;
/**
 * Creates standard performance metrics for testing
 */
export declare function createTestMetrics(overrides?: Partial<PerformanceMetrics>): PerformanceMetrics;
/**
 * Creates metrics that exceed budget limits
 */
export declare function createExceedingMetrics(): PerformanceMetrics;
/**
 * Creates metrics that are exactly at budget limits
 */
export declare function createAtLimitMetrics(): PerformanceMetrics;
export declare const mockPerformanceNow: import("vitest").Mock<(...args: any[]) => any>;
export declare const originalPerformance: Performance;
export declare const setupPerformanceMock: () => void;
export declare const teardownPerformanceMock: () => void;
export declare const resetPerformanceMock: () => void;
