/**
 * 🦊 Reynard Diagram Generator Types
 *
 * Type definitions for the comprehensive diagram generation system.
 */

export interface DiagramGenerationConfig {
  /** Output directory for generated diagrams */
  outputDir: string;
  /** Whether to generate SVG format */
  generateSvg: boolean;
  /** Whether to generate PNG format */
  generatePng: boolean;
  /** Whether to generate high-resolution versions */
  generateHighRes: boolean;
  /** Theme for diagrams */
  theme: "neutral" | "dark" | "forest" | "base";
  /** Maximum diagram complexity before splitting */
  maxComplexity: number;
  /** Include file paths in diagrams */
  includeFilePaths: boolean;
  /** Include relationship details */
  includeRelationships: boolean;
  /** Include metadata in diagrams */
  includeMetadata: boolean;
}

export interface DiagramOutput {
  /** Diagram content in Mermaid format */
  mermaidContent: string;
  /** Generated SVG content */
  svgContent?: string;
  /** Generated PNG content (base64) */
  pngContent?: string;
  /** High-resolution PNG content (base64) */
  highResPngContent?: string;
  /** Output file paths */
  outputPaths: {
    mermaid?: string;
    svg?: string;
    png?: string;
    highResPng?: string;
  };
  /** Diagram metadata */
  metadata: DiagramMetadata;
}

export interface DiagramMetadata {
  /** Diagram type */
  type: DiagramType;
  /** Diagram title */
  title: string;
  /** Diagram description */
  description: string;
  /** Number of nodes in diagram */
  nodeCount: number;
  /** Number of edges in diagram */
  edgeCount: number;
  /** Complexity score */
  complexityScore: number;
  /** Generation timestamp */
  generatedAt: string;
  /** Source files analyzed */
  sourceFiles: string[];
  /** Dependencies used */
  dependencies: string[];
}

export type DiagramType =
  | "architecture-overview"
  | "package-dependencies"
  | "component-relationships"
  | "file-structure"
  | "class-diagram"
  | "sequence-diagram"
  | "flowchart"
  | "entity-relationship"
  | "deployment-diagram"
  | "user-journey"
  | "data-flow"
  | "system-overview"
  | "frontend-backend-relationships"
  | "detailed-ecosystem";

export interface CodebaseAnalysis {
  /** Analyzed packages */
  packages: PackageAnalysis[];
  /** Global dependencies */
  dependencies: DependencyAnalysis[];
  /** Reusable components found */
  components: ComponentAnalysis[];
  /** File structure analysis */
  fileStructure: FileStructureAnalysis;
  /** Relationship mapping */
  relationships: RelationshipAnalysis[];
}

export interface PackageAnalysis {
  /** Package name */
  name: string;
  /** Package path */
  path: string;
  /** Package type */
  type:
    | "source"
    | "documentation"
    | "configuration"
    | "build"
    | "testing"
    | "scripts"
    | "data"
    | "templates"
    | "services"
    | "third-party"
    | "cache"
    | "tools";
  /** Package importance */
  importance: "critical" | "important" | "optional" | "excluded";
  /** Package dependencies */
  dependencies: string[];
  /** Package exports */
  exports: string[];
  /** Package components */
  components: ComponentAnalysis[];
  /** Package files */
  files: FileAnalysis[];
}

export interface ComponentAnalysis {
  /** Component name */
  name: string;
  /** Component type */
  type:
    | "class"
    | "function"
    | "interface"
    | "type"
    | "enum"
    | "constant"
    | "hook"
    | "composable"
    | "service"
    | "utility";
  /** Component file path */
  filePath: string;
  /** Component exports */
  exports: string[];
  /** Component dependencies */
  dependencies: string[];
  /** Component relationships */
  relationships: ComponentRelationship[];
  /** Component documentation */
  documentation?: string;
  /** Component complexity */
  complexity: number;
}

export interface FileAnalysis {
  /** File path */
  path: string;
  /** File type */
  type: string;
  /** File size */
  size: number;
  /** File lines */
  lines: number;
  /** File exports */
  exports: string[];
  /** File imports */
  imports: string[];
  /** File dependencies */
  dependencies: string[];
}

export interface DependencyAnalysis {
  /** Dependency name */
  name: string;
  /** Dependency type */
  type: "internal" | "external" | "peer" | "dev";
  /** Dependency version */
  version: string;
  /** Dependency usage count */
  usageCount: number;
  /** Dependency packages */
  packages: string[];
}

export interface FileStructureAnalysis {
  /** Root directories */
  rootDirectories: string[];
  /** Directory structure */
  structure: DirectoryNode;
  /** Total files */
  totalFiles: number;
  /** Total directories */
  totalDirectories: number;
  /** File type distribution */
  fileTypeDistribution: Record<string, number>;
}

export interface DirectoryNode {
  /** Directory name */
  name: string;
  /** Directory path */
  path: string;
  /** Directory type */
  type: string;
  /** Child directories */
  children: DirectoryNode[];
  /** Files in directory */
  files: FileAnalysis[];
  /** Directory metadata */
  metadata: Record<string, any>;
}

export interface RelationshipAnalysis {
  /** Source component */
  source: string;
  /** Target component */
  target: string;
  /** Relationship type */
  type: "imports" | "exports" | "extends" | "implements" | "uses" | "depends" | "configures" | "tests" | "documents";
  /** Relationship strength */
  strength: number;
  /** Relationship description */
  description: string;
}

export interface ComponentRelationship {
  /** Related component */
  component: string;
  /** Relationship type */
  type: "imports" | "exports" | "extends" | "implements" | "uses" | "depends" | "configures" | "tests" | "documents";
  /** Relationship strength */
  strength: number;
  /** Relationship description */
  description: string;
}

export interface DiagramGenerator {
  /** Generator name */
  name: string;
  /** Generator type */
  type: DiagramType;
  /** Generator description */
  description: string;
  /** Generate diagram */
  generate(analysis: CodebaseAnalysis, config: DiagramGenerationConfig): Promise<DiagramOutput>;
  /** Validate input */
  validate(analysis: CodebaseAnalysis): boolean;
}

export interface DiagramGenerationResult {
  /** Generated diagrams */
  diagrams: DiagramOutput[];
  /** Generation summary */
  summary: {
    totalDiagrams: number;
    successfulGenerations: number;
    failedGenerations: number;
    totalTime: number;
    outputDirectory: string;
  };
  /** Generation errors */
  errors: GenerationError[];
}

export interface GenerationError {
  /** Error type */
  type: string;
  /** Error message */
  message: string;
  /** Error context */
  context: Record<string, any>;
  /** Error timestamp */
  timestamp: string;
}

export interface MermaidRenderer {
  /** Render Mermaid to SVG */
  renderToSvg(mermaidContent: string, config?: RenderConfig): Promise<string>;
  /** Render Mermaid to PNG */
  renderToPng(mermaidContent: string, config?: RenderConfig): Promise<string>;
  /** Render Mermaid to high-resolution PNG */
  renderToHighResPng(mermaidContent: string, config?: RenderConfig): Promise<string>;
  /** Validate Mermaid syntax */
  validate(mermaidContent: string): Promise<ValidationResult>;
}

export interface RenderConfig {
  /** Viewport width */
  width: number;
  /** Viewport height */
  height: number;
  /** Theme */
  theme: string;
  /** Background color */
  backgroundColor: string;
  /** Scale factor for high-res */
  scale: number;
}

export interface ValidationResult {
  /** Is valid */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
}
