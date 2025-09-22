/**
 * File-based data adapter for fetching enum data from local files
 */

import type { EnumDataProvider, FileDataProviderConfig } from '../types/DataProvider';
import type { EnumData } from '../types/EnumTypes';

/**
 * File-based data provider implementation
 */
export class FileDataAdapter implements EnumDataProvider {
  private config: FileDataProviderConfig;
  private filePath: string;
  private format: 'json' | 'yaml' | 'toml';
  private watch: boolean;
  private cachedData?: EnumData;
  private lastModified?: number;

  constructor(config: FileDataProviderConfig) {
    this.config = config;
    this.filePath = config.filePath;
    this.format = config.format;
    this.watch = config.watch || false;
  }

  /**
   * Fetch enum data for a specific enum type
   */
  async fetchEnumData(enumType: string): Promise<EnumData> {
    try {
      // Check if we need to reload the file
      if (this.shouldReloadFile()) {
        await this.loadFile();
      }

      // Extract data for the specific enum type
      if (!this.cachedData || !this.cachedData[enumType]) {
        throw new Error(`Enum type '${enumType}' not found in file`);
      }

      return this.cachedData[enumType] as unknown as EnumData;
    } catch (error) {
      throw new Error(`Failed to fetch enum data for '${enumType}': ${error}`);
    }
  }

  /**
   * Check if the provider is available/healthy
   */
  async isAvailable(): Promise<boolean> {
    try {
      // In a browser environment, we can't directly check file existence
      // In Node.js, we could use fs.statSync
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the name/identifier of this provider
   */
  getProviderName(): string {
    return `File-${this.filePath}`;
  }

  /**
   * Load data from the file
   */
  private async loadFile(): Promise<void> {
    try {
      const response = await fetch(this.filePath);
      
      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      const data = this.parseFileContent(text);
      
      this.cachedData = data;
      this.lastModified = Date.now();
    } catch (error) {
      throw new Error(`Failed to load file '${this.filePath}': ${error}`);
    }
  }

  /**
   * Parse file content based on format
   */
  private parseFileContent(content: string): EnumData {
    switch (this.format) {
      case 'json':
        return this.parseJSON(content);
      case 'yaml':
        return this.parseYAML(content);
      case 'toml':
        return this.parseTOML(content);
      default:
        throw new Error(`Unsupported file format: ${this.format}`);
    }
  }

  /**
   * Parse JSON content
   */
  private parseJSON(content: string): EnumData {
    try {
      const data = JSON.parse(content);
      return this.transformToEnumData(data);
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error}`);
    }
  }

  /**
   * Parse YAML content (simplified implementation)
   */
  private parseYAML(content: string): EnumData {
    // This is a simplified YAML parser
    // In a real implementation, you'd use a proper YAML library
    try {
      const lines = content.split('\n');
      const data: any = {};
      let currentKey = '';
      let currentValue: any = {};
      let inValue = false;

      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('- ')) {
          // Array item
          if (currentKey) {
            if (!data[currentKey]) {
              data[currentKey] = [];
            }
            data[currentKey].push(trimmed.substring(2));
          }
        } else if (trimmed.includes(':')) {
          // Key-value pair
          const [key, value] = trimmed.split(':', 2);
          const cleanKey = key.trim();
          const cleanValue = value.trim();
          
          if (cleanValue) {
            data[cleanKey] = cleanValue;
          } else {
            currentKey = cleanKey;
            currentValue = {};
            inValue = true;
          }
        } else if (inValue && trimmed) {
          // Continuation of value
          currentValue[trimmed] = true;
        }
      }

      return this.transformToEnumData(data);
    } catch (error) {
      throw new Error(`Invalid YAML format: ${error}`);
    }
  }

  /**
   * Parse TOML content (simplified implementation)
   */
  private parseTOML(content: string): EnumData {
    // This is a simplified TOML parser
    // In a real implementation, you'd use a proper TOML library
    try {
      const lines = content.split('\n');
      const data: any = {};
      let currentSection = '';

      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          // Section header
          currentSection = trimmed.slice(1, -1);
          data[currentSection] = {};
        } else if (trimmed.includes('=')) {
          // Key-value pair
          const [key, value] = trimmed.split('=', 2);
          const cleanKey = key.trim();
          const cleanValue = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
          
          if (currentSection) {
            data[currentSection][cleanKey] = cleanValue;
          } else {
            data[cleanKey] = cleanValue;
          }
        }
      }

      return this.transformToEnumData(data);
    } catch (error) {
      throw new Error(`Invalid TOML format: ${error}`);
    }
  }

  /**
   * Transform parsed data to EnumData format
   */
  private transformToEnumData(data: any): EnumData {
    const enumData: EnumData = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null) {
        // Object format: { key: { value: 'value', weight: 1.0, metadata: {...} } }
        for (const [subKey, subValue] of Object.entries(value)) {
          if (typeof subValue === 'object' && subValue !== null) {
            const enumValue = subValue as any;
            enumData[subKey] = {
              value: enumValue.value || subKey,
              weight: enumValue.weight || 1.0,
              metadata: enumValue.metadata || {}
            };
          } else {
            // Simple key-value format: { key: 'value' }
            enumData[subKey] = {
              value: subValue as string,
              weight: 1.0,
              metadata: {}
            };
          }
        }
      } else {
        // Simple key-value format: { key: 'value' }
        enumData[key] = {
          value: value as string,
          weight: 1.0,
          metadata: {}
        };
      }
    }

    return enumData;
  }

  /**
   * Check if the file should be reloaded
   */
  private shouldReloadFile(): boolean {
    if (!this.cachedData || !this.lastModified) {
      return true;
    }

    if (!this.watch) {
      return false;
    }

    // In a real implementation, you'd check file modification time
    // For now, we'll use a simple time-based check
    return Date.now() - this.lastModified > 60000; // 1 minute
  }
}
