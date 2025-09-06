import type { FeatureDefinition } from '../core/types';

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
  private features: Map<string, FeatureDefinition> = new Map();
  private serviceAvailability: Map<string, boolean> = new Map();

  /**
   * Add a feature to the resolver
   */
  public addFeature(feature: FeatureDefinition): void {
    this.features.set(feature.id, feature);
  }

  /**
   * Remove a feature from the resolver
   */
  public removeFeature(featureId: string): void {
    this.features.delete(featureId);
  }

  /**
   * Set service availability
   */
  public setServiceAvailability(serviceName: string, available: boolean): void {
    this.serviceAvailability.set(serviceName, available);
  }

  /**
   * Set multiple service availabilities
   */
  public setServiceAvailabilities(services: Record<string, boolean>): void {
    Object.entries(services).forEach(([service, available]) => {
      this.setServiceAvailability(service, available);
    });
  }

  /**
   * Check if a service is available
   */
  public isServiceAvailable(serviceName: string): boolean {
    return this.serviceAvailability.get(serviceName) ?? false;
  }

  /**
   * Check if a feature's dependencies are satisfied
   */
  public areDependenciesSatisfied(feature: FeatureDefinition): {
    satisfied: boolean;
    missingRequired: string[];
    missingOptional: string[];
  } {
    const missingRequired: string[] = [];
    const missingOptional: string[] = [];

    for (const dependency of feature.dependencies) {
      const unavailableServices = dependency.services.filter(
        service => !this.isServiceAvailable(service)
      );

      if (unavailableServices.length > 0) {
        if (dependency.required !== false) {
          missingRequired.push(...unavailableServices);
        } else {
          missingOptional.push(...unavailableServices);
        }
      }
    }

    return {
      satisfied: missingRequired.length === 0,
      missingRequired,
      missingOptional
    };
  }

  /**
   * Resolve dependencies for all features
   */
  public resolveDependencies(): DependencyResolutionResult {
    const resolvable: FeatureDefinition[] = [];
    const unresolvable: { feature: FeatureDefinition; missingDependencies: string[] }[] = [];
    const dependencyGraph = new Map<string, string[]>();

    // Build dependency graph and check resolvability
    for (const feature of this.features.values()) {
      const { satisfied, missingRequired } = this.areDependenciesSatisfied(feature);
      
      if (satisfied) {
        resolvable.push(feature);
      } else {
        unresolvable.push({
          feature,
          missingDependencies: missingRequired
        });
      }

      // Build dependency graph
      const dependencies: string[] = [];
      feature.dependencies.forEach(dep => {
        if (dep.required !== false) {
          dependencies.push(...dep.services);
        }
      });
      dependencyGraph.set(feature.id, dependencies);
    }

    // Calculate resolution order using topological sort
    const resolutionOrder = this.topologicalSort(dependencyGraph);

    return {
      resolvable,
      unresolvable,
      dependencyGraph,
      resolutionOrder
    };
  }

  /**
   * Get features that depend on a specific service
   */
  public getFeaturesDependentOnService(serviceName: string): FeatureDefinition[] {
    const dependentFeatures: FeatureDefinition[] = [];

    for (const feature of this.features.values()) {
      const hasDependency = feature.dependencies.some(dep => 
        dep.services.includes(serviceName)
      );
      
      if (hasDependency) {
        dependentFeatures.push(feature);
      }
    }

    return dependentFeatures;
  }

  /**
   * Get services that are critical for feature availability
   */
  public getCriticalServices(): string[] {
    const criticalServices = new Set<string>();

    for (const feature of this.features.values()) {
      if (feature.priority === 'critical') {
        feature.dependencies.forEach(dep => {
          if (dep.required !== false) {
            dep.services.forEach(service => criticalServices.add(service));
          }
        });
      }
    }

    return Array.from(criticalServices);
  }

  /**
   * Get dependency chain for a feature
   */
  public getDependencyChain(featureId: string): string[] {
    const chain: string[] = [];
    const visited = new Set<string>();

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const feature = this.features.get(id);
      if (!feature) return;

      feature.dependencies.forEach(dep => {
        if (dep.required !== false) {
          dep.services.forEach(service => {
            if (!chain.includes(service)) {
              chain.push(service);
            }
          });
        }
      });
    };

    traverse(featureId);
    return chain;
  }

  /**
   * Check for circular dependencies
   */
  public checkCircularDependencies(): {
    hasCircular: boolean;
    circularChains: string[][];
  } {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const circularChains: string[][] = [];

    const dfs = (featureId: string, path: string[]): boolean => {
      if (recursionStack.has(featureId)) {
        // Found a circular dependency
        const cycleStart = path.indexOf(featureId);
        circularChains.push(path.slice(cycleStart));
        return true;
      }

      if (visited.has(featureId)) {
        return false;
      }

      visited.add(featureId);
      recursionStack.add(featureId);

      const feature = this.features.get(featureId);
      if (feature) {
        for (const dependency of feature.dependencies) {
          if (dependency.required !== false) {
            for (const service of dependency.services) {
              // Check if this service is provided by another feature
              const providingFeature = Array.from(this.features.values()).find(f => 
                f.tags?.includes(`provides:${service}`)
              );
              
              if (providingFeature) {
                if (dfs(providingFeature.id, [...path, featureId])) {
                  return true;
                }
              }
            }
          }
        }
      }

      recursionStack.delete(featureId);
      return false;
    };

    let hasCircular = false;
    for (const featureId of this.features.keys()) {
      if (!visited.has(featureId)) {
        if (dfs(featureId, [])) {
          hasCircular = true;
        }
      }
    }

    return { hasCircular, circularChains };
  }

  /**
   * Topological sort for dependency resolution order
   */
  private topologicalSort(graph: Map<string, string[]>): string[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const result: string[] = [];

    const visit = (node: string) => {
      if (temp.has(node)) {
        throw new Error(`Circular dependency detected involving ${node}`);
      }
      if (visited.has(node)) {
        return;
      }

      temp.add(node);
      
      const dependencies = graph.get(node) || [];
      for (const dep of dependencies) {
        // Find features that provide this service
        const providingFeatures = Array.from(this.features.values()).filter(f => 
          f.tags?.includes(`provides:${dep}`)
        );
        
        for (const feature of providingFeatures) {
          visit(feature.id);
        }
      }

      temp.delete(node);
      visited.add(node);
      result.push(node);
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        visit(node);
      }
    }

    return result;
  }

  /**
   * Get dependency statistics
   */
  public getDependencyStats(): {
    totalFeatures: number;
    totalDependencies: number;
    averageDependenciesPerFeature: number;
    mostDependentFeature: FeatureDefinition | null;
    leastDependentFeature: FeatureDefinition | null;
    criticalServices: string[];
    optionalServices: string[];
  } {
    const features = Array.from(this.features.values());
    const totalFeatures = features.length;
    
    let totalDependencies = 0;
    let mostDependentFeature: FeatureDefinition | null = null;
    let leastDependentFeature: FeatureDefinition | null = null;
    let maxDependencies = -1;
    let minDependencies = Infinity;

    const allServices = new Set<string>();
    const requiredServices = new Set<string>();
    const optionalServices = new Set<string>();

    features.forEach(feature => {
      const dependencyCount = feature.dependencies.length;
      totalDependencies += dependencyCount;

      if (dependencyCount > maxDependencies) {
        maxDependencies = dependencyCount;
        mostDependentFeature = feature;
      }

      if (dependencyCount < minDependencies) {
        minDependencies = dependencyCount;
        leastDependentFeature = feature;
      }

      feature.dependencies.forEach(dep => {
        dep.services.forEach(service => {
          allServices.add(service);
          if (dep.required !== false) {
            requiredServices.add(service);
          } else {
            optionalServices.add(service);
          }
        });
      });
    });

    return {
      totalFeatures,
      totalDependencies,
      averageDependenciesPerFeature: totalFeatures > 0 ? totalDependencies / totalFeatures : 0,
      mostDependentFeature,
      leastDependentFeature,
      criticalServices: this.getCriticalServices(),
      optionalServices: Array.from(optionalServices)
    };
  }
}
