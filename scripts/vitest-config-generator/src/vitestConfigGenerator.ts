/**
 * 🦊 Vitest Configuration Generator
 * Main class for generating Vitest configurations from project architecture
 */

import type { DirectoryDefinition } from "./types.js";
import { readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

// Scan for all directories with package.json files
function getTestableDirectories(): string[] {
  const testableDirs: string[] = [];
  
  // Find the project root (go up from scripts/vitest-config-generator to the root)
  const projectRoot = join(process.cwd(), "../../");
  
  // Scan packages directory
  const packagesDir = join(projectRoot, "packages");
  if (existsSync(packagesDir)) {
    scanDirectory(packagesDir, "packages", testableDirs);
  }
  
  // Scan examples directory
  const examplesDir = join(projectRoot, "examples");
  if (existsSync(examplesDir)) {
    scanDirectory(examplesDir, "examples", testableDirs);
  }
  
  // Scan templates directory
  const templatesDir = join(projectRoot, "templates");
  if (existsSync(templatesDir)) {
    scanDirectory(templatesDir, "templates", testableDirs);
  }
  
  // Scan scripts directory for testable scripts
  const scriptsDir = join(projectRoot, "scripts");
  if (existsSync(scriptsDir)) {
    scanDirectory(scriptsDir, "scripts", testableDirs);
  }
  
  return testableDirs;
}

function scanDirectory(dirPath: string, prefix: string, testableDirs: string[]): void {
  try {
    const entries = readdirSync(dirPath);
    
    for (const entry of entries) {
      // Skip node_modules and other build artifacts
      if (entry === "node_modules" || entry === "dist" || entry === "build" || entry === "coverage" || entry.startsWith(".")) {
        continue;
      }
      
      const fullPath = join(dirPath, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        const packageJsonPath = join(fullPath, "package.json");
        if (existsSync(packageJsonPath)) {
          const relativePath = prefix.startsWith("packages") ? prefix === "packages" ? `packages/${entry}` : `${prefix}/${entry}` :
                              prefix === "examples" ? `examples/${entry}` :
                              prefix === "templates" ? `templates/${entry}` :
                              `scripts/${entry}`;
          testableDirs.push(relativePath);
        }
        
        // Recursively scan subdirectories for packages (packages have nested structure)
        if (prefix === "packages") {
          scanDirectory(fullPath, `packages/${entry}`, testableDirs);
        } else if (prefix.startsWith("packages/")) {
          // Continue scanning deeper for nested packages
          scanDirectory(fullPath, `${prefix}/${entry}`, testableDirs);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not scan directory ${dirPath}:`, error);
  }
}

function getDirectoryDefinition(name: string): DirectoryDefinition | undefined {
  // Create a basic directory definition based on the path
  const category = name.startsWith("packages/") ? "source" : 
                   name.startsWith("examples/") ? "examples" :
                   name.startsWith("templates/") ? "templates" : "scripts";
  
  const importance = name.startsWith("packages/") ? "critical" : 
                     name.startsWith("examples/") ? "important" :
                     name.startsWith("templates/") ? "important" : "optional";
  
  return {
    name,
    path: name,
    category,
    importance,
    testable: true,
    includePatterns: ["**/*.{test,spec}.{js,ts,tsx}"],
    excludePatterns: ["node_modules", "dist", "build", "coverage"],
    fileTypes: ["ts", "tsx", "js", "jsx"],
    description: `${category} package`,
    watchable: true,
    buildable: true,
    lintable: true,
    documentable: false,
    relationships: [],
    optional: importance === "optional",
    generated: false,
    thirdParty: false
  };
}

function getGlobalExcludePatterns(): string[] {
  return [
    "**/node_modules/**",
    "**/dist/**", 
    "**/build/**",
    "**/coverage/**",
    "**/.git/**",
    "**/third_party/**",
    "**/.vitest/**",
    "**/temp/**",
    "**/tmp/**"
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
      if (!config.includePackages && directory.category === "source") {
        continue;
      }

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
