/**
 * Test suite for validate-css-variables.js (Refactored)
 *
 * Tests the CSS variable validation functionality including
 * file discovery, variable extraction, and validation logic.
 */

import fs from "fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CSSVariableValidator from "./validate-css-variables-refactored.js";

// Mock fs module
vi.mock("fs");

describe("validate-css-variables.js (Refactored)", () => {
  let mockReadFileSync;
  let mockStatSync;
  let mockReadDirSync;
  let mockExistsSync;
  let mockWriteFileSync;

  beforeEach(() => {
    mockReadFileSync = vi.mocked(fs.readFileSync);
    mockStatSync = vi.mocked(fs.statSync);
    mockReadDirSync = vi.mocked(fs.readdirSync);
    mockExistsSync = vi.mocked(fs.existsSync);
    mockWriteFileSync = vi.mocked(fs.writeFileSync);

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

        mockStatSync.mockReturnValue({
          isDirectory: () => false,
          isFile: () => true,
        });

        mockExistsSync.mockReturnValue(true);

        const cssFiles = validator.findCSSFiles("/test/project");

        expect(cssFiles).toHaveLength(3);
        expect(cssFiles).toContain("/test/project/packages/styles.css");
        expect(cssFiles).toContain("/test/project/packages/theme.css");
        expect(cssFiles).toContain("/test/project/packages/components.css");
      });

      it("should skip directories that don't exist", () => {
        mockExistsSync.mockReturnValue(false);

        const cssFiles = validator.findCSSFiles("/test/project");

        expect(cssFiles).toHaveLength(0);
      });

      it("should handle nested directories", () => {
        // Mock nested directory structure
        mockExistsSync.mockReturnValue(true);
        mockReadDirSync
          .mockReturnValueOnce(["components", "styles.css"]) // First level
          .mockReturnValueOnce(["button.css", "input.css"]); // Second level

        mockStatSync
          .mockReturnValueOnce({ isDirectory: () => true, isFile: () => false }) // components directory
          .mockReturnValueOnce({ isDirectory: () => false, isFile: () => true }) // styles.css
          .mockReturnValueOnce({ isDirectory: () => false, isFile: () => true }) // button.css
          .mockReturnValueOnce({ isDirectory: () => false, isFile: () => true }); // input.css

        const cssFiles = validator.findCSSFiles("/test/project");

        expect(cssFiles).toHaveLength(3);
        expect(cssFiles).toContain("/test/project/packages/styles.css");
        expect(cssFiles).toContain("/test/project/packages/components/button.css");
        expect(cssFiles).toContain("/test/project/packages/components/input.css");
      });

      it("should skip ignored directories", () => {
        mockExistsSync.mockReturnValue(true);
        mockReadDirSync.mockReturnValueOnce(["styles.css", "node_modules"]);

        mockStatSync
          .mockReturnValueOnce({ isDirectory: () => false, isFile: () => true }) // styles.css
          .mockReturnValueOnce({ isDirectory: () => true, isFile: () => false }); // node_modules

        const cssFiles = validator.findCSSFiles("/test/project");

        expect(cssFiles).toHaveLength(1);
        expect(cssFiles).toContain("/test/project/packages/styles.css");
        expect(cssFiles).not.toContain("/test/project/packages/node_modules");
      });
    });

    describe("extractVariables", () => {
      it("should extract CSS variable definitions", () => {
        const cssContent = `
          :root {
            --primary-color: #007bff;
            --secondary-color: #6c757d;
            --font-size: 16px;
          }
        `;

        mockReadFileSync.mockReturnValue(cssContent);

        const result = validator.extractVariables("/test/styles.css");

        expect(result.definitions).toHaveLength(3);
        expect(result.definitions[0]).toMatchObject({
          name: "primary-color",
          value: "#007bff",
          theme: "default",
          file: "/test/styles.css",
        });
        expect(result.definitions[1]).toMatchObject({
          name: "secondary-color",
          value: "#6c757d",
          theme: "default",
          file: "/test/styles.css",
        });
        expect(result.definitions[2]).toMatchObject({
          name: "font-size",
          value: "16px",
          theme: "default",
          file: "/test/styles.css",
        });
      });

      it("should extract CSS variable usage", () => {
        const cssContent = `
          .button {
            background-color: var(--primary-color);
            color: var(--text-color);
            font-size: var(--font-size);
          }
        `;

        mockReadFileSync.mockReturnValue(cssContent);

        const result = validator.extractVariables("/test/styles.css");

        expect(result.usage).toHaveLength(3);
        expect(result.usage[0]).toMatchObject({
          name: "primary-color",
          file: "/test/styles.css",
        });
        expect(result.usage[1]).toMatchObject({
          name: "text-color",
          file: "/test/styles.css",
        });
        expect(result.usage[2]).toMatchObject({
          name: "font-size",
          file: "/test/styles.css",
        });
      });

      it("should handle theme-specific variables", () => {
        const cssContent = `
          :root {
            --primary-color: #007bff;
          }

          :root[data-theme="dark"] {
            --primary-color: #0d6efd;
          }

          :root[data-theme="light"] {
            --primary-color: #0056b3;
          }
        `;

        mockReadFileSync.mockReturnValue(cssContent);

        const result = validator.extractVariables("/test/styles.css");

        expect(result.definitions).toHaveLength(3);
        expect(result.definitions[0]).toMatchObject({
          name: "primary-color",
          value: "#007bff",
          theme: "default",
        });
        expect(result.definitions[1]).toMatchObject({
          name: "primary-color",
          value: "#0d6efd",
          theme: "dark",
        });
        expect(result.definitions[2]).toMatchObject({
          name: "primary-color",
          value: "#0056b3",
          theme: "light",
        });
      });

      it("should handle multi-line variable definitions", () => {
        const cssContent = `
          :root {
            --complex-gradient: linear-gradient(
              45deg,
              #ff6b6b,
              #4ecdc4
            );
          }
        `;

        mockReadFileSync.mockReturnValue(cssContent);

        const result = validator.extractVariables("/test/styles.css");

        expect(result.definitions).toHaveLength(1);
        expect(result.definitions[0]).toMatchObject({
          name: "complex-gradient",
          value: "linear-gradient(45deg, #ff6b6b, #4ecdc4)",
          theme: "default",
        });
      });

      it("should handle CSS imports", () => {
        const mainCssContent = `
          @import "variables.css";

          .button {
            background-color: var(--primary-color);
          }
        `;

        const variablesCssContent = `
          :root {
            --primary-color: #007bff;
          }
        `;

        mockReadFileSync.mockReturnValueOnce(mainCssContent).mockReturnValueOnce(variablesCssContent);

        mockExistsSync.mockReturnValue(true);

        const result = validator.extractVariables("/test/main.css");

        expect(result.definitions).toHaveLength(1);
        expect(result.definitions[0]).toMatchObject({
          name: "primary-color",
          value: "#007bff",
          importedFrom: "/test/variables.css",
          importedVia: "/test/main.css",
        });
      });

      it("should prevent circular imports", () => {
        const cssContent = `
          @import "self.css";

          :root {
            --primary-color: #007bff;
          }
        `;

        mockReadFileSync.mockReturnValue(cssContent);
        mockExistsSync.mockReturnValue(true);

        const result = validator.extractVariables("/test/self.css");

        expect(result.definitions).toHaveLength(1);
        expect(result.definitions[0]).toMatchObject({
          name: "primary-color",
          value: "#007bff",
        });
      });
    });

    describe("analyze", () => {
      it("should analyze CSS files and find issues", () => {
        const cssContent1 = `
          :root {
            --primary-color: #007bff;
          }
        `;

        const cssContent2 = `
          .button {
            background-color: var(--primary-color);
            color: var(--missing-color);
          }
        `;

        mockReadFileSync.mockReturnValueOnce(cssContent1).mockReturnValueOnce(cssContent2);

        mockExistsSync.mockReturnValue(true);
        mockReadDirSync.mockReturnValue(["styles1.css", "styles2.css"]);
        mockStatSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });

        validator.analyze();

        expect(validator.variables.definitions.size).toBe(1);
        expect(validator.variables.usage.size).toBe(2);
        expect(validator.variables.missing).toHaveLength(1);
        expect(validator.variables.missing[0]).toMatchObject({
          variable: "missing-color",
          usageCount: 1,
        });
      });

      it("should find unused variables", () => {
        const cssContent = `
          :root {
            --primary-color: #007bff;
            --unused-color: #6c757d;
          }

          .button {
            background-color: var(--primary-color);
          }
        `;

        mockReadFileSync.mockReturnValue(cssContent);
        mockExistsSync.mockReturnValue(true);
        mockReadDirSync.mockReturnValue(["styles.css"]);
        mockStatSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });

        validator.analyze();

        expect(validator.variables.unused).toHaveLength(1);
        expect(validator.variables.unused[0]).toMatchObject({
          variable: "unused-color",
          definitionCount: 1,
        });
      });

      it("should find potential typos", () => {
        const cssContent = `
          :root {
            --primay-color: #007bff;
            --seconary-color: #6c757d;
          }

          .button {
            background-color: var(--primay-color);
            color: var(--seconary-color);
          }
        `;

        mockReadFileSync.mockReturnValue(cssContent);
        mockExistsSync.mockReturnValue(true);
        mockReadDirSync.mockReturnValue(["styles.css"]);
        mockStatSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });

        validator.analyze();

        expect(validator.variables.typos).toHaveLength(2);
        expect(validator.variables.typos[0]).toMatchObject({
          variable: "primay-color",
          issues: ["'primay' should be 'primary'"],
        });
        expect(validator.variables.typos[1]).toMatchObject({
          variable: "seconary-color",
          issues: ["'seconary' should be 'secondary'"],
        });
      });
    });

    describe("generateReport", () => {
      it("should generate a comprehensive report", () => {
        // Set up some test data
        validator.variables.definitions.set("primary-color", [
          { name: "primary-color", value: "#007bff", file: "/test/styles.css" },
        ]);
        validator.variables.usage.set("primary-color", [{ name: "primary-color", file: "/test/styles.css" }]);
        validator.variables.missing = [{ variable: "missing-color", usageCount: 1, files: ["/test/styles.css"] }];
        validator.variables.unused = [{ variable: "unused-color", definitionCount: 1, files: ["/test/styles.css"] }];
        validator.variables.typos = [{ variable: "primay-color", issues: ["'primay' should be 'primary'"] }];

        const report = validator.generateReport();

        expect(report).toContain("# CSS Variable Validation Report");
        expect(report).toContain("## Summary");
        expect(report).toContain("## Missing Variable Definitions");
        expect(report).toContain("## Unused Variable Definitions");
        expect(report).toContain("## Potential Typos");
        expect(report).toContain("--missing-color");
        expect(report).toContain("--unused-color");
        expect(report).toContain("--primay-color");
      });
    });

    describe("hasErrors", () => {
      it("should return true when there are errors", () => {
        validator.errors = ["Test error"];
        expect(validator.hasErrors()).toBe(true);
      });

      it("should return true when there are missing variables", () => {
        validator.variables.missing = [{ variable: "missing", usageCount: 1, files: [] }];
        expect(validator.hasErrors()).toBe(true);
      });

      it("should return false when there are no errors", () => {
        expect(validator.hasErrors()).toBe(false);
      });
    });

    describe("getExitCode", () => {
      it("should return 1 when there are errors", () => {
        validator.errors = ["Test error"];
        expect(validator.getExitCode()).toBe(1);
      });

      it("should return 2 when there are warnings", () => {
        validator.variables.typos = [{ variable: "test", issues: ["typo"] }];
        expect(validator.getExitCode()).toBe(2);
      });

      it("should return 0 when there are no issues", () => {
        expect(validator.getExitCode()).toBe(0);
      });
    });
  });

  describe("Integration Tests", () => {
    it("should handle a complete CSS project", () => {
      const mainCssContent = `
        @import "variables.css";
        @import "components.css";

        body {
          font-family: var(--font-family);
          color: var(--text-color);
        }
      `;

      const variablesCssContent = `
        :root {
          --primary-color: #007bff;
          --text-color: #333;
          --font-family: Arial, sans-serif;
        }
      `;

      const componentsCssContent = `
        .button {
          background-color: var(--primary-color);
          color: var(--button-text-color);
        }
      `;

      mockReadFileSync
        .mockReturnValueOnce(mainCssContent)
        .mockReturnValueOnce(variablesCssContent)
        .mockReturnValueOnce(componentsCssContent);

      mockExistsSync.mockReturnValue(true);
      mockReadDirSync.mockReturnValue(["main.css"]);
      mockStatSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });

      const validator = new CSSVariableValidator();
      validator.analyze();

      expect(validator.variables.definitions.size).toBe(3);
      expect(validator.variables.usage.size).toBe(4);
      expect(validator.variables.missing).toHaveLength(1);
      expect(validator.variables.missing[0].variable).toBe("button-text-color");
    });
  });
});
