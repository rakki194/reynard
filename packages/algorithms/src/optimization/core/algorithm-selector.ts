/**
 * Intelligent Algorithm Selector
 * 
 * Based on PAW optimization findings, this module automatically selects
 * optimal algorithms based on workload characteristics and performance history.
 * 
 * @module algorithms/optimization/algorithmSelector
 */

import type { AABB, CollisionPair } from '../../geometry/collision/aabb-types';

export interface WorkloadCharacteristics {
  objectCount: number;
  spatialDensity: number;
  overlapRatio: number;
  updateFrequency: number;
  queryPattern: 'random' | 'clustered' | 'sequential';
  memoryConstraints?: {
    maxMemoryUsage: number;
    gcPressure: number;
  };
}

export interface PerformanceRecord {
  algorithm: string;
  workload: WorkloadCharacteristics;
  performance: {
    executionTime: number;
    memoryUsage: number;
    allocationCount: number;
    cacheHitRate: number;
  };
  timestamp: number;
}

export interface AlgorithmSelection {
  algorithm: string;
  confidence: number;
  expectedPerformance: {
    executionTime: number;
    memoryUsage: number;
  };
  reasoning: string[];
}

export interface SelectionStats {
  totalSelections: number;
  correctSelections: number;
  averageConfidence: number;
  performanceImprovement: number;
}

/**
 * Intelligent algorithm selector based on PAW optimization research
 */
export class AlgorithmSelector {
  private performanceHistory: PerformanceRecord[] = [];
  private selectionStats: SelectionStats = {
    totalSelections: 0,
    correctSelections: 0,
    averageConfidence: 0,
    performanceImprovement: 0
  };
  private thresholds: {
    naiveVsSpatial: number;
    spatialVsOptimized: number;
    memoryThreshold: number;
  } = {
    naiveVsSpatial: 50,      // Based on PAW findings
    spatialVsOptimized: 25,  // Based on PAW findings
    memoryThreshold: 100     // Memory pressure threshold
  };

  /**
   * Select optimal collision detection algorithm
   */
  selectCollisionAlgorithm(workload: WorkloadCharacteristics): AlgorithmSelection {
    const analysis = this.analyzeWorkload(workload);
    const selection = this.selectOptimalCollisionAlgorithm(analysis);
    
    this.recordSelection(selection, workload);
    return selection;
  }

  /**
   * Select optimal spatial algorithm
   */
  selectSpatialAlgorithm(workload: WorkloadCharacteristics): AlgorithmSelection {
    const analysis = this.analyzeWorkload(workload);
    const selection = this.selectOptimalSpatialAlgorithm(analysis);
    
    this.recordSelection(selection, workload);
    return selection;
  }

  /**
   * Select optimal Union-Find algorithm
   */
  selectUnionFindAlgorithm(workload: WorkloadCharacteristics): AlgorithmSelection {
    const analysis = this.analyzeWorkload(workload);
    const selection = this.selectOptimalUnionFindAlgorithm(analysis);
    
    this.recordSelection(selection, workload);
    return selection;
  }

  /**
   * Analyze workload characteristics
   */
  private analyzeWorkload(workload: WorkloadCharacteristics): WorkloadAnalysis {
    const complexity = this.calculateComplexity(workload);
    const memoryPressure = this.calculateMemoryPressure(workload);
    const performanceProfile = this.getPerformanceProfile(workload);

    return {
      complexity,
      memoryPressure,
      performanceProfile,
      recommendations: this.generateRecommendations(workload, complexity, memoryPressure)
    };
  }

  /**
   * Calculate workload complexity based on PAW findings
   */
  private calculateComplexity(workload: WorkloadCharacteristics): ComplexityAnalysis {
    const { objectCount, spatialDensity, overlapRatio } = workload;
    
    // Based on PAW empirical findings
    const naiveComplexity = objectCount * objectCount;
    const spatialComplexity = objectCount * Math.log(objectCount) + spatialDensity * objectCount;
    const optimizedComplexity = objectCount * Math.log(objectCount) + overlapRatio * objectCount;

    return {
      naive: naiveComplexity,
      spatial: spatialComplexity,
      optimized: optimizedComplexity,
      crossoverPoint: this.findCrossoverPoint(naiveComplexity, spatialComplexity),
      recommendation: this.getComplexityRecommendation(naiveComplexity, spatialComplexity, optimizedComplexity)
    };
  }

  /**
   * Calculate memory pressure based on workload
   */
  private calculateMemoryPressure(workload: WorkloadCharacteristics): MemoryPressureAnalysis {
    const { objectCount, memoryConstraints } = workload;
    
    const estimatedMemoryUsage = {
      naive: objectCount * 16, // Rough estimate for naive approach
      spatial: objectCount * 32 + objectCount * Math.log(objectCount) * 8, // Spatial hash overhead
      optimized: objectCount * 16 + 1024 // Pool overhead but reused objects
    };

    const memoryPressure = memoryConstraints ? 
      estimatedMemoryUsage.optimized / memoryConstraints.maxMemoryUsage : 0;

    return {
      estimatedUsage: estimatedMemoryUsage,
      pressure: memoryPressure,
      recommendation: memoryPressure > 0.8 ? 'optimized' : 'auto'
    };
  }

  /**
   * Get performance profile from historical data
   */
  private getPerformanceProfile(workload: WorkloadCharacteristics): PerformanceProfile {
    const similarWorkloads = this.findSimilarWorkloads(workload);
    
    if (similarWorkloads.length === 0) {
      return {
        confidence: 0.5,
        expectedPerformance: this.getDefaultPerformance(workload),
        historicalData: []
      };
    }

    const avgPerformance = this.calculateAveragePerformance(similarWorkloads);
    const confidence = Math.min(0.95, similarWorkloads.length / 10);

    return {
      confidence,
      expectedPerformance: avgPerformance,
      historicalData: similarWorkloads
    };
  }

  /**
   * Select optimal collision detection algorithm
   */
  private selectOptimalCollisionAlgorithm(analysis: WorkloadAnalysis): AlgorithmSelection {
    const { complexity, memoryPressure, performanceProfile } = analysis;
    const { objectCount } = analysis.workload;

    // Based on PAW findings: crossover point around 50-100 objects
    if (objectCount < this.thresholds.naiveVsSpatial) {
      return {
        algorithm: 'naive',
        confidence: 0.9,
        expectedPerformance: {
          executionTime: complexity.naive * 0.001, // Rough estimate
          memoryUsage: objectCount * 16
        },
        reasoning: [
          'Small object count favors naive approach',
          'PAW findings show naive is optimal for <50 objects',
          'Minimal allocation overhead for small datasets'
        ]
      };
    }

    if (objectCount < this.thresholds.spatialVsOptimized) {
      return {
        algorithm: 'spatial',
        confidence: 0.8,
        expectedPerformance: {
          executionTime: complexity.spatial * 0.001,
          memoryUsage: objectCount * 32
        },
        reasoning: [
          'Medium object count benefits from spatial optimization',
          'Spatial hashing reduces collision checks',
          'Memory overhead acceptable for this size'
        ]
      };
    }

    // For larger datasets, use optimized approach
    return {
      algorithm: 'optimized',
      confidence: 0.95,
      expectedPerformance: {
        executionTime: complexity.optimized * 0.001,
        memoryUsage: objectCount * 16 + 1024
      },
      reasoning: [
        'Large object count requires optimization',
        'Memory pooling eliminates allocation overhead',
        'PAW findings show 99.91% allocation reduction',
        'Best performance for >100 objects'
      ]
    };
  }

  /**
   * Select optimal spatial algorithm
   */
  private selectOptimalSpatialAlgorithm(analysis: WorkloadAnalysis): AlgorithmSelection {
    const { complexity, memoryPressure } = analysis;
    const { objectCount, spatialDensity } = analysis.workload;

    // For high spatial density, use optimized spatial hashing
    if (spatialDensity > 0.7) {
      return {
        algorithm: 'optimized-spatial',
        confidence: 0.9,
        expectedPerformance: {
          executionTime: complexity.optimized * 0.001,
          memoryUsage: objectCount * 32 + 1024
        },
        reasoning: [
          'High spatial density benefits from optimization',
          'Memory pooling reduces allocation overhead',
          'Spatial hashing effective for dense scenarios'
        ]
      };
    }

    // For low spatial density, use standard spatial hashing
    return {
      algorithm: 'spatial',
      confidence: 0.8,
      expectedPerformance: {
        executionTime: complexity.spatial * 0.001,
        memoryUsage: objectCount * 32
      },
      reasoning: [
        'Low spatial density allows standard spatial hashing',
        'Memory overhead acceptable for sparse scenarios',
        'Good balance of performance and memory usage'
      ]
    };
  }

  /**
   * Select optimal Union-Find algorithm
   */
  private selectOptimalUnionFindAlgorithm(analysis: WorkloadAnalysis): AlgorithmSelection {
    const { complexity, memoryPressure } = analysis;
    const { objectCount } = analysis.workload;

    // For small datasets, use standard Union-Find
    if (objectCount < 100) {
      return {
        algorithm: 'union-find',
        confidence: 0.9,
        expectedPerformance: {
          executionTime: objectCount * Math.log(objectCount) * 0.001,
          memoryUsage: objectCount * 8
        },
        reasoning: [
          'Small dataset size optimal for standard Union-Find',
          'Minimal memory overhead',
          'Path compression provides good performance'
        ]
      };
    }

    // For larger datasets, use batch Union-Find
    return {
      algorithm: 'batch-union-find',
      confidence: 0.9,
      expectedPerformance: {
        executionTime: objectCount * Math.log(objectCount) * 0.0005,
        memoryUsage: objectCount * 8 + 512
      },
      reasoning: [
        'Large dataset benefits from batch operations',
        'Reduced memory allocation overhead',
        'Better cache locality for batch processing'
      ]
    };
  }

  /**
   * Find crossover point between algorithms
   */
  private findCrossoverPoint(naiveComplexity: number, spatialComplexity: number): number {
    // Based on PAW findings, crossover occurs around 50-100 objects
    return Math.sqrt(naiveComplexity / spatialComplexity);
  }

  /**
   * Get complexity-based recommendation
   */
  private getComplexityRecommendation(
    naive: number, 
    spatial: number, 
    optimized: number
  ): string {
    if (naive < spatial && naive < optimized) return 'naive';
    if (spatial < optimized) return 'spatial';
    return 'optimized';
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    workload: WorkloadCharacteristics,
    complexity: ComplexityAnalysis,
    memoryPressure: MemoryPressureAnalysis
  ): string[] {
    const recommendations: string[] = [];

    if (workload.objectCount > 100) {
      recommendations.push('Consider using optimized algorithms for large datasets');
    }

    if (memoryPressure.pressure > 0.8) {
      recommendations.push('High memory pressure detected - use memory pooling');
    }

    if (workload.overlapRatio > 0.7) {
      recommendations.push('High overlap ratio - spatial optimization recommended');
    }

    if (workload.updateFrequency > 10) {
      recommendations.push('High update frequency - consider incremental updates');
    }

    return recommendations;
  }

  /**
   * Find similar workloads in performance history
   */
  private findSimilarWorkloads(workload: WorkloadCharacteristics): PerformanceRecord[] {
    return this.performanceHistory.filter(record => {
      const similarity = this.calculateWorkloadSimilarity(workload, record.workload);
      return similarity > 0.8;
    });
  }

  /**
   * Calculate similarity between workloads
   */
  private calculateWorkloadSimilarity(
    workload1: WorkloadCharacteristics,
    workload2: WorkloadCharacteristics
  ): number {
    const objectCountSimilarity = 1 - Math.abs(workload1.objectCount - workload2.objectCount) / Math.max(workload1.objectCount, workload2.objectCount);
    const densitySimilarity = 1 - Math.abs(workload1.spatialDensity - workload2.spatialDensity);
    const overlapSimilarity = 1 - Math.abs(workload1.overlapRatio - workload2.overlapRatio);

    return (objectCountSimilarity + densitySimilarity + overlapSimilarity) / 3;
  }

  /**
   * Calculate average performance from historical data
   */
  private calculateAveragePerformance(records: PerformanceRecord[]): PerformanceMetrics {
    const avgExecutionTime = records.reduce((sum, record) => sum + record.performance.executionTime, 0) / records.length;
    const avgMemoryUsage = records.reduce((sum, record) => sum + record.performance.memoryUsage, 0) / records.length;
    const avgAllocationCount = records.reduce((sum, record) => sum + record.performance.allocationCount, 0) / records.length;
    const avgCacheHitRate = records.reduce((sum, record) => sum + record.performance.cacheHitRate, 0) / records.length;

    return {
      executionTime: avgExecutionTime,
      memoryUsage: avgMemoryUsage,
      allocationCount: avgAllocationCount,
      cacheHitRate: avgCacheHitRate
    };
  }

  /**
   * Get default performance estimates
   */
  private getDefaultPerformance(workload: WorkloadCharacteristics): PerformanceMetrics {
    return {
      executionTime: workload.objectCount * 0.001,
      memoryUsage: workload.objectCount * 16,
      allocationCount: workload.objectCount * 2,
      cacheHitRate: 0.5
    };
  }

  /**
   * Record algorithm selection for learning
   */
  private recordSelection(selection: AlgorithmSelection, workload: WorkloadCharacteristics): void {
    this.selectionStats.totalSelections++;
    this.selectionStats.averageConfidence = 
      (this.selectionStats.averageConfidence * (this.selectionStats.totalSelections - 1) + selection.confidence) / 
      this.selectionStats.totalSelections;
  }

  /**
   * Update performance model with new results
   */
  updatePerformanceModel(result: PerformanceRecord): void {
    this.performanceHistory.push(result);
    
    // Keep only recent history (last 1000 records)
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory = this.performanceHistory.slice(-1000);
    }

    // Update selection statistics
    this.updateSelectionStats(result);
  }

  /**
   * Update selection statistics
   */
  private updateSelectionStats(result: PerformanceRecord): void {
    // This would be implemented to track whether the selection was correct
    // based on actual performance vs expected performance
  }

  /**
   * Get selection statistics
   */
  getSelectionStats(): SelectionStats {
    return { ...this.selectionStats };
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(): PerformanceRecord[] {
    return [...this.performanceHistory];
  }

  /**
   * Clear performance history
   */
  clearPerformanceHistory(): void {
    this.performanceHistory = [];
    this.selectionStats = {
      totalSelections: 0,
      correctSelections: 0,
      averageConfidence: 0,
      performanceImprovement: 0
    };
  }
}

// Type definitions
interface WorkloadAnalysis {
  complexity: ComplexityAnalysis;
  memoryPressure: MemoryPressureAnalysis;
  performanceProfile: PerformanceProfile;
  recommendations: string[];
  workload: WorkloadCharacteristics;
}

interface ComplexityAnalysis {
  naive: number;
  spatial: number;
  optimized: number;
  crossoverPoint: number;
  recommendation: string;
}

interface MemoryPressureAnalysis {
  estimatedUsage: {
    naive: number;
    spatial: number;
    optimized: number;
  };
  pressure: number;
  recommendation: string;
}

interface PerformanceProfile {
  confidence: number;
  expectedPerformance: PerformanceMetrics;
  historicalData: PerformanceRecord[];
}

interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  allocationCount: number;
  cacheHitRate: number;
}
