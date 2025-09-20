/**
 * Intelligent Algorithm Selector
 *
 * Based on PAW optimization findings, this module automatically selects
 * optimal algorithms based on workload characteristics and performance history.
 *
 * @module algorithms/optimization/algorithmSelector
 */

import type {
  PerformanceRecord,
  AlgorithmSelection,
  SelectionStats,
} from "./algorithm-selector-types";
import { WorkloadCharacteristics } from "./algorithm-selector-types";
import { WorkloadAnalyzer } from "./workload-analyzer";
import { AlgorithmSelectorCore } from "./algorithm-selector-core";
import { PerformanceTracker } from "./performance-tracker";

/**
 * Intelligent algorithm selector based on PAW optimization research
 */
export class AlgorithmSelector {
  private workloadAnalyzer: WorkloadAnalyzer;
  private algorithmSelectorCore: AlgorithmSelectorCore;
  private performanceTracker: PerformanceTracker;

  constructor() {
    this.workloadAnalyzer = new WorkloadAnalyzer();
    this.algorithmSelectorCore = new AlgorithmSelectorCore();
    this.performanceTracker = new PerformanceTracker();
  }

  /**
   * Select optimal collision detection algorithm
   */
  selectCollisionAlgorithm(workload: WorkloadCharacteristics): AlgorithmSelection {
    const analysis = this.workloadAnalyzer.analyzeWorkload(workload);
    const selection = this.algorithmSelectorCore.selectOptimalCollisionAlgorithm(analysis);

    this.performanceTracker.recordSelection(selection, workload);
    return selection;
  }

  /**
   * Select optimal spatial algorithm
   */
  selectSpatialAlgorithm(workload: WorkloadCharacteristics): AlgorithmSelection {
    const analysis = this.workloadAnalyzer.analyzeWorkload(workload);
    const selection = this.algorithmSelectorCore.selectOptimalSpatialAlgorithm(analysis);

    this.performanceTracker.recordSelection(selection, workload);
    return selection;
  }

  /**
   * Select optimal Union-Find algorithm
   */
  selectUnionFindAlgorithm(workload: WorkloadCharacteristics): AlgorithmSelection {
    const analysis = this.workloadAnalyzer.analyzeWorkload(workload);
    const selection = this.algorithmSelectorCore.selectOptimalUnionFindAlgorithm(analysis);

    this.performanceTracker.recordSelection(selection, workload);
    return selection;
  }

  /**
   * Update performance model with new results
   */
  updatePerformanceModel(result: PerformanceRecord): void {
    this.performanceTracker.updatePerformanceModel(result);
  }

  /**
   * Get selection statistics
   */
  getSelectionStats(): SelectionStats {
    return this.performanceTracker.getSelectionStats();
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(): PerformanceRecord[] {
    return this.performanceTracker.getPerformanceHistory();
  }

  /**
   * Clear performance history
   */
  clearPerformanceHistory(): void {
    this.performanceTracker.clearPerformanceHistory();
  }
}
