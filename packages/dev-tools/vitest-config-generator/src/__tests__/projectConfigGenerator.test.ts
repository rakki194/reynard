/**
 * 🦊 Project Configuration Generator Tests
 * Tests for the ProjectConfigGenerator
 */

import { describe, it, expect } from "vitest";
import { ProjectConfigGenerator } from "../projectConfigGenerator.js";
import type { DirectoryDefinition, ProjectConfigOptions } from "../types.js";

describe("ProjectConfigGenerator", () => {
  let generator: ProjectConfigGenerator;

  beforeEach(() => {
    generator = new ProjectConfigGenerator();
  });

  describe("generateProjectConfig", () => {
    const mockDirectory: DirectoryDefinition = {
      name: "packages/components",
      path: "packages/components",
      category: "source",
      importance: "critical",
      testable: true,
      includePatterns: ["**/*.{test,spec}.{js,ts,tsx}"],
      excludePatterns: ["node_modules", "dist"],
    };

    it("should generate a valid project configuration", () => {
      const options: ProjectConfigOptions = {
        directory: mockDirectory,
      };

      const config = generator.generateProjectConfig(options);

      expect(config).toBeDefined();
      expect(config.name).toBe("packages/components");
      expect(config.root).toBe("./packages/components");
      expect(config.test).toBeDefined();
      expect(config.test.include).toBeDefined();
      expect(config.test.exclude).toBeDefined();
      expect(config.test.environment).toBe("happy-dom");
    });

    it("should use custom environment when provided", () => {
      const options: ProjectConfigOptions = {
        directory: mockDirectory,
        environment: "node",
      };

      const config = generator.generateProjectConfig(options);

      expect(config.test.environment).toBe("node");
    });

    it("should apply custom coverage thresholds", () => {
      const options: ProjectConfigOptions = {
        directory: mockDirectory,
        customThresholds: {
          branches: 90,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      };

      const config = generator.generateProjectConfig(options);

      expect(config.test.coverage).toBeDefined();
      expect(config.test.coverage?.thresholds?.global?.branches).toBe(90);
      expect(config.test.coverage?.thresholds?.global?.functions).toBe(95);
      expect(config.test.coverage?.thresholds?.global?.lines).toBe(95);
      expect(config.test.coverage?.thresholds?.global?.statements).toBe(95);
    });

    it("should generate appropriate setup files for testing package", () => {
      const testingDirectory: DirectoryDefinition = {
        ...mockDirectory,
        name: "packages/testing",
      };

      const options: ProjectConfigOptions = {
        directory: testingDirectory,
      };

      const config = generator.generateProjectConfig(options);

      expect(config.test.setupFiles).toEqual(["./src/test-setup.ts"]);
    });

    it("should generate default setup files for other packages", () => {
      const options: ProjectConfigOptions = {
        directory: mockDirectory,
      };

      const config = generator.generateProjectConfig(options);

      expect(config.test.setupFiles).toEqual(["./src/__tests__/setup.ts"]);
    });

    it("should use directory include patterns when available", () => {
      const directoryWithPatterns: DirectoryDefinition = {
        ...mockDirectory,
        includePatterns: ["src/**/*.test.ts", "src/**/*.spec.ts"],
      };

      const options: ProjectConfigOptions = {
        directory: directoryWithPatterns,
      };

      const config = generator.generateProjectConfig(options);

      expect(config.test.include).toEqual([
        "src/**/*.{test,spec}.{js,ts,tsx}",
        "src/**/*.{test,spec}.{js,ts,tsx}",
      ]);
    });

    it("should use default include patterns when directory has none", () => {
      const directoryWithoutPatterns: DirectoryDefinition = {
        ...mockDirectory,
        includePatterns: undefined,
      };

      const options: ProjectConfigOptions = {
        directory: directoryWithoutPatterns,
      };

      const config = generator.generateProjectConfig(options);

      expect(config.test.include).toEqual(["src/**/*.{test,spec}.{js,ts,tsx}"]);
    });

    it("should include directory exclude patterns", () => {
      const options: ProjectConfigOptions = {
        directory: mockDirectory,
      };

      const config = generator.generateProjectConfig(options);

      expect(config.test.exclude).toContain("node_modules");
      expect(config.test.exclude).toContain("dist");
      expect(config.test.exclude).toContain("build");
      expect(config.test.exclude).toContain("coverage");
    });

    it("should generate environment options for components", () => {
      const componentsDirectory: DirectoryDefinition = {
        ...mockDirectory,
        name: "packages/components",
      };

      const options: ProjectConfigOptions = {
        directory: componentsDirectory,
      };

      const config = generator.generateProjectConfig(options);

      expect(config.test.environmentOptions).toBeDefined();
      expect(config.test.environmentOptions?.happyDOM).toBeDefined();
      expect(config.test.environmentOptions?.happyDOM?.url).toBe("http://localhost:3000");
    });

    it("should not generate environment options for non-components", () => {
      const nonComponentDirectory: DirectoryDefinition = {
        ...mockDirectory,
        name: "packages/utils",
      };

      const options: ProjectConfigOptions = {
        directory: nonComponentDirectory,
      };

      const config = generator.generateProjectConfig(options);

      expect(config.test.environmentOptions).toBeUndefined();
    });
  });

  describe("coverage thresholds", () => {
    it("should use high thresholds for critical packages", () => {
      const criticalDirectory: DirectoryDefinition = {
        name: "packages/core",
        path: "packages/core",
        category: "source",
        importance: "critical",
        testable: true,
      };

      const options: ProjectConfigOptions = {
        directory: criticalDirectory,
      };

      const config = generator.generateProjectConfig(options);

      expect(config.test.coverage?.thresholds?.global?.branches).toBe(85);
      expect(config.test.coverage?.thresholds?.global?.functions).toBe(90);
      expect(config.test.coverage?.thresholds?.global?.lines).toBe(90);
      expect(config.test.coverage?.thresholds?.global?.statements).toBe(90);
    });

    it("should use medium thresholds for important packages", () => {
      const importantDirectory: DirectoryDefinition = {
        name: "packages/utils",
        path: "packages/utils",
        category: "source",
        importance: "important",
        testable: true,
      };

      const options: ProjectConfigOptions = {
        directory: importantDirectory,
      };

      const config = generator.generateProjectConfig(options);

      expect(config.test.coverage?.thresholds?.global?.branches).toBe(80);
      expect(config.test.coverage?.thresholds?.global?.functions).toBe(85);
      expect(config.test.coverage?.thresholds?.global?.lines).toBe(85);
      expect(config.test.coverage?.thresholds?.global?.statements).toBe(85);
    });

    it("should use low thresholds for examples", () => {
      const exampleDirectory: DirectoryDefinition = {
        name: "examples/test-app",
        path: "examples/test-app",
        category: "examples",
        importance: "optional",
        testable: true,
      };

      const options: ProjectConfigOptions = {
        directory: exampleDirectory,
      };

      const config = generator.generateProjectConfig(options);

      expect(config.test.coverage?.thresholds?.global?.branches).toBe(70);
      expect(config.test.coverage?.thresholds?.global?.functions).toBe(75);
      expect(config.test.coverage?.thresholds?.global?.lines).toBe(75);
      expect(config.test.coverage?.thresholds?.global?.statements).toBe(75);
    });

    it("should use low thresholds for templates", () => {
      const templateDirectory: DirectoryDefinition = {
        name: "templates/starter",
        path: "templates/starter",
        category: "templates",
        importance: "optional",
        testable: true,
      };

      const options: ProjectConfigOptions = {
        directory: templateDirectory,
      };

      const config = generator.generateProjectConfig(options);

      expect(config.test.coverage?.thresholds?.global?.branches).toBe(70);
      expect(config.test.coverage?.thresholds?.global?.functions).toBe(75);
      expect(config.test.coverage?.thresholds?.global?.lines).toBe(75);
      expect(config.test.coverage?.thresholds?.global?.statements).toBe(75);
    });
  });
});
