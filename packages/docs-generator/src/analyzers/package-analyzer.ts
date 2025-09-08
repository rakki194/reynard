/**
 * @fileoverview Package analyzer for extracting package information
 */

import { promises as fs } from 'fs';
import path from 'path';
import { PackageInfo, PackageConfig } from '../config';

/**
 * Analyzes a package directory and extracts information
 */
export class PackageAnalyzer {
  private config: PackageConfig;

  constructor(config: PackageConfig) {
    this.config = config;
  }

  /**
   * Analyze a package directory
   */
  async analyze(packagePath: string): Promise<PackageInfo> {
    const packageJsonPath = path.join(packagePath, 'package.json');
    const readmePath = path.join(packagePath, 'README.md');
    const changelogPath = path.join(packagePath, 'CHANGELOG.md');

    // Read package.json
    const packageJson = await this.readPackageJson(packageJsonPath);

    // Read README if it exists
    const readme = await this.readFileIfExists(readmePath);

    // Read CHANGELOG if it exists
    const changelog = await this.readFileIfExists(changelogPath);

    // Extract exports and types
    const exports = await this.extractExports(packagePath, packageJson);
    const types = await this.extractTypes(packagePath, packageJson);

    return {
      name: packageJson.name,
      displayName: this.extractDisplayName(packageJson),
      description: packageJson.description || '',
      version: packageJson.version || '0.0.0',
      path: packagePath,
      category: this.config.category || 'Other',
      keywords: packageJson.keywords || [],
      dependencies: Object.keys(packageJson.dependencies || {}),
      peerDependencies: Object.keys(packageJson.peerDependencies || {}),
      devDependencies: Object.keys(packageJson.devDependencies || {}),
      exports,
      types,
      api: [], // Will be populated by TypeScript analyzer
      examples: [], // Will be populated by example analyzer
      readme,
      changelog,
      license: packageJson.license,
      repository: packageJson.repository,
      homepage: packageJson.homepage,
      bugs: packageJson.bugs,
      author: packageJson.author,
      contributors: packageJson.contributors
    };
  }

  /**
   * Read package.json file
   */
  private async readPackageJson(packageJsonPath: string): Promise<any> {
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to read package.json at ${packageJsonPath}: ${error}`);
    }
  }

  /**
   * Read file if it exists
   */
  private async readFileIfExists(filePath: string): Promise<string | undefined> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Extract display name from package.json
   */
  private extractDisplayName(packageJson: any): string | undefined {
    // Try various fields for display name
    return packageJson.displayName || 
           packageJson.title || 
           this.formatPackageName(packageJson.name);
  }

  /**
   * Format package name for display
   */
  private formatPackageName(name: string): string {
    // Remove scope if present
    const nameWithoutScope = name.replace(/^@[^/]+\//, '');
    
    // Convert kebab-case to Title Case
    return nameWithoutScope
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Extract exports from package.json
   */
  private async extractExports(_packagePath: string, packageJson: any): Promise<Record<string, string>> {
    const exports: Record<string, string> = {};

    if (packageJson.exports) {
      for (const [key, value] of Object.entries(packageJson.exports)) {
        if (typeof value === 'string') {
          exports[key] = value;
        } else if (typeof value === 'object' && value !== null) {
          // Handle conditional exports
          const exportValue = value as any;
          if (exportValue.import) {
            exports[key] = exportValue.import;
          } else if (exportValue.require) {
            exports[key] = exportValue.require;
          } else if (exportValue.default) {
            exports[key] = exportValue.default;
          }
        }
      }
    } else {
      // Fallback to main/module fields
      if (packageJson.main) {
        exports['.'] = packageJson.main;
      }
      if (packageJson.module) {
        exports['./module'] = packageJson.module;
      }
      if (packageJson.types) {
        exports['./types'] = packageJson.types;
      }
    }

    return exports;
  }

  /**
   * Extract type definitions
   */
  private async extractTypes(packagePath: string, packageJson: any): Promise<Record<string, string>> {
    const types: Record<string, string> = {};

    if (packageJson.types) {
      types['.'] = packageJson.types;
    }

    if (packageJson.exports) {
      for (const [key, value] of Object.entries(packageJson.exports)) {
        if (typeof value === 'object' && value !== null && (value as any).types) {
          types[key] = (value as any).types;
        }
      }
    }

    // Look for .d.ts files in the package
    try {
      const distPath = path.join(packagePath, 'dist');
      const distExists = await fs.access(distPath).then(() => true).catch(() => false);
      
      if (distExists) {
        const typeFiles = await this.findTypeFiles(distPath);
        for (const typeFile of typeFiles) {
          const relativePath = path.relative(distPath, typeFile);
          const exportKey = `./${relativePath.replace(/\.d\.ts$/, '')}`;
          types[exportKey] = relativePath;
        }
      }
    } catch (error) {
      // Ignore errors when looking for type files
    }

    return types;
  }

  /**
   * Find TypeScript declaration files
   */
  private async findTypeFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.findTypeFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.d.ts')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return files;
  }
}
