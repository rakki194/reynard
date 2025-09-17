/**
 * Performance Budget Management
 *
 * Performance budget checking and validation utilities.
 *
 * @module algorithms/performance/budget
 */
/**
 * Performance budget checker
 */
export class PerformanceBudgetChecker {
    constructor() {
        Object.defineProperty(this, "budgets", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    setBudget(name, budget) {
        this.budgets.set(name, budget);
    }
    checkBudget(name, metrics) {
        const budget = this.budgets.get(name);
        if (!budget)
            return true;
        const violations = [];
        if (metrics.duration > budget.maxDuration) {
            violations.push(`Duration: ${metrics.duration}ms > ${budget.maxDuration}ms`);
        }
        if (metrics.memoryDelta > budget.maxMemoryUsage) {
            violations.push(`Memory: ${metrics.memoryDelta} bytes > ${budget.maxMemoryUsage} bytes`);
        }
        if (metrics.iterations > budget.maxIterations) {
            violations.push(`Iterations: ${metrics.iterations} > ${budget.maxIterations}`);
        }
        if (violations.length > 0) {
            console.warn(`Performance budget violation for ${name}:`, violations.join(", "));
            return false;
        }
        return true;
    }
    clearBudget(name) {
        this.budgets.delete(name);
    }
    clearAllBudgets() {
        this.budgets.clear();
    }
}
