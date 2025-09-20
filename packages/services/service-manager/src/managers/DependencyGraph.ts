/**
 * Dependency Graph Manager
 *
 * Manages service dependencies and calculates startup order with parallel execution groups.
 */

import { DependencyGraph as IDependencyGraph } from "../types/index.js";

interface ServiceNode {
  name: string;
  dependencies: string[];
  startupPriority: number;
  requiredPackages: string[];
}

export class DependencyGraph implements IDependencyGraph {
  private _services: Map<string, ServiceNode> = new Map();
  private _startupOrder: string[] = [];
  private _parallelGroups: string[][] = [];

  addService(name: string, dependencies: string[], startupPriority: number, requiredPackages: string[] = []): void {
    this._services.set(name, {
      name,
      dependencies,
      startupPriority,
      requiredPackages,
    });

    // Recalculate startup order when services are added
    this._calculateStartupOrder();
  }

  removeService(name: string): void {
    this._services.delete(name);

    // Remove from other services' dependencies
    for (const [serviceName, service] of this._services) {
      const depIndex = service.dependencies.indexOf(name);
      if (depIndex !== -1) {
        service.dependencies.splice(depIndex, 1);
      }
    }

    // Recalculate startup order
    this._calculateStartupOrder();
  }

  getStartupOrder(): string[] {
    return [...this._startupOrder];
  }

  getParallelGroups(): string[][] {
    return this._parallelGroups.map(group => [...group]);
  }

  validateDependencies(): string[] {
    const errors: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    for (const serviceName of this._services.keys()) {
      if (!visited.has(serviceName)) {
        this._validateService(serviceName, visited, visiting, errors);
      }
    }

    return errors;
  }

  getDependencies(name: string): string[] {
    const service = this._services.get(name);
    return service ? [...service.dependencies] : [];
  }

  getDependents(name: string): string[] {
    const dependents: string[] = [];

    for (const [serviceName, service] of this._services) {
      if (service.dependencies.includes(name)) {
        dependents.push(serviceName);
      }
    }

    return dependents;
  }

  private _validateService(serviceName: string, visited: Set<string>, visiting: Set<string>, errors: string[]): void {
    if (visiting.has(serviceName)) {
      errors.push(`Circular dependency detected involving service: ${serviceName}`);
      return;
    }

    if (visited.has(serviceName)) {
      return;
    }

    visiting.add(serviceName);

    const service = this._services.get(serviceName);
    if (!service) {
      errors.push(`Service not found: ${serviceName}`);
      visiting.delete(serviceName);
      return;
    }

    // Validate dependencies exist
    for (const dep of service.dependencies) {
      if (!this._services.has(dep)) {
        errors.push(`Service ${serviceName} depends on non-existent service: ${dep}`);
      } else {
        this._validateService(dep, visited, visiting, errors);
      }
    }

    visiting.delete(serviceName);
    visited.add(serviceName);
  }

  private _calculateStartupOrder(): void {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    // Topological sort with priority consideration
    const services = Array.from(this._services.values()).sort((a, b) => a.startupPriority - b.startupPriority);

    for (const service of services) {
      if (!visited.has(service.name)) {
        this._visitService(service.name, visited, visiting, order);
      }
    }

    this._startupOrder = order;
    this._calculateParallelGroups();
  }

  private _visitService(serviceName: string, visited: Set<string>, visiting: Set<string>, order: string[]): void {
    if (visiting.has(serviceName)) {
      throw new Error(`Circular dependency detected involving service: ${serviceName}`);
    }

    if (visited.has(serviceName)) {
      return;
    }

    visiting.add(serviceName);

    const service = this._services.get(serviceName);
    if (!service) {
      throw new Error(`Service not found: ${serviceName}`);
    }

    // Visit dependencies first
    for (const dep of service.dependencies) {
      this._visitService(dep, visited, visiting, order);
    }

    visiting.delete(serviceName);
    visited.add(serviceName);
    order.push(serviceName);
  }

  private _calculateParallelGroups(): void {
    const groups: string[][] = [];
    const processed = new Set<string>();

    for (const serviceName of this._startupOrder) {
      if (processed.has(serviceName)) {
        continue;
      }

      const group: string[] = [];
      const service = this._services.get(serviceName);
      if (!service) continue;

      // Find all services that can start in parallel with this one
      for (const candidateName of this._startupOrder) {
        if (processed.has(candidateName)) {
          continue;
        }

        const candidate = this._services.get(candidateName);
        if (!candidate) continue;

        // Check if this candidate can start in parallel
        let canStartInParallel = true;

        // Check if any service in the current group depends on this candidate
        for (const groupService of group) {
          const groupServiceNode = this._services.get(groupService);
          if (groupServiceNode?.dependencies.includes(candidateName)) {
            canStartInParallel = false;
            break;
          }
        }

        // Check if this candidate depends on any service in the current group
        if (canStartInParallel) {
          for (const groupService of group) {
            if (candidate.dependencies.includes(groupService)) {
              canStartInParallel = false;
              break;
            }
          }
        }

        if (canStartInParallel) {
          group.push(candidateName);
          processed.add(candidateName);
        }
      }

      if (group.length > 0) {
        groups.push(group);
      }
    }

    this._parallelGroups = groups;
  }
}
