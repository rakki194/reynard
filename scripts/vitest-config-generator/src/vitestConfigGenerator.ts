/**
 * 🦊 Vitest Configuration Generator
 * Main class for generating Vitest configurations from project architecture
 */

import type { DirectoryDefinition } from "./types.js";

// Mock functions for development - will be replaced with actual imports
function getTestableDirectories(): string[] {
  return [
    "packages/components",
    "packages/components-core", 
    "packages/core/core",
    "packages/components-themes",
    "packages/testing",
    "packages/charts",
    "packages/games",
    "packages/i18n",
    "packages/rag",
    "packages/ai-shared",
    "packages/segmentation",
    "packages/video",
    "packages/validation",
    "packages/code-quality",
    "packages/api-client",
    "examples/comprehensive-dashboard",
    "examples/test-app",
    "templates/starter",
    "scripts/testing"
  ];
}

function getDirectoryDefinition(name: string): DirectoryDefinition | undefined {
  // Mock implementation - return a basic directory definition
  return {
    name,
    path: name,
    category: name.startsWith("packages/") ? "source" : 
              name.startsWith("examples/") ? "examples" :
              name.startsWith("templates/") ? "templates" : "scripts",
    importance: name.startsWith("packages/") ? "critical" : "important",
    testable: true,
    includePatterns: ["**/*.{test,spec}.{js,ts,tsx}"],
    excludePatterns: ["node_modules", "dist", "build"]
  };
}

function getGlobalExcludePatterns(): string[] {
  return [
    "**/node_modules/**",
    "**/dist/**", 
    "**/build/**",
    "**/coverage/**",
    "**/.git/**",
    "**/third_party/**"
  ];
}
import type {
  VitestGlobalConfig,
  GeneratorConfig,
  GeneratorResult,
} from "./types.js";
import { ProjectConfigGenerator } from "./projectConfigGenerator.js";
import type { Logger } from "./logger.js";

export class VitestConfigGenerator {
  private logger: Logger;
  private projectConfigGenerator: ProjectConfigGenerator;

  constructor(logger: Logger) {
    this.logger = logger;
    this.projectConfigGenerator = new ProjectConfigGenerator();
  }

  /**
   * Generate a complete Vitest configuration from project architecture
   */
  generateConfig(config: GeneratorConfig = {}): GeneratorResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      this.logger.info("Generating Vitest configuration from project architecture...");

      // Get testable directories from architecture
      const testableDirs = getTestableDirectories();
      this.logger.debug(`Found ${testableDirs.length} testable directories`);

      // Filter directories based on configuration
      const filteredDirs = this.filterDirectories(testableDirs, config);
      this.logger.debug(`Filtered to ${filteredDirs.length} directories`);

      // Generate project configurations
      const projects = this.generateProjects(filteredDirs, config, errors, warnings);

      // Generate global configuration
      const globalConfig = this.generateGlobalConfig(config, projects);

      this.logger.info(`Generated configuration for ${projects.length} projects`);

      return {
        success: true,
        config: globalConfig,
        projectsGenerated: projects.length,
        errors,
        warnings,
      };
    } catch (error) {
      const errorMessage = `Failed to generate configuration: ${(error as Error).message}`;
      this.logger.error(errorMessage);
      errors.push(errorMessage);

      return {
        success: false,
        config: {} as VitestGlobalConfig,
        projectsGenerated: 0,
        errors,
        warnings,
      };
    }
  }

  private filterDirectories(
    directories: string[],
    config: GeneratorConfig
  ): DirectoryDefinition[] {
    const filtered: DirectoryDefinition[] = [];

    for (const dirName of directories) {
      const directory = getDirectoryDefinition(dirName);
      if (!directory) {
        this.logger.warn(`Directory definition not found for: ${dirName}`);
        continue;
      }

      // Apply filters based on configuration
      if (!config.includeExamples && directory.category === "examples") {
        continue;
      }

      if (!config.includeTemplates && directory.category === "templates") {
        continue;
      }

      if (!config.includeScripts && directory.category === "scripts") {
        continue;
      }

      filtered.push(directory);
    }

    return filtered;
  }

  private generateProjects(
    directories: DirectoryDefinition[],
    config: GeneratorConfig,
    errors: string[],
    warnings: string[]
  ) {
    const projects = [];

    for (const directory of directories) {
      try {
        const projectConfig = this.projectConfigGenerator.generateProjectConfig({
          directory,
          customThresholds: config.customThresholds,
          environment: config.environment,
        });

        projects.push(projectConfig);
        this.logger.debug(`Generated config for project: ${directory.name}`);
      } catch (error) {
        const errorMessage = `Failed to generate config for ${directory.name}: ${(error as Error).message}`;
        this.logger.error(errorMessage);
        errors.push(errorMessage);
      }
    }

    return projects;
  }

  private generateGlobalConfig(
    config: GeneratorConfig,
    projects: any[]
  ): VitestGlobalConfig {
    const globalExcludePatterns = getGlobalExcludePatterns();

    return {
      test: {
        // Worker configuration
        maxWorkers: config.maxWorkers || 1,
        pool: "forks",
        poolOptions: {
          forks: {
            maxForks: 1,
            singleFork: true,
          },
        },

        // Parallelism settings
        fileParallelism: false,
        isolate: false,

        // Timeout settings
        testTimeout: 30000,
        hookTimeout: 10000,

        // Reporter configuration
        reporters: [
          ["default", { summary: false }],
          ["json", { outputFile: ".vitest-reports/global-report.json" }],
        ],

        // Coverage settings
        coverage: {
          provider: "v8",
          reporter: ["text", "json", "html"],
          reportsDirectory: ".vitest-coverage/global",
        },

        // Environment configuration
        environment: config.environment || "happy-dom",
        globals: true,

        // Fake timers configuration
        fakeTimers: {
          toFake: [
            "setTimeout",
            "clearTimeout",
            "setInterval",
            "clearInterval",
            "setImmediate",
            "clearImmediate",
            "performance",
            "Date",
            "requestAnimationFrame",
            "cancelAnimationFrame",
            "requestIdleCallback",
            "cancelIdleCallback",
          ],
          advanceTimers: true,
          now: 0,
        },

        // File patterns
        include: process.env.VITEST_AGENT_ID
          ? [`packages/${process.env.VITEST_AGENT_ID}/**/*.{test,spec}.{js,ts,tsx}`]
          : [
              "**/*.{test,spec}.{js,ts,tsx}",
              "**/__tests__/**/*.{js,ts,tsx}",
              "src/**/*.{test,spec}.{js,ts,tsx}",
              "src/__tests__/**/*.{js,ts,tsx}",
            ],

        exclude: [
          "node_modules",
          "**/node_modules/**",
          "dist",
          ".git",
          ".cache",
          "coverage",
          ".vitest-reports",
          ".vitest-coverage",
          "**/node_modules/**/*.{test,spec}.{js,ts,tsx}",
          ...globalExcludePatterns,
        ],

        // Generated projects
        projects,
      },

      // Resolve configuration
      resolve: {
        conditions: ["development", "browser"],
      },
    };
  }
}
