/**
 * Tests for docstring quality gates
 */

import { describe, it, expect } from "vitest";
import {
  DOCSTRING_QUALITY_GATES,
  STRICT_DOCSTRING_QUALITY_GATES,
  RELAXED_DOCSTRING_QUALITY_GATES,
  getDocstringQualityGates,
  createCustomDocstringGate,
} from "../quality-gates/docstring-gates";

describe("Docstring Quality Gates", () => {
  describe("Predefined Quality Gates", () => {
    it("should have standard quality gates with correct properties", () => {
      expect(DOCSTRING_QUALITY_GATES).toHaveLength(5);
      
      const coverageGate = DOCSTRING_QUALITY_GATES.find(gate => 
        gate.id === "docstring-coverage-minimum"
      );
      expect(coverageGate).toBeDefined();
      expect(coverageGate?.name).toBe("Minimum Docstring Coverage");
      expect(coverageGate?.enabled).toBe(true);
      expect(coverageGate?.conditions).toHaveLength(1);
      expect(coverageGate?.conditions[0].metric).toBe("docstringCoverage");
      expect(coverageGate?.conditions[0].operator).toBe("GT");
      expect(coverageGate?.conditions[0].threshold).toBe(80);
      expect(coverageGate?.conditions[0].errorThreshold).toBe(70);
    });

    it("should have strict quality gates with higher thresholds", () => {
      expect(STRICT_DOCSTRING_QUALITY_GATES).toHaveLength(5);
      
      const coverageGate = STRICT_DOCSTRING_QUALITY_GATES.find(gate => 
        gate.id === "strict-docstring-coverage"
      );
      expect(coverageGate).toBeDefined();
      expect(coverageGate?.conditions[0].threshold).toBe(95);
      expect(coverageGate?.conditions[0].errorThreshold).toBe(90);
    });

    it("should have relaxed quality gates with lower thresholds", () => {
      expect(RELAXED_DOCSTRING_QUALITY_GATES).toHaveLength(5);
      
      const coverageGate = RELAXED_DOCSTRING_QUALITY_GATES.find(gate => 
        gate.id === "relaxed-docstring-coverage"
      );
      expect(coverageGate).toBeDefined();
      expect(coverageGate?.conditions[0].threshold).toBe(60);
      expect(coverageGate?.conditions[0].errorThreshold).toBe(50);
    });

    it("should have all required gate types", () => {
      const gateIds = DOCSTRING_QUALITY_GATES.map(gate => gate.id);
      
      expect(gateIds).toContain("docstring-coverage-minimum");
      expect(gateIds).toContain("docstring-quality-minimum");
      expect(gateIds).toContain("function-documentation-coverage");
      expect(gateIds).toContain("class-documentation-coverage");
      expect(gateIds).toContain("module-documentation-coverage");
    });

    it("should have correct metric types for each gate", () => {
      const coverageGate = DOCSTRING_QUALITY_GATES.find(gate => 
        gate.id === "docstring-coverage-minimum"
      );
      expect(coverageGate?.conditions[0].metric).toBe("docstringCoverage");

      const qualityGate = DOCSTRING_QUALITY_GATES.find(gate => 
        gate.id === "docstring-quality-minimum"
      );
      expect(qualityGate?.conditions[0].metric).toBe("docstringQualityScore");

      const functionGate = DOCSTRING_QUALITY_GATES.find(gate => 
        gate.id === "function-documentation-coverage"
      );
      expect(functionGate?.conditions[0].metric).toBe("documentedFunctions");

      const classGate = DOCSTRING_QUALITY_GATES.find(gate => 
        gate.id === "class-documentation-coverage"
      );
      expect(classGate?.conditions[0].metric).toBe("documentedClasses");

      const moduleGate = DOCSTRING_QUALITY_GATES.find(gate => 
        gate.id === "module-documentation-coverage"
      );
      expect(moduleGate?.conditions[0].metric).toBe("documentedModules");
    });
  });

  describe("getDocstringQualityGates", () => {
    it("should return standard gates by default", () => {
      const gates = getDocstringQualityGates();
      expect(gates).toEqual(DOCSTRING_QUALITY_GATES);
    });

    it("should return standard gates when specified", () => {
      const gates = getDocstringQualityGates("standard");
      expect(gates).toEqual(DOCSTRING_QUALITY_GATES);
    });

    it("should return strict gates when specified", () => {
      const gates = getDocstringQualityGates("strict");
      expect(gates).toEqual(STRICT_DOCSTRING_QUALITY_GATES);
    });

    it("should return relaxed gates when specified", () => {
      const gates = getDocstringQualityGates("relaxed");
      expect(gates).toEqual(RELAXED_DOCSTRING_QUALITY_GATES);
    });

    it("should handle invalid preset gracefully", () => {
      const gates = getDocstringQualityGates("invalid" as any);
      expect(gates).toEqual(DOCSTRING_QUALITY_GATES);
    });
  });

  describe("createCustomDocstringGate", () => {
    it("should create a custom gate with correct properties", () => {
      const customGate = createCustomDocstringGate(
        "custom-gate",
        "Custom Documentation Standards",
        85,
        75,
        0.9,
        0.95,
        1.0
      );

      expect(customGate.id).toBe("custom-gate");
      expect(customGate.name).toBe("Custom Documentation Standards");
      expect(customGate.enabled).toBe(true);
      expect(customGate.conditions).toHaveLength(5);

      // Check coverage condition
      const coverageCondition = customGate.conditions.find(c => 
        c.metric === "docstringCoverage"
      );
      expect(coverageCondition?.threshold).toBe(85);
      expect(coverageCondition?.errorThreshold).toBe(76.5); // 85 * 0.9

      // Check quality condition
      const qualityCondition = customGate.conditions.find(c => 
        c.metric === "docstringQualityScore"
      );
      expect(qualityCondition?.threshold).toBe(75);
      expect(qualityCondition?.errorThreshold).toBe(67.5); // 75 * 0.9

      // Check function condition
      const functionCondition = customGate.conditions.find(c => 
        c.metric === "documentedFunctions"
      );
      expect(functionCondition?.threshold).toBe(0.9);
      expect(functionCondition?.errorThreshold).toBe(0.81); // 0.9 * 0.9

      // Check class condition
      const classCondition = customGate.conditions.find(c => 
        c.metric === "documentedClasses"
      );
      expect(classCondition?.threshold).toBe(0.95);
      expect(classCondition?.errorThreshold).toBe(0.855); // 0.95 * 0.9

      // Check module condition
      const moduleCondition = customGate.conditions.find(c => 
        c.metric === "documentedModules"
      );
      expect(moduleCondition?.threshold).toBe(1.0);
      expect(moduleCondition?.errorThreshold).toBe(0.9); // 1.0 * 0.9
    });

    it("should create gate with all required conditions", () => {
      const customGate = createCustomDocstringGate(
        "test-gate",
        "Test Gate",
        50,
        40,
        0.5,
        0.6,
        0.7
      );

      const metrics = customGate.conditions.map(c => c.metric);
      expect(metrics).toContain("docstringCoverage");
      expect(metrics).toContain("docstringQualityScore");
      expect(metrics).toContain("documentedFunctions");
      expect(metrics).toContain("documentedClasses");
      expect(metrics).toContain("documentedModules");
    });

    it("should handle edge case values", () => {
      const customGate = createCustomDocstringGate(
        "edge-gate",
        "Edge Case Gate",
        0,
        0,
        0,
        0,
        0
      );

      expect(customGate.conditions).toHaveLength(5);
      customGate.conditions.forEach(condition => {
        expect(condition.threshold).toBe(0);
        expect(condition.errorThreshold).toBe(0);
      });
    });

    it("should handle maximum values", () => {
      const customGate = createCustomDocstringGate(
        "max-gate",
        "Maximum Gate",
        100,
        100,
        1.0,
        1.0,
        1.0
      );

      expect(customGate.conditions).toHaveLength(5);
      customGate.conditions.forEach(condition => {
        expect(condition.threshold).toBeGreaterThan(0);
        expect(condition.errorThreshold).toBeGreaterThan(0);
      });
    });
  });

  describe("Gate Structure Validation", () => {
    it("should have consistent structure across all predefined gates", () => {
      const allGates = [
        ...DOCSTRING_QUALITY_GATES,
        ...STRICT_DOCSTRING_QUALITY_GATES,
        ...RELAXED_DOCSTRING_QUALITY_GATES,
      ];

      allGates.forEach(gate => {
        expect(gate).toHaveProperty("id");
        expect(gate).toHaveProperty("name");
        expect(gate).toHaveProperty("enabled");
        expect(gate).toHaveProperty("conditions");
        expect(typeof gate.id).toBe("string");
        expect(typeof gate.name).toBe("string");
        expect(typeof gate.enabled).toBe("boolean");
        expect(Array.isArray(gate.conditions)).toBe(true);
        expect(gate.conditions.length).toBeGreaterThan(0);
      });
    });

    it("should have valid condition structures", () => {
      const allGates = [
        ...DOCSTRING_QUALITY_GATES,
        ...STRICT_DOCSTRING_QUALITY_GATES,
        ...RELAXED_DOCSTRING_QUALITY_GATES,
      ];

      allGates.forEach(gate => {
        gate.conditions.forEach(condition => {
          expect(condition).toHaveProperty("metric");
          expect(condition).toHaveProperty("operator");
          expect(condition).toHaveProperty("threshold");
          expect(typeof condition.metric).toBe("string");
          expect(typeof condition.operator).toBe("string");
          expect(typeof condition.threshold).toBe("number");
          expect(["GT", "LT", "EQ", "NE"]).toContain(condition.operator);
        });
      });
    });

    it("should have unique IDs across all gates", () => {
      const allGates = [
        ...DOCSTRING_QUALITY_GATES,
        ...STRICT_DOCSTRING_QUALITY_GATES,
        ...RELAXED_DOCSTRING_QUALITY_GATES,
      ];

      const ids = allGates.map(gate => gate.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
