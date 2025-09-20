/**
 * Main documentation engine class
 */
export declare class ReynardDocEngine {
    constructor(config: any);
    /**
     * Initialize the documentation engine
     */
    initializeEngine(): void;
    /**
     * Install default plugins
     */
    installDefaultPlugins(): void;
    /**
     * Initialize custom components
     */
    initializeCustomComponents(): void;
    /**
     * Render a documentation page
     */
    render(page: any): (props: any) => any;
    /**
     * Parse content into a documentation page
     */
    parse(content: any, type: any): Promise<any>;
    /**
     * Search through documentation pages
     */
    search(query: any): any[];
    /**
     * Get a page by ID
     */
    getPage(id: any): any;
    /**
     * Get a section by ID
     */
    getSection(id: any): any;
    /**
     * Add a plugin to the engine
     */
    addPlugin(plugin: any): void;
    /**
     * Remove a plugin from the engine
     */
    removePlugin(name: any): void;
    /**
     * Get all pages in a section
     */
    getPagesInSection(sectionId: any): any;
    /**
     * Get navigation structure
     */
    getNavigation(): any;
    /**
     * Get breadcrumb trail for a page
     */
    getBreadcrumbs(pageId: any): {
        label: any;
        href: string;
    }[];
    /**
     * Get related pages
     */
    getRelatedPages(pageId: any, limit?: number): any[];
    /**
     * Update configuration
     */
    updateConfig(newConfig: any): void;
    /**
     * Get engine statistics
     */
    getStats(): {
        totalPages: any;
        totalSections: any;
        totalExamples: any;
        totalApiDocs: any;
        installedPlugins: unknown[];
    };
}
/**
 * Create a new documentation engine instance
 */
export declare function createDocEngine(config: any): ReynardDocEngine;
/**
 * Default documentation engine configuration
 */
export declare const defaultDocConfig: {
    site: {
        title: string;
        description: string;
        baseUrl: string;
        theme: {
            name: string;
            primaryColor: string;
            secondaryColor: string;
            backgroundColor: string;
            textColor: string;
            accentColor: string;
        };
        navigation: {
            main: never[];
            breadcrumbs: boolean;
            sidebar: boolean;
        };
    };
    pages: never[];
    sections: never[];
    examples: never[];
    api: never[];
    plugins: never[];
};
