/**
 * Performance Budget Management
 *
 * Performance budget checking and validation utilities.
 *
 * @module algorithms/performance/budget
 */
import type { PerformanceBudget, PerformanceMetrics } from "./types";
/**
 * Performance budget checker
 */
export declare class PerformanceBudgetChecker {
    private budgets;
    setBudget(name: string, budget: PerformanceBudget): void;
    checkBudget(name: string, metrics: PerformanceMetrics): boolean;
    clearBudget(name: string): void;
    clearAllBudgets(): void;
}
