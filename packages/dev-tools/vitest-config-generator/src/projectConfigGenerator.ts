/**
 * 🦊 Project Configuration Generator
 * Generates individual project configurations from directory definitions
 */

import type { DirectoryDefinition } from "./types.js";
import type { VitestProjectConfig, ProjectConfigOptions } from "./types.js";

export class ProjectConfigGenerator {
  /**
   * Generate a Vitest project configuration from a directory definition
   */
  generateProjectConfig(options: ProjectConfigOptions): VitestProjectConfig {
    const { directory, customThresholds, environment = "happy-dom" } = options;

    // Determine setup files based on directory type
    const setupFiles = this.getSetupFiles(directory);

    // Determine include patterns based on directory definition
    const include = this.getIncludePatterns(directory);

    // Determine exclude patterns
    const exclude = this.getExcludePatterns(directory);

    // Generate coverage thresholds
    const coverage = this.generateCoverageConfig(directory, customThresholds);

    // Generate environment options for specific directories
    const environmentOptions = this.getEnvironmentOptions(directory);

    return {
      name: directory.name,
      root: `./${directory.path}`,
      test: {
        setupFiles,
        include,
        exclude,
        environment,
        environmentOptions,
        coverage,
      },
    };
  }

  private getSetupFiles(directory: DirectoryDefinition): string[] {
    // Default setup file pattern
    const defaultSetup = `./src/__tests__/setup.ts`;

    // Check if directory has specific setup file patterns
    if (directory.name === "packages/testing" || directory.name === "testing") {
      return [`./src/test-setup.ts`];
    }

    return [defaultSetup];
  }

  private getIncludePatterns(directory: DirectoryDefinition): string[] {
    // Check if directory has specific test patterns
    if (directory.includePatterns && directory.includePatterns.length > 0) {
      const testPatterns = directory.includePatterns.filter(
        (pattern: string) => pattern.includes("test") || pattern.includes("spec")
      );

      if (testPatterns.length > 0) {
        return testPatterns;
      }
    }

    // Default test patterns - use the directory path to create appropriate patterns
    const basePath = directory.path === "packages" ? "packages" : `packages/${directory.path}`;
    return [
      `${basePath}/**/*.{test,spec}.{js,ts,tsx}`,
      `${basePath}/**/__tests__/**/*.{js,ts,tsx}`,
      `${basePath}/src/**/*.{test,spec}.{js,ts,tsx}`,
      `${basePath}/src/__tests__/**/*.{js,ts,tsx}`,
    ];
  }

  private getExcludePatterns(directory: DirectoryDefinition): string[] {
    const exclude: string[] = [];

    // Add directory-specific exclude patterns
    if (directory.excludePatterns) {
      exclude.push(...directory.excludePatterns);
    }

    // Add common test exclusions
    exclude.push("node_modules", "dist", "build", "coverage");

    return exclude;
  }

  private generateCoverageConfig(
    directory: DirectoryDefinition,
    customThresholds?: {
      branches?: number;
      functions?: number;
      lines?: number;
      statements?: number;
    }
  ) {
    // Determine thresholds based on directory importance and type
    let thresholds = this.getDefaultThresholds(directory);

    // Override with custom thresholds if provided
    if (customThresholds) {
      thresholds = { ...thresholds, ...customThresholds };
    }

    return {
      thresholds: {
        global: thresholds,
      },
    };
  }

  private getDefaultThresholds(directory: DirectoryDefinition) {
    // Higher thresholds for core packages
    if (directory.importance === "critical") {
      return {
        branches: 85,
        functions: 90,
        lines: 90,
        statements: 90,
      };
    }

    // Medium thresholds for important packages
    if (directory.importance === "important") {
      return {
        branches: 80,
        functions: 85,
        lines: 85,
        statements: 85,
      };
    }

    // Lower thresholds for examples and templates
    if (directory.category === "templates" || directory.category === "examples") {
      return {
        branches: 70,
        functions: 75,
        lines: 75,
        statements: 75,
      };
    }

    // Default thresholds
    return {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    };
  }

  private getEnvironmentOptions(directory: DirectoryDefinition) {
    // Special environment options for components
    if (
      directory.name === "packages/components" ||
      directory.name === "packages/components-core" ||
      directory.name === "components" ||
      directory.name === "components-core"
    ) {
      return {
        happyDOM: {
          url: "http://localhost:3000",
          settings: {
            disableJavaScriptFileLoading: true,
            disableJavaScriptEvaluation: true,
            disableCSSFileLoading: true,
          },
        },
      };
    }

    return undefined;
  }
}
