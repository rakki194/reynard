/**
 * 🦊 Naming Violation Formatter Vitest Tests
 *
 * Test suite for the naming violation formatter.
 */

import { describe, it, expect } from "vitest";
import {
  formatNamingViolationReport,
  formatViolationForConsole,
  formatViolationForJson,
} from "../commands/naming-violation-formatter";
import type { ScanResult, NamingViolation } from "../NamingViolationScanner";

describe("Naming Violation Formatter", () => {
  const mockViolation: NamingViolation = {
    file: "src/test.ts",
    line: 5,
    column: 10,
    violation: "UnifiedMetricsEngine",
    context: "class UnifiedMetricsEngine",
    suggestion: 'Use "MetricsEngine" instead of "UnifiedMetricsEngine"',
    severity: "error",
    type: "class",
  };

  const mockScanResult: ScanResult = {
    violations: [mockViolation],
    totalFiles: 10,
    totalViolations: 1,
    summary: {
      errors: 1,
      warnings: 0,
      byType: {
        class: 1,
      },
    },
  };

  const mockEmptyResult: ScanResult = {
    violations: [],
    totalFiles: 10,
    totalViolations: 0,
    summary: {
      errors: 0,
      warnings: 0,
      byType: {},
    },
  };

  describe("formatNamingViolationReport", () => {
    it("should format as JSON when format is json", () => {
      const result = formatNamingViolationReport(mockScanResult, "json");

      expect(result).toContain('"violations"');
      expect(result).toContain('"totalFiles"');
      expect(result).toContain('"totalViolations"');
      expect(result).toContain('"summary"');
      expect(result).toContain('"UnifiedMetricsEngine"');
    });

    it("should format as table when format is table", () => {
      const result = formatNamingViolationReport(mockScanResult, "table");

      expect(result).toContain("┌");
      expect(result).toContain("Naming Violation Report");
      expect(result).toContain("File");
      // Table truncates long values with ellipsis
      expect(result).toMatch(/UnifiedMetri.*\.{3}/);
    });

    it("should format as report when format is report", () => {
      const result = formatNamingViolationReport(mockScanResult, "report");

      expect(result).toContain("🦊 Reynard Naming Violation Report");
      expect(result).toContain("===================================");
      expect(result).toContain("📊 Summary");
      expect(result).toContain("🚨 Detailed Violations");
      expect(result).toContain("📁 src/test.ts");
      expect(result).toContain("❌ Line 5: UnifiedMetricsEngine (class)");
    });

    it("should format as summary when format is summary", () => {
      const result = formatNamingViolationReport(mockScanResult, "summary");

      expect(result).toContain("🚨 Naming Violations Found");
      expect(result).toContain("==========================");
      expect(result).toContain("📊 1 violations in 10 files");
      expect(result).toContain("❌ 1 errors, ⚠️ 0 warnings");
      expect(result).toContain("🔍 Top Violations:");
      expect(result).toContain("1. ❌ src/test.ts:5 - UnifiedMetricsEngine");
    });

    it("should default to summary format when format is not specified", () => {
      const result = formatNamingViolationReport(mockScanResult, "");

      expect(result).toContain("🚨 Naming Violations Found");
      expect(result).toContain("==========================");
    });

    it("should handle empty violations gracefully", () => {
      const result = formatNamingViolationReport(mockEmptyResult, "summary");

      expect(result).toContain("✅ No naming violations found!");
      expect(result).toContain("Your code follows the Reynard naming guidelines.");
    });

    it("should handle case insensitive format", () => {
      const result = formatNamingViolationReport(mockScanResult, "JSON");

      expect(result).toContain('"violations"');
      expect(result).toContain('"totalFiles"');
    });
  });

  describe("formatViolationForConsole", () => {
    it("should format violation for console output", () => {
      const result = formatViolationForConsole(mockViolation);

      expect(result).toContain("❌ src/test.ts:5:10");
      expect(result).toContain("Type: class");
      expect(result).toContain("Violation: UnifiedMetricsEngine");
      expect(result).toContain("Context: class UnifiedMetricsEngine");
      expect(result).toContain('Suggestion: Use "MetricsEngine" instead of "UnifiedMetricsEngine"');
    });

    it("should format warning violation correctly", () => {
      const warningViolation: NamingViolation = {
        ...mockViolation,
        severity: "warning",
      };

      const result = formatViolationForConsole(warningViolation);

      expect(result).toContain("⚠️ src/test.ts:5:10");
    });

    it("should handle different violation types", () => {
      const functionViolation: NamingViolation = {
        ...mockViolation,
        type: "function",
      };

      const result = formatViolationForConsole(functionViolation);

      expect(result).toContain("Type: function");
    });
  });

  describe("formatViolationForJson", () => {
    it("should format violation as JSON object", () => {
      const result = formatViolationForJson(mockViolation);

      expect(result).toEqual({
        file: "src/test.ts",
        line: 5,
        column: 10,
        type: "class",
        severity: "error",
        violation: "UnifiedMetricsEngine",
        context: "class UnifiedMetricsEngine",
        suggestion: 'Use "MetricsEngine" instead of "UnifiedMetricsEngine"',
      });
    });

    it("should handle different violation types in JSON", () => {
      const interfaceViolation: NamingViolation = {
        ...mockViolation,
        type: "interface",
      };

      const result = formatViolationForJson(interfaceViolation);

      expect((result as any).type).toBe("interface");
    });
  });

  describe("Table Format Specific Tests", () => {
    it("should handle long file paths in table format", () => {
      const longPathViolation: NamingViolation = {
        ...mockViolation,
        file: "/very/long/path/to/some/deeply/nested/directory/structure/test.ts",
      };

      const result = formatNamingViolationReport(
        {
          ...mockScanResult,
          violations: [longPathViolation],
        },
        "table"
      );

      expect(result).toContain("..."); // Should truncate long paths
    });

    it("should handle long violation names in table format", () => {
      const longViolation: NamingViolation = {
        ...mockViolation,
        violation: "VeryLongViolationNameThatExceedsTheColumnWidth",
      };

      const result = formatNamingViolationReport(
        {
          ...mockScanResult,
          violations: [longViolation],
        },
        "table"
      );

      expect(result).toContain("..."); // Should truncate long names
    });

    it("should display multiple violations in table format", () => {
      const multipleViolations: NamingViolation[] = [
        mockViolation,
        {
          ...mockViolation,
          file: "src/another.ts",
          line: 10,
          violation: "EnhancedSecuritySystem",
          type: "interface",
        },
      ];

      const result = formatNamingViolationReport(
        {
          ...mockScanResult,
          violations: multipleViolations,
          totalViolations: 2,
        },
        "table"
      );

      expect(result).toMatch(/UnifiedMetri.*\.{3}/);
      expect(result).toMatch(/EnhancedSecu.*\.{3}/);
    });
  });

  describe("Report Format Specific Tests", () => {
    it("should group violations by file in report format", () => {
      const multipleViolations: NamingViolation[] = [
        mockViolation,
        {
          ...mockViolation,
          line: 10,
          violation: "EnhancedSecuritySystem",
          type: "interface",
        },
      ];

      const result = formatNamingViolationReport(
        {
          ...mockScanResult,
          violations: multipleViolations,
          totalViolations: 2,
        },
        "report"
      );

      expect(result).toContain("📁 src/test.ts");
      expect(result).toContain("─".repeat("src/test.ts".length + 4));
      expect(result).toContain("❌ Line 5: UnifiedMetricsEngine (class)");
      expect(result).toContain("❌ Line 10: EnhancedSecuritySystem (interface)");
    });

    it("should display violations by type in report format", () => {
      const multipleViolations: NamingViolation[] = [
        mockViolation,
        {
          ...mockViolation,
          violation: "EnhancedSecuritySystem",
          type: "interface",
        },
        {
          ...mockViolation,
          violation: "AdvancedDataProcessor",
          type: "function",
        },
      ];

      const result = formatNamingViolationReport(
        {
          ...mockScanResult,
          violations: multipleViolations,
          totalViolations: 3,
          summary: {
            errors: 3,
            warnings: 0,
            byType: {
              class: 1,
              interface: 1,
              function: 1,
            },
          },
        },
        "report"
      );

      expect(result).toContain("📋 Violations by Type");
      expect(result).toContain("class: 1");
      expect(result).toContain("interface: 1");
      expect(result).toContain("function: 1");
    });

    it("should show success message when no violations found", () => {
      const result = formatNamingViolationReport(mockEmptyResult, "report");

      expect(result).toContain("✅ No naming violations found!");
      expect(result).toContain("Your code follows the Reynard naming guidelines:");
      expect(result).toContain("• No forbidden marketing prefixes");
      expect(result).toContain("• Clear, descriptive naming that explains purpose");
      expect(result).toContain("• Appropriate complexity and specificity");
    });
  });

  describe("Summary Format Specific Tests", () => {
    it("should show top violations in summary format", () => {
      const multipleViolations: NamingViolation[] = [
        mockViolation,
        {
          ...mockViolation,
          file: "src/another.ts",
          line: 10,
          violation: "EnhancedSecuritySystem",
        },
        {
          ...mockViolation,
          file: "src/third.ts",
          line: 15,
          violation: "AdvancedDataProcessor",
        },
      ];

      const result = formatNamingViolationReport(
        {
          ...mockScanResult,
          violations: multipleViolations,
          totalViolations: 3,
        },
        "summary"
      );

      expect(result).toContain("🔍 Top Violations:");
      expect(result).toContain("1. ❌ src/test.ts:5 - UnifiedMetricsEngine");
      expect(result).toContain("2. ❌ src/another.ts:10 - EnhancedSecuritySystem");
      expect(result).toContain("3. ❌ src/third.ts:15 - AdvancedDataProcessor");
    });

    it("should limit top violations to 5 in summary format", () => {
      const manyViolations: NamingViolation[] = Array.from({ length: 10 }, (_, i) => ({
        ...mockViolation,
        file: `src/test${i}.ts`,
        line: i + 1,
        violation: `Violation${i}`,
      }));

      const result = formatNamingViolationReport(
        {
          ...mockScanResult,
          violations: manyViolations,
          totalViolations: 10,
        },
        "summary"
      );

      expect(result).toContain("... and 5 more violations");
    });

    it("should show violations by type in summary format", () => {
      const result = formatNamingViolationReport(mockScanResult, "summary");

      expect(result).toContain("📋 Violations by Type:");
      expect(result).toContain("class: 1");
    });

    it("should show help text in summary format", () => {
      const result = formatNamingViolationReport(mockScanResult, "summary");

      expect(result).toContain("💡 Run with --format report for detailed information");
      expect(result).toContain("🔧 Run with --fix for fix suggestions");
    });
  });

  describe("Edge Cases", () => {
    it("should handle violations with special characters", () => {
      const specialViolation: NamingViolation = {
        ...mockViolation,
        violation: "Unified-Metrics-Engine",
        context: "class Unified-Metrics-Engine",
      };

      const result = formatNamingViolationReport(
        {
          ...mockScanResult,
          violations: [specialViolation],
        },
        "summary"
      );

      expect(result).toContain("Unified-Metrics-Engine");
    });

    it("should handle violations with unicode characters", () => {
      const unicodeViolation: NamingViolation = {
        ...mockViolation,
        violation: "UnifiedMétricsEngine",
        context: "class UnifiedMétricsEngine",
      };

      const result = formatNamingViolationReport(
        {
          ...mockScanResult,
          violations: [unicodeViolation],
        },
        "summary"
      );

      expect(result).toContain("UnifiedMétricsEngine");
    });

    it("should handle very long suggestions", () => {
      const longSuggestionViolation: NamingViolation = {
        ...mockViolation,
        suggestion:
          "This is a very long suggestion that explains in detail what should be done to fix the naming violation and provides multiple alternatives and examples",
      };

      const result = formatViolationForConsole(longSuggestionViolation);

      expect(result).toContain("This is a very long suggestion");
    });

    it("should handle violations with zero line numbers", () => {
      const zeroLineViolation: NamingViolation = {
        ...mockViolation,
        line: 0,
      };

      const result = formatViolationForConsole(zeroLineViolation);

      expect(result).toContain("❌ src/test.ts:0:10");
    });

    it("should handle violations with zero column numbers", () => {
      const zeroColumnViolation: NamingViolation = {
        ...mockViolation,
        column: 0,
      };

      const result = formatViolationForConsole(zeroColumnViolation);

      expect(result).toContain("❌ src/test.ts:5:0");
    });
  });

  describe("Performance", () => {
    it("should format large result sets efficiently", () => {
      const largeViolations: NamingViolation[] = Array.from({ length: 1000 }, (_, i) => ({
        ...mockViolation,
        file: `src/test${i}.ts`,
        line: i + 1,
        violation: `Violation${i}`,
      }));

      const largeResult: ScanResult = {
        violations: largeViolations,
        totalFiles: 1000,
        totalViolations: 1000,
        summary: {
          errors: 1000,
          warnings: 0,
          byType: {
            class: 1000,
          },
        },
      };

      const startTime = Date.now();
      const result = formatNamingViolationReport(largeResult, "summary");
      const endTime = Date.now();

      expect(result).toContain("📊 1000 violations in 1000 files");
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});
