/**
 * @fileoverview Main documentation generator orchestrator
 */

import path from "path";
import chokidar from "chokidar";
import type { GeneratorConfig } from "./config/types/core";
import type {
  PackageConfig,
  TemplateConfig,
  ExampleConfig,
} from "./config/types/package";
import { DocEngineConfig } from "./types.js";
import { discoverPackages } from "./discovery";
import {
  analyzePackages,
  generatePages,
  generateSections,
  generateExamples,
  generateApiDocs,
} from "./builders";
import { writeOutput } from "./output/html";

export class ReynardDocGenerator {
  private config: GeneratorConfig;
  private isWatching: boolean = false;

  constructor(config: GeneratorConfig) {
    this.config = config;
  }

  async generate(): Promise<DocEngineConfig> {
    const packages = await discoverPackages(this.config);
    const packageInfos = await analyzePackages(this.config, packages);
    const pages = await generatePages(this.config, packageInfos);
    const sections = await generateSections(packageInfos);
    const examples = generateExamples(packageInfos);
    const api = generateApiDocs(packageInfos);

    const docConfig: DocEngineConfig = {
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

  async watch(): Promise<void> {
    if (this.isWatching) return;
    this.isWatching = true;

    const watchPaths = [
      ...(this.config.packages || []).map((pkg: PackageConfig) =>
        path.join(pkg.path || "", "**/*"),
      ),
      ...(this.config.templates || []).map((template: TemplateConfig) =>
        path.join(template.path, "**/*"),
      ),
      ...(this.config.examples || []).map((example: ExampleConfig) =>
        path.join(example.path, "**/*"),
      ),
    ];

    const watcher = chokidar.watch(watchPaths, {
      ignored: /(^|[\\/])\../,
      persistent: true,
      ignoreInitial: true,
    });

    const regenerate = async () => {
      try {
        await this.generate();
      } catch (err) {
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

export function createDocGenerator(
  config: GeneratorConfig,
): ReynardDocGenerator {
  return new ReynardDocGenerator(config);
}
