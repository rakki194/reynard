/**
 * @fileoverview Main documentation engine for Reynard
 */
// import { createSignal, createEffect } from 'solid-js';
import { ContentParser } from "./parser";
import { DocRenderer } from "./renderer";
/**
 * Main documentation engine class
 */
export class ReynardDocEngine {
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "parser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "plugins", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        this.config = config;
        this.parser = new ContentParser();
        this.initializeEngine();
    }
    /**
     * Initialize the documentation engine
     */
    initializeEngine() {
        // Install default plugins
        this.installDefaultPlugins();
        // Initialize custom components
        this.initializeCustomComponents();
    }
    /**
     * Install default plugins
     */
    installDefaultPlugins() {
        // Add default plugins here
    }
    /**
     * Initialize custom components
     */
    initializeCustomComponents() {
        // Register custom components for documentation
    }
    /**
     * Render a documentation page
     */
    render(page) {
        return (props) => (<DocRenderer content={page.content} metadata={page.metadata} type={page.type} {...props}/>);
    }
    /**
     * Parse content into a documentation page
     */
    async parse(content, type) {
        return await this.parser.parse(content, type);
    }
    /**
     * Search through documentation pages
     */
    search(query) {
        const results = [];
        const searchTerm = query.toLowerCase();
        for (const page of this.config.pages) {
            const searchableText = [
                page.title,
                page.metadata.description || "",
                page.content,
                ...(page.metadata.tags || []),
            ]
                .join(" ")
                .toLowerCase();
            if (searchableText.includes(searchTerm)) {
                results.push(page);
            }
        }
        return results.sort((a, b) => {
            // Sort by relevance (title matches first, then content)
            const aTitleMatch = a.title.toLowerCase().includes(searchTerm);
            const bTitleMatch = b.title.toLowerCase().includes(searchTerm);
            if (aTitleMatch && !bTitleMatch)
                return -1;
            if (!aTitleMatch && bTitleMatch)
                return 1;
            return 0;
        });
    }
    /**
     * Get a page by ID
     */
    getPage(id) {
        return this.config.pages.find((page) => page.id === id);
    }
    /**
     * Get a section by ID
     */
    getSection(id) {
        return this.config.sections.find((section) => section.id === id);
    }
    /**
     * Add a plugin to the engine
     */
    addPlugin(plugin) {
        this.plugins.set(plugin.name, plugin);
        plugin.install(this);
    }
    /**
     * Remove a plugin from the engine
     */
    removePlugin(name) {
        const plugin = this.plugins.get(name);
        if (plugin) {
            plugin.uninstall?.(this);
            this.plugins.delete(name);
        }
    }
    /**
     * Get all pages in a section
     */
    getPagesInSection(sectionId) {
        const section = this.getSection(sectionId);
        return section?.pages || [];
    }
    /**
     * Get navigation structure
     */
    getNavigation() {
        return this.config.site.navigation;
    }
    /**
     * Get breadcrumb trail for a page
     */
    getBreadcrumbs(pageId) {
        const page = this.getPage(pageId);
        if (!page)
            return [];
        const breadcrumbs = [];
        let currentPage = page;
        // Build breadcrumb trail
        while (currentPage) {
            breadcrumbs.unshift({
                label: currentPage.title,
                href: `/${currentPage.slug}`,
            });
            // Find parent page
            if (currentPage.parent) {
                const parentPage = this.getPage(currentPage.parent);
                if (parentPage) {
                    currentPage = parentPage;
                }
            }
            else {
                // Find parent section
                const parentSection = this.config.sections.find((section) => section.pages.some((p) => p.id === currentPage.id));
                if (parentSection) {
                    breadcrumbs.unshift({
                        label: parentSection.title,
                        href: `/sections/${parentSection.id}`,
                    });
                }
                break;
            }
        }
        return breadcrumbs;
    }
    /**
     * Get related pages
     */
    getRelatedPages(pageId, limit = 5) {
        const page = this.getPage(pageId);
        if (!page)
            return [];
        const related = [];
        const pageTags = page.metadata.tags || [];
        // Find pages with similar tags
        for (const otherPage of this.config.pages) {
            if (otherPage.id === pageId)
                continue;
            const otherTags = otherPage.metadata.tags || [];
            const commonTags = pageTags.filter((tag) => otherTags.includes(tag));
            if (commonTags.length > 0) {
                related.push(otherPage);
            }
        }
        // Sort by number of common tags
        related.sort((a, b) => {
            const aCommonTags = (a.metadata.tags || []).filter((tag) => pageTags.includes(tag)).length;
            const bCommonTags = (b.metadata.tags || []).filter((tag) => pageTags.includes(tag)).length;
            return bCommonTags - aCommonTags;
        });
        return related.slice(0, limit);
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    /**
     * Get engine statistics
     */
    getStats() {
        return {
            totalPages: this.config.pages.length,
            totalSections: this.config.sections.length,
            totalExamples: this.config.examples.length,
            totalApiDocs: this.config.api.length,
            installedPlugins: Array.from(this.plugins.keys()),
        };
    }
}
/**
 * Create a new documentation engine instance
 */
export function createDocEngine(config) {
    return new ReynardDocEngine(config);
}
/**
 * Default documentation engine configuration
 */
export const defaultDocConfig = {
    site: {
        title: "Reynard Documentation",
        description: "Beautiful documentation powered by Reynard framework",
        baseUrl: "/",
        theme: {
            name: "reynard-default",
            primaryColor: "#6366f1",
            secondaryColor: "#8b5cf6",
            backgroundColor: "#ffffff",
            textColor: "#1f2937",
            accentColor: "#f59e0b",
        },
        navigation: {
            main: [],
            breadcrumbs: true,
            sidebar: true,
        },
    },
    pages: [],
    sections: [],
    examples: [],
    api: [],
    plugins: [],
};
