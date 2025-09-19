/**
 * 🦊 Variable Validator Tests
 * Test suite for CSS variable validation functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { VariableValidator } from "../variableValidator.js";
import { CSSLogger } from "../logger.js";
import { VariableExtractor } from "../variableExtractor.js";
import { FileManager } from "../fileManager.js";
import type { ValidatorConfig, CSSVariableDefinition, CSSVariableUsage } from "../types.js";

describe("VariableValidator", () => {
  let validator: VariableValidator;
  let logger: CSSLogger;
  let extractor: VariableExtractor;
  let fileManager: FileManager;
  let config: ValidatorConfig;

  beforeEach(() => {
    config = {
      scanDirs: ["packages"],
      criticalVariables: ["accent", "bg-color"],
      themeVariables: ["accent", "bg-color"],
      verbose: false,
    };
    logger = new CSSLogger(false);
    fileManager = new FileManager(config, logger);
    extractor = new VariableExtractor(fileManager, logger);
    validator = new VariableValidator(config, logger, extractor);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("validate", () => {
    it("should return successful validation when no issues found", () => {
      const definitions = new Map<string, CSSVariableDefinition[]>([
        [
          "accent-color",
          [
            {
              name: "accent-color",
              value: "#007acc",
              line: 1,
              theme: "default",
              file: "/test/styles.css",
              context: "--accent-color: #007acc;",
            },
          ],
        ],
      ]);

      const usage = new Map<string, CSSVariableUsage[]>([
        [
          "accent-color",
          [
            {
              name: "accent-color",
              line: 5,
              file: "/test/styles.css",
              context: "color: var(--accent-color);",
            },
          ],
        ],
      ]);

      const startTime = new Date();
      const result = validator.validate(definitions, usage, startTime);

      expect(result.success).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.missingVariables).toHaveLength(0);
      expect(result.unusedVariables).toHaveLength(0);
      expect(result.typos).toHaveLength(0);
    });

    it("should find missing variables", () => {
      const definitions = new Map<string, CSSVariableDefinition[]>();
      const usage = new Map<string, CSSVariableUsage[]>([
        [
          "missing-var",
          [
            {
              name: "missing-var",
              line: 5,
              file: "/test/styles.css",
              context: "color: var(--missing-var);",
            },
          ],
        ],
      ]);

      const startTime = new Date();
      const result = validator.validate(definitions, usage, startTime);

      expect(result.success).toBe(false);
      expect(result.missingVariables).toHaveLength(1);
      expect(result.missingVariables[0]?.variable).toBe("missing-var");
      expect(result.missingVariables[0]?.usageCount).toBe(1);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]?.type).toBe("missing");
      expect(result.issues[0]?.severity).toBe("error");
    });

    it("should find unused variables", () => {
      const definitions = new Map<string, CSSVariableDefinition[]>([
        [
          "unused-var",
          [
            {
              name: "unused-var",
              value: "#ff0000",
              line: 1,
              theme: "default",
              file: "/test/styles.css",
              context: "--unused-var: #ff0000;",
            },
          ],
        ],
      ]);

      const usage = new Map<string, CSSVariableUsage[]>();
      const startTime = new Date();
      const result = validator.validate(definitions, usage, startTime);

      expect(result.success).toBe(true);
      expect(result.unusedVariables).toHaveLength(1);
      expect(result.unusedVariables[0]?.variable).toBe("unused-var");
      expect(result.unusedVariables[0]?.definitionCount).toBe(1);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]?.type).toBe("unused");
      expect(result.issues[0]?.severity).toBe("warning");
    });

    it("should find typos in variable names", () => {
      const definitions = new Map<string, CSSVariableDefinition[]>([
        [
          "primay-color",
          [
            {
              name: "primay-color",
              value: "#007acc",
              line: 1,
              theme: "default",
              file: "/test/styles.css",
              context: "--primay-color: #007acc;",
            },
          ],
        ],
      ]);

      const usage = new Map<string, CSSVariableUsage[]>([
        [
          "primay-color",
          [
            {
              name: "primay-color",
              line: 5,
              file: "/test/styles.css",
              context: "color: var(--primay-color);",
            },
          ],
        ],
      ]);

      const startTime = new Date();
      const result = validator.validate(definitions, usage, startTime);

      expect(result.success).toBe(true);
      expect(result.typos).toHaveLength(1);
      expect(result.typos[0]?.variable).toBe("primay-color");
      expect(result.typos[0]?.issues).toContain("'primay' should be 'primary'");
      expect(result.typos[0]?.suggestions).toContain("primary-color");
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]?.type).toBe("typo");
      expect(result.issues[0]?.severity).toBe("warning");
    });

    it("should handle multiple typos in the same variable name", () => {
      const definitions = new Map<string, CSSVariableDefinition[]>([
        [
          "primay-seconary-color",
          [
            {
              name: "primay-seconary-color",
              value: "#007acc",
              line: 1,
              theme: "default",
              file: "/test/styles.css",
              context: "--primay-seconary-color: #007acc;",
            },
          ],
        ],
      ]);

      const usage = new Map<string, CSSVariableUsage[]>([]);
      const startTime = new Date();
      const result = validator.validate(definitions, usage, startTime);

      expect(result.typos).toHaveLength(1);
      expect(result.typos[0]?.issues).toHaveLength(2);
      expect(result.typos[0]?.issues).toContain("'primay' should be 'primary'");
      expect(result.typos[0]?.issues).toContain("'seconary' should be 'secondary'");
    });

    it("should generate correct summary statistics", () => {
      const definitions = new Map<string, CSSVariableDefinition[]>([
        [
          "var1",
          [
            {
              name: "var1",
              value: "#000",
              line: 1,
              theme: "default",
              file: "/test/styles.css",
              context: "--var1: #000;",
            },
          ],
        ],
        [
          "var2",
          [
            {
              name: "var2",
              value: "#fff",
              line: 2,
              theme: "default",
              file: "/test/styles.css",
              context: "--var2: #fff;",
              importedFrom: "/test/imported.css",
            },
          ],
        ],
      ]);

      const usage = new Map<string, CSSVariableUsage[]>([
        [
          "var1",
          [
            {
              name: "var1",
              line: 5,
              file: "/test/styles.css",
              context: "color: var(--var1);",
            },
          ],
        ],
        [
          "var2",
          [
            {
              name: "var2",
              line: 6,
              file: "/test/styles.css",
              context: "background: var(--var2);",
              importedFrom: "/test/imported.css",
            },
          ],
        ],
      ]);

      const startTime = new Date();
      const result = validator.validate(definitions, usage, startTime);

      expect(result.summary.totalDefinitions).toBe(2);
      expect(result.summary.directDefinitions).toBe(1);
      expect(result.summary.importedDefinitions).toBe(1);
      expect(result.summary.totalUsage).toBe(2);
      expect(result.summary.directUsage).toBe(1);
      expect(result.summary.importedUsage).toBe(1);
      expect(result.summary.uniqueVariables).toBe(2);
    });

    it("should handle import context for missing variables", () => {
      const definitions = new Map<string, CSSVariableDefinition[]>();
      const usage = new Map<string, CSSVariableUsage[]>([
        [
          "missing-var",
          [
            {
              name: "missing-var",
              line: 5,
              file: "/test/main.css",
              context: "color: var(--missing-var);",
              importedFrom: "/test/imported.css",
            },
          ],
        ],
      ]);

      const startTime = new Date();
      const result = validator.validate(definitions, usage, startTime);

      expect(result.missingVariables).toHaveLength(1);
      expect(result.missingVariables[0]?.importContext).toContain("/test/imported.css");
    });
  });

  describe("hasErrors", () => {
    it("should return true when validation has errors", () => {
      const result = {
        success: false,
        issues: [
          {
            type: "missing" as const,
            severity: "error" as const,
            variable: "missing-var",
            message: "Variable is missing",
          },
        ],
        missingVariables: [],
        unusedVariables: [],
        typos: [],
        summary: {
          totalDefinitions: 0,
          directDefinitions: 0,
          importedDefinitions: 0,
          totalUsage: 1,
          directUsage: 1,
          importedUsage: 0,
          uniqueVariables: 0,
          missingVariables: 1,
          unusedVariables: 0,
          typos: 0,
          cssFilesProcessed: 1,
        },
        metadata: {
          startTime: new Date(),
          endTime: new Date(),
          duration: 100,
          projectRoot: "/test",
          scanDirs: ["packages"],
          config,
        },
      };

      expect(validator.hasErrors(result)).toBe(true);
    });

    it("should return false when validation has no errors", () => {
      const result = {
        success: true,
        issues: [
          {
            type: "unused" as const,
            severity: "warning" as const,
            variable: "unused-var",
            message: "Variable is unused",
          },
        ],
        missingVariables: [],
        unusedVariables: [],
        typos: [],
        summary: {
          totalDefinitions: 1,
          directDefinitions: 1,
          importedDefinitions: 0,
          totalUsage: 0,
          directUsage: 0,
          importedUsage: 0,
          uniqueVariables: 1,
          missingVariables: 0,
          unusedVariables: 1,
          typos: 0,
          cssFilesProcessed: 1,
        },
        metadata: {
          startTime: new Date(),
          endTime: new Date(),
          duration: 100,
          projectRoot: "/test",
          scanDirs: ["packages"],
          config,
        },
      };

      expect(validator.hasErrors(result)).toBe(false);
    });
  });

  describe("getExitCode", () => {
    it("should return 0 for successful validation", () => {
      const result = {
        success: true,
        issues: [],
        missingVariables: [],
        unusedVariables: [],
        typos: [],
        summary: {
          totalDefinitions: 1,
          directDefinitions: 1,
          importedDefinitions: 0,
          totalUsage: 1,
          directUsage: 1,
          importedUsage: 0,
          uniqueVariables: 1,
          missingVariables: 0,
          unusedVariables: 0,
          typos: 0,
          cssFilesProcessed: 1,
        },
        metadata: {
          startTime: new Date(),
          endTime: new Date(),
          duration: 100,
          projectRoot: "/test",
          scanDirs: ["packages"],
          config,
        },
      };

      expect(validator.getExitCode(result)).toBe(0);
    });

    it("should return 1 for validation with errors", () => {
      const result = {
        success: false,
        issues: [
          {
            type: "missing" as const,
            severity: "error" as const,
            variable: "missing-var",
            message: "Variable is missing",
          },
        ],
        missingVariables: [],
        unusedVariables: [],
        typos: [],
        summary: {
          totalDefinitions: 0,
          directDefinitions: 0,
          importedDefinitions: 0,
          totalUsage: 1,
          directUsage: 1,
          importedUsage: 0,
          uniqueVariables: 0,
          missingVariables: 1,
          unusedVariables: 0,
          typos: 0,
          cssFilesProcessed: 1,
        },
        metadata: {
          startTime: new Date(),
          endTime: new Date(),
          duration: 100,
          projectRoot: "/test",
          scanDirs: ["packages"],
          config,
        },
      };

      expect(validator.getExitCode(result)).toBe(1);
    });

    it("should return 2 for validation with warnings", () => {
      const result = {
        success: true,
        issues: [
          {
            type: "unused" as const,
            severity: "warning" as const,
            variable: "unused-var",
            message: "Variable is unused",
          },
        ],
        missingVariables: [],
        unusedVariables: [],
        typos: [],
        summary: {
          totalDefinitions: 1,
          directDefinitions: 1,
          importedDefinitions: 0,
          totalUsage: 0,
          directUsage: 0,
          importedUsage: 0,
          uniqueVariables: 1,
          missingVariables: 0,
          unusedVariables: 1,
          typos: 0,
          cssFilesProcessed: 1,
        },
        metadata: {
          startTime: new Date(),
          endTime: new Date(),
          duration: 100,
          projectRoot: "/test",
          scanDirs: ["packages"],
          config,
        },
      };

      expect(validator.getExitCode(result)).toBe(2);
    });
  });
});
