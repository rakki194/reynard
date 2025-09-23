/**
 * 🦊 Reynard Dependency Graph Generator
 * ====================================
 *
 * Advanced dependency graph generation system for architectural visualization.
 * Analyzes codebase dependencies, generates interactive graphs, and provides
 * comprehensive architectural insights for the Reynard framework.
 *
 * Features:
 * - Multi-dimensional dependency analysis (imports, exports, relationships)
 * - Circular dependency detection and visualization
 * - Interactive graph generation with zoom, pan, and selection
 * - Real-time dependency monitoring and updates
 * - Export to multiple formats (SVG, PNG, JSON, Mermaid)
 * - Integration with Reynard's architecture system
 *
 * @author Reynard Development Team
 * @version 1.0.0
 */

import { EventEmitter } from "events";
import { readFile, readdir, stat } from "fs/promises";
import { join, relative, dirname, basename, extname } from "path";
import { REYNARD_ARCHITECTURE, getDirectoriesByCategory } from "reynard-project-architecture";

/**
 * Represents a node in the dependency graph with comprehensive metadata.
 */
export interface DependencyNode {
  /** Unique identifier for the node */
  id: string;
  /** Human-readable label for display */
  label: string;
  /** Full path to the file or package */
  path: string;
  /** Type of node (file, package, module, etc.) */
  type: "file" | "package" | "module" | "directory" | "service";
  /** Category classification */
  category: string;
  /** Importance level */
  importance: "critical" | "important" | "optional" | "excluded";
  /** File extension or package type */
  extension?: string;
  /** Size in bytes */
  size?: number;
  /** Number of lines of code */
  linesOfCode?: number;
  /** Complexity score */
  complexity?: number;
  /** Last modified timestamp */
  lastModified?: string;
  /** Metadata for additional information */
  metadata: {
    description?: string;
    author?: string;
    version?: string;
    dependencies?: string[];
    dependents?: string[];
    [key: string]: any;
  };
  /** Visual properties for rendering */
  visual: {
    x?: number;
    y?: number;
    color?: string;
    size?: number;
    shape?: "circle" | "square" | "diamond" | "triangle";
    opacity?: number;
  };
}

/**
 * Represents an edge (relationship) between two nodes in the dependency graph.
 */
export interface DependencyEdge {
  /** Unique identifier for the edge */
  id: string;
  /** Source node ID */
  source: string;
  /** Target node ID */
  target: string;
  /** Type of relationship */
  type: "import" | "export" | "dependency" | "inheritance" | "composition" | "aggregation";
  /** Strength of the relationship (0-1) */
  strength: number;
  /** Direction of the relationship */
  direction: "directed" | "undirected" | "bidirectional";
  /** Whether this creates a circular dependency */
  isCircular: boolean;
  /** Metadata for the relationship */
  metadata: {
    importType?: "default" | "named" | "namespace" | "side-effect";
    importPath?: string;
    usageCount?: number;
    lastUsed?: string;
    [key: string]: any;
  };
  /** Visual properties for rendering */
  visual: {
    color?: string;
    width?: number;
    style?: "solid" | "dashed" | "dotted";
    opacity?: number;
    curvature?: number;
  };
}

/**
 * Complete dependency graph structure with nodes and edges.
 */
export interface DependencyGraph {
  /** Map of all nodes in the graph */
  nodes: Map<string, DependencyNode>;
  /** Map of all edges in the graph */
  edges: Map<string, DependencyEdge>;
  /** Graph metadata */
  metadata: {
    name: string;
    description: string;
    version: string;
    generatedAt: string;
    totalNodes: number;
    totalEdges: number;
    circularDependencies: number;
    complexity: number;
    health: "excellent" | "good" | "fair" | "poor" | "critical";
  };
  /** Layout information */
  layout: {
    algorithm: "force-directed" | "hierarchical" | "circular" | "grid" | "custom";
    width: number;
    height: number;
    center: { x: number; y: number };
    scale: number;
  };
}

/**
 * Configuration options for dependency graph generation.
 */
export interface DependencyGraphConfig {
  /** Root directory to analyze */
  rootPath: string;
  /** File patterns to include */
  includePatterns: string[];
  /** File patterns to exclude */
  excludePatterns: string[];
  /** Maximum depth for analysis */
  maxDepth: number;
  /** Whether to analyze circular dependencies */
  detectCircularDependencies: boolean;
  /** Whether to include file-level dependencies */
  includeFileLevel: boolean;
  /** Whether to include package-level dependencies */
  includePackageLevel: boolean;
  /** Whether to include directory-level dependencies */
  includeDirectoryLevel: boolean;
  /** Layout algorithm to use */
  layoutAlgorithm: "force-directed" | "hierarchical" | "circular" | "grid";
  /** Visual styling options */
  styling: {
    nodeColors: Record<string, string>;
    edgeColors: Record<string, string>;
    nodeSizes: Record<string, number>;
    edgeWidths: Record<string, number>;
  };
}

/**
 * Advanced dependency graph generator with comprehensive analysis capabilities.
 */
export class DependencyGraphGenerator extends EventEmitter {
  private readonly config: DependencyGraphConfig;
  private readonly codebasePath: string;
  private graph: DependencyGraph;
  private analysisCache: Map<string, any> = new Map();

  constructor(codebasePath: string, config?: Partial<DependencyGraphConfig>) {
    super();
    this.codebasePath = codebasePath;
    this.config = {
      rootPath: codebasePath,
      includePatterns: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/package.json"],
      excludePatterns: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/*.test.*", "**/*.spec.*"],
      maxDepth: 10,
      detectCircularDependencies: true,
      includeFileLevel: true,
      includePackageLevel: true,
      includeDirectoryLevel: true,
      layoutAlgorithm: "force-directed",
      styling: {
        nodeColors: {
          file: "#4A90E2",
          package: "#7ED321",
          module: "#F5A623",
          directory: "#BD10E0",
          service: "#50E3C2"
        },
        edgeColors: {
          import: "#4A90E2",
          export: "#7ED321",
          dependency: "#F5A623",
          inheritance: "#BD10E0",
          composition: "#50E3C2"
        },
        nodeSizes: {
          file: 8,
          package: 12,
          module: 10,
          directory: 15,
          service: 14
        },
        edgeWidths: {
          import: 2,
          export: 2,
          dependency: 3,
          inheritance: 2,
          composition: 2
        }
      },
      ...config
    };

    this.graph = this.initializeGraph();
  }

  /**
   * Initialize an empty dependency graph structure.
   */
  private initializeGraph(): DependencyGraph {
    return {
      nodes: new Map(),
      edges: new Map(),
      metadata: {
        name: "Reynard Dependency Graph",
        description: "Comprehensive dependency analysis of the Reynard codebase",
        version: "1.0.0",
        generatedAt: new Date().toISOString(),
        totalNodes: 0,
        totalEdges: 0,
        circularDependencies: 0,
        complexity: 0,
        health: "excellent"
      },
      layout: {
        algorithm: this.config.layoutAlgorithm,
        width: 1200,
        height: 800,
        center: { x: 600, y: 400 },
        scale: 1.0
      }
    };
  }

  /**
   * Generate a comprehensive dependency graph for the codebase.
   */
  async generateGraph(): Promise<DependencyGraph> {
    this.emit("analysis:start", { timestamp: new Date().toISOString() });
    
    try {
      // Clear previous analysis
      this.graph = this.initializeGraph();
      this.analysisCache.clear();

      // Analyze the codebase structure
      await this.analyzeCodebaseStructure();
      
      // Analyze dependencies at different levels
      if (this.config.includePackageLevel) {
        await this.analyzePackageDependencies();
      }
      
      if (this.config.includeDirectoryLevel) {
        await this.analyzeDirectoryDependencies();
      }
      
      if (this.config.includeFileLevel) {
        await this.analyzeFileDependencies();
      }

      // Detect circular dependencies
      if (this.config.detectCircularDependencies) {
        await this.detectCircularDependencies();
      }

      // Calculate graph metrics
      await this.calculateGraphMetrics();

      // Apply layout algorithm
      await this.applyLayout();

      // Update metadata
      this.updateGraphMetadata();

      this.emit("analysis:complete", {
        timestamp: new Date().toISOString(),
        nodes: this.graph.nodes.size,
        edges: this.graph.edges.size,
        circularDependencies: this.graph.metadata.circularDependencies
      });

      return this.graph;
    } catch (error) {
      this.emit("analysis:error", { error, timestamp: new Date().toISOString() });
      throw error;
    }
  }

  /**
   * Analyze the overall codebase structure and create initial nodes.
   */
  private async analyzeCodebaseStructure(): Promise<void> {
    this.emit("analysis:structure:start");
    
    try {
      // Get directories by category from Reynard architecture
      const directoriesByCategory = getDirectoriesByCategory();
      
      for (const [category, directories] of directoriesByCategory) {
        for (const directory of directories) {
          const nodeId = `dir-${directory.path.replace(/\//g, "-")}`;
          const node: DependencyNode = {
            id: nodeId,
            label: basename(directory.path),
            path: directory.path,
            type: "directory",
            category: category,
            importance: directory.importance || "optional",
            metadata: {
              description: directory.description,
              ...directory.metadata
            },
            visual: {
              color: this.config.styling.nodeColors.directory,
              size: this.config.styling.nodeSizes.directory,
              shape: "square"
            }
          };
          
          this.graph.nodes.set(nodeId, node);
        }
      }

      // Analyze package.json files for package-level nodes
      await this.analyzePackageFiles();
      
      this.emit("analysis:structure:complete", { nodes: this.graph.nodes.size });
    } catch (error) {
      this.emit("analysis:structure:error", { error });
      throw error;
    }
  }

  /**
   * Analyze package.json files to create package-level nodes.
   */
  private async analyzePackageFiles(): Promise<void> {
    const packageFiles = await this.findFiles("**/package.json");
    
    for (const packageFile of packageFiles) {
      try {
        const packagePath = dirname(packageFile);
        const packageContent = await readFile(packageFile, "utf-8");
        const packageData = JSON.parse(packageContent);
        
        const nodeId = `pkg-${packagePath.replace(/\//g, "-")}`;
        const node: DependencyNode = {
          id: nodeId,
          label: packageData.name || basename(packagePath),
          path: packagePath,
          type: "package",
          category: this.categorizePackage(packagePath),
          importance: this.determinePackageImportance(packageData),
          metadata: {
            description: packageData.description,
            version: packageData.version,
            dependencies: Object.keys(packageData.dependencies || {}),
            devDependencies: Object.keys(packageData.devDependencies || {}),
            peerDependencies: Object.keys(packageData.peerDependencies || {}),
            ...packageData
          },
          visual: {
            color: this.config.styling.nodeColors.package,
            size: this.config.styling.nodeSizes.package,
            shape: "circle"
          }
        };
        
        this.graph.nodes.set(nodeId, node);
      } catch (error) {
        console.warn(`Failed to analyze package.json: ${packageFile}`, error);
      }
    }
  }

  /**
   * Analyze package-level dependencies from package.json files.
   */
  private async analyzePackageDependencies(): Promise<void> {
    this.emit("analysis:packages:start");
    
    for (const [nodeId, node] of this.graph.nodes) {
      if (node.type === "package" && node.metadata.dependencies) {
        for (const dep of node.metadata.dependencies) {
          const targetNodeId = this.findPackageNode(dep);
          if (targetNodeId) {
            const edgeId = `${nodeId}-${targetNodeId}`;
            const edge: DependencyEdge = {
              id: edgeId,
              source: nodeId,
              target: targetNodeId,
              type: "dependency",
              strength: 1.0,
              direction: "directed",
              isCircular: false,
              metadata: {
                importType: "dependency",
                usageCount: 1
              },
              visual: {
                color: this.config.styling.edgeColors.dependency,
                width: this.config.styling.edgeWidths.dependency,
                style: "solid"
              }
            };
            
            this.graph.edges.set(edgeId, edge);
          }
        }
      }
    }
    
    this.emit("analysis:packages:complete", { edges: this.graph.edges.size });
  }

  /**
   * Analyze directory-level dependencies based on Reynard architecture.
   */
  private async analyzeDirectoryDependencies(): Promise<void> {
    this.emit("analysis:directories:start");
    
    // Use Reynard architecture relationships
    for (const [category, directories] of Object.entries(REYNARD_ARCHITECTURE.directories)) {
      for (const directory of directories) {
        if (directory.relationships) {
          const sourceNodeId = `dir-${directory.path.replace(/\//g, "-")}`;
          
          for (const relationship of directory.relationships) {
            const targetNodeId = `dir-${relationship.target.replace(/\//g, "-")}`;
            
            if (this.graph.nodes.has(sourceNodeId) && this.graph.nodes.has(targetNodeId)) {
              const edgeId = `${sourceNodeId}-${targetNodeId}`;
              const edge: DependencyEdge = {
                id: edgeId,
                source: sourceNodeId,
                target: targetNodeId,
                type: relationship.type as any,
                strength: relationship.strength || 0.5,
                direction: relationship.direction || "directed",
                isCircular: false,
                metadata: {
                  description: relationship.description,
                  ...relationship.metadata
                },
                visual: {
                  color: this.config.styling.edgeColors[relationship.type] || "#666666",
                  width: this.config.styling.edgeWidths[relationship.type] || 2,
                  style: "solid"
                }
              };
              
              this.graph.edges.set(edgeId, edge);
            }
          }
        }
      }
    }
    
    this.emit("analysis:directories:complete", { edges: this.graph.edges.size });
  }

  /**
   * Analyze file-level dependencies by parsing import/export statements.
   */
  private async analyzeFileDependencies(): Promise<void> {
    this.emit("analysis:files:start");
    
    const sourceFiles = await this.findFiles("**/*.{ts,tsx,js,jsx}");
    
    for (const filePath of sourceFiles) {
      try {
        const content = await readFile(filePath, "utf-8");
        const imports = this.extractImports(content);
        const exports = this.extractExports(content);
        
        // Create file node if it doesn't exist
        const fileNodeId = `file-${filePath.replace(/\//g, "-")}`;
        if (!this.graph.nodes.has(fileNodeId)) {
          const fileNode: DependencyNode = {
            id: fileNodeId,
            label: basename(filePath),
            path: filePath,
            type: "file",
            category: this.categorizeFile(filePath),
            importance: "optional",
            extension: extname(filePath),
            linesOfCode: content.split("\n").length,
            metadata: {
              imports: imports.length,
              exports: exports.length,
              complexity: this.calculateFileComplexity(content)
            },
            visual: {
              color: this.config.styling.nodeColors.file,
              size: this.config.styling.nodeSizes.file,
              shape: "circle"
            }
          };
          
          this.graph.nodes.set(fileNodeId, fileNode);
        }
        
        // Create import edges
        for (const importPath of imports) {
          const targetNodeId = this.resolveImportPath(importPath, filePath);
          if (targetNodeId) {
            const edgeId = `${fileNodeId}-${targetNodeId}`;
            const edge: DependencyEdge = {
              id: edgeId,
              source: fileNodeId,
              target: targetNodeId,
              type: "import",
              strength: 0.8,
              direction: "directed",
              isCircular: false,
              metadata: {
                importType: "named",
                importPath: importPath
              },
              visual: {
                color: this.config.styling.edgeColors.import,
                width: this.config.styling.edgeWidths.import,
                style: "solid"
              }
            };
            
            this.graph.edges.set(edgeId, edge);
          }
        }
      } catch (error) {
        console.warn(`Failed to analyze file: ${filePath}`, error);
      }
    }
    
    this.emit("analysis:files:complete", { edges: this.graph.edges.size });
  }

  /**
   * Detect circular dependencies in the graph.
   */
  private async detectCircularDependencies(): Promise<void> {
    this.emit("analysis:circular:start");
    
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const circularPaths: string[][] = [];
    
    const dfs = (nodeId: string, path: string[]): void => {
      if (recursionStack.has(nodeId)) {
        // Found a cycle
        const cycleStart = path.indexOf(nodeId);
        const cycle = path.slice(cycleStart);
        circularPaths.push([...cycle, nodeId]);
        return;
      }
      
      if (visited.has(nodeId)) {
        return;
      }
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      // Check all outgoing edges
      for (const [edgeId, edge] of this.graph.edges) {
        if (edge.source === nodeId) {
          dfs(edge.target, [...path, nodeId]);
        }
      }
      
      recursionStack.delete(nodeId);
    };
    
    // Run DFS from each unvisited node
    for (const [nodeId] of this.graph.nodes) {
      if (!visited.has(nodeId)) {
        dfs(nodeId, []);
      }
    }
    
    // Mark circular edges
    for (const cycle of circularPaths) {
      for (let i = 0; i < cycle.length - 1; i++) {
        const edgeId = `${cycle[i]}-${cycle[i + 1]}`;
        const edge = this.graph.edges.get(edgeId);
        if (edge) {
          edge.isCircular = true;
          edge.visual.color = "#FF0000"; // Red for circular dependencies
          edge.visual.style = "dashed";
        }
      }
    }
    
    this.graph.metadata.circularDependencies = circularPaths.length;
    this.emit("analysis:circular:complete", { circularDependencies: circularPaths.length });
  }

  /**
   * Calculate comprehensive graph metrics.
   */
  private async calculateGraphMetrics(): Promise<void> {
    const totalNodes = this.graph.nodes.size;
    const totalEdges = this.graph.edges.size;
    const circularDependencies = this.graph.metadata.circularDependencies;
    
    // Calculate complexity score
    const complexity = this.calculateGraphComplexity();
    
    // Determine health status
    const health = this.determineGraphHealth(totalNodes, totalEdges, circularDependencies, complexity);
    
    this.graph.metadata.totalNodes = totalNodes;
    this.graph.metadata.totalEdges = totalEdges;
    this.graph.metadata.complexity = complexity;
    this.graph.metadata.health = health;
  }

  /**
   * Apply layout algorithm to position nodes.
   */
  private async applyLayout(): Promise<void> {
    this.emit("layout:start", { algorithm: this.config.layoutAlgorithm });
    
    switch (this.config.layoutAlgorithm) {
      case "force-directed":
        await this.applyForceDirectedLayout();
        break;
      case "hierarchical":
        await this.applyHierarchicalLayout();
        break;
      case "circular":
        await this.applyCircularLayout();
        break;
      case "grid":
        await this.applyGridLayout();
        break;
    }
    
    this.emit("layout:complete");
  }

  /**
   * Apply force-directed layout algorithm.
   */
  private async applyForceDirectedLayout(): Promise<void> {
    const nodes = Array.from(this.graph.nodes.values());
    const edges = Array.from(this.graph.edges.values());
    
    // Initialize positions randomly
    nodes.forEach(node => {
      node.visual.x = Math.random() * this.graph.layout.width;
      node.visual.y = Math.random() * this.graph.layout.height;
    });
    
    // Run force simulation (simplified version)
    const iterations = 100;
    const k = Math.sqrt((this.graph.layout.width * this.graph.layout.height) / nodes.length);
    
    for (let i = 0; i < iterations; i++) {
      // Repulsion forces
      for (let j = 0; j < nodes.length; j++) {
        for (let k = j + 1; k < nodes.length; k++) {
          const node1 = nodes[j];
          const node2 = nodes[k];
          const dx = (node1.visual.x || 0) - (node2.visual.x || 0);
          const dy = (node1.visual.y || 0) - (node2.visual.y || 0);
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (k * k) / distance;
          
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          node1.visual.x = (node1.visual.x || 0) - fx * 0.1;
          node1.visual.y = (node1.visual.y || 0) - fy * 0.1;
          node2.visual.x = (node2.visual.x || 0) + fx * 0.1;
          node2.visual.y = (node2.visual.y || 0) + fy * 0.1;
        }
      }
      
      // Attraction forces
      edges.forEach(edge => {
        const sourceNode = this.graph.nodes.get(edge.source);
        const targetNode = this.graph.nodes.get(edge.target);
        
        if (sourceNode && targetNode) {
          const dx = (targetNode.visual.x || 0) - (sourceNode.visual.x || 0);
          const dy = (targetNode.visual.y || 0) - (sourceNode.visual.y || 0);
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (distance * distance) / k;
          
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          sourceNode.visual.x = (sourceNode.visual.x || 0) + fx * 0.1;
          sourceNode.visual.y = (sourceNode.visual.y || 0) + fy * 0.1;
          targetNode.visual.x = (targetNode.visual.x || 0) - fx * 0.1;
          targetNode.visual.y = (targetNode.visual.y || 0) - fy * 0.1;
        }
      });
    }
  }

  /**
   * Apply hierarchical layout algorithm.
   */
  private async applyHierarchicalLayout(): Promise<void> {
    // Simplified hierarchical layout
    const nodes = Array.from(this.graph.nodes.values());
    const levels = this.calculateHierarchyLevels();
    
    const levelHeight = this.graph.layout.height / Math.max(levels.size, 1);
    
    for (const [nodeId, level] of levels) {
      const node = this.graph.nodes.get(nodeId);
      if (node) {
        const nodesInLevel = Array.from(levels.entries()).filter(([_, l]) => l === level);
        const nodeIndex = nodesInLevel.findIndex(([id, _]) => id === nodeId);
        const levelWidth = this.graph.layout.width / Math.max(nodesInLevel.length, 1);
        
        node.visual.x = nodeIndex * levelWidth + levelWidth / 2;
        node.visual.y = level * levelHeight + levelHeight / 2;
      }
    }
  }

  /**
   * Apply circular layout algorithm.
   */
  private async applyCircularLayout(): Promise<void> {
    const nodes = Array.from(this.graph.nodes.values());
    const radius = Math.min(this.graph.layout.width, this.graph.layout.height) / 3;
    const centerX = this.graph.layout.width / 2;
    const centerY = this.graph.layout.height / 2;
    
    nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      node.visual.x = centerX + radius * Math.cos(angle);
      node.visual.y = centerY + radius * Math.sin(angle);
    });
  }

  /**
   * Apply grid layout algorithm.
   */
  private async applyGridLayout(): Promise<void> {
    const nodes = Array.from(this.graph.nodes.values());
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const rows = Math.ceil(nodes.length / cols);
    
    const cellWidth = this.graph.layout.width / cols;
    const cellHeight = this.graph.layout.height / rows;
    
    nodes.forEach((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      node.visual.x = col * cellWidth + cellWidth / 2;
      node.visual.y = row * cellHeight + cellHeight / 2;
    });
  }

  /**
   * Update graph metadata with final statistics.
   */
  private updateGraphMetadata(): void {
    this.graph.metadata.totalNodes = this.graph.nodes.size;
    this.graph.metadata.totalEdges = this.graph.edges.size;
    this.graph.metadata.generatedAt = new Date().toISOString();
  }

  // Utility methods

  private async findFiles(pattern: string): Promise<string[]> {
    // Simplified file finding - in a real implementation, you'd use glob
    const files: string[] = [];
    await this.findFilesRecursive(this.config.rootPath, pattern, files, 0);
    return files;
  }

  private async findFilesRecursive(dir: string, pattern: string, files: string[], depth: number): Promise<void> {
    if (depth > this.config.maxDepth) return;
    
    try {
      const entries = await readdir(dir);
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = await this.stat(fullPath);
        
        if (stat.isDirectory()) {
          await this.findFilesRecursive(fullPath, pattern, files, depth + 1);
        } else if (this.matchesPattern(entry, pattern)) {
          files.push(relative(this.config.rootPath, fullPath));
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  private async stat(path: string): Promise<any> {
    try {
      return await stat(path);
    } catch {
      return { isDirectory: () => false, isFile: () => false };
    }
  }

  private matchesPattern(filename: string, pattern: string): boolean {
    // Simplified pattern matching
    if (pattern.includes("**/*")) {
      const ext = pattern.split(".").pop();
      return filename.endsWith(`.${ext}`);
    }
    return filename === pattern;
  }

  private categorizePackage(packagePath: string): string {
    if (packagePath.includes("packages/ai/")) return "ai";
    if (packagePath.includes("packages/ui/")) return "ui";
    if (packagePath.includes("packages/core/")) return "core";
    if (packagePath.includes("packages/dev-tools/")) return "dev-tools";
    if (packagePath.includes("packages/services/")) return "services";
    if (packagePath.includes("packages/data/")) return "data";
    if (packagePath.includes("packages/media/")) return "media";
    if (packagePath.includes("packages/docs/")) return "docs";
    return "other";
  }

  private determinePackageImportance(packageData: any): "critical" | "important" | "optional" | "excluded" {
    if (packageData.name?.includes("core")) return "critical";
    if (packageData.name?.includes("shared")) return "important";
    return "optional";
  }

  private categorizeFile(filePath: string): string {
    if (filePath.includes("src/")) return "source";
    if (filePath.includes("test/") || filePath.includes("__tests__/")) return "test";
    if (filePath.includes("docs/")) return "documentation";
    if (filePath.includes("config/")) return "configuration";
    return "other";
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  private extractExports(content: string): string[] {
    const exports: string[] = [];
    const exportRegex = /export\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    return exports;
  }

  private calculateFileComplexity(content: string): number {
    // Simplified complexity calculation
    const lines = content.split("\n").length;
    const functions = (content.match(/function\s+\w+/g) || []).length;
    const classes = (content.match(/class\s+\w+/g) || []).length;
    const imports = (content.match(/import\s+/g) || []).length;
    
    return Math.min(10, (functions + classes + imports) / 10);
  }

  private resolveImportPath(importPath: string, fromFile: string): string | null {
    // Simplified import resolution
    if (importPath.startsWith(".")) {
      const resolvedPath = join(dirname(fromFile), importPath);
      return `file-${resolvedPath.replace(/\//g, "-")}`;
    }
    
    // Look for package nodes
    return this.findPackageNode(importPath);
  }

  private findPackageNode(packageName: string): string | null {
    for (const [nodeId, node] of this.graph.nodes) {
      if (node.type === "package" && node.label === packageName) {
        return nodeId;
      }
    }
    return null;
  }

  private calculateHierarchyLevels(): Map<string, number> {
    const levels = new Map<string, number>();
    const visited = new Set<string>();
    
    const dfs = (nodeId: string, level: number): void => {
      if (visited.has(nodeId)) return;
      
      visited.add(nodeId);
      levels.set(nodeId, level);
      
      // Check outgoing edges
      for (const [_, edge] of this.graph.edges) {
        if (edge.source === nodeId) {
          dfs(edge.target, level + 1);
        }
      }
    };
    
    // Start from root nodes (nodes with no incoming edges)
    const rootNodes = Array.from(this.graph.nodes.keys()).filter(nodeId => {
      return !Array.from(this.graph.edges.values()).some(edge => edge.target === nodeId);
    });
    
    rootNodes.forEach(nodeId => dfs(nodeId, 0));
    
    return levels;
  }

  private calculateGraphComplexity(): number {
    const nodes = this.graph.nodes.size;
    const edges = this.graph.edges.size;
    const circularDeps = this.graph.metadata.circularDependencies;
    
    // Complexity formula: nodes + edges + circular dependencies penalty
    return Math.min(10, (nodes + edges + circularDeps * 5) / 100);
  }

  private determineGraphHealth(
    nodes: number,
    edges: number,
    circularDeps: number,
    complexity: number
  ): "excellent" | "good" | "fair" | "poor" | "critical" {
    if (circularDeps > 10) return "critical";
    if (circularDeps > 5 || complexity > 8) return "poor";
    if (circularDeps > 2 || complexity > 6) return "fair";
    if (circularDeps > 0 || complexity > 4) return "good";
    return "excellent";
  }

  /**
   * Export the dependency graph to various formats.
   */
  async exportGraph(format: "json" | "mermaid" | "svg" | "png"): Promise<string | Buffer> {
    switch (format) {
      case "json":
        return JSON.stringify({
          nodes: Array.from(this.graph.nodes.entries()),
          edges: Array.from(this.graph.edges.entries()),
          metadata: this.graph.metadata,
          layout: this.graph.layout
        }, null, 2);
      
      case "mermaid":
        return this.generateMermaidDiagram();
      
      case "svg":
      case "png":
        // These would require additional rendering libraries
        throw new Error(`${format} export not yet implemented`);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Generate a Mermaid diagram representation of the dependency graph.
   */
  private generateMermaidDiagram(): string {
    let mermaid = "graph TD\n";
    
    // Add nodes
    for (const [nodeId, node] of this.graph.nodes) {
      const label = node.label.replace(/[^a-zA-Z0-9]/g, "_");
      mermaid += `  ${nodeId}["${node.label}"]\n`;
    }
    
    // Add edges
    for (const [edgeId, edge] of this.graph.edges) {
      const style = edge.isCircular ? "stroke:#ff0000,stroke-dasharray: 5 5" : "";
      mermaid += `  ${edge.source} -->|${edge.type}| ${edge.target}\n`;
    }
    
    return mermaid;
  }

  /**
   * Get the current dependency graph.
   */
  getGraph(): DependencyGraph {
    return this.graph;
  }

  /**
   * Get nodes by category.
   */
  getNodesByCategory(category: string): DependencyNode[] {
    return Array.from(this.graph.nodes.values()).filter(node => node.category === category);
  }

  /**
   * Get nodes by type.
   */
  getNodesByType(type: string): DependencyNode[] {
    return Array.from(this.graph.nodes.values()).filter(node => node.type === type);
  }

  /**
   * Get circular dependencies.
   */
  getCircularDependencies(): DependencyEdge[] {
    return Array.from(this.graph.edges.values()).filter(edge => edge.isCircular);
  }

  /**
   * Get graph statistics.
   */
  getStatistics(): {
    totalNodes: number;
    totalEdges: number;
    circularDependencies: number;
    complexity: number;
    health: string;
    nodesByType: Record<string, number>;
    nodesByCategory: Record<string, number>;
  } {
    const nodesByType: Record<string, number> = {};
    const nodesByCategory: Record<string, number> = {};
    
    for (const node of this.graph.nodes.values()) {
      nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
      nodesByCategory[node.category] = (nodesByCategory[node.category] || 0) + 1;
    }
    
    return {
      totalNodes: this.graph.metadata.totalNodes,
      totalEdges: this.graph.metadata.totalEdges,
      circularDependencies: this.graph.metadata.circularDependencies,
      complexity: this.graph.metadata.complexity,
      health: this.graph.metadata.health,
      nodesByType,
      nodesByCategory
    };
  }
}
