/**
 * @fileoverview Markdown and content parsers for Reynard documentation
 */
import { marked } from "marked";
import matter from "gray-matter";
import hljs from "highlight.js";
/**
 * Enhanced markdown parser with syntax highlighting and custom features
 */
export class MarkdownParser {
    constructor(options = {}) {
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.options = {
            breaks: true,
            gfm: true,
            tables: true,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: true,
            highlight: this.highlightCode.bind(this),
            ...options,
        };
        this.setupMarked();
    }
    /**
     * Parse markdown content with frontmatter
     */
    async parse(content, type = "markdown") {
        const { data, content: markdownContent } = matter(content);
        const metadata = {
            title: data.title || "Untitled",
            description: data.description,
            author: data.author,
            date: data.date,
            tags: data.tags || [],
            category: data.category,
            version: data.version,
            lastModified: data.lastModified,
            ...data,
        };
        const html = await this.parseMarkdown(markdownContent);
        const slug = this.generateSlug(metadata.title);
        return {
            id: slug,
            slug,
            title: metadata.title,
            content: html,
            metadata,
            type,
            published: data.published !== false,
            order: data.order || 0,
        };
    }
    /**
     * Parse markdown to HTML
     */
    async parseMarkdown(content) {
        return await marked(content, this.options);
    }
    /**
     * Setup marked with custom renderer
     */
    setupMarked() {
        const renderer = new marked.Renderer();
        // Custom code block rendering
        renderer.code = ({ text, lang }) => {
            const highlighted = this.options.highlight?.(text, lang || "text") || text;
            return `
        <div class="code-block" data-language="${lang}">
          <div class="code-header">
            <span class="language-label">${lang || "text"}</span>
            <button class="copy-button" onclick="copyCode(this)">Copy</button>
          </div>
          <pre><code class="hljs language-${lang}">${highlighted}</code></pre>
        </div>
      `;
        };
        // Custom blockquote rendering
        renderer.blockquote = ({ tokens }) => {
            return `<blockquote class="doc-blockquote">${tokens}</blockquote>`;
        };
        // Custom table rendering
        renderer.table = (token) => {
            return `
        <div class="table-wrapper">
          <table class="doc-table">
            <thead>${token.header}</thead>
            <tbody>${token.body}</tbody>
          </table>
        </div>
      `;
        };
        // Custom link rendering with external link detection
        renderer.link = ({ href, title, tokens, }) => {
            const isExternal = href.startsWith("http") || href.startsWith("//");
            const target = isExternal
                ? ' target="_blank" rel="noopener noreferrer"'
                : "";
            const titleAttr = title ? ` title="${title}"` : "";
            return `<a href="${href}"${titleAttr}${target} class="doc-link ${isExternal ? "external" : ""}">${tokens}</a>`;
        };
        // Custom heading rendering with anchor links
        renderer.heading = ({ tokens, depth, }) => {
            const id = this.generateSlug(tokens.toString());
            return `
        <h${depth} id="${id}" class="doc-heading doc-heading--${depth}">
          <a href="#${id}" class="heading-anchor" aria-label="Link to ${tokens}">
            ${tokens}
          </a>
        </h${depth}>
      `;
        };
        marked.setOptions({
            renderer,
            ...this.options,
        });
    }
    /**
     * Syntax highlighting for code blocks
     */
    highlightCode(code, language) {
        if (language && hljs.getLanguage(language)) {
            try {
                return hljs.highlight(code, { language }).value;
            }
            catch (err) {
                console.warn(`Failed to highlight ${language}:`, err);
            }
        }
        // Fallback to auto-detection
        try {
            return hljs.highlightAuto(code).value;
        }
        catch (err) {
            return code;
        }
    }
    /**
     * Generate URL-friendly slug from title
     */
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
    }
}
/**
 * MDX parser for React/SolidJS components in markdown
 */
export class MDXParser {
    constructor(options = {}) {
        Object.defineProperty(this, "markdownParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.markdownParser = new MarkdownParser(options);
    }
    /**
     * Parse MDX content with component support
     */
    async parse(content) {
        // For now, we'll use the markdown parser
        // In a full implementation, you'd use @mdx-js/mdx
        return await this.markdownParser.parse(content, "mdx");
    }
    /**
     * Extract components from MDX content
     */
    extractComponents(content) {
        const componentRegex = /<(\w+)(?:\s|>)/g;
        const components = [];
        let match;
        while ((match = componentRegex.exec(content)) !== null) {
            const componentName = match[1];
            if (!components.includes(componentName)) {
                components.push(componentName);
            }
        }
        return components;
    }
}
/**
 * API documentation parser
 */
export class ApiParser {
    /**
     * Parse TypeScript/JavaScript source for API documentation
     */
    parseSource(_source, _filename) {
        // This would integrate with TypeScript compiler API
        // to extract type information, JSDoc comments, etc.
        // For now, return empty array
        return [];
    }
    /**
     * Parse JSDoc comments
     */
    parseJSDoc(_comment) {
        // Parse JSDoc comments into structured data
        return {};
    }
}
/**
 * Content parser factory
 */
export class ContentParser {
    // private apiParser: ApiParser;
    constructor(options = {}) {
        Object.defineProperty(this, "markdownParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "mdxParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.markdownParser = new MarkdownParser(options);
        this.mdxParser = new MDXParser(options);
        // this.apiParser = new ApiParser();
    }
    /**
     * Parse content based on type
     */
    async parse(content, type) {
        switch (type) {
            case "markdown":
                return await this.markdownParser.parse(content, type);
            case "mdx":
                return await this.mdxParser.parse(content);
            case "api":
                // Handle API documentation parsing
                return this.parseApiContent(content);
            default:
                return await this.markdownParser.parse(content, type);
        }
    }
    /**
     * Parse API documentation content
     */
    parseApiContent(content) {
        // Parse API documentation
        return {
            id: "api",
            slug: "api",
            title: "API Documentation",
            content,
            metadata: { title: "API Documentation" },
            type: "api",
        };
    }
}
// Export default parser instance
export const defaultParser = new ContentParser();
