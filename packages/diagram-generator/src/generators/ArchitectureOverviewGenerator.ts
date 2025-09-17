/**
 * 🦊 Architecture Overview Diagram Generator
 *
 * Generates comprehensive architecture overview diagrams showing
 * the high-level structure of the Reynard project.
 */

import type {
  DiagramGenerator,
  DiagramOutput,
  DiagramMetadata,
  CodebaseAnalysis,
  DiagramGenerationConfig,
} from "../types.js";

export class ArchitectureOverviewGenerator implements DiagramGenerator {
  name = "Architecture Overview Generator";
  type = "architecture-overview" as const;
  description = "Generates high-level architecture overview diagrams";

  async generate(analysis: CodebaseAnalysis, _config: DiagramGenerationConfig): Promise<DiagramOutput> {
    const mermaidContent = this.generateMermaidContent(analysis, _config);

    const metadata: DiagramMetadata = {
      type: this.type,
      title: "Reynard Project Architecture Overview",
      description: "High-level view of the Reynard monorepo architecture",
      nodeCount: analysis.packages.length + analysis.dependencies.length,
      edgeCount: analysis.relationships.length,
      complexityScore: this.calculateComplexity(analysis),
      generatedAt: new Date().toISOString(),
      sourceFiles: analysis.packages.map(pkg => pkg.path),
      dependencies: analysis.dependencies.map(dep => dep.name),
    };

    return {
      mermaidContent,
      metadata,
      outputPaths: {},
    };
  }

  validate(analysis: CodebaseAnalysis): boolean {
    return analysis.packages.length > 0;
  }

  private generateMermaidContent(analysis: CodebaseAnalysis, config: DiagramGenerationConfig): string {
    const lines = [
      "%%{init: {'theme': 'neutral'}}%%",
      "graph TB",
      '    subgraph "🦊 Reynard Monorepo Architecture"',
      "        direction TB",
      "",
    ];

    // Add main categories
    const categories = this.groupPackagesByCategory(analysis.packages);

    for (const [category, packages] of Object.entries(categories)) {
      if (packages.length === 0) continue;

      const categoryId = this.sanitizeId(category);
      lines.push(`        subgraph ${categoryId}["${category}"]`);
      lines.push("            direction TB");

      for (const pkg of packages) {
        const pkgId = this.sanitizeId(pkg.name);
        const importance = this.getImportanceIcon(pkg.importance);
        const pkgLabel = `${importance} ${pkg.name}`;

        lines.push(`            ${pkgId}["${pkgLabel}"]`);

        // Add component count if available
        if (pkg.components.length > 0) {
          lines.push(`            ${pkgId} --> ${pkgId}_components["${pkg.components.length} components"]`);
        }
      }

      lines.push("        end");
      lines.push("");
    }

    // Add relationships between packages
    lines.push("        %% Package Dependencies");
    for (const rel of analysis.relationships) {
      if (rel.type === "depends" && rel.strength > 0.5) {
        const sourceId = this.sanitizeId(rel.source);
        const targetId = this.sanitizeId(rel.target);
        lines.push(`        ${sourceId} -.-> ${targetId}`);
      }
    }

    lines.push("    end");
    lines.push("");

    // Add external dependencies
    if (analysis.dependencies.length > 0) {
      lines.push('    subgraph "External Dependencies"');
      lines.push("        direction LR");

      const topDeps = analysis.dependencies
        .filter(dep => dep.usageCount > 1)
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 10);

      for (const dep of topDeps) {
        const depId = this.sanitizeId(dep.name);
        const depLabel = `${dep.name} (${dep.usageCount})`;
        lines.push(`        ${depId}["${depLabel}"]`);
      }

      lines.push("    end");
    }

    return lines.join("\n");
  }

  private groupPackagesByCategory(packages: any[]): Record<string, any[]> {
    const categories: Record<string, any[]> = {
      "Core Packages": [],
      "UI Components": [],
      Services: [],
      "Tools & Utilities": [],
      Documentation: [],
      "Examples & Templates": [],
      Testing: [],
    };

    for (const pkg of packages) {
      if (pkg.name.includes("core") || pkg.name.includes("base")) {
        categories["Core Packages"].push(pkg);
      } else if (pkg.name.includes("component") || pkg.name.includes("ui") || pkg.name.includes("chart")) {
        categories["UI Components"].push(pkg);
      } else if (pkg.name.includes("service") || pkg.name.includes("api") || pkg.name.includes("backend")) {
        categories["Services"].push(pkg);
      } else if (pkg.name.includes("tool") || pkg.name.includes("util") || pkg.name.includes("helper")) {
        categories["Tools & Utilities"].push(pkg);
      } else if (pkg.name.includes("doc") || pkg.name.includes("guide")) {
        categories["Documentation"].push(pkg);
      } else if (pkg.name.includes("example") || pkg.name.includes("template") || pkg.name.includes("demo")) {
        categories["Examples & Templates"].push(pkg);
      } else if (pkg.name.includes("test") || pkg.name.includes("spec")) {
        categories["Testing"].push(pkg);
      } else {
        categories["Core Packages"].push(pkg);
      }
    }

    return categories;
  }

  private getImportanceIcon(importance: string): string {
    switch (importance) {
      case "critical":
        return "🔴";
      case "important":
        return "🟡";
      case "optional":
        return "🟢";
      default:
        return "⚪";
    }
  }

  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^[0-9]/, "_$&");
  }

  private calculateComplexity(analysis: CodebaseAnalysis): number {
    return analysis.packages.length + analysis.dependencies.length + analysis.relationships.length;
  }
}
