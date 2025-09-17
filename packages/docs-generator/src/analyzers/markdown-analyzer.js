/**
 * @fileoverview Markdown analyzer for extracting documentation from markdown files
 */
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { isMarkdownFile, generateSlugFromPath, extractTitleFromContent, shouldExcludeDirectory, } from "./markdown-utils";
// Temporary local type definition (moved to ./types)
/**
 * Analyzes markdown files and extracts documentation pages
 */
export class MarkdownAnalyzer {
    constructor(config) {
        Object.defineProperty(this, "rootPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // private includePatterns: string[];
        Object.defineProperty(this, "excludePatterns", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.rootPath = config.rootPath;
        // this.includePatterns = config.includePatterns || ['**/*.md', '**/*.mdx'];
        this.excludePatterns = config.excludePatterns || [
            "**/node_modules/**",
            "**/dist/**",
            "**/build/**",
        ];
    }
    /**
     * Analyze markdown files and extract documentation pages
     */
    async analyzeMarkdownFiles() {
        const pages = [];
        const markdownFiles = await this.findMarkdownFiles();
        for (const filePath of markdownFiles) {
            try {
                const page = await this.analyzeMarkdownFile(filePath);
                if (page) {
                    pages.push(page);
                }
            }
            catch (error) {
                console.warn(`Warning: Failed to analyze markdown file ${filePath}:`, error);
            }
        }
        return pages;
    }
    /**
     * Find all markdown files in the project
     */
    async findMarkdownFiles() {
        const files = [];
        try {
            const entries = await fs.readdir(this.rootPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(this.rootPath, entry.name);
                if (entry.isDirectory() &&
                    !shouldExcludeDirectory(entry.name, this.excludePatterns)) {
                    const subFiles = await this.findMarkdownFilesInDirectory(fullPath);
                    files.push(...subFiles);
                }
                else if (entry.isFile() && isMarkdownFile(entry.name)) {
                    files.push(fullPath);
                }
            }
        }
        catch (error) {
            // Ignore errors
        }
        return files;
    }
    /**
     * Find markdown files in a directory recursively
     */
    async findMarkdownFilesInDirectory(dir) {
        const files = [];
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory() &&
                    !shouldExcludeDirectory(entry.name, this.excludePatterns)) {
                    const subFiles = await this.findMarkdownFilesInDirectory(fullPath);
                    files.push(...subFiles);
                }
                else if (entry.isFile() && isMarkdownFile(entry.name)) {
                    files.push(fullPath);
                }
            }
        }
        catch (error) {
            // Ignore errors
        }
        return files;
    }
    // helpers moved to ./markdown-utils
    /**
     * Analyze a single markdown file
     */
    async analyzeMarkdownFile(filePath) {
        try {
            const content = await fs.readFile(filePath, "utf-8");
            const { data, content: markdownContent } = matter(content);
            // Skip if file is marked as draft or private
            if (data.draft === true || data.private === true) {
                return null;
            }
            // Generate slug from file path
            const slug = generateSlugFromPath(this.rootPath, filePath);
            // Extract title from frontmatter or first heading
            const title = data.title || extractTitleFromContent(markdownContent) || "Untitled";
            // Determine content type
            const type = filePath.endsWith(".mdx") ? "mdx" : "markdown";
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
                    tags: Array.isArray(data.tags)
                        ? data.tags
                        : data.tags
                            ? [data.tags]
                            : [],
                    category: data.category,
                    version: data.version,
                    lastModified: data.lastModified,
                    order: data.order || 0,
                    published: data.published !== false,
                    ...data,
                },
                type,
                published: data.published !== false,
                order: data.order || 0,
            };
        }
        catch (error) {
            console.error(`Error analyzing markdown file ${filePath}:`, error);
            return null;
        }
    }
}
