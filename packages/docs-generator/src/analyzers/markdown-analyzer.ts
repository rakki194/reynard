/**
 * @fileoverview Markdown analyzer for extracting documentation from markdown files
 */

import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
// import { DocPage } from 'reynard-docs-core';

// Temporary local type definition
interface DocPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  metadata: any;
  type: string;
  published: boolean;
  order: number;
}

/**
 * Analyzes markdown files and extracts documentation pages
 */
export class MarkdownAnalyzer {
  private rootPath: string;
  // private includePatterns: string[];
  private excludePatterns: string[];

  constructor(config: {
    rootPath: string;
    includePatterns?: string[];
    excludePatterns?: string[];
  }) {
    this.rootPath = config.rootPath;
    // this.includePatterns = config.includePatterns || ['**/*.md', '**/*.mdx'];
    this.excludePatterns = config.excludePatterns || ['**/node_modules/**', '**/dist/**', '**/build/**'];
  }

  /**
   * Analyze markdown files and extract documentation pages
   */
  async analyzeMarkdownFiles(): Promise<DocPage[]> {
    const pages: DocPage[] = [];
    const markdownFiles = await this.findMarkdownFiles();

    for (const filePath of markdownFiles) {
      try {
        const page = await this.analyzeMarkdownFile(filePath);
        if (page) {
          pages.push(page);
        }
      } catch (error) {
        console.warn(`Warning: Failed to analyze markdown file ${filePath}:`, error);
      }
    }

    return pages;
  }

  /**
   * Find all markdown files in the project
   */
  private async findMarkdownFiles(): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(this.rootPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(this.rootPath, entry.name);
        
        if (entry.isDirectory() && !this.shouldExcludeDirectory(entry.name)) {
          const subFiles = await this.findMarkdownFilesInDirectory(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && this.isMarkdownFile(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return files;
  }

  /**
   * Find markdown files in a directory recursively
   */
  private async findMarkdownFilesInDirectory(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !this.shouldExcludeDirectory(entry.name)) {
          const subFiles = await this.findMarkdownFilesInDirectory(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && this.isMarkdownFile(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return files;
  }

  /**
   * Check if a directory should be excluded
   */
  private shouldExcludeDirectory(dirName: string): boolean {
    return this.excludePatterns.some(pattern => {
      if (pattern.includes('**')) {
        return dirName.includes(pattern.replace('**/', '').replace('/**', ''));
      }
      return dirName === pattern;
    });
  }

  /**
   * Check if a file is a markdown file
   */
  private isMarkdownFile(fileName: string): boolean {
    return fileName.endsWith('.md') || fileName.endsWith('.mdx');
  }

  /**
   * Analyze a single markdown file
   */
  private async analyzeMarkdownFile(filePath: string): Promise<DocPage | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const { data, content: markdownContent } = matter(content);
      
      // Skip if file is marked as draft or private
      if (data.draft === true || data.private === true) {
        return null;
      }

      // Generate slug from file path
      const slug = this.generateSlugFromPath(filePath);
      
      // Extract title from frontmatter or first heading
      const title = data.title || this.extractTitleFromContent(markdownContent) || 'Untitled';
      
      // Determine content type
      const type = filePath.endsWith('.mdx') ? 'mdx' : 'markdown';

      return {
        id: slug,
        slug,
        title,
        content: markdownContent,
        metadata: {
          title,
          description: data.description,
          author: data.author,
          date: data.date,
          tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
          category: data.category,
          version: data.version,
          lastModified: data.lastModified,
          order: data.order || 0,
          published: data.published !== false,
          ...data
        },
        type,
        published: data.published !== false,
        order: data.order || 0
      };
    } catch (error) {
      console.error(`Error analyzing markdown file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Generate slug from file path
   */
  private generateSlugFromPath(filePath: string): string {
    const relativePath = path.relative(this.rootPath, filePath);
    const pathWithoutExt = relativePath.replace(/\.(md|mdx)$/, '');
    
    return pathWithoutExt
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Extract title from markdown content
   */
  private extractTitleFromContent(content: string): string | null {
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Look for first heading
      if (trimmed.startsWith('# ')) {
        return trimmed.substring(2).trim();
      }
      
      // Skip empty lines and frontmatter
      if (trimmed === '' || trimmed.startsWith('---')) {
        continue;
      }
      
      // Return first non-empty line as title
      return trimmed;
    }
    
    return null;
  }
}
