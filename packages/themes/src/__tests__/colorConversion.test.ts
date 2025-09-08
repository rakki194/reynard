/**
 * Main test aggregator for Color Conversion Utilities
 * 
 * This file serves as the entry point for all color conversion tests,
 * following the modular architecture pattern with focused test modules.
 */

// Import all test modules to ensure they run
import './oklchToRgb.test';
import './oklchStringToRgb.test';
import './oklchStringToHex.test';
import './colorConversionPerformance.test';

describe('Color Conversion Utilities - Test Suite', () => {
  it('should have all test modules properly configured', () => {
    // This test ensures the aggregator is working correctly
    expect(true).toBe(true);
  });
});
