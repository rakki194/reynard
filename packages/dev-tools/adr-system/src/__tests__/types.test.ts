/**
 * Tests for type definitions and interfaces
 */

import { describe, it, expect } from "vitest";
import type {
  ADRStatus,
  ADRCategory,
  ADRDocument,
  ADRTemplate,
  ADRValidationResult,
  ADRRelationship,
} from "../types";

describe("Type Definitions", () => {
  describe("ADRStatus", () => {
    it("should accept valid status values", () => {
      const validStatuses: ADRStatus[] = [
        "proposed",
        "accepted",
        "rejected",
        "superseded",
        "deprecated",
      ];

      validStatuses.forEach(status => {
        expect(typeof status).toBe("string");
        expect(["proposed", "accepted", "rejected", "superseded", "deprecated"]).toContain(status);
      });
    });
  });

  describe("ADRCategory", () => {
    it("should accept valid category values", () => {
      const validCategories: ADRCategory[] = [
        "security",
        "performance",
        "scalability",
        "integration",
        "maintainability",
        "general",
      ];

      validCategories.forEach(category => {
        expect(typeof category).toBe("string");
        expect([
          "security",
          "performance",
          "scalability",
          "integration",
          "maintainability",
          "general",
        ]).toContain(category);
      });
    });
  });

  describe("ADRDocument", () => {
    it("should create valid ADR document", () => {
      const adr: ADRDocument = {
        id: "001",
        title: "Test ADR",
        status: "accepted",
        category: "performance",
        date: "2024-01-01",
        authors: ["John Doe"],
        stakeholders: ["Development Team"],
        context: "Test context",
        decision: "Test decision",
        consequences: {
          positive: ["Benefit 1", "Benefit 2"],
          negative: ["Drawback 1"],
          risks: [
            {
              risk: "Implementation risk",
              impact: "medium",
              probability: "low",
              mitigation: "Thorough testing",
            },
          ],
        },
        compliance: "Compliance requirements",
        references: ["Reference 1"],
        relatedADRs: ["002"],
        supersededBy: "003",
        supersedes: ["000"],
      };

      expect(adr.id).toBe("001");
      expect(adr.title).toBe("Test ADR");
      expect(adr.status).toBe("accepted");
      expect(adr.category).toBe("performance");
      expect(adr.date).toBe("2024-01-01");
      expect(Array.isArray(adr.authors)).toBe(true);
      expect(Array.isArray(adr.stakeholders)).toBe(true);
      expect(typeof adr.context).toBe("string");
      expect(typeof adr.decision).toBe("string");
      expect(adr.consequences).toHaveProperty("positive");
      expect(adr.consequences).toHaveProperty("negative");
      expect(adr.consequences).toHaveProperty("risks");
      expect(Array.isArray(adr.consequences.positive)).toBe(true);
      expect(Array.isArray(adr.consequences.negative)).toBe(true);
      expect(Array.isArray(adr.consequences.risks)).toBe(true);
      expect(typeof adr.compliance).toBe("string");
      expect(Array.isArray(adr.references)).toBe(true);
      expect(Array.isArray(adr.relatedADRs)).toBe(true);
      expect(typeof adr.supersededBy).toBe("string");
      expect(Array.isArray(adr.supersedes)).toBe(true);
    });

    it("should handle optional fields", () => {
      const minimalADR: ADRDocument = {
        id: "001",
        title: "Minimal ADR",
        status: "proposed",
        category: "general",
        date: "2024-01-01",
        authors: [],
        stakeholders: [],
        context: "Minimal context",
        decision: "Minimal decision",
        consequences: {
          positive: [],
          negative: [],
          risks: [],
        },
        compliance: "",
        references: [],
        relatedADRs: [],
      };

      expect(minimalADR.id).toBe("001");
      expect(minimalADR.title).toBe("Minimal ADR");
      expect(minimalADR.supersededBy).toBeUndefined();
      expect(minimalADR.supersedes).toBeUndefined();
    });

    it("should validate risk structure", () => {
      const risk = {
        risk: "Test risk",
        impact: "high" as const,
        probability: "medium" as const,
        mitigation: "Test mitigation",
      };

      expect(risk.risk).toBe("Test risk");
      expect(["low", "medium", "high"]).toContain(risk.impact);
      expect(["low", "medium", "high"]).toContain(risk.probability);
      expect(risk.mitigation).toBe("Test mitigation");
    });
  });

  describe("ADRTemplate", () => {
    it("should create valid ADR template", () => {
      const template: ADRTemplate = {
        name: "Test Template",
        category: "security",
        sections: ["Section 1", "Section 2"],
        requiredFields: ["field1", "field2"],
        optionalFields: ["field3"],
      };

      expect(template.name).toBe("Test Template");
      expect(template.category).toBe("security");
      expect(Array.isArray(template.sections)).toBe(true);
      expect(Array.isArray(template.requiredFields)).toBe(true);
      expect(Array.isArray(template.optionalFields)).toBe(true);
    });
  });

  describe("ADRValidationResult", () => {
    it("should create valid validation result", () => {
      const result: ADRValidationResult = {
        isValid: true,
        errors: [],
        warnings: ["Warning 1"],
        suggestions: ["Suggestion 1"],
      };

      expect(typeof result.isValid).toBe("boolean");
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it("should handle validation errors", () => {
      const errorResult: ADRValidationResult = {
        isValid: false,
        errors: ["Error 1", "Error 2"],
        warnings: [],
        suggestions: [],
      };

      expect(errorResult.isValid).toBe(false);
      expect(errorResult.errors.length).toBe(2);
      expect(errorResult.warnings.length).toBe(0);
      expect(errorResult.suggestions.length).toBe(0);
    });
  });

  describe("ADRRelationship", () => {
    it("should create valid ADR relationship", () => {
      const relationship: ADRRelationship = {
        source: "001",
        target: "002",
        type: "related",
        strength: 0.8,
        description: "Test relationship",
      };

      expect(relationship.source).toBe("001");
      expect(relationship.target).toBe("002");
      expect(["supersedes", "related", "conflicts", "depends_on"]).toContain(relationship.type);
      expect(typeof relationship.strength).toBe("number");
      expect(relationship.strength).toBeGreaterThanOrEqual(0);
      expect(relationship.strength).toBeLessThanOrEqual(1);
      expect(relationship.description).toBe("Test relationship");
    });

    it("should handle different relationship types", () => {
      const relationshipTypes = ["supersedes", "related", "conflicts", "depends_on"] as const;

      relationshipTypes.forEach(type => {
        const relationship: ADRRelationship = {
          source: "001",
          target: "002",
          type,
          strength: 0.5,
          description: `Test ${type} relationship`,
        };

        expect(relationship.type).toBe(type);
        expect(relationship.description).toContain(type);
      });
    });

    it("should validate strength values", () => {
      const validStrengths = [0, 0.1, 0.5, 0.8, 1.0];

      validStrengths.forEach(strength => {
        const relationship: ADRRelationship = {
          source: "001",
          target: "002",
          type: "related",
          strength,
          description: "Test relationship",
        };

        expect(relationship.strength).toBe(strength);
        expect(relationship.strength).toBeGreaterThanOrEqual(0);
        expect(relationship.strength).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("Type compatibility", () => {
    it("should ensure type compatibility between interfaces", () => {
      // Test that ADRDocument can be used with ADRValidationResult
      const adr: ADRDocument = {
        id: "001",
        title: "Test ADR",
        status: "accepted",
        category: "performance",
        date: "2024-01-01",
        authors: ["John Doe"],
        stakeholders: ["Development Team"],
        context: "Test context",
        decision: "Test decision",
        consequences: {
          positive: ["Benefit 1"],
          negative: ["Drawback 1"],
          risks: [],
        },
        compliance: "Compliance requirements",
        references: [],
        relatedADRs: [],
      };

      const validationResult: ADRValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
      };

      // Both should be valid objects
      expect(adr.id).toBe("001");
      expect(validationResult.isValid).toBe(true);
    });

    it("should ensure enum values are consistent", () => {
      const statusValues: ADRStatus[] = ["proposed", "accepted", "rejected", "superseded", "deprecated"];
      const categoryValues: ADRCategory[] = ["security", "performance", "scalability", "integration", "maintainability", "general"];

      // All status values should be valid strings
      statusValues.forEach(status => {
        expect(typeof status).toBe("string");
        expect(status.length).toBeGreaterThan(0);
      });

      // All category values should be valid strings
      categoryValues.forEach(category => {
        expect(typeof category).toBe("string");
        expect(category.length).toBeGreaterThan(0);
      });
    });
  });
});
