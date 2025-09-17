/**
 * 🦊 Reynard Diagram Generator
 * 
 * Comprehensive diagram generation tool for the Reynard project.
 * Provides automated generation of Mermaid diagrams for architecture,
 * dependencies, components, and file structure visualization.
 */

// Core classes
export { DiagramGeneratorMain as DiagramGenerator } from './core/DiagramGenerator.js';
export { CodebaseAnalyzer } from './core/CodebaseAnalyzer.js';
export { MermaidRenderer } from './core/MermaidRenderer.js';

// Diagram generators
export {
  ArchitectureOverviewGenerator,
  PackageDependenciesGenerator,
  ComponentRelationshipsGenerator,
  FileStructureGenerator,
  DIAGRAM_GENERATORS
} from './generators/index.js';

// Types
export type {
  DiagramGenerationConfig,
  DiagramOutput,
  DiagramMetadata,
  DiagramType,
  CodebaseAnalysis,
  PackageAnalysis,
  ComponentAnalysis,
  FileAnalysis,
  DependencyAnalysis,
  FileStructureAnalysis,
  DirectoryNode,
  RelationshipAnalysis,
  ComponentRelationship,
  DiagramGenerator as IDiagramGenerator,
  DiagramGenerationResult,
  GenerationError,
  MermaidRenderer as IMermaidRenderer,
  RenderConfig,
  ValidationResult
} from './types.js';

// Default configuration
export const DEFAULT_CONFIG = {
  outputDir: './diagrams',
  generateSvg: true,
  generatePng: true,
  generateHighRes: false,
  theme: 'neutral' as const,
  maxComplexity: 50,
  includeFilePaths: true,
  includeRelationships: true,
  includeMetadata: true
} as const;

// Utility functions
export const createDiagramGenerator = (rootPath?: string) => {
  return new DiagramGeneratorMain(rootPath);
};

export const generateAllDiagrams = async (config?: Partial<DiagramGenerationConfig>) => {
  const generator = new DiagramGeneratorMain();
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  return await generator.generateAll(fullConfig);
};

export const generateSpecificDiagram = async (
  diagramType: string, 
  config?: Partial<DiagramGenerationConfig>
) => {
  const generator = new DiagramGeneratorMain();
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  return await generator.generateDiagram(diagramType, fullConfig);
};
