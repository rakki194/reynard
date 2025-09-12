/**
 * Feature Registry
 *
 * Main feature registry implementation.
 */

import type { FeatureDefinition, FeatureRegistry as IFeatureRegistry } from "./types.js";
import { createFeatureRegistryCore, FeatureRegistryCore } from "./FeatureRegistryCore.js";
import {
  registerFeature,
  unregisterFeature,
  getFeature,
  getAllFeatures,
  isFeatureRegistered,
  getFeaturesByCategory,
  getFeaturesByStatus,
} from "./FeatureRegistryOperations.js";

/**
 * Feature registry implementation
 */
export class FeatureRegistry implements IFeatureRegistry {
  private core: FeatureRegistryCore;

  constructor() {
    this.core = createFeatureRegistryCore();
  }

  /**
   * Register a new feature
   */
  public register(feature: FeatureDefinition): void {
    registerFeature(this.core, feature);
  }

  /**
   * Unregister a feature
   */
  public unregister(featureId: string): void {
    unregisterFeature(this.core, featureId);
  }

  /**
   * Get a feature by ID
   */
  public get(featureId: string): FeatureDefinition | undefined {
    return getFeature(this.core, featureId);
  }

  /**
   * Get all features
   */
  public getAll(): FeatureDefinition[] {
    return getAllFeatures(this.core);
  }

  /**
   * Check if a feature is registered
   */
  public has(featureId: string): boolean {
    return isFeatureRegistered(this.core, featureId);
  }

  /**
   * Get features by category
   */
  public getByCategory(category: string): FeatureDefinition[] {
    return getFeaturesByCategory(this.core, category);
  }

  /**
   * Get features by status
   */
  public getByStatus(status: string): FeatureDefinition[] {
    return getFeaturesByStatus(this.core, status);
  }

  /**
   * Get feature count
   */
  public getCount(): number {
    return this.core.getFunctionalities().size;
  }

  /**
   * Check if a feature is enabled
   */
  public isEnabled(featureId: string): boolean {
    const feature = this.get(featureId);
    return feature?.enabled ?? false;
  }

  /**
   * Get feature statistics
   */
  public getStats() {
    const features = this.getAll();
    const enabled = features.filter((f) => f.enabled).length;
    const disabled = features.filter((f) => !f.enabled).length;
    const categories = new Set(features.map((f) => f.category)).size;

    return {
      total: features.length,
      enabled,
      disabled,
      categories,
    };
  }
}