/**
 * @fileoverview Template engine for generating documentation pages
 */

import { DocPage } from 'reynard-docs-core';
import { PackageInfo, ApiInfo, ExampleInfo } from '../config';

/**
 * Template engine for generating documentation pages
 */
export class TemplateEngine {
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  /**
   * Render package overview page
   */
  async renderPackageOverview(packageInfo: PackageInfo): Promise<DocPage> {
    const content = this.generatePackageOverviewContent(packageInfo);
    
    return {
      id: packageInfo.name,
      slug: packageInfo.name,
      title: packageInfo.displayName || packageInfo.name,
      content,
      metadata: {
        title: packageInfo.displayName || packageInfo.name,
        description: packageInfo.description,
        version: packageInfo.version,
        category: packageInfo.category,
        tags: packageInfo.keywords,
        author: packageInfo.author?.name,
        lastModified: new Date().toISOString()
      },
      type: 'markdown'
    };
  }

  /**
   * Render API documentation page
   */
  async renderApiPage(packageInfo: PackageInfo): Promise<DocPage> {
    const content = this.generateApiPageContent(packageInfo);
    
    return {
      id: `${packageInfo.name}-api`,
      slug: `${packageInfo.name}/api`,
      title: `${packageInfo.displayName || packageInfo.name} API`,
      content,
      metadata: {
        title: `${packageInfo.displayName || packageInfo.name} API`,
        description: `API documentation for ${packageInfo.name}`,
        version: packageInfo.version,
        category: packageInfo.category,
        tags: [...packageInfo.keywords, 'api', 'documentation']
      },
      type: 'markdown'
    };
  }

  /**
   * Render examples page
   */
  async renderExamplePage(packageInfo: PackageInfo): Promise<DocPage> {
    const content = this.generateExamplePageContent(packageInfo);
    
    return {
      id: `${packageInfo.name}-examples`,
      slug: `${packageInfo.name}/examples`,
      title: `${packageInfo.displayName || packageInfo.name} Examples`,
      content,
      metadata: {
        title: `${packageInfo.displayName || packageInfo.name} Examples`,
        description: `Code examples for ${packageInfo.name}`,
        version: packageInfo.version,
        category: packageInfo.category,
        tags: [...packageInfo.keywords, 'examples', 'code']
      },
      type: 'markdown'
    };
  }

  /**
   * Generate package overview content
   */
  private generatePackageOverviewContent(packageInfo: PackageInfo): string {
    let content = `# ${packageInfo.displayName || packageInfo.name}\n\n`;
    
    if (packageInfo.description) {
      content += `${packageInfo.description}\n\n`;
    }

    // Installation section
    content += `## Installation\n\n`;
    content += `\`\`\`bash\n`;
    content += `npm install ${packageInfo.name}\n`;
    content += `\`\`\`\n\n`;

    // Quick start section
    if (packageInfo.readme) {
      content += `## Quick Start\n\n`;
      content += this.extractQuickStartFromReadme(packageInfo.readme);
      content += `\n\n`;
    }

    // Features section
    if (packageInfo.keywords.length > 0) {
      content += `## Features\n\n`;
      content += `- ${packageInfo.keywords.join('\n- ')}\n\n`;
    }

    // API section
    if (packageInfo.api && packageInfo.api.length > 0) {
      content += `## API Reference\n\n`;
      content += `This package provides ${packageInfo.api.length} exported APIs:\n\n`;
      
      for (const api of packageInfo.api.slice(0, 5)) {
        content += `- **${api.name}** (${api.type}) - ${api.description}\n`;
      }
      
      if (packageInfo.api.length > 5) {
        content += `- ... and ${packageInfo.api.length - 5} more\n`;
      }
      
      content += `\n[View full API documentation →](./api)\n\n`;
    }

    // Examples section
    if (packageInfo.examples && packageInfo.examples.length > 0) {
      content += `## Examples\n\n`;
      content += `Check out the [examples](./examples) to see ${packageInfo.name} in action.\n\n`;
    }

    // Links section
    content += `## Links\n\n`;
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

  /**
   * Generate API page content
   */
  private generateApiPageContent(packageInfo: PackageInfo): string {
    let content = `# ${packageInfo.displayName || packageInfo.name} API\n\n`;
    content += `Complete API reference for ${packageInfo.name}.\n\n`;

    if (!packageInfo.api || packageInfo.api.length === 0) {
      content += `No API documentation available.\n`;
      return content;
    }

    // Group APIs by type
    const apisByType = this.groupApisByType(packageInfo.api);

    for (const [type, apis] of apisByType) {
      content += `## ${this.capitalize(type)}s\n\n`;
      
      for (const api of apis) {
        content += this.generateApiDocumentation(api);
        content += `\n\n`;
      }
    }

    return content;
  }

  /**
   * Generate example page content
   */
  private generateExamplePageContent(packageInfo: PackageInfo): string {
    let content = `# ${packageInfo.displayName || packageInfo.name} Examples\n\n`;
    content += `Code examples and usage patterns for ${packageInfo.name}.\n\n`;

    if (!packageInfo.examples || packageInfo.examples.length === 0) {
      content += `No examples available.\n`;
      return content;
    }

    for (const example of packageInfo.examples) {
      content += this.generateExampleDocumentation(example);
      content += `\n\n`;
    }

    return content;
  }

  /**
   * Generate API documentation for a single API
   */
  private generateApiDocumentation(api: ApiInfo): string {
    let content = `### ${api.name}\n\n`;
    
    if (api.description) {
      content += `${api.description}\n\n`;
    }

    // Type and signature
    content += `**Type:** \`${api.type}\`\n\n`;

    // Parameters
    if (api.parameters && api.parameters.length > 0) {
      content += `**Parameters:**\n\n`;
      content += `| Name | Type | Required | Description |\n`;
      content += `|------|------|----------|-------------|\n`;
      
      for (const param of api.parameters) {
        content += `| ${param.name} | \`${param.type}\` | ${param.required ? 'Yes' : 'No'} | ${param.description} |\n`;
      }
      content += `\n`;
    }

    // Return type
    if (api.returns) {
      content += `**Returns:** \`${api.returns.type}\` - ${api.returns.description}\n\n`;
    }

    // Examples
    if (api.examples && api.examples.length > 0) {
      content += `**Examples:**\n\n`;
      for (const example of api.examples) {
        content += `\`\`\`typescript\n${example}\n\`\`\`\n\n`;
      }
    }

    // Deprecation notice
    if (api.deprecated) {
      content += `> ⚠️ **Deprecated** - This API is deprecated and may be removed in future versions.\n\n`;
    }

    return content;
  }

  /**
   * Generate example documentation
   */
  private generateExampleDocumentation(example: ExampleInfo): string {
    let content = `### ${example.title}\n\n`;
    
    if (example.description) {
      content += `${example.description}\n\n`;
    }

    content += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n\n`;

    if (example.output) {
      content += `**Output:**\n\n`;
      content += `\`\`\`\n${example.output}\n\`\`\`\n\n`;
    }

    return content;
  }

  /**
   * Group APIs by type
   */
  private groupApisByType(apis: ApiInfo[]): Map<string, ApiInfo[]> {
    const grouped = new Map<string, ApiInfo[]>();
    
    for (const api of apis) {
      if (!grouped.has(api.type)) {
        grouped.set(api.type, []);
      }
      grouped.get(api.type)!.push(api);
    }
    
    return grouped;
  }

  /**
   * Extract quick start section from README
   */
  private extractQuickStartFromReadme(readme: string): string {
    const lines = readme.split('\n');
    let inQuickStart = false;
    let quickStartLines: string[] = [];
    let headingLevel = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for quick start heading
      if (trimmed.match(/^#+\s*(quick\s*start|getting\s*started|usage)/i)) {
        inQuickStart = true;
        headingLevel = (trimmed.match(/^#+/) || [''])[0].length;
        continue;
      }
      
      // Check for next heading at same or higher level
      if (inQuickStart && trimmed.match(/^#+\s/) && trimmed.match(/^#+/)![0].length <= headingLevel) {
        break;
      }
      
      if (inQuickStart) {
        quickStartLines.push(line);
      }
    }

    return quickStartLines.join('\n').trim();
  }

  /**
   * Capitalize first letter
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
