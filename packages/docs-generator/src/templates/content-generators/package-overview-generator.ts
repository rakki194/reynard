/**
 * @fileoverview Package overview content generator
 */

import type { PackageInfo } from "../../config/types/package";
import { ReadmeProcessor } from "./readme-processor";

/**
 * Generates package overview content
 */
export class PackageOverviewGenerator {
  private readmeProcessor: ReadmeProcessor;

  constructor() {
    this.readmeProcessor = new ReadmeProcessor();
  }

  /**
   * Generate package overview content
   */
  generateContent(packageInfo: PackageInfo): string {
    // If we have a rich README, use it directly instead of generating basic content
    if (
      packageInfo.readme &&
      this.readmeProcessor.isRichReadme(packageInfo.readme)
    ) {
      return packageInfo.readme;
    }

    // Fallback to generated content for packages without rich READMEs
    let content = `# ${packageInfo.displayName || packageInfo.name}\n\n`;

    if (packageInfo.description) {
      content += `${packageInfo.description}\n\n`;
    }

    content += this.generateInstallationSection(packageInfo);
    content += this.generateQuickStartSection(packageInfo);
    content += this.generateFeaturesSection(packageInfo);
    content += this.generateApiSection(packageInfo);
    content += this.generateExamplesSection(packageInfo);
    content += this.generateLinksSection(packageInfo);

    return content;
  }

  /**
   * Generate installation section
   */
  private generateInstallationSection(packageInfo: PackageInfo): string {
    let content = `## Installation\n\n`;
    content += `\`\`\`bash\n`;
    content += `npm install ${packageInfo.name}\n`;
    content += `\`\`\`\n\n`;
    return content;
  }

  /**
   * Generate quick start section
   */
  private generateQuickStartSection(packageInfo: PackageInfo): string {
    if (!packageInfo.readme) return "";

    let content = `## Quick Start\n\n`;
    content += this.readmeProcessor.extractQuickStartFromReadme(
      packageInfo.readme,
    );
    content += `\n\n`;
    return content;
  }

  /**
   * Generate features section
   */
  private generateFeaturesSection(packageInfo: PackageInfo): string {
    if (packageInfo.keywords.length === 0) return "";

    let content = `## Features\n\n`;
    content += `- ${packageInfo.keywords.join("\n- ")}\n\n`;
    return content;
  }

  /**
   * Generate API section
   */
  private generateApiSection(packageInfo: PackageInfo): string {
    if (!packageInfo.api || packageInfo.api.length === 0) return "";

    let content = `## API Reference\n\n`;
    content += `This package provides ${packageInfo.api.length} exported APIs:\n\n`;

    for (const api of packageInfo.api.slice(0, 5)) {
      content += `- **${api.name}** (${api.type}) - ${api.description}\n`;
    }

    if (packageInfo.api.length > 5) {
      content += `- ... and ${packageInfo.api.length - 5} more\n`;
    }

    content += `\n[View full API documentation →](./api)\n\n`;
    return content;
  }

  /**
   * Generate examples section
   */
  private generateExamplesSection(packageInfo: PackageInfo): string {
    if (!packageInfo.examples || packageInfo.examples.length === 0) return "";

    let content = `## Examples\n\n`;
    content += `Check out the [examples](./examples) to see ${packageInfo.name} in action.\n\n`;
    return content;
  }

  /**
   * Generate links section
   */
  private generateLinksSection(packageInfo: PackageInfo): string {
    let content = `## Links\n\n`;
    if (packageInfo.homepage) {
      content += `- [Homepage](${packageInfo.homepage})\n`;
    }
    if (packageInfo.repository?.url) {
      content += `- [Repository](${packageInfo.repository.url})\n`;
    }
    if (packageInfo.bugs?.url) {
      content += `- [Report Issues](${packageInfo.bugs.url})\n`;
    }
    return content;
  }
}
