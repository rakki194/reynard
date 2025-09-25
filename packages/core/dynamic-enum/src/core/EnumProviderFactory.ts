/**
 * Factory for creating enum providers
 */

import type { EnumProvider, EnumProviderFactory } from "../types";
import type { EnumProviderConfig } from "../types/EnumTypes";
import type { EnumDataProvider } from "../types/DataProvider";

/**
 * Implementation of the enum provider factory
 */
export class DynamicEnumProviderFactory implements EnumProviderFactory {
  private providerConstructors: Map<
    string,
    new (config: EnumProviderConfig, dataProvider?: EnumDataProvider) => EnumProvider
  > = new Map();

  /**
   * Register a provider constructor for an enum type
   */
  registerProviderConstructor(
    enumType: string,
    constructor: new (config: EnumProviderConfig, dataProvider?: EnumDataProvider) => EnumProvider
  ): void {
    this.providerConstructors.set(enumType, constructor);
  }

  /**
   * Create a new provider instance
   */
  createProvider(enumType: string, config: EnumProviderConfig, dataProvider?: EnumDataProvider): EnumProvider {
    const Constructor = this.providerConstructors.get(enumType);

    if (!Constructor) {
      throw new Error(`No provider constructor registered for enum type: ${enumType}`);
    }

    try {
      return new Constructor(config, dataProvider);
    } catch (error) {
      throw new Error(`Failed to create provider for enum type '${enumType}': ${error}`);
    }
  }

  /**
   * Get supported enum types
   */
  getSupportedTypes(): string[] {
    return Array.from(this.providerConstructors.keys());
  }

  /**
   * Check if a provider type is supported
   */
  isSupported(enumType: string): boolean {
    return this.providerConstructors.has(enumType);
  }

  /**
   * Unregister a provider constructor
   */
  unregisterProviderConstructor(enumType: string): void {
    this.providerConstructors.delete(enumType);
  }

  /**
   * Get the number of registered constructors
   */
  getConstructorCount(): number {
    return this.providerConstructors.size;
  }

  /**
   * Clear all registered constructors
   */
  clear(): void {
    this.providerConstructors.clear();
  }
}
