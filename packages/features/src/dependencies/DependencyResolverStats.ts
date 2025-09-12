/**
 * Dependency Resolver Stats
 *
 * Statistics for the dependency resolver.
 */

import type { DependencyResolverCore } from "./DependencyResolverCore.js";

/**
 * Get dependency statistics
 */
export function getDependencyStats(core: DependencyResolverCore) {
  const features = Array.from(core.features.values());
  const totalFeatures = features.length;
  const featuresWithDependencies = features.filter(
    (f) => f.dependencies && f.dependencies.length > 0,
  ).length;
  const featuresWithoutDependencies = totalFeatures - featuresWithDependencies;
  
  const totalDependencies = features.reduce(
    (sum, f) => sum + (f.dependencies?.length || 0),
    0,
  );
  
  const averageDependencies = totalFeatures > 0 ? totalDependencies / totalFeatures : 0;
  
  const dependencyCounts = new Map<number, number>();
  features.forEach((f) => {
    const count = f.dependencies?.length || 0;
    dependencyCounts.set(count, (dependencyCounts.get(count) || 0) + 1);
  });
  
  const maxDependencies = Math.max(...features.map((f) => f.dependencies?.length || 0));
  const minDependencies = Math.min(...features.map((f) => f.dependencies?.length || 0));
  
  return {
    totalFeatures,
    featuresWithDependencies,
    featuresWithoutDependencies,
    totalDependencies,
    averageDependencies: Math.round(averageDependencies * 100) / 100,
    maxDependencies,
    minDependencies,
    dependencyCounts: Object.fromEntries(dependencyCounts),
  };
}

