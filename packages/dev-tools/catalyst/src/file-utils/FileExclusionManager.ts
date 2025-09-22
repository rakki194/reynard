/**
 * ⚗️ Catalyst File Exclusion Manager
 * Unified file exclusion patterns for all Reynard dev-tools
 */

import path from 'path';
import type { ExclusionPattern } from '../types/FileUtils.js';

export class FileExclusionManager {
  private static readonly EXCLUSION_PATTERNS: ExclusionPattern[] = [
    // Build and distribution directories
    { pattern: /\/dist\//i, description: 'Distribution directories' },
    { pattern: /\/build\//i, description: 'Build directories' },
    { pattern: /\/coverage\//i, description: 'Coverage directories' },
    { pattern: /\/\.nyc_output\//i, description: 'NYC output directories' },
    
    // Node.js specific
    { pattern: /\/node_modules\//i, description: 'Node modules' },
    { pattern: /\/\.pnp\//i, description: 'Yarn PnP' },
    { pattern: /\/\.pnp\.js$/i, description: 'Yarn PnP files' },
    
    // Package manager files
    { pattern: /pnpm-lock\.yaml$/i, description: 'PNPM lock files' },
    { pattern: /package-lock\.json$/i, description: 'NPM lock files' },
    { pattern: /yarn\.lock$/i, description: 'Yarn lock files' },
    
    // Environment files
    { pattern: /\.env$/i, description: 'Environment files' },
    { pattern: /\.env\..*$/i, description: 'Environment files with suffix' },
    
    // Version control
    { pattern: /\/\.git\//i, description: 'Git directories' },
    { pattern: /\/\.svn\//i, description: 'SVN directories' },
    { pattern: /\/\.hg\//i, description: 'Mercurial directories' },
    
    // IDE and editor files
    { pattern: /\/\.vscode\//i, description: 'VS Code directories' },
    { pattern: /\/\.idea\//i, description: 'IntelliJ IDEA directories' },
    { pattern: /\/\.vscode-test\//i, description: 'VS Code test directories' },
    
    // Cache and temporary files
    { pattern: /\.cache$/i, description: 'Cache files' },
    { pattern: /\.tmp$/i, description: 'Temporary files' },
    { pattern: /\.temp$/i, description: 'Temporary files' },
    { pattern: /\.log$/i, description: 'Log files' },
    { pattern: /\.pid$/i, description: 'PID files' },
    { pattern: /\.lock$/i, description: 'Lock files' },
    { pattern: /\.swp$/i, description: 'Vim swap files' },
    { pattern: /\.swo$/i, description: 'Vim swap files' },
    { pattern: /~$/i, description: 'Backup files' },
    
    // System files
    { pattern: /\.DS_Store$/i, description: 'macOS system files' },
    { pattern: /Thumbs\.db$/i, description: 'Windows thumbnail files' },
    
    // Python specific
    { pattern: /\.pyc$/i, description: 'Python compiled files' },
    { pattern: /\.pyo$/i, description: 'Python optimized files' },
    { pattern: /\.pyd$/i, description: 'Python extension files' },
    { pattern: /\/__pycache__\//i, description: 'Python cache directories' },
    { pattern: /\/\.mypy_cache\//i, description: 'MyPy cache directories' },
    { pattern: /\/\.pytest_cache\//i, description: 'Pytest cache directories' },
    { pattern: /\/\.tox\//i, description: 'Tox directories' },
    { pattern: /\/\.eggs\//i, description: 'Python eggs directories' },
    { pattern: /\/\.eggs-info\//i, description: 'Python eggs-info directories' },
    { pattern: /reynard.*\.egg-info\//i, description: 'Reynard egg-info directories' },
    
    // Test and results directories
    { pattern: /\/test-results\//i, description: 'Test results directories' },
    { pattern: /\/playwright-report\//i, description: 'Playwright report directories' },
    { pattern: /\/dombench-results\//i, description: 'DOMBench results directories' },
    { pattern: /\/results\//i, description: 'Results directories' },
    
    // Build artifacts
    { pattern: /\.tsbuildinfo$/i, description: 'TypeScript build info files' },
    { pattern: /\.so$/i, description: 'Shared object files' },
    { pattern: /\.dylib$/i, description: 'Dynamic library files' },
    { pattern: /\.dll$/i, description: 'Dynamic link library files' },
    { pattern: /\.exe$/i, description: 'Executable files' },
    
    // Third party
    { pattern: /\/third_party\//i, description: 'Third party directories' },
  ];

  /**
   * Check if a file path should be excluded
   */
  static shouldExcludeFile(filePath: string): boolean {
    const normalizedPath = path.resolve(filePath);

    for (const { pattern, description } of this.EXCLUSION_PATTERNS) {
      if (pattern.test(normalizedPath)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a file path should be excluded with reason
   */
  static shouldExcludeFileWithReason(filePath: string): { excluded: boolean; reason?: string } {
    const normalizedPath = path.resolve(filePath);

    for (const { pattern, description } of this.EXCLUSION_PATTERNS) {
      if (pattern.test(normalizedPath)) {
        return { excluded: true, reason: description };
      }
    }

    return { excluded: false };
  }

  /**
   * Get all exclusion patterns
   */
  static getExclusionPatterns(): ExclusionPattern[] {
    return [...this.EXCLUSION_PATTERNS];
  }

  /**
   * Add custom exclusion pattern
   */
  static addExclusionPattern(pattern: RegExp, description: string): void {
    this.EXCLUSION_PATTERNS.push({ pattern, description });
  }

  /**
   * Check if file was recently processed to avoid excessive runs
   */
  static wasRecentlyProcessed(
    filePath: string,
    recentlyProcessed: Map<string, number>,
    cooldown: number
  ): boolean {
    const now = Date.now();
    const lastProcessed = recentlyProcessed.get(filePath);

    if (lastProcessed && now - lastProcessed < cooldown) {
      return true;
    }

    recentlyProcessed.set(filePath, now);
    return false;
  }

  /**
   * Get common junk file patterns
   */
  static getJunkPatterns(): RegExp[] {
    return this.EXCLUSION_PATTERNS.map(({ pattern }) => pattern);
  }
}
