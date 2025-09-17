/**
 * Test suite for validate-css-variables.js
 *
 * Tests the CSS variable validation functionality including
 * file discovery, variable extraction, and validation logic.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import CSSVariableValidator from "./validate-css-variables.js";

// Mock fs module
vi.mock("fs");

describe("validate-css-variables.js", () => {
  let mockReadFileSync;
  let mockStatSync;
  let mockReadDirSync;
  let mockExistsSync;

  beforeEach(() => {
    mockReadFileSync = vi.mocked(fs.readFileSync);
    mockStatSync = vi.mocked(fs.statSync);
    mockReadDirSync = vi.mocked(fs.readdirSync);
    mockExistsSync = vi.mocked(fs.existsSync);

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("CSSVariableValidator", () => {
    let validator;

    beforeEach(() => {
      validator = new CSSVariableValidator();
    });

    describe("findCSSFiles", () => {
      it("should find CSS files in configured directories", () => {
        // Mock a simpler scenario with just one directory containing CSS files
        mockReadDirSync.mockReturnValueOnce(["styles.css", "theme.css", "components.css"]);

        mockStatSync
          .mockReturnValueOnce({ isDirectory: () => false }) // styles.css
          .mockReturnValueOnce({ isDirectory: () => false }) // theme.css
          .mockReturnValueOnce({ isDirectory: () => false }); // components.css

        mockExistsSync.mockReturnValue(true);

        const cssFiles = validator.findCSSFiles("/test");

        expect(cssFiles).toContain("/test/styles.css");
        expect(cssFiles).toContain("/test/theme.css");
        expect(cssFiles).toContain("/test/components.css");
        expect(cssFiles).toHaveLength(3);
      });

      it("should ignore files in ignored directories", () => {
        // Mock a scenario where node_modules is ignored
        mockReadDirSync.mockReturnValueOnce(["styles.css", "node_modules"]).mockReturnValueOnce(["ignored.css"]);

        mockStatSync
          .mockReturnValueOnce({ isDirectory: () => false }) // styles.css
          .mockReturnValueOnce({ isDirectory: () => true }) // node_modules
          .mockReturnValueOnce({ isDirectory: () => false }); // ignored.css

        mockExistsSync.mockReturnValue(true);

        const cssFiles = validator.findCSSFiles("/test");

        expect(cssFiles).toContain("/test/styles.css");
        expect(cssFiles).not.toContain("/test/node_modules/ignored.css");
        expect(cssFiles).toHaveLength(1);
      });

      it("should handle non-existent directories gracefully", () => {
        mockExistsSync.mockReturnValue(false);

        const cssFiles = validator.findCSSFiles("/nonexistent");

        expect(cssFiles).toEqual([]);
      });
    });

    describe("extractVariables", () => {
      it("should extract variable definitions", () => {
        const cssContent = `:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --font-size: 16px;
}`;

        mockReadFileSync.mockReturnValue(cssContent);
        mockExistsSync.mockReturnValue(true);

        const result = validator.extractVariables("/test/styles.css");

        expect(result.definitions).toHaveLength(3);
        expect(result.definitions[0]).toEqual({
          name: "primary-color",
          value: "#007bff",
          line: 2,
          theme: "default",
          file: "/test/styles.css",
          context: "--primary-color: #007bff;",
        });
      });

      it("should extract variable usage", () => {
        const cssContent = `.button {
  background-color: var(--primary-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}`;

        mockReadFileSync.mockReturnValue(cssContent);
        mockExistsSync.mockReturnValue(true);

        const result = validator.extractVariables("/test/styles.css");

        expect(result.usage).toHaveLength(3);
        expect(result.usage[0]).toEqual({
          name: "primary-color",
          line: 2,
          file: "/test/styles.css",
          context: "background-color: var(--primary-color);",
        });
      });

      it("should handle theme-specific variables", () => {
        const cssContent = `:root {
  --primary-color: #007bff;
}

:root[data-theme="dark"] {
  --primary-color: #0d6efd;
  --bg-color: #212529;
}`;

        mockReadFileSync.mockReturnValue(cssContent);
        mockExistsSync.mockReturnValue(true);

        const result = validator.extractVariables("/test/styles.css");

        expect(result.definitions).toHaveLength(3);
        expect(result.definitions[0].theme).toBe("default");
        expect(result.definitions[1].theme).toBe("dark");
        expect(result.definitions[2].theme).toBe("dark");
      });

      it("should handle multi-line variable definitions", () => {
        const cssContent = `:root {
  --complex-gradient: linear-gradient(
    45deg,
    #ff0000,
    #00ff00
  );
}`;

        mockReadFileSync.mockReturnValue(cssContent);
        mockExistsSync.mockReturnValue(true);

        const result = validator.extractVariables("/test/styles.css");

        expect(result.definitions).toHaveLength(1);
        expect(result.definitions[0].value).toContain("linear-gradient");
        expect(result.definitions[0].value).toContain("45deg");
      });

      it("should handle CSS imports", () => {
        const mainCss = `@import "variables.css";

.button {
  background-color: var(--primary-color);
}`;

        const variablesCss = `:root {
  --primary-color: #007bff;
}`;

        // Mock file reads: need to handle multiple calls to readFileSync
        mockReadFileSync.mockImplementation(filePath => {
          if (filePath === "/test/main.css") {
            return mainCss;
          } else if (filePath === "/test/variables.css") {
            return variablesCss;
          }
          return "";
        });

        // Mock file existence checks - need to handle the path resolution
        mockExistsSync.mockImplementation(path => {
          return path === "/test/main.css" || path === "/test/variables.css";
        });

        const result = validator.extractVariables("/test/main.css");

        // The import should be detected and processed
        expect(result.imports).toHaveLength(1);
        expect(result.imports[0].originalPath).toBe("variables.css");
        expect(result.imports[0].resolvedPath).toBe("/test/variables.css");

        // The imported variable should be found
        expect(result.definitions).toHaveLength(1);
        expect(result.definitions[0].name).toBe("primary-color");
        expect(result.definitions[0].importedFrom).toBe("/test/variables.css");
      });

      it("should prevent circular imports", () => {
        const cssContent = `@import "self.css";

:root {
  --primary-color: #007bff;
}`;

        mockReadFileSync.mockReturnValue(cssContent);
        mockExistsSync.mockReturnValue(true);

        const result = validator.extractVariables("/test/self.css");

        expect(result.definitions).toHaveLength(1);
        expect(result.definitions[0].importedFrom).toBeUndefined();
      });
    });

    describe("findMissingVariables", () => {
      it("should identify used but undefined variables", () => {
        // Mock the variables map
        validator.variables.usage.set("undefined-var", [
          {
            name: "undefined-var",
            line: 1,
            file: "/test.css",
            context: "var(--undefined-var)",
          },
        ]);
        validator.variables.usage.set("defined-var", [
          {
            name: "defined-var",
            line: 2,
            file: "/test.css",
            context: "var(--defined-var)",
          },
        ]);

        validator.variables.definitions.set("defined-var", [
          { name: "defined-var", value: "#000", line: 1, file: "/test.css" },
        ]);

        validator.findMissingVariables();

        expect(validator.variables.missing).toHaveLength(1);
        expect(validator.variables.missing[0].variable).toBe("undefined-var");
        expect(validator.variables.missing[0].usageCount).toBe(1);
      });

      it("should not flag defined variables as missing", () => {
        validator.variables.usage.set("defined-var", [
          {
            name: "defined-var",
            line: 1,
            file: "/test.css",
            context: "var(--defined-var)",
          },
        ]);

        validator.variables.definitions.set("defined-var", [
          { name: "defined-var", value: "#000", line: 1, file: "/test.css" },
        ]);

        validator.findMissingVariables();

        expect(validator.variables.missing).toHaveLength(0);
      });
    });

    describe("findUnusedVariables", () => {
      it("should identify defined but unused variables", () => {
        validator.variables.definitions.set("unused-var", [
          { name: "unused-var", value: "#000", line: 1, file: "/test.css" },
        ]);
        validator.variables.definitions.set("used-var", [
          { name: "used-var", value: "#fff", line: 2, file: "/test.css" },
        ]);

        validator.variables.usage.set("used-var", [
          {
            name: "used-var",
            line: 3,
            file: "/test.css",
            context: "var(--used-var)",
          },
        ]);

        validator.findUnusedVariables();

        expect(validator.variables.unused).toHaveLength(1);
        expect(validator.variables.unused[0].variable).toBe("unused-var");
      });

      it("should not flag external variables as unused", () => {
        validator.variables.definitions.set("z-index", [
          { name: "z-index", value: "1000", line: 1, file: "/test.css" },
        ]);
        validator.variables.definitions.set("shadow-sm", [
          {
            name: "shadow-sm",
            value: "0 1px 2px rgba(0,0,0,0.05)",
            line: 2,
            file: "/test.css",
          },
        ]);

        validator.findUnusedVariables();

        expect(validator.variables.unused).toHaveLength(0);
      });
    });

    describe("findTypos", () => {
      it("should identify common typos in variable names", () => {
        validator.variables.definitions.set("primay-color", [
          { name: "primay-color", value: "#000", line: 1, file: "/test.css" },
        ]);
        validator.variables.definitions.set("seconary-color", [
          { name: "seconary-color", value: "#666", line: 2, file: "/test.css" },
        ]);

        validator.findTypos();

        expect(validator.variables.typos).toHaveLength(2);
        expect(validator.variables.typos[0].variable).toBe("primay-color");
        expect(validator.variables.typos[0].issues).toContain("'primay' should be 'primary'");
        expect(validator.variables.typos[1].variable).toBe("seconary-color");
        expect(validator.variables.typos[1].issues).toContain("'seconary' should be 'secondary'");
      });

      it("should not flag correctly spelled variables", () => {
        validator.variables.definitions.set("primary-color", [
          { name: "primary-color", value: "#000", line: 1, file: "/test.css" },
        ]);
        validator.variables.definitions.set("secondary-color", [
          {
            name: "secondary-color",
            value: "#666",
            line: 2,
            file: "/test.css",
          },
        ]);

        validator.findTypos();

        expect(validator.variables.typos).toHaveLength(0);
      });
    });

    describe("generateReport", () => {
      it("should generate a comprehensive report", () => {
        // Set up some test data
        validator.variables.definitions.set("primary-color", [
          { name: "primary-color", value: "#000", line: 1, file: "/test.css" },
        ]);
        validator.variables.usage.set("primary-color", [
          {
            name: "primary-color",
            line: 2,
            file: "/test.css",
            context: "var(--primary-color)",
          },
        ]);
        validator.variables.missing.push({
          variable: "missing-var",
          usageCount: 1,
          files: ["/test.css"],
        });

        const report = validator.generateReport();

        expect(report).toContain("# CSS Variable Validation Report");
        expect(report).toContain("## Summary");
        expect(report).toContain("**Total Variable Definitions**: 1");
        expect(report).toContain("**Total Variable Usage**: 1");
        expect(report).toContain("- **Missing Variables**: 1");
        expect(report).toContain("## Missing Variable Definitions");
        expect(report).toContain("### ❌ `--missing-var`");
      });

      it("should handle empty validation results", () => {
        const report = validator.generateReport();

        expect(report).toContain("# CSS Variable Validation Report");
        expect(report).toContain("**Total Variable Definitions**: 0");
        expect(report).toContain("**Total Variable Usage**: 0");
        expect(report).toContain("- **Missing Variables**: 0");
      });
    });

    describe("hasErrors", () => {
      it("should return true when there are errors", () => {
        validator.errors.push("Test error");
        expect(validator.hasErrors()).toBe(true);
      });

      it("should return true when there are missing variables", () => {
        validator.variables.missing.push({
          variable: "missing-var",
          usageCount: 1,
          files: ["/test.css"],
        });
        expect(validator.hasErrors()).toBe(true);
      });

      it("should return false when there are only warnings", () => {
        validator.variables.unused.push({
          variable: "unused-var",
          definitionCount: 1,
          files: ["/test.css"],
        });
        expect(validator.hasErrors()).toBe(false);
      });

      it("should return false when validation passes", () => {
        expect(validator.hasErrors()).toBe(false);
      });
    });

    describe("getExitCode", () => {
      it("should return 1 for errors", () => {
        validator.errors.push("Test error");
        expect(validator.getExitCode()).toBe(1);
      });

      it("should return 2 for warnings in non-strict mode", () => {
        validator.variables.typos.push({
          variable: "typo-var",
          issues: ["Test typo"],
        });
        expect(validator.getExitCode()).toBe(2);
      });

      it("should return 0 for clean validation", () => {
        expect(validator.getExitCode()).toBe(0);
      });
    });

    describe("isLikelyExternalVariable", () => {
      it("should identify external variables correctly", () => {
        expect(validator.isLikelyExternalVariable("z-index")).toBe(true);
        expect(validator.isLikelyExternalVariable("shadow-sm")).toBe(true);
        expect(validator.isLikelyExternalVariable("transition-duration")).toBe(true);
        expect(validator.isLikelyExternalVariable("animation-name")).toBe(true);
        expect(validator.isLikelyExternalVariable("font-size")).toBe(true);
        expect(validator.isLikelyExternalVariable("spacing-md")).toBe(true);
        expect(validator.isLikelyExternalVariable("breakpoint-lg")).toBe(true);
      });

      it("should not identify regular variables as external", () => {
        expect(validator.isLikelyExternalVariable("primary-color")).toBe(false);
        expect(validator.isLikelyExternalVariable("text-color")).toBe(false);
        expect(validator.isLikelyExternalVariable("bg-color")).toBe(false);
      });
    });
  });

  describe("integration tests", () => {
    it("should handle a complete validation workflow", () => {
      const validator = new CSSVariableValidator({
        scanDirs: ["test"],
        verbose: false,
      });

      // Mock file system
      mockReadDirSync.mockReturnValueOnce(["test"]).mockReturnValueOnce(["styles.css"]);

      mockStatSync.mockReturnValueOnce({ isDirectory: () => true }).mockReturnValueOnce({ isDirectory: () => false });

      mockExistsSync.mockReturnValue(true);

      const cssContent = `:root {
  --primary-color: #007bff;
}

.button {
  background-color: var(--primary-color);
  color: var(--text-color);
}`;

      mockReadFileSync.mockReturnValue(cssContent);

      validator.analyze();

      expect(validator.variables.definitions.has("primary-color")).toBe(true);
      expect(validator.variables.usage.has("primary-color")).toBe(true);
      expect(validator.variables.usage.has("text-color")).toBe(true);
      expect(validator.variables.missing).toHaveLength(1);
      expect(validator.variables.missing[0].variable).toBe("text-color");
    });

    it("should handle file read errors gracefully", () => {
      const validator = new CSSVariableValidator();

      mockReadDirSync.mockReturnValueOnce(["test"]).mockReturnValueOnce(["styles.css"]);

      mockStatSync.mockReturnValueOnce({ isDirectory: () => true }).mockReturnValueOnce({ isDirectory: () => false });

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation(() => {
        throw new Error("Permission denied");
      });

      validator.analyze();

      expect(validator.errors).toHaveLength(1);
      expect(validator.errors[0]).toContain("Error reading");
    });
  });
});
