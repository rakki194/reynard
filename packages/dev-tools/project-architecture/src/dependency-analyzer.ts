#!/usr/bin/env node

/**
 * 🦊 Reynard Dependency Analyzer
 * 
 * Comprehensive dependency analysis tool for the Reynard project architecture.
 * Analyzes package relationships, detects circular dependencies, and generates
 * visual diagrams and detailed reports.
 * 
 * Features:
 * - Dependency graph construction and analysis
 * - Circular dependency detection
 * - Mermaid diagram generation
 * - Detailed dependency reports
 * - Validation and health checks
 * - Export to multiple formats
 * 
 * @fileoverview Dependency analysis and visualization for Reynard project
 * @author Reynard Development Team
 * @version 1.0.0
 */

import { REYNARD_ARCHITECTURE } from "./architecture.js";
import { DirectoryDefinition, RelationshipType } from "./types.js";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

/**
 * Represents a node in the dependency graph with metadata and relationships.
 */
interface DependencyNode {
  /** Unique identifier for the node */
  id: string;
  /** Human-readable label for display */
  label: string;
  /** Category classification (source, tools, documentation, etc.) */
  category: string;
  /** Importance level (critical, important, optional, excluded) */
  importance: string;
  /** List of package IDs this node depends on */
  dependencies: string[];
  /** List of package IDs that depend on this node */
  dependents: string[];
  /** Map of relationship types for each dependency */
  relationshipTypes: Map<string, RelationshipType[]>;
}

/**
 * Complete dependency graph structure containing nodes and edges.
 */
interface DependencyGraph {
  /** Map of all nodes in the graph keyed by package ID */
  nodes: Map<string, DependencyNode>;
  /** Array of directed edges representing dependencies */
  edges: Array<{
    /** Source package ID */
    from: string;
    /** Target package ID */
    to: string;
    /** Type of relationship */
    type: RelationshipType;
    /** Human-readable description of the relationship */
    description: string;
  }>;
}

/**
 * Dependency Analyzer for Reynard Project Architecture
 * 
 * Analyzes the Reynard project structure to understand package dependencies,
 * detect potential issues, and generate comprehensive reports and visualizations.
 * 
 * The analyzer processes the project architecture definition to build a complete
 * dependency graph, then provides various analysis capabilities including:
 * - Circular dependency detection
 * - Longest dependency chain identification
 * - Orphaned package detection
 * - Relationship validation
 * - Mermaid diagram generation
 * - Detailed reporting
 * 
 * @example
 * ```typescript
 * const analyzer = new DependencyAnalyzer();
 * const validation = analyzer.validateRelationships();
 * const mermaid = analyzer.generateMermaidDiagram();
 * analyzer.exportToFiles('./analysis-output');
 * ```
 */
class DependencyAnalyzer {
  private graph: DependencyGraph;
  private architecture: DirectoryDefinition[];

  /**
   * Creates a new DependencyAnalyzer instance.
   * 
   * Initializes the analyzer with the Reynard project architecture and builds
   * the complete dependency graph from the architecture definition.
   */
  constructor() {
    this.architecture = REYNARD_ARCHITECTURE.directories;
    this.graph = {
      nodes: new Map(),
      edges: []
    };
    this.buildGraph();
  }

  /**
   * Builds the complete dependency graph from the architecture definition.
   * 
   * This method processes all directories in the architecture to:
   * 1. Create nodes for each directory with metadata
   * 2. Establish dependency relationships between directories
   * 3. Track relationship types and descriptions
   * 4. Build bidirectional dependency tracking (dependencies and dependents)
   * 
   * The graph construction is the foundation for all subsequent analysis operations.
   * 
   * @private
   */
  private buildGraph(): void {
    // Initialize all nodes
    this.architecture.forEach(dir => {
      this.graph.nodes.set(dir.name, {
        id: dir.name,
        label: this.getShortName(dir.name),
        category: dir.category,
        importance: dir.importance,
        dependencies: [],
        dependents: [],
        relationshipTypes: new Map()
      });
    });

    // Build relationships
    this.architecture.forEach(dir => {
      dir.relationships?.forEach(rel => {
        if (this.graph.nodes.has(rel.directory)) {
          const fromNode = this.graph.nodes.get(dir.name)!;
          const toNode = this.graph.nodes.get(rel.directory)!;
          
          // Add dependency
          if (!fromNode.dependencies.includes(rel.directory)) {
            fromNode.dependencies.push(rel.directory);
          }
          
          // Add dependent
          if (!toNode.dependents.includes(dir.name)) {
            toNode.dependents.push(dir.name);
          }

          // Track relationship types
          if (!fromNode.relationshipTypes.has(rel.directory)) {
            fromNode.relationshipTypes.set(rel.directory, []);
          }
          fromNode.relationshipTypes.get(rel.directory)!.push(rel.type);

          // Add edge
          this.graph.edges.push({
            from: dir.name,
            to: rel.directory,
            type: rel.type,
            description: rel.description
          });
        }
      });
    });
  }

  /**
   * Generates a short, human-readable name from a full directory path.
   * 
   * Converts full directory paths like "packages/ai/rag" to shorter display names
   * like "ai/rag" for better readability in diagrams and reports.
   * 
   * @param fullName - The full directory path
   * @returns Shortened name for display purposes
   * @private
   */
  private getShortName(fullName: string): string {
    const parts = fullName.split("/");
    if (parts.length >= 3) {
      return `${parts[1]}/${parts[2]}`;
    }
    return parts[parts.length - 1];
  }

  /**
   * Generates a Mermaid diagram representation of the dependency graph.
   * 
   * Creates a comprehensive Mermaid diagram showing:
   * - All packages as nodes with category emojis
   * - Dependency relationships as directed edges
   * - Visual styling based on importance levels
   * - Relationship type indicators
   * 
   * The diagram can be rendered in any Mermaid-compatible viewer and provides
   * a visual overview of the entire project dependency structure.
   * 
   * @returns Mermaid diagram syntax as a string
   * @example
   * ```typescript
   * const analyzer = new DependencyAnalyzer();
   * const diagram = analyzer.generateMermaidDiagram();
   * console.log(diagram); // Outputs Mermaid syntax
   * ```
   */
  public generateMermaidDiagram(): string {
    let mermaid = "graph TD\n";
    
    // Add nodes with styling
    this.graph.nodes.forEach((node, id) => {
      const category = this.getCategoryEmoji(node.category);
      const importance = this.getImportanceStyle(node.importance);
      mermaid += `    ${this.sanitizeId(id)}["${category} ${node.label}"]:::${importance}\n`;
    });

    mermaid += "\n";

    // Add edges with relationship types
    this.graph.edges.forEach(edge => {
      const fromId = this.sanitizeId(edge.from);
      const toId = this.sanitizeId(edge.to);
      const relType = this.getRelationshipEmoji(edge.type);
      mermaid += `    ${fromId} -->|${relType}| ${toId}\n`;
    });

    // Add styling
    mermaid += "\n";
    mermaid += "    classDef critical fill:#ff6b6b,stroke:#d63031,stroke-width:3px,color:#fff\n";
    mermaid += "    classDef important fill:#74b9ff,stroke:#0984e3,stroke-width:2px,color:#fff\n";
    mermaid += "    classDef optional fill:#a29bfe,stroke:#6c5ce7,stroke-width:1px,color:#fff\n";
    mermaid += "    classDef excluded fill:#ddd,stroke:#999,stroke-width:1px,color:#666\n";

    return mermaid;
  }

  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9]/g, "_");
  }

  private getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      "source": "📦",
      "tools": "🛠️",
      "documentation": "📚",
      "services": "🔧",
      "configuration": "⚙️",
      "testing": "🧪",
      "scripts": "📜",
      "data": "💾",
      "templates": "📋",
      "third-party": "🔗",
      "cache": "💨",
      "excluded": "🚫"
    };
    return emojis[category] || "📁";
  }

  private getImportanceStyle(importance: string): string {
    return importance.toLowerCase();
  }

  private getRelationshipEmoji(type: RelationshipType): string {
    const emojis: Record<RelationshipType, string> = {
      "parent": "👆",
      "child": "👇",
      "sibling": "👈👉",
      "dependency": "🔗",
      "generated": "⚡",
      "configures": "⚙️",
      "tests": "🧪",
      "documents": "📚",
      "builds": "🔨",
      "deploys": "🚀",
      "monitors": "👁️",
      "caches": "💨"
    };
    return emojis[type] || "🔗";
  }

  public generateDetailedReport(): string {
    let report = "# 🦊 Reynard Dependency Analysis Report\n\n";
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Total Packages:** ${this.graph.nodes.size}\n`;
    report += `**Total Dependencies:** ${this.graph.edges.length}\n\n`;

    // Package categories
    const categories = new Map<string, number>();
    this.graph.nodes.forEach(node => {
      categories.set(node.category, (categories.get(node.category) || 0) + 1);
    });

    report += "## 📊 Package Categories\n\n";
    categories.forEach((count, category) => {
      const emoji = this.getCategoryEmoji(category);
      report += `- ${emoji} **${category}**: ${count} packages\n`;
    });

    // Most connected packages
    const mostConnected = Array.from(this.graph.nodes.values())
      .sort((a, b) => (b.dependencies.length + b.dependents.length) - (a.dependencies.length + a.dependents.length))
      .slice(0, 10);

    report += "\n## 🔗 Most Connected Packages\n\n";
    mostConnected.forEach((node, index) => {
      const total = node.dependencies.length + node.dependents.length;
      report += `${index + 1}. **${node.label}** (${total} connections)\n`;
      report += `   - Dependencies: ${node.dependencies.length}\n`;
      report += `   - Dependents: ${node.dependents.length}\n`;
    });

    // Dependency chains
    report += "\n## 🔄 Longest Dependency Chains\n\n";
    const chains = this.findLongestChains();
    chains.slice(0, 5).forEach((chain, index) => {
      report += `${index + 1}. ${chain.map(id => this.getShortName(id)).join(" → ")}\n`;
    });

    // Orphaned packages (no dependencies or dependents)
    const orphaned = Array.from(this.graph.nodes.values())
      .filter(node => node.dependencies.length === 0 && node.dependents.length === 0);

    if (orphaned.length > 0) {
      report += "\n## 🏝️ Orphaned Packages (No Dependencies)\n\n";
      orphaned.forEach(node => {
        report += `- **${node.label}** (${node.category})\n`;
      });
    }

    // Circular dependencies
    const circular = this.findCircularDependencies();
    if (circular.length > 0) {
      report += "\n## 🔄 Circular Dependencies\n\n";
      circular.forEach((cycle, index) => {
        report += `${index + 1}. ${cycle.map(id => this.getShortName(id)).join(" → ")} → ${this.getShortName(cycle[0])}\n`;
      });
    }

    return report;
  }

  private findLongestChains(): string[][] {
    const chains: string[][] = [];
    const visited = new Set<string>();

    const dfs = (nodeId: string, currentChain: string[]): void => {
      if (currentChain.includes(nodeId)) {
        return; // Avoid cycles
      }

      const newChain = [...currentChain, nodeId];
      const node = this.graph.nodes.get(nodeId);
      
      if (!node || node.dependencies.length === 0) {
        if (newChain.length > 1) {
          chains.push(newChain);
        }
        return;
      }

      node.dependencies.forEach(depId => {
        if (!visited.has(depId)) {
          visited.add(depId);
          dfs(depId, newChain);
          visited.delete(depId);
        }
      });
    };

    this.graph.nodes.forEach((_, nodeId) => {
      if (!visited.has(nodeId)) {
        visited.add(nodeId);
        dfs(nodeId, []);
        visited.delete(nodeId);
      }
    });

    return chains.sort((a, b) => b.length - a.length);
  }

  private findCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string, path: string[]): void => {
      if (recursionStack.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart));
        }
        return;
      }

      if (visited.has(nodeId)) {
        return;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const node = this.graph.nodes.get(nodeId);
      node?.dependencies.forEach(depId => {
        dfs(depId, [...path, nodeId]);
      });

      recursionStack.delete(nodeId);
    };

    this.graph.nodes.forEach((_, nodeId) => {
      if (!visited.has(nodeId)) {
        dfs(nodeId, []);
      }
    });

    return cycles;
  }

  public validateRelationships(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for missing packages in relationships
    this.architecture.forEach(dir => {
      dir.relationships?.forEach(rel => {
        if (!this.graph.nodes.has(rel.directory)) {
          errors.push(`Directory "${dir.name}" references non-existent directory "${rel.directory}"`);
        }
      });
    });

    // Check for packages with no relationships
    const isolatedPackages = Array.from(this.graph.nodes.values())
      .filter(node => node.dependencies.length === 0 && node.dependents.length === 0);

    if (isolatedPackages.length > 0) {
      warnings.push(`Found ${isolatedPackages.length} isolated packages with no dependencies: ${isolatedPackages.map(n => n.label).join(", ")}`);
    }

    // Check for potential circular dependencies
    const circular = this.findCircularDependencies();
    if (circular.length > 0) {
      warnings.push(`Found ${circular.length} potential circular dependencies`);
    }

    // Check for packages with too many dependencies
    const highDependencyPackages = Array.from(this.graph.nodes.values())
      .filter(node => node.dependencies.length > 10);

    if (highDependencyPackages.length > 0) {
      warnings.push(`Found ${highDependencyPackages.length} packages with >10 dependencies: ${highDependencyPackages.map(n => n.label).join(", ")}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  public exportToFiles(outputDir: string = "dependency-analysis"): void {
    mkdirSync(outputDir, { recursive: true });

    // Generate Mermaid diagram
    const mermaid = this.generateMermaidDiagram();
    writeFileSync(join(outputDir, "dependency-diagram.mmd"), mermaid);

    // Generate detailed report
    const report = this.generateDetailedReport();
    writeFileSync(join(outputDir, "dependency-report.md"), report);

    // Generate validation results
    const validation = this.validateRelationships();
    const validationReport = `# 🔍 Dependency Validation Report

**Generated:** ${new Date().toISOString()}
**Status:** ${validation.valid ? "✅ Valid" : "❌ Invalid"}

## Errors (${validation.errors.length})
${validation.errors.length === 0 ? "None" : validation.errors.map(e => `- ${e}`).join("\n")}

## Warnings (${validation.warnings.length})
${validation.warnings.length === 0 ? "None" : validation.warnings.map(w => `- ${w}`).join("\n")}

## Summary
- **Total Packages:** ${this.graph.nodes.size}
- **Total Dependencies:** ${this.graph.edges.length}
- **Validation Status:** ${validation.valid ? "PASS" : "FAIL"}
`;
    writeFileSync(join(outputDir, "validation-report.md"), validationReport);

    console.log(`📊 Dependency analysis complete!`);
    console.log(`📁 Files generated in: ${outputDir}/`);
    console.log(`   - dependency-diagram.mmd (Mermaid diagram)`);
    console.log(`   - dependency-report.md (Detailed analysis)`);
    console.log(`   - validation-report.md (Validation results)`);
  }
}

// CLI interface - only run when called directly, not during tests
if (import.meta.url === `file://${process.argv[1]}` && !process.env.VITEST) {
  const analyzer = new DependencyAnalyzer();
  
  console.log("🦊 Reynard Dependency Analyzer");
  console.log("==============================");
  
  // Generate validation
  const validation = analyzer.validateRelationships();
  console.log(`\n🔍 Validation Status: ${validation.valid ? "✅ Valid" : "❌ Invalid"}`);
  
  if (validation.errors.length > 0) {
    console.log("\n❌ Errors:");
    validation.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    validation.warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  // Export files
  analyzer.exportToFiles();
  
  // Show summary
  console.log(`\n📊 Summary:`);
  console.log(`   - Total Packages: ${analyzer['graph'].nodes.size}`);
  console.log(`   - Total Dependencies: ${analyzer['graph'].edges.length}`);
  console.log(`   - Validation: ${validation.valid ? "PASS" : "FAIL"}`);
}

export { DependencyAnalyzer };
