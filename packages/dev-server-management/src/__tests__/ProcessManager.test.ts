/**
 * 🦊 ProcessManager Test Suite
 *
 * Comprehensive tests for the process management system.
 * Tests process lifecycle, monitoring, and error handling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ProcessManager } from "../core/ProcessManager.js";
import {
  createMockProcessInfo,
  createMockProjectConfig,
  setupTestEnvironment,
  cleanupTestEnvironment,
  waitForEvent,
} from "./test-utils.js";
import type { ProcessInfo, ProcessOptions, ServerStatus } from "../types/index.js";

describe("ProcessManager", () => {
  let processManager: ProcessManager;
  let mockProcess: ReturnType<typeof setupTestEnvironment>["mockProcess"];

  beforeEach(async () => {
    const testEnv = setupTestEnvironment();
    mockProcess = testEnv.mockProcess;
    
    // Configure the mocks
    const { spawn, exec } = await import("node:child_process");
    vi.mocked(spawn).mockImplementation(mockProcess.spawn);
    vi.mocked(exec).mockImplementation(mockProcess.exec);
    
    processManager = new ProcessManager();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe("Process Lifecycle", () => {
    it("should start a process successfully", async () => {
      const projectConfig = createMockProjectConfig({
        name: "test-project",
        command: "node",
        args: ["server.js"],
        cwd: "/test/project",
      });

      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        cwd: "/test/project",
        env: { NODE_ENV: "development" },
        timeout: 30000,
      };

      const processInfo = await processManager.startProcess("test-project", projectConfig, processOptions);

      expect(processInfo).toBeDefined();
      expect(processInfo.project).toBe("test-project");
      expect(processInfo.status).toBe("starting");
      expect(processInfo.command).toBe("node server.js");
      expect(processInfo.cwd).toBe("/test/project");
      expect(processInfo.pid).toBeGreaterThan(0);
    });

    it("should handle process start errors", async () => {
      const projectConfig = createMockProjectConfig({
        name: "test-project",
        command: "nonexistent-command",
      });

      const processOptions: ProcessOptions = {
        command: "nonexistent-command",
        args: [],
        timeout: 5000,
      };

      mockProcess.spawn.mockImplementationOnce(() => {
        throw new Error("Command not found");
      });

      await expect(
        processManager.startProcess("test-project", projectConfig, processOptions)
      ).rejects.toThrow("Command not found");
    });

    it("should stop a running process", async () => {
      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      // Start process
      const processInfo = await processManager.startProcess("test-project", projectConfig, processOptions);
      const mockProc = mockProcess.getProcess("node", ["server.js"]);

      // Stop process
      await processManager.stopProcess("test-project");

      expect(mockProc!.kill).toHaveBeenCalled();
    });

    it("should handle stop errors gracefully", async () => {
      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("test-project", projectConfig, processOptions);
      const mockProc = mockProcess.getProcess("node", ["server.js"]);
      mockProc!.kill.mockImplementationOnce(() => {
        throw new Error("Cannot kill process");
      });

      await expect(processManager.stopProcess("test-project")).rejects.toThrow("Cannot kill process");
    });

    it("should restart a process", async () => {
      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      // Start process
      await processManager.startProcess("test-project", projectConfig, processOptions);

      // Restart process
      const newProcessInfo = await processManager.restartProcess("test-project", projectConfig, processOptions);

      expect(newProcessInfo).toBeDefined();
      expect(newProcessInfo.project).toBe("test-project");
      expect(newProcessInfo.status).toBe("starting");
    });

    it("should handle restart errors", async () => {
      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("test-project", projectConfig, processOptions);

      // Mock start failure on restart
      mockProcess.spawn.mockImplementationOnce(() => {
        throw new Error("Restart failed");
      });

      await expect(
        processManager.restartProcess("test-project", projectConfig, processOptions)
      ).rejects.toThrow("Restart failed");
    });
  });

  describe("Process Monitoring", () => {
    it("should get process information", async () => {
      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("test-project", projectConfig, processOptions);

      const processInfo = processManager.getProcessInfo("test-project");

      expect(processInfo).toBeDefined();
      expect(processInfo!.project).toBe("test-project");
      expect(processInfo!.status).toBe("starting");
      expect(processInfo!.pid).toBeGreaterThan(0);
    });

    it("should return undefined for non-existent process", () => {
      const processInfo = processManager.getProcessInfo("non-existent");
      expect(processInfo).toBeUndefined();
    });

    it("should list all processes", async () => {
      const projectConfig1 = createMockProjectConfig({ name: "project1" });
      const projectConfig2 = createMockProjectConfig({ name: "project2" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("project1", projectConfig1, processOptions);
      await processManager.startProcess("project2", projectConfig2, processOptions);

      const processes = processManager.listProcesses();

      expect(processes).toHaveLength(2);
      expect(processes.map(p => p.project)).toContain("project1");
      expect(processes.map(p => p.project)).toContain("project2");
    });

    it("should get processes by status", async () => {
      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("test-project", projectConfig, processOptions);

      const runningProcesses = processManager.getProcessesByStatus("starting");
      const stoppedProcesses = processManager.getProcessesByStatus("stopped");

      expect(runningProcesses).toHaveLength(1);
      expect(runningProcesses[0].project).toBe("test-project");
      expect(stoppedProcesses).toHaveLength(0);
    });

    it("should monitor process status changes", async () => {
      const statusChanges: Array<{ project: string; status: ServerStatus }> = [];

      processManager.onProcessStatusChange((project, status) => {
        statusChanges.push({ project, status });
      });

      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("test-project", projectConfig, processOptions);
      await processManager.stopProcess("test-project");

      expect(statusChanges.length).toBeGreaterThan(0);
      expect(statusChanges[0].project).toBe("test-project");
    });
  });

  describe("Process Output Handling", () => {
    it("should capture process stdout", async () => {
      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("test-project", projectConfig, processOptions);

      const processInfo = processManager.getProcessInfo("test-project");
      expect(processInfo!.streams.stdout).toBeDefined();
    });

    it("should capture process stderr", async () => {
      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("test-project", projectConfig, processOptions);

      const processInfo = processManager.getProcessInfo("test-project");
      expect(processInfo!.streams.stderr).toBeDefined();
    });

    it("should handle output events", async () => {
      const outputEvents: Array<{ project: string; type: string; data: string }> = [];

      processManager.onProcessOutput((project, type, data) => {
        outputEvents.push({ project, type, data });
      });

      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("test-project", projectConfig, processOptions);

      // Simulate output
      const mockProc = mockProcess.getProcess("node", ["server.js"]);
      const stdoutHandler = mockProc!.stdout.on.mock.calls.find(call => call[0] === "data")?.[1];
      if (stdoutHandler) {
        stdoutHandler("Server started\n");
      }

      expect(outputEvents.length).toBeGreaterThan(0);
    });
  });

  describe("Process Timeout Handling", () => {
    it("should handle process startup timeout", async () => {
      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 100, // Very short timeout
      };

      // Mock a process that never starts
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

        // Don't emit any events to simulate hanging process
        return mockProc;
      });

      await expect(
        processManager.startProcess("test-project", projectConfig, processOptions)
      ).rejects.toThrow("Process startup timeout");
    });

    it("should handle process shutdown timeout", async () => {
      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("test-project", projectConfig, processOptions);

      // Mock a process that won't die
      const mockProc = mockProcess.getProcess("node", ["server.js"]);
      mockProc!.kill.mockImplementationOnce(() => {
        // Don't actually kill the process
      });

      await expect(
        processManager.stopProcess("test-project", { timeout: 100 })
      ).rejects.toThrow("Process shutdown timeout");
    });
  });

  describe("Process Error Handling", () => {
    it("should handle process exit with error code", async () => {
      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("test-project", projectConfig, processOptions);

      // Simulate process exit with error
      const mockProc = mockProcess.getProcess("node", ["server.js"]);
      const exitHandler = mockProc!.on.mock.calls.find(call => call[0] === "exit")?.[1];
      if (exitHandler) {
        exitHandler(1, "SIGTERM");
      }

      const processInfo = processManager.getProcessInfo("test-project");
      expect(processInfo!.exitCode).toBe(1);
      expect(processInfo!.exitSignal).toBe("SIGTERM");
    });

    it("should handle process errors", async () => {
      const errorEvents: Array<{ project: string; error: Error }> = [];

      processManager.onProcessError((project, error) => {
        errorEvents.push({ project, error });
      });

      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("test-project", projectConfig, processOptions);

      // Simulate process error
      const mockProc = mockProcess.getProcess("node", ["server.js"]);
      const errorHandler = mockProc!.on.mock.calls.find(call => call[0] === "error")?.[1];
      if (errorHandler) {
        errorHandler(new Error("Process error"));
      }

      expect(errorEvents.length).toBeGreaterThan(0);
      expect(errorEvents[0].project).toBe("test-project");
    });
  });

  describe("Process Cleanup", () => {
    it("should cleanup all processes", async () => {
      const projectConfig1 = createMockProjectConfig({ name: "project1" });
      const projectConfig2 = createMockProjectConfig({ name: "project2" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("project1", projectConfig1, processOptions);
      await processManager.startProcess("project2", projectConfig2, processOptions);

      await processManager.cleanupAll();

      const processes = processManager.listProcesses();
      expect(processes).toHaveLength(0);
    });

    it("should cleanup specific process", async () => {
      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("test-project", projectConfig, processOptions);

      await processManager.cleanupProcess("test-project");

      const processInfo = processManager.getProcessInfo("test-project");
      expect(processInfo).toBeUndefined();
    });

    it("should handle cleanup errors gracefully", async () => {
      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("test-project", projectConfig, processOptions);

      // Mock cleanup error
      const mockProc = mockProcess.getProcess("node", ["server.js"]);
      mockProc!.kill.mockImplementationOnce(() => {
        throw new Error("Cleanup failed");
      });

      await expect(processManager.cleanupProcess("test-project")).rejects.toThrow("Cleanup failed");
    });
  });

  describe("Process Statistics", () => {
    it("should get process statistics", async () => {
      const projectConfig1 = createMockProjectConfig({ name: "project1" });
      const projectConfig2 = createMockProjectConfig({ name: "project2" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("project1", projectConfig1, processOptions);
      await processManager.startProcess("project2", projectConfig2, processOptions);

      const stats = processManager.getProcessStatistics();

      expect(stats.totalProcesses).toBe(2);
      expect(stats.byStatus.starting).toBe(2);
      expect(stats.byStatus.stopped).toBe(0);
    });

    it("should get process health statistics", async () => {
      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("test-project", projectConfig, processOptions);

      const healthStats = processManager.getProcessHealthStatistics();

      expect(healthStats.totalProcesses).toBe(1);
      expect(healthStats.healthyProcesses).toBe(0); // Still starting
      expect(healthStats.unhealthyProcesses).toBe(0);
    });
  });

  describe("Process Dependencies", () => {
    it("should start processes with dependencies", async () => {
      const projectConfig1 = createMockProjectConfig({ 
        name: "project1",
        dependencies: []
      });
      const projectConfig2 = createMockProjectConfig({ 
        name: "project2",
        dependencies: ["project1"]
      });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      // Start project1 first
      await processManager.startProcess("project1", projectConfig1, processOptions);

      // Start project2 (should wait for project1)
      const startPromise = processManager.startProcess("project2", projectConfig2, processOptions);

      // Simulate project1 becoming ready
      const mockProc1 = mockProcess.getProcess("node", ["server.js"]);
      const readyHandler = mockProc1!.on.mock.calls.find(call => call[0] === "ready")?.[1];
      if (readyHandler) {
        readyHandler();
      }

      await startPromise;

      const process2 = processManager.getProcessInfo("project2");
      expect(process2).toBeDefined();
    });

    it("should handle dependency failures", async () => {
      const projectConfig1 = createMockProjectConfig({ 
        name: "project1",
        dependencies: []
      });
      const projectConfig2 = createMockProjectConfig({ 
        name: "project2",
        dependencies: ["project1"]
      });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      // Start project1
      await processManager.startProcess("project1", projectConfig1, processOptions);

      // Start project2
      const startPromise = processManager.startProcess("project2", projectConfig2, processOptions);

      // Simulate project1 failure
      const mockProc1 = mockProcess.getProcess("node", ["server.js"]);
      const errorHandler = mockProc1!.on.mock.calls.find(call => call[0] === "error")?.[1];
      if (errorHandler) {
        errorHandler(new Error("Dependency failed"));
      }

      await expect(startPromise).rejects.toThrow("Dependency failed");
    });
  });

  describe("Process Environment", () => {
    it("should set process environment variables", async () => {
      const projectConfig = createMockProjectConfig({ 
        name: "test-project",
        env: { NODE_ENV: "development", PORT: "3000" }
      });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        env: { NODE_ENV: "development", PORT: "3000" },
        timeout: 30000,
      };

      await processManager.startProcess("test-project", projectConfig, processOptions);

      expect(mockProcess.spawn).toHaveBeenCalledWith(
        "node",
        ["server.js"],
        expect.objectContaining({
          env: expect.objectContaining({
            NODE_ENV: "development",
            PORT: "3000"
          })
        })
      );
    });

    it("should inherit parent environment", async () => {
      const projectConfig = createMockProjectConfig({ name: "test-project" });
      const processOptions: ProcessOptions = {
        command: "node",
        args: ["server.js"],
        timeout: 30000,
      };

      await processManager.startProcess("test-project", projectConfig, processOptions);

      expect(mockProcess.spawn).toHaveBeenCalledWith(
        "node",
        ["server.js"],
        expect.objectContaining({
          env: expect.objectContaining({
            PATH: process.env.PATH
          })
        })
      );
    });
  });
});
