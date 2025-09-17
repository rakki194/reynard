/**
 * 🦊 Diagram Generator Tests
 * 
 * Comprehensive tests for the Reynard diagram generation system.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiagramGeneratorMain } from '../core/DiagramGenerator.js';
import { CodebaseAnalyzer } from '../core/CodebaseAnalyzer.js';
import { MermaidRenderer } from '../core/MermaidRenderer.js';
import { ArchitectureOverviewGenerator } from '../generators/ArchitectureOverviewGenerator.js';
import type { DiagramGenerationConfig, CodebaseAnalysis } from '../types.js';

// Mock the MCP service
vi.mock('../../../../scripts/mcp/services/mermaid_service.js', () => ({
  MermaidService: vi.fn().mockImplementation(() => ({
    render_diagram_to_svg: vi.fn().mockResolvedValue([true, '<svg>test</svg>', '']),
    render_diagram_to_png: vi.fn().mockResolvedValue([true, 'base64png', '']),
    validate_diagram: vi.fn().mockResolvedValue([true, [], []])
  }))
}));

describe('DiagramGenerator', () => {
  let generator: DiagramGeneratorMain;
  let config: DiagramGenerationConfig;

  beforeEach(() => {
    generator = new DiagramGeneratorMain('/test/path');
    config = {
      outputDir: './test-diagrams',
      generateSvg: true,
      generatePng: true,
      generateHighRes: false,
      theme: 'neutral',
      maxComplexity: 50,
      includeFilePaths: true,
      includeRelationships: true,
      includeMetadata: true
    };
  });

  describe('constructor', () => {
    it('should initialize with default root path', () => {
      const defaultGenerator = new DiagramGeneratorMain();
      expect(defaultGenerator).toBeDefined();
    });

    it('should initialize with custom root path', () => {
      const customGenerator = new DiagramGeneratorMain('/custom/path');
      expect(customGenerator).toBeDefined();
    });
  });

  describe('getAvailableDiagramTypes', () => {
    it('should return available diagram types', () => {
      const types = generator.getAvailableDiagramTypes();
      expect(types).toContain('architecture-overview');
      expect(types).toContain('package-dependencies');
      expect(types).toContain('component-relationships');
      expect(types).toContain('file-structure');
    });
  });

  describe('getGeneratorInfo', () => {
    it('should return generator info for valid type', () => {
      const info = generator.getGeneratorInfo('architecture-overview');
      expect(info).toBeDefined();
      expect(info?.name).toBe('Architecture Overview Generator');
      expect(info?.description).toBe('Generates high-level architecture overview diagrams');
    });

    it('should return null for invalid type', () => {
      const info = generator.getGeneratorInfo('invalid-type');
      expect(info).toBeNull();
    });
  });
});

describe('CodebaseAnalyzer', () => {
  let analyzer: CodebaseAnalyzer;

  beforeEach(() => {
    analyzer = new CodebaseAnalyzer('/test/path');
  });

  describe('constructor', () => {
    it('should initialize with default root path', () => {
      const defaultAnalyzer = new CodebaseAnalyzer();
      expect(defaultAnalyzer).toBeDefined();
    });

    it('should initialize with custom root path', () => {
      const customAnalyzer = new CodebaseAnalyzer('/custom/path');
      expect(customAnalyzer).toBeDefined();
    });
  });
});

describe('MermaidRenderer', () => {
  let renderer: MermaidRenderer;

  beforeEach(() => {
    renderer = new MermaidRenderer();
  });

  describe('validate', () => {
    it('should validate valid mermaid content', async () => {
      const validContent = 'graph TD\n    A[Start] --> B[End]';
      const result = await renderer.validate(validContent);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty content', async () => {
      const result = await renderer.validate('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Diagram content is empty');
    });

    it('should warn about missing graph declaration', async () => {
      const result = await renderer.validate('A --> B');
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('No graph or flowchart declaration found');
    });
  });
});

describe('ArchitectureOverviewGenerator', () => {
  let generator: ArchitectureOverviewGenerator;
  let mockAnalysis: CodebaseAnalysis;

  beforeEach(() => {
    generator = new ArchitectureOverviewGenerator();
    mockAnalysis = {
      packages: [
        {
          name: 'reynard-core',
          path: 'packages/core',
          type: 'source',
          importance: 'critical',
          dependencies: ['reynard-testing'],
          exports: ['index.js'],
          components: [],
          files: []
        },
        {
          name: 'reynard-components',
          path: 'packages/components',
          type: 'source',
          importance: 'important',
          dependencies: ['reynard-core'],
          exports: ['index.js'],
          components: [],
          files: []
        }
      ],
      dependencies: [
        {
          name: 'solid-js',
          type: 'external',
          version: '1.9.9',
          usageCount: 5,
          packages: ['reynard-core', 'reynard-components']
        }
      ],
      components: [],
      fileStructure: {
        rootDirectories: ['packages'],
        structure: {
          name: 'root',
          path: '',
          type: 'directory',
          children: [],
          files: [],
          metadata: {}
        },
        totalFiles: 0,
        totalDirectories: 1,
        fileTypeDistribution: {}
      },
      relationships: [
        {
          source: 'reynard-components',
          target: 'reynard-core',
          type: 'depends',
          strength: 1,
          description: 'reynard-components depends on reynard-core'
        }
      ]
    };
  });

  describe('generate', () => {
    it('should generate mermaid content', async () => {
      const config: DiagramGenerationConfig = {
        outputDir: './test',
        generateSvg: false,
        generatePng: false,
        generateHighRes: false,
        theme: 'neutral',
        maxComplexity: 50,
        includeFilePaths: true,
        includeRelationships: true,
        includeMetadata: true
      };

      const result = await generator.generate(mockAnalysis, config);
      
      expect(result.mermaidContent).toContain('graph TB');
      expect(result.metadata.type).toBe('architecture-overview');
      expect(result.metadata.title).toBe('Reynard Project Architecture Overview');
    });
  });

  describe('validate', () => {
    it('should validate with packages', () => {
      expect(generator.validate(mockAnalysis)).toBe(true);
    });

    it('should reject without packages', () => {
      const emptyAnalysis = { ...mockAnalysis, packages: [] };
      expect(generator.validate(emptyAnalysis)).toBe(false);
    });
  });
});
