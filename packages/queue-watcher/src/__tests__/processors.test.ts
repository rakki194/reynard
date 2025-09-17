/**
 * 🦊 Processors Tests
 *
 * Comprehensive tests for all processor functions.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Processors } from "../processors.js";
import { mockExecSync } from "./setup.js";
import { createTestFile } from "./test-utils.js";

describe("Processors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecSync.mockReturnValue(Buffer.from("Mock command output"));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("waitForStable", () => {
    it("should wait for the specified delay", async () => {
      const startTime = Date.now();
      const filePath = createTestFile("/test/file.md");

      await Processors.waitForStable(filePath, { delay: 100 });

      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });

    it("should use default delay when not specified", async () => {
      const startTime = Date.now();
      const filePath = createTestFile("/test/file.md");

      await Processors.waitForStable(filePath);

      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(500); // Default delay
    });

    it("should handle custom delay options", async () => {
      const startTime = Date.now();
      const filePath = createTestFile("/test/file.md");

      await Processors.waitForStable(filePath, { delay: 50 });

      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(40); // Allow some tolerance
    });
  });

  describe("validateSentenceLength", () => {
    it("should execute sentence length validation command", async () => {
      const filePath = createTestFile("/test/file.md");

      await Processors.validateSentenceLength(filePath);

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining("validate-sentence-length.js"),
        expect.objectContaining({
          stdio: "inherit",
          cwd: expect.any(String),
        })
      );
    });

    it("should include the file path in the command", async () => {
      const filePath = createTestFile("/test/file.md");

      await Processors.validateSentenceLength(filePath);

      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining(filePath), expect.any(Object));
    });

    it("should throw error when validation fails", async () => {
      const filePath = createTestFile("/test/file.md");
      mockExecSync.mockImplementation(() => {
        throw new Error("Validation failed");
      });

      await expect(Processors.validateSentenceLength(filePath)).rejects.toThrow("Validation failed");
    });
  });

  describe("validateToC", () => {
    it("should execute ToC validation command", async () => {
      const filePath = createTestFile("/test/file.md");

      await Processors.validateToC(filePath);

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining("validate-markdown-toc.js"),
        expect.objectContaining({
          stdio: "inherit",
          cwd: expect.any(String),
        })
      );
    });

    it("should include the file path in the command", async () => {
      const filePath = createTestFile("/test/file.md");

      await Processors.validateToC(filePath);

      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining(filePath), expect.any(Object));
    });

    it("should throw error when validation fails", async () => {
      const filePath = createTestFile("/test/file.md");
      mockExecSync.mockImplementation(() => {
        throw new Error("ToC validation failed");
      });

      await expect(Processors.validateToC(filePath)).rejects.toThrow("ToC validation failed");
    });
  });

  describe("validateLinks", () => {
    it("should execute link validation command", async () => {
      const filePath = createTestFile("/test/file.md");

      await Processors.validateLinks(filePath);

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining("validate-markdown-links.js"),
        expect.objectContaining({
          stdio: "inherit",
          cwd: expect.any(String),
        })
      );
    });

    it("should include the file path in the command", async () => {
      const filePath = createTestFile("/test/file.md");

      await Processors.validateLinks(filePath);

      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining(filePath), expect.any(Object));
    });

    it("should throw error when validation fails", async () => {
      const filePath = createTestFile("/test/file.md");
      mockExecSync.mockImplementation(() => {
        throw new Error("Link validation failed");
      });

      await expect(Processors.validateLinks(filePath)).rejects.toThrow("Link validation failed");
    });
  });

  describe("formatWithPrettier", () => {
    it("should execute Prettier formatting command", async () => {
      const filePath = createTestFile("/test/file.ts");

      await Processors.formatWithPrettier(filePath);

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining("prettier --write"),
        expect.objectContaining({
          stdio: "inherit",
          cwd: expect.any(String),
        })
      );
    });

    it("should include the file path in the command", async () => {
      const filePath = createTestFile("/test/file.ts");

      await Processors.formatWithPrettier(filePath);

      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining(filePath), expect.any(Object));
    });

    it("should not throw error when Prettier fails", async () => {
      const filePath = createTestFile("/test/file.ts");
      mockExecSync.mockImplementation(() => {
        throw new Error("Prettier not found");
      });

      // Should not throw - Prettier is optional
      await expect(Processors.formatWithPrettier(filePath)).resolves.toBeUndefined();
    });
  });

  describe("fixWithESLint", () => {
    it("should execute ESLint fix command", async () => {
      const filePath = createTestFile("/test/file.ts");

      await Processors.fixWithESLint(filePath);

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining("eslint --fix"),
        expect.objectContaining({
          stdio: "inherit",
          cwd: expect.any(String),
        })
      );
    });

    it("should include the file path in the command", async () => {
      const filePath = createTestFile("/test/file.ts");

      await Processors.fixWithESLint(filePath);

      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining(filePath), expect.any(Object));
    });

    it("should not throw error when ESLint fails", async () => {
      const filePath = createTestFile("/test/file.ts");
      mockExecSync.mockImplementation(() => {
        throw new Error("ESLint not found");
      });

      // Should not throw - ESLint is optional
      await expect(Processors.fixWithESLint(filePath)).resolves.toBeUndefined();
    });
  });

  describe("validatePython", () => {
    it("should execute Python validation command", async () => {
      const filePath = createTestFile("/test/script.py");

      await Processors.validatePython(filePath);

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining("validate_python.py"),
        expect.objectContaining({
          stdio: "inherit",
          cwd: expect.any(String),
        })
      );
    });

    it("should include the file path in the command", async () => {
      const filePath = createTestFile("/test/script.py");

      await Processors.validatePython(filePath);

      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining(filePath), expect.any(Object));
    });

    it("should throw error when validation fails", async () => {
      const filePath = createTestFile("/test/script.py");
      mockExecSync.mockImplementation(() => {
        throw new Error("Python validation failed");
      });

      await expect(Processors.validatePython(filePath)).rejects.toThrow("Python validation failed");
    });
  });

  describe("processor error handling", () => {
    it("should handle execSync errors with proper error messages", async () => {
      const filePath = createTestFile("/test/file.md");
      const originalError = new Error("Command failed");
      mockExecSync.mockImplementation(() => {
        throw originalError;
      });

      await expect(Processors.validateSentenceLength(filePath)).rejects.toThrow("Command failed");
    });

    it("should handle non-Error exceptions", async () => {
      const filePath = createTestFile("/test/file.md");
      mockExecSync.mockImplementation(() => {
        throw "String error";
      });

      await expect(Processors.validateSentenceLength(filePath)).rejects.toThrow("String error");
    });
  });

  describe("processor options", () => {
    it("should pass options to processors that support them", async () => {
      const filePath = createTestFile("/test/file.md");
      const options = { delay: 100, customOption: "test" };

      await Processors.waitForStable(filePath, options);

      // waitForStable should use the delay option
      // Other processors ignore unknown options
    });

    it("should handle undefined options", async () => {
      const filePath = createTestFile("/test/file.md");

      await expect(Processors.waitForStable(filePath, undefined)).resolves.toBeUndefined();
    });
  });

  describe("processor consistency", () => {
    it("should have consistent function signatures", () => {
      const filePath = "/test/file.md";
      const options = { delay: 100 };

      // All processors should accept filePath and optional options
      expect(typeof Processors.waitForStable).toBe("function");
      expect(typeof Processors.validateSentenceLength).toBe("function");
      expect(typeof Processors.validateToC).toBe("function");
      expect(typeof Processors.validateLinks).toBe("function");
      expect(typeof Processors.formatWithPrettier).toBe("function");
      expect(typeof Processors.fixWithESLint).toBe("function");
      expect(typeof Processors.validatePython).toBe("function");
    });

    it("should return promises", () => {
      const filePath = createTestFile("/test/file.md");

      expect(Processors.waitForStable(filePath)).toBeInstanceOf(Promise);
      expect(Processors.validateSentenceLength(filePath)).toBeInstanceOf(Promise);
      expect(Processors.validateToC(filePath)).toBeInstanceOf(Promise);
      expect(Processors.validateLinks(filePath)).toBeInstanceOf(Promise);
      expect(Processors.formatWithPrettier(filePath)).toBeInstanceOf(Promise);
      expect(Processors.fixWithESLint(filePath)).toBeInstanceOf(Promise);
      expect(Processors.validatePython(filePath)).toBeInstanceOf(Promise);
    });
  });
});
