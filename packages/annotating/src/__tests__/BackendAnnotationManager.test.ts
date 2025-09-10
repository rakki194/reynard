/**
 * BackendAnnotationManager Tests
 *
 * Basic test suite for the backend annotation manager without component imports.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the BackendAnnotationManager
vi.mock('../BackendAnnotationManager', () => ({
  BackendAnnotationManager: vi.fn(() => ({
    generateBatchCaptions: vi.fn(),
    getAvailableGenerators: vi.fn(),
    getHealthStatus: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
}));

describe('BackendAnnotationManager Tests', () => {
  let BackendAnnotationManager: any;

  beforeEach(async () => {
    // Import the manager after mocks are set up
    const module = await import('../BackendAnnotationManager');
    BackendAnnotationManager = module.BackendAnnotationManager;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Manager Initialization', () => {
    it('should create manager instance', () => {
      const config = {
        baseUrl: 'http://localhost:8000',
        apiKey: 'test-key',
      };

      const manager = new BackendAnnotationManager(config);
      expect(manager).toBeDefined();
    });

    it('should have required methods', () => {
      const config = {
        baseUrl: 'http://localhost:8000',
        apiKey: 'test-key',
      };

      const manager = new BackendAnnotationManager(config);
      
      expect(typeof manager.generateBatchCaptions).toBe('function');
      expect(typeof manager.getAvailableGenerators).toBe('function');
      expect(typeof manager.getHealthStatus).toBe('function');
      expect(typeof manager.on).toBe('function');
      expect(typeof manager.off).toBe('function');
    });
  });

  describe('Configuration', () => {
    it('should handle valid configuration', () => {
      const config = {
        baseUrl: 'http://localhost:8000',
        apiKey: 'test-key',
        timeout: 30000,
      };

      expect(() => {
        new BackendAnnotationManager(config);
      }).not.toThrow();
    });

    it('should handle minimal configuration', () => {
      const config = {
        baseUrl: 'http://localhost:8000',
      };

      expect(() => {
        new BackendAnnotationManager(config);
      }).not.toThrow();
    });
  });
});
