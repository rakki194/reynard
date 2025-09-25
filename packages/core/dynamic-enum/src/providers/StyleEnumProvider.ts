/**
 * Provider for naming style enums
 */

import { BaseEnumProvider } from "../core/EnumProvider";
import type { EnumProviderConfig, EnumData, EnumValue } from "../types";
import type { EnumDataProvider } from "../types/DataProvider";

/**
 * Provider for naming style enums
 */
export class StyleEnumProvider extends BaseEnumProvider {
  constructor(config: EnumProviderConfig, dataProvider?: EnumDataProvider) {
    super(config, dataProvider);
  }

  /**
   * Fetch style enum data from the data source
   */
  protected async fetchEnumData(): Promise<EnumData> {
    if (this.dataProvider) {
      try {
        return await this.dataProvider.fetchEnumData("styles");
      } catch (error) {
        console.warn(`Failed to fetch style data from provider: ${error}`);
        return this.fallbackData;
      }
    }

    return this.fallbackData;
  }

  /**
   * Get a random style
   */
  async getRandomStyle(): Promise<EnumValue> {
    const data = await this.getEnumData();
    const keys = Object.keys(data);

    if (keys.length === 0) {
      return {
        value: this.defaultFallback,
        weight: 1.0,
        metadata: { description: "Default style" },
      };
    }

    const selectedKey = this.selectRandomKey(keys, data, false);
    return data[selectedKey];
  }

  /**
   * Get styles by type (foundation, exo, hybrid, etc.)
   */
  async getStylesByType(type: string): Promise<EnumData> {
    const data = await this.getEnumData();
    const filtered: EnumData = {};

    for (const [key, value] of Object.entries(data)) {
      if (value.metadata?.type === type) {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  /**
   * Get all available style types
   */
  async getStyleTypes(): Promise<string[]> {
    const data = await this.getEnumData();
    const types = new Set<string>();

    for (const value of Object.values(data)) {
      if (value.metadata?.type) {
        types.add(value.metadata.type as string);
      }
    }

    return Array.from(types);
  }

  /**
   * Get style by name
   */
  async getStyleByName(name: string): Promise<EnumValue | null> {
    const data = await this.getEnumData();

    for (const [key, value] of Object.entries(data)) {
      if (key.toLowerCase() === name.toLowerCase() || value.value.toLowerCase() === name.toLowerCase()) {
        return value;
      }
    }

    return null;
  }

  /**
   * Get styles with specific characteristics
   */
  async getStylesWithCharacteristic(characteristic: string): Promise<EnumData> {
    const data = await this.getEnumData();
    const filtered: EnumData = {};

    for (const [key, value] of Object.entries(data)) {
      const characteristics = value.metadata?.characteristics as string[];
      if (characteristics?.includes(characteristic)) {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  /**
   * Get style statistics
   */
  async getStyleStatistics(): Promise<{
    total: number;
    types: Record<string, number>;
    characteristics: Record<string, number>;
    averageWeight: number;
  }> {
    const data = await this.getEnumData();
    const types: Record<string, number> = {};
    const characteristics: Record<string, number> = {};
    let totalWeight = 0;

    for (const value of Object.values(data)) {
      // Count types
      if (value.metadata?.type) {
        const type = value.metadata.type as string;
        types[type] = (types[type] || 0) + 1;
      }

      // Count characteristics
      if (value.metadata?.characteristics) {
        const chars = value.metadata.characteristics as string[];
        for (const char of chars) {
          characteristics[char] = (characteristics[char] || 0) + 1;
        }
      }

      // Track weights
      totalWeight += value.weight || 1.0;
    }

    return {
      total: Object.keys(data).length,
      types,
      characteristics,
      averageWeight: Object.keys(data).length > 0 ? totalWeight / Object.keys(data).length : 0,
    };
  }

  /**
   * Validate style name format
   */
  validateStyleName(name: string): boolean {
    if (!name || typeof name !== "string") {
      return false;
    }

    // Check for valid style name patterns
    const validPatterns = [
      /^[a-zA-Z]+-[a-zA-Z]+-\d+$/, // foundation-style-123
      /^[a-zA-Z]+-[a-zA-Z]+$/, // foundation-style
      /^[a-zA-Z]+$/, // foundation
    ];

    return validPatterns.some(pattern => pattern.test(name));
  }

  /**
   * Generate a style name based on type and characteristics
   */
  async generateStyleName(type: string, characteristics: string[] = []): Promise<string> {
    const data = await this.getEnumData();
    const typeStyles = await this.getStylesByType(type);

    if (Object.keys(typeStyles).length === 0) {
      return `${type}-default-1`;
    }

    // Find styles that match the characteristics
    let matchingStyles = typeStyles;
    for (const char of characteristics) {
      const charStyles = await this.getStylesWithCharacteristic(char);
      matchingStyles = { ...matchingStyles, ...charStyles };
    }

    if (Object.keys(matchingStyles).length === 0) {
      // Fallback to any style of the type
      const keys = Object.keys(typeStyles);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      return typeStyles[randomKey].value;
    }

    // Select a random matching style
    const keys = Object.keys(matchingStyles);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return matchingStyles[randomKey].value;
  }
}
