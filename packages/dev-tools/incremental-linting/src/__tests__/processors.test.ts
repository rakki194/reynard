/**
 * 🦊 Tests for Linting Processors
 *
 * Test the LintingProcessors collection functionality.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { LintingProcessors } from "../processors.js";
import type { LintingProcessor, LintResult, LinterConfig } from "../types.js";

// Mock processor for testing
class MockProcessor implements LintingProcessor {
  constructor(
    public config: LinterConfig,
    private canProcessResult: boolean = true,
    private processResult: LintResult = {
      filePath: "/test/file.ts",
      issues: [],
      success: true,
      duration: 100,
      linter: "mock",
      timestamp: Date.now(),
    }
  ) {}

  async process(filePath: string): Promise<LintResult> {
    return { ...this.processResult, filePath };
  }

  canProcess(filePath: string): boolean {
    return this.canProcessResult;
  }

  getLinterName(): string {
    return this.config.name;
  }
}

describe("LintingProcessors", () => {
  let processors: LintingProcessors;
  let mockProcessor1: MockProcessor;
  let mockProcessor2: MockProcessor;

  beforeEach(() => {
    processors = new LintingProcessors();

    mockProcessor1 = new MockProcessor({
      name: "eslint",
      enabled: true,
      command: "eslint",
      args: [],
      patterns: ["**/*.ts"],
      excludePatterns: [],
      maxFileSize: 1024,
      timeout: 30000,
    });

    mockProcessor2 = new MockProcessor({
      name: "prettier",
      enabled: true,
      command: "prettier",
      args: [],
      patterns: ["**/*.ts"],
      excludePatterns: [],
      maxFileSize: 1024,
      timeout: 30000,
    });
  });

  describe("register", () => {
    it("should register a processor", () => {
      processors.register("eslint", mockProcessor1);

      expect(processors.size()).toBe(1);
      expect(processors.get("eslint")).toBe(mockProcessor1);
    });

    it("should allow registering multiple processors", () => {
      processors.register("eslint", mockProcessor1);
      processors.register("prettier", mockProcessor2);

      expect(processors.size()).toBe(2);
      expect(processors.get("eslint")).toBe(mockProcessor1);
      expect(processors.get("prettier")).toBe(mockProcessor2);
    });

    it("should overwrite existing processor with same name", () => {
      const newProcessor = new MockProcessor({
        name: "eslint-v2",
        enabled: true,
        command: "eslint",
        args: [],
        patterns: ["**/*.ts"],
        excludePatterns: [],
        maxFileSize: 1024,
        timeout: 30000,
      });

      processors.register("eslint", mockProcessor1);
      processors.register("eslint", newProcessor);

      expect(processors.size()).toBe(1);
      expect(processors.get("eslint")).toBe(newProcessor);
    });
  });

  describe("get", () => {
    it("should return undefined for non-existent processor", () => {
      expect(processors.get("nonexistent")).toBeUndefined();
    });

    it("should return registered processor", () => {
      processors.register("eslint", mockProcessor1);

      const retrieved = processors.get("eslint");
      expect(retrieved).toBe(mockProcessor1);
    });
  });

  describe("getAll", () => {
    it("should return empty map when no processors registered", () => {
      const all = processors.getAll();
      expect(all.size).toBe(0);
    });

    it("should return copy of all processors", () => {
      processors.register("eslint", mockProcessor1);
      processors.register("prettier", mockProcessor2);

      const all = processors.getAll();
      expect(all.size).toBe(2);
      expect(all.get("eslint")).toBe(mockProcessor1);
      expect(all.get("prettier")).toBe(mockProcessor2);

      // Should be a copy, not the original map
      expect(all).not.toBe(processors["processors"]);
    });
  });

  describe("getProcessorsForFile", () => {
    it("should return empty array when no processors registered", () => {
      const applicable = processors.getProcessorsForFile("/test/file.ts");
      expect(applicable).toEqual([]);
    });

    it("should return processors that can handle the file", () => {
      const canProcessProcessor = new MockProcessor(
        {
          name: "can-process",
          enabled: true,
          command: "test",
          args: [],
          patterns: ["**/*.ts"],
          excludePatterns: [],
          maxFileSize: 1024,
          timeout: 30000,
        },
        true
      );

      const cannotProcessProcessor = new MockProcessor(
        {
          name: "cannot-process",
          enabled: true,
          command: "test",
          args: [],
          patterns: ["**/*.ts"],
          excludePatterns: [],
          maxFileSize: 1024,
          timeout: 30000,
        },
        false
      );

      processors.register("can-process", canProcessProcessor);
      processors.register("cannot-process", cannotProcessProcessor);

      const applicable = processors.getProcessorsForFile("/test/file.ts");
      expect(applicable).toHaveLength(1);
      expect(applicable[0]).toBe(canProcessProcessor);
    });

    it("should return multiple processors that can handle the file", () => {
      const processor1 = new MockProcessor(
        {
          name: "processor1",
          enabled: true,
          command: "test",
          args: [],
          patterns: ["**/*.ts"],
          excludePatterns: [],
          maxFileSize: 1024,
          timeout: 30000,
        },
        true
      );

      const processor2 = new MockProcessor(
        {
          name: "processor2",
          enabled: true,
          command: "test",
          args: [],
          patterns: ["**/*.ts"],
          excludePatterns: [],
          maxFileSize: 1024,
          timeout: 30000,
        },
        true
      );

      processors.register("processor1", processor1);
      processors.register("processor2", processor2);

      const applicable = processors.getProcessorsForFile("/test/file.ts");
      expect(applicable).toHaveLength(2);
      expect(applicable).toContain(processor1);
      expect(applicable).toContain(processor2);
    });
  });

  describe("remove", () => {
    it("should return false for non-existent processor", () => {
      const removed = processors.remove("nonexistent");
      expect(removed).toBe(false);
    });

    it("should remove existing processor and return true", () => {
      processors.register("eslint", mockProcessor1);
      expect(processors.size()).toBe(1);

      const removed = processors.remove("eslint");
      expect(removed).toBe(true);
      expect(processors.size()).toBe(0);
      expect(processors.get("eslint")).toBeUndefined();
    });

    it("should not affect other processors when removing one", () => {
      processors.register("eslint", mockProcessor1);
      processors.register("prettier", mockProcessor2);
      expect(processors.size()).toBe(2);

      const removed = processors.remove("eslint");
      expect(removed).toBe(true);
      expect(processors.size()).toBe(1);
      expect(processors.get("eslint")).toBeUndefined();
      expect(processors.get("prettier")).toBe(mockProcessor2);
    });
  });

  describe("clear", () => {
    it("should clear all processors", () => {
      processors.register("eslint", mockProcessor1);
      processors.register("prettier", mockProcessor2);
      expect(processors.size()).toBe(2);

      processors.clear();
      expect(processors.size()).toBe(0);
      expect(processors.get("eslint")).toBeUndefined();
      expect(processors.get("prettier")).toBeUndefined();
    });

    it("should work when no processors are registered", () => {
      expect(processors.size()).toBe(0);
      processors.clear();
      expect(processors.size()).toBe(0);
    });
  });

  describe("size", () => {
    it("should return 0 for empty collection", () => {
      expect(processors.size()).toBe(0);
    });

    it("should return correct count after registering processors", () => {
      expect(processors.size()).toBe(0);

      processors.register("eslint", mockProcessor1);
      expect(processors.size()).toBe(1);

      processors.register("prettier", mockProcessor2);
      expect(processors.size()).toBe(2);
    });

    it("should return correct count after removing processors", () => {
      processors.register("eslint", mockProcessor1);
      processors.register("prettier", mockProcessor2);
      expect(processors.size()).toBe(2);

      processors.remove("eslint");
      expect(processors.size()).toBe(1);

      processors.remove("prettier");
      expect(processors.size()).toBe(0);
    });
  });

  describe("integration", () => {
    it("should work with real processor methods", async () => {
      const processor = new MockProcessor({
        name: "test-processor",
        enabled: true,
        command: "test",
        args: [],
        patterns: ["**/*.ts"],
        excludePatterns: [],
        maxFileSize: 1024,
        timeout: 30000,
      });

      processors.register("test", processor);

      const canProcess = processor.canProcess("/test/file.ts");
      expect(canProcess).toBe(true);

      const result = await processor.process("/test/file.ts");
      expect(result.filePath).toBe("/test/file.ts");
      expect(result.linter).toBe("mock");

      const applicable = processors.getProcessorsForFile("/test/file.ts");
      expect(applicable).toHaveLength(1);
      expect(applicable[0]).toBe(processor);
    });
  });
});
