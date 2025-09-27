/**
 * 🦊 Reynard Catalyst Linting Tests
 * 
 * Comprehensive tests for the linting system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { LintingOrchestrator } from '../linting/LintingOrchestrator.js';
import type { LintingConfig, LintingProcessor } from '../types/Linting.js';

// Mock the ReynardLogger
vi.mock('../logger/ReynardLogger.js', () => ({
  ReynardLogger: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    section: vi.fn()
  }))
}));

describe('LintingOrchestrator', () => {
  let tempDir: string;
  let orchestrator: LintingOrchestrator;
  let mockConfig: LintingConfig;

  beforeEach(() => {
    // Create a temporary directory for testing
    tempDir = join('/tmp', 'temp-test-linting');
    mkdirSync(tempDir, { recursive: true });

    // Create test files
    writeFileSync(join(tempDir, 'test.js'), 'console.log("hello world");');
    writeFileSync(join(tempDir, 'test.ts'), 'console.log("hello world");');
    writeFileSync(join(tempDir, 'test.py'), 'print("hello world")');

    // Mock processor
    const mockProcessor: LintingProcessor = {
      name: 'test-processor',
      extensions: ['.js', '.ts'],
      process: vi.fn().mockResolvedValue({
        filePath: 'test.js',
        issues: [],
        passed: true,
        durationMs: 100
      })
    };

    mockConfig = {
      projectRoot: tempDir,
      includePatterns: ['**/*.js', '**/*.ts', '**/*.py'],
      excludePatterns: ['node_modules/**', 'dist/**'],
      processors: [mockProcessor],
      maxConcurrency: 4,
      cacheEnabled: false,
      cacheLocation: join(tempDir, '.cache'),
      verbose: false
    };

    orchestrator = new LintingOrchestrator(mockConfig);
  });

  afterEach(() => {
    // Clean up temp directory
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with config', () => {
      expect(orchestrator).toBeDefined();
    });

    it('should set default values for optional config', () => {
      const minimalConfig = {
        projectRoot: tempDir,
        includePatterns: ['**/*.js'],
        excludePatterns: [],
        processors: []
      };
      
      const minimalOrchestrator = new LintingOrchestrator(minimalConfig);
      expect(minimalOrchestrator).toBeDefined();
    });
  });

  describe('discoverFiles', () => {
    it('should discover files matching include patterns', async () => {
      const files = await orchestrator.discoverFiles();
      
      expect(files.length).toBeGreaterThan(0);
      expect(files.some(f => f.endsWith('.js'))).toBe(true);
      expect(files.some(f => f.endsWith('.ts'))).toBe(true);
    });

    it('should exclude files matching exclude patterns', async () => {
      // Create a file in a directory that should be excluded
      mkdirSync(join(tempDir, 'node_modules'), { recursive: true });
      writeFileSync(join(tempDir, 'node_modules', 'test.js'), 'console.log("excluded");');
      
      const files = await orchestrator.discoverFiles();
      
      expect(files.some(f => f.includes('node_modules'))).toBe(false);
    });

    it('should handle empty include patterns', async () => {
      const emptyConfig = {
        ...mockConfig,
        includePatterns: []
      };
      
      const emptyOrchestrator = new LintingOrchestrator(emptyConfig);
      const files = await emptyOrchestrator.discoverFiles();
      
      expect(files).toHaveLength(0);
    });
  });

  describe('shouldInclude', () => {
    it('should include files matching patterns', () => {
      expect(orchestrator.shouldInclude('test.js', ['**/*.js'])).toBe(true);
      expect(orchestrator.shouldInclude('test.ts', ['**/*.ts'])).toBe(true);
    });

    it('should exclude files not matching patterns', () => {
      expect(orchestrator.shouldInclude('test.txt', ['**/*.js'])).toBe(false);
      expect(orchestrator.shouldInclude('test.js', ['**/*.ts'])).toBe(false);
    });

    it('should handle multiple patterns', () => {
      const patterns = ['**/*.js', '**/*.ts'];
      expect(orchestrator.shouldInclude('test.js', patterns)).toBe(true);
      expect(orchestrator.shouldInclude('test.ts', patterns)).toBe(true);
      expect(orchestrator.shouldInclude('test.py', patterns)).toBe(false);
    });
  });

  describe('shouldExclude', () => {
    it('should exclude files matching exclude patterns', () => {
      expect(orchestrator.shouldExclude('node_modules/test.js', ['node_modules/**'])).toBe(true);
      expect(orchestrator.shouldExclude('dist/test.js', ['dist/**'])).toBe(true);
    });

    it('should not exclude files not matching patterns', () => {
      expect(orchestrator.shouldExclude('src/test.js', ['node_modules/**'])).toBe(false);
      expect(orchestrator.shouldExclude('test.js', ['dist/**'])).toBe(false);
    });

    it('should handle multiple exclude patterns', () => {
      const patterns = ['node_modules/**', 'dist/**'];
      expect(orchestrator.shouldExclude('node_modules/test.js', patterns)).toBe(true);
      expect(orchestrator.shouldExclude('dist/test.js', patterns)).toBe(true);
      expect(orchestrator.shouldExclude('src/test.js', patterns)).toBe(false);
    });
  });

  describe('runLinting', () => {
    it('should run linting on discovered files', async () => {
      const summary = await orchestrator.runLinting();
      
      expect(summary.totalFiles).toBeGreaterThan(0);
      expect(summary.durationMs).toBeGreaterThan(0);
      expect(typeof summary.filesWithIssues).toBe('number');
      expect(typeof summary.totalIssues).toBe('number');
    });

    it('should handle empty file list', async () => {
      const emptyConfig = {
        ...mockConfig,
        includePatterns: ['**/*.nonexistent']
      };
      
      const emptyOrchestrator = new LintingOrchestrator(emptyConfig);
      const summary = await emptyOrchestrator.runLinting();
      
      expect(summary.totalFiles).toBe(0);
      expect(summary.filesWithIssues).toBe(0);
      expect(summary.totalIssues).toBe(0);
    });

    it('should handle processor errors gracefully', async () => {
      const errorProcessor: LintingProcessor = {
        name: 'error-processor',
        extensions: ['.js'],
        process: vi.fn().mockRejectedValue(new Error('Processor error'))
      };
      
      const errorConfig = {
        ...mockConfig,
        processors: [errorProcessor]
      };
      
      const errorOrchestrator = new LintingOrchestrator(errorConfig);
      const summary = await errorOrchestrator.runLinting();
      
      expect(summary.totalFiles).toBeGreaterThan(0);
      expect(summary.filesWithIssues).toBeGreaterThan(0);
    });
  });

  describe('getProcessorForFile', () => {
    it('should return correct processor for file extension', () => {
      const processor = orchestrator.getProcessorForFile('test.js');
      expect(processor).toBeDefined();
      expect(processor?.name).toBe('test-processor');
    });

    it('should return undefined for unsupported file extension', () => {
      const processor = orchestrator.getProcessorForFile('test.txt');
      expect(processor).toBeUndefined();
    });

    it('should handle multiple processors for same extension', () => {
      const secondProcessor: LintingProcessor = {
        name: 'second-processor',
        extensions: ['.js'],
        process: vi.fn().mockResolvedValue({
          filePath: 'test.js',
          issues: [],
          passed: true,
          durationMs: 100
        })
      };
      
      const multiConfig = {
        ...mockConfig,
        processors: [mockConfig.processors[0], secondProcessor]
      };
      
      const multiOrchestrator = new LintingOrchestrator(multiConfig);
      const processor = multiOrchestrator.getProcessorForFile('test.js');
      
      expect(processor).toBeDefined();
      // Should return the first matching processor
      expect(processor?.name).toBe('test-processor');
    });
  });
});
