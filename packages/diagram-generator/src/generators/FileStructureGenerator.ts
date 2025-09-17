/**
 * 🦊 File Structure Diagram Generator
 *
 * Generates file structure diagrams showing the organization
 * of files and directories in the Reynard project.
 */

import type {
  DiagramGenerator,
  DiagramOutput,
  DiagramMetadata,
  CodebaseAnalysis,
  DiagramGenerationConfig,
} from "../types.js";

export class FileStructureGenerator implements DiagramGenerator {
  name = "File Structure Generator";
  type = "file-structure" as const;
  description = "Generates file and directory structure diagrams";

  async generate(analysis: CodebaseAnalysis, config: DiagramGenerationConfig): Promise<DiagramOutput> {
    const mermaidContent = this.generateMermaidContent(analysis, config);

    const metadata: DiagramMetadata = {
      type: this.type,
      title: "Reynard File Structure",
      description: "Visual representation of the project file and directory structure",
      nodeCount: this.countNodes(analysis.fileStructure.structure),
      edgeCount: this.countEdges(analysis.fileStructure.structure),
      complexityScore: this.calculateComplexity(analysis),
      generatedAt: new Date().toISOString(),
      sourceFiles: this.extractFilePaths(analysis.fileStructure.structure),
      dependencies: [],
    };

    return {
      mermaidContent,
      metadata,
      outputPaths: {},
    };
  }

  validate(analysis: CodebaseAnalysis): boolean {
    return analysis.fileStructure.totalDirectories > 0;
  }

  private generateMermaidContent(analysis: CodebaseAnalysis, config: DiagramGenerationConfig): string {
    const lines = [
      "%%{init: {'theme': 'neutral'}}%%",
      "graph TD",
      '    subgraph "🦊 Reynard File Structure"',
      "        direction TB",
      "",
    ];

    // Generate structure starting from root
    this.generateDirectoryNode(analysis.fileStructure.structure, lines, "", 0, config);

    lines.push("    end");

    return lines.join("\n");
  }

  private generateDirectoryNode(
    node: any,
    lines: string[],
    parentId: string,
    depth: number,
    config: DiagramGenerationConfig
  ): void {
    if (depth > 4) return; // Limit depth to prevent overly complex diagrams

    const nodeId = this.sanitizeId(parentId + "_" + node.name);
    const icon = this.getDirectoryIcon(node.name, node.type);
    const label = `${icon} ${node.name}`;

    if (parentId) {
      lines.push(`    ${parentId} --> ${nodeId}["${label}"]`);
    } else {
      lines.push(`    ${nodeId}["${label}"]`);
    }

    // Add file information if configured
    if (config.includeMetadata && node.files.length > 0) {
      const fileCount = node.files.length;
      const fileTypes = this.getFileTypeSummary(node.files);
      const fileInfoId = this.sanitizeId(nodeId + "_files");
      lines.push(`    ${nodeId} --> ${fileInfoId}["📄 ${fileCount} files (${fileTypes})"]`);
    }

    // Recursively process child directories
    for (const child of node.children) {
      this.generateDirectoryNode(child, lines, nodeId, depth + 1, config);
    }
  }

  private getDirectoryIcon(name: string, type: string): string {
    // Special icons for important directories
    if (name === "packages") return "📦";
    if (name === "src") return "📁";
    if (name === "components") return "🧩";
    if (name === "utils") return "🛠️";
    if (name === "services") return "🔧";
    if (name === "tests" || name === "__tests__") return "🧪";
    if (name === "docs") return "📚";
    if (name === "scripts") return "📜";
    if (name === "backend") return "🐍";
    if (name === "frontend") return "⚛️";
    if (name === "examples") return "💡";
    if (name === "templates") return "📋";
    if (name === "e2e") return "🔍";
    if (name === "node_modules") return "📚";
    if (name === "dist" || name === "build") return "🏗️";
    if (name === ".git") return "🔀";
    if (name === ".cursor") return "🎯";
    if (name === "third_party") return "🌐";

    // Default icons based on type
    switch (type) {
      case "source":
        return "💻";
      case "documentation":
        return "📖";
      case "configuration":
        return "⚙️";
      case "build":
        return "🔨";
      case "testing":
        return "🧪";
      case "scripts":
        return "📜";
      case "data":
        return "💾";
      case "templates":
        return "📋";
      case "services":
        return "🔧";
      case "third-party":
        return "🌐";
      case "cache":
        return "💨";
      case "tools":
        return "🛠️";
      default:
        return "📁";
    }
  }

  private getFileTypeSummary(files: any[]): string {
    const typeCount: Record<string, number> = {};

    for (const file of files) {
      typeCount[file.type] = (typeCount[file.type] || 0) + 1;
    }

    const topTypes = Object.entries(typeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => `${type}(${count})`)
      .join(", ");

    return topTypes || "mixed";
  }

  private countNodes(node: any): number {
    let count = 1; // Count this node
    for (const child of node.children) {
      count += this.countNodes(child);
    }
    return count;
  }

  private countEdges(node: any): number {
    let count = node.children.length; // Edges to children
    for (const child of node.children) {
      count += this.countEdges(child);
    }
    return count;
  }

  private extractFilePaths(node: any): string[] {
    let paths = [...node.files.map((f: any) => f.path)];
    for (const child of node.children) {
      paths.push(...this.extractFilePaths(child));
    }
    return paths;
  }

  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^[0-9]/, "_$&");
  }

  private calculateComplexity(analysis: CodebaseAnalysis): number {
    return analysis.fileStructure.totalDirectories + analysis.fileStructure.totalFiles;
  }
}
