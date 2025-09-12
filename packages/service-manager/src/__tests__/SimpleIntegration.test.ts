/**
 * Simple Integration Tests
 *
 * Tests for the integration between service manager and feature system
 * without relying on actual service startup.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  ServiceManager,
  BaseService,
  ServiceStatus,
  ServiceHealth,
} from "../../../index.js";
import { FeatureManager, COMMON_FEATURES } from "reynard-features";
import { FeatureServiceBridge } from "../../FeatureServiceBridge.js";

// Simple mock service that doesn't require async initialization
class SimpleMockService extends BaseService {
  constructor(name: string) {
    super({
      name,
      dependencies: [],
      startupPriority: 50,
      autoStart: false, // Don't auto-start
    });
  }

  async initialize(): Promise<void> {
    // No-op for testing
  }

  async shutdown(): Promise<void> {
    // No-op for testing
  }

  async healthCheck(): Promise<ServiceHealth> {
    return ServiceHealth.HEALTHY;
  }
}

describe("Simple Service-Feature Integration", () => {
  let serviceManager: ServiceManager;
  let featureManager: FeatureManager;
  let bridge: FeatureServiceBridge;

  beforeEach(() => {
    // Create service manager
    serviceManager = new ServiceManager({
      maxConcurrentStartup: 2,
      healthCheckInterval: 1000,
      startupTimeout: 1000,
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

  it("should create bridge without errors", () => {
    expect(bridge).toBeDefined();
    expect(bridge.isInitialized).toBe(true);
  });

  it("should handle service registration", () => {
    const fileService = new SimpleMockService("file-processing");
    serviceManager.registerService(fileService);

    // Service should be registered but not started
    const service = serviceManager.getService("file-processing");
    expect(service).toBeDefined();
    expect(service?.status).toBe(ServiceStatus.STOPPED);
  });

  it("should map service names correctly", () => {
    const fileService = new SimpleMockService("file-processing");
    serviceManager.registerService(fileService);

    // Check service status through bridge
    const status = bridge.getServiceStatus("FileProcessingService");
    expect(status).toBeDefined();
    expect(status.available).toBe(false); // Service not started
    expect(status.status).toBe(ServiceStatus.STOPPED);
  });

  it("should handle multiple services", () => {
    const fileService = new SimpleMockService("file-processing");
    const authService = new SimpleMockService("auth");

    serviceManager.registerService(fileService);
    serviceManager.registerService(authService);

    // Check both services through bridge
    const fileStatus = bridge.getServiceStatus("FileProcessingService");
    const authStatus = bridge.getServiceStatus("AuthService");

    expect(fileStatus).toBeDefined();
    expect(authStatus).toBeDefined();
    expect(fileStatus.available).toBe(false);
    expect(authStatus.available).toBe(false);
  });

  it("should provide all service statuses", () => {
    const fileService = new SimpleMockService("file-processing");
    const authService = new SimpleMockService("auth");

    serviceManager.registerService(fileService);
    serviceManager.registerService(authService);

    const allStatuses = bridge.getAllServiceStatuses();

    expect(allStatuses).toHaveProperty("FileProcessingService");
    expect(allStatuses).toHaveProperty("AuthService");
    expect(allStatuses["FileProcessingService"].available).toBe(false);
    expect(allStatuses["AuthService"].available).toBe(false);
  });

  it("should handle service name mapping operations", () => {
    // Test adding new mapping
    bridge.addServiceMapping("test-service", "TestService");

    const status = bridge.getServiceStatus("TestService");
    expect(status).toBeDefined();
    expect(status.available).toBe(false);

    // Test removing mapping
    bridge.removeServiceMapping("TestService");

    const statusAfterRemoval = bridge.getServiceStatus("TestService");
    expect(statusAfterRemoval).toBeDefined();
  });

  it("should handle unmapped service names", () => {
    const status = bridge.getServiceStatus("NonExistentService");
    expect(status).toBeDefined();
    expect(status.available).toBe(false);
    expect(status.status).toBe(ServiceStatus.STOPPED);
    expect(status.health).toBe(ServiceHealth.UNKNOWN);
  });

  it("should force sync without errors", () => {
    const fileService = new SimpleMockService("file-processing");
    serviceManager.registerService(fileService);

    // Force sync should not throw
    expect(() => bridge.forceSync()).not.toThrow();
  });

  it("should handle bridge destruction", () => {
    expect(() => bridge.destroy()).not.toThrow();
    expect(bridge.isInitialized).toBe(false);
  });
});
