/**
 * 🦊 Reynard Dev Server Configuration Manager
 * 
 * Type-safe configuration management leveraging existing Reynard patterns.
 * Extends the service-manager configuration patterns for dev server needs.
 */

import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { z } from 'zod';
import type { 
  DevServerConfig, 
  ProjectConfig, 
  ProjectCategory, 
  ValidationResult,
  GlobalConfig,
  PortRange,
  LoggingConfig
} from '../types/index.js';

// ============================================================================
// Configuration Schemas
// ============================================================================

const ProjectCategorySchema = z.enum(['package', 'example', 'backend', 'e2e', 'template']);

const HealthCheckConfigSchema = z.object({
  endpoint: z.string().url().optional(),
  timeout: z.number().positive().optional(),
  interval: z.number().positive().optional(),
  command: z.string().optional(),
  expectedResponse: z.union([z.string(), z.instanceof(RegExp)]).optional(),
});

const ProjectConfigSchema = z.object({
  name: z.string().min(1),
  port: z.number().int().positive().max(65535),
  description: z.string(),
  category: ProjectCategorySchema,
  autoReload: z.boolean().default(true),
  hotReload: z.boolean().default(true),
  dependencies: z.array(z.string()).optional(),
  healthCheck: HealthCheckConfigSchema.optional(),
  env: z.record(z.string()).optional(),
  cwd: z.string().optional(),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  startupTimeout: z.number().positive().optional(),
  shutdownTimeout: z.number().positive().optional(),
});

const PortRangeSchema = z.object({
  start: z.number().int().positive().max(65535),
  end: z.number().int().positive().max(65535),
  reserved: z.array(z.number().int().positive()).optional(),
});

const LoggingConfigSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  format: z.enum(['json', 'text', 'colored']).default('colored'),
  file: z.string().optional(),
  maxFileSize: z.number().positive().optional(),
  maxFiles: z.number().int().positive().optional(),
});

const GlobalConfigSchema = z.object({
  maxConcurrentServers: z.number().int().positive().optional(),
  defaultStartupTimeout: z.number().positive().default(30000),
  defaultShutdownTimeout: z.number().positive().default(10000),
  healthCheckInterval: z.number().positive().default(5000),
  autoRestart: z.boolean().default(true),
  maxRestartAttempts: z.number().int().positive().default(3),
  restartDelay: z.number().positive().default(1000),
});

const DevServerConfigSchema = z.object({
  version: z.string().default('1.0.0'),
  global: GlobalConfigSchema.default({}),
  projects: z.record(z.string(), ProjectConfigSchema),
  portRanges: z.record(ProjectCategorySchema, PortRangeSchema),
  healthCheck: HealthCheckConfigSchema.optional(),
  logging: LoggingConfigSchema.default({}),
});

// ============================================================================
// Configuration Manager Class
// ============================================================================

export class ConfigManager {
  private config: DevServerConfig | null = null;
  private configPath: string;
  private watchers: Set<(config: DevServerConfig) => void> = new Set();

  constructor(configPath: string = 'dev-server.config.json') {
    this.configPath = resolve(configPath);
  }

  /**
   * Load configuration from file
   */
  async loadConfig(): Promise<DevServerConfig> {
    try {
      const configData = await readFile(this.configPath, 'utf-8');
      const rawConfig = JSON.parse(configData);
      
      // Validate configuration
      const validationResult = this.validateConfig(rawConfig);
      if (!validationResult.isValid) {
        throw new Error(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
      }

      this.config = rawConfig as DevServerConfig;
      return this.config;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        // Configuration file doesn't exist, create default
        this.config = this.createDefaultConfig();
        await this.saveConfig();
        return this.config;
      }
      throw error;
    }
  }

  /**
   * Save configuration to file
   */
  async saveConfig(): Promise<void> {
    if (!this.config) {
      throw new Error('No configuration loaded');
    }

    const configDir = dirname(this.configPath);
    await access(configDir).catch(() => {
      throw new Error(`Configuration directory does not exist: ${configDir}`);
    });

    const configData = JSON.stringify(this.config, null, 2);
    await writeFile(this.configPath, configData, 'utf-8');

    // Notify watchers
    this.notifyWatchers();
  }

  /**
   * Get project configuration
   */
  getProject(name: string): ProjectConfig | undefined {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config.projects[name];
  }

  /**
   * Get all project configurations
   */
  getAllProjects(): Record<string, ProjectConfig> {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config.projects;
  }

  /**
   * Get projects by category
   */
  getProjectsByCategory(category: ProjectCategory): ProjectConfig[] {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return Object.values(this.config.projects).filter(project => project.category === category);
  }

  /**
   * Add or update project configuration
   */
  setProject(name: string, config: ProjectConfig): void {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    this.config.projects[name] = config;
  }

  /**
   * Remove project configuration
   */
  removeProject(name: string): boolean {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return delete this.config.projects[name];
  }

  /**
   * Get global configuration
   */
  getGlobalConfig(): GlobalConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config.global;
  }

  /**
   * Update global configuration
   */
  setGlobalConfig(config: Partial<GlobalConfig>): void {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    this.config.global = { ...this.config.global, ...config };
  }

  /**
   * Get port range for category
   */
  getPortRange(category: ProjectCategory): PortRange | undefined {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config.portRanges[category];
  }

  /**
   * Set port range for category
   */
  setPortRange(category: ProjectCategory, range: PortRange): void {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    this.config.portRanges[category] = range;
  }

  /**
   * Get logging configuration
   */
  getLoggingConfig(): LoggingConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config.logging;
  }

  /**
   * Set logging configuration
   */
  setLoggingConfig(config: Partial<LoggingConfig>): void {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    this.config.logging = { ...this.config.logging, ...config };
  }

  /**
   * Validate configuration
   */
  validateConfig(config: any): ValidationResult {
    try {
      DevServerConfigSchema.parse(config);
      return {
        isValid: true,
        errors: [],
        warnings: [],
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
          warnings: [],
        };
      }
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown validation error'],
        warnings: [],
      };
    }
  }

  /**
   * Validate project configuration
   */
  validateProjectConfig(config: any): ValidationResult {
    try {
      ProjectConfigSchema.parse(config);
      return {
        isValid: true,
        errors: [],
        warnings: [],
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
          warnings: [],
        };
      }
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown validation error'],
        warnings: [],
      };
    }
  }

  /**
   * Check if port is in range for category
   */
  isPortInRange(port: number, category: ProjectCategory): boolean {
    const range = this.getPortRange(category);
    if (!range) return false;
    return port >= range.start && port <= range.end;
  }

  /**
   * Get next available port in range
   */
  getNextAvailablePort(category: ProjectCategory, usedPorts: Set<number>): number | null {
    const range = this.getPortRange(category);
    if (!range) return null;

    for (let port = range.start; port <= range.end; port++) {
      if (range.reserved?.includes(port)) continue;
      if (!usedPorts.has(port)) return port;
    }
    return null;
  }

  /**
   * Watch for configuration changes
   */
  watch(callback: (config: DevServerConfig) => void): () => void {
    this.watchers.add(callback);
    return () => this.watchers.delete(callback);
  }

  /**
   * Notify configuration watchers
   */
  private notifyWatchers(): void {
    if (this.config) {
      this.watchers.forEach(callback => callback(this.config!));
    }
  }

  /**
   * Create default configuration
   */
  private createDefaultConfig(): DevServerConfig {
    return {
      version: '1.0.0',
      global: {
        defaultStartupTimeout: 30000,
        defaultShutdownTimeout: 10000,
        healthCheckInterval: 5000,
        autoRestart: true,
        maxRestartAttempts: 3,
        restartDelay: 1000,
      },
      projects: {},
      portRanges: {
        package: { start: 3000, end: 3009 },
        example: { start: 3010, end: 3019 },
        backend: { start: 8000, end: 8009 },
        e2e: { start: 3020, end: 3029 },
        template: { start: 3030, end: 3039 },
      },
      logging: {
        level: 'info',
        format: 'colored',
      },
    };
  }

  /**
   * Migrate configuration from old format
   */
  async migrateFromOldFormat(oldConfigPath: string): Promise<void> {
    try {
      const oldConfigData = await readFile(oldConfigPath, 'utf-8');
      const oldConfig = JSON.parse(oldConfigData);
      
      // Transform old config to new format
      const newConfig = this.transformOldConfig(oldConfig);
      
      // Validate new config
      const validationResult = this.validateConfig(newConfig);
      if (!validationResult.isValid) {
        throw new Error(`Migration validation failed: ${validationResult.errors.join(', ')}`);
      }

      this.config = newConfig;
      await this.saveConfig();
    } catch (error) {
      throw new Error(`Failed to migrate configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transform old configuration format to new format
   */
  private transformOldConfig(oldConfig: any): DevServerConfig {
    const projects: Record<string, ProjectConfig> = {};

    // Transform packages
    if (oldConfig.packages) {
      Object.entries(oldConfig.packages).forEach(([name, config]: [string, any]) => {
        projects[name] = {
          name,
          port: config.port,
          description: config.description || '',
          category: 'package',
          autoReload: config.autoReload ?? true,
          hotReload: config.hotReload ?? true,
        };
      });
    }

    // Transform examples
    if (oldConfig.examples) {
      Object.entries(oldConfig.examples).forEach(([name, config]: [string, any]) => {
        projects[name] = {
          name,
          port: config.port,
          description: config.description || '',
          category: 'example',
          autoReload: config.autoReload ?? true,
          hotReload: config.hotReload ?? true,
        };
      });
    }

    // Transform backend
    if (oldConfig.backend) {
      Object.entries(oldConfig.backend).forEach(([name, config]: [string, any]) => {
        projects[name] = {
          name,
          port: config.port,
          description: config.description || '',
          category: 'backend',
          autoReload: config.autoReload ?? true,
          hotReload: config.hotReload ?? false,
        };
      });
    }

    // Transform e2e
    if (oldConfig.e2e) {
      Object.entries(oldConfig.e2e).forEach(([name, config]: [string, any]) => {
        projects[name] = {
          name,
          port: config.port,
          description: config.description || '',
          category: 'e2e',
          autoReload: config.autoReload ?? false,
          hotReload: config.hotReload ?? false,
        };
      });
    }

    return {
      version: '1.0.0',
      global: {
        defaultStartupTimeout: 30000,
        defaultShutdownTimeout: 10000,
        healthCheckInterval: 5000,
        autoRestart: true,
        maxRestartAttempts: 3,
        restartDelay: 1000,
      },
      projects,
      portRanges: {
        package: { start: 3000, end: 3009 },
        example: { start: 3010, end: 3019 },
        backend: { start: 8000, end: 8009 },
        e2e: { start: 3020, end: 3029 },
        template: { start: 3030, end: 3039 },
      },
      logging: {
        level: 'info',
        format: 'colored',
      },
    };
  }
}
