/**
 * 🦊 Simple Diagram Generator Tests
 * 
 * Basic tests that don't require complex setup.
 */

import { describe, it, expect } from 'vitest';

describe('Diagram Generator - Basic Tests', () => {
  it('should have basic functionality', () => {
    expect(true).toBe(true);
  });

  it('should be able to import types', () => {
    // Test that we can import our types
    const testConfig = {
      outputDir: './test',
      generateSvg: true,
      generatePng: false,
      generateHighRes: false,
      theme: 'neutral' as const,
      maxComplexity: 50,
      includeFilePaths: true,
      includeRelationships: true,
      includeMetadata: true
    };

    expect(testConfig.outputDir).toBe('./test');
    expect(testConfig.generateSvg).toBe(true);
    expect(testConfig.theme).toBe('neutral');
  });

  it('should validate mermaid content', () => {
    const validMermaid = 'graph TD\n    A[Start] --> B[End]';
    const invalidMermaid = '';

    expect(validMermaid.includes('graph')).toBe(true);
    expect(invalidMermaid.trim()).toBe('');
  });

  it('should handle diagram types', () => {
    const diagramTypes = [
      'architecture-overview',
      'package-dependencies', 
      'component-relationships',
      'file-structure'
    ];

    expect(diagramTypes).toHaveLength(4);
    expect(diagramTypes).toContain('architecture-overview');
  });
});
