/**
 * 🦊 Tests for QualityGateManager
 *
 * *whiskers twitch with testing precision* Comprehensive tests for the quality
 * gate manager that enforces quality standards with fox-like analytical prowess.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QualityGateManager, QualityGate, QualityGateCondition } from "../QualityGateManager";
import { readFile, writeFile } from "fs/promises";

// Mock fs/promises
vi.mock("fs/promises");

describe("QualityGateManager", () => {
  let manager: QualityGateManager;
  const mockReadFile = vi.mocked(readFile);
  const mockWriteFile = vi.mocked(writeFile);

  beforeEach(() => {
    manager = new QualityGateManager("/test/project");
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with default configuration", () => {
      const gates = manager.getQualityGates();
      expect(gates).toEqual([]);
      expect(manager.getDefaultQualityGate()).toBeNull();
    });
  });

  describe("loadConfiguration", () => {
    it("should load configuration from file", async () => {
      const configData = {
        gates: [
          {
            id: "test-gate",
            name: "Test Gate",
            conditions: [
              {
                metric: "bugs",
                operator: "EQ",
                threshold: 0,
              },
            ],
            enabled: true,
            environment: "development",
            createdAt: "2025-01-15T10:00:00.000Z",
            updatedAt: "2025-01-15T10:00:00.000Z",
          },
        ],
        defaultGate: "test-gate",
        environments: {
          development: "test-gate",
          staging: "test-gate",
          production: "test-gate",
        },
      };

      mockReadFile.mockResolvedValueOnce(JSON.stringify(configData));

      await manager.loadConfiguration();

      const gates = manager.getQualityGates();
      expect(gates).toHaveLength(1);
      expect(gates[0].id).toBe("test-gate");
      expect(manager.getDefaultQualityGate()?.id).toBe("test-gate");
    });

    it("should handle file not found and create default", async () => {
      mockReadFile.mockRejectedValueOnce(new Error("File not found"));
      mockWriteFile.mockResolvedValueOnce(undefined);

      await manager.loadConfiguration();

      expect(mockWriteFile).toHaveBeenCalled();
      const gates = manager.getQualityGates();
      expect(gates).toEqual([]);
    });
  });

  describe("saveConfiguration", () => {
    it("should save configuration to file", async () => {
      mockWriteFile.mockResolvedValueOnce(undefined);

      await manager.saveConfiguration();

      expect(mockWriteFile).toHaveBeenCalledWith(
        "/test/project/.reynard/quality-gates.json",
        expect.stringContaining('"gates": []')
      );
      expect(mockWriteFile).toHaveBeenCalledWith(
        "/test/project/.reynard/quality-gates.json",
        expect.stringContaining('"defaultGate": ""')
      );
      expect(mockWriteFile).toHaveBeenCalledWith(
        "/test/project/.reynard/quality-gates.json",
        expect.stringContaining('"environments"')
      );
    });

    it("should handle save errors", async () => {
      mockWriteFile.mockRejectedValueOnce(new Error("Permission denied"));

      await expect(manager.saveConfiguration()).rejects.toThrow("Permission denied");
    });
  });

  describe("evaluateQualityGates", () => {
    beforeEach(async () => {
      const testGate: Omit<QualityGate, "createdAt" | "updatedAt"> = {
        id: "test-gate",
        name: "Test Gate",
        conditions: [
          {
            metric: "bugs",
            operator: "EQ",
            threshold: 0,
          },
          {
            metric: "codeSmells",
            operator: "LT",
            threshold: 10,
          },
        ],
        enabled: true,
        environment: "development",
      };

      await manager.addQualityGate(testGate);
    });

    it("should evaluate quality gates against metrics", () => {
      const metrics = {
        bugs: 0,
        codeSmells: 5,
        vulnerabilities: 0,
      };

      const results = manager.evaluateQualityGates(metrics, "development");

      expect(results).toHaveLength(1);
      expect(results[0].gateId).toBe("test-gate");
      expect(results[0].status).toBe("PASSED");
      expect(results[0].passedConditions).toBe(2);
      expect(results[0].totalConditions).toBe(2);
      expect(results[0].failedConditions).toBe(0);
    });

    it("should fail when conditions are not met", () => {
      const metrics = {
        bugs: 1, // Should be 0
        codeSmells: 15, // Should be < 10
        vulnerabilities: 0,
      };

      const results = manager.evaluateQualityGates(metrics, "development");

      expect(results).toHaveLength(1);
      expect(results[0].status).toBe("FAILED");
      expect(results[0].failedConditions).toBe(2);
      expect(results[0].passedConditions).toBe(0);
    });

    it("should skip disabled gates", async () => {
      await manager.updateQualityGate("test-gate", { enabled: false });

      const metrics = { bugs: 0, codeSmells: 5 };
      const results = manager.evaluateQualityGates(metrics, "development");

      expect(results).toHaveLength(0);
    });

    it("should skip gates for different environments", () => {
      const metrics = { bugs: 0, codeSmells: 5 };
      const results = manager.evaluateQualityGates(metrics, "production");

      expect(results).toHaveLength(0);
    });
  });

  describe("addQualityGate", () => {
    it("should add a new quality gate", async () => {
      mockWriteFile.mockResolvedValueOnce(undefined);

      const gate: Omit<QualityGate, "createdAt" | "updatedAt"> = {
        id: "new-gate",
        name: "New Gate",
        conditions: [
          {
            metric: "bugs",
            operator: "EQ",
            threshold: 0,
          },
        ],
        enabled: true,
        environment: "development",
      };

      await manager.addQualityGate(gate);

      const gates = manager.getQualityGates();
      expect(gates).toHaveLength(1);
      expect(gates[0].id).toBe("new-gate");
      expect(gates[0].createdAt).toBeInstanceOf(Date);
      expect(gates[0].updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("updateQualityGate", () => {
    beforeEach(async () => {
      const gate: Omit<QualityGate, "createdAt" | "updatedAt"> = {
        id: "test-gate",
        name: "Test Gate",
        conditions: [],
        enabled: true,
        environment: "development",
      };
      await manager.addQualityGate(gate);
    });

    it("should update an existing quality gate", async () => {
      mockWriteFile.mockResolvedValueOnce(undefined);

      await manager.updateQualityGate("test-gate", { name: "Updated Gate" });

      const gate = manager.getQualityGate("test-gate");
      expect(gate?.name).toBe("Updated Gate");
      expect(gate?.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw error for non-existent gate", async () => {
      await expect(manager.updateQualityGate("non-existent", { name: "Test" })).rejects.toThrow(
        "Quality gate with ID 'non-existent' not found"
      );
    });
  });

  describe("removeQualityGate", () => {
    beforeEach(async () => {
      const gate: Omit<QualityGate, "createdAt" | "updatedAt"> = {
        id: "test-gate",
        name: "Test Gate",
        conditions: [],
        enabled: true,
        environment: "development",
      };
      await manager.addQualityGate(gate);
    });

    it("should remove an existing quality gate", async () => {
      mockWriteFile.mockResolvedValueOnce(undefined);

      await manager.removeQualityGate("test-gate");

      const gates = manager.getQualityGates();
      expect(gates).toHaveLength(0);
    });

    it("should throw error for non-existent gate", async () => {
      await expect(manager.removeQualityGate("non-existent")).rejects.toThrow(
        "Quality gate with ID 'non-existent' not found"
      );
    });
  });

  describe("getQualityGatesForEnvironment", () => {
    beforeEach(async () => {
      const gates: Omit<QualityGate, "createdAt" | "updatedAt">[] = [
        {
          id: "dev-gate",
          name: "Development Gate",
          conditions: [],
          enabled: true,
          environment: "development",
        },
        {
          id: "prod-gate",
          name: "Production Gate",
          conditions: [],
          enabled: true,
          environment: "production",
        },
        {
          id: "all-gate",
          name: "All Environments Gate",
          conditions: [],
          enabled: true,
          environment: "all",
        },
        {
          id: "disabled-gate",
          name: "Disabled Gate",
          conditions: [],
          enabled: false,
          environment: "development",
        },
      ];

      for (const gate of gates) {
        await manager.addQualityGate(gate);
      }
    });

    it("should return gates for specific environment", () => {
      const devGates = manager.getQualityGatesForEnvironment("development");
      expect(devGates).toHaveLength(2); // dev-gate and all-gate
      expect(devGates.map(g => g.id)).toContain("dev-gate");
      expect(devGates.map(g => g.id)).toContain("all-gate");
    });

    it("should return all-environment gates", () => {
      const prodGates = manager.getQualityGatesForEnvironment("production");
      expect(prodGates).toHaveLength(2); // prod-gate and all-gate
      expect(prodGates.map(g => g.id)).toContain("prod-gate");
      expect(prodGates.map(g => g.id)).toContain("all-gate");
    });
  });

  describe("setDefaultQualityGate", () => {
    beforeEach(async () => {
      const gate: Omit<QualityGate, "createdAt" | "updatedAt"> = {
        id: "test-gate",
        name: "Test Gate",
        conditions: [],
        enabled: true,
        environment: "development",
      };
      await manager.addQualityGate(gate);
    });

    it("should set default quality gate", async () => {
      mockWriteFile.mockResolvedValueOnce(undefined);

      await manager.setDefaultQualityGate("test-gate");

      const defaultGate = manager.getDefaultQualityGate();
      expect(defaultGate?.id).toBe("test-gate");
    });

    it("should throw error for non-existent gate", async () => {
      await expect(manager.setDefaultQualityGate("non-existent")).rejects.toThrow(
        "Quality gate with ID 'non-existent' not found"
      );
    });
  });

  describe("createReynardQualityGates", () => {
    it("should create Reynard-specific quality gates", async () => {
      mockWriteFile.mockResolvedValue(undefined);

      await manager.createReynardQualityGates();

      const gates = manager.getQualityGates();
      expect(gates).toHaveLength(3);

      const gateIds = gates.map(g => g.id);
      expect(gateIds).toContain("reynard-development");
      expect(gateIds).toContain("reynard-production");
      expect(gateIds).toContain("reynard-modularity");

      const defaultGate = manager.getDefaultQualityGate();
      expect(defaultGate?.id).toBe("reynard-development");
    });
  });

  describe("validateConfiguration", () => {
    it("should validate correct configuration", () => {
      const result = manager.validateConfiguration();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect duplicate gate IDs", async () => {
      const gate1: Omit<QualityGate, "createdAt" | "updatedAt"> = {
        id: "duplicate",
        name: "Gate 1",
        conditions: [],
        enabled: true,
        environment: "development",
      };
      const gate2: Omit<QualityGate, "createdAt" | "updatedAt"> = {
        id: "duplicate",
        name: "Gate 2",
        conditions: [],
        enabled: true,
        environment: "development",
      };

      await manager.addQualityGate(gate1);
      await manager.addQualityGate(gate2);

      const result = manager.validateConfiguration();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Duplicate quality gate IDs: duplicate");
    });

    it("should detect missing default gate", async () => {
      // setDefaultQualityGate should throw an error for non-existent gate
      await expect(manager.setDefaultQualityGate("non-existent")).rejects.toThrow(
        "Quality gate with ID 'non-existent' not found"
      );
    });

    it("should detect gates with no conditions", async () => {
      const gate: Omit<QualityGate, "createdAt" | "updatedAt"> = {
        id: "empty-gate",
        name: "Empty Gate",
        conditions: [],
        enabled: true,
        environment: "development",
      };

      await manager.addQualityGate(gate);

      const result = manager.validateConfiguration();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Quality gate 'empty-gate' has no conditions");
    });
  });

  describe("compareValues", () => {
    it("should compare numeric values correctly", () => {
      const managerAny = manager as any;

      expect(managerAny.compareValues(5, 3, "GT")).toBe(true);
      expect(managerAny.compareValues(5, 3, "LT")).toBe(false);
      expect(managerAny.compareValues(5, 5, "EQ")).toBe(true);
      expect(managerAny.compareValues(5, 5, "NE")).toBe(false);
      expect(managerAny.compareValues(5, 3, "GTE")).toBe(true);
      expect(managerAny.compareValues(5, 5, "GTE")).toBe(true);
      expect(managerAny.compareValues(3, 5, "LTE")).toBe(true);
      expect(managerAny.compareValues(5, 5, "LTE")).toBe(true);
    });

    it("should compare string values correctly", () => {
      const managerAny = manager as any;

      expect(managerAny.compareValues("abc", "def", "LT")).toBe(true);
      expect(managerAny.compareValues("def", "abc", "GT")).toBe(true);
      expect(managerAny.compareValues("abc", "abc", "EQ")).toBe(true);
      expect(managerAny.compareValues("abc", "def", "NE")).toBe(true);
    });

    it("should compare boolean values correctly", () => {
      const managerAny = manager as any;

      expect(managerAny.compareValues(true, true, "EQ")).toBe(true);
      expect(managerAny.compareValues(true, false, "NE")).toBe(true);
      expect(managerAny.compareValues(true, false, "EQ")).toBe(false);
    });
  });
});
