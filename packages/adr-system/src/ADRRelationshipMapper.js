/**
 * ADR Relationship Mapper - ADR Dependency and Relationship Analysis
 *
 * This module analyzes relationships between ADRs, including dependencies,
 * conflicts, and superseding relationships.
 */
import { readFile, readdir } from "fs/promises";
import { join } from "path";
export class ADRRelationshipMapper {
    constructor(adrDirectory) {
        Object.defineProperty(this, "adrDirectory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "relationships", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "adrCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        this.adrDirectory = adrDirectory;
    }
    /**
     * Analyze all ADR relationships
     */
    async analyzeRelationships() {
        console.log("🦊 Analyzing ADR relationships...");
        await this.loadAllADRs();
        this.relationships.length = 0; // Clear existing relationships
        // Analyze different types of relationships
        await this.analyzeSupersedingRelationships();
        await this.analyzeRelatedADRs();
        await this.analyzeConflictingADRs();
        await this.analyzeDependencyRelationships();
        console.log(`✅ Found ${this.relationships.length} ADR relationships`);
        return this.relationships;
    }
    /**
     * Get relationships for a specific ADR
     */
    getRelationshipsForADR(adrId) {
        const incoming = this.relationships.filter((rel) => rel.target === adrId);
        const outgoing = this.relationships.filter((rel) => rel.source === adrId);
        return { incoming, outgoing };
    }
    /**
     * Get relationship graph as adjacency list
     */
    getRelationshipGraph() {
        const graph = new Map();
        for (const adr of this.adrCache.values()) {
            graph.set(adr.id, []);
        }
        for (const relationship of this.relationships) {
            const neighbors = graph.get(relationship.source) || [];
            neighbors.push(relationship.target);
            graph.set(relationship.source, neighbors);
        }
        return graph;
    }
    /**
     * Detect circular dependencies in ADR relationships
     */
    detectCircularDependencies() {
        const graph = this.getRelationshipGraph();
        const visited = new Set();
        const recursionStack = new Set();
        const cycles = [];
        const dfs = (node, path) => {
            if (recursionStack.has(node)) {
                // Found a cycle
                const cycleStart = path.indexOf(node);
                cycles.push(path.slice(cycleStart));
                return;
            }
            if (visited.has(node)) {
                return;
            }
            visited.add(node);
            recursionStack.add(node);
            path.push(node);
            const neighbors = graph.get(node) || [];
            for (const neighbor of neighbors) {
                dfs(neighbor, [...path]);
            }
            recursionStack.delete(node);
        };
        for (const node of graph.keys()) {
            if (!visited.has(node)) {
                dfs(node, []);
            }
        }
        return cycles;
    }
    /**
     * Get ADR dependency chain
     */
    getDependencyChain(adrId) {
        const visited = new Set();
        const chain = [];
        const buildChain = (id) => {
            if (visited.has(id)) {
                return;
            }
            visited.add(id);
            chain.push(id);
            const outgoing = this.relationships.filter((rel) => rel.source === id && rel.type === "depends_on");
            for (const rel of outgoing) {
                buildChain(rel.target);
            }
        };
        buildChain(adrId);
        return chain;
    }
    /**
     * Load all ADRs from directory
     */
    async loadAllADRs() {
        try {
            const files = await readdir(this.adrDirectory);
            const adrFiles = files.filter((file) => file.endsWith(".md") && file.match(/^\d{3}-/));
            for (const file of adrFiles) {
                const filePath = join(this.adrDirectory, file);
                const adr = await this.parseADR(filePath);
                if (adr) {
                    this.adrCache.set(adr.id, adr);
                }
            }
        }
        catch (error) {
            console.error("Failed to load ADRs:", error);
        }
    }
    /**
     * Parse ADR file into structured format
     */
    async parseADR(filePath) {
        try {
            const content = await readFile(filePath, "utf-8");
            const lines = content.split("\n");
            const adr = {};
            // Extract basic information
            const titleMatch = content.match(/^# ADR-(\d+): (.+)$/m);
            if (titleMatch) {
                adr.id = titleMatch[1];
                adr.title = titleMatch[2];
            }
            // Extract status
            const statusMatch = content.match(/\*\*(.*?)\*\*/);
            if (statusMatch) {
                adr.status = statusMatch[1].toLowerCase();
            }
            // Extract related ADRs
            const relatedMatch = content.match(/relatedADRs:\s*\[(.*?)\]/s);
            if (relatedMatch) {
                adr.relatedADRs = relatedMatch[1]
                    .split(",")
                    .map((id) => id.trim().replace(/['"]/g, ""))
                    .filter((id) => id);
            }
            // Extract superseded by
            const supersededByMatch = content.match(/supersededBy:\s*(.+)/);
            if (supersededByMatch) {
                adr.supersededBy = supersededByMatch[1].trim();
            }
            // Extract supersedes
            const supersedesMatch = content.match(/supersedes:\s*\[(.*?)\]/s);
            if (supersedesMatch) {
                adr.supersedes = supersedesMatch[1]
                    .split(",")
                    .map((id) => id.trim().replace(/['"]/g, ""))
                    .filter((id) => id);
            }
            return adr;
        }
        catch (error) {
            console.error(`Failed to parse ADR ${filePath}:`, error);
            return null;
        }
    }
    /**
     * Analyze superseding relationships
     */
    async analyzeSupersedingRelationships() {
        for (const adr of this.adrCache.values()) {
            if (adr.supersededBy) {
                this.relationships.push({
                    source: adr.id,
                    target: adr.supersededBy,
                    type: "supersedes",
                    strength: 1.0,
                    description: `${adr.title} is superseded by ${adr.supersededBy}`,
                });
            }
            if (adr.supersedes) {
                for (const supersededId of adr.supersedes) {
                    this.relationships.push({
                        source: adr.id,
                        target: supersededId,
                        type: "supersedes",
                        strength: 1.0,
                        description: `${adr.title} supersedes ${supersededId}`,
                    });
                }
            }
        }
    }
    /**
     * Analyze related ADR relationships
     */
    async analyzeRelatedADRs() {
        for (const adr of this.adrCache.values()) {
            if (adr.relatedADRs) {
                for (const relatedId of adr.relatedADRs) {
                    this.relationships.push({
                        source: adr.id,
                        target: relatedId,
                        type: "related",
                        strength: 0.5,
                        description: `${adr.title} is related to ${relatedId}`,
                    });
                }
            }
        }
    }
    /**
     * Analyze conflicting ADR relationships
     */
    async analyzeConflictingADRs() {
        // This is a simplified implementation
        // In a real system, this would use more sophisticated analysis
        const adrs = Array.from(this.adrCache.values());
        for (let i = 0; i < adrs.length; i++) {
            for (let j = i + 1; j < adrs.length; j++) {
                const adr1 = adrs[i];
                const adr2 = adrs[j];
                // Check for potential conflicts based on content similarity
                if (this.detectPotentialConflict(adr1, adr2)) {
                    this.relationships.push({
                        source: adr1.id,
                        target: adr2.id,
                        type: "conflicts",
                        strength: 0.7,
                        description: `Potential conflict between ${adr1.title} and ${adr2.title}`,
                    });
                }
            }
        }
    }
    /**
     * Analyze dependency relationships
     */
    async analyzeDependencyRelationships() {
        // This is a simplified implementation
        // In a real system, this would analyze actual implementation dependencies
        for (const adr of this.adrCache.values()) {
            if (adr.relatedADRs) {
                for (const relatedId of adr.relatedADRs) {
                    const relatedADR = this.adrCache.get(relatedId);
                    if (relatedADR && this.isDependency(adr, relatedADR)) {
                        this.relationships.push({
                            source: adr.id,
                            target: relatedId,
                            type: "depends_on",
                            strength: 0.8,
                            description: `${adr.title} depends on ${relatedADR.title}`,
                        });
                    }
                }
            }
        }
    }
    /**
     * Detect potential conflict between two ADRs
     */
    detectPotentialConflict(adr1, adr2) {
        // Simplified conflict detection based on title similarity
        const title1 = adr1.title.toLowerCase();
        const title2 = adr2.title.toLowerCase();
        const commonWords = title1
            .split(" ")
            .filter((word) => title2.includes(word) && word.length > 3);
        return commonWords.length >= 2;
    }
    /**
     * Check if one ADR depends on another
     */
    isDependency(adr1, adr2) {
        // Simplified dependency detection
        // In a real system, this would analyze implementation dependencies
        const title1 = adr1.title.toLowerCase();
        const title2 = adr2.title.toLowerCase();
        // Check for common dependency patterns
        const dependencyKeywords = [
            "depends on",
            "requires",
            "builds on",
            "extends",
        ];
        return dependencyKeywords.some((keyword) => title1.includes(keyword) || title2.includes(keyword));
    }
    /**
     * Export relationships to JSON
     */
    exportRelationships() {
        return JSON.stringify(this.relationships, null, 2);
    }
    /**
     * Import relationships from JSON
     */
    importRelationships(json) {
        try {
            const relationships = JSON.parse(json);
            this.relationships.push(...relationships);
        }
        catch (error) {
            console.error("Failed to import relationships:", error);
        }
    }
}
