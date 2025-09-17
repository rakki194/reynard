/**
 * ADR Relationship Mapper - ADR Dependency and Relationship Analysis
 *
 * This module analyzes relationships between ADRs, including dependencies,
 * conflicts, and superseding relationships.
 */
import { ADRRelationship } from "./types";
export declare class ADRRelationshipMapper {
    private readonly adrDirectory;
    private readonly relationships;
    private readonly adrCache;
    constructor(adrDirectory: string);
    /**
     * Analyze all ADR relationships
     */
    analyzeRelationships(): Promise<ADRRelationship[]>;
    /**
     * Get relationships for a specific ADR
     */
    getRelationshipsForADR(adrId: string): {
        incoming: ADRRelationship[];
        outgoing: ADRRelationship[];
    };
    /**
     * Get relationship graph as adjacency list
     */
    getRelationshipGraph(): Map<string, string[]>;
    /**
     * Detect circular dependencies in ADR relationships
     */
    detectCircularDependencies(): string[][];
    /**
     * Get ADR dependency chain
     */
    getDependencyChain(adrId: string): string[];
    /**
     * Load all ADRs from directory
     */
    private loadAllADRs;
    /**
     * Parse ADR file into structured format
     */
    private parseADR;
    /**
     * Analyze superseding relationships
     */
    private analyzeSupersedingRelationships;
    /**
     * Analyze related ADR relationships
     */
    private analyzeRelatedADRs;
    /**
     * Analyze conflicting ADR relationships
     */
    private analyzeConflictingADRs;
    /**
     * Analyze dependency relationships
     */
    private analyzeDependencyRelationships;
    /**
     * Detect potential conflict between two ADRs
     */
    private detectPotentialConflict;
    /**
     * Check if one ADR depends on another
     */
    private isDependency;
    /**
     * Export relationships to JSON
     */
    exportRelationships(): string;
    /**
     * Import relationships from JSON
     */
    importRelationships(json: string): void;
}
