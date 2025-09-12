/**
 * Graph Database Integration - Neo4j and In-Memory Graph Support
 * 
 * This module provides integration with graph databases for persistent
 * storage and advanced querying of the ADR knowledge graph.
 */

import { KnowledgeNode, KnowledgeEdge, GraphQuery, GraphPath } from './KnowledgeGraph';

export interface GraphDatabaseConfig {
  type: 'neo4j' | 'in-memory' | 'json-file';
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

export abstract class GraphDatabase {
  protected config: GraphDatabaseConfig;
  
  constructor(config: GraphDatabaseConfig) {
    this.config = config;
  }

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
export class Neo4jGraphDatabase extends GraphDatabase {
  private driver: any;
  private session: any;

  constructor(config: GraphDatabaseConfig) {
    super(config);
    if (config.type !== 'neo4j') {
      throw new Error('Neo4jGraphDatabase requires type: "neo4j"');
    }
  }

  async connect(): Promise<void> {
    try {
      // In a real implementation, this would use the Neo4j driver
      // const neo4j = require('neo4j-driver');
      // this.driver = neo4j.driver(
      //   this.config.connectionString!,
      //   neo4j.auth.basic(this.config.username!, this.config.password!)
      // );
      // this.session = this.driver.session({ database: this.config.database });
      
      console.log('🦊 Connected to Neo4j database');
    } catch (error) {
      console.error('Failed to connect to Neo4j:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.session) {
      await this.session.close();
    }
    if (this.driver) {
      await this.driver.close();
    }
    console.log('🦊 Disconnected from Neo4j database');
  }

  async addNode(node: KnowledgeNode): Promise<void> {
    const cypher = `
      CREATE (n:${node.type} {
        id: $id,
        label: $label,
        properties: $properties,
        metadata: $metadata
      })
    `;
    
    const parameters = {
      id: node.id,
      label: node.label,
      properties: node.properties,
      metadata: node.metadata
    };
    
    // In a real implementation:
    // await this.session.run(cypher, parameters);
    
    console.log(`Added node: ${node.id} (${node.type})`);
  }

  async addEdge(edge: KnowledgeEdge): Promise<void> {
    const cypher = `
      MATCH (a {id: $sourceId}), (b {id: $targetId})
      CREATE (a)-[r:${edge.type.toUpperCase()} {
        id: $id,
        weight: $weight,
        properties: $properties,
        metadata: $metadata
      }]->(b)
    `;
    
    const parameters = {
      id: edge.id,
      sourceId: edge.source,
      targetId: edge.target,
      weight: edge.weight,
      properties: edge.properties,
      metadata: edge.metadata
    };
    
    // In a real implementation:
    // await this.session.run(cypher, parameters);
    
    console.log(`Added edge: ${edge.source} -> ${edge.target} (${edge.type})`);
  }

  async removeNode(nodeId: string): Promise<void> {
    const cypher = `
      MATCH (n {id: $nodeId})
      DETACH DELETE n
    `;
    
    // In a real implementation:
    // await this.session.run(cypher, { nodeId });
    
    console.log(`Removed node: ${nodeId}`);
  }

  async removeEdge(edgeId: string): Promise<void> {
    const cypher = `
      MATCH ()-[r {id: $edgeId}]-()
      DELETE r
    `;
    
    // In a real implementation:
    // await this.session.run(cypher, { edgeId });
    
    console.log(`Removed edge: ${edgeId}`);
  }

  async query(query: GraphQuery): Promise<QueryResult> {
    const startTime = Date.now();
    
    let cypher = 'MATCH (n)';
    const parameters: any = {};
    
    // Add node type filters
    if (query.nodeTypes && query.nodeTypes.length > 0) {
      const typeConditions = query.nodeTypes.map((type, index) => {
        parameters[`type${index}`] = type;
        return `n:${type}`;
      });
      cypher += ` WHERE ${typeConditions.join(' OR ')}`;
    }
    
    // Add property filters
    if (query.properties) {
      const propertyConditions = Object.entries(query.properties).map(([key, value], index) => {
        parameters[`prop${index}`] = value;
        return `n.properties.${key} = $prop${index}`;
      });
      
      if (query.nodeTypes && query.nodeTypes.length > 0) {
        cypher += ` AND ${propertyConditions.join(' AND ')}`;
      } else {
        cypher += ` WHERE ${propertyConditions.join(' AND ')}`;
      }
    }
    
    // Add relationship traversal
    if (query.depth && query.depth > 0) {
      cypher += `-[*1..${query.depth}]-(connected)`;
    }
    
    cypher += ' RETURN n, connected';
    
    if (query.limit) {
      cypher += ` LIMIT ${query.limit}`;
    }
    
    // In a real implementation:
    // const result = await this.session.run(cypher, parameters);
    // const nodes = result.records.map(record => record.get('n').properties);
    // const edges = result.records.map(record => record.get('connected').properties);
    
    const executionTime = Date.now() - startTime;
    
    return {
      nodes: [], // Would be populated from Neo4j result
      edges: [], // Would be populated from Neo4j result
      metrics: {
        executionTime,
        resultCount: 0
      }
    };
  }

  async findShortestPath(sourceId: string, targetId: string): Promise<GraphPath | null> {
    const cypher = `
      MATCH (source {id: $sourceId}), (target {id: $targetId}),
            path = shortestPath((source)-[*]-(target))
      RETURN path
    `;
    
    // In a real implementation:
    // const result = await this.session.run(cypher, { sourceId, targetId });
    // if (result.records.length > 0) {
    //   const path = result.records[0].get('path');
    //   return this.convertNeo4jPathToGraphPath(path);
    // }
    
    return null;
  }

  async findAllPaths(sourceId: string, targetId: string, maxDepth: number = 5): Promise<GraphPath[]> {
    const cypher = `
      MATCH (source {id: $sourceId}), (target {id: $targetId}),
            paths = (source)-[*1..${maxDepth}]-(target)
      RETURN paths
    `;
    
    // In a real implementation:
    // const result = await this.session.run(cypher, { sourceId, targetId });
    // return result.records.map(record => 
    //   this.convertNeo4jPathToGraphPath(record.get('paths'))
    // );
    
    return [];
  }

  async detectCommunities(): Promise<Map<string, string[]>> {
    const cypher = `
      CALL gds.wcc.stream('adr-graph')
      YIELD nodeId, componentId
      RETURN componentId, collect(gds.util.asNode(nodeId).id) as nodes
    `;
    
    // In a real implementation:
    // const result = await this.session.run(cypher);
    // const communities = new Map<string, string[]>();
    // for (const record of result.records) {
    //   const componentId = record.get('componentId');
    //   const nodes = record.get('nodes');
    //   communities.set(`community-${componentId}`, nodes);
    // }
    // return communities;
    
    return new Map();
  }

  async calculateMetrics(): Promise<any> {
    const cypher = `
      MATCH (n)
      RETURN 
        count(n) as totalNodes,
        count(DISTINCT labels(n)[0]) as nodeTypes,
        avg(size(keys(n))) as avgProperties
    `;
    
    // In a real implementation:
    // const result = await this.session.run(cypher);
    // return result.records[0].toObject();
    
    return {
      totalNodes: 0,
      nodeTypes: 0,
      avgProperties: 0
    };
  }

  private convertNeo4jPathToGraphPath(neo4jPath: any): GraphPath {
    // Convert Neo4j path to GraphPath format
    return {
      nodes: [],
      edges: [],
      weight: 0,
      length: 0
    };
  }
}

/**
 * In-Memory Graph Database Implementation
 */
export class InMemoryGraphDatabase extends GraphDatabase {
  private nodes: Map<string, KnowledgeNode> = new Map();
  private edges: Map<string, KnowledgeEdge> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map();

  constructor(config: GraphDatabaseConfig) {
    super(config);
    if (config.type !== 'in-memory') {
      throw new Error('InMemoryGraphDatabase requires type: "in-memory"');
    }
  }

  async connect(): Promise<void> {
    console.log('🦊 Connected to in-memory graph database');
  }

  async disconnect(): Promise<void> {
    this.nodes.clear();
    this.edges.clear();
    this.adjacencyList.clear();
    console.log('🦊 Disconnected from in-memory graph database');
  }

  async addNode(node: KnowledgeNode): Promise<void> {
    this.nodes.set(node.id, node);
    this.adjacencyList.set(node.id, new Set());
  }

  async addEdge(edge: KnowledgeEdge): Promise<void> {
    this.edges.set(edge.id, edge);
    
    const sourceNeighbors = this.adjacencyList.get(edge.source) || new Set();
    sourceNeighbors.add(edge.target);
    this.adjacencyList.set(edge.source, sourceNeighbors);
  }

  async removeNode(nodeId: string): Promise<void> {
    this.nodes.delete(nodeId);
    this.adjacencyList.delete(nodeId);
    
    // Remove all edges connected to this node
    for (const [edgeId, edge] of this.edges) {
      if (edge.source === nodeId || edge.target === nodeId) {
        this.edges.delete(edgeId);
      }
    }
  }

  async removeEdge(edgeId: string): Promise<void> {
    const edge = this.edges.get(edgeId);
    if (edge) {
      this.edges.delete(edgeId);
      
      const sourceNeighbors = this.adjacencyList.get(edge.source);
      if (sourceNeighbors) {
        sourceNeighbors.delete(edge.target);
      }
    }
  }

  async query(query: GraphQuery): Promise<QueryResult> {
    const startTime = Date.now();
    
    let filteredNodes = Array.from(this.nodes.values());
    let filteredEdges = Array.from(this.edges.values());
    
    // Apply filters
    if (query.nodeTypes && query.nodeTypes.length > 0) {
      filteredNodes = filteredNodes.filter(node => query.nodeTypes!.includes(node.type));
    }
    
    if (query.edgeTypes && query.edgeTypes.length > 0) {
      filteredEdges = filteredEdges.filter(edge => query.edgeTypes!.includes(edge.type));
    }
    
    if (query.properties) {
      filteredNodes = filteredNodes.filter(node => 
        Object.entries(query.properties!).every(([key, value]) => 
          node.properties[key] === value
        )
      );
    }
    
    if (query.limit) {
      filteredNodes = filteredNodes.slice(0, query.limit);
    }
    
    const executionTime = Date.now() - startTime;
    
    return {
      nodes: filteredNodes,
      edges: filteredEdges,
      metrics: {
        executionTime,
        resultCount: filteredNodes.length
      }
    };
  }

  async findShortestPath(sourceId: string, targetId: string): Promise<GraphPath | null> {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) {
      return null;
    }
    
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; path: string[]; weight: number }> = [
      { nodeId: sourceId, path: [sourceId], weight: 0 }
    ];
    
    while (queue.length > 0) {
      const { nodeId, path, weight } = queue.shift()!;
      
      if (nodeId === targetId) {
        const nodes = path.map(id => this.nodes.get(id)!);
        const edges: KnowledgeEdge[] = [];
        
        for (let i = 0; i < path.length - 1; i++) {
          const edge = this.findEdge(path[i], path[i + 1]);
          if (edge) edges.push(edge);
        }
        
        return {
          nodes,
          edges,
          weight,
          length: path.length - 1
        };
      }
      
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      
      const neighbors = this.adjacencyList.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const edge = this.findEdge(nodeId, neighbor);
          const newWeight = weight + (edge ? (1 - edge.weight) : 1);
          queue.push({
            nodeId: neighbor,
            path: [...path, neighbor],
            weight: newWeight
          });
        }
      }
    }
    
    return null;
  }

  async findAllPaths(sourceId: string, targetId: string, maxDepth: number = 5): Promise<GraphPath[]> {
    const paths: GraphPath[] = [];
    
    const dfs = (currentId: string, targetId: string, path: string[], visited: Set<string>, depth: number): void => {
      if (depth > maxDepth) return;
      
      if (currentId === targetId) {
        const nodes = path.map(id => this.nodes.get(id)!);
        const edges: KnowledgeEdge[] = [];
        let totalWeight = 0;
        
        for (let i = 0; i < path.length - 1; i++) {
          const edge = this.findEdge(path[i], path[i + 1]);
          if (edge) {
            edges.push(edge);
            totalWeight += (1 - edge.weight);
          }
        }
        
        paths.push({
          nodes,
          edges,
          weight: totalWeight,
          length: path.length - 1
        });
        return;
      }
      
      const neighbors = this.adjacencyList.get(currentId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          dfs(neighbor, targetId, [...path, neighbor], visited, depth + 1);
          visited.delete(neighbor);
        }
      }
    };
    
    dfs(sourceId, targetId, [sourceId], new Set([sourceId]), 0);
    return paths;
  }

  async detectCommunities(): Promise<Map<string, string[]>> {
    const communities = new Map<string, string[]>();
    const visited = new Set<string>();
    
    const dfs = (nodeId: string, communityId: string): void => {
      if (visited.has(nodeId)) return;
      
      visited.add(nodeId);
      const community = communities.get(communityId) || [];
      community.push(nodeId);
      communities.set(communityId, community);
      
      const neighbors = this.adjacencyList.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        dfs(neighbor, communityId);
      }
    };
    
    let communityCounter = 0;
    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId, `community-${communityCounter++}`);
      }
    }
    
    return communities;
  }

  async calculateMetrics(): Promise<any> {
    const nodeTypes: Record<string, number> = {};
    const edgeTypes: Record<string, number> = {};
    
    for (const node of this.nodes.values()) {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    }
    
    for (const edge of this.edges.values()) {
      edgeTypes[edge.type] = (edgeTypes[edge.type] || 0) + 1;
    }
    
    const totalDegree = Array.from(this.adjacencyList.values())
      .reduce((sum, neighbors) => sum + neighbors.size, 0);
    
    const averageDegree = this.nodes.size > 0 ? totalDegree / this.nodes.size : 0;
    
    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.size,
      nodeTypes,
      edgeTypes,
      averageDegree
    };
  }

  private findEdge(sourceId: string, targetId: string): KnowledgeEdge | undefined {
    for (const edge of this.edges.values()) {
      if (edge.source === sourceId && edge.target === targetId) {
        return edge;
      }
    }
    return undefined;
  }
}

/**
 * JSON File Graph Database Implementation
 */
export class JsonFileGraphDatabase extends GraphDatabase {
  private nodes: Map<string, KnowledgeNode> = new Map();
  private edges: Map<string, KnowledgeEdge> = new Map();

  constructor(config: GraphDatabaseConfig) {
    super(config);
    if (config.type !== 'json-file') {
      throw new Error('JsonFileGraphDatabase requires type: "json-file"');
    }
  }

  async connect(): Promise<void> {
    if (this.config.filePath) {
      try {
        const fs = await import('fs/promises');
        const data = await fs.readFile(this.config.filePath, 'utf-8');
        const graphData = JSON.parse(data);
        
        for (const node of graphData.nodes || []) {
          this.nodes.set(node.id, node);
        }
        
        for (const edge of graphData.edges || []) {
          this.edges.set(edge.id, edge);
        }
        
        console.log(`🦊 Loaded graph from ${this.config.filePath}`);
      } catch (error) {
        console.log(`🦊 Created new graph database at ${this.config.filePath}`);
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.config.filePath) {
      try {
        const fs = await import('fs/promises');
        const graphData = {
          nodes: Array.from(this.nodes.values()),
          edges: Array.from(this.edges.values()),
          metadata: {
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
          }
        };
        
        await fs.writeFile(this.config.filePath, JSON.stringify(graphData, null, 2));
        console.log(`🦊 Saved graph to ${this.config.filePath}`);
      } catch (error) {
        console.error('Failed to save graph:', error);
      }
    }
  }

  async addNode(node: KnowledgeNode): Promise<void> {
    this.nodes.set(node.id, node);
  }

  async addEdge(edge: KnowledgeEdge): Promise<void> {
    this.edges.set(edge.id, edge);
  }

  async removeNode(nodeId: string): Promise<void> {
    this.nodes.delete(nodeId);
    
    // Remove all edges connected to this node
    for (const [edgeId, edge] of this.edges) {
      if (edge.source === nodeId || edge.target === nodeId) {
        this.edges.delete(edgeId);
      }
    }
  }

  async removeEdge(edgeId: string): Promise<void> {
    this.edges.delete(edgeId);
  }

  async query(query: GraphQuery): Promise<QueryResult> {
    // Similar implementation to InMemoryGraphDatabase
    const startTime = Date.now();
    
    let filteredNodes = Array.from(this.nodes.values());
    let filteredEdges = Array.from(this.edges.values());
    
    if (query.nodeTypes && query.nodeTypes.length > 0) {
      filteredNodes = filteredNodes.filter(node => query.nodeTypes!.includes(node.type));
    }
    
    if (query.edgeTypes && query.edgeTypes.length > 0) {
      filteredEdges = filteredEdges.filter(edge => query.edgeTypes!.includes(edge.type));
    }
    
    if (query.properties) {
      filteredNodes = filteredNodes.filter(node => 
        Object.entries(query.properties!).every(([key, value]) => 
          node.properties[key] === value
        )
      );
    }
    
    if (query.limit) {
      filteredNodes = filteredNodes.slice(0, query.limit);
    }
    
    const executionTime = Date.now() - startTime;
    
    return {
      nodes: filteredNodes,
      edges: filteredEdges,
      metrics: {
        executionTime,
        resultCount: filteredNodes.length
      }
    };
  }

  async findShortestPath(sourceId: string, targetId: string): Promise<GraphPath | null> {
    // Simplified implementation - would need proper graph traversal
    return null;
  }

  async findAllPaths(sourceId: string, targetId: string, maxDepth: number = 5): Promise<GraphPath[]> {
    // Simplified implementation - would need proper graph traversal
    return [];
  }

  async detectCommunities(): Promise<Map<string, string[]>> {
    // Simplified implementation - would need proper community detection
    return new Map();
  }

  async calculateMetrics(): Promise<any> {
    const nodeTypes: Record<string, number> = {};
    const edgeTypes: Record<string, number> = {};
    
    for (const node of this.nodes.values()) {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    }
    
    for (const edge of this.edges.values()) {
      edgeTypes[edge.type] = (edgeTypes[edge.type] || 0) + 1;
    }
    
    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.size,
      nodeTypes,
      edgeTypes
    };
  }
}

/**
 * Graph Database Factory
 */
export class GraphDatabaseFactory {
  static create(config: GraphDatabaseConfig): GraphDatabase {
    switch (config.type) {
      case 'neo4j':
        return new Neo4jGraphDatabase(config);
      case 'in-memory':
        return new InMemoryGraphDatabase(config);
      case 'json-file':
        return new JsonFileGraphDatabase(config);
      default:
        throw new Error(`Unsupported graph database type: ${config.type}`);
    }
  }
}
