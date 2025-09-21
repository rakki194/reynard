/**
 * Integration Tests for Code Quality System
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCodeQualitySystem, quickAnalysis } from '../index';

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Factory Functions', () => {
    it('should export factory functions', () => {
      expect(createCodeQualitySystem).toBeDefined();
      expect(quickAnalysis).toBeDefined();
      expect(typeof createCodeQualitySystem).toBe('function');
      expect(typeof quickAnalysis).toBe('function');
    });

    it('should create systems with different configurations', () => {
      const system1 = createCodeQualitySystem('/test/project', {
        environment: 'development',
        includeSecurity: true,
        includeQualityGates: false,
      });

      const system2 = createCodeQualitySystem('/test/project', {
        environment: 'production',
        includeSecurity: false,
        includeQualityGates: true,
      });

      expect(system1).toBeDefined();
      expect(system2).toBeDefined();
      expect(system1).not.toBe(system2);
    });
  });

  describe('System Creation and Configuration', () => {
    it('should create and configure a complete system', () => {
      const system = createCodeQualitySystem('/test/project', {
        environment: 'development',
        includeSecurity: true,
        includeQualityGates: true,
      });

      expect(system).toBeDefined();
      expect(system.orchestrator).toBeDefined();
      expect(system.qualityGateManager).toBeDefined();
      expect(system.securityIntegration).toBeDefined();
      // Note: Some components may not be available in test environment
      expect(typeof system).toBe('object');
    });

    it('should handle system creation with different project paths', () => {
      const system1 = createCodeQualitySystem('/test/project1');
      const system2 = createCodeQualitySystem('/test/project2');

      expect(system1).toBeDefined();
      expect(system2).toBeDefined();
      expect(system1).not.toBe(system2);
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle system creation gracefully', () => {
      expect(() => {
        createCodeQualitySystem('/nonexistent/project');
      }).not.toThrow();
    });

    it('should handle different configuration options', () => {
      const configs = [
        { environment: 'development' },
        { environment: 'production' },
        { includeSecurity: true },
        { includeQualityGates: true },
        { includeSecurity: false, includeQualityGates: false },
      ];

      configs.forEach(config => {
        expect(() => {
          createCodeQualitySystem('/test/project', config);
        }).not.toThrow();
      });
    });
  });

  describe('Performance and Scalability', () => {
    it('should create multiple systems efficiently', () => {
      const startTime = Date.now();
      
      const systems = Array.from({ length: 10 }, (_, i) => 
        createCodeQualitySystem(`/test/project${i}`)
      );

      const endTime = Date.now();

      expect(systems).toHaveLength(10);
      systems.forEach(system => {
        expect(system).toBeDefined();
      });
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle different system configurations', () => {
      const configs = [
        { environment: 'development', includeSecurity: true },
        { environment: 'production', includeQualityGates: true },
        { environment: 'test', includeSecurity: false, includeQualityGates: false },
      ];

      const systems = configs.map(config => 
        createCodeQualitySystem('/test/project', config)
      );

      expect(systems).toHaveLength(3);
      systems.forEach(system => {
        expect(system).toBeDefined();
        expect(typeof system).toBe('object');
      });
    });
  });

  describe('Module Exports', () => {
    it('should export all required components', () => {
      // Test that the main exports are available
      expect(createCodeQualitySystem).toBeDefined();
      expect(quickAnalysis).toBeDefined();
      
      // Test that they are functions
      expect(typeof createCodeQualitySystem).toBe('function');
      expect(typeof quickAnalysis).toBe('function');
    });

    it('should handle import/export correctly', () => {
      // Test that we can import and use the functions
      const system = createCodeQualitySystem('/test/project');
      expect(system).toBeDefined();
      
      // Test that the system has expected properties
      expect(typeof system).toBe('object');
    });
  });
});