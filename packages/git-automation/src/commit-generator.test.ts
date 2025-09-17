import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CommitMessageGenerator } from './commit-generator.js';
import { ChangeAnalysisResult } from './change-analyzer.js';

// Mock chalk
vi.mock('chalk', () => ({
  default: {
    blue: (text: string) => text,
    green: (text: string) => text,
    yellow: (text: string) => text,
    cyan: (text: string) => text,
    gray: (text: string) => text,
    white: (text: string) => text,
  },
}));

describe('CommitMessageGenerator', () => {
  let generator: CommitMessageGenerator;

  beforeEach(() => {
    generator = new CommitMessageGenerator();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateCommitMessage', () => {
    it('should generate feature commit message', () => {
      const analysis: ChangeAnalysisResult = {
        totalFiles: 2,
        totalAdditions: 20,
        totalDeletions: 5,
        categories: [
          {
            type: 'feature',
            files: [
              { file: 'src/components/Button.tsx', status: 'added' },
              { file: 'src/components/Modal.tsx', status: 'added' },
            ],
            impact: 'medium',
            description: 'New features and capabilities (2 files)',
          },
        ],
        versionBumpType: 'minor',
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: false,
      };

      const result = generator.generateCommitMessage(analysis);

      expect(result.type).toBe('feat');
      expect(result.scope).toBe('components');
      expect(result.description).toContain('add new features and capabilities');
      expect(result.fullMessage).toContain('feat(components):');
    });

    it('should generate fix commit message', () => {
      const analysis: ChangeAnalysisResult = {
        totalFiles: 1,
        totalAdditions: 5,
        totalDeletions: 2,
        categories: [
          {
            type: 'fix',
            files: [
              { file: 'src/utils/helper.ts', status: 'modified' },
            ],
            impact: 'medium',
            description: 'Bug fixes and issue resolution (1 files)',
          },
        ],
        versionBumpType: 'patch',
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: false,
      };

      const result = generator.generateCommitMessage(analysis);

      expect(result.type).toBe('fix');
      expect(result.scope).toBe('utils');
      expect(result.description).toContain('fix bugs and resolve issues');
      expect(result.fullMessage).toContain('fix(utils):');
    });

    it('should generate breaking change commit message', () => {
      const analysis: ChangeAnalysisResult = {
        totalFiles: 1,
        totalAdditions: 10,
        totalDeletions: 5,
        categories: [
          {
            type: 'feature',
            files: [
              { file: 'src/api/schema.ts', status: 'modified' },
            ],
            impact: 'high',
            description: 'New features and capabilities (1 files)',
          },
        ],
        versionBumpType: 'major',
        hasBreakingChanges: true,
        securityChanges: false,
        performanceChanges: false,
      };

      const result = generator.generateCommitMessage(analysis);

      expect(result.type).toBe('feat!');
      expect(result.scope).toBe('api');
      expect(result.description).toContain('with breaking changes');
      expect(result.footer).toContain('BREAKING CHANGE:');
    });

    it('should generate performance commit message', () => {
      const analysis: ChangeAnalysisResult = {
        totalFiles: 2,
        totalAdditions: 15,
        totalDeletions: 3,
        categories: [
          {
            type: 'perf',
            files: [
              { file: 'src/perf/optimize.ts', status: 'modified' },
              { file: 'src/cache/memo.ts', status: 'modified' },
            ],
            impact: 'high',
            description: 'Performance optimizations (2 files)',
          },
        ],
        versionBumpType: 'minor',
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: true,
      };

      const result = generator.generateCommitMessage(analysis);

      expect(result.type).toBe('perf');
      expect(result.scope).toBe('perf');
      expect(result.description).toContain('improve performance and optimization');
      expect(result.description).toContain('with performance enhancements');
    });

    it('should generate documentation commit message', () => {
      const analysis: ChangeAnalysisResult = {
        totalFiles: 2,
        totalAdditions: 12,
        totalDeletions: 2,
        categories: [
          {
            type: 'docs',
            files: [
              { file: 'README.md', status: 'modified' },
              { file: 'docs/api.md', status: 'added' },
            ],
            impact: 'low',
            description: 'Documentation updates (2 files)',
          },
        ],
        versionBumpType: 'patch',
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: false,
      };

      const result = generator.generateCommitMessage(analysis);

      expect(result.type).toBe('docs');
      expect(result.scope).toBe('docs');
      expect(result.description).toContain('update documentation and guides');
    });

    it('should generate test commit message', () => {
      const analysis: ChangeAnalysisResult = {
        totalFiles: 3,
        totalAdditions: 25,
        totalDeletions: 5,
        categories: [
          {
            type: 'test',
            files: [
              { file: 'src/__tests__/Button.test.tsx', status: 'added' },
              { file: 'src/__tests__/Modal.test.tsx', status: 'added' },
              { file: 'src/__tests__/utils.test.ts', status: 'modified' },
            ],
            impact: 'low',
            description: 'Test coverage improvements (3 files)',
          },
        ],
        versionBumpType: 'patch',
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: false,
      };

      const result = generator.generateCommitMessage(analysis);

      expect(result.type).toBe('test');
      expect(result.scope).toBe('test');
      expect(result.description).toContain('enhance test coverage and quality');
    });

    it('should generate chore commit message for configuration changes', () => {
      const analysis: ChangeAnalysisResult = {
        totalFiles: 2,
        totalAdditions: 8,
        totalDeletions: 2,
        categories: [
          {
            type: 'chore',
            files: [
              { file: 'package.json', status: 'modified' },
              { file: 'tsconfig.json', status: 'modified' },
            ],
            impact: 'medium',
            description: 'Configuration updates (2 files)',
          },
        ],
        versionBumpType: 'patch',
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: false,
      };

      const result = generator.generateCommitMessage(analysis);

      expect(result.type).toBe('chore');
      expect(result.scope).toBe('config');
      expect(result.description).toContain('update configuration and maintenance');
    });

    it('should generate commit message with body when enabled', () => {
      const analysis: ChangeAnalysisResult = {
        totalFiles: 2,
        totalAdditions: 15,
        totalDeletions: 3,
        categories: [
          {
            type: 'feature',
            files: [
              { file: 'src/components/Button.tsx', status: 'added' },
              { file: 'src/components/Modal.tsx', status: 'added' },
            ],
            impact: 'medium',
            description: 'New features and capabilities (2 files)',
          },
        ],
        versionBumpType: 'minor',
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: false,
      };

      const result = generator.generateCommitMessage(analysis, { includeBody: true });

      expect(result.body).toBeDefined();
      expect(result.body).toContain('- New features and capabilities (2 files)');
      expect(result.body).toContain('- src/components/Button.tsx');
      expect(result.body).toContain('- src/components/Modal.tsx');
    });

    it('should generate commit message with footer when enabled', () => {
      const analysis: ChangeAnalysisResult = {
        totalFiles: 1,
        totalAdditions: 5,
        totalDeletions: 2,
        categories: [
          {
            type: 'fix',
            files: [
              { file: 'src/auth/security.ts', status: 'modified' },
            ],
            impact: 'high',
            description: 'Security improvements (1 files)',
          },
        ],
        versionBumpType: 'patch',
        hasBreakingChanges: false,
        securityChanges: true,
        performanceChanges: false,
      };

      const result = generator.generateCommitMessage(analysis, { includeFooter: true });

      expect(result.footer).toBeDefined();
      expect(result.footer).toContain('Version bump: patch');
      expect(result.footer).toContain('Refs: #TODO');
    });

    it('should handle multiple categories', () => {
      const analysis: ChangeAnalysisResult = {
        totalFiles: 4,
        totalAdditions: 30,
        totalDeletions: 8,
        categories: [
          {
            type: 'feature',
            files: [
              { file: 'src/components/Button.tsx', status: 'added' },
            ],
            impact: 'medium',
            description: 'New features and capabilities (1 files)',
          },
          {
            type: 'fix',
            files: [
              { file: 'src/utils/helper.ts', status: 'modified' },
            ],
            impact: 'medium',
            description: 'Bug fixes and issue resolution (1 files)',
          },
          {
            type: 'test',
            files: [
              { file: 'src/__tests__/Button.test.tsx', status: 'added' },
              { file: 'src/__tests__/helper.test.ts', status: 'added' },
            ],
            impact: 'low',
            description: 'Test coverage improvements (2 files)',
          },
        ],
        versionBumpType: 'minor',
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: false,
      };

      const result = generator.generateCommitMessage(analysis);

      expect(result.type).toBe('feat'); // Should prioritize feature over fix
      expect(result.description).toContain('add new features and capabilities');
      expect(result.description).toContain('enhanced 1 feature files');
      expect(result.description).toContain('resolved 1 issue files');
      expect(result.description).toContain('improved 2 test files');
    });

    it('should handle empty analysis', () => {
      const analysis: ChangeAnalysisResult = {
        totalFiles: 0,
        totalAdditions: 0,
        totalDeletions: 0,
        categories: [],
        versionBumpType: 'patch',
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: false,
      };

      const result = generator.generateCommitMessage(analysis);

      expect(result.type).toBe('chore');
      expect(result.description).toContain('update configuration and maintenance');
    });
  });

  describe('displayCommitMessage', () => {
    it('should display commit message correctly', () => {
      const commitMessage = {
        type: 'feat',
        scope: 'components',
        description: 'add new features and capabilities',
        body: 'Detailed description of changes',
        footer: 'Version bump: minor',
        fullMessage: 'feat(components): add new features and capabilities\n\nDetailed description of changes\n\nVersion bump: minor',
      };

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      generator.displayCommitMessage(commitMessage);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('📝 Generated Commit Message:'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Type: feat'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Scope: components'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Description: add new features and capabilities'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Body:'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Footer:'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Full Message:'));

      consoleSpy.mockRestore();
    });

    it('should display commit message without optional fields', () => {
      const commitMessage = {
        type: 'fix',
        scope: undefined,
        description: 'fix bugs and resolve issues',
        body: undefined,
        footer: undefined,
        fullMessage: 'fix: fix bugs and resolve issues',
      };

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      generator.displayCommitMessage(commitMessage);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Type: fix'));
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Scope:'));
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Body:'));
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Footer:'));

      consoleSpy.mockRestore();
    });
  });
});
