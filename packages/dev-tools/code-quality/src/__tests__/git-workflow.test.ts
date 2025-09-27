/**
 * 🦊 Reynard Code Quality Git Workflow Tests
 * 
 * Comprehensive tests for the git workflow system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { GitWorkflowManager } from '../git-workflow/GitWorkflowManager.js';
import type { GitWorkflowOptions, ChangeAnalysis, CommitMessage, VersionInfo } from '../git-workflow/GitWorkflowManager.js';

// Mock child_process
vi.mock('child_process', () => ({
  execSync: vi.fn()
}));

describe('GitWorkflowManager', () => {
  let tempDir: string;
  let workflowManager: GitWorkflowManager;
  let mockExecSync: any;

  beforeEach(() => {
    // Create a temporary directory for testing
    tempDir = join('/tmp', 'temp-test-git-workflow');
    mkdirSync(tempDir, { recursive: true });
    mkdirSync(join(tempDir, '.git'), { recursive: true });

    // Create test files
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
      name: 'test-project',
      version: '1.0.0'
    }, null, 2));
    writeFileSync(join(tempDir, 'CHANGELOG.md'), '# Changelog\n\n## [1.0.0] - 2024-01-01\n\n### Added\n- Initial release\n');

    // Mock execSync
    mockExecSync = vi.mocked(execSync);
    mockExecSync.mockImplementation((command: string) => {
      if (command.includes('git status')) {
        return Buffer.from('M  package.json\nA  new-file.js\nD  old-file.js\n?? untracked-file.js');
      }
      if (command.includes('mkdir')) {
        return Buffer.from('');
      }
      if (command.includes('rm')) {
        return Buffer.from('');
      }
      return Buffer.from('');
    });

    workflowManager = new GitWorkflowManager(tempDir);
  });

  afterEach(() => {
    // Clean up temp directory
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with project root', () => {
      expect(workflowManager).toBeDefined();
    });

    it('should use current working directory as default', () => {
      const defaultManager = new GitWorkflowManager();
      expect(defaultManager).toBeDefined();
    });
  });

  describe('executeWorkflow', () => {
    it('should execute complete workflow with all options', async () => {
      const options: GitWorkflowOptions = {
        cleanup: true,
        analyze: true,
        generateCommit: true,
        updateChangelog: true,
        updateVersion: true,
        dryRun: true
      };

      await expect(workflowManager.executeWorkflow(options)).resolves.not.toThrow();
    });

    it('should execute workflow with minimal options', async () => {
      const options: GitWorkflowOptions = {
        analyze: true
      };

      await expect(workflowManager.executeWorkflow(options)).resolves.not.toThrow();
    });

    it('should handle workflow errors gracefully', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Git command failed');
      });

      const options: GitWorkflowOptions = {
        analyze: true
      };

      await expect(workflowManager.executeWorkflow(options)).rejects.toThrow('Git command failed');
    });
  });

  describe('analyzeChanges', () => {
    it('should analyze git changes correctly', async () => {
      const changes = await (workflowManager as any).analyzeChanges(tempDir);
      
      expect(changes).toBeDefined();
      expect(Array.isArray(changes.modifiedFiles)).toBe(true);
      expect(Array.isArray(changes.addedFiles)).toBe(true);
      expect(Array.isArray(changes.deletedFiles)).toBe(true);
      expect(Array.isArray(changes.stagedFiles)).toBe(true);
      expect(Array.isArray(changes.unstagedFiles)).toBe(true);
      expect(Array.isArray(changes.untrackedFiles)).toBe(true);
      expect(typeof changes.summary.totalChanges).toBe('number');
    });

    it('should handle git status parsing errors', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Git status failed');
      });

      await expect((workflowManager as any).analyzeChanges(tempDir)).rejects.toThrow('Git status failed');
    });
  });

  describe('generateCommitMessage', () => {
    it('should generate commit message for added files', async () => {
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('git status')) {
          return Buffer.from('A  new-feature.js\nA  new-test.js');
        }
        return Buffer.from('');
      });

      const commitMessage = await (workflowManager as any).generateCommitMessage(tempDir);
      
      expect(commitMessage).toBeDefined();
      expect(commitMessage.type).toBe('feat');
      expect(commitMessage.description).toContain('Add new features');
      expect(commitMessage.fullMessage).toContain('feat');
    });

    it('should generate commit message for modified files', async () => {
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('git status')) {
          return Buffer.from('M  existing-file.js\nM  another-file.js');
        }
        return Buffer.from('');
      });

      const commitMessage = await (workflowManager as any).generateCommitMessage(tempDir);
      
      expect(commitMessage).toBeDefined();
      expect(commitMessage.type).toBe('fix');
      expect(commitMessage.description).toContain('Fix issues');
    });

    it('should generate commit message for deleted files', async () => {
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('git status')) {
          return Buffer.from('D  removed-file.js\nD  another-removed.js');
        }
        return Buffer.from('');
      });

      const commitMessage = await (workflowManager as any).generateCommitMessage(tempDir);
      
      expect(commitMessage).toBeDefined();
      expect(commitMessage.type).toBe('refactor');
      expect(commitMessage.description).toContain('Remove unused code');
    });

    it('should determine scope from file paths', async () => {
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('git status')) {
          return Buffer.from('A  src/components/Button.js\nA  src/components/Input.js');
        }
        return Buffer.from('');
      });

      const commitMessage = await (workflowManager as any).generateCommitMessage(tempDir);
      
      expect(commitMessage.scope).toBe('src');
    });
  });

  describe('updateChangelog', () => {
    it('should update changelog with new entry', async () => {
      const result = await (workflowManager as any).updateChangelog(tempDir, true);
      
      expect(result).toBeUndefined(); // Should not throw
    });

    it('should handle missing changelog file', async () => {
      rmSync(join(tempDir, 'CHANGELOG.md'));
      
      const result = await (workflowManager as any).updateChangelog(tempDir, true);
      
      expect(result).toBeUndefined(); // Should not throw
    });

    it('should format changelog entry correctly', () => {
      const entry = {
        version: '1.1.0',
        date: '2024-01-02',
        changes: {
          added: ['New feature'],
          changed: ['Updated feature'],
          fixed: ['Bug fix'],
          removed: ['Old feature'],
          security: ['Security update']
        }
      };

      const formatted = (workflowManager as any).formatChangelogEntry(entry);
      
      expect(formatted).toContain('## [1.1.0] - 2024-01-02');
      expect(formatted).toContain('### Added');
      expect(formatted).toContain('### Changed');
      expect(formatted).toContain('### Fixed');
      expect(formatted).toContain('### Removed');
      expect(formatted).toContain('### Security');
    });
  });

  describe('updateVersion', () => {
    it('should update version in package.json', async () => {
      const versionInfo = await (workflowManager as any).updateVersion(tempDir, true);
      
      expect(versionInfo).toBeDefined();
      expect(versionInfo.current).toBe('1.0.0');
      expect(versionInfo.next).toBe('1.0.1');
      expect(versionInfo.type).toBe('patch');
    });

    it('should determine version bump type based on changes', async () => {
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('git status')) {
          return Buffer.from('A  BREAKING_CHANGE.md\nA  new-feature.js');
        }
        return Buffer.from('');
      });

      const versionInfo = await (workflowManager as any).updateVersion(tempDir, true);
      
      expect(versionInfo.type).toBe('major');
    });

    it('should handle missing package.json', async () => {
      rmSync(join(tempDir, 'package.json'));
      
      await expect((workflowManager as any).updateVersion(tempDir, true)).rejects.toThrow('No package.json found');
    });
  });

  describe('bumpVersion', () => {
    it('should bump patch version', () => {
      const result = (workflowManager as any).bumpVersion('1.0.0', 'patch');
      expect(result).toBe('1.0.1');
    });

    it('should bump minor version', () => {
      const result = (workflowManager as any).bumpVersion('1.0.0', 'minor');
      expect(result).toBe('1.1.0');
    });

    it('should bump major version', () => {
      const result = (workflowManager as any).bumpVersion('1.0.0', 'major');
      expect(result).toBe('2.0.0');
    });

    it('should handle complex version numbers', () => {
      const result = (workflowManager as any).bumpVersion('1.2.3', 'patch');
      expect(result).toBe('1.2.4');
    });
  });

  describe('findCommonPath', () => {
    it('should find common path prefix', () => {
      const files = ['src/components/Button.js', 'src/components/Input.js', 'src/utils/helper.js'];
      const result = (workflowManager as any).findCommonPath(files);
      
      expect(result).toBe('src');
    });

    it('should return null for empty file list', () => {
      const result = (workflowManager as any).findCommonPath([]);
      
      expect(result).toBeNull();
    });

    it('should return null for files with no common path', () => {
      const files = ['file1.js', 'file2.js'];
      const result = (workflowManager as any).findCommonPath(files);
      
      expect(result).toBeNull();
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect((workflowManager as any).formatBytes(0)).toBe('0 B');
      expect((workflowManager as any).formatBytes(1024)).toBe('1 KB');
      expect((workflowManager as any).formatBytes(1048576)).toBe('1 MB');
      expect((workflowManager as any).formatBytes(1073741824)).toBe('1 GB');
    });

    it('should handle decimal values', () => {
      const result = (workflowManager as any).formatBytes(1536);
      expect(result).toBe('1.5 KB');
    });
  });
});
