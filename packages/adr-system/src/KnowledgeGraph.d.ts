/**
 * ADR Knowledge Graph - Comprehensive ADR Relationship Management
 *
 * This module provides a sophisticated knowledge graph system for managing
 * complex relationships between ADRs, architectural patterns, and codebase elements.
 */
export interface KnowledgeNode {
    id: string;
    type: "adr" | "pattern" | "component" | "dependency" | "stakeholder" | "technology";
    label: string;
    properties: Record<string, any>;
    metadata: {
        createdAt: string;
        updatedAt: string;
        version: string;
        confidence: number;
    };
}
export interface KnowledgeEdge {
    id: string;
    source: string;
    target: string;
    type: "supersedes" | "related" | "conflicts" | "depends_on" | "implements" | "influences" | "constrains";
    weight: number;
    properties: Record<string, any>;
    metadata: {
        createdAt: string;
        confidence: number;
        evidence: string[];
    };
}
export interface GraphQuery {
    nodeTypes?: string[];
    edgeTypes?: string[];
    properties?: Record<string, any>;
    depth?: number;
    limit?: number;
}
export interface GraphPath {
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
    weight: number;
    length: number;
}
export interface GraphMetrics {
    totalNodes: number;
    totalEdges: number;
    nodeTypes: Record<string, number>;
    edgeTypes: Record<string, number>;
    averageDegree: number;
    clusteringCoefficient: number;
    connectedComponents: number;
}
export declare class ADRKnowledgeGraph {
    private readonly dataPath;
    private nodes;
    private edges;
    private adjacencyList;
    private reverseAdjacencyList;
    constructor(dataPath: string);
    /**
     * Build the complete knowledge graph from ADRs and codebase analysis
     */
    buildGraph(): Promise<void>;
    /**
     * Add a node to the knowledge graph
     */
    addNode(node: KnowledgeNode): void;
    /**
     * Add an edge to the knowledge graph
     */
    addEdge(edge: KnowledgeEdge): void;
    /**
     * Query the knowledge graph
     */
    queryGraph(query: GraphQuery): {
        nodes: KnowledgeNode[];
        edges: KnowledgeEdge[];
    };
    /**
     * Find shortest path between two nodes
     */
    findShortestPath(sourceId: string, targetId: string): GraphPath | null;
    /**
     * Find all paths between two nodes
     */
    findAllPaths(sourceId: string, targetId: string, maxDepth?: number): GraphPath[];
    /**
     * Detect communities in the knowledge graph
     */
    detectCommunities(): Map<string, string[]>;
    /**
     * Calculate graph metrics
     */
    calculateGraphMetrics(): GraphMetrics;
    /**
     * Export graph to various formats
     */
    exportGraph(format: "json" | "graphml" | "cypher"): string;
    /**
     * Import graph from JSON
     */
    importGraph(json: string): void;
    private loadADRNodes;
    private loadPatternNodes;
    private loadComponentNodes;
    private loadDependencyNodes;
    private loadStakeholderNodes;
    private loadTechnologyNodes;
    private buildRelationships;
    private findEdge;
    private calculateClusteringCoefficient;
    private exportToGraphML;
    private exportToCypher;
}
