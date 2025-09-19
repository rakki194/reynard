/**
 * 🦊 Simple CLI Commands Test Suite
 *
 * Basic tests for the command-line interface handlers.
 * Tests that CLI commands can be imported and called without errors.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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
  getConfig: vi.fn(),
  getStats: vi.fn(),
  cleanup: vi.fn(),
};

vi.mock("../core/DevServerManager.js", () => ({
  DevServerManager: vi.fn().mockImplementation(() => mockDevServerManager),
}));

describe("CLI Commands - Simple Tests", () => {
  beforeEach(() => {
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
    mockDevServerManager.startMultiple.mockResolvedValue([]);
    mockDevServerManager.stopAll.mockResolvedValue(undefined);
    mockDevServerManager.getConfig.mockResolvedValue({});
    mockDevServerManager.getStats.mockResolvedValue({});
    mockDevServerManager.cleanup.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const globalOptions = { config: "test-config.json", verbose: false, color: false };

  describe("Start Command", () => {
    it("should call handleStart without errors", async () => {
      await expect(handleStart("test-project", {}, globalOptions)).resolves.not.toThrow();
      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.start).toHaveBeenCalledWith("test-project", {});
    });
  });

  describe("Stop Command", () => {
    it("should call handleStop without errors", async () => {
      await expect(handleStop("test-project", {}, globalOptions)).resolves.not.toThrow();
      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.stop).toHaveBeenCalledWith("test-project");
    });
  });

  describe("Restart Command", () => {
    it("should call handleRestart without errors", async () => {
      await expect(handleRestart("test-project", globalOptions)).resolves.not.toThrow();
      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.restart).toHaveBeenCalledWith("test-project");
    });
  });

  describe("Status Command", () => {
    it("should call handleStatus without errors", async () => {
      await expect(handleStatus(undefined, {}, globalOptions)).resolves.not.toThrow();
      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.status).toHaveBeenCalledWith(undefined);
    });

    it("should call handleStatus with project name", async () => {
      await expect(handleStatus("test-project", {}, globalOptions)).resolves.not.toThrow();
      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.status).toHaveBeenCalledWith("test-project");
    });
  });

  describe("List Command", () => {
    it("should call handleList without errors", async () => {
      await expect(handleList({}, globalOptions)).resolves.not.toThrow();
      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.list).toHaveBeenCalled();
    });
  });

  describe("Health Command", () => {
    it("should call handleHealth without errors", async () => {
      await expect(handleHealth(undefined, {}, globalOptions)).resolves.not.toThrow();
      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.health).toHaveBeenCalledWith(undefined);
    });

    it("should call handleHealth with project name", async () => {
      await expect(handleHealth("test-project", {}, globalOptions)).resolves.not.toThrow();
      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.health).toHaveBeenCalledWith("test-project");
    });
  });

  describe("Config Command", () => {
    it("should call handleConfig without errors", async () => {
      await expect(handleConfig({}, globalOptions)).resolves.not.toThrow();
      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.getConfig).toHaveBeenCalled();
    });
  });

  describe("Stats Command", () => {
    it("should call handleStats without errors", async () => {
      await expect(handleStats({}, globalOptions)).resolves.not.toThrow();
      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.getStats).toHaveBeenCalled();
    });
  });

  describe("Start Multiple Command", () => {
    it("should call handleStartMultiple without errors", async () => {
      await expect(handleStartMultiple(["project1", "project2"], globalOptions)).resolves.not.toThrow();
      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.startMultiple).toHaveBeenCalledWith(["project1", "project2"]);
    });
  });

  describe("Stop All Command", () => {
    it("should call handleStopAll without errors", async () => {
      await expect(handleStopAll({}, globalOptions)).resolves.not.toThrow();
      expect(mockDevServerManager.initialize).toHaveBeenCalled();
      expect(mockDevServerManager.stopAll).toHaveBeenCalled();
    });
  });
});
