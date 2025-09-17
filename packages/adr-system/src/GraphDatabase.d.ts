/**
 * Graph Database Integration - Neo4j and In-Memory Graph Support
 *
 * This module provides integration with graph databases for persistent
 * storage and advanced querying of the ADR knowledge graph.
 */
import { KnowledgeNode, KnowledgeEdge, GraphQuery, GraphPath } from "./KnowledgeGraph";
export interface GraphDatabaseConfig {
    type: "neo4j" | "in-memory" | "json-file";
    connectionString?: string;
    username?: string;
    password?: string;
    database?: string;
    filePath?: string;
}
export interface QueryResult {
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
    paths?: GraphPath[];
    metrics?: {
        executionTime: number;
        resultCount: number;
    };
}
export declare abstract class GraphDatabase {
    protected config: GraphDatabaseConfig;
    constructor(config: GraphDatabaseConfig);
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract addNode(node: KnowledgeNode): Promise<void>;
    abstract addEdge(edge: KnowledgeEdge): Promise<void>;
    abstract removeNode(nodeId: string): Promise<void>;
    abstract removeEdge(edgeId: string): Promise<void>;
    abstract query(query: GraphQuery): Promise<QueryResult>;
    abstract findShortestPath(sourceId: string, targetId: string): Promise<GraphPath | null>;
    abstract findAllPaths(sourceId: string, targetId: string, maxDepth?: number): Promise<GraphPath[]>;
    abstract detectCommunities(): Promise<Map<string, string[]>>;
    abstract calculateMetrics(): Promise<any>;
}
/**
 * Neo4j Graph Database Implementation
 */
export declare class Neo4jGraphDatabase extends GraphDatabase {
    private driver;
    private session;
    constructor(config: GraphDatabaseConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    addNode(node: KnowledgeNode): Promise<void>;
    addEdge(edge: KnowledgeEdge): Promise<void>;
    removeNode(nodeId: string): Promise<void>;
    removeEdge(edgeId: string): Promise<void>;
    query(query: GraphQuery): Promise<QueryResult>;
    findShortestPath(sourceId: string, targetId: string): Promise<GraphPath | null>;
    findAllPaths(sourceId: string, targetId: string, maxDepth?: number): Promise<GraphPath[]>;
    detectCommunities(): Promise<Map<string, string[]>>;
    calculateMetrics(): Promise<any>;
    private convertNeo4jPathToGraphPath;
}
/**
 * In-Memory Graph Database Implementation
 */
export declare class InMemoryGraphDatabase extends GraphDatabase {
    private nodes;
    private edges;
    private adjacencyList;
    constructor(config: GraphDatabaseConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    addNode(node: KnowledgeNode): Promise<void>;
    addEdge(edge: KnowledgeEdge): Promise<void>;
    removeNode(nodeId: string): Promise<void>;
    removeEdge(edgeId: string): Promise<void>;
    query(query: GraphQuery): Promise<QueryResult>;
    findShortestPath(sourceId: string, targetId: string): Promise<GraphPath | null>;
    findAllPaths(sourceId: string, targetId: string, maxDepth?: number): Promise<GraphPath[]>;
    detectCommunities(): Promise<Map<string, string[]>>;
    calculateMetrics(): Promise<any>;
    private findEdge;
}
/**
 * JSON File Graph Database Implementation
 */
export declare class JsonFileGraphDatabase extends GraphDatabase {
    private nodes;
    private edges;
    constructor(config: GraphDatabaseConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    addNode(node: KnowledgeNode): Promise<void>;
    addEdge(edge: KnowledgeEdge): Promise<void>;
    removeNode(nodeId: string): Promise<void>;
    removeEdge(edgeId: string): Promise<void>;
    query(query: GraphQuery): Promise<QueryResult>;
    findShortestPath(sourceId: string, targetId: string): Promise<GraphPath | null>;
    findAllPaths(sourceId: string, targetId: string, maxDepth?: number): Promise<GraphPath[]>;
    detectCommunities(): Promise<Map<string, string[]>>;
    calculateMetrics(): Promise<any>;
}
/**
 * Graph Database Factory
 */
export declare class GraphDatabaseFactory {
    static create(config: GraphDatabaseConfig): GraphDatabase;
}
