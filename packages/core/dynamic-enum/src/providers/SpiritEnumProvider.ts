/**
 * Provider for animal spirit enums
 */

import { BaseEnumProvider } from "../core/EnumProvider";
import type { EnumProviderConfig, EnumData, EnumValue } from "../types";
import type { EnumDataProvider } from "../types/DataProvider";

/**
 * Provider for animal spirit enums with weighted selection
 */
export class SpiritEnumProvider extends BaseEnumProvider {
  constructor(config: EnumProviderConfig, dataProvider?: EnumDataProvider) {
    super(config, dataProvider);
  }

  /**
   * Fetch spirit enum data from the data source
   */
  protected async fetchEnumData(): Promise<EnumData> {
    if (this.dataProvider) {
      try {
        return await this.dataProvider.fetchEnumData("spirits");
      } catch (error) {
        console.warn(`Failed to fetch spirit data from provider: ${error}`);
        return this.fallbackData;
      }
    }

    return this.fallbackData;
  }

  /**
   * Get a random spirit with weighted selection
   */
  async getRandomSpirit(weighted = true): Promise<EnumValue> {
    const data = await this.getEnumData();
    const keys = Object.keys(data);

    if (keys.length === 0) {
      return {
        value: this.defaultFallback,
        weight: 1.0,
        metadata: { emoji: "🦊", description: "Default spirit" },
      };
    }

    const selectedKey = this.selectRandomKey(keys, data, weighted);
    return data[selectedKey];
  }

  /**
   * Get spirits by category
   */
  async getSpiritsByCategory(category: string): Promise<EnumData> {
    const data = await this.getEnumData();
    const filtered: EnumData = {};

    for (const [key, value] of Object.entries(data)) {
      if (value.metadata?.category === category) {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  /**
   * Get all available spirit categories
   */
  async getSpiritCategories(): Promise<string[]> {
    const data = await this.getEnumData();
    const categories = new Set<string>();

    for (const value of Object.values(data)) {
      if (value.metadata?.category) {
        categories.add(value.metadata.category as string);
      }
    }

    return Array.from(categories);
  }

  /**
   * Get spirit by emoji
   */
  async getSpiritByEmoji(emoji: string): Promise<EnumValue | null> {
    const data = await this.getEnumData();

    for (const value of Object.values(data)) {
      if (value.metadata?.emoji === emoji) {
        return value;
      }
    }

    return null;
  }

  /**
   * Get spirits with high weight (more likely to be selected)
   */
  async getHighWeightSpirits(threshold = 0.5): Promise<EnumData> {
    const data = await this.getEnumData();
    const filtered: EnumData = {};

    for (const [key, value] of Object.entries(data)) {
      if ((value.weight || 1.0) >= threshold) {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  /**
   * Get spirits with low weight (less likely to be selected)
   */
  async getLowWeightSpirits(threshold = 0.5): Promise<EnumData> {
    const data = await this.getEnumData();
    const filtered: EnumData = {};

    for (const [key, value] of Object.entries(data)) {
      if ((value.weight || 1.0) < threshold) {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  /**
   * Get spirit statistics
   */
  async getSpiritStatistics(): Promise<{
    total: number;
    categories: Record<string, number>;
    weightDistribution: { min: number; max: number; average: number };
    emojiCount: number;
  }> {
    const data = await this.getEnumData();
    const categories: Record<string, number> = {};
    let totalWeight = 0;
    let minWeight = Infinity;
    let maxWeight = -Infinity;
    let emojiCount = 0;

    for (const value of Object.values(data)) {
      // Count categories
      if (value.metadata?.category) {
        const category = value.metadata.category as string;
        categories[category] = (categories[category] || 0) + 1;
      }

      // Track weights
      const weight = value.weight || 1.0;
      totalWeight += weight;
      minWeight = Math.min(minWeight, weight);
      maxWeight = Math.max(maxWeight, weight);

      // Count emojis
      if (value.metadata?.emoji) {
        emojiCount++;
      }
    }

    return {
      total: Object.keys(data).length,
      categories,
      weightDistribution: {
        min: minWeight === Infinity ? 0 : minWeight,
        max: maxWeight === -Infinity ? 0 : maxWeight,
        average: Object.keys(data).length > 0 ? totalWeight / Object.keys(data).length : 0,
      },
      emojiCount,
    };
  }
}
