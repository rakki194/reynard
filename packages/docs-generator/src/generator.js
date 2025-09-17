/**
 * @fileoverview Main documentation generator orchestrator
 */
import path from "path";
import chokidar from "chokidar";
import { discoverPackages } from "./discovery";
import { analyzePackages, generatePages, generateSections, generateExamples, generateApiDocs, } from "./builders";
import { writeOutput } from "./output/html";
export class ReynardDocGenerator {
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isWatching", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.config = config;
    }
    async generate() {
        const packages = await discoverPackages(this.config);
        const packageInfos = await analyzePackages(this.config, packages);
        const pages = await generatePages(this.config, packageInfos);
        const sections = await generateSections(packageInfos);
        const examples = generateExamples(packageInfos);
        const api = generateApiDocs(packageInfos);
        const docConfig = {
            site: {
                title: this.config.site.title,
                description: this.config.site.description,
                baseUrl: this.config.site.baseUrl,
                logo: this.config.site.logo,
                favicon: this.config.site.favicon,
                theme: this.config.theme,
                navigation: this.config.navigation,
                footer: this.config.footer,
                search: this.config.search,
                analytics: this.config.analytics,
                social: this.config.social,
            },
            pages,
            sections,
            examples,
            api,
            customComponents: this.config.customComponents,
            plugins: this.config.plugins,
        };
        await writeOutput(this.config, docConfig);
        return docConfig;
    }
    async watch() {
        if (this.isWatching)
            return;
        this.isWatching = true;
        const watchPaths = [
            ...(this.config.packages || []).map((pkg) => path.join(pkg.path || "", "**/*")),
            ...(this.config.templates || []).map((template) => path.join(template.path, "**/*")),
            ...(this.config.examples || []).map((example) => path.join(example.path, "**/*")),
        ];
        const watcher = chokidar.watch(watchPaths, {
            ignored: /(^|[\\/])\../,
            persistent: true,
            ignoreInitial: true,
        });
        const regenerate = async () => {
            try {
                await this.generate();
            }
            catch (err) {
                console.error("Regeneration failed:", err);
            }
        };
        watcher.on("change", regenerate);
        watcher.on("add", regenerate);
        watcher.on("unlink", regenerate);
        process.on("SIGINT", () => {
            watcher.close();
            this.isWatching = false;
            process.exit(0);
        });
    }
}
export function createDocGenerator(config) {
    return new ReynardDocGenerator(config);
}
