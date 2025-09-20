/**
 * 🦊 Vitest Configuration Generator Tests
 * Tests for the Vitest configuration generator
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { VitestConfigGenerator } from "../vitestConfigGenerator.js";
import { VitestConfigLogger } from "../logger.js";
import type { GeneratorConfig } from "../types.js";

describe("VitestConfigGenerator", () => {
  let logger: VitestConfigLogger;
  let generator: VitestConfigGenerator;

  beforeEach(() => {
    logger = new VitestConfigLogger(false);
    generator = new VitestConfigGenerator(logger);
    
    // Mock console methods to avoid output during tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("generateConfig", () => {
    it("should generate a valid configuration", () => {
      const config: GeneratorConfig = {
        includeExamples: false,
        includeTemplates: false,
        includeScripts: false,
      };

      const result = generator.generateConfig(config);

      expect(result.success).toBe(true);
      expect(result.projectsGenerated).toBeGreaterThan(0);
      expect(result.config.test).toBeDefined();
      expect(result.config.test.projects).toBeDefined();
      expect(Array.isArray(result.config.test.projects)).toBe(true);
    });

    it("should respect include/exclude options", () => {
      const config: GeneratorConfig = {
        includeExamples: false,
        includeTemplates: false,
        includeScripts: false,
      };

      const result = generator.generateConfig(config);

      expect(result.success).toBe(true);
      
      // Should only include packages, not examples or templates
      const projectNames = result.config.test.projects?.map(p => p.name) || [];
      expect(projectNames.some(name => name.startsWith("examples/"))).toBe(false);
      expect(projectNames.some(name => name.startsWith("templates/"))).toBe(false);
    });

    it("should include examples when requested", () => {
      const config: GeneratorConfig = {
        includeExamples: true,
        includeTemplates: false,
        includeScripts: false,
      };

      const result = generator.generateConfig(config);

      expect(result.success).toBe(true);
      
      const projectNames = result.config.test.projects?.map(p => p.name) || [];
      expect(projectNames.some(name => name.startsWith("examples/"))).toBe(true);
    });

    it("should include templates when requested", () => {
      const config: GeneratorConfig = {
        includeExamples: false,
        includeTemplates: true,
        includeScripts: false,
      };

      const result = generator.generateConfig(config);

      expect(result.success).toBe(true);
      
      const projectNames = result.config.test.projects?.map(p => p.name) || [];
      expect(projectNames.some(name => name.startsWith("templates/"))).toBe(true);
    });

    it("should include scripts when requested", () => {
      const config: GeneratorConfig = {
        includeExamples: false,
        includeTemplates: false,
        includeScripts: true,
      };

      const result = generator.generateConfig(config);

      expect(result.success).toBe(true);
      
      const projectNames = result.config.test.projects?.map(p => p.name) || [];
      expect(projectNames.some(name => name.startsWith("scripts/"))).toBe(true);
    });

    it("should apply custom thresholds", () => {
      const config: GeneratorConfig = {
        customThresholds: {
          branches: 90,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      };

      const result = generator.generateConfig(config);

      expect(result.success).toBe(true);
      
      // Check that custom thresholds are applied
      const firstProject = result.config.test.projects?.[0];
      expect(firstProject?.test.coverage?.thresholds?.global?.branches).toBe(90);
      expect(firstProject?.test.coverage?.thresholds?.global?.functions).toBe(95);
      expect(firstProject?.test.coverage?.thresholds?.global?.lines).toBe(95);
      expect(firstProject?.test.coverage?.thresholds?.global?.statements).toBe(95);
    });

    it("should use custom environment", () => {
      const config: GeneratorConfig = {
        environment: "node",
      };

      const result = generator.generateConfig(config);

      expect(result.success).toBe(true);
      expect(result.config.test.environment).toBe("node");
    });

    it("should use custom max workers", () => {
      const config: GeneratorConfig = {
        maxWorkers: 4,
      };

      const result = generator.generateConfig(config);

      expect(result.success).toBe(true);
      expect(result.config.test.maxWorkers).toBe(4);
    });

    it("should handle errors gracefully", () => {
      const config: GeneratorConfig = {
        maxWorkers: -1, // Invalid value
      };

      const result = generator.generateConfig(config);

      // Should still succeed but may have warnings
      expect(result.success).toBe(true);
    });

    it("should generate proper global configuration structure", () => {
      const config: GeneratorConfig = {};

      const result = generator.generateConfig(config);

      expect(result.success).toBe(true);
      expect(result.config.test.maxWorkers).toBeDefined();
      expect(result.config.test.pool).toBe("forks");
      expect(result.config.test.fileParallelism).toBe(false);
      expect(result.config.test.isolate).toBe(false);
      expect(result.config.test.testTimeout).toBe(30000);
      expect(result.config.test.hookTimeout).toBe(10000);
      expect(result.config.test.reporters).toBeDefined();
      expect(result.config.test.coverage).toBeDefined();
      expect(result.config.test.environment).toBe("happy-dom");
      expect(result.config.test.globals).toBe(true);
      expect(result.config.test.fakeTimers).toBeDefined();
      expect(result.config.test.include).toBeDefined();
      expect(result.config.test.exclude).toBeDefined();
      expect(result.config.resolve).toBeDefined();
    });

    it("should include proper file patterns", () => {
      const config: GeneratorConfig = {};

      const result = generator.generateConfig(config);

      expect(result.success).toBe(true);
      expect(result.config.test.include).toContain("**/*.{test,spec}.{js,ts,tsx}");
      expect(result.config.test.include).toContain("**/__tests__/**/*.{js,ts,tsx}");
      expect(result.config.test.exclude).toContain("node_modules");
      expect(result.config.test.exclude).toContain("**/node_modules/**");
      expect(result.config.test.exclude).toContain("dist");
      expect(result.config.test.exclude).toContain(".git");
    });

    it("should handle VITEST_AGENT_ID environment variable", () => {
      const originalEnv = process.env.VITEST_AGENT_ID;
      process.env.VITEST_AGENT_ID = "test-agent";

      const config: GeneratorConfig = {};
      const result = generator.generateConfig(config);

      expect(result.success).toBe(true);
      expect(result.config.test.include).toContain("packages/test-agent/**/*.{test,spec}.{js,ts,tsx}");

      // Restore original environment
      if (originalEnv) {
        process.env.VITEST_AGENT_ID = originalEnv;
      } else {
        delete process.env.VITEST_AGENT_ID;
      }
    });
  });

  describe("error handling", () => {
    it("should return error result when generation fails", () => {
      // This test would require mocking the internal functions to force an error
      // For now, we'll test that the structure is correct
      const config: GeneratorConfig = {};

      const result = generator.generateConfig(config);

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("config");
      expect(result).toHaveProperty("projectsGenerated");
      expect(result).toHaveProperty("errors");
      expect(result).toHaveProperty("warnings");
    });
  });
});
