#!/usr/bin/env node

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

class SimplifiedDiagramGenerator {
  constructor() {
    // No need to store architecture for simplified diagrams
  }

  public generateCategoryDiagram(): string {
    let mermaid = "graph TD\n";

    // Main categories
    const categories = [
      { name: "packages", emoji: "📦", importance: "critical" },
      { name: "services", emoji: "🔧", importance: "critical" },
      { name: "backend", emoji: "🐍", importance: "critical" },
      { name: "docs", emoji: "📚", importance: "critical" },
      { name: "examples", emoji: "🎯", importance: "important" },
      { name: "templates", emoji: "📋", importance: "important" },
      { name: "scripts", emoji: "📜", importance: "important" },
      { name: "e2e", emoji: "🧪", importance: "important" },
    ];

    // Add category nodes
    categories.forEach(cat => {
      const nodeId = this.sanitizeId(cat.name);
      mermaid += `    ${nodeId}["${cat.emoji} ${cat.name}"]:::${cat.importance}\n`;
    });

    mermaid += "\n";

    // Add package subcategories
    const packageCategories = [
      { name: "ai", emoji: "🤖", parent: "packages" },
      { name: "core", emoji: "⚙️", parent: "packages" },
      { name: "ui", emoji: "🎨", parent: "packages" },
      { name: "data", emoji: "💾", parent: "packages" },
      { name: "media", emoji: "🎬", parent: "packages" },
      { name: "dev-tools", emoji: "🛠️", parent: "packages" },
      { name: "docs", emoji: "📖", parent: "packages" },
      { name: "services", emoji: "🔌", parent: "packages" },
      { name: "algorithms", emoji: "🧮", parent: "packages" },
    ];

    packageCategories.forEach(cat => {
      const nodeId = this.sanitizeId(`packages_${cat.name}`);
      const parentId = this.sanitizeId(cat.parent);
      mermaid += `    ${nodeId}["${cat.emoji} ${cat.name}"]:::important\n`;
      mermaid += `    ${parentId} --> ${nodeId}\n`;
    });

    // Add service subcategories
    const serviceCategories = [
      { name: "agent-naming", emoji: "🏷️", parent: "services" },
      { name: "gatekeeper", emoji: "🔐", parent: "services" },
      { name: "mcp-server", emoji: "🖥️", parent: "services" },
    ];

    serviceCategories.forEach(cat => {
      const nodeId = this.sanitizeId(`services_${cat.name}`);
      const parentId = this.sanitizeId(cat.parent);
      mermaid += `    ${nodeId}["${cat.emoji} ${cat.name}"]:::important\n`;
      mermaid += `    ${parentId} --> ${nodeId}\n`;
    });

    // Add key relationships
    mermaid += "\n";
    mermaid += "    %% Key Dependencies\n";
    mermaid += `    ${this.sanitizeId("packages_core")} -->|🔗| ${this.sanitizeId("packages_ai")}\n`;
    mermaid += `    ${this.sanitizeId("packages_core")} -->|🔗| ${this.sanitizeId("packages_ui")}\n`;
    mermaid += `    ${this.sanitizeId("packages_core")} -->|🔗| ${this.sanitizeId("packages_data")}\n`;
    mermaid += `    ${this.sanitizeId("packages_ai")} -->|🔗| ${this.sanitizeId("packages_media")}\n`;
    mermaid += `    ${this.sanitizeId("packages_ui")} -->|🔗| ${this.sanitizeId("packages_media")}\n`;
    mermaid += `    ${this.sanitizeId("packages_data")} -->|🔗| ${this.sanitizeId("packages_ai")}\n`;
    mermaid += `    ${this.sanitizeId("services")} -->|🔗| ${this.sanitizeId("backend")}\n`;
    mermaid += `    ${this.sanitizeId("packages_services")} -->|🔗| ${this.sanitizeId("services")}\n`;

    // Add styling
    mermaid += "\n";
    mermaid += "    classDef critical fill:#ff6b6b,stroke:#d63031,stroke-width:3px,color:#fff\n";
    mermaid += "    classDef important fill:#74b9ff,stroke:#0984e3,stroke-width:2px,color:#fff\n";
    mermaid += "    classDef optional fill:#a29bfe,stroke:#6c5ce7,stroke-width:1px,color:#fff\n";

    return mermaid;
  }

  public generateCoreDependenciesDiagram(): string {
    let mermaid = "graph TD\n";

    // Core packages that most others depend on
    const corePackages = [
      { name: "packages/core/core", emoji: "⚙️", importance: "critical" },
      { name: "packages/ai/ai-shared", emoji: "🤖", importance: "critical" },
      { name: "packages/ui/components-core", emoji: "🎨", importance: "critical" },
      { name: "packages/data/repository-core", emoji: "💾", importance: "important" },
      { name: "packages/core/validation", emoji: "✅", importance: "important" },
      { name: "packages/core/connection", emoji: "🔗", importance: "important" },
      { name: "packages/services/api-client", emoji: "🔌", importance: "important" },
    ];

    // Add core nodes
    corePackages.forEach(pkg => {
      const nodeId = this.sanitizeId(pkg.name);
      mermaid += `    ${nodeId}["${pkg.emoji} ${this.getShortName(pkg.name)}"]:::${pkg.importance}\n`;
    });

    mermaid += "\n";

    // Add key dependencies
    mermaid += "    %% Core Dependencies\n";
    mermaid += `    ${this.sanitizeId("packages/ai/ai-shared")} -->|🔗| ${this.sanitizeId("packages/core/core")}\n`;
    mermaid += `    ${this.sanitizeId("packages/ui/components-core")} -->|🔗| ${this.sanitizeId("packages/core/core")}\n`;
    mermaid += `    ${this.sanitizeId("packages/data/repository-core")} -->|🔗| ${this.sanitizeId("packages/core/core")}\n`;
    mermaid += `    ${this.sanitizeId("packages/core/validation")} -->|🔗| ${this.sanitizeId("packages/core/core")}\n`;
    mermaid += `    ${this.sanitizeId("packages/core/connection")} -->|🔗| ${this.sanitizeId("packages/core/core")}\n`;
    mermaid += `    ${this.sanitizeId("packages/services/api-client")} -->|🔗| ${this.sanitizeId("packages/core/connection")}\n`;

    // Add styling
    mermaid += "\n";
    mermaid += "    classDef critical fill:#ff6b6b,stroke:#d63031,stroke-width:3px,color:#fff\n";
    mermaid += "    classDef important fill:#74b9ff,stroke:#0984e3,stroke-width:2px,color:#fff\n";

    return mermaid;
  }

  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9]/g, "_");
  }

  private getShortName(fullName: string): string {
    const parts = fullName.split("/");
    if (parts.length >= 3) {
      return `${parts[1]}/${parts[2]}`;
    }
    return parts[parts.length - 1];
  }

  public exportDiagrams(outputDir: string = "dependency-analysis"): void {
    mkdirSync(outputDir, { recursive: true });

    // Generate category diagram
    const categoryDiagram = this.generateCategoryDiagram();
    writeFileSync(join(outputDir, "category-diagram.mmd"), categoryDiagram);

    // Generate core dependency diagram
    const coreDiagram = this.generateCoreDependenciesDiagram();
    writeFileSync(join(outputDir, "core-dependencies.mmd"), coreDiagram);

    console.log(`📊 Simplified diagrams generated!`);
    console.log(`📁 Files generated in: ${outputDir}/`);
    console.log(`   - category-diagram.mmd (Main categories)`);
    console.log(`   - core-dependencies.mmd (Core package dependencies)`);
  }
}

// CLI interface - only run when called directly, not during tests
if (import.meta.url === `file://${process.argv[1]}` && !process.env.VITEST) {
  const generator = new SimplifiedDiagramGenerator();
  generator.exportDiagrams();
}

export { SimplifiedDiagramGenerator };
