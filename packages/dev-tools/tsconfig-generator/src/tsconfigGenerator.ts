/**
 * 🦊 TypeScript Configuration Generator
 * Main class for generating TypeScript configurations from project architecture
 */

import type { TSConfigGeneratorConfig, TSConfigResult, PackageTSConfig } from "./types.js";
import {
  getBuildableDirectories,
  getGlobalExcludePatterns,
  queryDirectories,
  getBuildConfiguration,
  type DirectoryDefinition as ArchitectureDirectoryDefinition
} from "reynard-project-architecture";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";

/**
 * Get buildable directories using architecture.ts
 * This provides the correct modern categorized packages layout
 */
function getArchitectureBuildableDirectories(): string[] {
  return getBuildableDirectories();
}

/**
 * Get directory definitions from architecture.ts for TypeScript packages
 */
function getArchitectureTypeScriptDirectories(): ArchitectureDirectoryDefinition[] {
  return queryDirectories({
    buildable: true,
    includeOptional: false,
    includeGenerated: false,
    includeThirdParty: false,
    // Filter for TypeScript/JavaScript packages
  }).directories.filter(dir => 
    dir.fileTypes.includes("typescript") || 
    dir.fileTypes.includes("javascript")
  );
}

/**
 * Get global exclude patterns from architecture.ts
 */
function getArchitectureGlobalExcludePatterns(): string[] {
  return getGlobalExcludePatterns();
}

export class TSConfigGenerator {
  /**
   * Generate TypeScript configuration from project architecture
   */
  generateConfig(config: TSConfigGeneratorConfig = {}): TSConfigResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Get buildable directories from architecture.ts
      const buildableDirs = getArchitectureBuildableDirectories();
      console.log(`Found ${buildableDirs.length} buildable directories from architecture`);

      // Get TypeScript directory definitions with metadata
      const tsDirectories = getArchitectureTypeScriptDirectories();
      console.log(`Found ${tsDirectories.length} TypeScript directories`);

      // Filter directories based on configuration
      const filteredDirs = this.filterDirectories(tsDirectories, config);
      console.log(`Filtered to ${filteredDirs.length} directories`);

      // Generate package configurations
      const packageConfigs = this.generatePackageConfigs(filteredDirs, config, errors, warnings);

      // Generate individual package configs if requested
      if (config.generateIndividual) {
        this.generateIndividualPackageConfigs(packageConfigs, config, errors, warnings);
      }

      // Generate root configuration
      const rootConfig = this.generateRootConfig(config, packageConfigs);

      console.log(`Generated configuration for ${packageConfigs.length} packages using architecture.ts`);

      return {
        success: true,
        config: rootConfig,
        packagesProcessed: packageConfigs.length,
        errors,
        warnings,
      };
    } catch (error) {
      const errorMessage = `Failed to generate configuration: ${(error as Error).message}`;
      console.error(errorMessage);
      errors.push(errorMessage);

      return {
        success: false,
        config: {},
        packagesProcessed: 0,
        errors,
        warnings,
      };
    }
  }

  private filterDirectories(
    directories: ArchitectureDirectoryDefinition[], 
    config: TSConfigGeneratorConfig
  ): ArchitectureDirectoryDefinition[] {
    const filtered: ArchitectureDirectoryDefinition[] = [];

    for (const directory of directories) {
      // Apply filters based on configuration
      // Default to including all categories unless explicitly disabled
      if (config.includePackages === false && directory.category === "source") {
        continue;
      }

      if (config.includeTemplates === false && directory.category === "templates") {
        continue;
      }

      if (config.includeScripts === false && directory.category === "scripts") {
        continue;
      }

      if (config.includeTools === false && directory.category === "tools") {
        continue;
      }

      if (config.includeDocumentation === false && directory.category === "documentation") {
        continue;
      }

      if (config.includeTesting === false && directory.category === "testing") {
        continue;
      }

      // Skip non-buildable directories unless explicitly included
      if (!directory.buildable && !config.includeNonBuildable) {
        continue;
      }

      filtered.push(directory);
    }

    return filtered;
  }

  private generatePackageConfigs(
    directories: ArchitectureDirectoryDefinition[],
    config: TSConfigGeneratorConfig,
    errors: string[],
    _warnings: string[]
  ): PackageTSConfig[] {
    const packageConfigs: PackageTSConfig[] = [];

    for (const directory of directories) {
      try {
        const packageConfig = this.generatePackageConfig(directory, config);
        packageConfigs.push(packageConfig);
        console.log(`Generated config for package: ${directory.name}`);
      } catch (error) {
        const errorMessage = `Failed to generate config for ${directory.name}: ${(error as Error).message}`;
        console.error(errorMessage);
        errors.push(errorMessage);
      }
    }

    return packageConfigs;
  }

  private generatePackageConfig(
    directory: ArchitectureDirectoryDefinition,
    config: TSConfigGeneratorConfig
  ): PackageTSConfig {
    const buildConfig = getBuildConfiguration(directory.name);
    
    // Generate references to dependencies
    const references = this.generateReferences(directory);

    // Generate package-specific tsconfig
    const packageConfig = {
      extends: "../../../tsconfig.json",
      compilerOptions: {
        outDir: "./dist",
        rootDir: "./src",
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        composite: true,
        ...config.customCompilerOptions,
      },
      include: directory.includePatterns.length > 0 ? directory.includePatterns : ["src/**/*"],
      exclude: [
        "dist",
        "node_modules",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        ...directory.excludePatterns,
      ],
      ...(references.length > 0 && { references }),
    };

    return {
      name: directory.name,
      path: directory.path,
      config: packageConfig,
      references,
    };
  }

  private generateReferences(directory: ArchitectureDirectoryDefinition): string[] {
    const references: string[] = [];

    // Add references based on relationships
    for (const relationship of directory.relationships) {
      if (relationship.type === "dependency") {
        // Convert dependency path to reference path
        const refPath = `../${relationship.directory.split('/').pop()}`;
        references.push(refPath);
      }
    }

    return references;
  }

  private generateIndividualPackageConfigs(
    packageConfigs: PackageTSConfig[],
    config: TSConfigGeneratorConfig,
    errors: string[],
    warnings: string[]
  ): void {
    for (const packageConfig of packageConfigs) {
      try {
        const outputPath = join(packageConfig.path, 'tsconfig.generated.json');
        const configContent = JSON.stringify(packageConfig.config, null, 2);
        
        // Create directory if it doesn't exist
        const dir = dirname(outputPath);
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        
        writeFileSync(outputPath, configContent);
        console.log(`Generated individual config: ${outputPath}`);
      } catch (error) {
        const errorMessage = `Failed to generate individual config for ${packageConfig.name}: ${(error as Error).message}`;
        console.error(errorMessage);
        errors.push(errorMessage);
      }
    }
  }

  private generateRootConfig(config: TSConfigGeneratorConfig, packageConfigs: PackageTSConfig[]): any {
    const globalExcludePatterns = getArchitectureGlobalExcludePatterns();

    return {
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "bundler",
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        allowJs: true,
        strict: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        composite: true,
        ...config.customCompilerOptions,
      },
      include: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
      exclude: [
        "node_modules",
        "dist",
        "build",
        "coverage",
        ...globalExcludePatterns,
      ],
      ...(config.includeReferences && packageConfigs.length > 0 && {
        references: packageConfigs.map(pkg => ({ path: pkg.path }))
      }),
    };
  }
}
