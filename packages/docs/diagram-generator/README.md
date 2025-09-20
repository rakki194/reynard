# 🦊 Reynard Diagram Generator

## Comprehensive diagram generation tool for Reynard project architecture visualization

[![npm version](https://img.shields.io/npm/v/reynard-diagram-generator.svg)](https://www.npmjs.com/package/reynard-diagram-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## Overview

The `reynard-diagram-generator` package provides comprehensive diagram generation capabilities for the Reynard monorepo. It automatically analyzes the codebase, identifies reusable components, and generates detailed Mermaid diagrams in both SVG and PNG formats.

## Features

- 🏗️ **Architecture Overview**: High-level project structure visualization
- 📦 **Package Dependencies**: Detailed dependency relationship diagrams
- 🧩 **Component Relationships**: Component interaction and relationship mapping
- 📁 **File Structure**: Visual file and directory organization
- 🔌 **Frontend-Backend Relationships**: Comprehensive frontend-backend connection mapping with API endpoints, authentication, and real-time features
- 🌍 **Detailed Ecosystem Analysis**: In-depth package and component relationship analysis with import/export tracking
- 🎨 **Multiple Formats**: SVG, PNG, and high-resolution PNG output
- 🔍 **Codebase Analysis**: Automatic scanning for reusable components and relationships
- ⚡ **MCP Integration**: Leverages existing MCP Mermaid rendering service
- 📊 **Comprehensive Reports**: Detailed generation summaries and metadata
- 🎯 **Visual Indicators**: Authentication requirements, real-time features, and connection types
- 📈 **Complexity Analysis**: Package complexity scoring and relationship strength analysis

## Installation

```bash
pnpm add reynard-diagram-generator
```

## Quick Start

```typescript
import { generateAllDiagrams, createDiagramGenerator } from "reynard-diagram-generator";

// Generate all diagrams with default configuration
const result = await generateAllDiagrams();

// Or with custom configuration
const result = await generateAllDiagrams({
  outputDir: "./my-diagrams",
  generateSvg: true,
  generatePng: true,
  generateHighRes: true,
  theme: "neutral",
});

console.log(`Generated ${result.summary.totalDiagrams} diagrams`);
```

## CLI Usage

```bash
# Generate all diagrams
pnpm run generate:all

# Generate with custom options
pnpm run generate:all --output ./docs/diagrams --high-res --theme neutral

# Generate specific diagram types
pnpm run generate:architecture
pnpm run generate:components
pnpm run generate:dependencies
pnpm run generate:frontend-backend
pnpm run generate:ecosystem
```

## API Reference

### Core Classes

#### `DiagramGenerator`

Main orchestrator for diagram generation.

```typescript
import { DiagramGenerator } from "reynard-diagram-generator";

const generator = new DiagramGenerator("/path/to/reynard");

// Generate all diagrams
const result = await generator.generateAll(config);

// Generate specific diagram
const diagram = await generator.generateDiagram("architecture-overview", config);
```

#### `CodebaseAnalyzer`

Analyzes the Reynard codebase to extract components and relationships.

```typescript
import { CodebaseAnalyzer } from "reynard-diagram-generator";

const analyzer = new CodebaseAnalyzer();
const analysis = await analyzer.analyzeCodebase();

console.log(`Found ${analysis.packages.length} packages`);
console.log(`Found ${analysis.components.length} components`);
```

#### `MermaidRenderer`

Renders Mermaid diagrams to various formats using the MCP service.

```typescript
import { MermaidRenderer } from "reynard-diagram-generator";

const renderer = new MermaidRenderer();

// Render to SVG
const svg = await renderer.renderToSvg(mermaidContent);

// Render to PNG
const png = await renderer.renderToPng(mermaidContent);

// Validate diagram
const validation = await renderer.validate(mermaidContent);
```

### Diagram Generators

#### Architecture Overview Generator

Generates high-level architecture diagrams showing the overall project structure.

```typescript
import { ArchitectureOverviewGenerator } from "reynard-diagram-generator";

const generator = new ArchitectureOverviewGenerator();
const diagram = await generator.generate(analysis, config);
```

#### Package Dependencies Generator

Creates detailed dependency relationship diagrams.

```typescript
import { PackageDependenciesGenerator } from "reynard-diagram-generator";

const generator = new PackageDependenciesGenerator();
const diagram = await generator.generate(analysis, config);
```

#### Component Relationships Generator

Maps component interactions and relationships.

```typescript
import { ComponentRelationshipsGenerator } from "reynard-diagram-generator";

const generator = new ComponentRelationshipsGenerator();
const diagram = await generator.generate(analysis, config);
```

#### File Structure Generator

Visualizes file and directory organization.

```typescript
import { FileStructureGenerator } from "reynard-diagram-generator";

const generator = new FileStructureGenerator();
const diagram = await generator.generate(analysis, config);
```

#### Frontend-Backend Relationship Generator

Creates comprehensive diagrams showing relationships between frontend packages and backend services, including API connections, authentication requirements, and real-time features.

```typescript
import { FrontendBackendRelationshipGenerator } from "reynard-diagram-generator";

const generator = new FrontendBackendRelationshipGenerator();
const diagram = await generator.generate(analysis, config);
```

#### Detailed Ecosystem Generator

Generates in-depth analysis of all packages, components, and their detailed relationships with import/export tracking and complexity analysis.

```typescript
import { DetailedEcosystemGenerator } from "reynard-diagram-generator";

const generator = new DetailedEcosystemGenerator();
const diagram = await generator.generate(analysis, config);
```

## Configuration

### DiagramGenerationConfig

```typescript
interface DiagramGenerationConfig {
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
```

### Default Configuration

```typescript
const DEFAULT_CONFIG = {
  outputDir: "./diagrams",
  generateSvg: true,
  generatePng: true,
  generateHighRes: false,
  theme: "neutral",
  maxComplexity: 50,
  includeFilePaths: true,
  includeRelationships: true,
  includeMetadata: true,
};
```

## Output Structure

Generated diagrams are organized in the output directory:

```text
diagrams/
├── architecture-overview.svg
├── architecture-overview.png
├── package-dependencies.svg
├── package-dependencies.png
├── component-relationships.svg
├── component-relationships.png
├── file-structure.svg
├── file-structure.png
├── frontend-backend-relationships.svg
├── frontend-backend-relationships.png
├── detailed-ecosystem.svg
├── detailed-ecosystem.png
├── generation-report.json
└── *.mmd (Mermaid source files)
```

## Advanced Diagram Types

### Frontend-Backend Relationship Diagrams

The `FrontendBackendRelationshipGenerator` creates comprehensive diagrams that visualize:

- **🔐 Authentication Requirements**: Packages that require authentication
- **⚡ Real-time Features**: WebSocket and Server-Sent Events connections
- **🔌 API Client Packages**: Frontend packages that act as API clients
- **🌐 Connection Management**: Networking and connection packages
- **🎨 UI Components**: User interface packages and their backend connections
- **🛠️ Utility Packages**: Helper packages and their dependencies

#### Visual Indicators

- **🔐 Authentication Required**: Packages that require authentication
- **⚡ Real-time Features**: Packages with WebSocket or SSE capabilities
- **🔌 API Client**: Packages that act as API clients
- **🌐 Connection**: Networking and connection management packages
- **🎨 UI**: User interface components
- **🛠️ Utility**: Utility and helper packages

#### Connection Types

- **--> HTTP API**: Standard HTTP API connections
- **<--> WebSocket**: Bidirectional real-time connections
- **--> Server-Sent Events**: One-way real-time connections
- **-.-> Internal Dependency**: Internal package dependencies

### Detailed Ecosystem Analysis

The `DetailedEcosystemGenerator` provides in-depth analysis including:

- **Package Complexity Scoring**: Mathematical complexity analysis
- **Import/Export Tracking**: Detailed dependency mapping
- **Relationship Strength**: Weighted relationship analysis
- **Component-Level Analysis**: Individual component relationships
- **API Connection Mapping**: Frontend-backend communication patterns
- **Data Flow Analysis**: Request-response and streaming patterns

## Integration with Existing Tools

### MCP Mermaid Service

The package integrates with the existing MCP Mermaid service for high-quality rendering:

```typescript
// Automatically uses MCP service if available
const renderer = new MermaidRenderer();
const svg = await renderer.renderToSvg(mermaidContent);
```

### Project Architecture Package

Leverages the `reynard-project-architecture` package for accurate project structure analysis:

```typescript
import { REYNARD_ARCHITECTURE } from "reynard-project-architecture";

// Automatically uses the centralized architecture definition
const analyzer = new CodebaseAnalyzer();
```

## Advanced Usage

### Custom Diagram Generator

Create custom diagram generators by implementing the `DiagramGenerator` interface:

```typescript
import type { DiagramGenerator, CodebaseAnalysis, DiagramGenerationConfig } from "reynard-diagram-generator";

class CustomDiagramGenerator implements DiagramGenerator {
  name = "Custom Generator";
  type = "custom-diagram" as const;
  description = "Generates custom diagrams";

  async generate(analysis: CodebaseAnalysis, config: DiagramGenerationConfig) {
    // Custom generation logic
    const mermaidContent = this.generateMermaidContent(analysis);

    return {
      mermaidContent,
      metadata: {
        type: this.type,
        title: "Custom Diagram",
        description: "Custom diagram description",
        nodeCount: 0,
        edgeCount: 0,
        complexityScore: 0,
        generatedAt: new Date().toISOString(),
        sourceFiles: [],
        dependencies: [],
      },
      outputPaths: {},
    };
  }

  validate(analysis: CodebaseAnalysis): boolean {
    return true;
  }
}
```

### Batch Processing

Process multiple projects or configurations:

```typescript
const configs = [
  { outputDir: "./docs/diagrams", theme: "neutral" },
  { outputDir: "./presentation/diagrams", theme: "dark", generateHighRes: true },
];

for (const config of configs) {
  const result = await generateAllDiagrams(config);
  console.log(`Generated ${result.summary.totalDiagrams} diagrams in ${config.outputDir}`);
}
```

## Development

### Building

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

### Linting

```bash
pnpm lint
pnpm lint:fix
```

### Type Checking

```bash
pnpm typecheck
```

## Contributing

When contributing to this package:

1. **Add New Generators**: Create new diagram generators in `src/generators/`
2. **Update Analysis**: Enhance codebase analysis in `src/core/CodebaseAnalyzer.ts`
3. **Improve Rendering**: Extend rendering capabilities in `src/core/MermaidRenderer.ts`
4. **Add Tests**: Ensure new functionality is thoroughly tested
5. **Update Documentation**: Keep this README current with new features

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related Packages

- `reynard-project-architecture` - Project structure definitions
- `reynard-charts` - Visualization components
- `reynard-core` - Core utilities
- `reynard-testing` - Testing utilities

---

## Part of the Reynard Framework - Cunning agile development tools
