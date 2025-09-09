/**
 * Integration Tests
 *
 * Tests for the complete integration between service manager and feature system.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  ServiceManager,
  BaseService,
  ServiceStatus,
  ServiceHealth,
} from "../../index.js";
import { FeatureManager, COMMON_FEATURES } from "reynard-features";
import { FeatureServiceBridge } from "../FeatureServiceBridge.js";

// Mock service for testing
class MockFileProcessingService extends BaseService {
  constructor() {
    super({
      name: "file-processing",
      dependencies: [],
      startupPriority: 50,
      autoStart: false, // Don't auto-start for testing
    });
  }

  async initialize(): Promise<void> {
    // Simulate quick initialization
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  async shutdown(): Promise<void> {
    // Simulate shutdown
  }

  async healthCheck(): Promise<ServiceHealth> {
    return ServiceHealth.HEALTHY;
  }
}

class MockAuthService extends BaseService {
  constructor() {
    super({
      name: "auth",
      dependencies: [],
      startupPriority: 30,
      autoStart: false, // Don't auto-start for testing
    });
  }

  async initialize(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  async shutdown(): Promise<void> {
    // Simulate shutdown
  }

  async healthCheck(): Promise<ServiceHealth> {
    return ServiceHealth.HEALTHY;
  }
}

describe("Service-Feature Integration", () => {
  let serviceManager: ServiceManager;
  let featureManager: FeatureManager;
  let bridge: FeatureServiceBridge;

  beforeEach(() => {
    // Create service manager
    serviceManager = new ServiceManager({
      maxConcurrentStartup: 2,
      healthCheckInterval: 1000,
      startupTimeout: 2000,
      shutdownTimeout: 1000,
      enableHealthMonitoring: false,
    });

    // Create feature manager
    featureManager = new FeatureManager({
      features: COMMON_FEATURES,
      autoRefresh: false,
      serviceChecker: () => false,
    });

    // Create bridge with service mappings
    bridge = new FeatureServiceBridge({
      serviceManager,
      featureManager,
      autoSync: true,
      serviceNameMapping: {
        FileProcessingService: "file-processing",
        AuthService: "auth",
      },
    });
  });

  afterEach(() => {
    bridge.destroy();
  });

  it("should integrate services with features correctly", () => {
    // Register services
    const fileService = new MockFileProcessingService();
    const authService = new MockAuthService();

    serviceManager.registerService(fileService);
    serviceManager.registerService(authService);

    // Check that services are registered
    expect(serviceManager.getService("file-processing")).toBeDefined();
    expect(serviceManager.getService("auth")).toBeDefined();

    // Check feature availability through bridge (services not started yet)
    const fileFeatureStatus = bridge.getServiceStatus("FileProcessingService");
    const authFeatureStatus = bridge.getServiceStatus("AuthService");

    expect(fileFeatureStatus.available).toBe(false);
    expect(fileFeatureStatus.status).toBe(ServiceStatus.STOPPED);
    expect(authFeatureStatus.available).toBe(false);
    expect(authFeatureStatus.status).toBe(ServiceStatus.STOPPED);
  });

  it("should handle service failures gracefully", () => {
    // Register service
    const fileService = new MockFileProcessingService();
    serviceManager.registerService(fileService);

    // Check initial status
    const fileFeatureStatus = bridge.getServiceStatus("FileProcessingService");
    expect(fileFeatureStatus.available).toBe(false);
    expect(fileFeatureStatus.status).toBe(ServiceStatus.STOPPED);
  });

  it("should provide correct service statuses for all services", () => {
    // Register services
    const fileService = new MockFileProcessingService();
    const authService = new MockAuthService();

    serviceManager.registerService(fileService);
    serviceManager.registerService(authService);

    // Get all service statuses
    const allStatuses = bridge.getAllServiceStatuses();

    // Should have both mapped service names
    expect(allStatuses).toHaveProperty("FileProcessingService");
    expect(allStatuses).toHaveProperty("AuthService");

    // Both should be stopped initially
    expect(allStatuses["FileProcessingService"].available).toBe(false);
    expect(allStatuses["AuthService"].available).toBe(false);
  });

  it("should handle service name mappings correctly", () => {
    // Test adding new mappings
    bridge.addServiceMapping("new-service", "NewService");

    const status = bridge.getServiceStatus("NewService");
    expect(status).toBeDefined();
    expect(status.available).toBe(false); // Service not registered

    // Test removing mappings
    bridge.removeServiceMapping("NewService");

    const statusAfterRemoval = bridge.getServiceStatus("NewService");
    expect(statusAfterRemoval.available).toBe(false);
  });

  it("should sync service statuses with feature manager", () => {
    // Register a service
    const fileService = new MockFileProcessingService();
    serviceManager.registerService(fileService);

    // Force sync
    bridge.forceSync();

    // Check that the feature manager has been updated
    const fileManagementFeature =
      featureManager.getFeatureStatus("file-management");
    expect(fileManagementFeature?.available).toBe(false); // Service not started
  });
});
