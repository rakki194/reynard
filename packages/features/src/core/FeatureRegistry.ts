import { createSignal, createMemo } from 'solid-js';
import type { FeatureDefinition, FeatureRegistry as IFeatureRegistry } from './types';

/**
 * Feature registry implementation
 */
export class FeatureRegistry implements IFeatureRegistry {
  private functionalities = createSignal<Map<string, FeatureDefinition>>(new Map());
  private getFunctionalities = () => this.functionalities[0]();
  private setFunctionalities = (value: Map<string, FeatureDefinition>) => this.functionalities[1](value);

  /**
   * Register a new feature
   */
  public register(feature: FeatureDefinition): void {
    const current = this.getFunctionalities();
    const updated = new Map(current);
    updated.set(feature.id, feature);
    this.setFunctionalities(updated);
  }

  /**
   * Unregister a feature
   */
  public unregister(featureId: string): void {
    const current = this.getFunctionalities();
    const updated = new Map(current);
    updated.delete(featureId);
    this.setFunctionalities(updated);
  }

  /**
   * Get a feature by ID
   */
  public get(featureId: string): FeatureDefinition | undefined {
    return this.getFunctionalities().get(featureId);
  }

  /**
   * Get all registered features
   */
  public getAll(): FeatureDefinition[] {
    return Array.from(this.getFunctionalities().values());
  }

  /**
   * Get features by category
   */
  public getByCategory(category: string): FeatureDefinition[] {
    return this.getAll().filter(feature => feature.category === category);
  }

  /**
   * Get features by priority
   */
  public getByPriority(priority: string): FeatureDefinition[] {
    return this.getAll().filter(feature => feature.priority === priority);
  }

  /**
   * Get features by tag
   */
  public getByTag(tag: string): FeatureDefinition[] {
    return this.getAll().filter(feature => feature.tags?.includes(tag));
  }

  /**
   * Check if a feature is registered
   */
  public has(featureId: string): boolean {
    return this.getFunctionalities().has(featureId);
  }

  /**
   * Clear all features
   */
  public clear(): void {
    this.setFunctionalities(new Map());
  }

  /**
   * Get the number of registered features
   */
  public get size(): number {
    return this.getFunctionalities().size;
  }

  /**
   * Get features as a reactive signal
   */
  public getFeaturesSignal() {
    return createMemo(() => this.getAll());
  }

  /**
   * Get features by category as a reactive signal
   */
  public getFeaturesByCategorySignal(category: string) {
    return createMemo(() => this.getByCategory(category));
  }

  /**
   * Get features by priority as a reactive signal
   */
  public getFeaturesByPrioritySignal(priority: string) {
    return createMemo(() => this.getByPriority(priority));
  }

  /**
   * Get features by tag as a reactive signal
   */
  public getFeaturesByTagSignal(tag: string) {
    return createMemo(() => this.getByTag(tag));
  }

  /**
   * Search features by name or description
   */
  public search(query: string): FeatureDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(feature => 
      feature.name.toLowerCase().includes(lowerQuery) ||
      feature.description.toLowerCase().includes(lowerQuery) ||
      feature.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get features that depend on a specific service
   */
  public getFeaturesDependentOnService(serviceName: string): FeatureDefinition[] {
    return this.getAll().filter(feature => 
      feature.dependencies.some(dep => dep.services.includes(serviceName))
    );
  }

  /**
   * Get features that provide a specific capability
   */
  public getFeaturesByCapability(capabilityId: string): FeatureDefinition[] {
    return this.getAll().filter(feature => 
      feature.tags?.includes(`capability:${capabilityId}`)
    );
  }

  /**
   * Validate feature definition
   */
  public validateFeature(feature: FeatureDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!feature.id || typeof feature.id !== 'string') {
      errors.push('Feature ID is required and must be a string');
    }

    if (!feature.name || typeof feature.name !== 'string') {
      errors.push('Feature name is required and must be a string');
    }

    if (!feature.description || typeof feature.description !== 'string') {
      errors.push('Feature description is required and must be a string');
    }

    if (!Array.isArray(feature.dependencies)) {
      errors.push('Feature dependencies must be an array');
    } else {
      feature.dependencies.forEach((dep, index) => {
        if (!Array.isArray(dep.services)) {
          errors.push(`Dependency ${index}: services must be an array`);
        }
        if (dep.services.length === 0) {
          errors.push(`Dependency ${index}: services array cannot be empty`);
        }
      });
    }

    const validCategories = ['core', 'ml', 'integration', 'utility', 'ui', 'data'];
    if (!validCategories.includes(feature.category)) {
      errors.push(`Feature category must be one of: ${validCategories.join(', ')}`);
    }

    const validPriorities = ['critical', 'high', 'medium', 'low'];
    if (!validPriorities.includes(feature.priority)) {
      errors.push(`Feature priority must be one of: ${validPriorities.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Register multiple features at once
   */
  public registerMany(features: FeatureDefinition[]): { success: number; errors: string[] } {
    const errors: string[] = [];
    let success = 0;

    features.forEach(feature => {
      const validation = this.validateFeature(feature);
      if (validation.valid) {
        this.register(feature);
        success++;
      } else {
        errors.push(`Feature ${feature.id}: ${validation.errors.join(', ')}`);
      }
    });

    return { success, errors };
  }
}
