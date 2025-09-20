/**
 * 🦊 Vitest Configuration Generator Types
 * Type definitions for the Vitest configuration generator
 */

// Mock type for development - will be replaced with actual import
export interface DirectoryDefinition {
  name: string;
  path: string;
  category: string;
  importance: string;
  fileTypes?: string[];
  description?: string;
  watchable?: boolean;
  buildable?: boolean;
  testable?: boolean;
  lintable?: boolean;
  documentable?: boolean;
  relationships?: Array<{
    directory: string;
    type: string;
    description: string;
  }>;
  excludePatterns?: string[];
  includePatterns?: string[];
  optional?: boolean;
  generated?: boolean;
  thirdParty?: boolean;
}

export interface VitestProjectConfig {
  name: string;
  root: string;
  test: {
    setupFiles?: string[];
    include: string[];
    exclude?: string[];
    environment?: string;
    environmentOptions?: Record<string, any>;
    coverage?: {
      thresholds?: {
        global?: {
          branches?: number;
          functions?: number;
          lines?: number;
          statements?: number;
        };
      };
    };
  };
}

export interface VitestGlobalConfig {
  test: {
    maxWorkers?: number;
    pool?: string;
    poolOptions?: Record<string, any>;
    fileParallelism?: boolean;
    isolate?: boolean;
    testTimeout?: number;
    hookTimeout?: number;
    reporters?: Array<string | [string, any]>;
    coverage?: {
      provider?: string;
      reporter?: string[];
      reportsDirectory?: string;
    };
    environment?: string;
    globals?: boolean;
    fakeTimers?: Record<string, any>;
    include?: string[];
    exclude?: string[];
    projects?: VitestProjectConfig[];
  };
  resolve?: {
    conditions?: string[];
  };
}

export interface GeneratorConfig {
  outputPath?: string;
  includeExamples?: boolean;
  includeTemplates?: boolean;
  includeScripts?: boolean;
  customThresholds?: {
    branches?: number;
    functions?: number;
    lines?: number;
    statements?: number;
  };
  environment?: string;
  maxWorkers?: number;
  verbose?: boolean;
}

export interface GeneratorResult {
  success: boolean;
  config: VitestGlobalConfig;
  projectsGenerated: number;
  errors: string[];
  warnings: string[];
}

export interface ProjectConfigOptions {
  directory: DirectoryDefinition;
  customThresholds?: {
    branches?: number;
    functions?: number;
    lines?: number;
    statements?: number;
  };
  environment?: string;
}
