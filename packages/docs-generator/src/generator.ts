/**
 * @fileoverview Main documentation generator class
 */

import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';
import chokidar from 'chokidar';
// import { DocEngineConfig, DocPage, DocSection } from 'reynard-docs-core';

// Temporary local type definitions
interface DocEngineConfig {
  rootPath?: string;
  outputPath?: string;
  packages?: any[];
  templates?: any[];
  examples?: any[];
  site?: any;
  theme?: any;
  navigation?: any;
  footer?: any;
  search?: any;
  analytics?: any;
  social?: any;
  pages?: any[];
  sections?: any[];
  api?: any[];
  [key: string]: any;
}

interface DocPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  metadata: any;
  type: string;
  published?: boolean;
  order?: number;
}

interface DocSection {
  id: string;
  title: string;
  description: string;
  pages: DocPage[];
  order: number;
}
import { PackageAnalyzer } from './analyzers/package-analyzer';
// import { TypeScriptAnalyzer } from './analyzers/typescript-analyzer';
import { MarkdownAnalyzer } from './analyzers/markdown-analyzer';
import { TemplateEngine } from './templates/template-engine';
import { GeneratorConfig, PackageInfo } from './config';

/**
 * Main documentation generator class
 */
export class ReynardDocGenerator {
  private config: GeneratorConfig;
  private packageAnalyzer: PackageAnalyzer;
  // private tsAnalyzer: TypeScriptAnalyzer;
  private mdAnalyzer: MarkdownAnalyzer;
  private templateEngine: TemplateEngine;
  private isWatching: boolean = false;

  constructor(config: GeneratorConfig) {
    this.config = config;
    this.packageAnalyzer = new PackageAnalyzer({
      name: 'reynard-docs',
      path: config.outputPath,
      ...config
    });
    // this.tsAnalyzer = new TypeScriptAnalyzer();
    this.mdAnalyzer = new MarkdownAnalyzer(config);
    this.templateEngine = new TemplateEngine(config);
  }

  /**
   * Generate documentation for all packages
   */
  async generate(): Promise<DocEngineConfig> {
    console.log('🦊 Starting Reynard documentation generation...');

    // Discover packages
    const packages = await this.discoverPackages();
    console.log(`📦 Found ${packages.length} packages`);

    // Analyze packages
    const packageInfos = await this.analyzePackages(packages);
    console.log(`🔍 Analyzed ${packageInfos.length} packages`);

    // Generate documentation pages
    const pages = await this.generatePages(packageInfos);
    console.log(`📄 Generated ${pages.length} documentation pages`);

    // Generate sections
    const sections = await this.generateSections(packageInfos);
    console.log(`📚 Generated ${sections.length} documentation sections`);

    // Generate examples
    const examples = await this.generateExamples(packageInfos);
    console.log(`🎯 Generated ${examples.length} code examples`);

    // Generate API documentation
    const apiDocs = await this.generateApiDocs(packageInfos);
    console.log(`🔧 Generated ${apiDocs.length} API documentation entries`);

    // Create final configuration
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
        social: this.config.social
      },
      pages,
      sections,
      examples,
      api: apiDocs,
      customComponents: this.config.customComponents,
      plugins: this.config.plugins
    };

    // Write output files
    await this.writeOutput(docConfig);
    console.log('✅ Documentation generation complete!');

    return docConfig;
  }

  /**
   * Watch for changes and regenerate documentation
   */
  async watch(): Promise<void> {
    if (this.isWatching) {
      console.log('👀 Already watching for changes');
      return;
    }

    this.isWatching = true;
    console.log('👀 Watching for changes...');

    const watchPaths = [
      ...(this.config.packages || []).map(pkg => path.join(pkg.path || '', '**/*')),
      ...(this.config.templates || []).map(template => path.join(template.path, '**/*')),
      ...(this.config.examples || []).map(example => path.join(example.path, '**/*'))
    ];

    const watcher = chokidar.watch(watchPaths, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true
    });

    watcher.on('change', async (filePath) => {
      console.log(`📝 File changed: ${filePath}`);
      try {
        await this.generate();
        console.log('🔄 Documentation regenerated');
      } catch (error) {
        console.error('❌ Error regenerating documentation:', error);
      }
    });

    watcher.on('add', async (filePath) => {
      console.log(`➕ File added: ${filePath}`);
      try {
        await this.generate();
        console.log('🔄 Documentation regenerated');
      } catch (error) {
        console.error('❌ Error regenerating documentation:', error);
      }
    });

    watcher.on('unlink', async (filePath) => {
      console.log(`➖ File removed: ${filePath}`);
      try {
        await this.generate();
        console.log('🔄 Documentation regenerated');
      } catch (error) {
        console.error('❌ Error regenerating documentation:', error);
      }
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping watcher...');
      watcher.close();
      this.isWatching = false;
      process.exit(0);
    });
  }

  /**
   * Discover packages in the workspace
   */
  private async discoverPackages(): Promise<string[]> {
    const packages: string[] = [];

    for (const packageConfig of this.config.packages) {
      if (packageConfig.path) {
        // Check if path exists
        try {
          await fs.access(packageConfig.path);
          packages.push(packageConfig.path);
        } catch (error) {
          console.warn(`⚠️  Package path not found: ${packageConfig.path}`);
        }
      } else if (packageConfig.pattern) {
        // Use glob pattern to find packages
        const matches = await glob(packageConfig.pattern, {
          cwd: this.config.rootPath,
          absolute: true
        });
        packages.push(...matches);
      }
    }

    return packages;
  }

  /**
   * Analyze discovered packages
   */
  private async analyzePackages(packagePaths: string[]): Promise<PackageInfo[]> {
    const packageInfos: PackageInfo[] = [];

    for (const packagePath of packagePaths) {
      try {
        const packageInfo = await this.packageAnalyzer.analyze(packagePath);
        packageInfos.push(packageInfo);
      } catch (error) {
        console.error(`❌ Error analyzing package ${packagePath}:`, error);
      }
    }

    return packageInfos;
  }

  /**
   * Generate documentation pages
   */
  private async generatePages(packageInfos: PackageInfo[]): Promise<DocPage[]> {
    const pages: DocPage[] = [];

    // Generate package overview pages
    for (const packageInfo of packageInfos) {
      const overviewPage = await this.templateEngine.renderPackageOverview(packageInfo);
      pages.push(overviewPage);
    }

    // Generate API documentation pages
    for (const packageInfo of packageInfos) {
      if (packageInfo.api && packageInfo.api.length > 0) {
        const apiPage = await this.templateEngine.renderApiPage(packageInfo);
        pages.push(apiPage);
      }
    }

    // Generate example pages
    for (const packageInfo of packageInfos) {
      if (packageInfo.examples && packageInfo.examples.length > 0) {
        const examplePage = await this.templateEngine.renderExamplePage(packageInfo);
        pages.push(examplePage);
      }
    }

    // Generate custom pages from markdown files
    const markdownPages = await this.mdAnalyzer.analyzeMarkdownFiles();
    pages.push(...markdownPages);

    return pages;
  }

  /**
   * Generate documentation sections
   */
  private async generateSections(packageInfos: PackageInfo[]): Promise<DocSection[]> {
    const sections: DocSection[] = [];

    // Create main sections based on package categories
    const categories = new Map<string, PackageInfo[]>();

    for (const packageInfo of packageInfos) {
      const category = packageInfo.category || 'Other';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(packageInfo);
    }

    let order = 0;
    for (const [category, packages] of categories) {
      const section: DocSection = {
        id: this.generateSlug(category),
        title: category,
        description: `Documentation for ${category.toLowerCase()} packages`,
        pages: packages.map(pkg => ({
          id: pkg.name,
          slug: pkg.name,
          title: pkg.displayName || pkg.name,
          content: '',
          metadata: {
            title: pkg.displayName || pkg.name,
            description: pkg.description,
            version: pkg.version,
            category: pkg.category
          },
          type: 'markdown',
          order: order++
        })),
        order: order
      };
      sections.push(section);
    }

    return sections;
  }

  /**
   * Generate code examples
   */
  private async generateExamples(packageInfos: PackageInfo[]): Promise<any[]> {
    const examples: any[] = [];

    for (const packageInfo of packageInfos) {
      if (packageInfo.examples) {
        examples.push(...packageInfo.examples);
      }
    }

    return examples;
  }

  /**
   * Generate API documentation
   */
  private async generateApiDocs(packageInfos: PackageInfo[]): Promise<any[]> {
    const apiDocs: any[] = [];

    for (const packageInfo of packageInfos) {
      if (packageInfo.api) {
        apiDocs.push(...packageInfo.api);
      }
    }

    return apiDocs;
  }

  /**
   * Write output files
   */
  private async writeOutput(docConfig: DocEngineConfig): Promise<void> {
    const outputPath = path.join(this.config.rootPath, this.config.outputPath);

    // Ensure output directory exists
    await fs.mkdir(outputPath, { recursive: true });

    // Write main configuration file
    const configPath = path.join(outputPath, 'docs-config.json');
    await fs.writeFile(configPath, JSON.stringify(docConfig, null, 2));

    // Write individual page files
    if (docConfig.pages) {
      for (const page of docConfig.pages) {
        const pagePath = path.join(outputPath, 'pages', `${page.slug}.json`);
        await fs.mkdir(path.dirname(pagePath), { recursive: true });
        await fs.writeFile(pagePath, JSON.stringify(page, null, 2));
      }
    }

    // Write section files
    if (docConfig.sections) {
      for (const section of docConfig.sections) {
        const sectionPath = path.join(outputPath, 'sections', `${section.id}.json`);
        await fs.mkdir(path.dirname(sectionPath), { recursive: true });
        await fs.writeFile(sectionPath, JSON.stringify(section, null, 2));
      }
    }

    // Write example files
    if (docConfig.examples) {
      for (const example of docConfig.examples) {
        const examplePath = path.join(outputPath, 'examples', `${example.id}.json`);
        await fs.mkdir(path.dirname(examplePath), { recursive: true });
        await fs.writeFile(examplePath, JSON.stringify(example, null, 2));
      }
    }

    // Write API documentation files
    if (docConfig.api) {
      for (const apiDoc of docConfig.api) {
        const apiPath = path.join(outputPath, 'api', `${apiDoc.name}.json`);
        await fs.mkdir(path.dirname(apiPath), { recursive: true });
        await fs.writeFile(apiPath, JSON.stringify(apiDoc, null, 2));
      }
    }

    console.log(`📁 Output written to: ${outputPath}`);
  }

  /**
   * Generate URL-friendly slug
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}

/**
 * Create a new documentation generator instance
 */
export function createDocGenerator(config: GeneratorConfig): ReynardDocGenerator {
  return new ReynardDocGenerator(config);
}
