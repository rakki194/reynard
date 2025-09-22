/**
 * Provider for custom/user-defined enums
 */

import { BaseEnumProvider } from '../core/EnumProvider';
import type { EnumProviderConfig, EnumData, EnumValue } from '../types';
import type { EnumDataProvider } from '../types/DataProvider';

/**
 * Provider for custom/user-defined enums
 */
export class CustomEnumProvider extends BaseEnumProvider {
  private customData?: EnumData;
  private dataSource?: 'provider' | 'custom' | 'fallback';

  constructor(config: EnumProviderConfig, dataProvider?: EnumDataProvider) {
    super(config, dataProvider);
  }

  /**
   * Set custom enum data
   */
  setCustomData(data: EnumData): void {
    this.customData = data;
    this.dataSource = 'custom';
  }

  /**
   * Get current data source
   */
  getDataSource(): 'provider' | 'custom' | 'fallback' {
    return this.dataSource || 'fallback';
  }

  /**
   * Fetch enum data from the data source
   */
  protected async fetchEnumData(): Promise<EnumData> {
    // If custom data is set, use it
    if (this.customData) {
      this.dataSource = 'custom';
      return this.customData;
    }

    // Try to fetch from data provider
    if (this.dataProvider) {
      try {
        const data = await this.dataProvider.fetchEnumData(this.enumType);
        this.dataSource = 'provider';
        return data;
      } catch (error) {
        console.warn(`Failed to fetch custom enum data from provider: ${error}`);
      }
    }

    // Fall back to fallback data
    this.dataSource = 'fallback';
    return this.fallbackData;
  }

  /**
   * Add a custom enum value
   */
  addCustomValue(key: string, value: EnumValue): void {
    if (!this.customData) {
      this.customData = {};
    }
    
    this.customData[key] = value;
    this.dataSource = 'custom';
  }

  /**
   * Remove a custom enum value
   */
  removeCustomValue(key: string): boolean {
    if (!this.customData) {
      return false;
    }

    const removed = delete this.customData[key];
    if (removed && Object.keys(this.customData).length === 0) {
      this.customData = undefined;
      this.dataSource = 'fallback';
    }

    return removed;
  }

  /**
   * Update a custom enum value
   */
  updateCustomValue(key: string, value: EnumValue): boolean {
    if (!this.customData || !this.customData[key]) {
      return false;
    }

    this.customData[key] = value;
    return true;
  }

  /**
   * Clear all custom data
   */
  clearCustomData(): void {
    this.customData = undefined;
    this.dataSource = 'fallback';
  }

  /**
   * Get custom data only
   */
  getCustomData(): EnumData | undefined {
    return this.customData;
  }

  /**
   * Check if a value is custom
   */
  isCustomValue(key: string): boolean {
    return this.customData !== undefined && this.customData[key] !== undefined;
  }

  /**
   * Get all custom keys
   */
  getCustomKeys(): string[] {
    return this.customData ? Object.keys(this.customData) : [];
  }

  /**
   * Get custom data statistics
   */
  getCustomDataStatistics(): {
    total: number;
    custom: number;
    provider: number;
    fallback: number;
    dataSource: string;
  } {
    const total = this.getCount();
    const custom = this.customData ? Object.keys(this.customData).length : 0;
    const provider = this.dataSource === 'provider' ? total - custom : 0;
    const fallback = this.dataSource === 'fallback' ? total : 0;

    return {
      total,
      custom,
      provider,
      fallback,
      dataSource: this.dataSource || 'fallback'
    };
  }

  /**
   * Export custom data to JSON
   */
  exportCustomData(): string {
    return JSON.stringify(this.customData || {}, null, 2);
  }

  /**
   * Import custom data from JSON
   */
  importCustomData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate the data structure
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid data format');
      }

      // Validate each enum value
      for (const [key, value] of Object.entries(data)) {
        if (typeof value !== 'object' || value === null || !('value' in value)) {
          throw new Error(`Invalid enum value for key '${key}'`);
        }
      }

      this.customData = data as EnumData;
      this.dataSource = 'custom';
      return true;
    } catch (error) {
      console.error('Failed to import custom data:', error);
      return false;
    }
  }

  /**
   * Merge custom data with provider data
   */
  async mergeWithProviderData(): Promise<EnumData> {
    const providerData = await this.fetchEnumData();
    const customData = this.customData || {};
    
    // Merge custom data with provider data (custom takes precedence)
    return { ...providerData, ...customData };
  }

  /**
   * Get data source information
   */
  getDataSourceInfo(): {
    source: string;
    hasCustom: boolean;
    hasProvider: boolean;
    hasFallback: boolean;
  } {
    return {
      source: this.dataSource || 'fallback',
      hasCustom: this.customData !== undefined,
      hasProvider: this.dataProvider !== undefined,
      hasFallback: Object.keys(this.fallbackData).length > 0
    };
  }
}
