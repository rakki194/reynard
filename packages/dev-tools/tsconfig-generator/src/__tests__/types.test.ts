/**
 * 🦊 TypeScript Configuration Generator Types Tests
 */

import { describe, it, expect } from "vitest";
import type { 
  TSConfigGeneratorConfig, 
  GeneratorResult, 
  TsConfigJson,
  ValidationResult 
} from "../types.js";

describe("Types", () => {
  describe("TSConfigGeneratorConfig", () => {
    it("should accept valid configuration", () => {
      const config: TSConfigGeneratorConfig = {
        includePackages: true,
        includeTemplates: false,
        includeScripts: false,
        includeReferences: true,
        generateIndividual: false,
        customCompilerOptions: {
          target: "ES2022",
          strict: true,
        },
        outputPath: "tsconfig.json",
        verbose: true,
      };

      expect(config.includePackages).toBe(true);
      expect(config.includeTemplates).toBe(false);
      expect(config.includeScripts).toBe(false);
      expect(config.includeReferences).toBe(true);
      expect(config.generateIndividual).toBe(false);
      expect(config.customCompilerOptions).toBeDefined();
      expect(config.outputPath).toBe("tsconfig.json");
      expect(config.verbose).toBe(true);
    });

    it("should work with minimal configuration", () => {
      const config: TSConfigGeneratorConfig = {};

      expect(config.includePackages).toBeUndefined();
      expect(config.includeTemplates).toBeUndefined();
      expect(config.includeScripts).toBeUndefined();
      expect(config.includeReferences).toBeUndefined();
      expect(config.generateIndividual).toBeUndefined();
    });
  });

  describe("GeneratorResult", () => {
    it("should accept successful result", () => {
      const result: GeneratorResult = {
        success: true,
        config: {
          compilerOptions: {
            target: "ES2022",
            module: "ESNext",
            strict: true,
          },
          include: ["src/**/*"],
          exclude: ["**/*.test.ts"],
        },
        projectsGenerated: 5,
        errors: [],
        warnings: [],
      };

      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
      expect(result.projectsGenerated).toBe(5);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it("should accept failed result", () => {
      const result: GeneratorResult = {
        success: false,
        config: {},
        projectsGenerated: 0,
        errors: ["Test error"],
        warnings: ["Test warning"],
      };

      expect(result.success).toBe(false);
      expect(result.projectsGenerated).toBe(0);
      expect(result.errors).toContain("Test error");
      expect(result.warnings).toContain("Test warning");
    });
  });

  describe("TsConfigJson", () => {
    it("should accept valid TypeScript configuration", () => {
      const config: TsConfigJson = {
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          strict: true,
          noImplicitAny: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
        },
        include: [
          "src/**/*",
          "packages/**/*",
        ],
        exclude: [
          "**/*.test.ts",
          "**/*.test.tsx",
          "node_modules",
        ],
        references: [
          { path: "packages/core/core" },
          { path: "packages/ui/components" },
        ],
        extends: "./tsconfig.base.json",
      };

      expect(config.compilerOptions).toBeDefined();
      expect(config.include).toHaveLength(2);
      expect(config.exclude).toHaveLength(3);
      expect(config.references).toHaveLength(2);
      expect(config.extends).toBe("./tsconfig.base.json");
    });

    it("should work with minimal configuration", () => {
      const config: TsConfigJson = {
        compilerOptions: {
          target: "ES2022",
        },
        include: ["src/**/*"],
        exclude: ["**/*.test.ts"],
      };

      expect(config.compilerOptions.target).toBe("ES2022");
      expect(config.include).toHaveLength(1);
      expect(config.exclude).toHaveLength(1);
    });
  });

  describe("ValidationResult", () => {
    it("should accept valid validation result", () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
      };

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept invalid validation result", () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          "Missing required 'compilerOptions'",
          "Missing required 'include' patterns",
        ],
      };

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toBe("Missing required 'compilerOptions'");
      expect(result.errors[1]).toBe("Missing required 'include' patterns");
    });
  });
});
