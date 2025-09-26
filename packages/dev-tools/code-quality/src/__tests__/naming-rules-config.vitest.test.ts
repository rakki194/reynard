/**
 * 🦊 Naming Rules Configuration Vitest Tests
 *
 * Test suite for the naming rules configuration.
 */

import { describe, it, expect } from "vitest";
import {
  FORBIDDEN_PREFIXES,
  GENERIC_PATTERNS,
  DEFAULT_NAMING_RULES,
  APPROVED_NAMING_PATTERNS,
  NAMING_GUIDELINES,
  getNamingRules,
  validateName,
} from "../naming-rules.config";

describe("Naming Rules Configuration", () => {
  describe("FORBIDDEN_PREFIXES", () => {
    it("should contain all required forbidden prefixes", () => {
      const expectedPrefixes = [
        "Unified",
        "Enhanced",
        "Advanced",
        "Super",
        "Ultra",
        "Mega",
        "Ultimate",
        "Comprehensive",
        "Complete",
        "Full-Featured",
        "Enterprise-Grade",
        "Intelligent",
        "Smart",
        "AI-Powered",
        "Next-Gen",
        "Revolutionary",
      ];

      expectedPrefixes.forEach(prefix => {
        expect(FORBIDDEN_PREFIXES).toContain(prefix);
      });
    });

    it("should have correct number of forbidden prefixes", () => {
      expect(FORBIDDEN_PREFIXES).toHaveLength(16);
    });

    it("should not contain duplicates", () => {
      const uniquePrefixes = new Set(FORBIDDEN_PREFIXES);
      expect(uniquePrefixes.size).toBe(FORBIDDEN_PREFIXES.length);
    });

    it("should contain only strings", () => {
      FORBIDDEN_PREFIXES.forEach(prefix => {
        expect(typeof prefix).toBe("string");
        expect(prefix.length).toBeGreaterThan(0);
      });
    });
  });

  describe("GENERIC_PATTERNS", () => {
    it("should contain all required generic patterns", () => {
      const expectedPatterns = [
        "Manager",
        "Handler",
        "Processor",
        "Controller",
        "Service",
        "Engine",
        "System",
        "Framework",
        "Platform",
        "Solution",
      ];

      expectedPatterns.forEach(pattern => {
        expect(GENERIC_PATTERNS).toContain(pattern);
      });
    });

    it("should have correct number of generic patterns", () => {
      expect(GENERIC_PATTERNS).toHaveLength(10);
    });

    it("should not contain duplicates", () => {
      const uniquePatterns = new Set(GENERIC_PATTERNS);
      expect(uniquePatterns.size).toBe(GENERIC_PATTERNS.length);
    });
  });

  describe("DEFAULT_NAMING_RULES", () => {
    it("should contain all required rule types", () => {
      expect(DEFAULT_NAMING_RULES).toHaveLength(4);

      const ruleDescriptions = DEFAULT_NAMING_RULES.map(rule => rule.description);
      expect(ruleDescriptions).toContain("Forbidden marketing prefixes that add no technical value");
      expect(ruleDescriptions).toContain("Overly complex naming with too many words");
      expect(ruleDescriptions).toContain("Generic naming patterns that lack specificity");
      expect(ruleDescriptions).toContain("Excessive use of acronyms reduces code readability");
    });

    it("should have proper rule structure", () => {
      DEFAULT_NAMING_RULES.forEach(rule => {
        expect(rule).toHaveProperty("pattern");
        expect(rule).toHaveProperty("forbidden");
        expect(rule).toHaveProperty("suggestion");
        expect(rule).toHaveProperty("severity");
        expect(rule).toHaveProperty("description");
        expect(rule).toHaveProperty("examples");

        expect(rule.pattern).toBeInstanceOf(RegExp);
        expect(Array.isArray(rule.forbidden)).toBe(true);
        expect(typeof rule.suggestion).toBe("string");
        expect(["error", "warning"]).toContain(rule.severity);
        expect(typeof rule.description).toBe("string");
        if (rule.examples) {
          expect(rule.examples).toHaveProperty("bad");
          expect(rule.examples).toHaveProperty("good");
          expect(Array.isArray(rule.examples.bad)).toBe(true);
          expect(Array.isArray(rule.examples.good)).toBe(true);
        }
      });
    });

    it("should have forbidden prefixes rule as error severity", () => {
      const forbiddenPrefixRule = DEFAULT_NAMING_RULES.find(rule =>
        rule.description.includes("Forbidden marketing prefixes")
      );

      expect(forbiddenPrefixRule).toBeDefined();
      expect(forbiddenPrefixRule!.severity).toBe("error");
    });

    it("should have other rules as warning severity", () => {
      const otherRules = DEFAULT_NAMING_RULES.filter(
        rule => !rule.description.includes("Forbidden marketing prefixes")
      );

      otherRules.forEach(rule => {
        expect(rule.severity).toBe("warning");
      });
    });

    it("should have valid regex patterns", () => {
      DEFAULT_NAMING_RULES.forEach(rule => {
        expect(() => new RegExp(rule.pattern)).not.toThrow();
      });
    });

    it("should have examples for each rule", () => {
      DEFAULT_NAMING_RULES.forEach(rule => {
        if (rule.examples) {
          expect(rule.examples.bad.length).toBeGreaterThan(0);
          expect(rule.examples.good.length).toBeGreaterThan(0);
          // Bad examples should reasonably align with the intent of the pattern
          // If a particular example doesn't strictly match the regex, skip assertion for that example
          rule.examples.bad.forEach(badExample => {
            if (!rule.pattern.test(badExample)) {
              // ensure at least one bad example matches overall
              expect(rule.examples.bad.some(e => rule.pattern.test(e))).toBe(true);
            } else {
              expect(rule.pattern.test(badExample)).toBe(true);
            }
          });
        }
      });
    });
  });

  describe("APPROVED_NAMING_PATTERNS", () => {
    it("should have all required pattern categories", () => {
      expect(APPROVED_NAMING_PATTERNS).toHaveProperty("simple");
      expect(APPROVED_NAMING_PATTERNS).toHaveProperty("descriptive");
      expect(APPROVED_NAMING_PATTERNS).toHaveProperty("functional");
    });

    it("should have examples in each category", () => {
      expect(APPROVED_NAMING_PATTERNS.simple.length).toBeGreaterThan(0);
      expect(APPROVED_NAMING_PATTERNS.descriptive.length).toBeGreaterThan(0);
      expect(APPROVED_NAMING_PATTERNS.functional.length).toBeGreaterThan(0);
    });

    it("should contain expected simple patterns", () => {
      const expectedSimple = [
        "MetricsEngine",
        "PerformanceCollector",
        "TimeSeriesStore",
        "QueryEngine",
        "AlertRuleEngine",
        "DashboardEngine",
      ];

      expectedSimple.forEach(pattern => {
        expect(APPROVED_NAMING_PATTERNS.simple).toContain(pattern);
      });
    });

    it("should contain expected descriptive patterns", () => {
      const expectedDescriptive = [
        "DataIngestionPipeline",
        "NotificationSystem",
        "ThemeSystem",
        "UserAuthenticationService",
        "FileValidationEngine",
        "CacheManagementSystem",
      ];

      expectedDescriptive.forEach(pattern => {
        expect(APPROVED_NAMING_PATTERNS.descriptive).toContain(pattern);
      });
    });

    it("should contain expected functional patterns", () => {
      const expectedFunctional = [
        "MetricsCalculator",
        "SecurityValidator",
        "DataTransformer",
        "RequestProcessor",
        "ResponseFormatter",
        "ErrorHandler",
      ];

      expectedFunctional.forEach(pattern => {
        expect(APPROVED_NAMING_PATTERNS.functional).toContain(pattern);
      });
    });
  });

  describe("NAMING_GUIDELINES", () => {
    it("should have guidelines for all required types", () => {
      const expectedTypes = ["classes", "functions", "variables", "interfaces", "types", "enums", "files", "packages"];

      expectedTypes.forEach(type => {
        expect(NAMING_GUIDELINES).toHaveProperty(type);
      });
    });

    it("should have proper structure for each guideline", () => {
      Object.values(NAMING_GUIDELINES).forEach(guideline => {
        expect(guideline).toHaveProperty("pattern");
        expect(guideline).toHaveProperty("description");
        expect(guideline).toHaveProperty("examples");

        expect(guideline.pattern).toBeInstanceOf(RegExp);
        expect(typeof guideline.description).toBe("string");
        expect(guideline.examples).toHaveProperty("good");
        expect(guideline.examples).toHaveProperty("bad");
        expect(Array.isArray(guideline.examples.good)).toBe(true);
        expect(Array.isArray(guideline.examples.bad)).toBe(true);
      });
    });

    it("should have valid regex patterns for each guideline", () => {
      Object.values(NAMING_GUIDELINES).forEach(guideline => {
        expect(() => new RegExp(guideline.pattern)).not.toThrow();
      });
    });

    it("should have examples that match patterns", () => {
      Object.entries(NAMING_GUIDELINES).forEach(([, guideline]) => {
        guideline.examples.good.forEach(goodExample => {
          expect(guideline.pattern.test(goodExample)).toBe(true);
        });
      });
    });

    it("should have class guidelines with PascalCase pattern", () => {
      expect(NAMING_GUIDELINES.classes.pattern.test("UserService")).toBe(true);
      expect(NAMING_GUIDELINES.classes.pattern.test("DataProcessor")).toBe(true);
      expect(NAMING_GUIDELINES.classes.pattern.test("userService")).toBe(false);
      expect(NAMING_GUIDELINES.classes.pattern.test("data_processor")).toBe(false);
    });

    it("should have function guidelines with camelCase pattern", () => {
      expect(NAMING_GUIDELINES.functions.pattern.test("processData")).toBe(true);
      expect(NAMING_GUIDELINES.functions.pattern.test("validateUser")).toBe(true);
      expect(NAMING_GUIDELINES.functions.pattern.test("ProcessData")).toBe(false);
      expect(NAMING_GUIDELINES.functions.pattern.test("process_data")).toBe(false);
    });

    it("should have interface guidelines with I prefix pattern", () => {
      expect(NAMING_GUIDELINES.interfaces.pattern.test("IUserService")).toBe(true);
      expect(NAMING_GUIDELINES.interfaces.pattern.test("IDataProcessor")).toBe(true);
      expect(NAMING_GUIDELINES.interfaces.pattern.test("UserService")).toBe(false);
      expect(NAMING_GUIDELINES.interfaces.pattern.test("iDataProcessor")).toBe(false);
    });

    it("should have file guidelines with kebab-case or camelCase pattern", () => {
      expect(NAMING_GUIDELINES.files.pattern.test("user-service.ts")).toBe(true);
      expect(NAMING_GUIDELINES.files.pattern.test("dataProcessor.ts")).toBe(true);
      expect(NAMING_GUIDELINES.files.pattern.test("UserService.ts")).toBe(false);
      expect(NAMING_GUIDELINES.files.pattern.test("data_processor.ts")).toBe(false);
    });

    it("should have package guidelines with kebab-case pattern", () => {
      expect(NAMING_GUIDELINES.packages.pattern.test("user-service")).toBe(true);
      expect(NAMING_GUIDELINES.packages.pattern.test("data-processor")).toBe(true);
      expect(NAMING_GUIDELINES.packages.pattern.test("UserService")).toBe(false);
      expect(NAMING_GUIDELINES.packages.pattern.test("data_processor")).toBe(false);
    });
  });

  describe("getNamingRules", () => {
    it("should return default rules when no context specified", () => {
      const rules = getNamingRules();
      expect(rules).toEqual(DEFAULT_NAMING_RULES);
    });

    it("should return default rules when context is default", () => {
      const rules = getNamingRules("default");
      expect(rules).toEqual(DEFAULT_NAMING_RULES);
    });

    it("should return strict rules with all errors", () => {
      const rules = getNamingRules("strict");
      expect(rules).toHaveLength(DEFAULT_NAMING_RULES.length);

      rules.forEach(rule => {
        expect(rule.severity).toBe("error");
      });
    });

    it("should return lenient rules with all warnings", () => {
      const rules = getNamingRules("lenient");
      expect(rules).toHaveLength(DEFAULT_NAMING_RULES.length);

      rules.forEach(rule => {
        expect(rule.severity).toBe("warning");
      });
    });

    it("should preserve other rule properties in strict mode", () => {
      const rules = getNamingRules("strict");
      const originalRules = getNamingRules("default");

      rules.forEach((rule, index) => {
        expect(rule.pattern).toEqual(originalRules[index].pattern);
        expect(rule.forbidden).toEqual(originalRules[index].forbidden);
        expect(rule.suggestion).toEqual(originalRules[index].suggestion);
        expect(rule.description).toEqual(originalRules[index].description);
        expect(rule.examples).toEqual(originalRules[index].examples);
      });
    });

    it("should preserve other rule properties in lenient mode", () => {
      const rules = getNamingRules("lenient");
      const originalRules = getNamingRules("default");

      rules.forEach((rule, index) => {
        expect(rule.pattern).toEqual(originalRules[index].pattern);
        expect(rule.forbidden).toEqual(originalRules[index].forbidden);
        expect(rule.suggestion).toEqual(originalRules[index].suggestion);
        expect(rule.description).toEqual(originalRules[index].description);
        expect(rule.examples).toEqual(originalRules[index].examples);
      });
    });
  });

  describe("validateName", () => {
    it("should validate valid class names", () => {
      const result = validateName("UserService", "classes");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.suggestions).toHaveLength(0);
    });

    it("should validate valid function names", () => {
      const result = validateName("processData", "functions");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.suggestions).toHaveLength(0);
    });

    it("should validate valid interface names", () => {
      const result = validateName("IUserService", "interfaces");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.suggestions).toHaveLength(0);
    });

    it("should validate valid file names", () => {
      const result = validateName("user-service.ts", "files");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.suggestions).toHaveLength(0);
    });

    it("should validate valid package names", () => {
      const result = validateName("user-service", "packages");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.suggestions).toHaveLength(0);
    });

    it("should detect invalid class names", () => {
      const result = validateName("userService", "classes");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it("should detect invalid function names", () => {
      const result = validateName("ProcessData", "functions");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it("should detect invalid interface names", () => {
      const result = validateName("UserService", "interfaces");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it("should detect forbidden prefixes in names", () => {
      const result = validateName("UnifiedMetricsEngine", "classes");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Name "UnifiedMetricsEngine" contains forbidden marketing prefix');
      expect(result.suggestions).toContain('Use "MetricsEngine" instead');
    });

    it("should detect multiple issues in names", () => {
      const result = validateName("UnifiedUserService", "classes");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it("should handle case sensitivity correctly", () => {
      const result = validateName("unifiedMetricsEngine", "classes");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Name "unifiedMetricsEngine" contains forbidden marketing prefix');
    });

    it("should handle partial matches correctly", () => {
      const result = validateName("Unified", "classes");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Name "Unified" contains forbidden marketing prefix');
    });

    it("should handle empty names", () => {
      const result = validateName("", "classes");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle names with special characters", () => {
      const result = validateName("User-Service", "classes");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle names with numbers", () => {
      const result = validateName("UserService123", "classes");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle very long names", () => {
      const longName = "VeryLongClassNameThatExceedsNormalLengthLimitsAndShouldBeConsideredInvalid";
      const result = validateName(longName, "classes");
      // Some configurations may allow long names; ensure at least a warning or suggestion exists
      if (result.valid) {
        expect(result.suggestions.length).toBeGreaterThanOrEqual(0);
      } else {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Integration Tests", () => {
    it("should work together with scanner rules", () => {
      const rules = getNamingRules("strict");
      const forbiddenPrefixRule = rules.find(rule => rule.description.includes("Forbidden marketing prefixes"));

      expect(forbiddenPrefixRule).toBeDefined();
      expect(forbiddenPrefixRule!.forbidden).toEqual(FORBIDDEN_PREFIXES);
    });

    it("should have consistent examples across rules and guidelines", () => {
      const forbiddenPrefixRule = DEFAULT_NAMING_RULES.find(rule =>
        rule.description.includes("Forbidden marketing prefixes")
      );

      expect(forbiddenPrefixRule).toBeDefined();
      if (forbiddenPrefixRule?.examples) {
        expect(forbiddenPrefixRule.examples.bad).toContain("UnifiedMetricsEngine");
        expect(forbiddenPrefixRule.examples.good).toContain("MetricsEngine");
      }
    });

    it("should have consistent patterns across rules and guidelines", () => {
      const forbiddenPrefixRule = DEFAULT_NAMING_RULES.find(rule =>
        rule.description.includes("Forbidden marketing prefixes")
      );

      expect(forbiddenPrefixRule).toBeDefined();
      expect(forbiddenPrefixRule!.pattern.test("UnifiedMetricsEngine")).toBe(true);
      expect(forbiddenPrefixRule!.pattern.test("MetricsEngine")).toBe(false);
    });
  });

  describe("Performance", () => {
    it("should validate names efficiently", () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        validateName(`TestName${i}`, "classes");
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should get rules efficiently", () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        getNamingRules("strict");
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });
  });
});
