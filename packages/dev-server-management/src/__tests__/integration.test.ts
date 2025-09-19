/**
 * 🦊 Integration Test Suite
 *
 * End-to-end integration tests for the complete dev server management system.
 * Tests real workflows, component interactions, and system behavior.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DevServerManager } from "../core/DevServerManager.js";
import {
  createMockDevServerConfig,
  createMockProjectConfig,
  setupTestEnvironment,
  cleanupTestEnvironment,
  waitForEvent,
  waitForEvents,
} from "./test-utils.js";
import type { DevServerEvent, ServerInfo, HealthStatus } from "../types/index.js";

describe("Dev Server Management Integration Tests", () => {
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

  afterEach(async () => {
    try {
      await devServerManager.cleanup();
    } catch (error) {
      // Ignore cleanup errors in tests
    }
    cleanupTestEnvironment();
  });

  describe("Complete Development Workflow", () => {
    it("should handle a complete development session", async () => {
      const mockConfig = createMockDevServerConfig({
        projects: {
          "frontend": createMockProjectConfig({
            name: "frontend",
            port: 3000,
            description: "Frontend application",
            category: "package",
            command: "pnpm",
            args: ["run", "dev"],
            healthCheck: {
              endpoint: "http://localhost:3000/health",
              timeout: 5000,
              interval: 10000,
            },
          }),
          "backend": createMockProjectConfig({
            name: "backend",
            port: 8000,
            description: "Backend API",
            category: "backend",
            command: "python",
            args: ["main.py"],
            healthCheck: {
              endpoint: "http://localhost:8000/health",
              timeout: 5000,
              interval: 10000,
            },
          }),
        },
      });

      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));

      // Initialize the system
      await devServerManager.initialize();

      // Set up network mocks
      mockNetwork.setPortInUse(3000, false);
      mockNetwork.setPortInUse(8000, false);

      // Mock health check responses
      mockNetwork.fetch.mockImplementation(async (url: string) => {
        if (url.includes("3000")) {
          return {
            ok: true,
            status: 200,
            text: async () => "OK",
            json: async () => ({ status: "healthy" }),
          };
        } else if (url.includes("8000")) {
          return {
            ok: true,
            status: 200,
            text: async () => "OK",
            json: async () => ({ status: "healthy" }),
          };
        }
        throw new Error("Unknown endpoint");
      });

      // Start both servers
      const startEvents = await waitForEvents(devServerManager, ["server_started"], 10000);
      await devServerManager.startMultiple(["frontend", "backend"]);

      // Verify servers are running
      const status = await devServerManager.status();
      expect(status).toHaveLength(2);
      expect(status.map(s => s.name)).toContain("frontend");
      expect(status.map(s => s.name)).toContain("backend");

      // Check health status
      const health = await devServerManager.health();
      expect(health).toHaveLength(2);
      expect(health.every(h => h.health === "healthy")).toBe(true);

      // Restart one server
      await devServerManager.restart("frontend");

      // Verify restart worked
      const updatedStatus = await devServerManager.status("frontend");
      expect(updatedStatus).toHaveLength(1);
      expect(updatedStatus[0].name).toBe("frontend");

      // Stop all servers
      await devServerManager.stopAll();

      // Verify all servers are stopped
      const finalStatus = await devServerManager.status();
      expect(finalStatus).toHaveLength(0);
    });

    it("should handle dependency-based startup", async () => {
      const mockConfig = createMockDevServerConfig({
        projects: {
          "database": createMockProjectConfig({
            name: "database",
            port: 5432,
            description: "Database service",
            category: "backend",
            command: "docker",
            args: ["run", "postgres"],
            dependencies: [],
          }),
          "backend": createMockProjectConfig({
            name: "backend",
            port: 8000,
            description: "Backend API",
            category: "backend",
            command: "python",
            args: ["main.py"],
            dependencies: ["database"],
          }),
          "frontend": createMockProjectConfig({
            name: "frontend",
            port: 3000,
            description: "Frontend application",
            category: "package",
            command: "pnpm",
            args: ["run", "dev"],
            dependencies: ["backend"],
          }),
        },
      });

      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();

      // Set up network mocks
      mockNetwork.setPortInUse(5432, false);
      mockNetwork.setPortInUse(8000, false);
      mockNetwork.setPortInUse(3000, false);

      // Start frontend (should start database and backend first)
      const startEvents: DevServerEvent[] = [];
      devServerManager.on("server_started", (event) => {
        startEvents.push(event);
      });

      await devServerManager.start("frontend");

      // Verify startup order
      expect(startEvents).toHaveLength(3);
      expect(startEvents[0].project).toBe("database");
      expect(startEvents[1].project).toBe("backend");
      expect(startEvents[2].project).toBe("frontend");

      // Stop frontend (should stop in reverse order)
      const stopEvents: DevServerEvent[] = [];
      devServerManager.on("server_stopped", (event) => {
        stopEvents.push(event);
      });

      await devServerManager.stop("frontend");

      // Verify stop order
      expect(stopEvents).toHaveLength(3);
      expect(stopEvents[0].project).toBe("frontend");
      expect(stopEvents[1].project).toBe("backend");
      expect(stopEvents[2].project).toBe("database");
    });
  });

  describe("Error Recovery and Resilience", () => {
    it("should handle port conflicts gracefully", async () => {
      const mockConfig = createMockDevServerConfig({
        projects: {
          "project1": createMockProjectConfig({
            name: "project1",
            port: 3000,
            category: "package",
          }),
          "project2": createMockProjectConfig({
            name: "project2",
            port: 3000, // Same port as project1
            category: "package",
          }),
        },
      });

      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();

      // First project should start successfully
      mockNetwork.setPortInUse(3000, false);
      await devServerManager.start("project1");

      // Second project should find alternative port
      mockNetwork.setPortInUse(3000, true);
      mockNetwork.setPortInUse(3001, false);
      await devServerManager.start("project2");

      const status = await devServerManager.status();
      expect(status).toHaveLength(2);
      expect(status.find(s => s.name === "project1")!.port).toBe(3000);
      expect(status.find(s => s.name === "project2")!.port).toBe(3001);
    });

    it("should handle process failures and recovery", async () => {
      const mockConfig = createMockDevServerConfig({
        global: {
          autoRestart: true,
          maxRestartAttempts: 3,
          restartDelay: 100,
        },
        projects: {
          "unstable-project": createMockProjectConfig({
            name: "unstable-project",
            port: 3000,
            command: "node",
            args: ["unstable-server.js"],
          }),
        },
      });

      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();

      mockNetwork.setPortInUse(3000, false);

      // Mock process that fails after starting
      let startCount = 0;
      mockProcess.spawn.mockImplementation(() => {
        startCount++;
        const mockProc = {
          pid: 12345 + startCount,
          kill: vi.fn(),
          on: vi.fn((event, handler) => {
            if (event === "exit" && startCount > 1) {
              // Simulate process exit after restart
              setTimeout(() => handler(0, null), 50);
            }
          }),
          stdout: { on: vi.fn() },
          stderr: { on: vi.fn() },
          exitCode: null,
          signalCode: null,
        };
        return mockProc;
      });

      await devServerManager.start("unstable-project");

      // Wait for potential restarts
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify process was restarted
      expect(startCount).toBeGreaterThan(1);
    });

    it("should handle health check failures", async () => {
      const mockConfig = createMockDevServerConfig({
        projects: {
          "unhealthy-project": createMockProjectConfig({
            name: "unhealthy-project",
            port: 3000,
            healthCheck: {
              endpoint: "http://localhost:3000/health",
              timeout: 1000,
              interval: 500,
            },
          }),
        },
      });

      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();

      mockNetwork.setPortInUse(3000, false);

      // Mock health check that fails
      mockNetwork.fetch.mockRejectedValue(new Error("Health check failed"));

      await devServerManager.start("unhealthy-project");

      // Wait for health checks
      await new Promise(resolve => setTimeout(resolve, 1000));

      const health = await devServerManager.health("unhealthy-project");
      expect(health[0].health).toBe("unhealthy");
      expect(health[0].error).toContain("Health check failed");
    });
  });

  describe("Configuration Management Integration", () => {
    it("should handle configuration updates during runtime", async () => {
      const initialConfig = createMockDevServerConfig({
        projects: {
          "project1": createMockProjectConfig({
            name: "project1",
            port: 3000,
            description: "Initial project",
          }),
        },
      });

      mockFS.setFile("test-config.json", JSON.stringify(initialConfig, null, 2));
      await devServerManager.initialize();

      // Start initial project
      mockNetwork.setPortInUse(3000, false);
      await devServerManager.start("project1");

      // Update configuration
      const updatedConfig = createMockDevServerConfig({
        projects: {
          "project1": createMockProjectConfig({
            name: "project1",
            port: 3000,
            description: "Updated project",
          }),
          "project2": createMockProjectConfig({
            name: "project2",
            port: 3001,
            description: "New project",
          }),
        },
      });

      mockFS.setFile("test-config.json", JSON.stringify(updatedConfig, null, 2));

      // Reload configuration
      await devServerManager.reloadConfig();

      // Verify updated configuration
      const projects = await devServerManager.list();
      expect(projects).toHaveLength(2);
      expect(projects.find(p => p.name === "project1")!.description).toBe("Updated project");
      expect(projects.find(p => p.name === "project2")!.description).toBe("New project");

      // Verify running project is still running
      const status = await devServerManager.status();
      expect(status).toHaveLength(1);
      expect(status[0].name).toBe("project1");
    });

    it("should handle configuration validation errors", async () => {
      const invalidConfig = {
        version: "1.0.0",
        // Missing required fields
      };

      mockFS.setFile("test-config.json", JSON.stringify(invalidConfig, null, 2));

      await expect(devServerManager.initialize()).rejects.toThrow();
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle multiple concurrent operations", async () => {
      const mockConfig = createMockDevServerConfig({
        projects: {
          "project1": createMockProjectConfig({ name: "project1", port: 3000 }),
          "project2": createMockProjectConfig({ name: "project2", port: 3001 }),
          "project3": createMockProjectConfig({ name: "project3", port: 3002 }),
          "project4": createMockProjectConfig({ name: "project4", port: 3003 }),
          "project5": createMockProjectConfig({ name: "project5", port: 3004 }),
        },
      });

      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();

      // Set up all ports as available
      for (let port = 3000; port <= 3004; port++) {
        mockNetwork.setPortInUse(port, false);
      }

      // Start all projects concurrently
      const startPromises = [
        devServerManager.start("project1"),
        devServerManager.start("project2"),
        devServerManager.start("project3"),
        devServerManager.start("project4"),
        devServerManager.start("project5"),
      ];

      await Promise.all(startPromises);

      // Verify all projects are running
      const status = await devServerManager.status();
      expect(status).toHaveLength(5);
      expect(status.every(s => s.status === "running")).toBe(true);
    });

    it("should handle large numbers of health checks", async () => {
      const projects = Array.from({ length: 10 }, (_, i) => ({
        [`project${i + 1}`]: createMockProjectConfig({
          name: `project${i + 1}`,
          port: 3000 + i,
          healthCheck: {
            endpoint: `http://localhost:${3000 + i}/health`,
            timeout: 1000,
            interval: 100,
          },
        }),
      }));

      const mockConfig = createMockDevServerConfig({
        projects: Object.assign({}, ...projects),
      });

      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();

      // Set up all ports as available
      for (let port = 3000; port <= 3009; port++) {
        mockNetwork.setPortInUse(port, false);
      }

      // Mock health check responses
      mockNetwork.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "OK",
      });

      // Start all projects
      const projectNames = Array.from({ length: 10 }, (_, i) => `project${i + 1}`);
      await devServerManager.startMultiple(projectNames);

      // Wait for health checks to run
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify all health checks are working
      const health = await devServerManager.health();
      expect(health).toHaveLength(10);
      expect(health.every(h => h.health === "healthy")).toBe(true);
    });
  });

  describe("Event System Integration", () => {
    it("should emit all expected events during a complete workflow", async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();

      mockNetwork.setPortInUse(3000, false);

      const events: DevServerEvent[] = [];
      devServerManager.on("event", (event) => {
        events.push(event);
      });

      // Start server
      await devServerManager.start("test-project");

      // Wait for events
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify expected events were emitted
      const eventTypes = events.map(e => e.type);
      expect(eventTypes).toContain("server_starting");
      expect(eventTypes).toContain("server_started");
      expect(eventTypes).toContain("port_allocated");

      // Stop server
      await devServerManager.stop("test-project");

      // Wait for events
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify stop events were emitted
      const allEventTypes = events.map(e => e.type);
      expect(allEventTypes).toContain("server_stopping");
      expect(allEventTypes).toContain("server_stopped");
      expect(allEventTypes).toContain("port_released");
    });

    it("should handle event listener errors gracefully", async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();

      mockNetwork.setPortInUse(3000, false);

      // Add error-throwing event listener
      devServerManager.on("server_started", () => {
        throw new Error("Event listener error");
      });

      // Should not prevent server from starting
      await expect(devServerManager.start("test-project")).resolves.not.toThrow();
    });
  });

  describe("Resource Cleanup Integration", () => {
    it("should properly cleanup all resources on shutdown", async () => {
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

      // Start multiple projects
      await devServerManager.startMultiple(["project1", "project2"]);

      // Verify projects are running
      let status = await devServerManager.status();
      expect(status).toHaveLength(2);

      // Cleanup
      await devServerManager.cleanup();

      // Verify all resources are cleaned up
      status = await devServerManager.status();
      expect(status).toHaveLength(0);

      // Verify ports are released
      expect(mockNetwork.isPortInUse(3000)).toBe(false);
      expect(mockNetwork.isPortInUse(3001)).toBe(false);
    });

    it("should handle cleanup errors gracefully", async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await devServerManager.initialize();

      mockNetwork.setPortInUse(3000, false);
      await devServerManager.start("test-project");

      // Mock cleanup error
      const mockProc = mockProcess.getProcess("pnpm", ["run", "dev"]);
      mockProc!.kill.mockImplementationOnce(() => {
        throw new Error("Cleanup failed");
      });

      // Should handle cleanup errors gracefully
      await expect(devServerManager.cleanup()).rejects.toThrow("Cleanup failed");
    });
  });
});
