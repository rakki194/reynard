/**
 * 🦊 Test ConfigManager
 * 
 * A test-specific ConfigManager that bypasses file system operations
 * and uses in-memory configuration for testing purposes.
 */

import type { DevServerConfig, ProjectConfig } from "../types/index.js";

export class TestConfigManager {
  private config: DevServerConfig;

  constructor(initialConfig?: DevServerConfig) {
    this.config = initialConfig || {
      projects: {},
      portRanges: {
        package: { start: 3000, end: 3009 },
        example: { start: 3010, end: 3019 },
        backend: { start: 8000, end: 8009 },
      },
      logging: {
        level: "info",
        format: "json",
      },
    };
  }

  async loadConfig(): Promise<DevServerConfig> {
    return this.config;
  }

  async saveConfig(config: DevServerConfig): Promise<void> {
    this.config = config;
  }

  async reloadConfig(): Promise<DevServerConfig> {
    return this.config;
  }

  getProject(name: string): ProjectConfig | undefined {
    return this.config.projects[name];
  }

  setProject(name: string, project: ProjectConfig): void {
    this.config.projects[name] = project;
  }

  removeProject(name: string): void {
    delete this.config.projects[name];
  }

  listProjects(): string[] {
    return Object.keys(this.config.projects);
  }

  getProjectsByCategory(category: string): ProjectConfig[] {
    return Object.values(this.config.projects).filter(
      project => project.type === category
    );
  }

  validateConfig(config: DevServerConfig): boolean {
    // Simple validation - just check if it has required fields
    return !!(config.projects && config.portRanges && config.logging);
  }

  getConfig(): DevServerConfig {
    return this.config;
  }

  updateConfig(updates: Partial<DevServerConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

