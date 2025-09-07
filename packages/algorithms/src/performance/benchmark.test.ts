import { describe, it, expect, vi } from 'vitest';
import { PerformanceBenchmark, measureAsync, measureSync } from './benchmark';

describe('PerformanceBenchmark', () => {
  let benchmark: PerformanceBenchmark;

  beforeEach(() => {
    benchmark = new PerformanceBenchmark();
  });

  describe('run', () => {
    it('should benchmark a synchronous function', async () => {
      const testFn = () => {
        // Simulate some work
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      };

      const metrics = await benchmark.run(testFn, 5);
      
      expect(metrics.iterations).toBe(5);
      expect(metrics.duration).toBeGreaterThan(0);
      expect(metrics.averageTime).toBeGreaterThan(0);
      expect(metrics.minTime).toBeGreaterThan(0);
      expect(metrics.maxTime).toBeGreaterThan(0);
    });

    it('should benchmark an asynchronous function', async () => {
      const testFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async result';
      };

      const metrics = await benchmark.run(testFn, 3);
      
      expect(metrics.iterations).toBe(3);
      expect(metrics.duration).toBeGreaterThan(30); // At least 30ms total
      expect(metrics.averageTime).toBeGreaterThan(10);
    });

    it('should handle function errors gracefully', async () => {
      const testFn = () => {
        throw new Error('Test error');
      };

      // The benchmark will throw the error, so we expect it to throw
      await expect(benchmark.run(testFn, 3)).rejects.toThrow('Test error');
    });
  });

  // Note: warmup functionality is not implemented in the current benchmark class
});

// Note: measureSync and measureAsync functions are not implemented in the current benchmark module
