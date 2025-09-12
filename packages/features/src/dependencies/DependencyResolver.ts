/**
 * Dependency Resolver
 *
 * Main dependency resolver implementation.
 */

import type { FeatureDefinition } from "../core/types.js";
import { createDependencyResolverCore, DependencyResolverCore } from "./DependencyResolverCore.js";
import { getDependencyStats } from "./DependencyResolverStats.js";

/**
 * Dependency resolution result
 */
export interface DependencyResolutionResult {
  /** Features that can be resolved */
  resolvable: FeatureDefinition[];
  /** Features that cannot be resolved due to missing dependencies */
  unresolvable: {
    feature: FeatureDefinition;
    missingDependencies: string[];
  }[];
  /** Dependency graph */
  dependencyGraph: Map<string, string[]>;
  /** Resolution order */
  resolutionOrder: string[];
}

/**
 * Dependency resolver for managing feature dependencies
 */
export class DependencyResolver {
  private core: DependencyResolverCore;

  constructor() {
    this.core = createDependencyResolverCore();
  }

  /**
   * Add a feature to the resolver
   */
  public addFeature(feature: FeatureDefinition): void {
    this.core.features.set(feature.id, feature);
  }

  /**
   * Remove a feature from the resolver
   */
  public removeFeature(featureId: string): void {
    this.core.features.delete(featureId);
  }

  /**
   * Get a feature by ID
   */
  public getFeature(featureId: string): FeatureDefinition | undefined {
    return this.core.features.get(featureId);
  }

  /**
   * Get all features
   */
  public getAllFeatures(): FeatureDefinition[] {
    return Array.from(this.core.features.values());
  }

  /**
   * Set service availability
   */
  public setServiceAvailability(serviceId: string, available: boolean): void {
    this.core.serviceAvailability.set(serviceId, available);
  }

  /**
   * Check if a service is available
   */
  public isServiceAvailable(serviceId: string): boolean {
    return this.core.serviceAvailability.get(serviceId) ?? false;
  }

  /**
   * Resolve dependencies for all features
   */
  public resolveDependencies(): DependencyResolutionResult {
    const features = this.getAllFeatures();
    const resolvable: FeatureDefinition[] = [];
    const unresolvable: { feature: FeatureDefinition; missingDependencies: string[] }[] = [];
    const dependencyGraph = new Map<string, string[]>();
    const resolutionOrder: string[] = [];

    // Build dependency graph
    features.forEach((feature) => {
      dependencyGraph.set(feature.id, feature.dependencies || []);
    });

    // Resolve dependencies
    features.forEach((feature) => {
      const missingDependencies = this.getMissingDependencies(feature);
      if (missingDependencies.length === 0) {
        resolvable.push(feature);
        resolutionOrder.push(feature.id);
      } else {
        unresolvable.push({
          feature,
          missingDependencies,
        });
      }
    });

    return {
      resolvable,
      unresolvable,
      dependencyGraph,
      resolutionOrder,
    };
  }

  /**
   * Get missing dependencies for a feature
   */
  private getMissingDependencies(feature: FeatureDefinition): string[] {
    const missing: string[] = [];
    
    if (feature.dependencies) {
      feature.dependencies.forEach((dep) => {
        if (!this.isServiceAvailable(dep)) {
          missing.push(dep);
        }
      });
    }
    
    return missing;
  }

  /**
   * Get dependency statistics
   */
  public getDependencyStats() {
    return getDependencyStats(this.core);
  }
}