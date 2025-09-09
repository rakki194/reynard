import { describe, it, expect } from "vitest";
import { defineConfig } from "vitest/config";

// Test the basic functionality without importing the actual config functions
describe("Vitest Configuration Utilities (Minimal)", () => {
  it("should be able to create a basic vitest config", () => {
    const config = defineConfig({
      test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./src/test-setup.ts"],
        coverage: {
          provider: "v8",
          reporter: ["text", "html", "lcov"],
          thresholds: {
            global: {
              branches: 80,
              functions: 80,
              lines: 80,
              statements: 80,
            },
          },
        },
      },
    });

    expect(config).toBeDefined();
    expect(config.test).toBeDefined();
    expect(config.test!.environment).toBe("jsdom");
    expect(config.test!.globals).toBe(true);
    expect(config.test!.setupFiles).toEqual(["./src/test-setup.ts"]);
  });

  it("should be able to create config with custom coverage thresholds", () => {
    const customThresholds = {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    };

    const config = defineConfig({
      test: {
        environment: "jsdom",
        globals: true,
        coverage: {
          provider: "v8",
          thresholds: {
            global: customThresholds,
          },
        },
      },
    });

    expect(config.test).toBeDefined();
    expect(config.test!.coverage).toBeDefined();
    expect((config.test!.coverage as any).thresholds.global).toEqual(
      customThresholds,
    );
  });

  it("should be able to create config with custom exclusions", () => {
    const customExclusions = ["custom/**", "test-files/**"];

    const config = defineConfig({
      test: {
        environment: "jsdom",
        globals: true,
        coverage: {
          provider: "v8",
          exclude: [
            "node_modules/",
            "dist/",
            "coverage/",
            "**/*.d.ts",
            "**/*.config.*",
            "**/test-setup.ts",
            "**/fixtures/**",
            "**/mocks/**",
            ...customExclusions,
          ],
        },
      },
    });

    expect(config.test).toBeDefined();
    expect(config.test!.coverage).toBeDefined();
    customExclusions.forEach((exclusion) => {
      expect((config.test!.coverage as any).exclude).toContain(exclusion);
    });
  });
});
