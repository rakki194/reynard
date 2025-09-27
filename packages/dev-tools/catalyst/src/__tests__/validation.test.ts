/**
 * 🦊 Reynard Catalyst Validation Tests
 * 
 * Comprehensive tests for the validation system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { ValidationEngine } from '../validation/ValidationEngine.js';
import type { ValidationConfig, ValidationRule, ValidationContext } from '../types/Validation.js';

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

describe('ValidationEngine', () => {
  let tempDir: string;
  let engine: ValidationEngine;
  let mockConfig: ValidationConfig;
  let mockContext: ValidationContext;

  beforeEach(() => {
    // Create a temporary directory for testing
    tempDir = join('/tmp', 'temp-test-validation');
    mkdirSync(tempDir, { recursive: true });

    // Create test files
    writeFileSync(join(tempDir, 'test.js'), 'console.log("hello world");');
    writeFileSync(join(tempDir, 'test.ts'), 'console.log("hello world");');
    writeFileSync(join(tempDir, 'README.md'), '# Test Project\n\nThis is a test project.');

    // Mock logger
    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      success: vi.fn(),
      section: vi.fn()
    };

    mockContext = {
      projectRoot: tempDir,
      logger: mockLogger
    };

    // Create test rules
    const testRules: ValidationRule[] = [
      {
        id: 'no-console',
        name: 'No Console Logs',
        description: 'Disallow console.log statements',
        severity: 'warning',
        enabled: true,
        content: {
          patterns: [
            {
              glob: ['**/*.js', '**/*.ts'],
              checks: [
                {
                  regex: 'console\\.log',
                  forbiddenStrings: ['console.log']
                }
              ]
            }
          ]
        }
      },
      {
        id: 'min-lines',
        name: 'Minimum Lines',
        description: 'Files should have at least 1 line',
        severity: 'error',
        enabled: true,
        content: {
          patterns: [
            {
              glob: ['**/*.js', '**/*.ts'],
              checks: [
                {
                  minLines: 1
                }
              ]
            }
          ]
        }
      }
    ];

    mockConfig = {
      projectRoot: tempDir,
      rules: testRules,
      excludePatterns: ['node_modules/**', 'dist/**'],
      includePatterns: ['**/*.js', '**/*.ts', '**/*.md'],
      verbose: false
    };

    engine = new ValidationEngine(mockConfig, mockContext);
  });

  afterEach(() => {
    // Clean up temp directory
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with config and context', () => {
      expect(engine).toBeDefined();
    });

    it('should set default values for optional config', () => {
      const minimalConfig = {
        projectRoot: tempDir,
        rules: [],
        excludePatterns: [],
        includePatterns: []
      };
      
      const minimalEngine = new ValidationEngine(minimalConfig, mockContext);
      expect(minimalEngine).toBeDefined();
    });
  });

  describe('findFiles', () => {
    it('should find files matching glob patterns', async () => {
      const files = await engine.findFiles('**/*.js');
      
      expect(files.length).toBeGreaterThan(0);
      expect(files.some(f => f.endsWith('.js'))).toBe(true);
    });

    it('should handle multiple glob patterns', async () => {
      const files = await engine.findFiles('**/*.{js,ts}');
      
      expect(files.length).toBeGreaterThan(0);
      expect(files.some(f => f.endsWith('.js'))).toBe(true);
      expect(files.some(f => f.endsWith('.ts'))).toBe(true);
    });

    it('should return empty array for non-matching patterns', async () => {
      const files = await engine.findFiles('**/*.nonexistent');
      
      expect(files).toHaveLength(0);
    });

    it('should handle invalid glob patterns gracefully', async () => {
      const files = await engine.findFiles('invalid[pattern');
      
      expect(files).toHaveLength(0);
    });
  });

  describe('validateFileContent', () => {
    it('should validate file content against rules', async () => {
      const result = await engine.validateFileContent();
      
      expect(result.valid).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.rules)).toBe(true);
      expect(typeof result.duration).toBe('number');
    });

    it('should detect console.log violations', async () => {
      const result = await engine.validateFileContent();
      
      const consoleIssues = result.issues.filter(issue => 
        issue.ruleId === 'no-console' && issue.message.includes('console.log')
      );
      
      expect(consoleIssues.length).toBeGreaterThan(0);
    });

    it('should validate minimum line requirements', async () => {
      const result = await engine.validateFileContent();
      
      const minLineIssues = result.issues.filter(issue => 
        issue.ruleId === 'min-lines'
      );
      
      // Should not have min-line issues since our test files have content
      expect(minLineIssues.length).toBe(0);
    });

    it('should handle files that don\'t match any rules', async () => {
      // Create a file that doesn't match any rule patterns
      writeFileSync(join(tempDir, 'test.txt'), 'This is a text file');
      
      const result = await engine.validateFileContent();
      
      expect(result.valid).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
    });

    it('should respect enabled/disabled rules', async () => {
      const disabledConfig = {
        ...mockConfig,
        rules: mockConfig.rules.map(rule => ({
          ...rule,
          enabled: false
        }))
      };
      
      const disabledEngine = new ValidationEngine(disabledConfig, mockContext);
      const result = await disabledEngine.validateFileContent();
      
      expect(result.issues).toHaveLength(0);
      expect(result.rules.every(r => r.success)).toBe(true);
    });
  });

  describe('validateRegex', () => {
    it('should detect regex violations', () => {
      const content = 'console.log("test");\nconst x = 1;';
      const issues = engine.validateRegex(content, 'console\\.log', 'test.js', 'no-console');
      
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].message).toContain('console.log');
    });

    it('should not detect violations when regex doesn\'t match', () => {
      const content = 'const x = 1;\nconst y = 2;';
      const issues = engine.validateRegex(content, 'console\\.log', 'test.js', 'no-console');
      
      expect(issues).toHaveLength(0);
    });

    it('should handle invalid regex gracefully', () => {
      const content = 'test content';
      const issues = engine.validateRegex(content, '[invalid', 'test.js', 'test-rule');
      
      expect(issues).toHaveLength(0);
    });
  });

  describe('validateForbiddenStrings', () => {
    it('should detect forbidden string violations', () => {
      const content = 'console.log("test");\nconst x = 1;';
      const issues = engine.validateForbiddenStrings(content, ['console.log'], 'test.js', 'no-console');
      
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].message).toContain('console.log');
    });

    it('should not detect violations when forbidden strings are not present', () => {
      const content = 'const x = 1;\nconst y = 2;';
      const issues = engine.validateForbiddenStrings(content, ['console.log'], 'test.js', 'no-console');
      
      expect(issues).toHaveLength(0);
    });

    it('should handle multiple forbidden strings', () => {
      const content = 'console.log("test");\nconsole.error("error");';
      const issues = engine.validateForbiddenStrings(content, ['console.log', 'console.error'], 'test.js', 'no-console');
      
      expect(issues.length).toBe(2);
    });
  });

  describe('validateLineCount', () => {
    it('should validate minimum line count', () => {
      const content = 'line 1\nline 2\nline 3';
      const issues = engine.validateLineCount(content, { minLines: 2 }, 'test.js', 'min-lines');
      
      expect(issues).toHaveLength(0);
    });

    it('should detect minimum line count violations', () => {
      const content = 'single line';
      const issues = engine.validateLineCount(content, { minLines: 2 }, 'test.js', 'min-lines');
      
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].message).toContain('minimum');
    });

    it('should validate maximum line count', () => {
      const content = 'line 1\nline 2';
      const issues = engine.validateLineCount(content, { maxLines: 3 }, 'test.js', 'max-lines');
      
      expect(issues).toHaveLength(0);
    });

    it('should detect maximum line count violations', () => {
      const content = 'line 1\nline 2\nline 3\nline 4';
      const issues = engine.validateLineCount(content, { maxLines: 3 }, 'test.js', 'max-lines');
      
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].message).toContain('maximum');
    });
  });

  describe('shouldExcludeFile', () => {
    it('should exclude files matching exclude patterns', () => {
      expect(engine.shouldExcludeFile('node_modules/test.js', ['node_modules/**'])).toBe(true);
      expect(engine.shouldExcludeFile('dist/test.js', ['dist/**'])).toBe(true);
    });

    it('should not exclude files not matching patterns', () => {
      expect(engine.shouldExcludeFile('src/test.js', ['node_modules/**'])).toBe(false);
      expect(engine.shouldExcludeFile('test.js', ['dist/**'])).toBe(false);
    });

    it('should handle multiple exclude patterns', () => {
      const patterns = ['node_modules/**', 'dist/**'];
      expect(engine.shouldExcludeFile('node_modules/test.js', patterns)).toBe(true);
      expect(engine.shouldExcludeFile('dist/test.js', patterns)).toBe(true);
      expect(engine.shouldExcludeFile('src/test.js', patterns)).toBe(false);
    });
  });
});
