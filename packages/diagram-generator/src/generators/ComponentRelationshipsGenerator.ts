/**
 * 🦊 Component Relationships Diagram Generator
 *
 * Generates detailed component relationship diagrams showing
 * how components interact with each other within and across packages.
 */

import type {
  DiagramGenerator,
  DiagramOutput,
  DiagramMetadata,
  CodebaseAnalysis,
  DiagramGenerationConfig,
} from "../types.js";

export class ComponentRelationshipsGenerator implements DiagramGenerator {
  name = "Component Relationships Generator";
  type = "component-relationships" as const;
  description = "Generates component interaction and relationship diagrams";

  async generate(analysis: CodebaseAnalysis, _config: DiagramGenerationConfig): Promise<DiagramOutput> {
    const mermaidContent = this.generateMermaidContent(analysis, _config);

    const metadata: DiagramMetadata = {
      type: this.type,
      title: "Reynard Component Relationships",
      description: "Detailed view of component interactions and relationships",
      nodeCount: analysis.components.length,
      edgeCount: this.countComponentEdges(analysis),
      complexityScore: this.calculateComplexity(analysis),
      generatedAt: new Date().toISOString(),
      sourceFiles: analysis.components.map(comp => comp.filePath),
      dependencies: analysis.components.flatMap(comp => comp.dependencies),
    };

    return {
      mermaidContent,
      metadata,
      outputPaths: {},
    };
  }

  validate(analysis: CodebaseAnalysis): boolean {
    return analysis.components.length > 0;
  }

  private generateMermaidContent(analysis: CodebaseAnalysis, config: DiagramGenerationConfig): string {
    const lines = [
      "%%{init: {'theme': 'neutral'}}%%",
      "graph TB",
      '    subgraph "🦊 Reynard Component Relationships"',
      "        direction TB",
      "",
    ];

    // Group components by package
    const componentsByPackage = this.groupComponentsByPackage(analysis.components, analysis.packages);

    for (const [packageName, components] of Object.entries(componentsByPackage)) {
      if (components.length === 0) continue;

      const packageId = this.sanitizeId(packageName);
      lines.push(`        subgraph ${packageId}["📦 ${packageName}"]`);
      lines.push("            direction TB");

      // Group components by type
      const componentsByType = this.groupComponentsByType(components);

      for (const [type, typeComponents] of Object.entries(componentsByType)) {
        if (typeComponents.length === 0) continue;

        const typeId = this.sanitizeId(`${packageName}_${type}`);
        lines.push(`            subgraph ${typeId}["${this.getTypeIcon(type)} ${type}"]`);
        lines.push("                direction LR");

        for (const component of typeComponents) {
          const compId = this.sanitizeId(`${packageName}_${component.name}`);
          const complexity = this.getComplexityIcon(component.complexity);
          const compLabel = `${complexity} ${component.name}`;

          lines.push(`                ${compId}["${compLabel}"]`);
        }

        lines.push("            end");
      }

      lines.push("        end");
      lines.push("");
    }

    // Add inter-package relationships
    lines.push("        %% Inter-Package Relationships");
    for (const component of analysis.components) {
      const compId = this.sanitizeId(`${this.getPackageName(component.filePath)}_${component.name}`);

      for (const dep of component.dependencies) {
        if (dep.startsWith("reynard-") || dep.startsWith("./") || dep.startsWith("../")) {
          const targetComponent = this.findComponentByDependency(analysis.components, dep);
          if (targetComponent) {
            const targetId = this.sanitizeId(
              `${this.getPackageName(targetComponent.filePath)}_${targetComponent.name}`
            );
            lines.push(`        ${compId} -.-> ${targetId}`);
          }
        }
      }
    }

    // Add intra-package relationships
    lines.push("");
    lines.push("        %% Intra-Package Relationships");
    for (const [packageName, components] of Object.entries(componentsByPackage)) {
      for (const component of components) {
        const compId = this.sanitizeId(`${packageName}_${component.name}`);

        for (const rel of component.relationships) {
          const targetComponent = components.find(
            comp => comp.name === rel.component || comp.dependencies.includes(rel.component)
          );

          if (targetComponent) {
            const targetId = this.sanitizeId(`${packageName}_${targetComponent.name}`);
            const relType = this.getRelationshipIcon(rel.type);
            lines.push(`        ${compId} -->|"${relType}"| ${targetId}`);
          }
        }
      }
    }

    lines.push("    end");

    return lines.join("\n");
  }

  private groupComponentsByPackage(components: any[], packages: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};

    for (const pkg of packages) {
      grouped[pkg.name] = components.filter(
        comp => comp.filePath.startsWith(pkg.path) || comp.filePath.includes(pkg.name)
      );
    }

    return grouped;
  }

  private groupComponentsByType(components: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};

    for (const component of components) {
      if (!grouped[component.type]) {
        grouped[component.type] = [];
      }
      grouped[component.type].push(component);
    }

    return grouped;
  }

  private getTypeIcon(type: string): string {
    switch (type) {
      case "class":
        return "🏗️";
      case "function":
        return "⚙️";
      case "interface":
        return "📋";
      case "type":
        return "🏷️";
      case "enum":
        return "📊";
      case "constant":
        return "🔒";
      case "hook":
        return "🪝";
      case "composable":
        return "🧩";
      case "service":
        return "🔧";
      case "utility":
        return "🛠️";
      default:
        return "📦";
    }
  }

  private getComplexityIcon(complexity: number): string {
    if (complexity <= 5) return "🟢";
    if (complexity <= 15) return "🟡";
    return "🔴";
  }

  private getRelationshipIcon(type: string): string {
    switch (type) {
      case "imports":
        return "📥";
      case "exports":
        return "📤";
      case "extends":
        return "⬆️";
      case "implements":
        return "🔧";
      case "uses":
        return "🔗";
      case "depends":
        return "📦";
      case "configures":
        return "⚙️";
      case "tests":
        return "🧪";
      case "documents":
        return "📚";
      default:
        return "🔗";
    }
  }

  private getPackageName(filePath: string): string {
    const parts = filePath.split("/");
    return parts[0] || "unknown";
  }

  private findComponentByDependency(components: any[], dependency: string): any | null {
    return components.find(
      comp => comp.name === dependency || comp.filePath.includes(dependency) || comp.dependencies.includes(dependency)
    );
  }

  private countComponentEdges(analysis: CodebaseAnalysis): number {
    let count = 0;
    for (const component of analysis.components) {
      count += component.dependencies.length;
      count += component.relationships.length;
    }
    return count;
  }

  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^[0-9]/, "_$&");
  }

  private calculateComplexity(analysis: CodebaseAnalysis): number {
    return analysis.components.length + this.countComponentEdges(analysis);
  }
}
