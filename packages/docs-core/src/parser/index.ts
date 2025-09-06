/**
 * @fileoverview Markdown and content parsers for Reynard documentation
 */

import { marked } from 'marked';
import matter from 'gray-matter';
import hljs from 'highlight.js';
import type { 
  DocPage, 
  DocMetadata, 
  DocContentType, 
  MarkdownOptions 
} from '../types';

/**
 * Enhanced markdown parser with syntax highlighting and custom features
 */
export class MarkdownParser {
  private options: MarkdownOptions;

  constructor(options: MarkdownOptions = {}) {
    this.options = {
      breaks: true,
      gfm: true,
      tables: true,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: true,
      highlight: this.highlightCode.bind(this),
      ...options
    };

    this.setupMarked();
  }

  /**
   * Parse markdown content with frontmatter
   */
  parse(content: string, type: DocContentType = 'markdown'): DocPage {
    const { data, content: markdownContent } = matter(content);
    
    const metadata: DocMetadata = {
      title: data.title || 'Untitled',
      description: data.description,
      author: data.author,
      date: data.date,
      tags: data.tags || [],
      category: data.category,
      version: data.version,
      lastModified: data.lastModified,
      ...data
    };

    const html = this.parseMarkdown(markdownContent);
    const slug = this.generateSlug(metadata.title);

    return {
      id: slug,
      slug,
      title: metadata.title,
      content: html,
      metadata,
      type,
      published: data.published !== false,
      order: data.order || 0
    };
  }

  /**
   * Parse markdown to HTML
   */
  private parseMarkdown(content: string): string {
    return marked(content, this.options);
  }

  /**
   * Setup marked with custom renderer
   */
  private setupMarked(): void {
    const renderer = new marked.Renderer();

    // Custom code block rendering
    renderer.code = (code: string, language: string) => {
      const highlighted = this.options.highlight?.(code, language) || code;
      return `
        <div class="code-block" data-language="${language}">
          <div class="code-header">
            <span class="language-label">${language || 'text'}</span>
            <button class="copy-button" onclick="copyCode(this)">Copy</button>
          </div>
          <pre><code class="hljs language-${language}">${highlighted}</code></pre>
        </div>
      `;
    };

    // Custom blockquote rendering
    renderer.blockquote = (quote: string) => {
      return `<blockquote class="doc-blockquote">${quote}</blockquote>`;
    };

    // Custom table rendering
    renderer.table = (header: string, body: string) => {
      return `
        <div class="table-wrapper">
          <table class="doc-table">
            <thead>${header}</thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      `;
    };

    // Custom link rendering with external link detection
    renderer.link = (href: string, title: string, text: string) => {
      const isExternal = href.startsWith('http') || href.startsWith('//');
      const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      const titleAttr = title ? ` title="${title}"` : '';
      
      return `<a href="${href}"${titleAttr}${target} class="doc-link ${isExternal ? 'external' : ''}">${text}</a>`;
    };

    // Custom heading rendering with anchor links
    renderer.heading = (text: string, level: number) => {
      const id = this.generateSlug(text);
      return `
        <h${level} id="${id}" class="doc-heading doc-heading--${level}">
          <a href="#${id}" class="heading-anchor" aria-label="Link to ${text}">
            ${text}
          </a>
        </h${level}>
      `;
    };

    marked.setOptions({
      renderer,
      ...this.options
    });
  }

  /**
   * Syntax highlighting for code blocks
   */
  private highlightCode(code: string, language: string): string {
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(code, { language }).value;
      } catch (err) {
        console.warn(`Failed to highlight ${language}:`, err);
      }
    }
    
    // Fallback to auto-detection
    try {
      return hljs.highlightAuto(code).value;
    } catch (err) {
      return code;
    }
  }

  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}

/**
 * MDX parser for React/SolidJS components in markdown
 */
export class MDXParser {
  private markdownParser: MarkdownParser;

  constructor(options: MarkdownOptions = {}) {
    this.markdownParser = new MarkdownParser(options);
  }

  /**
   * Parse MDX content with component support
   */
  parse(content: string): DocPage {
    // For now, we'll use the markdown parser
    // In a full implementation, you'd use @mdx-js/mdx
    return this.markdownParser.parse(content, 'mdx');
  }

  /**
   * Extract components from MDX content
   */
  extractComponents(content: string): string[] {
    const componentRegex = /<(\w+)(?:\s|>)/g;
    const components: string[] = [];
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
  parseSource(source: string, filename: string): any[] {
    // This would integrate with TypeScript compiler API
    // to extract type information, JSDoc comments, etc.
    // For now, return empty array
    return [];
  }

  /**
   * Parse JSDoc comments
   */
  parseJSDoc(comment: string): any {
    // Parse JSDoc comments into structured data
    return {};
  }
}

/**
 * Content parser factory
 */
export class ContentParser {
  private markdownParser: MarkdownParser;
  private mdxParser: MDXParser;
  private apiParser: ApiParser;

  constructor(options: MarkdownOptions = {}) {
    this.markdownParser = new MarkdownParser(options);
    this.mdxParser = new MDXParser(options);
    this.apiParser = new ApiParser();
  }

  /**
   * Parse content based on type
   */
  parse(content: string, type: DocContentType): DocPage {
    switch (type) {
      case 'markdown':
        return this.markdownParser.parse(content, type);
      case 'mdx':
        return this.mdxParser.parse(content);
      case 'api':
        // Handle API documentation parsing
        return this.parseApiContent(content);
      default:
        return this.markdownParser.parse(content, type);
    }
  }

  /**
   * Parse API documentation content
   */
  private parseApiContent(content: string): DocPage {
    // Parse API documentation
    return {
      id: 'api',
      slug: 'api',
      title: 'API Documentation',
      content,
      metadata: { title: 'API Documentation' },
      type: 'api'
    };
  }
}

// Export default parser instance
export const defaultParser = new ContentParser();
