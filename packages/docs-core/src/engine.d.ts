/**
 * @fileoverview Main documentation engine for Reynard
 */
import type { DocEngine, DocEngineConfig, DocPage, DocSection, DocPlugin, DocContentType } from "./types";
/**
 * Main documentation engine class
 */
export declare class ReynardDocEngine implements DocEngine {
    config: DocEngineConfig;
    private parser;
    private plugins;
    constructor(config: DocEngineConfig);
    /**
     * Initialize the documentation engine
     */
    private initializeEngine;
    /**
     * Install default plugins
     */
    private installDefaultPlugins;
    /**
     * Initialize custom components
     */
    private initializeCustomComponents;
    /**
     * Render a documentation page
     */
    render(page: DocPage): (props: any) => any;
    /**
     * Parse content into a documentation page
     */
    parse(content: string, type: DocContentType): Promise<DocPage>;
    /**
     * Search through documentation pages
     */
    search(query: string): DocPage[];
    /**
     * Get a page by ID
     */
    getPage(id: string): DocPage | undefined;
    /**
     * Get a section by ID
     */
    getSection(id: string): DocSection | undefined;
    /**
     * Add a plugin to the engine
     */
    addPlugin(plugin: DocPlugin): void;
    /**
     * Remove a plugin from the engine
     */
    removePlugin(name: string): void;
    /**
     * Get all pages in a section
     */
    getPagesInSection(sectionId: string): DocPage[];
    /**
     * Get navigation structure
     */
    getNavigation(): import("./types").DocNavigation;
    /**
     * Get breadcrumb trail for a page
     */
    getBreadcrumbs(pageId: string): Array<{
        label: string;
        href: string;
    }>;
    /**
     * Get related pages
     */
    getRelatedPages(pageId: string, limit?: number): DocPage[];
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<DocEngineConfig>): void;
    /**
     * Get engine statistics
     */
    getStats(): {
        totalPages: number;
        totalSections: number;
        totalExamples: number;
        totalApiDocs: number;
        installedPlugins: string[];
    };
}
/**
 * Create a new documentation engine instance
 */
export declare function createDocEngine(config: DocEngineConfig): DocEngine;
/**
 * Default documentation engine configuration
 */
export declare const defaultDocConfig: Partial<DocEngineConfig>;
