/**
 * 🦊 HealthChecker Test Suite
 *
 * Comprehensive tests for the health monitoring system.
 * Tests HTTP health checks, command-based checks, and monitoring.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { HealthChecker } from "../core/HealthChecker.js";
import {
  createMockHealthStatus,
  createMockProjectConfig,
  setupTestEnvironment,
  cleanupTestEnvironment,
  waitForEvent,
} from "./test-utils.js";
import type { HealthCheckConfig, HealthCheckResult, ServerHealth } from "../types/index.js";

// Mock global fetch
global.fetch = vi.fn();

describe("HealthChecker", () => {
  let healthChecker: HealthChecker;
  let mockNetwork: ReturnType<typeof setupTestEnvironment>["mockNetwork"];

  beforeEach(async () => {
    const testEnv = setupTestEnvironment();
    mockNetwork = testEnv.mockNetwork;

    // Set up comprehensive fetch mock
    vi.mocked(global.fetch).mockImplementation(async (url: string | URL | Request, init?: RequestInit) => {
      const urlString = url.toString();
      
      // Mock successful HTTP health check
      if (urlString.includes('/api/health') || urlString.includes('/health')) {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          url: urlString,
          redirected: false,
          type: 'basic' as ResponseType,
          text: () => Promise.resolve("OK"),
          json: () => Promise.resolve({ status: "healthy" }),
          blob: () => Promise.resolve(new Blob()),
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
          formData: () => Promise.resolve(new FormData()),
          clone: () => ({} as Response),
          body: null,
          bodyUsed: false,
        } as Response;
      }
      
      // Mock failed HTTP health check
      if (urlString.includes('/api/error')) {
        return {
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          headers: new Headers(),
          url: urlString,
          redirected: false,
          type: 'basic' as ResponseType,
          text: () => Promise.resolve("Internal Server Error"),
          json: () => Promise.resolve({ error: "Internal Server Error" }),
          blob: () => Promise.resolve(new Blob()),
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
          formData: () => Promise.resolve(new FormData()),
          clone: () => ({} as Response),
          body: null,
          bodyUsed: false,
        } as Response;
      }
      
      // Default successful response
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        url: urlString,
        redirected: false,
        type: 'basic' as ResponseType,
        text: () => Promise.resolve("OK"),
        json: () => Promise.resolve({ status: "healthy" }),
        blob: () => Promise.resolve(new Blob()),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        formData: () => Promise.resolve(new FormData()),
        clone: () => ({} as Response),
        body: null,
        bodyUsed: false,
      } as Response;
    });

    healthChecker = new HealthChecker();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe("HTTP Health Checks", () => {
    it("should perform successful HTTP health check", async () => {
      const healthCheckConfig: HealthCheckConfig = {
        endpoint: "http://localhost:3000/api/health",
        timeout: 5000,
        expectedResponse: "OK",
      };

      mockNetwork.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => "OK",
        json: async () => ({ status: "healthy" }),
      });

      const result = await healthChecker.checkHealth("test-project", healthCheckConfig);

      expect(result.success).toBe(true);
      expect(result.health).toBe("healthy");
      expect(result.statusCode).toBe(200);
      expect(result.responseTime).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
    });

    it("should handle HTTP health check failures", async () => {
      const healthCheckConfig: HealthCheckConfig = {
        endpoint: "http://localhost:3000/api/health",
        timeout: 5000,
      };

      mockNetwork.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
        json: async () => ({ error: "Server error" }),
      });

      const result = await healthChecker.checkHealth("test-project", healthCheckConfig);

      expect(result.success).toBe(false);
      expect(result.health).toBe("unhealthy");
      expect(result.statusCode).toBe(500);
      expect(result.error).toBeDefined();
    });

    it("should handle HTTP timeout", async () => {
      const healthCheckConfig: HealthCheckConfig = {
        endpoint: "http://localhost:3000/api/health",
        timeout: 100, // Very short timeout
      };

      mockNetwork.fetch.mockImplementationOnce(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return { ok: true, status: 200 };
      });

      const result = await healthChecker.checkHealth("test-project", healthCheckConfig);

      expect(result.success).toBe(false);
      expect(result.health).toBe("unhealthy");
      expect(result.error).toContain("timeout");
    });

    it("should handle network errors", async () => {
      const healthCheckConfig: HealthCheckConfig = {
        endpoint: "http://localhost:3000/api/health",
        timeout: 5000,
      };

      mockNetwork.fetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await healthChecker.checkHealth("test-project", healthCheckConfig);

      expect(result.success).toBe(false);
      expect(result.health).toBe("unhealthy");
      expect(result.error).toContain("Network error");
    });

    it("should validate expected response", async () => {
      const healthCheckConfig: HealthCheckConfig = {
        endpoint: "http://localhost:3000/api/health",
        timeout: 5000,
        expectedResponse: "OK",
      };

      mockNetwork.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => "NOT OK",
      });

      const result = await healthChecker.checkHealth("test-project", healthCheckConfig);

      expect(result.success).toBe(false);
      expect(result.health).toBe("unhealthy");
      expect(result.error).toContain("Expected response");
    });

    it("should validate expected response with regex", async () => {
      const healthCheckConfig: HealthCheckConfig = {
        endpoint: "http://localhost:3000/api/health",
        timeout: 5000,
        expectedResponse: /healthy|ok/i,
      };

      mockNetwork.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => "Server is healthy",
      });

      const result = await healthChecker.checkHealth("test-project", healthCheckConfig);

      expect(result.success).toBe(true);
      expect(result.health).toBe("healthy");
    });
  });

  describe("Command-based Health Checks", () => {
    it("should perform successful command health check", async () => {
      const healthCheckConfig: HealthCheckConfig = {
        command: "curl -f http://localhost:3000/api/health",
        timeout: 5000,
        expectedResponse: "OK",
      };

      // Mock successful command execution
      const mockExec = vi.fn().mockResolvedValueOnce({
        stdout: "OK",
        stderr: "",
        exitCode: 0,
      });

      vi.doMock("node:child_process", () => ({
        exec: mockExec,
      }));

      const result = await healthChecker.checkHealth("test-project", healthCheckConfig);

      expect(result.success).toBe(true);
      expect(result.health).toBe("healthy");
      expect(result.response).toBe("OK");
    });

    it("should handle command execution failures", async () => {
      const healthCheckConfig: HealthCheckConfig = {
        command: "curl -f http://localhost:3000/api/health",
        timeout: 5000,
      };

      const mockExec = vi.fn().mockResolvedValueOnce({
        stdout: "",
        stderr: "Connection refused",
        exitCode: 1,
      });

      vi.doMock("node:child_process", () => ({
        exec: mockExec,
      }));

      const result = await healthChecker.checkHealth("test-project", healthCheckConfig);

      expect(result.success).toBe(false);
      expect(result.health).toBe("unhealthy");
      expect(result.error).toContain("Connection refused");
    });

    it("should handle command timeout", async () => {
      const healthCheckConfig: HealthCheckConfig = {
        command: "sleep 10",
        timeout: 100, // Very short timeout
      };

      const mockExec = vi.fn().mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ stdout: "", stderr: "", exitCode: 0 }), 200);
        });
      });

      vi.doMock("node:child_process", () => ({
        exec: mockExec,
      }));

      const result = await healthChecker.checkHealth("test-project", healthCheckConfig);

      expect(result.success).toBe(false);
      expect(result.health).toBe("unhealthy");
      expect(result.error).toContain("timeout");
    });
  });

  describe("Health Monitoring", () => {
    it("should start monitoring a project", async () => {
      const projectConfig = createMockProjectConfig({
        name: "test-project",
        healthCheck: {
          endpoint: "http://localhost:3000/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      mockNetwork.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "OK",
      });

      await healthChecker.startMonitoring("test-project", projectConfig);

      // Wait for at least one health check
      await new Promise(resolve => setTimeout(resolve, 1100));

      const status = healthChecker.getHealthStatus("test-project");
      expect(status).toBeDefined();
      expect(status!.health).toBe("healthy");
    });

    it("should stop monitoring a project", async () => {
      const projectConfig = createMockProjectConfig({
        name: "test-project",
        healthCheck: {
          endpoint: "http://localhost:3000/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      await healthChecker.startMonitoring("test-project", projectConfig);
      await healthChecker.stopMonitoring("test-project");

      const status = healthChecker.getHealthStatus("test-project");
      expect(status).toBeUndefined();
    });

    it("should handle monitoring errors gracefully", async () => {
      const projectConfig = createMockProjectConfig({
        name: "test-project",
        healthCheck: {
          endpoint: "http://localhost:3000/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      mockNetwork.fetch.mockRejectedValue(new Error("Network error"));

      await healthChecker.startMonitoring("test-project", projectConfig);

      // Wait for health check to fail
      await new Promise(resolve => setTimeout(resolve, 1100));

      const status = healthChecker.getHealthStatus("test-project");
      expect(status).toBeDefined();
      expect(status!.health).toBe("unhealthy");
      expect(status!.error).toContain("Network error");
    });

    it("should emit health status change events", async () => {
      const statusChanges: Array<{ project: string; health: ServerHealth }> = [];

      healthChecker.onHealthStatusChange((project, health) => {
        statusChanges.push({ project, health });
      });

      const projectConfig = createMockProjectConfig({
        name: "test-project",
        healthCheck: {
          endpoint: "http://localhost:3000/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      // Start with healthy response
      mockNetwork.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => "OK",
      });

      await healthChecker.startMonitoring("test-project", projectConfig);

      // Wait for health check
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Change to unhealthy response
      mockNetwork.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Error",
      });

      // Wait for next health check
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(statusChanges.length).toBeGreaterThan(0);
      expect(statusChanges[0].project).toBe("test-project");
    });
  });

  describe("Health Status Management", () => {
    it("should get health status for project", async () => {
      const projectConfig = createMockProjectConfig({
        name: "test-project",
        healthCheck: {
          endpoint: "http://localhost:3000/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      mockNetwork.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "OK",
      });

      await healthChecker.startMonitoring("test-project", projectConfig);

      // Wait for health check
      await new Promise(resolve => setTimeout(resolve, 1100));

      const status = healthChecker.getHealthStatus("test-project");

      expect(status).toBeDefined();
      expect(status!.project).toBe("test-project");
      expect(status!.health).toBe("healthy");
      expect(status!.lastCheck).toBeInstanceOf(Date);
      expect(status!.checkDuration).toBeGreaterThan(0);
    });

    it("should return undefined for non-monitored project", () => {
      const status = healthChecker.getHealthStatus("non-existent");
      expect(status).toBeUndefined();
    });

    it("should list all health statuses", async () => {
      const projectConfig1 = createMockProjectConfig({
        name: "project1",
        healthCheck: {
          endpoint: "http://localhost:3000/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      const projectConfig2 = createMockProjectConfig({
        name: "project2",
        healthCheck: {
          endpoint: "http://localhost:3001/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      mockNetwork.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "OK",
      });

      await healthChecker.startMonitoring("project1", projectConfig1);
      await healthChecker.startMonitoring("project2", projectConfig2);

      // Wait for health checks
      await new Promise(resolve => setTimeout(resolve, 1100));

      const statuses = healthChecker.getAllHealthStatuses();

      expect(statuses).toHaveLength(2);
      expect(statuses.map(s => s.project)).toContain("project1");
      expect(statuses.map(s => s.project)).toContain("project2");
    });

    it("should get health statuses by health level", async () => {
      const projectConfig1 = createMockProjectConfig({
        name: "healthy-project",
        healthCheck: {
          endpoint: "http://localhost:3000/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      const projectConfig2 = createMockProjectConfig({
        name: "unhealthy-project",
        healthCheck: {
          endpoint: "http://localhost:3001/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      // Mock different responses
      mockNetwork.fetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => "OK",
        })
        .mockRejectedValueOnce(new Error("Connection failed"));

      await healthChecker.startMonitoring("healthy-project", projectConfig1);
      await healthChecker.startMonitoring("unhealthy-project", projectConfig2);

      // Wait for health checks
      await new Promise(resolve => setTimeout(resolve, 1100));

      const healthyStatuses = healthChecker.getHealthStatusesByHealth("healthy");
      const unhealthyStatuses = healthChecker.getHealthStatusesByHealth("unhealthy");

      expect(healthyStatuses).toHaveLength(1);
      expect(healthyStatuses[0].project).toBe("healthy-project");
      expect(unhealthyStatuses).toHaveLength(1);
      expect(unhealthyStatuses[0].project).toBe("unhealthy-project");
    });
  });

  describe("Health Check Configuration", () => {
    it("should validate health check configuration", () => {
      const validConfig: HealthCheckConfig = {
        endpoint: "http://localhost:3000/api/health",
        timeout: 5000,
        interval: 10000,
        expectedResponse: "OK",
      };

      expect(healthChecker.validateHealthCheckConfig(validConfig)).toBe(true);
    });

    it("should reject invalid health check configuration", () => {
      const invalidConfig: HealthCheckConfig = {
        endpoint: "invalid-url",
        timeout: -1,
        interval: -1,
      };

      expect(healthChecker.validateHealthCheckConfig(invalidConfig)).toBe(false);
    });

    it("should handle missing health check configuration", () => {
      const result = healthChecker.validateHealthCheckConfig(undefined);
      expect(result).toBe(true); // Should be valid to have no health check
    });

    it("should validate command-based health check", () => {
      const commandConfig: HealthCheckConfig = {
        command: "curl -f http://localhost:3000/api/health",
        timeout: 5000,
        expectedResponse: "OK",
      };

      expect(healthChecker.validateHealthCheckConfig(commandConfig)).toBe(true);
    });
  });

  describe("Health Statistics", () => {
    it("should get health statistics", async () => {
      const projectConfig1 = createMockProjectConfig({
        name: "healthy-project",
        healthCheck: {
          endpoint: "http://localhost:3000/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      const projectConfig2 = createMockProjectConfig({
        name: "unhealthy-project",
        healthCheck: {
          endpoint: "http://localhost:3001/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      // Mock different responses
      mockNetwork.fetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => "OK",
        })
        .mockRejectedValueOnce(new Error("Connection failed"));

      await healthChecker.startMonitoring("healthy-project", projectConfig1);
      await healthChecker.startMonitoring("unhealthy-project", projectConfig2);

      // Wait for health checks
      await new Promise(resolve => setTimeout(resolve, 1100));

      const stats = healthChecker.getHealthStatistics();

      expect(stats.totalProjects).toBe(2);
      expect(stats.healthyProjects).toBe(1);
      expect(stats.unhealthyProjects).toBe(1);
      expect(stats.degradedProjects).toBe(0);
      expect(stats.unknownProjects).toBe(0);
    });

    it("should get health check performance metrics", async () => {
      const projectConfig = createMockProjectConfig({
        name: "test-project",
        healthCheck: {
          endpoint: "http://localhost:3000/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      mockNetwork.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "OK",
      });

      await healthChecker.startMonitoring("test-project", projectConfig);

      // Wait for multiple health checks
      await new Promise(resolve => setTimeout(resolve, 2100));

      const metrics = healthChecker.getHealthCheckMetrics("test-project");

      expect(metrics).toBeDefined();
      expect(metrics!.totalChecks).toBeGreaterThan(0);
      expect(metrics!.successfulChecks).toBeGreaterThan(0);
      expect(metrics!.averageResponseTime).toBeGreaterThan(0);
      expect(metrics!.successRate).toBeGreaterThan(0);
    });
  });

  describe("Health Check Cleanup", () => {
    it("should cleanup all health monitoring", async () => {
      const projectConfig1 = createMockProjectConfig({
        name: "project1",
        healthCheck: {
          endpoint: "http://localhost:3000/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      const projectConfig2 = createMockProjectConfig({
        name: "project2",
        healthCheck: {
          endpoint: "http://localhost:3001/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      await healthChecker.startMonitoring("project1", projectConfig1);
      await healthChecker.startMonitoring("project2", projectConfig2);

      await healthChecker.cleanup();

      const statuses = healthChecker.getAllHealthStatuses();
      expect(statuses).toHaveLength(0);
    });

    it("should cleanup specific project monitoring", async () => {
      const projectConfig = createMockProjectConfig({
        name: "test-project",
        healthCheck: {
          endpoint: "http://localhost:3000/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      await healthChecker.startMonitoring("test-project", projectConfig);

      await healthChecker.cleanupProject("test-project");

      const status = healthChecker.getHealthStatus("test-project");
      expect(status).toBeUndefined();
    });
  });

  describe("Health Check Events", () => {
    it("should emit health check started events", async () => {
      const events: Array<{ type: string; project: string }> = [];

      healthChecker.onHealthCheckEvent(event => {
        events.push({ type: event.type, project: event.project });
      });

      const projectConfig = createMockProjectConfig({
        name: "test-project",
        healthCheck: {
          endpoint: "http://localhost:3000/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      await healthChecker.startMonitoring("test-project", projectConfig);

      expect(events.some(e => e.type === "health_check_started" && e.project === "test-project")).toBe(true);
    });

    it("should emit health check completed events", async () => {
      const events: Array<{ type: string; project: string }> = [];

      healthChecker.onHealthCheckEvent(event => {
        events.push({ type: event.type, project: event.project });
      });

      const projectConfig = createMockProjectConfig({
        name: "test-project",
        healthCheck: {
          endpoint: "http://localhost:3000/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      mockNetwork.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "OK",
      });

      await healthChecker.startMonitoring("test-project", projectConfig);

      // Wait for health check to complete
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(events.some(e => e.type === "health_check_completed" && e.project === "test-project")).toBe(true);
    });

    it("should emit health check failed events", async () => {
      const events: Array<{ type: string; project: string }> = [];

      healthChecker.onHealthCheckEvent(event => {
        events.push({ type: event.type, project: event.project });
      });

      const projectConfig = createMockProjectConfig({
        name: "test-project",
        healthCheck: {
          endpoint: "http://localhost:3000/api/health",
          interval: 1000,
          timeout: 5000,
        },
      });

      mockNetwork.fetch.mockRejectedValue(new Error("Network error"));

      await healthChecker.startMonitoring("test-project", projectConfig);

      // Wait for health check to fail
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(events.some(e => e.type === "health_check_failed" && e.project === "test-project")).toBe(true);
    });
  });
});
