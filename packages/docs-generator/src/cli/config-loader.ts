/**
 * @fileoverview Configuration loader for Reynard documentation generator CLI
 */

import { promises as fs } from "fs";
import { loadConfig } from "../config/utils";

/**
 * Loads configuration from file or creates default configuration
 */
export class ConfigLoader {
  /**
   * Load configuration from file or create default
   */
  async loadConfiguration(configPath: string): Promise<any> {
    try {
      // Try to load from specified path
      if (await this.fileExists(configPath)) {
        return await loadConfig(configPath);
      }

      // Try common config file names
      const commonConfigs = [
        "reynard-docs.config.js",
        "reynard-docs.config.ts",
        "docs.config.js",
        "docs.config.ts",
      ];

      for (const configName of commonConfigs) {
        if (await this.fileExists(configName)) {
          console.log(`📋 Found config file: ${configName}`);
          return await loadConfig(configName);
        }
      }

      // Create default configuration
      console.log("📋 No config file found, creating default configuration...");
      return await this.createDefaultConfig();
    } catch (error) {
      console.error("❌ Failed to load configuration:", error);
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create default configuration
   */
  private async createDefaultConfig(): Promise<any> {
    const defaultConfig = {
      rootPath: process.cwd(),
      outputPath: "docs-generated",
      packages: [
        {
          name: "packages",
          pattern: "packages/*/package.json",
          category: "Packages",
        },
      ],
      site: {
        title: "Reynard Documentation",
        description: "Beautiful documentation powered by Reynard framework",
        baseUrl: "/",
      },
      theme: {
        name: "reynard-default",
        primaryColor: "#6366f1",
        secondaryColor: "#8b5cf6",
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        accentColor: "#f59e0b",
      },
      navigation: {
        main: [
          { label: "Getting Started", href: "/getting-started" },
          { label: "Packages", href: "/packages" },
          { label: "API Reference", href: "/api" },
        ],
        breadcrumbs: true,
        sidebar: true,
      },
      search: {
        enabled: true,
        provider: "local",
        placeholder: "Search documentation...",
      },
    };

    // Write default config file
    const configPath = "reynard-docs.config.js";
    const configContent = `export default ${JSON.stringify(defaultConfig, null, 2)};`;

    await fs.writeFile(configPath, configContent);
    console.log(`📝 Created default configuration: ${configPath}`);

    return defaultConfig;
  }
}
