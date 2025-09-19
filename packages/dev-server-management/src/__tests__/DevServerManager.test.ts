/**
 * 🦊 DevServerManager Test Suite
 *
 * Comprehensive tests for the main development server management orchestrator.
 * Tests integration between all components and end-to-end workflows.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DevServerManager } from "../core/DevServerManager.js";
import {
  createMockDevServerConfig,
  createMockProjectConfig,
  createMockServerInfo,
  createMockHealthStatus,
  setupTestEnvironment,
  cleanupTestEnvironment,
  waitForEvent,
  expectEventEmitted,
  expectNoEventEmitted,
} from "./test-utils.js";
import type { DevServerEvent, ServerInfo, HealthStatus } from "../types/index.js";

describe("DevServerManager", () => {
  let devServerManager: DevServerManager;
  let mockFS: ReturnType<typeof setupTestEnvironment>["mockFS"];
  let mockProcess: ReturnType<typeof setupTestEnvironment>["mockProcess"];
  let mockNetwork: ReturnType<typeof setupTestEnvironment>["mockNetwork"];

  beforeEach(async () => {
    const testEnv = setupTestEnvironment();
    mockFS = testEnv.mockFS;
    mockProcess = testEnv.mockProcess;
    mockNetwork = testEnv.mockNetwork;
    
    // Configure the mocks
    const { readFile, writeFile, access } = await import("node:fs/promises");
    const { spawn, exec } = await import("node:child_process");
    const { createServer } = await import("node:net");
    
    vi.mocked(readFile).mockImplementation(mockFS.readFile);
    vi.mocked(writeFile).mockImplementation(mockFS.writeFile);
    vi.mocked(access).mockImplementation(mockFS.access);
    vi.mocked(spawn).mockImplementation(mockProcess.spawn);
    vi.mocked(exec).mockImplementation(mockProcess.exec);
    vi.mocked(createServer).mockImplementation(mockNetwork.createServer);
    
    devServerManager = new DevServerManager("test-config.json");
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe("Initialization", () => {
    it("should initialize successfully with valid configuration", async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));

      await devServerManager.initialize();

      expect(devServerManager).toBeDefined();
    });

    it("should handle initialization errors gracefully", async () => {
      mockFS.readFile.mockRejectedValueOnce(new Error("Config file not found"));

      await expect(devServerManager.initialize()).rejects.toThrow("Config file not found");
    });

    it("should emit initialization events", async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));

      const initPromise = waitForEvent(devServerManager, "initialized", 1000);

      await devServerManager.initialize();

      const event = await initPromise;
      expect(event).toBeDefined();
      expect(event.config).toBeDefined();
    });

    it("should not reinitialize if already initialized", async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));

      await devServerManager.initialize();
      await devServerManager.initialize(); // Second call should not fail

      expect(mockFS.readFile).toHaveBeenCalledTimes(1);
    });
  });

  describe("Server Lifecycle Management", () => {
    beforeEach(async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();
    });

    it("should start a development server successfully", async () => {
      mockNetwork.setPortInUse(3000, false);

      const startPromise = waitForEvent(devServerManager, "server_started", 5000);

      await devServerManager.start("test-project");

      const event = await startPromise;
      expect(event).toBeDefined();
      expect(event.project).toBe("test-project");
    });

    it("should handle start errors gracefully", async () => {
      mockNetwork.setPortInUse(3000, true);
      mockNetwork.setPortInUse(3001, true);
      // All ports in range are in use

      await expect(devServerManager.start("test-project")).rejects.toThrow();
    });

    it("should stop a running server", async () => {
      mockNetwork.setPortInUse(3000, false);

      // Start server
      await devServerManager.start("test-project");

      const stopPromise = waitForEvent(devServerManager, "server_stopped", 5000);

      // Stop server
      await devServerManager.stop("test-project");

      const event = await stopPromise;
      expect(event).toBeDefined();
      expect(event.project).toBe("test-project");
    });

    it("should handle stop errors gracefully", async () => {
      mockNetwork.setPortInUse(3000, false);

      await devServerManager.start("test-project");

      // Mock process stop failure
      const mockProc = mockProcess.getProcess("pnpm", ["run", "dev"]);
      mockProc!.kill.mockImplementationOnce(() => {
        throw new Error("Cannot stop process");
      });

      await expect(devServerManager.stop("test-project")).rejects.toThrow("Cannot stop process");
    });

    it("should restart a server", async () => {
      mockNetwork.setPortInUse(3000, false);

      // Start server
      await devServerManager.start("test-project");

      const restartPromise = waitForEvent(devServerManager, "server_started", 5000);

      // Restart server
      await devServerManager.restart("test-project");

      const event = await restartPromise;
      expect(event).toBeDefined();
      expect(event.project).toBe("test-project");
    });

    it("should handle restart errors gracefully", async () => {
      mockNetwork.setPortInUse(3000, false);

      await devServerManager.start("test-project");

      // Mock restart failure
      mockProcess.spawn.mockImplementationOnce(() => {
        throw new Error("Restart failed");
      });

      await expect(devServerManager.restart("test-project")).rejects.toThrow("Restart failed");
    });
  });

  describe("Multiple Server Management", () => {
    beforeEach(async () => {
      const mockConfig = createMockDevServerConfig({
        projects: {
          "project1": createMockProjectConfig({ name: "project1", port: 3000 }),
          "project2": createMockProjectConfig({ name: "project2", port: 3001 }),
          "project3": createMockProjectConfig({ name: "project3", port: 3002 }),
        },
      });
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();
    });

    it("should start multiple servers", async () => {
      mockNetwork.setPortInUse(3000, false);
      mockNetwork.setPortInUse(3001, false);
      mockNetwork.setPortInUse(3002, false);

      const startPromise = waitForEvent(devServerManager, "server_started", 10000);

      await devServerManager.startMultiple(["project1", "project2", "project3"]);

      const event = await startPromise;
      expect(event).toBeDefined();
    });

    it("should handle partial failures in multiple server start", async () => {
      mockNetwork.setPortInUse(3000, false);
      mockNetwork.setPortInUse(3001, true); // Port conflict
      mockNetwork.setPortInUse(3002, false);

      await expect(
        devServerManager.startMultiple(["project1", "project2", "project3"])
      ).rejects.toThrow();
    });

    it("should stop all servers", async () => {
      mockNetwork.setPortInUse(3000, false);
      mockNetwork.setPortInUse(3001, false);
      mockNetwork.setPortInUse(3002, false);

      // Start all servers
      await devServerManager.startMultiple(["project1", "project2", "project3"]);

      const stopPromise = waitForEvent(devServerManager, "server_stopped", 10000);

      // Stop all servers
      await devServerManager.stopAll();

      const event = await stopPromise;
      expect(event).toBeDefined();
    });

    it("should handle stop all errors gracefully", async () => {
      mockNetwork.setPortInUse(3000, false);
      mockNetwork.setPortInUse(3001, false);

      await devServerManager.startMultiple(["project1", "project2"]);

      // Mock stop failure for one process
      const mockProc = mockProcess.getProcess("pnpm", ["run", "dev"]);
      mockProc!.kill.mockImplementationOnce(() => {
        throw new Error("Cannot stop process");
      });

      await expect(devServerManager.stopAll()).rejects.toThrow("Cannot stop process");
    });
  });

  describe("Server Status and Monitoring", () => {
    beforeEach(async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();
    });

    it("should get server status", async () => {
      mockNetwork.setPortInUse(3000, false);

      await devServerManager.start("test-project");

      const status = await devServerManager.status("test-project");

      expect(status).toHaveLength(1);
      expect(status[0].name).toBe("test-project");
      expect(status[0].status).toBe("running");
    });

    it("should get status for all servers", async () => {
      const mockConfig = createMockDevServerConfig({
        projects: {
          "project1": createMockProjectConfig({ name: "project1", port: 3000 }),
          "project2": createMockProjectConfig({ name: "project2", port: 3001 }),
        },
      });
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();

      mockNetwork.setPortInUse(3000, false);
      mockNetwork.setPortInUse(3001, false);

      await devServerManager.startMultiple(["project1", "project2"]);

      const status = await devServerManager.status();

      expect(status).toHaveLength(2);
      expect(status.map(s => s.name)).toContain("project1");
      expect(status.map(s => s.name)).toContain("project2");
    });

    it("should get health status", async () => {
      mockNetwork.setPortInUse(3000, false);

      await devServerManager.start("test-project");

      // Mock health check response
      mockNetwork.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "OK",
      });

      const health = await devServerManager.health("test-project");

      expect(health).toHaveLength(1);
      expect(health[0].project).toBe("test-project");
      expect(health[0].health).toBe("healthy");
    });

    it("should get health status for all servers", async () => {
      const mockConfig = createMockDevServerConfig({
        projects: {
          "project1": createMockProjectConfig({ name: "project1", port: 3000 }),
          "project2": createMockProjectConfig({ name: "project2", port: 3001 }),
        },
      });
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();

      mockNetwork.setPortInUse(3000, false);
      mockNetwork.setPortInUse(3001, false);

      await devServerManager.startMultiple(["project1", "project2"]);

      // Mock health check responses
      mockNetwork.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "OK",
      });

      const health = await devServerManager.health();

      expect(health).toHaveLength(2);
      expect(health.map(h => h.project)).toContain("project1");
      expect(health.map(h => h.project)).toContain("project2");
    });

    it("should list available projects", async () => {
      const projects = await devServerManager.list();

      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe("test-project");
    });
  });

  describe("Configuration Management", () => {
    beforeEach(async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();
    });

    it("should reload configuration", async () => {
      const updatedConfig = createMockDevServerConfig({
        projects: {
          ...mockConfig.projects,
          "new-project": createMockProjectConfig({
            name: "new-project",
            port: 3001,
          }),
        },
      });
      mockFS.setFile("test-config.json", JSON.stringify(updatedConfig, null, 2));

      await devServerManager.reloadConfig();

      const projects = await devServerManager.list();
      expect(projects).toHaveLength(2);
      expect(projects.map(p => p.name)).toContain("new-project");
    });

    it("should handle configuration reload errors", async () => {
      mockFS.readFile.mockRejectedValueOnce(new Error("Config reload failed"));

      await expect(devServerManager.reloadConfig()).rejects.toThrow("Config reload failed");
    });
  });

  describe("Error Handling", () => {
    beforeEach(async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();
    });

    it("should handle project not found errors", async () => {
      await expect(devServerManager.start("non-existent-project")).rejects.toThrow("Project 'non-existent-project' not found");
    });

    it("should handle port conflict errors", async () => {
      mockNetwork.setPortInUse(3000, true);
      // All ports in range are in use

      await expect(devServerManager.start("test-project")).rejects.toThrow();
    });

    it("should handle process start errors", async () => {
      mockNetwork.setPortInUse(3000, false);

      mockProcess.spawn.mockImplementationOnce(() => {
        throw new Error("Process start failed");
      });

      await expect(devServerManager.start("test-project")).rejects.toThrow("Process start failed");
    });

    it("should handle health check errors", async () => {
      mockNetwork.setPortInUse(3000, false);

      await devServerManager.start("test-project");

      mockNetwork.fetch.mockRejectedValue(new Error("Health check failed"));

      const health = await devServerManager.health("test-project");
      expect(health[0].health).toBe("unhealthy");
    });
  });

  describe("Event System", () => {
    beforeEach(async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();
    });

    it("should emit server starting events", async () => {
      mockNetwork.setPortInUse(3000, false);

      const startingPromise = waitForEvent(devServerManager, "server_starting", 1000);

      await devServerManager.start("test-project");

      const event = await startingPromise;
      expect(event).toBeDefined();
      expect(event.project).toBe("test-project");
    });

    it("should emit server started events", async () => {
      mockNetwork.setPortInUse(3000, false);

      const startedPromise = waitForEvent(devServerManager, "server_started", 5000);

      await devServerManager.start("test-project");

      const event = await startedPromise;
      expect(event).toBeDefined();
      expect(event.project).toBe("test-project");
      expect(event.data).toBeDefined();
    });

    it("should emit server stopping events", async () => {
      mockNetwork.setPortInUse(3000, false);

      await devServerManager.start("test-project");

      const stoppingPromise = waitForEvent(devServerManager, "server_stopping", 1000);

      await devServerManager.stop("test-project");

      const event = await stoppingPromise;
      expect(event).toBeDefined();
      expect(event.project).toBe("test-project");
    });

    it("should emit server stopped events", async () => {
      mockNetwork.setPortInUse(3000, false);

      await devServerManager.start("test-project");

      const stoppedPromise = waitForEvent(devServerManager, "server_stopped", 5000);

      await devServerManager.stop("test-project");

      const event = await stoppedPromise;
      expect(event).toBeDefined();
      expect(event.project).toBe("test-project");
    });

    it("should emit server error events", async () => {
      mockNetwork.setPortInUse(3000, false);

      mockProcess.spawn.mockImplementationOnce(() => {
        throw new Error("Process error");
      });

      const errorPromise = waitForEvent(devServerManager, "server_error", 1000);

      await expect(devServerManager.start("test-project")).rejects.toThrow();

      const event = await errorPromise;
      expect(event).toBeDefined();
      expect(event.project).toBe("test-project");
      expect(event.data.error).toContain("Process error");
    });

    it("should emit health check events", async () => {
      mockNetwork.setPortInUse(3000, false);

      await devServerManager.start("test-project");

      const healthCheckPromise = waitForEvent(devServerManager, "health_check_started", 1000);

      // Trigger health check
      await devServerManager.health("test-project");

      const event = await healthCheckPromise;
      expect(event).toBeDefined();
      expect(event.project).toBe("test-project");
    });

    it("should emit port allocation events", async () => {
      mockNetwork.setPortInUse(3000, false);

      const portAllocatedPromise = waitForEvent(devServerManager, "port_allocated", 1000);

      await devServerManager.start("test-project");

      const event = await portAllocatedPromise;
      expect(event).toBeDefined();
      expect(event.project).toBe("test-project");
      expect(event.data.port).toBe(3000);
    });

    it("should emit port release events", async () => {
      mockNetwork.setPortInUse(3000, false);

      await devServerManager.start("test-project");

      const portReleasedPromise = waitForEvent(devServerManager, "port_released", 1000);

      await devServerManager.stop("test-project");

      const event = await portReleasedPromise;
      expect(event).toBeDefined();
      expect(event.project).toBe("test-project");
      expect(event.data.port).toBe(3000);
    });
  });

  describe("Dependency Management", () => {
    beforeEach(async () => {
      const mockConfig = createMockDevServerConfig({
        projects: {
          "backend": createMockProjectConfig({
            name: "backend",
            port: 8000,
            dependencies: [],
          }),
          "frontend": createMockProjectConfig({
            name: "frontend",
            port: 3000,
            dependencies: ["backend"],
          }),
        },
      });
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();
    });

    it("should start projects with dependencies in correct order", async () => {
      mockNetwork.setPortInUse(8000, false);
      mockNetwork.setPortInUse(3000, false);

      const startOrder: string[] = [];
      devServerManager.on("server_started", (event) => {
        startOrder.push(event.project);
      });

      await devServerManager.start("frontend");

      expect(startOrder).toContain("backend");
      expect(startOrder).toContain("frontend");
      expect(startOrder.indexOf("backend")).toBeLessThan(startOrder.indexOf("frontend"));
    });

    it("should handle dependency failures", async () => {
      mockNetwork.setPortInUse(8000, true); // Backend port conflict
      mockNetwork.setPortInUse(3000, false);

      await expect(devServerManager.start("frontend")).rejects.toThrow();
    });

    it("should stop projects with dependencies in reverse order", async () => {
      mockNetwork.setPortInUse(8000, false);
      mockNetwork.setPortInUse(3000, false);

      // Start both projects
      await devServerManager.start("frontend");

      const stopOrder: string[] = [];
      devServerManager.on("server_stopped", (event) => {
        stopOrder.push(event.project);
      });

      await devServerManager.stop("frontend");

      expect(stopOrder).toContain("frontend");
      expect(stopOrder).toContain("backend");
      expect(stopOrder.indexOf("frontend")).toBeLessThan(stopOrder.indexOf("backend"));
    });
  });

  describe("Cleanup and Resource Management", () => {
    beforeEach(async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();
    });

    it("should cleanup all resources on shutdown", async () => {
      mockNetwork.setPortInUse(3000, false);

      await devServerManager.start("test-project");

      await devServerManager.cleanup();

      const status = await devServerManager.status();
      expect(status).toHaveLength(0);
    });

    it("should handle cleanup errors gracefully", async () => {
      mockNetwork.setPortInUse(3000, false);

      await devServerManager.start("test-project");

      // Mock cleanup error
      const mockProc = mockProcess.getProcess("pnpm", ["run", "dev"]);
      mockProc!.kill.mockImplementationOnce(() => {
        throw new Error("Cleanup failed");
      });

      await expect(devServerManager.cleanup()).rejects.toThrow("Cleanup failed");
    });
  });

  describe("Performance and Scalability", () => {
    beforeEach(async () => {
      const mockConfig = createMockDevServerConfig({
        global: {
          maxConcurrentServers: 2,
          defaultStartupTimeout: 30000,
          defaultShutdownTimeout: 10000,
          healthCheckInterval: 5000,
          autoRestart: true,
          maxRestartAttempts: 3,
          restartDelay: 1000,
        },
        projects: {
          "project1": createMockProjectConfig({ name: "project1", port: 3000 }),
          "project2": createMockProjectConfig({ name: "project2", port: 3001 }),
          "project3": createMockProjectConfig({ name: "project3", port: 3002 }),
        },
      });
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();
    });

    it("should respect maximum concurrent servers limit", async () => {
      mockNetwork.setPortInUse(3000, false);
      mockNetwork.setPortInUse(3001, false);
      mockNetwork.setPortInUse(3002, false);

      // Start first two servers
      await devServerManager.startMultiple(["project1", "project2"]);

      // Try to start third server - should be queued or rejected
      await expect(devServerManager.start("project3")).rejects.toThrow();
    });

    it("should handle startup timeouts", async () => {
      mockNetwork.setPortInUse(3000, false);

      // Mock slow process startup
      mockProcess.spawn.mockImplementationOnce(() => {
        const mockProc = {
          pid: 12345,
          kill: vi.fn(),
          on: vi.fn(),
          stdout: { on: vi.fn() },
          stderr: { on: vi.fn() },
          exitCode: null,
          signalCode: null,
        };

        // Don't emit ready event to simulate timeout
        return mockProc;
      });

      await expect(devServerManager.start("test-project")).rejects.toThrow("timeout");
    });

    it("should handle shutdown timeouts", async () => {
      mockNetwork.setPortInUse(3000, false);

      await devServerManager.start("test-project");

      // Mock process that won't stop
      const mockProc = mockProcess.getProcess("pnpm", ["run", "dev"]);
      mockProc!.kill.mockImplementationOnce(() => {
        // Don't actually kill the process
      });

      await expect(devServerManager.stop("test-project")).rejects.toThrow("timeout");
    });
  });
});
