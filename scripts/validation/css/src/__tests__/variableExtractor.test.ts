/**
 * 🦊 Variable Extractor Tests
 * Test suite for CSS variable extraction functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { VariableExtractor } from "../variableExtractor.js";
import { FileManager } from "../fileManager.js";
import { CSSLogger } from "../logger.js";
import type { ValidatorConfig } from "../types.js";

// Mock file system
const mockFiles = new Map<string, string>();

vi.mock("fs", () => ({
  default: {
    readFileSync: vi.fn((path: string) => {
      const content = mockFiles.get(path);
      if (content === undefined) {
        throw new Error("File not found");
      }
      return content;
    }),
    existsSync: vi.fn((path: string) => mockFiles.has(path)),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
    mkdirSync: vi.fn(),
    copyFileSync: vi.fn(),
  },
  readFileSync: vi.fn((path: string) => {
    const content = mockFiles.get(path);
    if (content === undefined) {
      throw new Error("File not found");
    }
    return content;
  }),
  existsSync: vi.fn((path: string) => mockFiles.has(path)),
  readdirSync: vi.fn(),
  statSync: vi.fn(),
  mkdirSync: vi.fn(),
  copyFileSync: vi.fn(),
}));

describe("VariableExtractor", () => {
  let extractor: VariableExtractor;
  let fileManager: FileManager;
  let logger: CSSLogger;
  let config: ValidatorConfig;

  beforeEach(() => {
    mockFiles.clear();
    config = {
      scanDirs: ["packages"],
      criticalVariables: ["accent"],
      themeVariables: ["accent"],
      verbose: false,
    };
    logger = new CSSLogger(false);
    fileManager = new FileManager(config, logger);
    extractor = new VariableExtractor(fileManager, logger);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("extractVariables", () => {
    it("should extract single-line variable definitions", () => {
      const cssContent = `
        :root {
          --accent-color: #007acc;
          --bg-color: #ffffff;
        }
      `;
      mockFiles.set("/test/styles.css", cssContent);

      const result = extractor.extractVariables("/test/styles.css");

      expect(result.definitions).toHaveLength(2);
      expect(result.definitions[0]?.name).toBe("accent-color");
      expect(result.definitions[0]?.value).toBe("#007acc");
      expect(result.definitions[0]?.theme).toBe("default");
      expect(result.definitions[1]?.name).toBe("bg-color");
      expect(result.definitions[1]?.value).toBe("#ffffff");
    });

    it("should extract multi-line variable definitions", () => {
      const cssContent = `
        :root {
          --complex-gradient: linear-gradient(
            45deg,
            #007acc,
            #ffffff
          );
        }
      `;
      mockFiles.set("/test/styles.css", cssContent);

      const result = extractor.extractVariables("/test/styles.css");

      expect(result.definitions).toHaveLength(1);
      expect(result.definitions[0]?.name).toBe("complex-gradient");
      expect(result.definitions[0]?.value).toContain("linear-gradient");
      expect(result.definitions[0]?.value).toContain("#007acc");
    });

    it("should extract variable usage", () => {
      const cssContent = `
        .button {
          color: var(--accent-color);
          background: var(--bg-color);
        }
      `;
      mockFiles.set("/test/styles.css", cssContent);

      const result = extractor.extractVariables("/test/styles.css");

      expect(result.usage).toHaveLength(2);
      expect(result.usage[0]?.name).toBe("accent-color");
      expect(result.usage[1]?.name).toBe("bg-color");
    });

    it("should handle theme-specific variables", () => {
      const cssContent = `
        :root {
          --accent: #007acc;
        }
        
        :root[data-theme="dark"] {
          --accent: #00aaff;
        }
      `;
      mockFiles.set("/test/styles.css", cssContent);

      const result = extractor.extractVariables("/test/styles.css");

      expect(result.definitions).toHaveLength(2);
      expect(result.definitions[0]?.theme).toBe("default");
      expect(result.definitions[1]?.theme).toBe("dark");
      expect(result.themes.has("dark")).toBe(true);
    });

    it("should handle CSS imports", () => {
      const mainCss = `
        @import "variables.css";
        
        .button {
          color: var(--imported-var);
        }
      `;
      const variablesCss = `
        :root {
          --imported-var: #ff0000;
        }
      `;

      mockFiles.set("/test/main.css", mainCss);
      mockFiles.set("/test/variables.css", variablesCss);

      const result = extractor.extractVariables("/test/main.css");

      expect(result.imports).toHaveLength(1);
      expect(result.imports[0]?.originalPath).toBe("variables.css");
      expect(result.definitions).toHaveLength(1);
      expect(result.definitions[0]?.name).toBe("imported-var");
      expect(result.definitions[0]?.importedFrom).toBe("/test/variables.css");
    });

    it("should prevent circular imports", () => {
      const css1 = `
        @import "file2.css";
        :root { --var1: #000; }
      `;
      const css2 = `
        @import "file1.css";
        :root { --var2: #fff; }
      `;

      mockFiles.set("/test/file1.css", css1);
      mockFiles.set("/test/file2.css", css2);

      const result = extractor.extractVariables("/test/file1.css");

      // Should not cause infinite recursion and should process both files
      expect(result.definitions).toHaveLength(2);
      expect(result.definitions.some(d => d.name === "var1")).toBe(true);
      expect(result.definitions.some(d => d.name === "var2")).toBe(true);
    });

    it("should handle missing imported files gracefully", () => {
      const cssContent = `
        @import "missing.css";
        
        .button {
          color: var(--existing-var);
        }
      `;
      mockFiles.set("/test/styles.css", cssContent);

      const result = extractor.extractVariables("/test/styles.css");

      expect(result.imports).toHaveLength(1);
      expect(result.imports[0]?.originalPath).toBe("missing.css");
      // Should not crash and should continue processing
      expect(result.usage).toHaveLength(1);
    });
  });

  describe("extractFromFiles", () => {
    it("should extract variables from multiple files", () => {
      const css1 = `
        :root {
          --var1: #000;
        }
      `;
      const css2 = `
        :root {
          --var2: #fff;
        }
        .button {
          color: var(--var1);
        }
      `;

      mockFiles.set("/test/file1.css", css1);
      mockFiles.set("/test/file2.css", css2);

      const result = extractor.extractFromFiles(["/test/file1.css", "/test/file2.css"]);

      expect(result.definitions.size).toBe(2);
      expect(result.definitions.has("var1")).toBe(true);
      expect(result.definitions.has("var2")).toBe(true);
      expect(result.usage.size).toBe(1);
      expect(result.usage.has("var1")).toBe(true);
    });

    it("should handle file reading errors gracefully", () => {
      mockFiles.set("/test/good.css", ":root { --good: #000; }");
      // Don't add bad.css to mockFiles to simulate read error

      const result = extractor.extractFromFiles(["/test/good.css", "/test/bad.css"]);

      expect(result.definitions.size).toBe(1);
      expect(result.definitions.has("good")).toBe(true);
    });
  });

  describe("getFileStatistics", () => {
    it("should return correct statistics for a file", () => {
      const cssContent = `
        :root {
          --var1: #000;
          --var2: #fff;
        }
        
        .button {
          color: var(--var1);
        }
        
        :root[data-theme="dark"] {
          --var1: #333;
        }
      `;
      mockFiles.set("/test/styles.css", cssContent);

      const stats = extractor.getFileStatistics("/test/styles.css");

      expect(stats.definitions).toBe(3); // var1 (default), var2, var1 (dark)
      expect(stats.usage).toBe(1);
      expect(stats.themes).toBe(1); // dark theme
      expect(stats.imports).toBe(0);
    });
  });

  describe("isLikelyExternalVariable", () => {
    it("should identify external variables correctly", () => {
      expect(extractor.isLikelyExternalVariable("z-index")).toBe(true);
      expect(extractor.isLikelyExternalVariable("shadow-sm")).toBe(true);
      expect(extractor.isLikelyExternalVariable("transition-fast")).toBe(true);
      expect(extractor.isLikelyExternalVariable("animation-fade")).toBe(true);
      expect(extractor.isLikelyExternalVariable("font-size")).toBe(true);
      expect(extractor.isLikelyExternalVariable("spacing-sm")).toBe(true);
      expect(extractor.isLikelyExternalVariable("breakpoint-md")).toBe(true);
    });

    it("should not identify regular variables as external", () => {
      expect(extractor.isLikelyExternalVariable("accent-color")).toBe(false);
      expect(extractor.isLikelyExternalVariable("bg-primary")).toBe(false);
      expect(extractor.isLikelyExternalVariable("text-color")).toBe(false);
      expect(extractor.isLikelyExternalVariable("border-radius")).toBe(false);
    });
  });
});
