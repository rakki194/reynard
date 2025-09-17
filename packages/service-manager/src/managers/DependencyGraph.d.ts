/**
 * Dependency Graph Manager
 *
 * Manages service dependencies and calculates startup order with parallel execution groups.
 */
import { DependencyGraph as IDependencyGraph } from "../types/index.js";
export declare class DependencyGraph implements IDependencyGraph {
    private _services;
    private _startupOrder;
    private _parallelGroups;
    addService(name: string, dependencies: string[], startupPriority: number, requiredPackages?: string[]): void;
    removeService(name: string): void;
    getStartupOrder(): string[];
    getParallelGroups(): string[][];
    validateDependencies(): string[];
    getDependencies(name: string): string[];
    getDependents(name: string): string[];
    private _validateService;
    private _calculateStartupOrder;
    private _visitService;
    private _calculateParallelGroups;
}
