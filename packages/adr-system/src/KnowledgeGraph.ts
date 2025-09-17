/**
 * ADR Knowledge Graph - Comprehensive ADR Relationship Management
 *
 * This module provides a sophisticated knowledge graph system for managing
 * complex relationships between ADRs, architectural patterns, and codebase elements.
 */

import { readFile, writeFile, readdir } from "fs/promises";
import { join } from "path";
import { ADRDocument, ADRRelationship } from "./types";

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
  weight: number; // 0-1
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

export class ADRKnowledgeGraph {
  private nodes: Map<string, KnowledgeNode> = new Map();
  private edges: Map<string, KnowledgeEdge> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map();
  private reverseAdjacencyList: Map<string, Set<string>> = new Map();

  constructor(private readonly dataPath: string) {}

  /**
   * Build the complete knowledge graph from ADRs and codebase analysis
   */
  async buildGraph(): Promise<void> {
    console.log("🦊 Building ADR Knowledge Graph...");

    // Clear existing graph
    this.nodes.clear();
    this.edges.clear();
    this.adjacencyList.clear();
    this.reverseAdjacencyList.clear();

    // Load ADR nodes
    await this.loadADRNodes();

    // Load architectural pattern nodes
    await this.loadPatternNodes();

    // Load component nodes
    await this.loadComponentNodes();

    // Load dependency nodes
    await this.loadDependencyNodes();

    // Load stakeholder nodes
    await this.loadStakeholderNodes();

    // Load technology nodes
    await this.loadTechnologyNodes();

    // Build relationships
    await this.buildRelationships();

    // Calculate graph metrics
    const metrics = this.calculateGraphMetrics();

    console.log(`✅ Knowledge Graph built: ${metrics.totalNodes} nodes, ${metrics.totalEdges} edges`);
  }

  /**
   * Add a node to the knowledge graph
   */
  addNode(node: KnowledgeNode): void {
    this.nodes.set(node.id, node);
    this.adjacencyList.set(node.id, new Set());
    this.reverseAdjacencyList.set(node.id, new Set());
  }

  /**
   * Add an edge to the knowledge graph
   */
  addEdge(edge: KnowledgeEdge): void {
    this.edges.set(edge.id, edge);

    // Update adjacency lists
    const sourceNeighbors = this.adjacencyList.get(edge.source) || new Set();
    sourceNeighbors.add(edge.target);
    this.adjacencyList.set(edge.source, sourceNeighbors);

    const targetNeighbors = this.reverseAdjacencyList.get(edge.target) || new Set();
    targetNeighbors.add(edge.source);
    this.reverseAdjacencyList.set(edge.target, targetNeighbors);
  }

  /**
   * Query the knowledge graph
   */
  queryGraph(query: GraphQuery): {
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
  } {
    let filteredNodes = Array.from(this.nodes.values());
    let filteredEdges = Array.from(this.edges.values());

    // Filter by node types
    if (query.nodeTypes && query.nodeTypes.length > 0) {
      filteredNodes = filteredNodes.filter(node => query.nodeTypes!.includes(node.type));
    }

    // Filter by edge types
    if (query.edgeTypes && query.edgeTypes.length > 0) {
      filteredEdges = filteredEdges.filter(edge => query.edgeTypes!.includes(edge.type));
    }

    // Filter by properties
    if (query.properties) {
      filteredNodes = filteredNodes.filter(node =>
        Object.entries(query.properties!).every(([key, value]) => node.properties[key] === value)
      );
    }

    // Apply depth limit
    if (query.depth && query.depth > 0) {
      const reachableNodes = new Set<string>();
      const startNodes = filteredNodes.map(n => n.id);

      const dfs = (nodeId: string, currentDepth: number): void => {
        if (currentDepth >= query.depth!) return;
        reachableNodes.add(nodeId);

        const neighbors = this.adjacencyList.get(nodeId) || new Set();
        for (const neighbor of neighbors) {
          if (!reachableNodes.has(neighbor)) {
            dfs(neighbor, currentDepth + 1);
          }
        }
      };

      for (const startNode of startNodes) {
        dfs(startNode, 0);
      }

      filteredNodes = filteredNodes.filter(node => reachableNodes.has(node.id));
      filteredEdges = filteredEdges.filter(edge => reachableNodes.has(edge.source) && reachableNodes.has(edge.target));
    }

    // Apply limit
    if (query.limit) {
      filteredNodes = filteredNodes.slice(0, query.limit);
    }

    return { nodes: filteredNodes, edges: filteredEdges };
  }

  /**
   * Find shortest path between two nodes
   */
  findShortestPath(sourceId: string, targetId: string): GraphPath | null {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) {
      return null;
    }

    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; path: string[]; weight: number }> = [
      { nodeId: sourceId, path: [sourceId], weight: 0 },
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
          length: path.length - 1,
        };
      }

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const neighbors = this.adjacencyList.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const edge = this.findEdge(nodeId, neighbor);
          const newWeight = weight + (edge ? 1 - edge.weight : 1);
          queue.push({
            nodeId: neighbor,
            path: [...path, neighbor],
            weight: newWeight,
          });
        }
      }
    }

    return null;
  }

  /**
   * Find all paths between two nodes
   */
  findAllPaths(sourceId: string, targetId: string, maxDepth: number = 5): GraphPath[] {
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
            totalWeight += 1 - edge.weight;
          }
        }

        paths.push({
          nodes,
          edges,
          weight: totalWeight,
          length: path.length - 1,
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

  /**
   * Detect communities in the knowledge graph
   */
  detectCommunities(): Map<string, string[]> {
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

  /**
   * Calculate graph metrics
   */
  calculateGraphMetrics(): GraphMetrics {
    const nodeTypes: Record<string, number> = {};
    const edgeTypes: Record<string, number> = {};

    for (const node of this.nodes.values()) {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    }

    for (const edge of this.edges.values()) {
      edgeTypes[edge.type] = (edgeTypes[edge.type] || 0) + 1;
    }

    const totalDegree = Array.from(this.adjacencyList.values()).reduce((sum, neighbors) => sum + neighbors.size, 0);

    const averageDegree = this.nodes.size > 0 ? totalDegree / this.nodes.size : 0;

    const clusteringCoefficient = this.calculateClusteringCoefficient();
    const connectedComponents = this.detectCommunities().size;

    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.size,
      nodeTypes,
      edgeTypes,
      averageDegree,
      clusteringCoefficient,
      connectedComponents,
    };
  }

  /**
   * Export graph to various formats
   */
  exportGraph(format: "json" | "graphml" | "cypher"): string {
    switch (format) {
      case "json":
        return JSON.stringify(
          {
            nodes: Array.from(this.nodes.values()),
            edges: Array.from(this.edges.values()),
            metrics: this.calculateGraphMetrics(),
          },
          null,
          2
        );

      case "graphml":
        return this.exportToGraphML();

      case "cypher":
        return this.exportToCypher();

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Import graph from JSON
   */
  importGraph(json: string): void {
    const data = JSON.parse(json);

    this.nodes.clear();
    this.edges.clear();
    this.adjacencyList.clear();
    this.reverseAdjacencyList.clear();

    for (const node of data.nodes || []) {
      this.addNode(node);
    }

    for (const edge of data.edges || []) {
      this.addEdge(edge);
    }
  }

  // Private helper methods
  private async loadADRNodes(): Promise<void> {
    // Implementation would load ADR nodes from the ADR directory
    // For now, we'll create some sample nodes
    const sampleADRs = [
      {
        id: "adr-001",
        title: "Modularity Standards",
        status: "accepted",
        category: "maintainability",
      },
      {
        id: "adr-002",
        title: "TypeScript Modularity Refactoring",
        status: "accepted",
        category: "maintainability",
      },
    ];

    for (const adr of sampleADRs) {
      this.addNode({
        id: adr.id,
        type: "adr",
        label: adr.title,
        properties: {
          status: adr.status,
          category: adr.category,
          title: adr.title,
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
          confidence: 1.0,
        },
      });
    }
  }

  private async loadPatternNodes(): Promise<void> {
    const patterns = [
      { id: "pattern-microservice", label: "Microservice Architecture" },
      { id: "pattern-modular", label: "Modular Architecture" },
      { id: "pattern-layered", label: "Layered Architecture" },
    ];

    for (const pattern of patterns) {
      this.addNode({
        id: pattern.id,
        type: "pattern",
        label: pattern.label,
        properties: {
          name: pattern.label,
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
          confidence: 0.8,
        },
      });
    }
  }

  private async loadComponentNodes(): Promise<void> {
    // Implementation would analyze the codebase for components
    const components = [
      { id: "comp-adr-system", label: "ADR System" },
      { id: "comp-codebase-analyzer", label: "Codebase Analyzer" },
      { id: "comp-adr-generator", label: "ADR Generator" },
    ];

    for (const component of components) {
      this.addNode({
        id: component.id,
        type: "component",
        label: component.label,
        properties: {
          name: component.label,
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
          confidence: 0.9,
        },
      });
    }
  }

  private async loadDependencyNodes(): Promise<void> {
    // Implementation would analyze dependencies
    const dependencies = [
      { id: "dep-typescript", label: "TypeScript" },
      { id: "dep-node", label: "Node.js" },
      { id: "dep-vitest", label: "Vitest" },
    ];

    for (const dep of dependencies) {
      this.addNode({
        id: dep.id,
        type: "dependency",
        label: dep.label,
        properties: {
          name: dep.label,
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
          confidence: 1.0,
        },
      });
    }
  }

  private async loadStakeholderNodes(): Promise<void> {
    const stakeholders = [
      { id: "stakeholder-dev-team", label: "Development Team" },
      { id: "stakeholder-arch-team", label: "Architecture Team" },
      { id: "stakeholder-qa-team", label: "QA Team" },
    ];

    for (const stakeholder of stakeholders) {
      this.addNode({
        id: stakeholder.id,
        type: "stakeholder",
        label: stakeholder.label,
        properties: {
          name: stakeholder.label,
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
          confidence: 1.0,
        },
      });
    }
  }

  private async loadTechnologyNodes(): Promise<void> {
    const technologies = [
      { id: "tech-react", label: "React" },
      { id: "tech-solidjs", label: "SolidJS" },
      { id: "tech-vite", label: "Vite" },
    ];

    for (const tech of technologies) {
      this.addNode({
        id: tech.id,
        type: "technology",
        label: tech.label,
        properties: {
          name: tech.label,
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
          confidence: 1.0,
        },
      });
    }
  }

  private async buildRelationships(): Promise<void> {
    // Build relationships between ADRs
    this.addEdge({
      id: "edge-001-002",
      source: "adr-002",
      target: "adr-001",
      type: "related",
      weight: 0.8,
      properties: {
        relationship: "builds_on",
      },
      metadata: {
        createdAt: new Date().toISOString(),
        confidence: 0.9,
        evidence: ["Both deal with modularity", "ADR-002 references ADR-001"],
      },
    });

    // Build relationships between ADRs and patterns
    this.addEdge({
      id: "edge-001-pattern-modular",
      source: "adr-001",
      target: "pattern-modular",
      type: "implements",
      weight: 0.9,
      properties: {
        relationship: "implements",
      },
      metadata: {
        createdAt: new Date().toISOString(),
        confidence: 0.95,
        evidence: ["ADR-001 defines modular architecture standards"],
      },
    });

    // Build relationships between components and ADRs
    this.addEdge({
      id: "edge-comp-adr-system-001",
      source: "comp-adr-system",
      target: "adr-001",
      type: "implements",
      weight: 0.7,
      properties: {
        relationship: "implements",
      },
      metadata: {
        createdAt: new Date().toISOString(),
        confidence: 0.8,
        evidence: ["ADR System implements modularity standards"],
      },
    });
  }

  private findEdge(sourceId: string, targetId: string): KnowledgeEdge | undefined {
    for (const edge of this.edges.values()) {
      if (edge.source === sourceId && edge.target === targetId) {
        return edge;
      }
    }
    return undefined;
  }

  private calculateClusteringCoefficient(): number {
    let totalCoefficient = 0;
    let nodeCount = 0;

    for (const [nodeId, neighbors] of this.adjacencyList) {
      if (neighbors.size < 2) continue;

      let triangles = 0;
      const neighborArray = Array.from(neighbors);

      for (let i = 0; i < neighborArray.length; i++) {
        for (let j = i + 1; j < neighborArray.length; j++) {
          const neighbor1 = neighborArray[i];
          const neighbor2 = neighborArray[j];

          if (this.adjacencyList.get(neighbor1)?.has(neighbor2)) {
            triangles++;
          }
        }
      }

      const possibleTriangles = (neighbors.size * (neighbors.size - 1)) / 2;
      const coefficient = possibleTriangles > 0 ? triangles / possibleTriangles : 0;

      totalCoefficient += coefficient;
      nodeCount++;
    }

    return nodeCount > 0 ? totalCoefficient / nodeCount : 0;
  }

  private exportToGraphML(): string {
    // Simplified GraphML export
    let graphml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    graphml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n';
    graphml += '  <graph id="adr-knowledge-graph" edgedefault="directed">\n';

    // Export nodes
    for (const node of this.nodes.values()) {
      graphml += `    <node id="${node.id}">\n`;
      graphml += `      <data key="label">${node.label}</data>\n`;
      graphml += `      <data key="type">${node.type}</data>\n`;
      graphml += `    </node>\n`;
    }

    // Export edges
    for (const edge of this.edges.values()) {
      graphml += `    <edge id="${edge.id}" source="${edge.source}" target="${edge.target}">\n`;
      graphml += `      <data key="type">${edge.type}</data>\n`;
      graphml += `      <data key="weight">${edge.weight}</data>\n`;
      graphml += `    </edge>\n`;
    }

    graphml += "  </graph>\n";
    graphml += "</graphml>";

    return graphml;
  }

  private exportToCypher(): string {
    let cypher = "";

    // Create nodes
    for (const node of this.nodes.values()) {
      cypher += `CREATE (${node.id}:${node.type} {`;
      cypher += `id: '${node.id}', label: '${node.label}', type: '${node.type}'`;
      cypher += `});\n`;
    }

    // Create relationships
    for (const edge of this.edges.values()) {
      cypher += `MATCH (a:${this.nodes.get(edge.source)?.type}), (b:${this.nodes.get(edge.target)?.type}) `;
      cypher += `WHERE a.id = '${edge.source}' AND b.id = '${edge.target}' `;
      cypher += `CREATE (a)-[r:${edge.type.toUpperCase()} {weight: ${edge.weight}}]->(b);\n`;
    }

    return cypher;
  }
}
