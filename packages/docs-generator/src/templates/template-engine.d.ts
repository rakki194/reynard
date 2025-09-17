/**
 * @fileoverview Template engine for generating documentation pages
 */
interface DocPage {
    id: string;
    slug: string;
    title: string;
    content: string;
    metadata: Record<string, unknown>;
    type: string;
    published?: boolean;
    order?: number;
}
import type { PackageInfo } from "../config/types/package";
/**
 * Template engine for generating documentation pages
 */
export declare class TemplateEngine {
    private packageOverviewGenerator;
    private apiDocumentationGenerator;
    private exampleDocumentationGenerator;
    constructor(_config: any);
    /**
     * Render package overview page
     */
    renderPackageOverview(packageInfo: PackageInfo): Promise<DocPage>;
    /**
     * Render API documentation page
     */
    renderApiPage(packageInfo: PackageInfo): Promise<DocPage>;
    /**
     * Render examples page
     */
    renderExamplePage(packageInfo: PackageInfo): Promise<DocPage>;
}
export {};
