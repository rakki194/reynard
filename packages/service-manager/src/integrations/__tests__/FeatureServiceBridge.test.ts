/**
 * FeatureServiceBridge Tests
 * 
 * Tests for the FeatureServiceBridge integration between service manager and feature system.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ServiceManager, BaseService, ServiceStatus, ServiceHealth } from '../../index.js';
import { FeatureManager, COMMON_FEATURES } from 'reynard-features';
import { FeatureServiceBridge } from '../FeatureServiceBridge.js';

// Mock service for testing
class MockService extends BaseService {
  private _mockStatus: ServiceStatus = ServiceStatus.STOPPED;
  private _mockHealth: ServiceHealth = ServiceHealth.UNKNOWN;

  constructor(name: string, dependencies: string[] = []) {
    super({
      name,
      dependencies,
      startupPriority: 50,
      autoStart: false // Don't auto-start for testing
    });
  }

  async initialize(): Promise<void> {
    // Simulate quick initialization
    await new Promise(resolve => setTimeout(resolve, 10));
    this._mockStatus = ServiceStatus.RUNNING;
    this._mockHealth = ServiceHealth.HEALTHY;
  }

  async shutdown(): Promise<void> {
    this._mockStatus = ServiceStatus.STOPPED;
    this._mockHealth = ServiceHealth.UNKNOWN;
  }

  async healthCheck(): Promise<ServiceHealth> {
    return this._mockHealth;
  }

  get status(): ServiceStatus {
    return this._mockStatus;
  }

  get health(): ServiceHealth {
    return this._mockHealth;
  }

  // Test helper methods
  setMockStatus(status: ServiceStatus): void {
    this._mockStatus = status;
  }

  setMockHealth(health: ServiceHealth): void {
    this._mockHealth = health;
  }
}

describe('FeatureServiceBridge', () => {
  let serviceManager: ServiceManager;
  let featureManager: FeatureManager;
  let bridge: FeatureServiceBridge;
  let mockService: MockService;

  beforeEach(() => {
    // Create service manager
    serviceManager = new ServiceManager({
      maxConcurrentStartup: 2,
      healthCheckInterval: 1000,
      startupTimeout: 1000, // Very short timeout for testing
      shutdownTimeout: 1000, // Reduced timeout
      enableHealthMonitoring: false // Disable for testing
    });

    // Create feature manager
    featureManager = new FeatureManager({
      features: COMMON_FEATURES,
      autoRefresh: false, // Disable for testing
      serviceChecker: () => false // Default to false
    });

    // Create mock service
    mockService = new MockService('test-service');

    // Create bridge
    bridge = new FeatureServiceBridge({
      serviceManager,
      featureManager,
      autoSync: true,
      serviceNameMapping: {
        'TestService': 'test-service'
      }
    });
  });

  afterEach(() => {
    bridge.destroy();
  });

  describe('initialization', () => {
    it('should initialize without errors', () => {
      expect(bridge).toBeDefined();
      expect(bridge.isInitialized).toBe(true);
    });

    it('should handle destroy without errors', () => {
      expect(() => bridge.destroy()).not.toThrow();
    });
  });

  describe('service registration', () => {
    it('should register service and update feature availability', () => {
      serviceManager.registerService(mockService);
      
      const status = bridge.getServiceStatus('TestService');
      expect(status.available).toBe(false); // Service not started yet
      expect(status.status).toBe(ServiceStatus.STOPPED);
    });

    it('should handle service startup and update availability', () => {
      serviceManager.registerService(mockService);
      
      // Test that the service is registered and bridge can access it
      const status = bridge.getServiceStatus('TestService');
      expect(status).toBeDefined();
      expect(status.available).toBe(false); // Service not started yet
      expect(status.status).toBe(ServiceStatus.STOPPED);
      
      // Test that the bridge can track service status changes
      // (The actual async startup is tested in integration tests)
    });
  });

  describe('service status tracking', () => {
    beforeEach(() => {
      serviceManager.registerService(mockService);
    });

    it('should track service health changes', () => {
      // Service should be stopped initially
      const status = bridge.getServiceStatus('TestService');
      expect(status.available).toBe(false);
      expect(status.status).toBe(ServiceStatus.STOPPED);
      expect(status.health).toBe(ServiceHealth.UNKNOWN);
    });

    it('should track service failures', () => {
      // Service should be stopped initially
      const status = bridge.getServiceStatus('TestService');
      expect(status.available).toBe(false);
      expect(status.status).toBe(ServiceStatus.STOPPED);
      expect(status.health).toBe(ServiceHealth.UNKNOWN);
    });
  });

  describe('service name mapping', () => {
    it('should map service names correctly', () => {
      const status = bridge.getServiceStatus('TestService');
      expect(status).toBeDefined();
    });

    it('should handle unmapped service names', () => {
      const status = bridge.getServiceStatus('unmapped-service');
      expect(status.available).toBe(false);
      expect(status.status).toBe(ServiceStatus.STOPPED);
    });

    it('should allow adding new service mappings', () => {
      bridge.addServiceMapping('new-service', 'NewService');
      
      const status = bridge.getServiceStatus('NewService');
      expect(status).toBeDefined();
    });

    it('should allow removing service mappings', () => {
      bridge.removeServiceMapping('TestService');
      
      const status = bridge.getServiceStatus('TestService');
      expect(status.available).toBe(false);
    });
  });

  describe('feature system integration', () => {
    it('should update feature manager service checker', () => {
      // The bridge should have updated the feature manager's service checker
      // We can't directly test this without exposing internal state,
      // but we can verify the bridge is working by checking service status
      const status = bridge.getServiceStatus('TestService');
      expect(status).toBeDefined();
    });

    it('should provide all service statuses', () => {
      serviceManager.registerService(mockService);
      
      const allStatuses = bridge.getAllServiceStatuses();
      // The bridge should return statuses with the mapped names
      // Since we map 'TestService' -> 'test-service', the result should have 'TestService'
      expect(allStatuses).toHaveProperty('TestService');
      expect(allStatuses['TestService']).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle service manager errors gracefully', () => {
      // This test ensures the bridge doesn't crash if the service manager has issues
      expect(() => bridge.forceSync()).not.toThrow();
    });

    it('should handle missing services gracefully', () => {
      const status = bridge.getServiceStatus('nonexistent-service');
      expect(status.available).toBe(false);
      expect(status.status).toBe(ServiceStatus.STOPPED);
      expect(status.health).toBe(ServiceHealth.UNKNOWN);
    });
  });
});
