/**
 * Circular Dependency Detector - Advanced Circular Dependency Analysis and Resolution
 *
 * This module provides sophisticated detection and analysis of circular dependencies
 * in the codebase, with intelligent resolution suggestions and impact assessment.
 */
import { readFile, readdir, stat } from "fs/promises";
import { join, dirname, basename } from "path";
export class CircularDependencyDetector {
    constructor(codebasePath) {
        Object.defineProperty(this, "codebasePath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dependencyGraph", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nodeCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "cycleCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        this.codebasePath = codebasePath;
        this.dependencyGraph = {
            nodes: new Map(),
            edges: new Map(),
            cycles: [],
            metrics: {
                totalNodes: 0,
                totalEdges: 0,
                totalCycles: 0,
                averageCycleLength: 0,
                maxCycleLength: 0,
                criticalCycles: 0,
            },
        };
    }
    /**
     * Perform comprehensive circular dependency analysis
     */
    async analyzeCircularDependencies() {
        console.log("🐺 Starting circular dependency analysis...");
        // Build dependency graph
        await this.buildDependencyGraph();
        // Detect circular dependencies
        await this.detectCircularDependencies();
        // Analyze impact and generate resolution plans
        const report = this.generateCircularDependencyReport();
        console.log(`✅ Circular dependency analysis complete: ${report.totalCycles} cycles detected`);
        return report;
    }
    /**
     * Get circular dependencies for a specific file
     */
    getCircularDependenciesForFile(filePath) {
        return this.dependencyGraph.cycles.filter((cycle) => cycle.cycle.includes(filePath));
    }
    /**
     * Get all circular dependencies
     */
    getAllCircularDependencies() {
        return this.dependencyGraph.cycles;
    }
    /**
     * Get critical circular dependencies
     */
    getCriticalCircularDependencies() {
        return this.dependencyGraph.cycles.filter((cycle) => cycle.severity === "critical");
    }
    /**
     * Generate resolution suggestions for a specific cycle
     */
    generateResolutionSuggestions(cycleId) {
        const cycle = this.cycleCache.get(cycleId);
        return cycle ? cycle.resolution : null;
    }
    /**
     * Check if a file is part of any circular dependency
     */
    isFileInCycle(filePath) {
        return this.dependencyGraph.cycles.some((cycle) => cycle.cycle.includes(filePath));
    }
    /**
     * Get dependency graph visualization data
     */
    getDependencyGraphData() {
        const nodes = Array.from(this.dependencyGraph.nodes.values()).map((node) => ({
            id: node.id,
            label: node.name,
            type: node.type,
            inCycle: this.isFileInCycle(node.path),
        }));
        const edges = Array.from(this.dependencyGraph.edges.values()).map((edge) => ({
            source: edge.source,
            target: edge.target,
            inCycle: this.isEdgeInCycle(edge.source, edge.target),
        }));
        const cycles = this.dependencyGraph.cycles.map((cycle) => cycle.cycle);
        return { nodes, edges, cycles };
    }
    // Private methods
    async buildDependencyGraph() {
        console.log("🐺 Building dependency graph...");
        const files = await this.discoverFiles();
        // Create nodes
        for (const file of files) {
            const node = await this.createDependencyNode(file);
            this.dependencyGraph.nodes.set(node.id, node);
            this.nodeCache.set(file, node);
        }
        // Create edges
        for (const file of files) {
            await this.createDependencyEdges(file);
        }
        this.dependencyGraph.metrics.totalNodes = this.dependencyGraph.nodes.size;
        this.dependencyGraph.metrics.totalEdges = this.dependencyGraph.edges.size;
        console.log(`✅ Dependency graph built: ${this.dependencyGraph.metrics.totalNodes} nodes, ${this.dependencyGraph.metrics.totalEdges} edges`);
    }
    async detectCircularDependencies() {
        console.log("🐺 Detecting circular dependencies...");
        const cycles = [];
        const visited = new Set();
        const recursionStack = new Set();
        const dfs = (nodeId, path) => {
            if (recursionStack.has(nodeId)) {
                // Found a cycle
                const cycleStart = path.indexOf(nodeId);
                const cycle = path.slice(cycleStart);
                const circularDependency = this.createCircularDependency(cycle);
                cycles.push(circularDependency);
                this.cycleCache.set(circularDependency.id, circularDependency);
                return;
            }
            if (visited.has(nodeId)) {
                return;
            }
            visited.add(nodeId);
            recursionStack.add(nodeId);
            path.push(nodeId);
            const node = this.dependencyGraph.nodes.get(nodeId);
            if (node) {
                for (const dependency of node.dependencies) {
                    dfs(dependency, [...path]);
                }
            }
            recursionStack.delete(nodeId);
        };
        // Start DFS from each unvisited node
        for (const nodeId of this.dependencyGraph.nodes.keys()) {
            if (!visited.has(nodeId)) {
                dfs(nodeId, []);
            }
        }
        this.dependencyGraph.cycles = cycles;
        this.updateCycleMetrics();
        console.log(`✅ Circular dependency detection complete: ${cycles.length} cycles found`);
    }
    async discoverFiles() {
        const files = [];
        const scanDirectory = async (dir) => {
            try {
                const entries = await readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = join(dir, entry.name);
                    if (entry.isDirectory()) {
                        if (!["node_modules", ".git", "dist", "build", "coverage"].includes(entry.name)) {
                            await scanDirectory(fullPath);
                        }
                    }
                    else if (entry.isFile()) {
                        const ext = fullPath.split(".").pop();
                        if (["ts", "tsx", "js", "jsx"].includes(ext || "")) {
                            files.push(fullPath);
                        }
                    }
                }
            }
            catch (error) {
                console.warn(`Could not scan directory ${dir}:`, error);
            }
        };
        await scanDirectory(this.codebasePath);
        return files;
    }
    async createDependencyNode(filePath) {
        try {
            const content = await readFile(filePath, "utf-8");
            const stats = await stat(filePath);
            const dependencies = this.extractDependencies(content, filePath);
            return {
                id: this.generateNodeId(filePath),
                path: filePath,
                name: basename(filePath),
                type: "file",
                dependencies,
                dependents: [], // Will be populated when creating edges
                metadata: {
                    size: stats.size,
                    complexity: this.calculateComplexity(content),
                    lastModified: stats.mtime.toISOString(),
                    importance: this.calculateImportance(filePath, content),
                    stability: this.calculateStability(stats.mtime),
                },
            };
        }
        catch (error) {
            console.warn(`Failed to create dependency node for ${filePath}:`, error);
            return {
                id: this.generateNodeId(filePath),
                path: filePath,
                name: basename(filePath),
                type: "file",
                dependencies: [],
                dependents: [],
                metadata: {
                    size: 0,
                    complexity: 0,
                    lastModified: new Date().toISOString(),
                    importance: 0.1,
                    stability: 0.5,
                },
            };
        }
    }
    async createDependencyEdges(filePath) {
        const node = this.dependencyGraph.nodes.get(this.generateNodeId(filePath));
        if (!node)
            return;
        for (const dependency of node.dependencies) {
            const targetNode = this.dependencyGraph.nodes.get(dependency);
            if (targetNode) {
                // Create edge
                const edgeId = `${node.id}->${targetNode.id}`;
                this.dependencyGraph.edges.set(edgeId, {
                    source: node.id,
                    target: targetNode.id,
                    type: "import",
                    weight: 1.0,
                });
                // Update dependents
                targetNode.dependents.push(node.id);
            }
        }
    }
    extractDependencies(content, filePath) {
        const dependencies = [];
        const lines = content.split("\n");
        for (const line of lines) {
            // Import statements
            const importMatch = line.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/);
            if (importMatch) {
                const importPath = this.resolveImportPath(importMatch[1], filePath);
                if (importPath) {
                    dependencies.push(this.generateNodeId(importPath));
                }
            }
            // Dynamic imports
            const dynamicImportMatch = line.match(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/);
            if (dynamicImportMatch) {
                const importPath = this.resolveImportPath(dynamicImportMatch[1], filePath);
                if (importPath) {
                    dependencies.push(this.generateNodeId(importPath));
                }
            }
            // Require statements
            const requireMatch = line.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/);
            if (requireMatch) {
                const importPath = this.resolveImportPath(requireMatch[1], filePath);
                if (importPath) {
                    dependencies.push(this.generateNodeId(importPath));
                }
            }
        }
        return dependencies;
    }
    resolveImportPath(importPath, fromFile) {
        if (importPath.startsWith(".")) {
            // Relative import
            const fromDir = dirname(fromFile);
            const resolvedPath = join(fromDir, importPath);
            // Try different extensions
            const extensions = [
                ".ts",
                ".tsx",
                ".js",
                ".jsx",
                "/index.ts",
                "/index.js",
            ];
            for (const ext of extensions) {
                const fullPath = resolvedPath + ext;
                if (this.nodeCache.has(fullPath)) {
                    return fullPath;
                }
            }
            return resolvedPath;
        }
        else {
            // Absolute import (external package)
            return null; // Skip external packages for now
        }
    }
    createCircularDependency(cycle) {
        const severity = this.calculateCycleSeverity(cycle);
        const impact = this.calculateCycleImpact(cycle);
        const resolution = this.generateResolutionStrategy(cycle);
        return {
            id: this.generateCycleId(cycle),
            cycle,
            severity,
            impact,
            description: this.generateCycleDescription(cycle),
            resolution,
            detectedAt: new Date().toISOString(),
            metadata: {
                cycleLength: cycle.length,
                involvedTypes: this.getInvolvedTypes(cycle),
                affectedFiles: cycle,
            },
        };
    }
    calculateCycleSeverity(cycle) {
        const length = cycle.length;
        const importance = this.calculateCycleImportance(cycle);
        if (length >= 5 || importance > 0.8) {
            return "critical";
        }
        else if (length >= 3 || importance > 0.6) {
            return "high";
        }
        else if (length >= 2 || importance > 0.4) {
            return "medium";
        }
        else {
            return "low";
        }
    }
    calculateCycleImportance(cycle) {
        let totalImportance = 0;
        for (const nodeId of cycle) {
            const node = this.dependencyGraph.nodes.get(nodeId);
            if (node) {
                totalImportance += node.metadata.importance;
            }
        }
        return totalImportance / cycle.length;
    }
    calculateCycleImpact(cycle) {
        const length = cycle.length;
        const importance = this.calculateCycleImportance(cycle);
        return {
            buildTime: Math.min(1, length * 0.2 * importance),
            runtime: Math.min(1, length * 0.15 * importance),
            maintainability: Math.min(1, length * 0.3 * importance),
            testability: Math.min(1, length * 0.25 * importance),
        };
    }
    generateResolutionStrategy(cycle) {
        const length = cycle.length;
        const types = this.getInvolvedTypes(cycle);
        // Determine best resolution strategy based on cycle characteristics
        if (length === 2) {
            return this.generateTwoNodeResolution(cycle);
        }
        else if (types.includes("interface") || types.includes("type")) {
            return this.generateInterfaceExtractionResolution(cycle);
        }
        else if (length > 3) {
            return this.generateRestructureResolution(cycle);
        }
        else {
            return this.generateDependencyInjectionResolution(cycle);
        }
    }
    generateTwoNodeResolution(cycle) {
        return {
            strategy: "extract-interface",
            description: "Extract a shared interface to break the circular dependency",
            effort: "low",
            risk: "low",
            steps: [
                "Create a shared interface or type definition",
                "Move common functionality to the interface",
                "Update both files to depend on the interface instead of each other",
            ],
            examples: [
                "// Create shared interface",
                "interface SharedInterface { ... }",
                "// File A implements SharedInterface",
                "// File B uses SharedInterface instead of File A directly",
            ],
        };
    }
    generateInterfaceExtractionResolution(cycle) {
        return {
            strategy: "extract-interface",
            description: "Extract interfaces to break circular dependencies",
            effort: "medium",
            risk: "medium",
            steps: [
                "Identify shared contracts between the files",
                "Extract interfaces for these contracts",
                "Create a separate interface file",
                "Update all files to depend on interfaces instead of implementations",
            ],
            examples: [
                "// Create interfaces/interfaces.ts",
                "export interface ServiceInterface { ... }",
                "export interface RepositoryInterface { ... }",
                "// Update files to use interfaces",
            ],
        };
    }
    generateDependencyInjectionResolution(cycle) {
        return {
            strategy: "dependency-injection",
            description: "Use dependency injection to break the circular dependency",
            effort: "medium",
            risk: "medium",
            steps: [
                "Identify the core dependency",
                "Create a dependency injection container",
                "Inject dependencies instead of importing them directly",
                "Update the initialization code to wire dependencies",
            ],
            examples: [
                "// Create DI container",
                "class DIContainer { ... }",
                "// Inject dependencies",
                "constructor(private service: ServiceInterface) {}",
            ],
        };
    }
    generateRestructureResolution(cycle) {
        return {
            strategy: "restructure",
            description: "Restructure the code to eliminate circular dependencies",
            effort: "high",
            risk: "high",
            steps: [
                "Analyze the dependencies and identify the root cause",
                "Consider using event-driven architecture",
                "Create a facade or service layer",
                "Move shared functionality to a common module",
                "Refactor the code to follow a clear dependency hierarchy",
            ],
            examples: [
                "// Create event system",
                "class EventBus { ... }",
                "// Use events instead of direct dependencies",
                'eventBus.emit("data-changed", data)',
            ],
        };
    }
    generateCycleDescription(cycle) {
        const fileNames = cycle.map((nodeId) => {
            const node = this.dependencyGraph.nodes.get(nodeId);
            return node ? basename(node.path) : nodeId;
        });
        return `Circular dependency between: ${fileNames.join(" → ")}`;
    }
    getInvolvedTypes(cycle) {
        const types = new Set();
        for (const nodeId of cycle) {
            const node = this.dependencyGraph.nodes.get(nodeId);
            if (node) {
                types.add(node.type);
            }
        }
        return Array.from(types);
    }
    isEdgeInCycle(source, target) {
        return this.dependencyGraph.cycles.some((cycle) => {
            for (let i = 0; i < cycle.length; i++) {
                const current = cycle[i];
                const next = cycle[(i + 1) % cycle.length];
                if (current === source && next === target) {
                    return true;
                }
            }
            return false;
        });
    }
    updateCycleMetrics() {
        const cycles = this.dependencyGraph.cycles;
        this.dependencyGraph.metrics.totalCycles = cycles.length;
        this.dependencyGraph.metrics.criticalCycles = cycles.filter((c) => c.severity === "critical").length;
        if (cycles.length > 0) {
            const totalLength = cycles.reduce((sum, cycle) => sum + cycle.metadata.cycleLength, 0);
            this.dependencyGraph.metrics.averageCycleLength =
                totalLength / cycles.length;
            this.dependencyGraph.metrics.maxCycleLength = Math.max(...cycles.map((c) => c.metadata.cycleLength));
        }
    }
    generateCircularDependencyReport() {
        const cycles = this.dependencyGraph.cycles;
        const criticalCycles = cycles.filter((c) => c.severity === "critical").length;
        // Group cycles by severity
        const cyclesBySeverity = {};
        for (const cycle of cycles) {
            cyclesBySeverity[cycle.severity] =
                (cyclesBySeverity[cycle.severity] || 0) + 1;
        }
        // Get top cycles (most critical)
        const topCycles = cycles
            .sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        })
            .slice(0, 10);
        // Create resolution plan
        const resolutionPlan = {
            immediate: cycles.filter((c) => c.severity === "critical"),
            shortTerm: cycles.filter((c) => c.severity === "high"),
            longTerm: cycles.filter((c) => c.severity === "medium" || c.severity === "low"),
        };
        // Generate recommendations
        const recommendations = this.generateRecommendations(cycles);
        // Calculate overall health
        const overallHealth = this.calculateOverallHealth(cycles);
        // Calculate impact metrics
        const metrics = this.calculateImpactMetrics(cycles);
        return {
            overallHealth,
            totalCycles: cycles.length,
            criticalCycles,
            cyclesBySeverity,
            topCycles,
            resolutionPlan,
            recommendations,
            metrics,
        };
    }
    generateRecommendations(cycles) {
        const immediate = [];
        const shortTerm = [];
        const longTerm = [];
        const criticalCycles = cycles.filter((c) => c.severity === "critical");
        const highCycles = cycles.filter((c) => c.severity === "high");
        if (criticalCycles.length > 0) {
            immediate.push(`🚨 Resolve ${criticalCycles.length} critical circular dependencies immediately`);
        }
        if (highCycles.length > 0) {
            immediate.push(`⚠️ Address ${highCycles.length} high-severity circular dependencies`);
        }
        if (cycles.length > 0) {
            shortTerm.push("🔍 Implement circular dependency detection in CI/CD pipeline");
            shortTerm.push("📚 Create dependency management guidelines");
            shortTerm.push("🎓 Conduct team training on dependency management");
        }
        longTerm.push("🏗️ Establish clear dependency hierarchy and architecture");
        longTerm.push("🔄 Implement automated circular dependency prevention");
        longTerm.push("📊 Create dependency health monitoring");
        longTerm.push("🎯 Use dependency injection and event-driven architecture");
        return { immediate, shortTerm, longTerm };
    }
    calculateOverallHealth(cycles) {
        if (cycles.length === 0)
            return 100;
        let penalty = 0;
        for (const cycle of cycles) {
            switch (cycle.severity) {
                case "critical":
                    penalty += 25;
                    break;
                case "high":
                    penalty += 15;
                    break;
                case "medium":
                    penalty += 8;
                    break;
                case "low":
                    penalty += 3;
                    break;
            }
        }
        return Math.max(0, 100 - penalty);
    }
    calculateImpactMetrics(cycles) {
        let buildTimeImpact = 0;
        let runtimeImpact = 0;
        let maintainabilityImpact = 0;
        let testabilityImpact = 0;
        for (const cycle of cycles) {
            buildTimeImpact += cycle.impact.buildTime;
            runtimeImpact += cycle.impact.runtime;
            maintainabilityImpact += cycle.impact.maintainability;
            testabilityImpact += cycle.impact.testability;
        }
        return {
            buildTimeImpact: Math.min(100, buildTimeImpact * 100),
            runtimeImpact: Math.min(100, runtimeImpact * 100),
            maintainabilityImpact: Math.min(100, maintainabilityImpact * 100),
            testabilityImpact: Math.min(100, testabilityImpact * 100),
        };
    }
    // Helper methods
    calculateComplexity(content) {
        const lines = content.split("\n");
        let complexity = 1;
        for (const line of lines) {
            if (line.includes("if") || line.includes("else"))
                complexity++;
            if (line.includes("for") || line.includes("while"))
                complexity++;
            if (line.includes("switch") || line.includes("case"))
                complexity++;
            if (line.includes("try") || line.includes("catch"))
                complexity++;
        }
        return complexity;
    }
    calculateImportance(filePath, content) {
        let importance = 0.1;
        // Increase importance for certain file types
        if (filePath.includes("index") || filePath.includes("main")) {
            importance += 0.3;
        }
        if (filePath.includes("service") || filePath.includes("api")) {
            importance += 0.2;
        }
        if (filePath.includes("component") || filePath.includes("ui")) {
            importance += 0.1;
        }
        // Increase importance for files with exports
        const exportCount = (content.match(/\bexport\b/g) || []).length;
        importance += Math.min(0.3, exportCount * 0.05);
        return Math.min(1, importance);
    }
    calculateStability(lastModified) {
        const daysSinceModified = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceModified < 7)
            return 0.2;
        if (daysSinceModified < 30)
            return 0.5;
        if (daysSinceModified < 90)
            return 0.8;
        return 1.0;
    }
    generateNodeId(filePath) {
        return filePath.replace(/[^a-zA-Z0-9]/g, "_");
    }
    generateCycleId(cycle) {
        return `cycle-${cycle.join("-")}-${Date.now()}`;
    }
}
