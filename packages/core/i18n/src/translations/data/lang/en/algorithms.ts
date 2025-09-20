/**
 * Algorithms Package Translations
 * Translations for the Reynard Algorithms system
 */

export const algorithmsTranslations = {
  // Algorithm selection recommendations
  algorithmSelection: {
    smallObjectCount: {
      favorsNaiveApproach: "Small object count favors naive approach",
      pawFindingsShowNaiveOptimal: "PAW findings show naive is optimal for <100 objects",
      minimalAllocationOverhead: "Minimal allocation overhead for small datasets",
    },
    mediumObjectCount: {
      benefitsFromSpatialOptimization: "Medium object count benefits from spatial optimization",
      spatialHashingReducesCollisionChecks: "Spatial hashing reduces collision checks",
      memoryOverheadAcceptable: "Memory overhead acceptable for this size",
    },
    largeObjectCount: {
      requiresOptimization: "Large object count requires optimization",
      memoryPoolingEliminatesAllocationOverhead: "Memory pooling eliminates allocation overhead",
      bestPerformanceForOver100Objects: "Best performance for >100 objects",
    },
    highSpatialDensity: {
      benefitsFromOptimization: "High spatial density benefits from optimization",
      memoryPoolingReducesAllocationOverhead: "Memory pooling reduces allocation overhead",
      spatialHashingEffectiveForDenseScenarios: "Spatial hashing effective for dense scenarios",
    },
    lowSpatialDensity: {
      allowsStandardSpatialHashing: "Low spatial density allows standard spatial hashing",
      memoryOverheadAcceptableForSparseScenarios: "Memory overhead acceptable for sparse scenarios",
      goodBalanceOfPerformanceAndMemoryUsage: "Good balance of performance and memory usage",
    },
  },

  // Performance optimization recommendations
  performanceOptimization: {
    lowPoolHitRate: {
      description: "Low pool hit rate detected. Consider increasing pool sizes.",
      implementation: "Increase spatialHashPoolSize and collisionArrayPoolSize in config",
    },
    highPoolUsage: {
      description: "High pool usage detected. Consider reducing cleanup interval.",
      implementation: "Reduce cleanupInterval in config",
    },
    allocationReductionBelowOptimal: {
      description: "Allocation reduction below optimal. Check object lifecycle management.",
      implementation: "Ensure proper returnToPool() calls and object reuse patterns",
    },
  },

  // Impact levels
  impact: {
    high: "High",
    medium: "Medium",
    low: "Low",
  },

  // Algorithm types
  algorithmTypes: {
    naive: "Naive",
    spatial: "Spatial",
    optimized: "Optimized",
  },

  // Performance metrics
  performance: {
    executionTime: "Execution Time",
    memoryUsage: "Memory Usage",
    allocationReduction: "Allocation Reduction",
    poolHitRate: "Pool Hit Rate",
  },
} as const;

export default algorithmsTranslations;
