/**
 * Fallback manager for the Dynamic Enum System
 */

import type { EnumData, EnumValue, ValidationResult } from "../types/EnumTypes";

/**
 * Fallback manager for handling enum data when primary sources fail
 */
export class FallbackManager {
  private fallbackData: Map<string, EnumData> = new Map();
  private defaultFallbacks: Map<string, string> = new Map();
  private fallbackStrategy: "silent" | "warn" | "error" = "warn";

  /**
   * Set fallback data for an enum type
   */
  setFallbackData(enumType: string, data: EnumData): void {
    this.fallbackData.set(enumType, data);
  }

  /**
   * Get fallback data for an enum type
   */
  getFallbackData(enumType: string): EnumData | null {
    return this.fallbackData.get(enumType) || null;
  }

  /**
   * Set default fallback value for an enum type
   */
  setDefaultFallback(enumType: string, value: string): void {
    this.defaultFallbacks.set(enumType, value);
  }

  /**
   * Get default fallback value for an enum type
   */
  getDefaultFallback(enumType: string): string | null {
    return this.defaultFallbacks.get(enumType) || null;
  }

  /**
   * Set fallback strategy
   */
  setFallbackStrategy(strategy: "silent" | "warn" | "error"): void {
    this.fallbackStrategy = strategy;
  }

  /**
   * Get fallback strategy
   */
  getFallbackStrategy(): string {
    return this.fallbackStrategy;
  }

  /**
   * Get fallback enum value
   */
  getFallbackValue(enumType: string, key?: string): EnumValue | null {
    const fallbackData = this.getFallbackData(enumType);

    if (!fallbackData) {
      return null;
    }

    if (key && fallbackData[key]) {
      return fallbackData[key];
    }

    // Return first available value
    const firstKey = Object.keys(fallbackData)[0];
    return firstKey ? fallbackData[firstKey] : null;
  }

  /**
   * Get fallback enum data with error handling
   */
  getFallbackDataWithErrorHandling(enumType: string, error: Error): EnumData {
    const fallbackData = this.getFallbackData(enumType);

    if (!fallbackData) {
      this.handleFallbackError(enumType, error, "No fallback data available");
      return {};
    }

    this.handleFallbackError(enumType, error, "Using fallback data");
    return fallbackData;
  }

  /**
   * Validate fallback data
   */
  validateFallbackData(enumType: string): ValidationResult {
    const fallbackData = this.getFallbackData(enumType);

    if (!fallbackData) {
      return {
        isValid: false,
        value: null,
        error: `No fallback data available for enum type '${enumType}'`,
      };
    }

    if (Object.keys(fallbackData).length === 0) {
      return {
        isValid: false,
        value: null,
        error: `Fallback data for enum type '${enumType}' is empty`,
      };
    }

    // Validate each enum value
    for (const [key, value] of Object.entries(fallbackData)) {
      if (!value || typeof value !== "object" || !value.value) {
        return {
          isValid: false,
          value: null,
          error: `Invalid fallback value for key '${key}' in enum type '${enumType}'`,
        };
      }
    }

    return {
      isValid: true,
      value: "valid",
      error: null,
    };
  }

  /**
   * Get fallback statistics
   */
  getFallbackStatistics(): {
    totalTypes: number;
    typesWithFallback: number;
    typesWithDefault: number;
    strategy: string;
  } {
    return {
      totalTypes: Math.max(this.fallbackData.size, this.defaultFallbacks.size),
      typesWithFallback: this.fallbackData.size,
      typesWithDefault: this.defaultFallbacks.size,
      strategy: this.fallbackStrategy,
    };
  }

  /**
   * Clear fallback data for an enum type
   */
  clearFallbackData(enumType: string): void {
    this.fallbackData.delete(enumType);
    this.defaultFallbacks.delete(enumType);
  }

  /**
   * Clear all fallback data
   */
  clearAllFallbackData(): void {
    this.fallbackData.clear();
    this.defaultFallbacks.clear();
  }

  /**
   * Get all enum types with fallback data
   */
  getEnumTypesWithFallback(): string[] {
    return Array.from(this.fallbackData.keys());
  }

  /**
   * Get all enum types with default fallbacks
   */
  getEnumTypesWithDefault(): string[] {
    return Array.from(this.defaultFallbacks.keys());
  }

  /**
   * Check if fallback data exists for an enum type
   */
  hasFallbackData(enumType: string): boolean {
    return this.fallbackData.has(enumType);
  }

  /**
   * Check if default fallback exists for an enum type
   */
  hasDefaultFallback(enumType: string): boolean {
    return this.defaultFallbacks.has(enumType);
  }

  /**
   * Handle fallback errors based on strategy
   */
  private handleFallbackError(enumType: string, error: Error, message: string): void {
    const fullMessage = `${message} for enum type '${enumType}': ${error.message}`;

    switch (this.fallbackStrategy) {
      case "silent":
        // Do nothing
        break;
      case "warn":
        console.warn(fullMessage);
        break;
      case "error":
        console.error(fullMessage);
        break;
    }
  }

  /**
   * Create fallback data from a simple object
   */
  createFallbackDataFromObject(enumType: string, data: Record<string, string>): void {
    const enumData: EnumData = {};

    for (const [key, value] of Object.entries(data)) {
      enumData[key] = {
        value,
        weight: 1.0,
        metadata: {},
      };
    }

    this.setFallbackData(enumType, enumData);
  }

  /**
   * Create fallback data from an array
   */
  createFallbackDataFromArray(enumType: string, data: string[]): void {
    const enumData: EnumData = {};

    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      enumData[`item_${i}`] = {
        value,
        weight: 1.0,
        metadata: { index: i },
      };
    }

    this.setFallbackData(enumType, enumData);
  }

  /**
   * Export fallback data to JSON
   */
  exportFallbackData(): string {
    const data = {
      fallbackData: Object.fromEntries(this.fallbackData),
      defaultFallbacks: Object.fromEntries(this.defaultFallbacks),
      strategy: this.fallbackStrategy,
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import fallback data from JSON
   */
  importFallbackData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.fallbackData) {
        this.fallbackData = new Map(Object.entries(data.fallbackData));
      }

      if (data.defaultFallbacks) {
        this.defaultFallbacks = new Map(Object.entries(data.defaultFallbacks));
      }

      if (data.strategy) {
        this.fallbackStrategy = data.strategy;
      }

      return true;
    } catch (error) {
      console.error("Failed to import fallback data:", error);
      return false;
    }
  }
}
