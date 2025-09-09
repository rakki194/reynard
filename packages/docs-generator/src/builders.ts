import { PackageAnalyzer } from "./analyzers/package-analyzer";
import { TypeScriptAnalyzer } from "./analyzers/typescript-analyzer";
import { MarkdownAnalyzer } from "./analyzers/markdown-analyzer";
import { TemplateEngine } from "./templates/template-engine";
import type { GeneratorConfig } from "./config/types/core";
import type { PackageInfo } from "./config/types/package";
import { DocPage, DocSection } from "./types.js";

export async function analyzePackages(
  config: GeneratorConfig,
  packagePaths: string[],
): Promise<PackageInfo[]> {
  const packageAnalyzer = new PackageAnalyzer({
    name: "reynard-docs",
    path: config.outputPath,
    ...config,
  });
  const tsAnalyzer = new TypeScriptAnalyzer();
  const packageInfos: PackageInfo[] = [];

  for (const packagePath of packagePaths) {
    try {
      const packageInfo = await packageAnalyzer.analyze(packagePath);
      try {
        const apiInfo = await tsAnalyzer.analyze(packageInfo);
        packageInfo.api = apiInfo;
      } catch (error) {
        console.warn(
          `⚠️  Warning: Failed to analyze TypeScript API for ${packageInfo.name}:`,
          error,
        );
      }
      packageInfos.push(packageInfo);
    } catch (error) {
      console.error(`❌ Error analyzing package ${packagePath}:`, error);
    }
  }
  return packageInfos;
}

export async function generatePages(
  config: GeneratorConfig,
  packageInfos: PackageInfo[],
): Promise<DocPage[]> {
  const templateEngine = new TemplateEngine(config);
  const mdAnalyzer = new MarkdownAnalyzer(config);
  const pages: DocPage[] = [];

  for (const packageInfo of packageInfos) {
    const overviewPage =
      await templateEngine.renderPackageOverview(packageInfo);
    pages.push(overviewPage);
  }
  for (const packageInfo of packageInfos) {
    if (packageInfo.api && packageInfo.api.length > 0) {
      const apiPage = await templateEngine.renderApiPage(packageInfo);
      pages.push(apiPage);
    }
  }
  for (const packageInfo of packageInfos) {
    if (packageInfo.examples && packageInfo.examples.length > 0) {
      const examplePage = await templateEngine.renderExamplePage(packageInfo);
      pages.push(examplePage);
    }
  }
  const markdownPages = await mdAnalyzer.analyzeMarkdownFiles();
  pages.push(...markdownPages);
  return pages;
}

export async function generateSections(
  packageInfos: PackageInfo[],
): Promise<DocSection[]> {
  const sections: DocSection[] = [];
  const categories = new Map<string, PackageInfo[]>();
  for (const packageInfo of packageInfos) {
    const category = packageInfo.category || "Other";
    if (!categories.has(category)) categories.set(category, []);
    categories.get(category)!.push(packageInfo);
  }
  let order = 0;
  for (const [category, packages] of categories) {
    const section: DocSection = {
      id: generateSlug(category),
      title: category,
      description: `Documentation for ${category.toLowerCase()} packages`,
      pages: packages.map((pkg) => ({
        id: pkg.name,
        slug: pkg.name,
        title: pkg.displayName || pkg.name,
        content: "",
        metadata: {
          title: pkg.displayName || pkg.name,
          description: pkg.description,
          version: pkg.version,
          category: pkg.category,
        },
        type: "markdown",
        order: order++,
      })),
      order: order,
    };
    sections.push(section);
  }
  return sections;
}

export function generateExamples(packageInfos: PackageInfo[]): any[] {
  const examples: any[] = [];
  for (const packageInfo of packageInfos) {
    if (packageInfo.examples) examples.push(...packageInfo.examples);
  }
  return examples;
}

export function generateApiDocs(packageInfos: PackageInfo[]): any[] {
  const apiDocs: any[] = [];
  for (const packageInfo of packageInfos) {
    if (packageInfo.api) apiDocs.push(...packageInfo.api);
  }
  return apiDocs;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
