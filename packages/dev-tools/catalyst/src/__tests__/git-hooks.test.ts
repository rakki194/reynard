/**
 * 🦊 Reynard Catalyst Git Hooks Tests
 * 
 * Comprehensive tests for the git hooks system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join, resolve } from 'path';
import { HookManager } from '../git-hooks/HookManager.js';
import type { HookConfig, GitHookType } from '../types/GitHooks.js';

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

describe('HookManager', () => {
  let tempDir: string;
  let hookManager: HookManager;
  let mockConfig: Partial<HookConfig>;

  beforeEach(() => {
    // Create a temporary directory for testing
    tempDir = join('/tmp', 'temp-test-git-repo');
    mkdirSync(tempDir, { recursive: true });
    mkdirSync(join(tempDir, '.git'), { recursive: true });
    mkdirSync(join(tempDir, '.git', 'hooks'), { recursive: true });

    mockConfig = {
      hooks: {
        'pre-commit': {
          enabled: true,
          scripts: [
            {
              name: 'Test Script',
              command: 'echo "test"',
              failOnError: false
            }
          ]
        },
        'commit-msg': {
          enabled: true,
          scripts: []
        },
        'pre-push': {
          enabled: true,
          scripts: []
        }
      }
    };

    // Mock process.cwd to return our temp directory
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
  });

  afterEach(() => {
    // Clean up temp directory
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      hookManager = new HookManager();
      expect(hookManager).toBeDefined();
    });

    it('should initialize with custom config', () => {
      hookManager = new HookManager(mockConfig);
      expect(hookManager).toBeDefined();
    });

    it('should throw error if not in git repository', () => {
      vi.spyOn(process, 'cwd').mockReturnValue('/tmp');
      expect(() => new HookManager()).toThrow('Not a Git repository');
    });
  });

  describe('installHooks', () => {
    beforeEach(() => {
      hookManager = new HookManager(mockConfig);
    });

    it('should install all hooks', async () => {
      await hookManager.installHooks();

      const hooksDir = join(tempDir, '.git', 'hooks');
      expect(existsSync(join(hooksDir, 'pre-commit'))).toBe(true);
      expect(existsSync(join(hooksDir, 'commit-msg'))).toBe(true);
      expect(existsSync(join(hooksDir, 'pre-push'))).toBe(true);
    });

    it('should create hooks directory if it does not exist', async () => {
      rmSync(join(tempDir, '.git', 'hooks'), { recursive: true, force: true });
      
      await hookManager.installHooks();
      
      expect(existsSync(join(tempDir, '.git', 'hooks'))).toBe(true);
    });

    it('should generate correct hook scripts', async () => {
      await hookManager.installHooks();

      const preCommitPath = join(tempDir, '.git', 'hooks', 'pre-commit');
      const preCommitContent = readFileSync(preCommitPath, 'utf8');
      
      expect(preCommitContent).toContain('reynard-git-hooks');
      expect(preCommitContent).toContain('pre-commit');
    });
  });

  describe('uninstallHooks', () => {
    beforeEach(() => {
      hookManager = new HookManager(mockConfig);
    });

    it('should remove all hooks', async () => {
      // First install hooks
      await hookManager.installHooks();
      
      // Then uninstall them
      await hookManager.uninstallHooks();

      const hooksDir = join(tempDir, '.git', 'hooks');
      expect(existsSync(join(hooksDir, 'pre-commit'))).toBe(false);
      expect(existsSync(join(hooksDir, 'commit-msg'))).toBe(false);
      expect(existsSync(join(hooksDir, 'pre-push'))).toBe(false);
    });

    it('should handle non-existent hooks gracefully', async () => {
      // Try to uninstall without installing first
      await expect(hookManager.uninstallHooks()).resolves.not.toThrow();
    });
  });

  describe('runHook', () => {
    beforeEach(() => {
      hookManager = new HookManager(mockConfig);
    });

    it('should run enabled hooks successfully', async () => {
      const result = await hookManager.runHook('pre-commit', []);
      
      expect(result.success).toBe(true);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toContain('Test Script');
    });

    it('should skip disabled hooks', async () => {
      const disabledConfig = {
        ...mockConfig,
        hooks: {
          ...mockConfig.hooks!,
          'pre-commit': {
            enabled: false,
            scripts: []
          }
        }
      };
      
      hookManager = new HookManager(disabledConfig);
      const result = await hookManager.runHook('pre-commit', []);
      
      expect(result.success).toBe(true);
      expect(result.messages[0]).toContain('disabled');
    });

    it('should handle script failures', async () => {
      const failingConfig = {
        ...mockConfig,
        hooks: {
          ...mockConfig.hooks!,
          'pre-commit': {
            enabled: true,
            scripts: [
              {
                name: 'Failing Script',
                command: 'exit 1',
                failOnError: false
              }
            ]
          }
        }
      };
      
      hookManager = new HookManager(failingConfig);
      const result = await hookManager.runHook('pre-commit', []);
      
      expect(result.success).toBe(false);
      expect(result.messages[0]).toContain('Failing Script');
    });

    it('should stop on critical failures', async () => {
      const criticalConfig = {
        ...mockConfig,
        hooks: {
          ...mockConfig.hooks!,
          'pre-commit': {
            enabled: true,
            scripts: [
              {
                name: 'Critical Script',
                command: 'exit 1',
                failOnError: true
              },
              {
                name: 'Should Not Run',
                command: 'echo "should not run"',
                failOnError: false
              }
            ]
          }
        }
      };
      
      hookManager = new HookManager(criticalConfig);
      const result = await hookManager.runHook('pre-commit', []);
      
      expect(result.success).toBe(false);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toContain('Critical Script');
    });
  });

  describe('specific hook runners', () => {
    beforeEach(() => {
      hookManager = new HookManager(mockConfig);
    });

    it('should run pre-commit hook', async () => {
      const result = await hookManager.runPreCommit();
      expect(typeof result).toBe('boolean');
    });

    it('should run commit-msg hook', async () => {
      const messageFile = join(tempDir, 'commit-msg.txt');
      writeFileSync(messageFile, 'test commit message');
      
      const result = await hookManager.runCommitMsg(messageFile);
      expect(typeof result).toBe('boolean');
      
      rmSync(messageFile);
    });

    it('should run pre-push hook', async () => {
      const result = await hookManager.runPrePush();
      expect(typeof result).toBe('boolean');
    });
  });
});
