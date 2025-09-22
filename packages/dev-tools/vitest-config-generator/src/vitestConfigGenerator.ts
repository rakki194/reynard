/**
 * 🦊 Vitest Configuration Generator
 * Main class for generating Vitest configurations from project architecture
 */

import type { DirectoryDefinition } from "./types.js";
import {
  getArchitectureTestableDirectories,
  getArchitectureDirectoryDefinitions,
  convertArchitectureDirectory,
  getArchitectureGlobalExcludePatterns
} from "./architectureHelpers.js";


import type { VitestGlobalConfig, GeneratorConfig, GeneratorResult, VitestProjectConfig } from "./types.js";
import { ProjectConfigGenerator } from "./projectConfigGenerator.js";
import { generateTestConfig } from "./testConfigGenerator.js";
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

      // Get testable directories from architecture.ts (replaces hardcoded scanning)
      const testableDirs = getArchitectureTestableDirectories();
      this.logger.debug(`Found ${testableDirs.length} testable directories from architecture`);

      // Get rich directory definitions with metadata
      const archDirectories = getArchitectureDirectoryDefinitions();
      this.logger.debug(`Found ${archDirectories.length} directory definitions with metadata`);

      // Convert architecture directories to our format
      const directories = archDirectories.map(convertArchitectureDirectory);

      // Filter directories based on configuration
      const filteredDirs = this.filterDirectories(directories, config);
      this.logger.debug(`Filtered to ${filteredDirs.length} directories`);

      // Generate project configurations
      const projects = this.generateProjects(filteredDirs, config, errors, warnings);

      // Generate global configuration
      const globalConfig = this.generateGlobalConfig(config, projects);

      this.logger.info(`Generated configuration for ${projects.length} projects using architecture.ts`);

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

  private filterDirectories(directories: DirectoryDefinition[], config: GeneratorConfig): DirectoryDefinition[] {
    const filtered: DirectoryDefinition[] = [];

    for (const directory of directories) {
      // Apply filters based on configuration
      if (!config.includePackages && directory.category === "source") {
        continue;
      }

      if (!config.includeExamples && directory.name === "examples") {
        continue;
      }

      if (!config.includeTemplates && directory.name === "templates") {
        continue;
      }

      if (!config.includeScripts && directory.name === "scripts") {
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
    _warnings: string[]
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

  private generateGlobalConfig(config: GeneratorConfig, projects: VitestProjectConfig[]): VitestGlobalConfig {
    const globalExcludePatterns = getArchitectureGlobalExcludePatterns();

    return {
      test: {
        ...generateTestConfig(config, globalExcludePatterns, projects),
      },
      resolve: {
        conditions: ["development", "browser"],
      },
    };
  }
}
