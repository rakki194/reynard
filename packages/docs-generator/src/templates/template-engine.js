/**
 * @fileoverview Template engine for generating documentation pages
 */
import { PackageOverviewGenerator, ApiDocumentationGenerator, ExampleDocumentationGenerator, } from "./content-generators/index";
/**
 * Template engine for generating documentation pages
 */
export class TemplateEngine {
    constructor(_config) {
        Object.defineProperty(this, "packageOverviewGenerator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "apiDocumentationGenerator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "exampleDocumentationGenerator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.packageOverviewGenerator = new PackageOverviewGenerator();
        this.apiDocumentationGenerator = new ApiDocumentationGenerator();
        this.exampleDocumentationGenerator = new ExampleDocumentationGenerator();
    }
    /**
     * Render package overview page
     */
    async renderPackageOverview(packageInfo) {
        const content = this.packageOverviewGenerator.generateContent(packageInfo);
        return {
            id: packageInfo.name,
            slug: packageInfo.name,
            title: packageInfo.displayName || packageInfo.name,
            content,
            metadata: {
                title: packageInfo.displayName || packageInfo.name,
                description: packageInfo.description,
                version: packageInfo.version,
                category: packageInfo.category,
                tags: packageInfo.keywords,
                author: packageInfo.author?.name,
                lastModified: new Date().toISOString(),
            },
            type: "markdown",
        };
    }
    /**
     * Render API documentation page
     */
    async renderApiPage(packageInfo) {
        const content = this.apiDocumentationGenerator.generateContent(packageInfo);
        return {
            id: `${packageInfo.name}-api`,
            slug: `${packageInfo.name}/api`,
            title: `${packageInfo.displayName || packageInfo.name} API`,
            content,
            metadata: {
                title: `${packageInfo.displayName || packageInfo.name} API`,
                description: `API documentation for ${packageInfo.name}`,
                version: packageInfo.version,
                category: packageInfo.category,
                tags: [...packageInfo.keywords, "api", "documentation"],
            },
            type: "markdown",
        };
    }
    /**
     * Render examples page
     */
    async renderExamplePage(packageInfo) {
        const content = this.exampleDocumentationGenerator.generateContent(packageInfo);
        return {
            id: `${packageInfo.name}-examples`,
            slug: `${packageInfo.name}/examples`,
            title: `${packageInfo.displayName || packageInfo.name} Examples`,
            content,
            metadata: {
                title: `${packageInfo.displayName || packageInfo.name} Examples`,
                description: `Code examples for ${packageInfo.name}`,
                version: packageInfo.version,
                category: packageInfo.category,
                tags: [...packageInfo.keywords, "examples", "code"],
            },
            type: "markdown",
        };
    }
}
