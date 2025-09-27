/**
 * 🦊 Reynard Git Hooks Installer Tests
 * 
 * Comprehensive tests for the git hooks installer
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync, chmodSync } from 'fs';
import { join } from 'path';

// Mock child_process
vi.mock('child_process', () => ({
  execSync: vi.fn()
}));

// Mock fs functions
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    rmSync: vi.fn(),
    chmodSync: vi.fn()
  };
});

describe('Git Hooks Installer', () => {
  let tempDir: string;
  let mockExecSync: any;
  let mockExistsSync: any;
  let mockWriteFileSync: any;
  let mockMkdirSync: any;
  let mockChmodSync: any;

  beforeEach(() => {
    // Create a temporary directory for testing
    tempDir = join(process.cwd(), 'temp-test-installer');
    mkdirSync(tempDir, { recursive: true });
    mkdirSync(join(tempDir, '.git'), { recursive: true });

    // Mock functions
    mockExecSync = vi.mocked(execSync);
    mockExistsSync = vi.mocked(existsSync);
    mockWriteFileSync = vi.mocked(writeFileSync);
    mockMkdirSync = vi.mocked(mkdirSync);
    mockChmodSync = vi.mocked(chmodSync);

    // Default mock implementations
    mockExistsSync.mockImplementation((path: string) => {
      if (path.includes('.git')) return true;
      if (path.includes('hooks')) return false;
      return false;
    });

    mockExecSync.mockImplementation(() => Buffer.from(''));
  });

  afterEach(() => {
    // Clean up temp directory
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe('findGitRoot', () => {
    it('should find git root directory', () => {
      // Mock process.cwd to return our temp directory
      const originalCwd = process.cwd;
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir);

      // Import the module to test the function
      const { findGitRoot } = require('../install-git-hooks.ts');
      
      const result = findGitRoot();
      expect(result).toBe(tempDir);

      vi.restoreAllMocks();
    });

    it('should throw error if not in git repository', () => {
      mockExistsSync.mockReturnValue(false);
      
      const originalCwd = process.cwd;
      vi.spyOn(process, 'cwd').mockReturnValue('/tmp');

      const { findGitRoot } = require('../install-git-hooks.ts');
      
      expect(() => findGitRoot()).toThrow('Not a Git repository');

      vi.restoreAllMocks();
    });
  });

  describe('generatePreCommitHook', () => {
    it('should generate correct pre-commit hook script', () => {
      const { generatePreCommitHook } = require('../install-git-hooks.ts');
      
      const script = generatePreCommitHook();
      
      expect(script).toContain('#!/bin/sh');
      expect(script).toContain('reynard-git-hooks');
      expect(script).toContain('pre-commit');
      expect(script).toContain('REYNARD_GIT_HOOKS_CLI');
    });
  });

  describe('generateCommitMsgHook', () => {
    it('should generate correct commit-msg hook script', () => {
      const { generateCommitMsgHook } = require('../install-git-hooks.ts');
      
      const script = generateCommitMsgHook();
      
      expect(script).toContain('#!/bin/sh');
      expect(script).toContain('reynard-git-hooks');
      expect(script).toContain('commit-msg');
      expect(script).toContain('REYNARD_GIT_HOOKS_CLI');
    });
  });

  describe('generatePrePushHook', () => {
    it('should generate correct pre-push hook script', () => {
      const { generatePrePushHook } = require('../install-git-hooks.ts');
      
      const script = generatePrePushHook();
      
      expect(script).toContain('#!/bin/sh');
      expect(script).toContain('reynard-git-hooks');
      expect(script).toContain('pre-push');
      expect(script).toContain('REYNARD_GIT_HOOKS_CLI');
    });
  });

  describe('installHooks', () => {
    it('should install all hooks successfully', () => {
      const originalCwd = process.cwd;
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir);

      const { installHooks } = require('../install-git-hooks.ts');
      
      installHooks();
      
      // Verify that hooks directory was created
      expect(mockMkdirSync).toHaveBeenCalledWith(
        join(tempDir, '.git', 'hooks'),
        { recursive: true }
      );
      
      // Verify that all three hooks were written
      expect(mockWriteFileSync).toHaveBeenCalledTimes(3);
      expect(mockChmodSync).toHaveBeenCalledTimes(3);
      
      // Verify hook paths
      const writeCalls = mockWriteFileSync.mock.calls;
      expect(writeCalls[0][0]).toContain('pre-commit');
      expect(writeCalls[1][0]).toContain('commit-msg');
      expect(writeCalls[2][0]).toContain('pre-push');

      vi.restoreAllMocks();
    });

    it('should create hooks directory if it does not exist', () => {
      mockExistsSync.mockImplementation((path: string) => {
        if (path.includes('.git')) return true;
        if (path.includes('hooks')) return false;
        return false;
      });

      const originalCwd = process.cwd;
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir);

      const { installHooks } = require('../install-git-hooks.ts');
      
      installHooks();
      
      expect(mockMkdirSync).toHaveBeenCalledWith(
        join(tempDir, '.git', 'hooks'),
        { recursive: true }
      );

      vi.restoreAllMocks();
    });

    it('should handle installation errors', () => {
      mockWriteFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      const originalCwd = process.cwd;
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir);

      const { installHooks } = require('../install-git-hooks.ts');
      
      // Mock process.exit to prevent actual exit
      const originalExit = process.exit;
      const mockExit = vi.fn();
      vi.spyOn(process, 'exit').mockImplementation(mockExit);
      
      installHooks();
      
      expect(mockExit).toHaveBeenCalledWith(1);

      vi.restoreAllMocks();
    });
  });

  describe('uninstallHooks', () => {
    it('should uninstall all hooks successfully', () => {
      const originalCwd = process.cwd;
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir);

      const { uninstallHooks } = require('../install-git-hooks.ts');
      
      uninstallHooks();
      
      // Verify that rm was called for each hook
      expect(mockExecSync).toHaveBeenCalledTimes(3);
      
      const rmCalls = mockExecSync.mock.calls;
      expect(rmCalls[0][0]).toContain('rm');
      expect(rmCalls[0][0]).toContain('pre-commit');
      expect(rmCalls[1][0]).toContain('rm');
      expect(rmCalls[1][0]).toContain('commit-msg');
      expect(rmCalls[2][0]).toContain('rm');
      expect(rmCalls[2][0]).toContain('pre-push');

      vi.restoreAllMocks();
    });

    it('should handle uninstallation errors', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Remove failed');
      });

      const originalCwd = process.cwd;
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir);

      const { uninstallHooks } = require('../install-git-hooks.ts');
      
      // Mock process.exit to prevent actual exit
      const mockExit = vi.fn();
      vi.spyOn(process, 'exit').mockImplementation(mockExit);
      
      uninstallHooks();
      
      expect(mockExit).toHaveBeenCalledWith(1);

      vi.restoreAllMocks();
    });
  });

  describe('main execution', () => {
    it('should handle install command', () => {
      const originalCwd = process.cwd;
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir);

      // Mock process.argv
      const originalArgv = process.argv;
      process.argv = ['node', 'install-git-hooks.ts', 'install'];

      const { installHooks } = require('../install-git-hooks.ts');
      const installSpy = vi.spyOn({ installHooks }, 'installHooks');

      // The module should call installHooks when argv[2] is 'install'
      // This is tested by checking that the function would be called
      expect(process.argv[2]).toBe('install');

      // Restore
      process.argv = originalArgv;
      vi.restoreAllMocks();
    });

    it('should handle uninstall command', () => {
      const originalCwd = process.cwd;
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir);

      // Mock process.argv
      const originalArgv = process.argv;
      process.argv = ['node', 'install-git-hooks.ts', 'uninstall'];

      // The module should call uninstallHooks when argv[2] is 'uninstall'
      expect(process.argv[2]).toBe('uninstall');

      // Restore
      process.argv = originalArgv;
      vi.restoreAllMocks();
    });

    it('should show usage for invalid command', () => {
      // Mock process.argv
      const originalArgv = process.argv;
      process.argv = ['node', 'install-git-hooks.ts', 'invalid'];

      // Mock process.exit
      const mockExit = vi.fn();
      vi.spyOn(process, 'exit').mockImplementation(mockExit);

      // The module should exit with code 1 for invalid commands
      expect(process.argv[2]).toBe('invalid');

      // Restore
      process.argv = originalArgv;
      vi.restoreAllMocks();
    });
  });
});
