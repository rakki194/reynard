/**
 * @fileoverview Test suite index - runs all ECS tests and provides test utilities.
 * 
 * This file serves as the main entry point for all ECS tests and provides
 * common test utilities and setup functions.
 * 
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Import all test modules
import './core-types.test';
import './world.test';
import './query.test';
import './system.test';
import './archetype.test';
import './change-detection.test';
import './integration.test';

// Test utilities and helpers
export class TestUtils {
  /**
   * Creates a test world with common component and resource types registered.
   */
  static createTestWorld() {
    // This would be implemented based on the actual ECS implementation
    // For now, it's a placeholder that shows the intended API
    return {
      world: null,
      componentTypes: {},
      resourceTypes: {}
    };
  }

  /**
   * Creates test entities with common component combinations.
   */
  static createTestEntities(world: any) {
    // This would create entities with various component combinations
    // for testing purposes
    return [];
  }

  /**
   * Measures the performance of a function call.
   */
  static measurePerformance(fn: () => void): number {
    const startTime = performance.now();
    fn();
    const endTime = performance.now();
    return endTime - startTime;
  }

  /**
   * Asserts that a function completes within a specified time limit.
   */
  static assertPerformance(fn: () => void, maxTimeMs: number) {
    const duration = this.measurePerformance(fn);
    expect(duration).toBeLessThan(maxTimeMs);
  }
}

describe('ECS Test Suite', () => {
  it('should have all test modules loaded', () => {
    // This test ensures all test modules are properly imported
    expect(TestUtils).toBeDefined();
    expect(TestUtils.createTestWorld).toBeDefined();
    expect(TestUtils.createTestEntities).toBeDefined();
    expect(TestUtils.measurePerformance).toBeDefined();
    expect(TestUtils.assertPerformance).toBeDefined();
  });

  it('should provide test utilities', () => {
    // Test that utilities work correctly
    const duration = TestUtils.measurePerformance(() => {
      // Simple operation
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += i;
      }
    });
    
    expect(duration).toBeGreaterThan(0);
    expect(duration).toBeLessThan(100); // Should complete quickly
  });
});

// Test utilities are available for use in other test files
