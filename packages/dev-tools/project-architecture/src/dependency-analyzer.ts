#!/usr/bin/env node

import { REYNARD_ARCHITECTURE } from "./architecture.js";
import { DirectoryDefinition, RelationshipType } from "./types.js";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

interface DependencyNode {
  id: string;
  label: string;
  category: string;
  importance: string;
  dependencies: string[];
  dependents: string[];
  relationshipTypes: Map<string, RelationshipType[]>;
}

interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
  edges: Array<{
    from: string;
    to: string;
    type: RelationshipType;
    description: string;
  }>;
}

class DependencyAnalyzer {
  private graph: DependencyGraph;
  private architecture: DirectoryDefinition[];

  constructor() {
    this.architecture = REYNARD_ARCHITECTURE.directories;
    this.graph = {
      nodes: new Map(),
      edges: []
    };
    this.buildGraph();
  }

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

  private getShortName(fullName: string): string {
    const parts = fullName.split("/");
    if (parts.length >= 3) {
      return `${parts[1]}/${parts[2]}`;
    }
    return parts[parts.length - 1];
  }

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
