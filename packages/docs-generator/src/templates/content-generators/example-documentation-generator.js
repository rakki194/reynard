/**
 * @fileoverview Example documentation content generator
 */
/**
 * Generates example documentation content
 */
export class ExampleDocumentationGenerator {
    /**
     * Generate example page content
     */
    generateContent(packageInfo) {
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
     * Generate example documentation
     */
    generateExampleDocumentation(example) {
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
}
