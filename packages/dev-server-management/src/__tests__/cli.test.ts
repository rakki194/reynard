/**
 * 🦊 CLI Commands Test Suite
 *
 * Comprehensive tests for the command-line interface.
 * Tests all CLI commands, argument parsing, and output formatting.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Command } from "commander";
import {
  handleStart,
  handleStop,
  handleRestart,
  handleStatus,
  handleList,
  handleHealth,
  handleConfig,
  handleStats,
  handleStartMultiple,
  handleStopAll,
} from "../cli/commands/index.js";
import {
  createMockDevServerConfig,
  createMockProjectConfig,
  createMockServerInfo,
  createMockHealthStatus,
  setupTestEnvironment,
  cleanupTestEnvironment,
} from "./test-utils.js";

// Mock the DevServerManager
const mockDevServerManager = {
  initialize: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  restart: vi.fn(),
  status: vi.fn(),
  list: vi.fn(),
  health: vi.fn(),
  startMultiple: vi.fn(),
  stopAll: vi.fn(),
  reloadConfig: vi.fn(),
  cleanup: vi.fn(),
};

vi.mock("../core/DevServerManager.js", () => ({
  DevServerManager: vi.fn().mockImplementation(() => mockDevServerManager),
}));

describe("CLI Commands", () => {
  let program: Command;

  beforeEach(() => {
    const testEnv = setupTestEnvironment();
    program = new Command();
    
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockDevServerManager.initialize.mockResolvedValue(undefined);
    mockDevServerManager.start.mockResolvedValue(undefined);
    mockDevServerManager.stop.mockResolvedValue(undefined);
    mockDevServerManager.restart.mockResolvedValue(undefined);
    mockDevServerManager.status.mockResolvedValue([]);
    mockDevServerManager.list.mockResolvedValue([]);
    mockDevServerManager.health.mockResolvedValue([]);
    mockDevServerManager.startMultiple.mockResolvedValue(undefined);
    mockDevServerManager.stopAll.mockResolvedValue(undefined);
    mockDevServerManager.reloadConfig.mockResolvedValue(undefined);
    mockDevServerManager.cleanup.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe("Start Command", () => {
    it("should start a single project", async () => {
      const startCommand = createStartCommand();
      program.addCommand(startCommand);

      await program.parseAsync(["node", "dev-server", "start", "test-project"]);

      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.start).toHaveBeenCalledWith("test-project", undefined);
    });

    it("should start a project with detached option", async () => {
      const startCommand = createStartCommand();
      program.addCommand(startCommand);

      await program.parseAsync(["node", "dev-server", "start", "test-project", "--detached"]);

      expect(mockDevServerManager.start).toHaveBeenCalledWith("test-project", { detached: true });
    });

    it("should handle start errors", async () => {
      mockDevServerManager.start.mockRejectedValueOnce(new Error("Start failed"));

      const startCommand = createStartCommand();
      program.addCommand(startCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "start", "test-project"])
      ).rejects.toThrow("Start failed");
    });

    it("should require project name", async () => {
      const startCommand = createStartCommand();
      program.addCommand(startCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "start"])
      ).rejects.toThrow();
    });
  });

  describe("Stop Command", () => {
    it("should stop a single project", async () => {
      const stopCommand = createStopCommand();
      program.addCommand(stopCommand);

      await program.parseAsync(["node", "dev-server", "stop", "test-project"]);

      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.stop).toHaveBeenCalledWith("test-project");
    });

    it("should handle stop errors", async () => {
      mockDevServerManager.stop.mockRejectedValueOnce(new Error("Stop failed"));

      const stopCommand = createStopCommand();
      program.addCommand(stopCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "stop", "test-project"])
      ).rejects.toThrow("Stop failed");
    });

    it("should require project name", async () => {
      const stopCommand = createStopCommand();
      program.addCommand(stopCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "stop"])
      ).rejects.toThrow();
    });
  });

  describe("Restart Command", () => {
    it("should restart a single project", async () => {
      const restartCommand = createRestartCommand();
      program.addCommand(restartCommand);

      await program.parseAsync(["node", "dev-server", "restart", "test-project"]);

      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.restart).toHaveBeenCalledWith("test-project");
    });

    it("should handle restart errors", async () => {
      mockDevServerManager.restart.mockRejectedValueOnce(new Error("Restart failed"));

      const restartCommand = createRestartCommand();
      program.addCommand(restartCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "restart", "test-project"])
      ).rejects.toThrow("Restart failed");
    });

    it("should require project name", async () => {
      const restartCommand = createRestartCommand();
      program.addCommand(restartCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "restart"])
      ).rejects.toThrow();
    });
  });

  describe("Status Command", () => {
    it("should show status for all projects", async () => {
      const mockStatus = [
        createMockServerInfo({ name: "project1", status: "running" }),
        createMockServerInfo({ name: "project2", status: "stopped" }),
      ];
      mockDevServerManager.status.mockResolvedValueOnce(mockStatus);

      const statusCommand = createStatusCommand();
      program.addCommand(statusCommand);

      await program.parseAsync(["node", "dev-server", "status"]);

      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.status).toHaveBeenCalledWith(undefined);
    });

    it("should show status for specific project", async () => {
      const mockStatus = [createMockServerInfo({ name: "test-project", status: "running" })];
      mockDevServerManager.status.mockResolvedValueOnce(mockStatus);

      const statusCommand = createStatusCommand();
      program.addCommand(statusCommand);

      await program.parseAsync(["node", "dev-server", "status", "test-project"]);

      expect(mockDevServerManager.status).toHaveBeenCalledWith("test-project");
    });

    it("should handle status errors", async () => {
      mockDevServerManager.status.mockRejectedValueOnce(new Error("Status failed"));

      const statusCommand = createStatusCommand();
      program.addCommand(statusCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "status"])
      ).rejects.toThrow("Status failed");
    });
  });

  describe("List Command", () => {
    it("should list all available projects", async () => {
      const mockProjects = [
        createMockProjectConfig({ name: "project1", description: "Project 1" }),
        createMockProjectConfig({ name: "project2", description: "Project 2" }),
      ];
      mockDevServerManager.list.mockResolvedValueOnce(mockProjects);

      const listCommand = createListCommand();
      program.addCommand(listCommand);

      await program.parseAsync(["node", "dev-server", "list"]);

      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.list).toHaveBeenCalled();
    });

    it("should handle list errors", async () => {
      mockDevServerManager.list.mockRejectedValueOnce(new Error("List failed"));

      const listCommand = createListCommand();
      program.addCommand(listCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "list"])
      ).rejects.toThrow("List failed");
    });
  });

  describe("Health Command", () => {
    it("should show health for all projects", async () => {
      const mockHealth = [
        createMockHealthStatus({ project: "project1", health: "healthy" }),
        createMockHealthStatus({ project: "project2", health: "unhealthy" }),
      ];
      mockDevServerManager.health.mockResolvedValueOnce(mockHealth);

      const healthCommand = createHealthCommand();
      program.addCommand(healthCommand);

      await program.parseAsync(["node", "dev-server", "health"]);

      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.health).toHaveBeenCalledWith(undefined);
    });

    it("should show health for specific project", async () => {
      const mockHealth = [createMockHealthStatus({ project: "test-project", health: "healthy" })];
      mockDevServerManager.health.mockResolvedValueOnce(mockHealth);

      const healthCommand = createHealthCommand();
      program.addCommand(healthCommand);

      await program.parseAsync(["node", "dev-server", "health", "test-project"]);

      expect(mockDevServerManager.health).toHaveBeenCalledWith("test-project");
    });

    it("should handle health errors", async () => {
      mockDevServerManager.health.mockRejectedValueOnce(new Error("Health check failed"));

      const healthCommand = createHealthCommand();
      program.addCommand(healthCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "health"])
      ).rejects.toThrow("Health check failed");
    });
  });

  describe("Config Command", () => {
    it("should show configuration", async () => {
      const mockConfig = createMockDevServerConfig();
      mockDevServerManager.initialize.mockResolvedValueOnce(undefined);

      const configCommand = createConfigCommand();
      program.addCommand(configCommand);

      await program.parseAsync(["node", "dev-server", "config"]);

      expect(mockDevServerManager.initialize).toHaveBeenCalled();
    });

    it("should reload configuration", async () => {
      const configCommand = createConfigCommand();
      program.addCommand(configCommand);

      await program.parseAsync(["node", "dev-server", "config", "reload"]);

      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.reloadConfig).toHaveBeenCalled();
    });

    it("should handle config errors", async () => {
      mockDevServerManager.reloadConfig.mockRejectedValueOnce(new Error("Config reload failed"));

      const configCommand = createConfigCommand();
      program.addCommand(configCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "config", "reload"])
      ).rejects.toThrow("Config reload failed");
    });
  });

  describe("Stats Command", () => {
    it("should show statistics", async () => {
      const mockStatus = [
        createMockServerInfo({ name: "project1", status: "running" }),
        createMockServerInfo({ name: "project2", status: "stopped" }),
      ];
      const mockHealth = [
        createMockHealthStatus({ project: "project1", health: "healthy" }),
        createMockHealthStatus({ project: "project2", health: "unhealthy" }),
      ];
      mockDevServerManager.status.mockResolvedValueOnce(mockStatus);
      mockDevServerManager.health.mockResolvedValueOnce(mockHealth);

      const statsCommand = createStatsCommand();
      program.addCommand(statsCommand);

      await program.parseAsync(["node", "dev-server", "stats"]);

      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.status).toHaveBeenCalled();
      expect(mockDevServerManager.health).toHaveBeenCalled();
    });

    it("should handle stats errors", async () => {
      mockDevServerManager.status.mockRejectedValueOnce(new Error("Stats failed"));

      const statsCommand = createStatsCommand();
      program.addCommand(statsCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "stats"])
      ).rejects.toThrow("Stats failed");
    });
  });

  describe("Start Multiple Command", () => {
    it("should start multiple projects", async () => {
      const startMultipleCommand = createStartMultipleCommand();
      program.addCommand(startMultipleCommand);

      await program.parseAsync(["node", "dev-server", "start-multiple", "project1", "project2", "project3"]);

      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.startMultiple).toHaveBeenCalledWith(["project1", "project2", "project3"]);
    });

    it("should handle start multiple errors", async () => {
      mockDevServerManager.startMultiple.mockRejectedValueOnce(new Error("Start multiple failed"));

      const startMultipleCommand = createStartMultipleCommand();
      program.addCommand(startMultipleCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "start-multiple", "project1", "project2"])
      ).rejects.toThrow("Start multiple failed");
    });

    it("should require at least one project", async () => {
      const startMultipleCommand = createStartMultipleCommand();
      program.addCommand(startMultipleCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "start-multiple"])
      ).rejects.toThrow();
    });
  });

  describe("Stop All Command", () => {
    it("should stop all projects", async () => {
      const stopAllCommand = createStopAllCommand();
      program.addCommand(stopAllCommand);

      await program.parseAsync(["node", "dev-server", "stop-all"]);

      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.stopAll).toHaveBeenCalled();
    });

    it("should handle stop all errors", async () => {
      mockDevServerManager.stopAll.mockRejectedValueOnce(new Error("Stop all failed"));

      const stopAllCommand = createStopAllCommand();
      program.addCommand(stopAllCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "stop-all"])
      ).rejects.toThrow("Stop all failed");
    });
  });

  describe("CLI Integration", () => {
    it("should handle unknown commands gracefully", async () => {
      const startCommand = createStartCommand();
      program.addCommand(startCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "unknown-command"])
      ).rejects.toThrow();
    });

    it("should handle missing arguments gracefully", async () => {
      const startCommand = createStartCommand();
      program.addCommand(startCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "start"])
      ).rejects.toThrow();
    });

    it("should handle invalid options gracefully", async () => {
      const startCommand = createStartCommand();
      program.addCommand(startCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "start", "test-project", "--invalid-option"])
      ).rejects.toThrow();
    });
  });

  describe("Output Formatting", () => {
    it("should format status output correctly", async () => {
      const mockStatus = [
        createMockServerInfo({
          name: "project1",
          status: "running",
          port: 3000,
          pid: 12345,
          health: "healthy",
        }),
      ];
      mockDevServerManager.status.mockResolvedValueOnce(mockStatus);

      const statusCommand = createStatusCommand();
      program.addCommand(statusCommand);

      // Capture console output
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await program.parseAsync(["node", "dev-server", "status"]);

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain("project1");
      expect(consoleSpy.mock.calls[0][0]).toContain("running");
      expect(consoleSpy.mock.calls[0][0]).toContain("3000");

      consoleSpy.mockRestore();
    });

    it("should format health output correctly", async () => {
      const mockHealth = [
        createMockHealthStatus({
          project: "project1",
          health: "healthy",
          lastCheck: new Date("2024-01-01T00:00:00Z"),
          checkDuration: 150,
        }),
      ];
      mockDevServerManager.health.mockResolvedValueOnce(mockHealth);

      const healthCommand = createHealthCommand();
      program.addCommand(healthCommand);

      // Capture console output
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await program.parseAsync(["node", "dev-server", "health"]);

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain("project1");
      expect(consoleSpy.mock.calls[0][0]).toContain("healthy");

      consoleSpy.mockRestore();
    });

    it("should format list output correctly", async () => {
      const mockProjects = [
        createMockProjectConfig({
          name: "project1",
          description: "Project 1",
          category: "package",
          port: 3000,
        }),
      ];
      mockDevServerManager.list.mockResolvedValueOnce(mockProjects);

      const listCommand = createListCommand();
      program.addCommand(listCommand);

      // Capture console output
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await program.parseAsync(["node", "dev-server", "list"]);

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain("project1");
      expect(consoleSpy.mock.calls[0][0]).toContain("Project 1");
      expect(consoleSpy.mock.calls[0][0]).toContain("package");

      consoleSpy.mockRestore();
    });
  });

  describe("Error Handling", () => {
    it("should handle initialization errors", async () => {
      mockDevServerManager.initialize.mockRejectedValueOnce(new Error("Init failed"));

      const startCommand = createStartCommand();
      program.addCommand(startCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "start", "test-project"])
      ).rejects.toThrow("Init failed");
    });

    it("should handle cleanup errors", async () => {
      mockDevServerManager.cleanup.mockRejectedValueOnce(new Error("Cleanup failed"));

      const stopCommand = createStopCommand();
      program.addCommand(stopCommand);

      // Should not throw during cleanup
      await program.parseAsync(["node", "dev-server", "stop", "test-project"]);
    });

    it("should handle partial failures in start multiple", async () => {
      mockDevServerManager.startMultiple.mockRejectedValueOnce(new Error("Partial failure"));

      const startMultipleCommand = createStartMultipleCommand();
      program.addCommand(startMultipleCommand);

      await expect(
        program.parseAsync(["node", "dev-server", "start-multiple", "project1", "project2"])
      ).rejects.toThrow("Partial failure");
    });
  });

  describe("Progress and Feedback", () => {
    it("should show progress for long-running operations", async () => {
      // Mock a slow operation
      mockDevServerManager.startMultiple.mockImplementationOnce(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const startMultipleCommand = createStartMultipleCommand();
      program.addCommand(startMultipleCommand);

      // Capture console output
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await program.parseAsync(["node", "dev-server", "start-multiple", "project1", "project2"]);

      expect(consoleSpy).toHaveBeenCalled();
      // Should show some progress indication
      const output = consoleSpy.mock.calls.map(call => call[0]).join(" ");
      expect(output).toMatch(/starting|progress|loading/i);

      consoleSpy.mockRestore();
    });

    it("should show success messages", async () => {
      const startCommand = createStartCommand();
      program.addCommand(startCommand);

      // Capture console output
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await program.parseAsync(["node", "dev-server", "start", "test-project"]);

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls.map(call => call[0]).join(" ");
      expect(output).toMatch(/started|success|running/i);

      consoleSpy.mockRestore();
    });

    it("should show error messages", async () => {
      mockDevServerManager.start.mockRejectedValueOnce(new Error("Start failed"));

      const startCommand = createStartCommand();
      program.addCommand(startCommand);

      // Capture console output
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(
        program.parseAsync(["node", "dev-server", "start", "test-project"])
      ).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls.map(call => call[0]).join(" ");
      expect(output).toMatch(/error|failed/i);

      consoleSpy.mockRestore();
    });
  });
});
