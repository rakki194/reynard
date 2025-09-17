/**
 * @fileoverview Markdown and content parsers for Reynard documentation
 */
import type { DocPage, DocContentType, MarkdownOptions } from "../types";
/**
 * Enhanced markdown parser with syntax highlighting and custom features
 */
export declare class MarkdownParser {
    private options;
    constructor(options?: MarkdownOptions);
    /**
     * Parse markdown content with frontmatter
     */
    parse(content: string, type?: DocContentType): Promise<DocPage>;
    /**
     * Parse markdown to HTML
     */
    private parseMarkdown;
    /**
     * Setup marked with custom renderer
     */
    private setupMarked;
    /**
     * Syntax highlighting for code blocks
     */
    private highlightCode;
    /**
     * Generate URL-friendly slug from title
     */
    private generateSlug;
}
/**
 * MDX parser for React/SolidJS components in markdown
 */
export declare class MDXParser {
    private markdownParser;
    constructor(options?: MarkdownOptions);
    /**
     * Parse MDX content with component support
     */
    parse(content: string): Promise<DocPage>;
    /**
     * Extract components from MDX content
     */
    extractComponents(content: string): string[];
}
/**
 * API documentation parser
 */
export declare class ApiParser {
    /**
     * Parse TypeScript/JavaScript source for API documentation
     */
    parseSource(_source: string, _filename: string): any[];
    /**
     * Parse JSDoc comments
     */
    parseJSDoc(_comment: string): any;
}
/**
 * Content parser factory
 */
export declare class ContentParser {
    private markdownParser;
    private mdxParser;
    constructor(options?: MarkdownOptions);
    /**
     * Parse content based on type
     */
    parse(content: string, type: DocContentType): Promise<DocPage>;
    /**
     * Parse API documentation content
     */
    private parseApiContent;
}
export declare const defaultParser: ContentParser;
