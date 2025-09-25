/**
 * Registry for managing enum providers
 */

import type { EnumProvider, EnumProviderRegistry } from "../types";

/**
 * Implementation of the enum provider registry
 */
export class DynamicEnumProviderRegistry implements EnumProviderRegistry {
  private providers: Map<string, EnumProvider> = new Map();

  /**
   * Register a provider for an enum type
   */
  registerProvider(enumType: string, provider: EnumProvider): void {
    if (!enumType || !provider) {
      throw new Error("Enum type and provider are required");
    }

    if (this.providers.has(enumType)) {
      console.warn(`Provider for enum type '${enumType}' is already registered. Overwriting.`);
    }

    this.providers.set(enumType, provider);
  }

  /**
   * Get a provider for an enum type
   */
  getProvider(enumType: string): EnumProvider | null {
    return this.providers.get(enumType) || null;
  }

  /**
   * Unregister a provider
   */
  unregisterProvider(enumType: string): void {
    this.providers.delete(enumType);
  }

  /**
   * Get all registered enum types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a provider is registered
   */
  hasProvider(enumType: string): boolean {
    return this.providers.has(enumType);
  }

  /**
   * Clear all registered providers
   */
  clear(): void {
    this.providers.clear();
  }

  /**
   * Get the number of registered providers
   */
  getProviderCount(): number {
    return this.providers.size;
  }

  /**
   * Get all providers
   */
  getAllProviders(): Map<string, EnumProvider> {
    return new Map(this.providers);
  }

  /**
   * Check if all providers are ready
   */
  async areAllProvidersReady(): Promise<boolean> {
    const providers = Array.from(this.providers.values());
    const readyChecks = providers.map(provider => provider.isReady());
    const results = await Promise.all(readyChecks);
    return results.every(ready => ready);
  }

  /**
   * Refresh all providers
   */
  async refreshAllProviders(): Promise<void> {
    const providers = Array.from(this.providers.values());
    const refreshPromises = providers.map(provider => provider.refresh());
    await Promise.allSettled(refreshPromises);
  }

  /**
   * Get metrics from all providers
   */
  getAggregatedMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};

    for (const [enumType, provider] of Array.from(this.providers)) {
      if ("getMetrics" in provider) {
        metrics[enumType] = (provider as any).getMetrics();
      }
    }

    return metrics;
  }
}
