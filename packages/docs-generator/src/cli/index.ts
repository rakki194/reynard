#!/usr/bin/env node

/**
 * @fileoverview CLI for Reynard documentation generator
 */

import { promises as fs } from 'fs';
import path from 'path';
import { createDocGenerator, loadConfig, validateConfig } from '../index';

/**
 * CLI interface for the documentation generator
 */
class ReynardDocsCLI {
  private configPath: string;
  private watch: boolean;
  private verbose: boolean;

  constructor() {
    this.configPath = 'reynard-docs.config.js';
    this.watch = false;
    this.verbose = false;
  }

  /**
   * Parse command line arguments
   */
  parseArgs(args: string[]): void {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--config':
        case '-c':
          this.configPath = args[++i];
          break;
        case '--watch':
        case '-w':
          this.watch = true;
          break;
        case '--verbose':
        case '-v':
          this.verbose = true;
          break;
        case '--help':
        case '-h':
          this.showHelp();
          process.exit(0);
          break;
        case '--version':
          this.showVersion();
          process.exit(0);
          break;
        default:
          if (arg.startsWith('-')) {
            console.error(`Unknown option: ${arg}`);
            this.showHelp();
            process.exit(1);
          }
          break;
      }
    }
  }

  /**
   * Show help information
   */
  showHelp(): void {
    console.log(`
🦊 Reynard Documentation Generator

Usage: reynard-docs [options]

Options:
  -c, --config <path>    Configuration file path (default: reynard-docs.config.js)
  -w, --watch           Watch for changes and regenerate documentation
  -v, --verbose         Enable verbose output
  -h, --help            Show this help message
  --version             Show version information

Examples:
  reynard-docs                          # Generate documentation once
  reynard-docs --watch                  # Watch for changes
  reynard-docs --config ./my-config.js  # Use custom config file
  reynard-docs --verbose --watch        # Verbose output with watching

For more information, visit: https://github.com/rakki194/reynard
    `);
  }

  /**
   * Show version information
   */
  showVersion(): void {
    console.log('Reynard Documentation Generator v0.1.0');
  }

  /**
   * Run the CLI
   */
  async run(): Promise<void> {
    try {
      console.log('🦊 Reynard Documentation Generator');
      console.log('=====================================\n');

      // Load configuration
      console.log(`📋 Loading configuration from: ${this.configPath}`);
      const config = await this.loadConfiguration();
      
      // Validate configuration
      const validation = validateConfig(config);
      if (!validation.isValid) {
        console.error('❌ Configuration validation failed:');
        validation.errors.forEach(error => console.error(`  - ${error}`));
        process.exit(1);
      }
      console.log('✅ Configuration validated');

      // Create generator
      const generator = createDocGenerator(config);

      if (this.watch) {
        console.log('👀 Starting watch mode...');
        await generator.watch();
      } else {
        console.log('🚀 Generating documentation...');
        await generator.generate();
        console.log('🎉 Documentation generation complete!');
      }

    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }

  /**
   * Load configuration from file or create default
   */
  private async loadConfiguration(): Promise<any> {
    try {
      // Try to load from specified path
      if (await this.fileExists(this.configPath)) {
        return await loadConfig(this.configPath);
      }

      // Try common config file names
      const commonConfigs = [
        'reynard-docs.config.js',
        'reynard-docs.config.ts',
        'docs.config.js',
        'docs.config.ts'
      ];

      for (const configName of commonConfigs) {
        if (await this.fileExists(configName)) {
          console.log(`📋 Found config file: ${configName}`);
          return await loadConfig(configName);
        }
      }

      // Create default configuration
      console.log('📋 No config file found, creating default configuration...');
      return await this.createDefaultConfig();

    } catch (error) {
      console.error('❌ Failed to load configuration:', error);
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
      outputPath: 'docs-generated',
      packages: [
        {
          name: 'packages',
          pattern: 'packages/*/package.json',
          category: 'Packages'
        }
      ],
      site: {
        title: 'Reynard Documentation',
        description: 'Beautiful documentation powered by Reynard framework',
        baseUrl: '/'
      },
      theme: {
        name: 'reynard-default',
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        accentColor: '#f59e0b'
      },
      navigation: {
        main: [
          { label: 'Getting Started', href: '/getting-started' },
          { label: 'Packages', href: '/packages' },
          { label: 'API Reference', href: '/api' }
        ],
        breadcrumbs: true,
        sidebar: true
      },
      search: {
        enabled: true,
        provider: 'local',
        placeholder: 'Search documentation...'
      }
    };

    // Write default config file
    const configPath = 'reynard-docs.config.js';
    const configContent = `export default ${JSON.stringify(defaultConfig, null, 2)};`;
    
    await fs.writeFile(configPath, configContent);
    console.log(`📝 Created default configuration: ${configPath}`);

    return defaultConfig;
  }
}

// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new ReynardDocsCLI();
  cli.parseArgs(process.argv.slice(2));
  cli.run().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}
