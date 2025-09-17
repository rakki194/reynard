/**
 * 🦊 Main Diagram Generator
 *
 * Orchestrates the entire diagram generation process, coordinating
 * codebase analysis, diagram generation, and rendering.
 */

import { CodebaseAnalyzer } from "./CodebaseAnalyzer.js";
import { MermaidRenderer } from "./MermaidRenderer.js";
import { DIAGRAM_GENERATORS } from "../generators/index.js";
import type {
  DiagramGenerationConfig,
  DiagramGenerationResult,
  DiagramOutput,
  GenerationError,
  DiagramGenerator,
} from "../types.js";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export class DiagramGeneratorMain {
  private analyzer: CodebaseAnalyzer;
  private renderer: MermaidRenderer;
  private generators: Map<string, DiagramGenerator>;

  constructor(rootPath: string = "/home/kade/runeset/reynard") {
    this.analyzer = new CodebaseAnalyzer(rootPath);
    this.renderer = new MermaidRenderer();
    this.generators = new Map();

    // Initialize generators
    for (const GeneratorClass of DIAGRAM_GENERATORS) {
      const generator = new GeneratorClass();
      this.generators.set(generator.type, generator);
    }
  }

  /**
   * Generate all diagrams for the project
   */
  async generateAll(config: DiagramGenerationConfig): Promise<DiagramGenerationResult> {
    console.log("🦊 Starting comprehensive diagram generation...");
    const startTime = Date.now();

    try {
      // Analyze codebase
      console.log("📊 Analyzing codebase...");
      const analysis = await this.analyzer.analyzeCodebase();

      // Ensure output directory exists
      await mkdir(config.outputDir, { recursive: true });

      // Generate diagrams
      const diagrams: DiagramOutput[] = [];
      const errors: GenerationError[] = [];

      for (const [type, generator] of this.generators) {
        try {
          console.log(`🎨 Generating ${type} diagram...`);

          if (!generator.validate(analysis)) {
            console.warn(`⚠️ Skipping ${type} - validation failed`);
            continue;
          }

          const diagram = await generator.generate(analysis, config);

          // Render to different formats
          if (config.generateSvg) {
            diagram.svgContent = await this.renderer.renderToSvg(diagram.mermaidContent);
            diagram.outputPaths.svg = join(config.outputDir, `${type}.svg`);
            await writeFile(diagram.outputPaths.svg, diagram.svgContent);
          }

          if (config.generatePng) {
            diagram.pngContent = await this.renderer.renderToPng(diagram.mermaidContent);
            diagram.outputPaths.png = join(config.outputDir, `${type}.png`);
            await writeFile(diagram.outputPaths.png, diagram.pngContent, "base64");
          }

          if (config.generateHighRes) {
            diagram.highResPngContent = await this.renderer.renderToHighResPng(diagram.mermaidContent);
            diagram.outputPaths.highResPng = join(config.outputDir, `${type}-high-res.png`);
            await writeFile(diagram.outputPaths.highResPng, diagram.highResPngContent, "base64");
          }

          // Always save Mermaid source
          diagram.outputPaths.mermaid = join(config.outputDir, `${type}.mmd`);
          await writeFile(diagram.outputPaths.mermaid, diagram.mermaidContent);

          diagrams.push(diagram);
          console.log(`✅ Generated ${type} diagram`);
        } catch (error) {
          console.error(`❌ Failed to generate ${type} diagram:`, error);
          errors.push({
            type: "generation_error",
            message: `Failed to generate ${type} diagram: ${error}`,
            context: { diagramType: type, error: String(error) },
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Generate summary report
      await this.generateSummaryReport(diagrams, analysis, config);

      const totalTime = Date.now() - startTime;
      console.log(`🎉 Diagram generation complete! Generated ${diagrams.length} diagrams in ${totalTime}ms`);

      return {
        diagrams,
        summary: {
          totalDiagrams: diagrams.length,
          successfulGenerations: diagrams.length,
          failedGenerations: errors.length,
          totalTime,
          outputDirectory: config.outputDir,
        },
        errors,
      };
    } catch (error) {
      console.error("❌ Diagram generation failed:", error);
      return {
        diagrams: [],
        summary: {
          totalDiagrams: 0,
          successfulGenerations: 0,
          failedGenerations: 1,
          totalTime: Date.now() - startTime,
          outputDirectory: config.outputDir,
        },
        errors: [
          {
            type: "fatal_error",
            message: `Fatal error during diagram generation: ${error}`,
            context: { error: String(error) },
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }
  }

  /**
   * Generate a specific diagram type
   */
  async generateDiagram(diagramType: string, config: DiagramGenerationConfig): Promise<DiagramOutput | null> {
    const generator = this.generators.get(diagramType);
    if (!generator) {
      throw new Error(`Unknown diagram type: ${diagramType}`);
    }

    const analysis = await this.analyzer.analyzeCodebase();

    if (!generator.validate(analysis)) {
      throw new Error(`Validation failed for diagram type: ${diagramType}`);
    }

    const diagram = await generator.generate(analysis, config);

    // Render to requested formats
    if (config.generateSvg) {
      diagram.svgContent = await this.renderer.renderToSvg(diagram.mermaidContent);
    }

    if (config.generatePng) {
      diagram.pngContent = await this.renderer.renderToPng(diagram.mermaidContent);
    }

    if (config.generateHighRes) {
      diagram.highResPngContent = await this.renderer.renderToHighResPng(diagram.mermaidContent);
    }

    return diagram;
  }

  /**
   * Generate summary report
   */
  private async generateSummaryReport(
    diagrams: DiagramOutput[],
    analysis: any,
    config: DiagramGenerationConfig
  ): Promise<void> {
    const report = {
      generatedAt: new Date().toISOString(),
      totalDiagrams: diagrams.length,
      totalPackages: analysis.packages.length,
      totalComponents: analysis.components.length,
      totalFiles: analysis.fileStructure.totalFiles,
      totalDependencies: analysis.dependencies.length,
      diagrams: diagrams.map(d => ({
        type: d.metadata.type,
        title: d.metadata.title,
        nodeCount: d.metadata.nodeCount,
        edgeCount: d.metadata.edgeCount,
        complexityScore: d.metadata.complexityScore,
        outputPaths: d.outputPaths,
      })),
      analysis: {
        packages: analysis.packages.map((p: any) => ({
          name: p.name,
          type: p.type,
          importance: p.importance,
          componentCount: p.components.length,
          fileCount: p.files.length,
        })),
        dependencies: analysis.dependencies.map((d: any) => ({
          name: d.name,
          type: d.type,
          usageCount: d.usageCount,
        })),
      },
    };

    const reportPath = join(config.outputDir, "generation-report.json");
    await writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📋 Generated summary report: ${reportPath}`);
  }

  /**
   * Get available diagram types
   */
  getAvailableDiagramTypes(): string[] {
    return Array.from(this.generators.keys());
  }

  /**
   * Get generator information
   */
  getGeneratorInfo(diagramType: string): { name: string; description: string } | null {
    const generator = this.generators.get(diagramType);
    if (!generator) return null;

    return {
      name: generator.name,
      description: generator.description,
    };
  }
}
