/**
 * ADR Generator - Intelligent ADR Creation and Management
 *
 * This module provides intelligent ADR generation capabilities based on
 * codebase analysis and architectural patterns.
 */

import { readFile, writeFile, readdir } from "fs/promises";
import { join, basename } from "path";
import { ADRSuggestion, CodebaseAnalyzer } from "./CodebaseAnalyzer";
import { ADRDocument, ADRStatus, ADRCategory, ADRTemplate } from "./types";

export class ADRGenerator {
  private readonly templates: Map<string, ADRTemplate> = new Map();
  private readonly adrDirectory: string;
  private readonly templateDirectory: string;

  constructor(adrDirectory: string, templateDirectory: string) {
    this.adrDirectory = adrDirectory;
    this.templateDirectory = templateDirectory;
    this.initializeTemplates();
  }

  /**
   * Generate ADR from suggestion
   */
  async generateADRFromSuggestion(suggestion: ADRSuggestion): Promise<string> {
    console.log(`🦊 Generating ADR for: ${suggestion.title}`);

    const template = this.templates.get(suggestion.template);
    if (!template) {
      throw new Error(`Template not found: ${suggestion.template}`);
    }

    const adrId = await this.getNextADRId();
    const adrContent = await this.generateADRContent(adrId, suggestion, template);

    const fileName = `${adrId.toString().padStart(3, "0")}-${this.sanitizeTitle(suggestion.title)}.md`;
    const filePath = join(this.adrDirectory, fileName);

    await writeFile(filePath, adrContent, "utf-8");

    console.log(`✅ ADR generated: ${fileName}`);
    return filePath;
  }

  /**
   * Generate multiple ADRs from suggestions
   */
  async generateMultipleADRs(suggestions: ADRSuggestion[]): Promise<string[]> {
    const generatedFiles: string[] = [];

    // Sort suggestions by priority
    const sortedSuggestions = suggestions.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    for (const suggestion of sortedSuggestions) {
      try {
        const filePath = await this.generateADRFromSuggestion(suggestion);
        generatedFiles.push(filePath);
      } catch (error) {
        console.error(`❌ Failed to generate ADR for ${suggestion.title}:`, error);
      }
    }

    return generatedFiles;
  }

  /**
   * Generate ADR content from template and suggestion
   */
  private async generateADRContent(adrId: number, suggestion: ADRSuggestion, template: ADRTemplate): Promise<string> {
    const date = new Date().toISOString().split("T")[0];

    let content = `# ADR-${adrId.toString().padStart(3, "0")}: ${suggestion.title}\n\n`;
    content += `## Status\n\n`;
    content += `**Proposed** - ${date}\n\n`;

    content += `## Context\n\n`;
    content += `${suggestion.reasoning.join("\n\n")}\n\n`;

    if (suggestion.evidence.length > 0) {
      content += `### Evidence\n\n`;
      content += `- ${suggestion.evidence.join("\n- ")}\n\n`;
    }

    content += `## Decision\n\n`;
    content += `[To be filled by architecture team]\n\n`;

    content += `## Consequences\n\n`;
    content += `### Positive\n\n`;
    content += `[To be filled by architecture team]\n\n`;

    content += `### Negative\n\n`;
    content += `[To be filled by architecture team]\n\n`;

    content += `### Risks and Mitigations\n\n`;
    content += `| Risk | Impact | Probability | Mitigation |\n`;
    content += `|------|--------|-------------|------------|\n`;
    content += `| [Risk to be identified] | [High/Medium/Low] | [High/Medium/Low] | [Mitigation strategy] |\n\n`;

    content += `## Implementation Plan\n\n`;
    content += `### Phase 1: [Phase Name] (Weeks 1-2)\n\n`;
    content += `- [ ] [Task to be completed]\n`;
    content += `- [ ] [Task to be completed]\n`;
    content += `- [ ] [Task to be completed]\n\n`;

    content += `## Metrics and Monitoring\n\n`;
    content += `### Key Performance Indicators\n\n`;
    content += `- [Metric to be defined]\n`;
    content += `- [Metric to be defined]\n\n`;

    content += `## Review and Updates\n\n`;
    content += `This ADR will be reviewed:\n\n`;
    content += `- **Monthly**: [Review frequency]\n`;
    content += `- **On Changes**: [When to review]\n\n`;

    content += `## References\n\n`;
    content += `- [Reynard Architecture Guidelines](../architecture-guidelines.md)\n`;
    content += `- [Related Documentation](../related-docs.md)\n\n`;

    content += `---\n\n`;
    content += `**Decision Makers**: [Architecture Team]\n`;
    content += `**Stakeholders**: ${suggestion.stakeholders.join(", ")}\n`;
    content += `**Review Date**: [Next Review Date]\n`;
    content += `**Priority**: ${suggestion.priority.toUpperCase()}\n`;
    content += `**Category**: ${suggestion.category.toUpperCase()}\n`;

    return content;
  }

  /**
   * Get the next available ADR ID
   */
  private async getNextADRId(): Promise<number> {
    try {
      const files = await readdir(this.adrDirectory);
      const adrFiles = files.filter(file => file.match(/^\d{3}-.*\.md$/));

      if (adrFiles.length === 0) {
        return 1;
      }

      const maxId = Math.max(
        ...adrFiles.map(file => {
          const match = file.match(/^(\d{3})-/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );

      return maxId + 1;
    } catch (error) {
      console.warn("Could not read ADR directory, starting with ID 1");
      return 1;
    }
  }

  /**
   * Sanitize title for filename
   */
  private sanitizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  /**
   * Initialize ADR templates
   */
  private initializeTemplates(): void {
    // Security template
    this.templates.set("security", {
      name: "Security ADR Template",
      category: "security",
      sections: [
        "Security Requirements",
        "Threat Model",
        "Security Controls",
        "Implementation Details",
        "Security Testing",
        "Monitoring and Incident Response",
      ],
      requiredFields: ["threatModel", "securityControls", "compliance"],
      optionalFields: ["penetrationTesting", "incidentResponse"],
    });

    // Performance template
    this.templates.set("performance", {
      name: "Performance ADR Template",
      category: "performance",
      sections: [
        "Performance Requirements",
        "Current Performance Baseline",
        "Performance Strategy",
        "Implementation Details",
        "Performance Testing",
        "Monitoring and Alerting",
      ],
      requiredFields: ["performanceRequirements", "baseline", "strategy"],
      optionalFields: ["loadTesting", "benchmarking"],
    });

    // Scalability template
    this.templates.set("scalability", {
      name: "Scalability ADR Template",
      category: "scalability",
      sections: [
        "Scalability Requirements",
        "Current System Limitations",
        "Growth Projections",
        "Scaling Strategy",
        "Architecture Patterns",
        "Implementation Plan",
      ],
      requiredFields: ["scalabilityRequirements", "growthProjections", "scalingStrategy"],
      optionalFields: ["costOptimization", "monitoring"],
    });

    // Integration template
    this.templates.set("integration", {
      name: "Integration ADR Template",
      category: "integration",
      sections: [
        "Integration Requirements",
        "Current State",
        "Integration Architecture",
        "Implementation Details",
        "Integration Testing",
        "Monitoring and Alerting",
      ],
      requiredFields: ["integrationRequirements", "architecture", "testing"],
      optionalFields: ["security", "performance"],
    });

    // General template
    this.templates.set("general", {
      name: "General ADR Template",
      category: "general",
      sections: ["Context", "Decision", "Consequences", "Implementation Plan", "Review and Updates"],
      requiredFields: ["context", "decision", "consequences"],
      optionalFields: ["implementation", "review"],
    });
  }

  /**
   * Get available templates
   */
  getAvailableTemplates(): ADRTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by name
   */
  getTemplate(name: string): ADRTemplate | undefined {
    return this.templates.get(name);
  }

  /**
   * Add custom template
   */
  addTemplate(template: ADRTemplate): void {
    this.templates.set(template.name.toLowerCase().replace(/\s+/g, "-"), template);
  }
}
