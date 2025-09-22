/**
 * Provider for trait enums (personality, physical, ability traits)
 */

import { BaseEnumProvider } from '../core/EnumProvider';
import type { EnumProviderConfig, EnumData, EnumValue } from '../types';
import type { EnumDataProvider } from '../types/DataProvider';

/**
 * Provider for trait enums with specialized trait operations
 */
export class TraitEnumProvider extends BaseEnumProvider {
  constructor(config: EnumProviderConfig, dataProvider?: EnumDataProvider) {
    super(config, dataProvider);
  }

  /**
   * Fetch trait enum data from the data source
   */
  protected async fetchEnumData(): Promise<EnumData> {
    if (this.dataProvider) {
      try {
        return await this.dataProvider.fetchEnumData('traits');
      } catch (error) {
        console.warn(`Failed to fetch trait data from provider: ${error}`);
        return this.fallbackData;
      }
    }

    return this.fallbackData;
  }

  /**
   * Get traits by category (personality, physical, ability)
   */
  async getTraitsByCategory(category: 'personality' | 'physical' | 'ability'): Promise<EnumData> {
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
   * Get all available trait categories
   */
  async getTraitCategories(): Promise<string[]> {
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
   * Get traits by value range
   */
  async getTraitsByValueRange(min: number, max: number): Promise<EnumData> {
    const data = await this.getEnumData();
    const filtered: EnumData = {};

    for (const [key, value] of Object.entries(data)) {
      const traitValue = value.metadata?.value as number;
      if (traitValue !== undefined && traitValue >= min && traitValue <= max) {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  /**
   * Get traits by tags
   */
  async getTraitsByTags(tags: string[]): Promise<EnumData> {
    const data = await this.getEnumData();
    const filtered: EnumData = {};

    for (const [key, value] of Object.entries(data)) {
      const traitTags = value.metadata?.tags as string[];
      if (traitTags && tags.some(tag => traitTags.includes(tag))) {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  /**
   * Get random traits for character generation
   */
  async getRandomTraitsForCharacter(
    personalityCount = 3,
    physicalCount = 2,
    abilityCount = 2
  ): Promise<{
    personality: EnumValue[];
    physical: EnumValue[];
    ability: EnumValue[];
  }> {
    const personalityTraits = await this.getTraitsByCategory('personality');
    const physicalTraits = await this.getTraitsByCategory('physical');
    const abilityTraits = await this.getTraitsByCategory('ability');

    return {
      personality: this.selectRandomTraits(personalityTraits, personalityCount),
      physical: this.selectRandomTraits(physicalTraits, physicalCount),
      ability: this.selectRandomTraits(abilityTraits, abilityCount)
    };
  }

  /**
   * Get trait compatibility score between two traits
   */
  async getTraitCompatibility(trait1: string, trait2: string): Promise<number> {
    const data = await this.getEnumData();
    const trait1Data = data[trait1];
    const trait2Data = data[trait2];

    if (!trait1Data || !trait2Data) {
      return 0;
    }

    // Calculate compatibility based on metadata
    let compatibility = 0.5; // Base compatibility

    // Check if traits are in the same category
    if (trait1Data.metadata?.category === trait2Data.metadata?.category) {
      compatibility += 0.2;
    }

    // Check for shared tags
    const tags1 = trait1Data.metadata?.tags as string[];
    const tags2 = trait2Data.metadata?.tags as string[];
    if (tags1 && tags2) {
      const sharedTags = tags1.filter(tag => tags2.includes(tag));
      compatibility += sharedTags.length * 0.1;
    }

    // Check for complementary values
    const value1 = trait1Data.metadata?.value as number;
    const value2 = trait2Data.metadata?.value as number;
    if (value1 !== undefined && value2 !== undefined) {
      const valueDiff = Math.abs(value1 - value2);
      compatibility += (1 - valueDiff / 10) * 0.3; // Normalize to 0-1 range
    }

    return Math.min(1, Math.max(0, compatibility));
  }

  /**
   * Get trait statistics
   */
  async getTraitStatistics(): Promise<{
    total: number;
    categories: Record<string, number>;
    valueDistribution: { min: number; max: number; average: number };
    tagCounts: Record<string, number>;
  }> {
    const data = await this.getEnumData();
    const categories: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};
    let totalValue = 0;
    let minValue = Infinity;
    let maxValue = -Infinity;

    for (const value of Object.values(data)) {
      // Count categories
      if (value.metadata?.category) {
        const category = value.metadata.category as string;
        categories[category] = (categories[category] || 0) + 1;
      }

      // Track values
      const traitValue = value.metadata?.value as number;
      if (traitValue !== undefined) {
        totalValue += traitValue;
        minValue = Math.min(minValue, traitValue);
        maxValue = Math.max(maxValue, traitValue);
      }

      // Count tags
      const tags = value.metadata?.tags as string[];
      if (tags) {
        for (const tag of tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      }
    }

    return {
      total: Object.keys(data).length,
      categories,
      valueDistribution: {
        min: minValue === Infinity ? 0 : minValue,
        max: maxValue === -Infinity ? 0 : maxValue,
        average: Object.keys(data).length > 0 ? totalValue / Object.keys(data).length : 0
      },
      tagCounts
    };
  }

  /**
   * Select random traits from a category
   */
  private selectRandomTraits(traits: EnumData, count: number): EnumValue[] {
    const keys = Object.keys(traits);
    if (keys.length === 0) {
      return [];
    }

    const selected: EnumValue[] = [];
    const usedKeys = new Set<string>();

    for (let i = 0; i < Math.min(count, keys.length); i++) {
      let randomKey: string;
      do {
        randomKey = keys[Math.floor(Math.random() * keys.length)];
      } while (usedKeys.has(randomKey));

      usedKeys.add(randomKey);
      selected.push(traits[randomKey]);
    }

    return selected;
  }

  /**
   * Get trait by name
   */
  async getTraitByName(name: string): Promise<EnumValue | null> {
    const data = await this.getEnumData();

    for (const [key, value] of Object.entries(data)) {
      if (key.toLowerCase() === name.toLowerCase() || 
          value.value.toLowerCase() === name.toLowerCase()) {
        return value;
      }
    }

    return null;
  }

  /**
   * Get traits with high values (dominant traits)
   */
  async getDominantTraits(threshold = 7): Promise<EnumData> {
    return await this.getTraitsByValueRange(threshold, 10);
  }

  /**
   * Get traits with low values (recessive traits)
   */
  async getRecessiveTraits(threshold = 3): Promise<EnumData> {
    return await this.getTraitsByValueRange(1, threshold);
  }
}
