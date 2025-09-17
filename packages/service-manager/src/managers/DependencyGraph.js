/**
 * Dependency Graph Manager
 *
 * Manages service dependencies and calculates startup order with parallel execution groups.
 */
export class DependencyGraph {
    constructor() {
        Object.defineProperty(this, "_services", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "_startupOrder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_parallelGroups", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    addService(name, dependencies, startupPriority, requiredPackages = []) {
        this._services.set(name, {
            name,
            dependencies,
            startupPriority,
            requiredPackages,
        });
        // Recalculate startup order when services are added
        this._calculateStartupOrder();
    }
    removeService(name) {
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
    getStartupOrder() {
        return [...this._startupOrder];
    }
    getParallelGroups() {
        return this._parallelGroups.map((group) => [...group]);
    }
    validateDependencies() {
        const errors = [];
        const visited = new Set();
        const visiting = new Set();
        for (const serviceName of this._services.keys()) {
            if (!visited.has(serviceName)) {
                this._validateService(serviceName, visited, visiting, errors);
            }
        }
        return errors;
    }
    getDependencies(name) {
        const service = this._services.get(name);
        return service ? [...service.dependencies] : [];
    }
    getDependents(name) {
        const dependents = [];
        for (const [serviceName, service] of this._services) {
            if (service.dependencies.includes(name)) {
                dependents.push(serviceName);
            }
        }
        return dependents;
    }
    _validateService(serviceName, visited, visiting, errors) {
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
            }
            else {
                this._validateService(dep, visited, visiting, errors);
            }
        }
        visiting.delete(serviceName);
        visited.add(serviceName);
    }
    _calculateStartupOrder() {
        const visited = new Set();
        const visiting = new Set();
        const order = [];
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
    _visitService(serviceName, visited, visiting, order) {
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
    _calculateParallelGroups() {
        const groups = [];
        const processed = new Set();
        for (const serviceName of this._startupOrder) {
            if (processed.has(serviceName)) {
                continue;
            }
            const group = [];
            const service = this._services.get(serviceName);
            if (!service)
                continue;
            // Find all services that can start in parallel with this one
            for (const candidateName of this._startupOrder) {
                if (processed.has(candidateName)) {
                    continue;
                }
                const candidate = this._services.get(candidateName);
                if (!candidate)
                    continue;
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
