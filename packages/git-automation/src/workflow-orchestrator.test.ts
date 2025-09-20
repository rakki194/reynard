import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GitWorkflowOrchestrator } from "./workflow-orchestrator.js";
import { JunkFileDetector } from "./junk-detector.js";
import { ChangeAnalyzer } from "./change-analyzer.js";
import { CommitMessageGenerator } from "./commit-generator.js";
import { ChangelogManager } from "./changelog-manager.js";
import { VersionManager } from "./version-manager.js";

// Mock all dependencies
vi.mock("./junk-detector.js");
vi.mock("./change-analyzer.js");
vi.mock("./commit-generator.js");
vi.mock("./changelog-manager.js");
vi.mock("./version-manager.js");
vi.mock("chalk", () => ({
  default: {
    blue: (text: string) => text,
    green: (text: string) => text,
    yellow: (text: string) => text,
    cyan: (text: string) => text,
    gray: (text: string) => text,
    red: (text: string) => text,
  },
}));
vi.mock("ora", () => ({
  default: () => ({
    start: () => ({ succeed: vi.fn(), fail: vi.fn(), warn: vi.fn() }),
  }),
}));

describe("GitWorkflowOrchestrator", () => {
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
      promoteToVersion: vi.fn(),
      addEntry: vi.fn(),
    };
    mockVersionManager = {
      getCurrentVersion: vi.fn(),
      calculateNextVersion: vi.fn(),
      getVersionInfo: vi.fn(),
      updateVersion: vi.fn(),
      createGitTag: vi.fn(),
      pushGitTag: vi.fn(),
      bumpVersion: vi.fn(),
    };

    // Mock the constructors
    vi.mocked(JunkFileDetector).mockImplementation(() => mockJunkDetector);
    vi.mocked(ChangeAnalyzer).mockImplementation(() => mockChangeAnalyzer);
    vi.mocked(CommitMessageGenerator).mockImplementation(() => mockCommitGenerator);
    vi.mocked(ChangelogManager).mockImplementation(() => mockChangelogManager);
    vi.mocked(VersionManager).mockImplementation(() => mockVersionManager);

    orchestrator = new GitWorkflowOrchestrator();

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("executeWorkflow", () => {
    it("should execute complete workflow successfully", async () => {
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
            type: "feature",
            files: [
              { file: "src/components/Button.tsx", status: "added" },
              { file: "src/components/Modal.tsx", status: "added" },
            ],
            impact: "medium",
            description: "New features and capabilities (2 files)",
          },
        ],
        versionBumpType: "minor",
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: false,
      };
      mockChangeAnalyzer.analyzeChanges.mockResolvedValue(mockAnalysis);

      // Mock commit message generation
      const mockCommitMessage = {
        type: "feat",
        scope: "components",
        description: "add new features and capabilities",
        body: "Detailed description",
        footer: "Version bump: minor",
        fullMessage:
          "feat(components): add new features and capabilities\n\nDetailed description\n\nVersion bump: minor",
      };
      mockCommitGenerator.generateCommitMessage.mockReturnValue(mockCommitMessage);

      // Mock version management
      mockVersionManager.getCurrentVersion.mockResolvedValue("1.2.3");
      mockVersionManager.calculateNextVersion.mockReturnValue("1.3.0");
      mockVersionManager.getVersionInfo.mockResolvedValue({
        current: "1.2.3",
        next: "1.3.0",
        bumpType: "minor"
      });
      mockVersionManager.updateVersion.mockResolvedValue();
      mockVersionManager.createGitTag.mockResolvedValue();
      mockVersionManager.pushGitTag.mockResolvedValue();

      // Mock changelog management
      mockChangelogManager.promoteToVersion.mockResolvedValue();

      await orchestrator.executeWorkflow({
        workingDir: ".",
        cleanup: true,
        commit: true,
        version: true,
        changelog: true,
        dryRun: false,
      });

      // Verify that the mocked methods were called
      expect(mockJunkDetector.detectJunkFiles).toHaveBeenCalled();
      expect(mockChangeAnalyzer.analyzeChanges).toHaveBeenCalled();
      expect(mockCommitGenerator.generateCommitMessage).toHaveBeenCalled();
      expect(mockVersionManager.getVersionInfo).toHaveBeenCalled();
      expect(mockVersionManager.bumpVersion).toHaveBeenCalled();
      expect(mockChangelogManager.promoteToVersion).toHaveBeenCalled();
    });

    it("should handle junk files detection and cleanup", async () => {
      // Mock junk detection - has junk files
      mockJunkDetector.detectJunkFiles.mockResolvedValue({
        hasJunk: true,
        totalFiles: 3,
        categories: [
          {
            category: "python",
            files: ["__pycache__/module.pyc", "venv/lib/", ".pytest_cache/"],
            count: 3,
          },
        ],
        recommendations: ["🔧 Recommended actions:"],
      });
      mockJunkDetector.cleanupJunkFiles.mockResolvedValue();

      // Mock change analysis
      const mockAnalysis = {
        totalFiles: 1,
        totalAdditions: 5,
        totalDeletions: 2,
        categories: [
          {
            type: "fix",
            files: [{ file: "src/utils/helper.ts", status: "modified" }],
            impact: "medium",
            description: "Bug fixes and issue resolution (1 files)",
          },
        ],
        versionBumpType: "patch",
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: false,
      };
      mockChangeAnalyzer.analyzeChanges.mockResolvedValue(mockAnalysis);

      // Mock commit message generation
      const mockCommitMessage = {
        type: "fix",
        scope: "utils",
        description: "fix bugs and resolve issues",
        body: undefined,
        footer: undefined,
        fullMessage: "fix(utils): fix bugs and resolve issues",
      };
      mockCommitGenerator.generateCommitMessage.mockReturnValue(mockCommitMessage);

      // Mock version management
      mockVersionManager.getCurrentVersion.mockResolvedValue("1.2.3");
      mockVersionManager.calculateNextVersion.mockReturnValue("1.2.4");
      mockVersionManager.updateVersion.mockResolvedValue();

      // Mock changelog management
      mockChangelogManager.promoteToVersion.mockResolvedValue();

      await orchestrator.executeWorkflow({
        workingDir: ".",
        cleanup: true,
        dryRun: false,
      });

      expect(mockJunkDetector.detectJunkFiles).toHaveBeenCalled();
      expect(mockJunkDetector.cleanupJunkFiles).toHaveBeenCalled();
    });

    it("should handle dry run mode", async () => {
      // Mock junk detection
      mockJunkDetector.detectJunkFiles.mockResolvedValue({
        hasJunk: false,
        totalFiles: 0,
        categories: [],
        recommendations: ["✅ Repository is clean - no junk files detected"],
      });

      // Mock change analysis
      const mockAnalysis = {
        totalFiles: 1,
        totalAdditions: 5,
        totalDeletions: 2,
        categories: [
          {
            type: "fix",
            files: [{ file: "src/utils/helper.ts", status: "modified" }],
            impact: "medium",
            description: "Bug fixes and issue resolution (1 files)",
          },
        ],
        versionBumpType: "patch",
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: false,
      };
      mockChangeAnalyzer.analyzeChanges.mockResolvedValue(mockAnalysis);

      // Mock commit message generation
      const mockCommitMessage = {
        type: "fix",
        scope: "utils",
        description: "fix bugs and resolve issues",
        body: undefined,
        footer: undefined,
        fullMessage: "fix(utils): fix bugs and resolve issues",
      };
      mockCommitGenerator.generateCommitMessage.mockReturnValue(mockCommitMessage);

      // Mock version management
      mockVersionManager.getCurrentVersion.mockResolvedValue("1.2.3");
      mockVersionManager.calculateNextVersion.mockReturnValue("1.2.4");
      mockVersionManager.getVersionInfo.mockResolvedValue({
        current: "1.2.3",
        next: "1.2.4",
        bumpType: "patch"
      });

      await orchestrator.executeWorkflow({
        workingDir: ".",
        cleanup: true,
        commit: true,
        version: true,
        changelog: true,
        dryRun: true,
      });

      expect(mockJunkDetector.detectJunkFiles).toHaveBeenCalled();
      expect(mockChangeAnalyzer.analyzeChanges).toHaveBeenCalled();
      expect(mockCommitGenerator.generateCommitMessage).toHaveBeenCalled();
      expect(mockVersionManager.updateVersion).not.toHaveBeenCalled();
      expect(mockVersionManager.createGitTag).not.toHaveBeenCalled();
      expect(mockVersionManager.pushGitTag).not.toHaveBeenCalled();
      expect(mockChangelogManager.promoteToVersion).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      // Mock junk detection error
      mockJunkDetector.detectJunkFiles.mockRejectedValue(new Error("Junk detection failed"));

      await expect(orchestrator.executeWorkflow({
        workingDir: ".",
        cleanup: true,
        dryRun: false,
      })).rejects.toThrow("Junk detection failed");
    });

    it("should handle change analysis errors", async () => {
      // Mock junk detection - no junk files
      mockJunkDetector.detectJunkFiles.mockResolvedValue({
        hasJunk: false,
        totalFiles: 0,
        categories: [],
        recommendations: ["✅ Repository is clean - no junk files detected"],
      });

      // Mock change analysis error
      mockChangeAnalyzer.analyzeChanges.mockRejectedValue(new Error("Change analysis failed"));

      await expect(orchestrator.executeWorkflow({
        workingDir: ".",
        dryRun: false,
      })).rejects.toThrow("Change analysis failed");
    });

    it("should handle version management errors", async () => {
      // Mock junk detection - no junk files
      mockJunkDetector.detectJunkFiles.mockResolvedValue({
        hasJunk: false,
        totalFiles: 0,
        categories: [],
        recommendations: ["✅ Repository is clean - no junk files detected"],
      });

      // Mock change analysis
      const mockAnalysis = {
        totalFiles: 1,
        totalAdditions: 5,
        totalDeletions: 2,
        categories: [
          {
            type: "fix",
            files: [{ file: "src/utils/helper.ts", status: "modified" }],
            impact: "medium",
            description: "Bug fixes and issue resolution (1 files)",
          },
        ],
        versionBumpType: "patch",
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: false,
      };
      mockChangeAnalyzer.analyzeChanges.mockResolvedValue(mockAnalysis);

      // Mock commit message generation
      const mockCommitMessage = {
        type: "fix",
        scope: "utils",
        description: "fix bugs and resolve issues",
        body: undefined,
        footer: undefined,
        fullMessage: "fix(utils): fix bugs and resolve issues",
      };
      mockCommitGenerator.generateCommitMessage.mockReturnValue(mockCommitMessage);

      // Mock version management error
      mockVersionManager.bumpVersion.mockRejectedValue(new Error("Version management failed"));

      await expect(orchestrator.executeWorkflow({
        workingDir: ".",
        version: true,
        dryRun: false,
      })).rejects.toThrow("Version management failed");
    });
  });

});
