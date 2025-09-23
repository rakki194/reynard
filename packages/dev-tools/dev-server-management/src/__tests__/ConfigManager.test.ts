/**
 * 🦊 ConfigManager Test Suite
 *
 * Comprehensive tests for the configuration management system.
 * Tests validation, loading, saving, and error handling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ConfigManager } from "../core/ConfigManager.js";
import {
  createMockDevServerConfig,
  createMockProjectConfig,
  createMockFileSystem,
  setupTestEnvironment,
  cleanupTestEnvironment,
  expectConfigValid,
  expectProjectConfigValid,
} from "./test-utils.js";
import type { DevServerConfig, ProjectConfig } from "../types/index.js";

// Mock the file system module with hoisted setup
vi.hoisted(() => {
  // Create a mock file system that will be used by all tests
  const mockFiles = new Map<string, string>();
  
  // Set up default config content
  const defaultConfig = JSON.stringify({
    projects: {
      "test-project": {
        name: "Test Project",
        type: "package",
        command: "npm run dev",
        port: 3000,
        healthCheck: {
          type: "http",
          path: "/api/health",
          timeout: 5000,
        },
      },
    },
    portRanges: {
      package: { start: 3000, end: 3009 },
      example: { start: 3010, end: 3019 },
      backend: { start: 8000, end: 8009 },
    },
    logging: {
      level: "info",
      format: "json",
    },
  });
  
  // Set up default files
  mockFiles.set("/config.json", defaultConfig);
  mockFiles.set("/home/user/.dev-server/config.json", defaultConfig);
  mockFiles.set("test-config.json", defaultConfig);
  mockFiles.set("config.json", defaultConfig);
  
  // Store the mock files globally for access in tests
  (global as any).__mockFiles = mockFiles;
});

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn().mockImplementation(async (path: string) => {
    const mockFiles = (global as any).__mockFiles;
    return mockFiles?.get(path) || JSON.stringify({
      projects: {},
      portRanges: {
        package: { start: 3000, end: 3009 },
        example: { start: 3010, end: 3019 },
        backend: { start: 8000, end: 8009 },
      },
      logging: { level: "info", format: "json" },
    });
  }),
  writeFile: vi.fn().mockResolvedValue(undefined),
  access: vi.fn().mockResolvedValue(undefined),
}));

describe("ConfigManager", () => {
  let configManager: ConfigManager;
  let mockFS: ReturnType<typeof createMockFileSystem>;

  beforeEach(async () => {
    // Create mock file system
    mockFS = createMockFileSystem();
    
    // Set up default config file content for all possible paths
    const defaultConfig = JSON.stringify(createMockProjectConfig());
    mockFS.setFileContent("/config.json", defaultConfig);
    mockFS.setFileContent("/home/user/.dev-server/config.json", defaultConfig);
    mockFS.setFileContent("test-config.json", defaultConfig);
    mockFS.setFileContent("config.json", defaultConfig);
    
    // Connect the mock to the actual module with a simple direct mock
    const fsPromises = await import("node:fs/promises");
    vi.mocked(fsPromises.readFile).mockResolvedValue(defaultConfig);
    vi.mocked(fsPromises.writeFile).mockResolvedValue();
    vi.mocked(fsPromises.access).mockResolvedValue();

    // Set up default config file
    mockFS.setFile(
      "test-config.json",
      JSON.stringify({
        projects: {
          "test-project": {
            name: "Test Project",
            type: "package",
            command: "npm run dev",
            port: 3000,
            healthCheck: {
              type: "http",
              path: "/api/health",
            },
          },
        },
      })
    );

    // Configure the mocks
    const { readFile, writeFile, access } = await import("node:fs/promises");
    vi.mocked(readFile).mockImplementation(mockFS.readFile);
    vi.mocked(writeFile).mockImplementation(mockFS.writeFile);
    vi.mocked(access).mockImplementation(mockFS.access);

    configManager = new ConfigManager("test-config.json");
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe("Configuration Loading", () => {
    it("should load valid configuration from file", async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));

      const config = await configManager.loadConfig();

      expectConfigValid(config);
      expect(config.version).toBe("1.0.0");
      expect(config.projects["test-project"]).toBeDefined();
      expect(config.portRanges.package.start).toBe(3000);
    });

    it("should create default configuration when file doesn't exist", async () => {
      const config = await configManager.loadConfig();

      expectConfigValid(config);
      expect(config.version).toBe("1.0.0");
      expect(config.global.defaultStartupTimeout).toBe(30000);
      expect(config.logging.level).toBe("info");
    });

    it("should handle malformed JSON gracefully", async () => {
      mockFS.setFile("test-config.json", "{ invalid json }");

      await expect(configManager.loadConfig()).rejects.toThrow();
    });

    it("should validate configuration schema", async () => {
      const invalidConfig = {
        version: "1.0.0",
        // Missing required fields
      };
      mockFS.setFile("test-config.json", JSON.stringify(invalidConfig));

      await expect(configManager.loadConfig()).rejects.toThrow();
    });

    it("should handle file read errors", async () => {
      mockFS.readFile.mockRejectedValueOnce(new Error("Permission denied"));

      await expect(configManager.loadConfig()).rejects.toThrow("Permission denied");
    });
  });

  describe("Configuration Saving", () => {
    it("should save configuration to file", async () => {
      const mockConfig = createMockDevServerConfig();
      await configManager.saveConfig(mockConfig);

      expect(mockFS.writeFile).toHaveBeenCalledWith("test-config.json", JSON.stringify(mockConfig, null, 2));
    });

    it("should handle save errors gracefully", async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.writeFile.mockRejectedValueOnce(new Error("Disk full"));

      await expect(configManager.saveConfig(mockConfig)).rejects.toThrow("Disk full");
    });

    it("should validate configuration before saving", async () => {
      const invalidConfig = {
        version: "1.0.0",
        // Missing required fields
      } as any;

      await expect(configManager.saveConfig(invalidConfig)).rejects.toThrow();
    });
  });

  describe("Project Management", () => {
    beforeEach(async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await configManager.loadConfig();
    });

    it("should get existing project", () => {
      const project = configManager.getProject("test-project");

      expect(project).toBeDefined();
      expectProjectConfigValid(project!);
      expect(project!.name).toBe("test-project");
    });

    it("should return undefined for non-existent project", () => {
      const project = configManager.getProject("non-existent");

      expect(project).toBeUndefined();
    });

    it("should set new project", () => {
      const newProject = createMockProjectConfig({
        name: "new-project",
        port: 3001,
        description: "New test project",
      });

      configManager.setProject("new-project", newProject);

      const retrieved = configManager.getProject("new-project");
      expect(retrieved).toEqual(newProject);
    });

    it("should update existing project", () => {
      const updatedProject = createMockProjectConfig({
        name: "test-project",
        port: 3001,
        description: "Updated description",
      });

      configManager.setProject("test-project", updatedProject);

      const retrieved = configManager.getProject("test-project");
      expect(retrieved!.description).toBe("Updated description");
      expect(retrieved!.port).toBe(3001);
    });

    it("should remove project", () => {
      configManager.removeProject("test-project");

      const project = configManager.getProject("test-project");
      expect(project).toBeUndefined();
    });

    it("should list all projects", () => {
      const projects = configManager.listProjects();

      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe("test-project");
    });

    it("should get projects by category", () => {
      const packageProjects = configManager.getProjectsByCategory("package");

      expect(packageProjects).toHaveLength(1);
      expect(packageProjects[0].category).toBe("package");
    });
  });

  describe("Configuration Validation", () => {
    it("should validate complete valid configuration", async () => {
      const mockConfig = createMockDevServerConfig();
      const result = await configManager.validateConfig(mockConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it("should detect invalid project configurations", async () => {
      const invalidConfig = createMockDevServerConfig({
        projects: {
          "invalid-project": {
            name: "invalid-project",
            port: -1, // Invalid port
            description: "Invalid project",
            category: "package",
            autoReload: true,
            hotReload: true,
          } as any,
        },
      });

      const result = await configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes("port"))).toBe(true);
    });

    it("should detect port conflicts", async () => {
      const configWithConflicts = createMockDevServerConfig({
        projects: {
          project1: createMockProjectConfig({ name: "project1", port: 3000 }),
          project2: createMockProjectConfig({ name: "project2", port: 3000 }),
        },
      });

      const result = await configManager.validateConfig(configWithConflicts);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes("port conflict"))).toBe(true);
    });

    it("should detect invalid port ranges", async () => {
      const configWithInvalidRanges = createMockDevServerConfig({
        portRanges: {
          package: { start: 3000, end: 2000 }, // Invalid range
          example: { start: 3010, end: 3019 },
          backend: { start: 8000, end: 8009 },
          e2e: { start: 3020, end: 3029 },
          template: { start: 3030, end: 3039 },
        },
      });

      const result = await configManager.validateConfig(configWithInvalidRanges);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes("port range"))).toBe(true);
    });

    it("should detect circular dependencies", async () => {
      const configWithCircularDeps = createMockDevServerConfig({
        projects: {
          project1: createMockProjectConfig({
            name: "project1",
            dependencies: ["project2"],
          }),
          project2: createMockProjectConfig({
            name: "project2",
            dependencies: ["project1"],
          }),
        },
      });

      const result = await configManager.validateConfig(configWithCircularDeps);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes("circular dependency"))).toBe(true);
    });

    it("should detect missing dependencies", async () => {
      const configWithMissingDeps = createMockDevServerConfig({
        projects: {
          project1: createMockProjectConfig({
            name: "project1",
            dependencies: ["non-existent-project"],
          }),
        },
      });

      const result = await configManager.validateConfig(configWithMissingDeps);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes("missing dependency"))).toBe(true);
    });
  });

  describe("Configuration Migration", () => {
    it("should migrate from old format", async () => {
      const oldConfig = {
        projects: [
          {
            name: "old-project",
            port: 3000,
            command: "npm run dev",
          },
        ],
      };

      mockFS.setFile("old-config.json", JSON.stringify(oldConfig));

      const migratedConfig = await configManager.migrateFromOldFormat("old-config.json");

      expectConfigValid(migratedConfig);
      expect(migratedConfig.projects["old-project"]).toBeDefined();
      expect(migratedConfig.projects["old-project"].name).toBe("old-project");
      expect(migratedConfig.projects["old-project"].port).toBe(3000);
    });

    it("should handle migration errors gracefully", async () => {
      mockFS.readFile.mockRejectedValueOnce(new Error("File not found"));

      await expect(configManager.migrateFromOldFormat("non-existent.json")).rejects.toThrow();
    });
  });

  describe("Configuration Updates", () => {
    beforeEach(async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await configManager.loadConfig();
    });

    it("should update global configuration", () => {
      const newGlobalConfig = {
        defaultStartupTimeout: 60000,
        defaultShutdownTimeout: 15000,
        healthCheckInterval: 10000,
        autoRestart: false,
        maxRestartAttempts: 5,
        restartDelay: 2000,
      };

      configManager.updateGlobalConfig(newGlobalConfig);

      const config = configManager.getConfig();
      expect(config.global.defaultStartupTimeout).toBe(60000);
      expect(config.global.autoRestart).toBe(false);
    });

    it("should update port ranges", () => {
      const newPortRanges = {
        package: { start: 4000, end: 4009 },
        example: { start: 4010, end: 4019 },
        backend: { start: 9000, end: 9009 },
        e2e: { start: 4020, end: 4029 },
        template: { start: 4030, end: 4039 },
      };

      configManager.updatePortRanges(newPortRanges);

      const config = configManager.getConfig();
      expect(config.portRanges.package.start).toBe(4000);
      expect(config.portRanges.backend.start).toBe(9000);
    });

    it("should update logging configuration", () => {
      const newLoggingConfig = {
        level: "debug" as const,
        format: "json" as const,
        file: "/var/log/dev-server.log",
        maxFileSize: 10485760,
        maxFiles: 5,
      };

      configManager.updateLoggingConfig(newLoggingConfig);

      const config = configManager.getConfig();
      expect(config.logging.level).toBe("debug");
      expect(config.logging.format).toBe("json");
      expect(config.logging.file).toBe("/var/log/dev-server.log");
    });
  });

  describe("Configuration Persistence", () => {
    it("should persist changes to file", async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await configManager.loadConfig();

      const newProject = createMockProjectConfig({
        name: "persistent-project",
        port: 3001,
      });

      configManager.setProject("persistent-project", newProject);
      await configManager.persistConfig();

      expect(mockFS.writeFile).toHaveBeenCalledWith("test-config.json", expect.stringContaining("persistent-project"));
    });

    it("should handle persistence errors", async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await configManager.loadConfig();

      mockFS.writeFile.mockRejectedValueOnce(new Error("Write failed"));

      await expect(configManager.persistConfig()).rejects.toThrow("Write failed");
    });
  });

  describe("Configuration Reloading", () => {
    it("should reload configuration from file", async () => {
      const initialConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(initialConfig, null, 2));
      await configManager.loadConfig();

      // Update file externally
      const updatedConfig = createMockDevServerConfig({
        projects: {
          ...initialConfig.projects,
          "external-project": createMockProjectConfig({
            name: "external-project",
            port: 3001,
          }),
        },
      });
      mockFS.setFile("test-config.json", JSON.stringify(updatedConfig, null, 2));

      await configManager.reloadConfig();

      const project = configManager.getProject("external-project");
      expect(project).toBeDefined();
      expect(project!.name).toBe("external-project");
    });

    it("should handle reload errors gracefully", async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await configManager.loadConfig();

      // Make file unreadable
      mockFS.readFile.mockRejectedValueOnce(new Error("Permission denied"));

      await expect(configManager.reloadConfig()).rejects.toThrow("Permission denied");
    });
  });

  describe("Configuration Backup and Restore", () => {
    it("should create configuration backup", async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await configManager.loadConfig();

      await configManager.createBackup();

      expect(mockFS.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/test-config\.json\.backup\.\d+/),
        JSON.stringify(mockConfig, null, 2)
      );
    });

    it("should restore from backup", async () => {
      const originalConfig = createMockDevServerConfig();
      const backupConfig = createMockDevServerConfig({
        projects: {
          ...originalConfig.projects,
          "backup-project": createMockProjectConfig({
            name: "backup-project",
            port: 3001,
          }),
        },
      });

      mockFS.setFile("test-config.json", JSON.stringify(originalConfig, null, 2));
      mockFS.setFile("test-config.json.backup.1234567890", JSON.stringify(backupConfig, null, 2));
      await configManager.loadConfig();

      await configManager.restoreFromBackup("test-config.json.backup.1234567890");

      const project = configManager.getProject("backup-project");
      expect(project).toBeDefined();
    });

    it("should handle backup/restore errors", async () => {
      const mockConfig = createMockDevServerConfig();
      mockFS.setFile("test-config.json", JSON.stringify(mockConfig, null, 2));
      await configManager.loadConfig();

      mockFS.writeFile.mockRejectedValueOnce(new Error("Backup failed"));

      await expect(configManager.createBackup()).rejects.toThrow("Backup failed");
    });
  });
});
