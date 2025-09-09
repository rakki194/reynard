/**
 * @fileoverview API documentation content generator
 */

import type { PackageInfo } from "../../config/types/package";
import type { ApiInfo } from "../../config/types/api";

/**
 * Generates API documentation content
 */
export class ApiDocumentationGenerator {
  /**
   * Generate API page content
   */
  generateContent(packageInfo: PackageInfo): string {
    let content = `# ${packageInfo.displayName || packageInfo.name} API\n\n`;
    content += `Complete API reference for ${packageInfo.name}.\n\n`;

    if (!packageInfo.api || packageInfo.api.length === 0) {
      content += `No API documentation available.\n`;
      return content;
    }

    // Group APIs by type
    const apisByType = this.groupApisByType(packageInfo.api);

    apisByType.forEach((apis, type) => {
      content += `## ${this.capitalize(type)}s\n\n`;

      for (const api of apis) {
        content += this.generateApiDocumentation(api);
        content += `\n\n`;
      }
    });

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
      content += this.generateParametersSection(api.parameters);
    }

    // Return type
    if (api.returns) {
      content += `**Returns:** \`${api.returns.type}\` - ${api.returns.description}\n\n`;
    }

    // Examples
    if (api.examples && api.examples.length > 0) {
      content += this.generateExamplesSection(api.examples);
    }

    // Deprecation notice
    if (api.deprecated) {
      content += `> ⚠️ **Deprecated** - This API is deprecated and may be removed in future versions.\n\n`;
    }

    return content;
  }

  /**
   * Generate parameters section
   */
  private generateParametersSection(parameters: any[]): string {
    let content = `**Parameters:**\n\n`;
    content += `| Name | Type | Required | Description |\n`;
    content += `|------|------|----------|-------------|\n`;

    for (const param of parameters) {
      content += `| ${param.name} | \`${param.type}\` | ${param.required ? "Yes" : "No"} | ${param.description} |\n`;
    }
    content += `\n`;
    return content;
  }

  /**
   * Generate examples section
   */
  private generateExamplesSection(examples: string[]): string {
    let content = `**Examples:**\n\n`;
    for (const example of examples) {
      content += `\`\`\`typescript\n${example}\n\`\`\`\n\n`;
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
   * Capitalize first letter
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
