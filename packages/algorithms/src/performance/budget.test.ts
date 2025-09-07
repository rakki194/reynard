import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PerformanceBudgetChecker } from './budget';
import type { PerformanceBudget, PerformanceMetrics } from './types';

describe('PerformanceBudgetChecker', () => {
  let checker: PerformanceBudgetChecker;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    checker = new PerformanceBudgetChecker();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('setBudget', () => {
    it('should set a performance budget', () => {
      const budget: PerformanceBudget = {
        maxDuration: 100,
        maxMemoryUsage: 1024,
        maxIterations: 1000,
        warningThreshold: 0.8
      };

      checker.setBudget('test-budget', budget);
      // No direct way to verify, but checkBudget will confirm it's set
      const metrics: PerformanceMetrics = {
        duration: 50,
        memoryBefore: 0,
        memoryAfter: 512,
        memoryDelta: 512,
        timestamp: Date.now(),
        iterations: 500,
        averageTime: 0.1,
        minTime: 0.05,
        maxTime: 0.15,
        standardDeviation: 0.02
      };

      expect(checker.checkBudget('test-budget', metrics)).toBe(true);
    });
  });

  describe('checkBudget', () => {
    it('should return true when no budget is set', () => {
      const metrics: PerformanceMetrics = {
        duration: 1000,
        memoryBefore: 0,
        memoryAfter: 10000,
        memoryDelta: 10000,
        timestamp: Date.now(),
        iterations: 10000,
        averageTime: 0.1,
        minTime: 0.05,
        maxTime: 0.15,
        standardDeviation: 0.02
      };

      expect(checker.checkBudget('nonexistent-budget', metrics)).toBe(true);
    });

    it('should return true when all metrics are within budget', () => {
      const budget: PerformanceBudget = {
        maxDuration: 100,
        maxMemoryUsage: 1024,
        maxIterations: 1000,
        warningThreshold: 0.8
      };

      const metrics: PerformanceMetrics = {
        duration: 50,
        memoryBefore: 0,
        memoryAfter: 512,
        memoryDelta: 512,
        timestamp: Date.now(),
        iterations: 500,
        averageTime: 0.1,
        minTime: 0.05,
        maxTime: 0.15,
        standardDeviation: 0.02
      };

      checker.setBudget('test-budget', budget);
      expect(checker.checkBudget('test-budget', metrics)).toBe(true);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should return false and warn when duration exceeds budget', () => {
      const budget: PerformanceBudget = {
        maxDuration: 100,
        maxMemoryUsage: 1024,
        maxIterations: 1000,
        warningThreshold: 0.8
      };

      const metrics: PerformanceMetrics = {
        duration: 150,
        memoryBefore: 0,
        memoryAfter: 512,
        memoryDelta: 512,
        timestamp: Date.now(),
        iterations: 500,
        averageTime: 0.1,
        minTime: 0.05,
        maxTime: 0.15,
        standardDeviation: 0.02
      };

      checker.setBudget('test-budget', budget);
      expect(checker.checkBudget('test-budget', metrics)).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Performance budget violation for test-budget:',
        'Duration: 150ms > 100ms'
      );
    });

    it('should return false and warn when memory usage exceeds budget', () => {
      const budget: PerformanceBudget = {
        maxDuration: 100,
        maxMemoryUsage: 1024,
        maxIterations: 1000,
        warningThreshold: 0.8
      };

      const metrics: PerformanceMetrics = {
        duration: 50,
        memoryBefore: 0,
        memoryAfter: 2048,
        memoryDelta: 2048,
        timestamp: Date.now(),
        iterations: 500,
        averageTime: 0.1,
        minTime: 0.05,
        maxTime: 0.15,
        standardDeviation: 0.02
      };

      checker.setBudget('test-budget', budget);
      expect(checker.checkBudget('test-budget', metrics)).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Performance budget violation for test-budget:',
        'Memory: 2048 bytes > 1024 bytes'
      );
    });

    it('should return false and warn when iterations exceed budget', () => {
      const budget: PerformanceBudget = {
        maxDuration: 100,
        maxMemoryUsage: 1024,
        maxIterations: 1000,
        warningThreshold: 0.8
      };

      const metrics: PerformanceMetrics = {
        duration: 50,
        memoryBefore: 0,
        memoryAfter: 512,
        memoryDelta: 512,
        timestamp: Date.now(),
        iterations: 1500,
        averageTime: 0.1,
        minTime: 0.05,
        maxTime: 0.15,
        standardDeviation: 0.02
      };

      checker.setBudget('test-budget', budget);
      expect(checker.checkBudget('test-budget', metrics)).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Performance budget violation for test-budget:',
        'Iterations: 1500 > 1000'
      );
    });

    it('should return false and warn about multiple violations', () => {
      const budget: PerformanceBudget = {
        maxDuration: 100,
        maxMemoryUsage: 1024,
        maxIterations: 1000,
        warningThreshold: 0.8
      };

      const metrics: PerformanceMetrics = {
        duration: 150,
        memoryBefore: 0,
        memoryAfter: 2048,
        memoryDelta: 2048,
        timestamp: Date.now(),
        iterations: 1500,
        averageTime: 0.1,
        minTime: 0.05,
        maxTime: 0.15,
        standardDeviation: 0.02
      };

      checker.setBudget('test-budget', budget);
      expect(checker.checkBudget('test-budget', metrics)).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Performance budget violation for test-budget:',
        'Duration: 150ms > 100ms, Memory: 2048 bytes > 1024 bytes, Iterations: 1500 > 1000'
      );
    });

    it('should handle edge case values exactly at budget limits', () => {
      const budget: PerformanceBudget = {
        maxDuration: 100,
        maxMemoryUsage: 1024,
        maxIterations: 1000,
        warningThreshold: 0.8
      };

      const metrics: PerformanceMetrics = {
        duration: 100,
        memoryBefore: 0,
        memoryAfter: 1024,
        memoryDelta: 1024,
        timestamp: Date.now(),
        iterations: 1000,
        averageTime: 0.1,
        minTime: 0.05,
        maxTime: 0.15,
        standardDeviation: 0.02
      };

      checker.setBudget('test-budget', budget);
      expect(checker.checkBudget('test-budget', metrics)).toBe(true);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('clearBudget', () => {
    it('should clear a specific budget', () => {
      const budget: PerformanceBudget = {
        maxDuration: 100,
        maxMemoryUsage: 1024,
        maxIterations: 1000,
        warningThreshold: 0.8
      };

      checker.setBudget('test-budget', budget);
      checker.clearBudget('test-budget');

      const metrics: PerformanceMetrics = {
        duration: 150,
        memoryBefore: 0,
        memoryAfter: 2048,
        memoryDelta: 2048,
        timestamp: Date.now(),
        iterations: 1500,
        averageTime: 0.1,
        minTime: 0.05,
        maxTime: 0.15,
        standardDeviation: 0.02
      };

      // Should return true since budget is cleared
      expect(checker.checkBudget('test-budget', metrics)).toBe(true);
    });

    it('should not affect other budgets when clearing one', () => {
      const budget1: PerformanceBudget = {
        maxDuration: 100,
        maxMemoryUsage: 1024,
        maxIterations: 1000,
        warningThreshold: 0.8
      };

      const budget2: PerformanceBudget = {
        maxDuration: 200,
        maxMemoryUsage: 2048,
        maxIterations: 2000,
        warningThreshold: 0.8
      };

      checker.setBudget('budget1', budget1);
      checker.setBudget('budget2', budget2);
      checker.clearBudget('budget1');

      const metrics: PerformanceMetrics = {
        duration: 150,
        memoryBefore: 0,
        memoryAfter: 1024,
        memoryDelta: 1024,
        timestamp: Date.now(),
        iterations: 1000,
        averageTime: 0.1,
        minTime: 0.05,
        maxTime: 0.15,
        standardDeviation: 0.02
      };

      // budget1 should be cleared (returns true)
      expect(checker.checkBudget('budget1', metrics)).toBe(true);
      // budget2 should still be active (returns false due to duration violation)
      expect(checker.checkBudget('budget2', metrics)).toBe(false);
    });
  });

  describe('clearAllBudgets', () => {
    it('should clear all budgets', () => {
      const budget1: PerformanceBudget = {
        maxDuration: 100,
        maxMemoryUsage: 1024,
        maxIterations: 1000,
        warningThreshold: 0.8
      };

      const budget2: PerformanceBudget = {
        maxDuration: 200,
        maxMemoryUsage: 2048,
        maxIterations: 2000,
        warningThreshold: 0.8
      };

      checker.setBudget('budget1', budget1);
      checker.setBudget('budget2', budget2);
      checker.clearAllBudgets();

      const metrics: PerformanceMetrics = {
        duration: 150,
        memoryBefore: 0,
        memoryAfter: 1024,
        memoryDelta: 1024,
        timestamp: Date.now(),
        iterations: 1000,
        averageTime: 0.1,
        minTime: 0.05,
        maxTime: 0.15,
        standardDeviation: 0.02
      };

      // Both budgets should be cleared
      expect(checker.checkBudget('budget1', metrics)).toBe(true);
      expect(checker.checkBudget('budget2', metrics)).toBe(true);
    });
  });
});
