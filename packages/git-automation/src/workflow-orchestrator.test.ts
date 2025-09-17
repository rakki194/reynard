import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitWorkflowOrchestrator } from './workflow-orchestrator.js';
import { JunkFileDetector } from './junk-detector.js';
import { ChangeAnalyzer } from './change-analyzer.js';
import { CommitMessageGenerator } from './commit-generator.js';
import { ChangelogManager } from './changelog-manager.js';
import { VersionManager } from './version-manager.js';

// Mock all dependencies
vi.mock('./junk-detector.js');
vi.mock('./change-analyzer.js');
vi.mock('./commit-generator.js');
vi.mock('./changelog-manager.js');
vi.mock('./version-manager.js');
vi.mock('chalk', () => ({
  default: {
    blue: (text: string) => text,
    green: (text: string) => text,
    yellow: (text: string) => text,
    cyan: (text: string) => text,
    gray: (text: string) => text,
    red: (text: string) => text,
  },
}));
vi.mock('ora', () => ({
  default: () => ({
    start: () => ({ succeed: vi.fn(), fail: vi.fn(), warn: vi.fn() }),
  }),
}));

describe('GitWorkflowOrchestrator', () => {
  let orchestrator: GitWorkflowOrchestrator;
  let mockJunkDetector: any;
  let mockChangeAnalyzer: any;
  let mockCommitGenerator: any;
  let mockChangelogManager: any;
  let mockVersionManager: any;

  beforeEach(() => {
    // Create mock instances
    mockJunkDetector = {
      detectJunkFiles: vi.fn(),
      cleanupJunkFiles: vi.fn(),
    };
    mockChangeAnalyzer = {
      analyzeChanges: vi.fn(),
    };
    mockCommitGenerator = {
      generateCommitMessage: vi.fn(),
    };
    mockChangelogManager = {
      promoteUnreleasedToRelease: vi.fn(),
      addUnreleasedEntry: vi.fn(),
    };
    mockVersionManager = {
      getCurrentVersion: vi.fn(),
      calculateNextVersion: vi.fn(),
      updateVersion: vi.fn(),
      createGitTag: vi.fn(),
      pushGitTag: vi.fn(),
    };

    // Mock the constructors
    vi.mocked(JunkFileDetector).mockImplementation(() => mockJunkDetector);
    vi.mocked(ChangeAnalyzer).mockImplementation(() => mockChangeAnalyzer);
    vi.mocked(CommitMessageGenerator).mockImplementation(() => mockCommitGenerator);
    vi.mocked(ChangelogManager).mockImplementation(() => mockChangelogManager);
    vi.mocked(VersionManager).mockImplementation(() => mockVersionManager);

    orchestrator = new GitWorkflowOrchestrator('.');
    
    // Replace the instances with our mocks
    orchestrator.junkDetector = mockJunkDetector;
    orchestrator.changeAnalyzer = mockChangeAnalyzer;
    orchestrator.commitGenerator = mockCommitGenerator;
    orchestrator.changelogManager = mockChangelogManager;
    orchestrator.versionManager = mockVersionManager;
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('executeWorkflow', () => {
    it('should execute complete workflow successfully', async () => {
      // Mock junk detection - no junk files
      mockJunkDetector.detectJunkFiles.mockResolvedValue({
        hasJunk: false,
        totalFiles: 0,
        categories: [],
      });

      // Mock change analysis
      const mockAnalysis = {
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
      mockChangeAnalyzer.analyzeChanges.mockResolvedValue(mockAnalysis);

      // Mock commit message generation
      const mockCommitMessage = {
        type: 'feat',
        scope: 'components',
        description: 'add new features and capabilities',
        body: 'Detailed description',
        footer: 'Version bump: minor',
        fullMessage: 'feat(components): add new features and capabilities\n\nDetailed description\n\nVersion bump: minor',
      };
      mockCommitGenerator.generateCommitMessage.mockReturnValue(mockCommitMessage);

      // Mock version management
      mockVersionManager.getCurrentVersion.mockResolvedValue('1.2.3');
      mockVersionManager.calculateNextVersion.mockReturnValue('1.3.0');
      mockVersionManager.updateVersion.mockResolvedValue();
      mockVersionManager.createGitTag.mockResolvedValue();
      mockVersionManager.pushGitTag.mockResolvedValue();

      // Mock changelog management
      mockChangelogManager.promoteUnreleasedToRelease.mockResolvedValue();

      const result = await orchestrator.executeWorkflow({
        autoConfirm: true,
        dryRun: false,
        cleanupJunk: false,
        createTag: true,
        pushTag: true,
      });

      expect(result.success).toBe(true);
      expect(result.junkDetection.hasJunk).toBe(false);
      expect(result.changeAnalysis.totalFiles).toBe(2);
      expect(result.commitMessage.type).toBe('feat');
      expect(result.versionInfo.nextVersion).toBe('1.3.0');
      expect(result.actionsPerformed).toContain('junk_detection');
      expect(result.actionsPerformed).toContain('change_analysis');
      expect(result.actionsPerformed).toContain('commit_message_generation');
      expect(result.actionsPerformed).toContain('version_update');
      expect(result.actionsPerformed).toContain('changelog_promotion');
      expect(result.actionsPerformed).toContain('git_tag_creation');
      expect(result.actionsPerformed).toContain('git_tag_push');
    });

    it('should handle junk files detection and cleanup', async () => {
      // Mock junk detection - has junk files
      mockJunkDetector.detectJunkFiles.mockResolvedValue({
        hasJunk: true,
        totalFiles: 3,
        categories: [
          {
            category: 'python',
            files: ['__pycache__/module.pyc', 'venv/lib/', '.pytest_cache/'],
            count: 3,
          },
        ],
        recommendations: ['🔧 Recommended actions:'],
      });
      mockJunkDetector.cleanupJunkFiles.mockResolvedValue();

      // Mock change analysis
      const mockAnalysis = {
        totalFiles: 1,
        totalAdditions: 5,
        totalDeletions: 2,
        categories: [
          {
            type: 'fix',
            files: [{ file: 'src/utils/helper.ts', status: 'modified' }],
            impact: 'medium',
            description: 'Bug fixes and issue resolution (1 files)',
          },
        ],
        versionBumpType: 'patch',
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: false,
      };
      mockChangeAnalyzer.analyzeChanges.mockResolvedValue(mockAnalysis);

      // Mock commit message generation
      const mockCommitMessage = {
        type: 'fix',
        scope: 'utils',
        description: 'fix bugs and resolve issues',
        body: undefined,
        footer: undefined,
        fullMessage: 'fix(utils): fix bugs and resolve issues',
      };
      mockCommitGenerator.generateCommitMessage.mockReturnValue(mockCommitMessage);

      // Mock version management
      mockVersionManager.getCurrentVersion.mockResolvedValue('1.2.3');
      mockVersionManager.calculateNextVersion.mockReturnValue('1.2.4');
      mockVersionManager.updateVersion.mockResolvedValue();

      // Mock changelog management
      mockChangelogManager.promoteUnreleasedToRelease.mockResolvedValue();

      const result = await orchestrator.executeWorkflow({
        autoConfirm: true,
        dryRun: false,
        cleanupJunk: true,
        createTag: false,
        pushTag: false,
      });

      expect(result.success).toBe(true);
      expect(result.junkDetection.hasJunk).toBe(true);
      expect(mockJunkDetector.cleanupJunkFiles).toHaveBeenCalled();
      expect(result.actionsPerformed).toContain('junk_cleanup');
    });

    it('should handle dry run mode', async () => {
      // Mock junk detection
      mockJunkDetector.detectJunkFiles.mockResolvedValue({
        hasJunk: false,
        totalFiles: 0,
        categories: [],
        recommendations: ['✅ Repository is clean - no junk files detected'],
      });

      // Mock change analysis
      const mockAnalysis = {
        totalFiles: 1,
        totalAdditions: 5,
        totalDeletions: 2,
        categories: [
          {
            type: 'fix',
            files: [{ file: 'src/utils/helper.ts', status: 'modified' }],
            impact: 'medium',
            description: 'Bug fixes and issue resolution (1 files)',
          },
        ],
        versionBumpType: 'patch',
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: false,
      };
      mockChangeAnalyzer.analyzeChanges.mockResolvedValue(mockAnalysis);

      // Mock commit message generation
      const mockCommitMessage = {
        type: 'fix',
        scope: 'utils',
        description: 'fix bugs and resolve issues',
        body: undefined,
        footer: undefined,
        fullMessage: 'fix(utils): fix bugs and resolve issues',
      };
      mockCommitGenerator.generateCommitMessage.mockReturnValue(mockCommitMessage);

      // Mock version management
      mockVersionManager.getCurrentVersion.mockResolvedValue('1.2.3');
      mockVersionManager.calculateNextVersion.mockReturnValue('1.2.4');

      const result = await orchestrator.executeWorkflow({
        autoConfirm: true,
        dryRun: true,
        cleanupJunk: false,
        createTag: true,
        pushTag: true,
      });

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      expect(mockVersionManager.updateVersion).not.toHaveBeenCalled();
      expect(mockVersionManager.createGitTag).not.toHaveBeenCalled();
      expect(mockVersionManager.pushGitTag).not.toHaveBeenCalled();
      expect(mockChangelogManager.promoteUnreleasedToRelease).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Mock junk detection error
      mockJunkDetector.detectJunkFiles.mockRejectedValue(new Error('Junk detection failed'));

      const result = await orchestrator.executeWorkflow({
        autoConfirm: true,
        dryRun: false,
        cleanupJunk: false,
        createTag: false,
        pushTag: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Junk detection failed');
      expect(result.actionsPerformed).toContain('junk_detection');
    });

    it('should handle change analysis errors', async () => {
      // Mock junk detection - no junk files
      mockJunkDetector.detectJunkFiles.mockResolvedValue({
        hasJunk: false,
        totalFiles: 0,
        categories: [],
        recommendations: ['✅ Repository is clean - no junk files detected'],
      });

      // Mock change analysis error
      mockChangeAnalyzer.analyzeChanges.mockRejectedValue(new Error('Change analysis failed'));

      const result = await orchestrator.executeWorkflow({
        autoConfirm: true,
        dryRun: false,
        cleanupJunk: false,
        createTag: false,
        pushTag: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Change analysis failed');
      expect(result.actionsPerformed).toContain('junk_detection');
      expect(result.actionsPerformed).toContain('change_analysis');
    });

    it('should handle version management errors', async () => {
      // Mock junk detection - no junk files
      mockJunkDetector.detectJunkFiles.mockResolvedValue({
        hasJunk: false,
        totalFiles: 0,
        categories: [],
        recommendations: ['✅ Repository is clean - no junk files detected'],
      });

      // Mock change analysis
      const mockAnalysis = {
        totalFiles: 1,
        totalAdditions: 5,
        totalDeletions: 2,
        categories: [
          {
            type: 'fix',
            files: [{ file: 'src/utils/helper.ts', status: 'modified' }],
            impact: 'medium',
            description: 'Bug fixes and issue resolution (1 files)',
          },
        ],
        versionBumpType: 'patch',
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: false,
      };
      mockChangeAnalyzer.analyzeChanges.mockResolvedValue(mockAnalysis);

      // Mock commit message generation
      const mockCommitMessage = {
        type: 'fix',
        scope: 'utils',
        description: 'fix bugs and resolve issues',
        body: undefined,
        footer: undefined,
        fullMessage: 'fix(utils): fix bugs and resolve issues',
      };
      mockCommitGenerator.generateCommitMessage.mockReturnValue(mockCommitMessage);

      // Mock version management error
      mockVersionManager.getCurrentVersion.mockRejectedValue(new Error('Version management failed'));

      const result = await orchestrator.executeWorkflow({
        autoConfirm: true,
        dryRun: false,
        cleanupJunk: false,
        createTag: true,
        pushTag: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Version management failed');
      expect(result.actionsPerformed).toContain('junk_detection');
      expect(result.actionsPerformed).toContain('change_analysis');
      expect(result.actionsPerformed).toContain('commit_message_generation');
      expect(result.actionsPerformed).toContain('version_management');
    });
  });

  describe('quickWorkflow', () => {
    it('should execute quick workflow with auto-confirm', async () => {
      // Mock all dependencies to succeed
      mockJunkDetector.detectJunkFiles.mockResolvedValue({
        hasJunk: false,
        totalFiles: 0,
        categories: [],
        recommendations: ['✅ Repository is clean - no junk files detected'],
      });

      const mockAnalysis = {
        totalFiles: 1,
        totalAdditions: 5,
        totalDeletions: 2,
        categories: [
          {
            type: 'fix',
            files: [{ file: 'src/utils/helper.ts', status: 'modified' }],
            impact: 'medium',
            description: 'Bug fixes and issue resolution (1 files)',
          },
        ],
        versionBumpType: 'patch',
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: false,
      };
      mockChangeAnalyzer.analyzeChanges.mockResolvedValue(mockAnalysis);

      const mockCommitMessage = {
        type: 'fix',
        scope: 'utils',
        description: 'fix bugs and resolve issues',
        body: undefined,
        footer: undefined,
        fullMessage: 'fix(utils): fix bugs and resolve issues',
      };
      mockCommitGenerator.generateCommitMessage.mockReturnValue(mockCommitMessage);

      mockVersionManager.getCurrentVersion.mockResolvedValue('1.2.3');
      mockVersionManager.calculateNextVersion.mockReturnValue('1.2.4');
      mockVersionManager.updateVersion.mockResolvedValue();
      mockChangelogManager.promoteUnreleasedToRelease.mockResolvedValue();

      const result = await orchestrator.quickWorkflow();

      expect(result.success).toBe(true);
      expect(result.autoConfirm).toBe(true);
      expect(result.cleanupJunk).toBe(true);
      expect(result.createTag).toBe(true);
      expect(result.pushTag).toBe(true);
    });
  });

  describe('getWorkflowStatus', () => {
    it('should return workflow status information', () => {
      const status = orchestrator.getWorkflowStatus();

      expect(status).toHaveProperty('workingDirectory');
      expect(status).toHaveProperty('components');
      expect(status).toHaveProperty('capabilities');
      expect(status.workingDirectory).toBe('.');
      expect(status.components).toHaveLength(5);
      expect(status.components).toContain('JunkFileDetector');
      expect(status.components).toContain('ChangeAnalyzer');
      expect(status.components).toContain('CommitMessageGenerator');
      expect(status.components).toContain('ChangelogManager');
      expect(status.components).toContain('VersionManager');
      expect(status.capabilities).toContain('junk_file_detection');
      expect(status.capabilities).toContain('change_analysis');
      expect(status.capabilities).toContain('commit_message_generation');
      expect(status.capabilities).toContain('changelog_management');
      expect(status.capabilities).toContain('version_management');
      expect(status.capabilities).toContain('git_tag_management');
    });
  });
});
