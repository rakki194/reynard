/**
 * 🦊 PortManager Test Suite
 *
 * Comprehensive tests for the port management system.
 * Tests port allocation, conflict detection, and range management.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createMockPortInfo, setupTestEnvironment, cleanupTestEnvironment } from "./test-utils.js";
import type { PortInfo, PortAllocation, ProjectCategory } from "../types/index.js";

// Mock node:child_process at the top level
vi.mock("node:child_process", () => ({
  exec: vi.fn(),
  spawn: vi.fn(),
  execSync: vi.fn().mockReturnValue("output"),
}));

// Mock node:util to ensure promisify works with our exec mock
vi.mock("node:util", () => ({
  promisify: vi.fn().mockImplementation((fn) => {
    if (fn.name === 'exec') {
      return vi.fn().mockImplementation(async (command: string) => {
        return new Promise((resolve, reject) => {
          // Use the mocked exec function
          const { exec } = require("node:child_process");
          exec(command, (error: any, stdout: string, stderr: string) => {
            if (error) {
              reject(error);
            } else {
              resolve({ stdout, stderr });
            }
          });
        });
      });
    }
    return fn;
  }),
}));

describe("PortManager", () => {
  let portManager: PortManager;
  let mockNetwork: ReturnType<typeof setupTestEnvironment>["mockNetwork"];

  beforeEach(async () => {
    const testEnv = setupTestEnvironment();
    mockNetwork = testEnv.mockNetwork;

    // Configure the mocks
    const { createServer } = await import("node:net");
    vi.mocked(createServer).mockImplementation(mockNetwork.createServer);

    // Configure the hoisted exec mock
    const { exec } = await import("node:child_process");
    vi.mocked(exec).mockImplementation((command, callback) => {
      // Mock lsof command responses
      if (command.includes("lsof -ti :")) {
        const port = parseInt(command.match(/:(\d+)/)?.[1] || "0");
        const inUse = mockNetwork.isPortInUse(port);
        if (inUse) {
          callback?.(null, "12345\n", ""); // Return a PID if port is in use
        } else {
          // lsof returns non-zero exit code when port is not in use
          const error = new Error("Port not in use");
          (error as any).code = 1;
          callback?.(error, "", "");
        }
      } else if (command.includes("ps -p")) {
        // Mock ps command for process info
        callback?.(null, "node test-server.js", "");
      } else {
        callback?.(null, "output", "");
      }
    });

    // Import PortManager after mocks are set up
    const { PortManager } = await import("../core/PortManager.js");
    portManager = new PortManager();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe("Port Range Management", () => {
    it("should set and get port ranges", () => {
      const portRange = { start: 3000, end: 3009 };
      portManager.setPortRange("package", portRange);

      const retrieved = portManager.getPortRange("package");
      expect(retrieved).toEqual(portRange);
    });

    it("should return undefined for non-existent port range", () => {
      const retrieved = portManager.getPortRange("non-existent" as ProjectCategory);
      expect(retrieved).toBeUndefined();
    });

    it("should validate port range boundaries", () => {
      const invalidRange = { start: 3000, end: 2000 }; // end < start

      expect(() => {
        portManager.setPortRange("package", invalidRange);
      }).toThrow();
    });

    it("should validate port range values", () => {
      const invalidRange = { start: -1, end: 3000 }; // negative start

      expect(() => {
        portManager.setPortRange("package", invalidRange);
      }).toThrow();
    });

    it("should handle reserved ports in range", () => {
      const portRange = { start: 3000, end: 3009, reserved: [3005, 3007] };
      portManager.setPortRange("package", portRange);

      const retrieved = portManager.getPortRange("package");
      expect(retrieved).toEqual(portRange);
    });
  });

  describe("Port Allocation", () => {
    beforeEach(() => {
      portManager.setPortRange("package", { start: 3000, end: 3009 });
      portManager.setPortRange("example", { start: 3010, end: 3019 });
    });

    it("should allocate requested port when available", async () => {
      mockNetwork.setPortInUse(3000, false);

      const allocation = await portManager.allocatePort("test-project", 3000, "package");

      expect(allocation.requested).toBe(3000);
      expect(allocation.allocated).toBe(3000);
      expect(allocation.wasAvailable).toBe(true);
    });

    it("should find alternative port when requested port is in use", async () => {
      mockNetwork.setPortInUse(3000, true);
      mockNetwork.setPortInUse(3001, false);

      const allocation = await portManager.allocatePort("test-project", 3000, "package");

      expect(allocation.requested).toBe(3000);
      expect(allocation.allocated).toBe(3001);
      expect(allocation.wasAvailable).toBe(false);
    });

    it("should throw error when no ports available in range", async () => {
      // Mark all ports in range as in use
      for (let port = 3000; port <= 3009; port++) {
        mockNetwork.setPortInUse(port, true);
      }

      await expect(portManager.allocatePort("test-project", 3000, "package")).rejects.toThrow("No available ports");
    });

    it("should respect reserved ports", async () => {
      portManager.setPortRange("package", {
        start: 3000,
        end: 3009,
        reserved: [3000, 3001],
      });

      const allocation = await portManager.allocatePort("test-project", 3000, "package");

      expect(allocation.allocated).toBe(3002); // Should skip reserved ports
    });

    it("should track allocated ports", async () => {
      mockNetwork.setPortInUse(3000, false);

      await portManager.allocatePort("test-project", 3000, "package");

      const portInfo = portManager.getPortInfo(3000);
      expect(portInfo).toBeDefined();
      expect(portInfo!.project).toBe("test-project");
      expect(portInfo!.inUse).toBe(true);
    });

    it("should handle allocation for different categories", async () => {
      mockNetwork.setPortInUse(3000, false);
      mockNetwork.setPortInUse(3010, false);

      const packageAllocation = await portManager.allocatePort("package-project", 3000, "package");
      const exampleAllocation = await portManager.allocatePort("example-project", 3010, "example");

      expect(packageAllocation.allocated).toBe(3000);
      expect(exampleAllocation.allocated).toBe(3010);
    });
  });

  describe("Port Release", () => {
    beforeEach(async () => {
      portManager.setPortRange("package", { start: 3000, end: 3009 });
      mockNetwork.setPortInUse(3000, false);
      await portManager.allocatePort("test-project", 3000, "package");
    });

    it("should release allocated port", async () => {
      await portManager.releasePort("test-project", 3000);

      const portInfo = portManager.getPortInfo(3000);
      expect(portInfo).toBeDefined();
      expect(portInfo!.inUse).toBe(false);
      expect(portInfo!.project).toBeUndefined();
    });

    it("should handle release of non-allocated port gracefully", async () => {
      await expect(portManager.releasePort("non-existent", 3000)).resolves.not.toThrow();
    });

    it("should handle release of non-existent port gracefully", async () => {
      await expect(portManager.releasePort("test-project", 9999)).resolves.not.toThrow();
    });

    it("should release all ports for a project", async () => {
      // Allocate multiple ports for the same project
      mockNetwork.setPortInUse(3001, false);
      await portManager.allocatePort("test-project", 3001, "package");

      await portManager.releaseAllPortsForProject("test-project");

      const port3000 = portManager.getPortInfo(3000);
      const port3001 = portManager.getPortInfo(3001);

      expect(port3000!.inUse).toBe(false);
      expect(port3001!.inUse).toBe(false);
    });
  });

  describe("Port Information", () => {
    beforeEach(async () => {
      portManager.setPortRange("package", { start: 3000, end: 3009 });
      mockNetwork.setPortInUse(3000, false);
      await portManager.allocatePort("test-project", 3000, "package");
    });

    it("should get port information", () => {
      const portInfo = portManager.getPortInfo(3000);

      expect(portInfo).toBeDefined();
      expect(portInfo!.port).toBe(3000);
      expect(portInfo!.inUse).toBe(true);
      expect(portInfo!.project).toBe("test-project");
      expect(portInfo!.allocatedAt).toBeInstanceOf(Date);
    });

    it("should return undefined for non-existent port", () => {
      const portInfo = portManager.getPortInfo(9999);
      expect(portInfo).toBeUndefined();
    });

    it("should list all allocated ports", () => {
      const allocatedPorts = portManager.getAllocatedPorts();

      expect(allocatedPorts).toHaveLength(1);
      expect(allocatedPorts[0].port).toBe(3000);
      expect(allocatedPorts[0].project).toBe("test-project");
    });

    it("should get ports by project", () => {
      const projectPorts = portManager.getPortsByProject("test-project");

      expect(projectPorts).toHaveLength(1);
      expect(projectPorts[0].port).toBe(3000);
    });

    it("should get ports by category", () => {
      const categoryPorts = portManager.getPortsByCategory("package");

      expect(categoryPorts).toHaveLength(1);
      expect(categoryPorts[0].port).toBe(3000);
    });
  });

  describe("Port Conflict Detection", () => {
    beforeEach(() => {
      portManager.setPortRange("package", { start: 3000, end: 3009 });
    });

    it("should detect port conflicts", async () => {
      mockNetwork.setPortInUse(3000, true);

      const hasConflict = await portManager.hasPortConflict(3000);
      expect(hasConflict).toBe(true);
    });

    it("should detect no conflict for available ports", async () => {
      mockNetwork.setPortInUse(3000, false);

      const hasConflict = await portManager.hasPortConflict(3000);
      expect(hasConflict).toBe(false);
    });

    it("should check if port is in use", async () => {
      mockNetwork.setPortInUse(3000, true);
      
      // Debug: Check if the mock network is working
      expect(mockNetwork.isPortInUse(3000)).toBe(true);

      const isInUse = await portManager.isPortInUse(3000);
      expect(isInUse).toBe(true);
    });

    it("should find next available port in range", async () => {
      mockNetwork.setPortInUse(3000, true);
      mockNetwork.setPortInUse(3001, true);
      mockNetwork.setPortInUse(3002, false);

      const nextPort = await portManager.findNextAvailablePort("package");
      expect(nextPort).toBe(3002);
    });

    it("should return undefined when no ports available", async () => {
      // Mark all ports in range as in use
      for (let port = 3000; port <= 3009; port++) {
        mockNetwork.setPortInUse(port, true);
      }

      const nextPort = await portManager.findNextAvailablePort("package");
      expect(nextPort).toBeUndefined();
    });
  });

  describe("Port Range Validation", () => {
    it("should validate port ranges", () => {
      const validRange = { start: 3000, end: 3009 };
      const result = portManager.validatePortRange(validRange);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject invalid port ranges", () => {
      const invalidRange = { start: 3000, end: 2000 }; // end < start
      const result = portManager.validatePortRange(invalidRange);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject negative port numbers", () => {
      const invalidRange = { start: -1, end: 3000 };
      const result = portManager.validatePortRange(invalidRange);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject ports above 65535", () => {
      const invalidRange = { start: 3000, end: 70000 };
      const result = portManager.validatePortRange(invalidRange);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should validate reserved ports within range", () => {
      const rangeWithReserved = { start: 3000, end: 3009, reserved: [3005, 3007] };
      const result = portManager.validatePortRange(rangeWithReserved);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject reserved ports outside range", () => {
      const rangeWithInvalidReserved = { start: 3000, end: 3009, reserved: [3010] };
      const result = portManager.validatePortRange(rangeWithInvalidReserved);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Port Statistics", () => {
    beforeEach(async () => {
      portManager.setPortRange("package", { start: 3000, end: 3009 });
      portManager.setPortRange("example", { start: 3010, end: 3019 });

      // Allocate some ports
      mockNetwork.setPortInUse(3000, false);
      mockNetwork.setPortInUse(3001, false);
      mockNetwork.setPortInUse(3010, false);

      await portManager.allocatePort("project1", 3000, "package");
      await portManager.allocatePort("project2", 3001, "package");
      await portManager.allocatePort("project3", 3010, "example");
    });

    it("should get port usage statistics", () => {
      const stats = portManager.getPortStatistics();

      expect(stats.totalAllocated).toBe(3);
      expect(stats.byCategory.package).toBe(2);
      expect(stats.byCategory.example).toBe(1);
      expect(stats.byProject.project1).toBe(1);
      expect(stats.byProject.project2).toBe(1);
      expect(stats.byProject.project3).toBe(1);
    });

    it("should get category-specific statistics", () => {
      const packageStats = portManager.getCategoryStatistics("package");

      expect(packageStats.total).toBe(10); // 3000-3009
      expect(packageStats.allocated).toBe(2);
      expect(packageStats.available).toBe(8);
    });

    it("should get project-specific statistics", () => {
      const projectStats = portManager.getProjectStatistics("project1");

      expect(projectStats.allocatedPorts).toBe(1);
      expect(projectStats.ports).toContain(3000);
    });
  });

  describe("Port Cleanup", () => {
    beforeEach(async () => {
      portManager.setPortRange("package", { start: 3000, end: 3009 });
      mockNetwork.setPortInUse(3000, false);
      await portManager.allocatePort("test-project", 3000, "package");
    });

    it("should cleanup all allocated ports", async () => {
      await portManager.cleanup();

      const portInfo = portManager.getPortInfo(3000);
      expect(portInfo).toBeDefined();
      expect(portInfo!.inUse).toBe(false);
    });

    it("should cleanup specific category ports", async () => {
      await portManager.cleanupCategory("package");

      const portInfo = portManager.getPortInfo(3000);
      expect(portInfo).toBeDefined();
      expect(portInfo!.inUse).toBe(false);
    });

    it("should handle cleanup errors gracefully", async () => {
      // Mock network error
      mockNetwork.isPortInUse.mockRejectedValueOnce(new Error("Network error"));

      await expect(portManager.cleanup()).resolves.not.toThrow();
    });
  });

  describe("Port Monitoring", () => {
    beforeEach(() => {
      portManager.setPortRange("package", { start: 3000, end: 3009 });
    });

    it("should monitor port status changes", async () => {
      const statusChanges: Array<{ port: number; inUse: boolean }> = [];

      portManager.onPortStatusChange((port, inUse) => {
        statusChanges.push({ port, inUse });
      });

      // Allocate a port
      mockNetwork.setPortInUse(3000, false);
      await portManager.allocatePort("test-project", 3000, "package");

      // Release the port
      await portManager.releasePort("test-project", 3000);

      expect(statusChanges).toHaveLength(2);
      expect(statusChanges[0]).toEqual({ port: 3000, inUse: true });
      expect(statusChanges[1]).toEqual({ port: 3000, inUse: false });
    });

    it("should remove port status change listeners", () => {
      const listener = vi.fn();
      portManager.onPortStatusChange(listener);
      portManager.removePortStatusChangeListener(listener);

      // Allocate a port - listener should not be called
      mockNetwork.setPortInUse(3000, false);
      portManager.allocatePort("test-project", 3000, "package");

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      portManager.setPortRange("package", { start: 3000, end: 3009 });
      mockNetwork.isPortInUse.mockRejectedValueOnce(new Error("Network error"));

      await expect(portManager.allocatePort("test-project", 3000, "package")).rejects.toThrow("Network error");
    });

    it("should handle invalid project names", async () => {
      portManager.setPortRange("package", { start: 3000, end: 3009 });

      await expect(portManager.allocatePort("", 3000, "package")).rejects.toThrow("Invalid project name");
    });

    it("should handle invalid categories", async () => {
      await expect(portManager.allocatePort("test-project", 3000, "invalid" as ProjectCategory)).rejects.toThrow(
        "Invalid category"
      );
    });
  });
});
