/**
 * Dependency Impact Mapping - Advanced Dependency Analysis and Impact Propagation
 * 
 * This module provides comprehensive analysis of how changes propagate through
 * the dependency graph and their impact on the system architecture.
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join, relative, dirname } from 'path';
import { CodeChange, DependencyImpact } from './ImpactAnalyzer';

export interface DependencyNode {
  id: string;
  path: string;
  type: 'file' | 'module' | 'package' | 'service';
  dependencies: string[];
  dependents: string[];
  metadata: {
    size: number;
    complexity: number;
    lastModified: string;
    importance: number; // 0-1
    stability: number; // 0-1
  };
}

export interface DependencyEdge {
  id: string;
  source: string;
  target: string;
  type: 'import' | 'export' | 'inheritance' | 'composition' | 'service-call';
  strength: number; // 0-1
  metadata: {
    lineNumber?: number;
    isOptional: boolean;
    isDynamic: boolean;
    version?: string;
  };
}

export interface ImpactPropagation {
  sourceChange: CodeChange;
  propagationPath: string[][];
  affectedNodes: string[];
  impactLevels: Map<string, 'low' | 'medium' | 'high' | 'critical'>;
  breakingChanges: string[];
  migrationPaths: string[][];
  estimatedEffort: Map<string, number>;
}

export interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
  edges: Map<string, DependencyEdge>;
  metrics: {
    totalNodes: number;
    totalEdges: number;
    averageDegree: number;
    maxDepth: number;
    circularDependencies: string[][];
    criticalPaths: string[][];
  };
}

export class DependencyMapper {
  private readonly codebasePath: string;
  private readonly dependencyGraph: DependencyGraph;
  private readonly changeHistory: Map<string, CodeChange> = new Map();

  constructor(codebasePath: string) {
    this.codebasePath = codebasePath;
    this.dependencyGraph = {
      nodes: new Map(),
      edges: new Map(),
      metrics: {
        totalNodes: 0,
        totalEdges: 0,
        averageDegree: 0,
        maxDepth: 0,
        circularDependencies: [],
        criticalPaths: []
      }
    };
  }

  /**
   * Build the complete dependency graph
   */
  async buildDependencyGraph(): Promise<DependencyGraph> {
    console.log('🦦 Building dependency graph...');
    
    // Clear existing graph
    this.dependencyGraph.nodes.clear();
    this.dependencyGraph.edges.clear();
    
    // Discover all files
    const files = await this.discoverFiles();
    
    // Build nodes
    for (const file of files) {
      await this.buildNode(file);
    }
    
    // Build edges
    for (const file of files) {
      await this.buildEdges(file);
    }
    
    // Calculate metrics
    this.calculateGraphMetrics();
    
    console.log(`✅ Dependency graph built: ${this.dependencyGraph.nodes.size} nodes, ${this.dependencyGraph.edges.size} edges`);
    return this.dependencyGraph;
  }

  /**
   * Analyze impact propagation for a change
   */
  async analyzeImpactPropagation(change: CodeChange): Promise<ImpactPropagation> {
    console.log(`🦦 Analyzing impact propagation for: ${change.filePath}`);
    
    const sourceNode = this.dependencyGraph.nodes.get(change.filePath);
    if (!sourceNode) {
      throw new Error(`Node not found for file: ${change.filePath}`);
    }
    
    const propagationPath = await this.calculatePropagationPath(sourceNode);
    const affectedNodes = this.getAffectedNodes(propagationPath);
    const impactLevels = this.calculateImpactLevels(change, affectedNodes);
    const breakingChanges = this.identifyBreakingChanges(change, affectedNodes);
    const migrationPaths = this.calculateMigrationPaths(breakingChanges);
    const estimatedEffort = this.estimateEffort(affectedNodes, impactLevels);
    
    return {
      sourceChange: change,
      propagationPath,
      affectedNodes,
      impactLevels,
      breakingChanges,
      migrationPaths,
      estimatedEffort
    };
  }

  /**
   * Get dependency impact for multiple changes
   */
  async getDependencyImpact(changes: CodeChange[]): Promise<DependencyImpact[]> {
    console.log(`🦦 Analyzing dependency impact for ${changes.length} changes`);
    
    const impacts: DependencyImpact[] = [];
    
    for (const change of changes) {
      const propagation = await this.analyzeImpactPropagation(change);
      
      const impact: DependencyImpact = {
        sourceFile: change.filePath,
        affectedFiles: propagation.affectedNodes,
        impactChain: propagation.propagationPath,
        breakingChanges: propagation.breakingChanges,
        migrationRequired: propagation.breakingChanges.length > 0,
        estimatedMigrationEffort: Array.from(propagation.estimatedEffort.values()).reduce((sum, effort) => sum + effort, 0)
      };
      
      impacts.push(impact);
    }
    
    return impacts;
  }

  /**
   * Find critical dependencies
   */
  findCriticalDependencies(): DependencyNode[] {
    const criticalNodes: DependencyNode[] = [];
    
    for (const node of this.dependencyGraph.nodes.values()) {
      const dependents = this.getDependents(node.id);
      const importance = this.calculateNodeImportance(node);
      
      if (dependents.length > 5 || importance > 0.8) {
        criticalNodes.push(node);
      }
    }
    
    return criticalNodes.sort((a, b) => this.calculateNodeImportance(b) - this.calculateNodeImportance(a));
  }

  /**
   * Detect circular dependencies
   */
  detectCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const dfs = (nodeId: string, path: string[]): void => {
      if (recursionStack.has(nodeId)) {
        // Found a cycle
        const cycleStart = path.indexOf(nodeId);
        cycles.push(path.slice(cycleStart));
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
    
    for (const nodeId of this.dependencyGraph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId, []);
      }
    }
    
    return cycles;
  }

  /**
   * Find critical paths in the dependency graph
   */
  findCriticalPaths(): string[][] {
    const criticalPaths: string[][] = [];
    
    // Find nodes with high importance and many dependents
    const criticalNodes = this.findCriticalDependencies();
    
    for (const node of criticalNodes) {
      const paths = this.findAllPathsFromNode(node.id);
      criticalPaths.push(...paths);
    }
    
    // Sort by path length and importance
    return criticalPaths.sort((a, b) => {
      const aImportance = a.reduce((sum, nodeId) => {
        const node = this.dependencyGraph.nodes.get(nodeId);
        return sum + (node ? this.calculateNodeImportance(node) : 0);
      }, 0);
      
      const bImportance = b.reduce((sum, nodeId) => {
        const node = this.dependencyGraph.nodes.get(nodeId);
        return sum + (node ? this.calculateNodeImportance(node) : 0);
      }, 0);
      
      return bImportance - aImportance;
    });
  }

  /**
   * Generate dependency report
   */
  generateDependencyReport(): string {
    let report = '# Dependency Analysis Report\n\n';
    report += `**Generated**: ${new Date().toISOString()}\n`;
    report += `**Total Nodes**: ${this.dependencyGraph.metrics.totalNodes}\n`;
    report += `**Total Edges**: ${this.dependencyGraph.metrics.totalEdges}\n`;
    report += `**Average Degree**: ${this.dependencyGraph.metrics.averageDegree.toFixed(2)}\n`;
    report += `**Max Depth**: ${this.dependencyGraph.metrics.maxDepth}\n\n`;
    
    // Critical dependencies
    const criticalDeps = this.findCriticalDependencies();
    if (criticalDeps.length > 0) {
      report += '## Critical Dependencies\n\n';
      for (const dep of criticalDeps.slice(0, 10)) {
        const importance = this.calculateNodeImportance(dep);
        const dependents = this.getDependents(dep.id);
        report += `- **${dep.path}** (Importance: ${(importance * 100).toFixed(1)}%, Dependents: ${dependents.length})\n`;
      }
      report += '\n';
    }
    
    // Circular dependencies
    const cycles = this.detectCircularDependencies();
    if (cycles.length > 0) {
      report += '## Circular Dependencies\n\n';
      for (const cycle of cycles) {
        report += `- ${cycle.join(' → ')} → ${cycle[0]}\n`;
      }
      report += '\n';
    }
    
    // Critical paths
    const criticalPaths = this.findCriticalPaths();
    if (criticalPaths.length > 0) {
      report += '## Critical Paths\n\n';
      for (const path of criticalPaths.slice(0, 5)) {
        report += `- ${path.join(' → ')}\n`;
      }
      report += '\n';
    }
    
    return report;
  }

  // Private methods
  private async discoverFiles(): Promise<string[]> {
    const files: string[] = [];
    
    const scanDirectory = async (dir: string): Promise<void> => {
      try {
        const entries = await readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          
          if (entry.isDirectory()) {
            if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(entry.name)) {
              await scanDirectory(fullPath);
            }
          } else if (entry.isFile()) {
            const ext = fullPath.split('.').pop();
            if (['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java'].includes(ext || '')) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`Could not scan directory ${dir}:`, error);
      }
    };
    
    await scanDirectory(this.codebasePath);
    return files;
  }

  private async buildNode(filePath: string): Promise<void> {
    try {
      const stats = await stat(filePath);
      const content = await readFile(filePath, 'utf-8');
      
      const node: DependencyNode = {
        id: filePath,
        path: filePath,
        type: 'file',
        dependencies: [],
        dependents: [],
        metadata: {
          size: stats.size,
          complexity: this.calculateComplexity(content),
          lastModified: stats.mtime.toISOString(),
          importance: this.calculateInitialImportance(filePath, content),
          stability: this.calculateStability(filePath, stats.mtime)
        }
      };
      
      this.dependencyGraph.nodes.set(filePath, node);
    } catch (error) {
      console.warn(`Could not build node for ${filePath}:`, error);
    }
  }

  private async buildEdges(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const dependencies = this.extractDependencies(content, filePath);
      
      const node = this.dependencyGraph.nodes.get(filePath);
      if (!node) return;
      
      for (const dep of dependencies) {
        const edgeId = `${filePath}->${dep.path}`;
        
        const edge: DependencyEdge = {
          id: edgeId,
          source: filePath,
          target: dep.path,
          type: dep.type,
          strength: dep.strength,
          metadata: {
            lineNumber: dep.lineNumber,
            isOptional: dep.isOptional,
            isDynamic: dep.isDynamic
          }
        };
        
        this.dependencyGraph.edges.set(edgeId, edge);
        node.dependencies.push(dep.path);
        
        // Update target node's dependents
        const targetNode = this.dependencyGraph.nodes.get(dep.path);
        if (targetNode) {
          targetNode.dependents.push(filePath);
        }
      }
    } catch (error) {
      console.warn(`Could not build edges for ${filePath}:`, error);
    }
  }

  private extractDependencies(content: string, filePath: string): Array<{
    path: string;
    type: 'import' | 'export' | 'inheritance' | 'composition' | 'service-call';
    strength: number;
    lineNumber?: number;
    isOptional: boolean;
    isDynamic: boolean;
  }> {
    const dependencies: Array<{
      path: string;
      type: 'import' | 'export' | 'inheritance' | 'composition' | 'service-call';
      strength: number;
      lineNumber?: number;
      isOptional: boolean;
      isDynamic: boolean;
    }> = [];
    
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Import statements
      const importMatch = line.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        const importPath = this.resolveImportPath(importMatch[1], filePath);
        if (importPath) {
          dependencies.push({
            path: importPath,
            type: 'import',
            strength: 0.8,
            lineNumber: i + 1,
            isOptional: false,
            isDynamic: false
          });
        }
      }
      
      // Dynamic imports
      const dynamicImportMatch = line.match(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/);
      if (dynamicImportMatch) {
        const importPath = this.resolveImportPath(dynamicImportMatch[1], filePath);
        if (importPath) {
          dependencies.push({
            path: importPath,
            type: 'import',
            strength: 0.6,
            lineNumber: i + 1,
            isOptional: true,
            isDynamic: true
          });
        }
      }
      
      // Class inheritance
      const extendsMatch = line.match(/class\s+\w+\s+extends\s+(\w+)/);
      if (extendsMatch) {
        dependencies.push({
          path: extendsMatch[1],
          type: 'inheritance',
          strength: 0.9,
          lineNumber: i + 1,
          isOptional: false,
          isDynamic: false
        });
      }
      
      // Service calls (simplified detection)
      const serviceMatch = line.match(/(\w+Service)\./);
      if (serviceMatch) {
        dependencies.push({
          path: serviceMatch[1],
          type: 'service-call',
          strength: 0.7,
          lineNumber: i + 1,
          isOptional: false,
          isDynamic: false
        });
      }
    }
    
    return dependencies;
  }

  private resolveImportPath(importPath: string, fromFile: string): string | null {
    if (importPath.startsWith('.')) {
      // Relative import
      const fromDir = dirname(fromFile);
      const resolvedPath = join(fromDir, importPath);
      
      // Try different extensions
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js'];
      for (const ext of extensions) {
        const fullPath = resolvedPath + ext;
        if (this.dependencyGraph.nodes.has(fullPath)) {
          return fullPath;
        }
      }
      
      return resolvedPath;
    } else {
      // Absolute import (external package)
      return importPath;
    }
  }

  private async calculatePropagationPath(sourceNode: DependencyNode): Promise<string[][]> {
    const paths: string[][] = [];
    const visited = new Set<string>();
    
    const dfs = (currentNodeId: string, path: string[], depth: number): void => {
      if (depth > 10) return; // Prevent infinite recursion
      
      const node = this.dependencyGraph.nodes.get(currentNodeId);
      if (!node) return;
      
      path.push(currentNodeId);
      
      if (node.dependents.length === 0) {
        // Leaf node
        paths.push([...path]);
      } else {
        for (const dependent of node.dependents) {
          if (!visited.has(dependent)) {
            visited.add(dependent);
            dfs(dependent, [...path], depth + 1);
            visited.delete(dependent);
          }
        }
      }
    };
    
    dfs(sourceNode.id, [], 0);
    return paths;
  }

  private getAffectedNodes(propagationPaths: string[][]): string[] {
    const affectedNodes = new Set<string>();
    
    for (const path of propagationPaths) {
      for (const nodeId of path) {
        affectedNodes.add(nodeId);
      }
    }
    
    return Array.from(affectedNodes);
  }

  private calculateImpactLevels(change: CodeChange, affectedNodes: string[]): Map<string, 'low' | 'medium' | 'high' | 'critical'> {
    const impactLevels = new Map<string, 'low' | 'medium' | 'high' | 'critical'>();
    
    for (const nodeId of affectedNodes) {
      const node = this.dependencyGraph.nodes.get(nodeId);
      if (!node) continue;
      
      const importance = this.calculateNodeImportance(node);
      const distance = this.calculateDistance(change.filePath, nodeId);
      
      let impactLevel: 'low' | 'medium' | 'high' | 'critical';
      
      if (importance > 0.8 && distance <= 2) {
        impactLevel = 'critical';
      } else if (importance > 0.6 && distance <= 3) {
        impactLevel = 'high';
      } else if (importance > 0.4 && distance <= 4) {
        impactLevel = 'medium';
      } else {
        impactLevel = 'low';
      }
      
      impactLevels.set(nodeId, impactLevel);
    }
    
    return impactLevels;
  }

  private identifyBreakingChanges(change: CodeChange, affectedNodes: string[]): string[] {
    const breakingChanges: string[] = [];
    
    // Analyze change type and content
    if (change.changeType === 'deleted') {
      breakingChanges.push(`File deletion may break dependents: ${change.filePath}`);
    }
    
    if (change.changeType === 'modified') {
      const content = change.content || '';
      
      // Check for interface changes
      if (content.includes('interface') || content.includes('export')) {
        breakingChanges.push(`Interface changes may break consumers: ${change.filePath}`);
      }
      
      // Check for function signature changes
      if (content.includes('function') || content.includes('=>')) {
        breakingChanges.push(`Function signature changes may break callers: ${change.filePath}`);
      }
    }
    
    return breakingChanges;
  }

  private calculateMigrationPaths(breakingChanges: string[]): string[][] {
    // Simplified implementation - would calculate actual migration paths
    return breakingChanges.map(change => [change]);
  }

  private estimateEffort(affectedNodes: string[], impactLevels: Map<string, 'low' | 'medium' | 'high' | 'critical'>): Map<string, number> {
    const effortMap = new Map<string, number>();
    
    for (const nodeId of affectedNodes) {
      const impactLevel = impactLevels.get(nodeId) || 'low';
      let effort = 0;
      
      switch (impactLevel) {
        case 'critical':
          effort = 8; // 8 hours
          break;
        case 'high':
          effort = 4; // 4 hours
          break;
        case 'medium':
          effort = 2; // 2 hours
          break;
        case 'low':
          effort = 0.5; // 30 minutes
          break;
      }
      
      effortMap.set(nodeId, effort);
    }
    
    return effortMap;
  }

  private getDependents(nodeId: string): string[] {
    const node = this.dependencyGraph.nodes.get(nodeId);
    return node ? node.dependents : [];
  }

  private calculateNodeImportance(node: DependencyNode): number {
    const dependentsCount = node.dependents.length;
    const dependenciesCount = node.dependencies.length;
    const complexity = node.metadata.complexity;
    const stability = node.metadata.stability;
    
    // Calculate importance based on multiple factors
    const importance = (
      (dependentsCount * 0.4) +
      (complexity * 0.3) +
      ((1 - stability) * 0.2) +
      (dependenciesCount * 0.1)
    ) / 10; // Normalize to 0-1
    
    return Math.min(1, Math.max(0, importance));
  }

  private findAllPathsFromNode(nodeId: string): string[][] {
    const paths: string[][] = [];
    const visited = new Set<string>();
    
    const dfs = (currentNodeId: string, path: string[], depth: number): void => {
      if (depth > 5) return; // Limit depth
      
      const node = this.dependencyGraph.nodes.get(currentNodeId);
      if (!node) return;
      
      path.push(currentNodeId);
      
      if (node.dependents.length === 0 || depth === 5) {
        paths.push([...path]);
      } else {
        for (const dependent of node.dependents) {
          if (!visited.has(dependent)) {
            visited.add(dependent);
            dfs(dependent, [...path], depth + 1);
            visited.delete(dependent);
          }
        }
      }
    };
    
    dfs(nodeId, [], 0);
    return paths;
  }

  private calculateDistance(sourceId: string, targetId: string): number {
    // Simplified BFS to calculate shortest path
    const queue: Array<{ nodeId: string; distance: number }> = [{ nodeId: sourceId, distance: 0 }];
    const visited = new Set<string>();
    
    while (queue.length > 0) {
      const { nodeId, distance } = queue.shift()!;
      
      if (nodeId === targetId) {
        return distance;
      }
      
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      
      const node = this.dependencyGraph.nodes.get(nodeId);
      if (node) {
        for (const dependent of node.dependents) {
          queue.push({ nodeId: dependent, distance: distance + 1 });
        }
      }
    }
    
    return Infinity;
  }

  private calculateComplexity(content: string): number {
    const lines = content.split('\n');
    let complexity = 0;
    
    // Count control structures
    complexity += (content.match(/\bif\b/g) || []).length;
    complexity += (content.match(/\bfor\b/g) || []).length;
    complexity += (content.match(/\bwhile\b/g) || []).length;
    complexity += (content.match(/\bswitch\b/g) || []).length;
    complexity += (content.match(/\btry\b/g) || []).length;
    complexity += (content.match(/\bcatch\b/g) || []).length;
    
    // Count functions and classes
    complexity += (content.match(/\bfunction\b/g) || []).length;
    complexity += (content.match(/\bclass\b/g) || []).length;
    complexity += (content.match(/=>/g) || []).length;
    
    // Normalize by file size
    return complexity / Math.max(1, lines.length / 10);
  }

  private calculateInitialImportance(filePath: string, content: string): number {
    let importance = 0.1; // Base importance
    
    // Increase importance for certain file types
    if (filePath.includes('index') || filePath.includes('main')) {
      importance += 0.3;
    }
    
    if (filePath.includes('service') || filePath.includes('api')) {
      importance += 0.2;
    }
    
    if (filePath.includes('component') || filePath.includes('ui')) {
      importance += 0.1;
    }
    
    // Increase importance for files with exports
    const exportCount = (content.match(/\bexport\b/g) || []).length;
    importance += Math.min(0.3, exportCount * 0.05);
    
    return Math.min(1, importance);
  }

  private calculateStability(filePath: string, lastModified: Date): number {
    const daysSinceModified = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24);
    
    // Files modified recently are less stable
    if (daysSinceModified < 7) {
      return 0.2;
    } else if (daysSinceModified < 30) {
      return 0.5;
    } else if (daysSinceModified < 90) {
      return 0.8;
    } else {
      return 1.0;
    }
  }

  private calculateGraphMetrics(): void {
    const nodes = this.dependencyGraph.nodes;
    const edges = this.dependencyGraph.edges;
    
    this.dependencyGraph.metrics.totalNodes = nodes.size;
    this.dependencyGraph.metrics.totalEdges = edges.size;
    
    // Calculate average degree
    let totalDegree = 0;
    for (const node of nodes.values()) {
      totalDegree += node.dependencies.length + node.dependents.length;
    }
    this.dependencyGraph.metrics.averageDegree = nodes.size > 0 ? totalDegree / nodes.size : 0;
    
    // Calculate max depth
    this.dependencyGraph.metrics.maxDepth = this.calculateMaxDepth();
    
    // Detect circular dependencies
    this.dependencyGraph.metrics.circularDependencies = this.detectCircularDependencies();
    
    // Find critical paths
    this.dependencyGraph.metrics.criticalPaths = this.findCriticalPaths();
  }

  private calculateMaxDepth(): number {
    let maxDepth = 0;
    
    for (const node of this.dependencyGraph.nodes.values()) {
      const depth = this.calculateNodeDepth(node.id, new Set());
      maxDepth = Math.max(maxDepth, depth);
    }
    
    return maxDepth;
  }

  private calculateNodeDepth(nodeId: string, visited: Set<string>): number {
    if (visited.has(nodeId)) return 0;
    
    visited.add(nodeId);
    const node = this.dependencyGraph.nodes.get(nodeId);
    if (!node) return 0;
    
    let maxDepth = 0;
    for (const dependent of node.dependents) {
      const depth = this.calculateNodeDepth(dependent, visited);
      maxDepth = Math.max(maxDepth, depth);
    }
    
    visited.delete(nodeId);
    return maxDepth + 1;
  }
}
