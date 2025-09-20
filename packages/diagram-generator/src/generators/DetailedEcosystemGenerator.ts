/**
 * 🦊 Detailed Ecosystem Generator
 *
 * Generates comprehensive diagrams showing detailed relationships
 * between all packages, components, and their actual imports/exports
 */

import { DiagramGenerator, DiagramOutput, DiagramMetadata, DiagramGenerationConfig } from "../types.js";
import { CodebaseAnalysis } from "../types.js";

export interface DetailedEcosystemAnalysis {
  packages: DetailedPackageAnalysis[];
  relationships: DetailedRelationshipAnalysis[];
  apiConnections: APIConnectionAnalysis[];
  dataFlows: DataFlowAnalysis[];
}

export interface DetailedPackageAnalysis {
  name: string;
  path: string;
  type: "frontend" | "backend" | "service";
  importance: "critical" | "important" | "optional";
  components: DetailedComponentAnalysis[];
  dependencies: string[];
  exports: string[];
  imports: string[];
  internalConnections: number;
  externalConnections: number;
  complexity: number;
}

export interface DetailedComponentAnalysis {
  name: string;
  type: string;
  filePath: string;
  exports: string[];
  imports: string[];
  dependencies: string[];
  relationships: ComponentRelationshipAnalysis[];
  complexity: number;
}

export interface DetailedRelationshipAnalysis {
  source: string;
  target: string;
  type: "imports" | "exports" | "depends" | "api" | "data";
  strength: number;
  details: {
    sourceComponent?: string;
    targetComponent?: string;
    importPath?: string;
    exportName?: string;
    apiEndpoint?: string;
    dataType?: string;
  };
}

export interface ComponentRelationshipAnalysis {
  source: string;
  target: string;
  type: "imports" | "exports" | "uses";
  strength: number;
}

export interface APIConnectionAnalysis {
  frontend: string;
  backend: string;
  type: "http" | "websocket" | "sse";
  endpoints: string[];
  dataTypes: string[];
  authentication: boolean;
}

export interface DataFlowAnalysis {
  source: string;
  target: string;
  dataType: string;
  flow: "request" | "response" | "stream" | "event";
  frequency: "high" | "medium" | "low";
}

export class DetailedEcosystemGenerator implements DiagramGenerator {
  name = "Detailed Ecosystem Generator";
  type = "detailed-ecosystem" as const;
  description = "Generates comprehensive diagrams showing detailed relationships between all packages and components";

  async generate(analysis: CodebaseAnalysis, config: DiagramGenerationConfig): Promise<DiagramOutput> {
    const detailedAnalysis = this.analyzeDetailedEcosystem(analysis);
    const mermaidContent = this.generateDetailedMermaidContent(detailedAnalysis, config);

    const metadata: DiagramMetadata = {
      type: this.type,
      title: "Reynard Detailed Ecosystem Analysis",
      description: "Comprehensive view of all packages, components, and their detailed relationships",
      nodeCount: this.countDetailedNodes(detailedAnalysis),
      edgeCount: this.countDetailedEdges(detailedAnalysis),
      complexityScore: this.calculateDetailedComplexity(detailedAnalysis),
      generatedAt: new Date().toISOString(),
      sourceFiles: analysis.packages.map(pkg => pkg.path),
      dependencies: analysis.dependencies.map(dep => dep.name),
    };

    return { mermaidContent, metadata, outputPaths: {} };
  }

  private analyzeDetailedEcosystem(analysis: CodebaseAnalysis): DetailedEcosystemAnalysis {
    const packages = this.analyzeDetailedPackages(analysis);
    const relationships = this.analyzeDetailedRelationships(analysis, packages);
    const apiConnections = this.analyzeAPIConnections(packages);
    const dataFlows = this.analyzeDataFlows(packages);

    return {
      packages,
      relationships,
      apiConnections,
      dataFlows,
    };
  }

  private analyzeDetailedPackages(analysis: CodebaseAnalysis): DetailedPackageAnalysis[] {
    return analysis.packages.map(pkg => {
      const components = pkg.components.map(comp => ({
        name: comp.name,
        type: comp.type,
        filePath: comp.filePath,
        exports: comp.exports || [],
        imports: this.extractComponentImports(comp),
        dependencies: comp.dependencies || [],
        relationships: comp.relationships || [],
        complexity: comp.complexity || 1,
      }));

      const allExports = components.flatMap(comp => comp.exports || []);
      const allImports = components.flatMap(comp => comp.imports || []);

      const internalConnections = allImports.filter(imp => imp && imp.startsWith("reynard-")).length;
      const externalConnections = allImports.filter(imp => imp && !imp.startsWith("reynard-")).length;

      return {
        name: pkg.name,
        path: pkg.path,
        type: this.determinePackageType(pkg),
        importance: pkg.importance,
        components,
        dependencies: pkg.dependencies,
        exports: allExports,
        imports: allImports,
        internalConnections,
        externalConnections,
        complexity: components.reduce((sum, comp) => sum + comp.complexity, 0),
      };
    });
  }

  private analyzeDetailedRelationships(
    analysis: CodebaseAnalysis,
    packages: DetailedPackageAnalysis[]
  ): DetailedRelationshipAnalysis[] {
    const relationships: DetailedRelationshipAnalysis[] = [];

    // Analyze package-level relationships
    for (const pkg of packages) {
      for (const dep of pkg.dependencies) {
        relationships.push({
          source: pkg.name,
          target: dep,
          type: "depends",
          strength: dep.startsWith("reynard-") ? 1 : 0.5,
          details: {},
        });
      }

      // Analyze component-level relationships
      for (const component of pkg.components) {
        for (const importPath of component.imports || []) {
          if (importPath && importPath.startsWith("reynard-")) {
            relationships.push({
              source: pkg.name,
              target: importPath,
              type: "imports",
              strength: 1,
              details: {
                sourceComponent: component.name,
                importPath,
              },
            });
          }
        }

        for (const exportName of component.exports || []) {
          if (exportName) {
            relationships.push({
              source: pkg.name,
              target: `${pkg.name}:${exportName}`,
              type: "exports",
              strength: 1,
              details: {
                sourceComponent: component.name,
                exportName,
              },
            });
          }
        }
      }
    }

    return relationships;
  }

  private analyzeAPIConnections(packages: DetailedPackageAnalysis[]): APIConnectionAnalysis[] {
    const connections: APIConnectionAnalysis[] = [];

    const apiClientPackage = packages.find(pkg => pkg.name === "reynard-api-client");
    const backendPackage = packages.find(pkg => pkg.path === "backend");

    if (apiClientPackage && backendPackage) {
      connections.push({
        frontend: apiClientPackage.name,
        backend: backendPackage.name,
        type: "http",
        endpoints: [
          "/api/caption",
          "/api/chat",
          "/api/rag",
          "/api/gallery",
          "/api/auth",
          "/api/health",
          "/api/ecs",
          "/api/mcp",
        ],
        dataTypes: [
          "CaptionRequest",
          "ChatMessage",
          "SearchQuery",
          "GalleryItem",
          "AuthToken",
          "HealthStatus",
          "ECSWorld",
          "MCPRequest",
        ],
        authentication: true,
      });
    }

    return connections;
  }

  private analyzeDataFlows(packages: DetailedPackageAnalysis[]): DataFlowAnalysis[] {
    const flows: DataFlowAnalysis[] = [];

    // Add data flows based on package analysis
    for (const pkg of packages) {
      if (pkg.name === "reynard-api-client") {
        flows.push({
          source: "reynard-api-client",
          target: "reynard-backend",
          dataType: "APIRequest",
          flow: "request",
          frequency: "high",
        });
        flows.push({
          source: "reynard-backend",
          target: "reynard-api-client",
          dataType: "APIResponse",
          flow: "response",
          frequency: "high",
        });
      }
    }

    return flows;
  }

  private generateDetailedMermaidContent(analysis: DetailedEcosystemAnalysis, config: DiagramGenerationConfig): string {
    const lines = [
      "%%{init: {'theme': 'neutral'}}%%",
      "graph TB",
      "",
      '    subgraph "🦊 Reynard Detailed Ecosystem Analysis"',
      "        direction TB",
      "",
      '        subgraph frontend["🖥️ Frontend Packages"]',
      "            direction TB",
    ];

    // Group packages by type
    const packageGroups = this.groupPackagesByType(analysis.packages);

    for (const [groupName, packages] of Object.entries(packageGroups)) {
      const groupEmoji = this.getGroupEmoji(groupName);
      lines.push(`            subgraph ${groupName}[\"${groupEmoji} ${groupName}\"]`);
      lines.push("                direction LR");

      for (const pkg of packages) {
        const nodeId = this.sanitizeNodeId(pkg.name);
        const nodeLabel = this.createDetailedNodeLabel(pkg);
        lines.push(`                ${nodeId}[\"${nodeLabel}\"]`);
      }

      lines.push("            end");
      lines.push("");
    }

    // Add backend services
    lines.push('        subgraph backend["⚙️ Backend Services"]');
    lines.push("            direction TB");
    const backendPackages = analysis.packages.filter(pkg => pkg.type === "backend");
    for (const pkg of backendPackages) {
      const nodeId = this.sanitizeNodeId(pkg.name);
      const nodeLabel = this.createDetailedNodeLabel(pkg);
      lines.push(`            ${nodeId}[\"${nodeLabel}\"]`);
    }
    lines.push("        end");
    lines.push("");

    // Add detailed relationships
    lines.push("        %% Detailed Relationships");
    for (const rel of analysis.relationships.slice(0, 50)) {
      // Limit for readability
      const sourceId = this.sanitizeNodeId(rel.source);
      const targetId = this.sanitizeNodeId(rel.target);
      const edgeStyle = this.getEdgeStyle(rel.type, rel.strength);
      lines.push(`        ${sourceId} ${edgeStyle} ${targetId}`);
    }

    // Add API connections
    lines.push("");
    lines.push("        %% API Connections");
    for (const conn of analysis.apiConnections) {
      const frontendId = this.sanitizeNodeId(conn.frontend);
      const backendId = this.sanitizeNodeId(conn.backend);
      lines.push(`        ${frontendId} -->|API| ${backendId}`);
    }

    lines.push("    end");
    lines.push("");
    lines.push('    subgraph legend["📋 Legend"]');
    lines.push("        direction LR");
    lines.push('        legend_import["--> Import"]');
    lines.push('        legend_export["<-- Export"]');
    lines.push('        legend_dep["-.-> Dependency"]');
    lines.push('        legend_api["--> API"]');
    lines.push('        legend_data["<--> Data Flow"]');
    lines.push("    end");

    return lines.join("\n");
  }

  private groupPackagesByType(packages: DetailedPackageAnalysis[]): Record<string, DetailedPackageAnalysis[]> {
    const groups: Record<string, DetailedPackageAnalysis[]> = {
      Core: [],
      API: [],
      UI: [],
      Utilities: [],
      Services: [],
    };

    for (const pkg of packages) {
      if (pkg.type === "frontend") {
        if (pkg.name.includes("core") || pkg.name.includes("config")) {
          groups.Core.push(pkg);
        } else if (pkg.name.includes("api") || pkg.name.includes("connection")) {
          groups.API.push(pkg);
        } else if (pkg.name.includes("component") || pkg.name.includes("ui")) {
          groups.UI.push(pkg);
        } else if (pkg.name.includes("service") || pkg.name.includes("manager")) {
          groups.Services.push(pkg);
        } else {
          groups.Utilities.push(pkg);
        }
      }
    }

    // Remove empty groups
    return Object.fromEntries(Object.entries(groups).filter(([_, pkgs]) => pkgs.length > 0));
  }

  private getGroupEmoji(groupName: string): string {
    const emojis: Record<string, string> = {
      Core: "🧠",
      API: "🔌",
      UI: "🎨",
      Utilities: "🛠️",
      Services: "⚙️",
    };
    return emojis[groupName] || "📦";
  }

  private createDetailedNodeLabel(pkg: DetailedPackageAnalysis): string {
    const importance = pkg.importance === "critical" ? "🔴" : pkg.importance === "important" ? "🟡" : "🟢";
    const connections = `(${pkg.internalConnections}i/${pkg.externalConnections}e)`;
    const complexity = `[${pkg.complexity}]`;
    return `${importance} ${pkg.name}\\n${connections} ${complexity}`;
  }

  private getEdgeStyle(type: string, strength: number): string {
    const styles: Record<string, string> = {
      imports: "-->",
      exports: "<--",
      depends: "-.->",
      api: "-->",
      data: "<-->",
    };
    return styles[type] || "-->";
  }

  private sanitizeNodeId(name: string): string {
    return name.replace(/[^a-zA-Z0-9_]/g, "_");
  }

  private extractComponentImports(component: any): string[] {
    // Extract imports from component relationships or file analysis
    return component.relationships?.filter((rel: any) => rel.type === "imports").map((rel: any) => rel.target) || [];
  }

  private determinePackageType(pkg: any): "frontend" | "backend" | "service" {
    if (pkg.path === "backend") return "backend";
    if (pkg.name.includes("service")) return "service";
    return "frontend";
  }

  private countDetailedNodes(analysis: DetailedEcosystemAnalysis): number {
    return analysis.packages.length + analysis.relationships.length;
  }

  private countDetailedEdges(analysis: DetailedEcosystemAnalysis): number {
    return analysis.relationships.length + analysis.apiConnections.length + analysis.dataFlows.length;
  }

  private calculateDetailedComplexity(analysis: DetailedEcosystemAnalysis): number {
    const packageComplexity = analysis.packages.reduce((sum, pkg) => sum + pkg.complexity, 0);
    const relationshipComplexity = analysis.relationships.length * 0.1;
    return Math.round(packageComplexity + relationshipComplexity);
  }
}
