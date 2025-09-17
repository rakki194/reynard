import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ChangeAnalyzer } from "./change-analyzer.js";
import { execa } from "execa";

// Mock dependencies
vi.mock("execa");
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
    start: () => ({ succeed: vi.fn(), fail: vi.fn() }),
  }),
}));

describe("ChangeAnalyzer", () => {
  let analyzer: ChangeAnalyzer;
  const mockExeca = vi.mocked(execa);

  beforeEach(() => {
    analyzer = new ChangeAnalyzer();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("analyzeChanges", () => {
    it("should analyze staged changes", async () => {
      const mockDiffOutput = "M\tsrc/components/Button.tsx\nA\tsrc/components/Modal.tsx\nD\tsrc/old/Component.tsx";
      const mockStatOutput = "2 files changed, 15 insertions(+), 3 deletions(-)";

      mockExeca.mockImplementation((command, args) => {
        if (command === "git" && args.includes("diff") && args.includes("--name-status")) {
          return Promise.resolve({ stdout: mockDiffOutput, stderr: "" } as any);
        }
        if (command === "git" && args.includes("diff") && args.includes("--stat")) {
          return Promise.resolve({ stdout: mockStatOutput, stderr: "" } as any);
        }
        return Promise.resolve({ stdout: "", stderr: "" } as any);
      });

      const result = await analyzer.analyzeChanges(".");

      expect(result.totalFiles).toBe(3);
      expect(result.totalAdditions).toBe(15);
      expect(result.totalDeletions).toBe(3);
      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].type).toBe("feature");
      expect(result.versionBumpType).toBe("minor");
    });

    it("should analyze unstaged changes when no staged changes", async () => {
      mockExeca.mockImplementation((command, args) => {
        if (command === "git" && args.includes("diff") && args.includes("--name-status") && args.includes("--cached")) {
          return Promise.resolve({ stdout: "", stderr: "" } as any);
        }
        if (
          command === "git" &&
          args.includes("diff") &&
          args.includes("--name-status") &&
          !args.includes("--cached")
        ) {
          return Promise.resolve({ stdout: "M\tsrc/utils/helper.ts", stderr: "" } as any);
        }
        if (command === "git" && args.includes("diff") && args.includes("--stat") && args.includes("--cached")) {
          return Promise.resolve({ stdout: "", stderr: "" } as any);
        }
        if (command === "git" && args.includes("diff") && args.includes("--stat") && !args.includes("--cached")) {
          return Promise.resolve({ stdout: "1 file changed, 5 insertions(+), 2 deletions(-)", stderr: "" } as any);
        }
        return Promise.resolve({ stdout: "", stderr: "" } as any);
      });

      const result = await analyzer.analyzeChanges(".");

      expect(result.totalFiles).toBe(1);
      expect(result.totalAdditions).toBe(5);
      expect(result.totalDeletions).toBe(2);
    });

    it("should return empty result when no changes", async () => {
      mockExeca.mockResolvedValue({ stdout: "", stderr: "" } as any);

      const result = await analyzer.analyzeChanges(".");

      expect(result.totalFiles).toBe(0);
      expect(result.totalAdditions).toBe(0);
      expect(result.totalDeletions).toBe(0);
      expect(result.categories).toHaveLength(0);
    });

    it("should categorize feature changes correctly", async () => {
      const mockDiffOutput = "A\tsrc/components/NewFeature.tsx\nM\tsrc/components/ExistingFeature.tsx";
      const mockStatOutput = "2 files changed, 20 insertions(+), 5 deletions(-)";

      mockExeca.mockImplementation((command, args) => {
        if (command === "git" && args.includes("diff") && args.includes("--name-status")) {
          return Promise.resolve({ stdout: mockDiffOutput, stderr: "" } as any);
        }
        if (command === "git" && args.includes("diff") && args.includes("--stat")) {
          return Promise.resolve({ stdout: mockStatOutput, stderr: "" } as any);
        }
        return Promise.resolve({ stdout: "", stderr: "" } as any);
      });

      const result = await analyzer.analyzeChanges(".");

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].type).toBe("feature");
      expect(result.categories[0].files).toHaveLength(2);
      expect(result.versionBumpType).toBe("minor");
    });

    it("should categorize test changes correctly", async () => {
      const mockDiffOutput = "M\tsrc/__tests__/Button.test.tsx\nA\tsrc/__tests__/Modal.test.tsx";
      const mockStatOutput = "2 files changed, 10 insertions(+), 2 deletions(-)";

      mockExeca.mockImplementation((command, args) => {
        if (command === "git" && args.includes("diff") && args.includes("--name-status")) {
          return Promise.resolve({ stdout: mockDiffOutput, stderr: "" } as any);
        }
        if (command === "git" && args.includes("diff") && args.includes("--stat")) {
          return Promise.resolve({ stdout: mockStatOutput, stderr: "" } as any);
        }
        return Promise.resolve({ stdout: "", stderr: "" } as any);
      });

      const result = await analyzer.analyzeChanges(".");

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].type).toBe("test");
      expect(result.categories[0].impact).toBe("low");
      expect(result.versionBumpType).toBe("patch");
    });

    it("should categorize documentation changes correctly", async () => {
      const mockDiffOutput = "M\tREADME.md\nA\tdocs/api.md";
      const mockStatOutput = "2 files changed, 15 insertions(+), 3 deletions(-)";

      mockExeca.mockImplementation((command, args) => {
        if (command === "git" && args.includes("diff") && args.includes("--name-status")) {
          return Promise.resolve({ stdout: mockDiffOutput, stderr: "" } as any);
        }
        if (command === "git" && args.includes("diff") && args.includes("--stat")) {
          return Promise.resolve({ stdout: mockStatOutput, stderr: "" } as any);
        }
        return Promise.resolve({ stdout: "", stderr: "" } as any);
      });

      const result = await analyzer.analyzeChanges(".");

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].type).toBe("docs");
      expect(result.categories[0].impact).toBe("low");
      expect(result.versionBumpType).toBe("patch");
    });

    it("should categorize configuration changes correctly", async () => {
      const mockDiffOutput = "M\tpackage.json\nM\ttsconfig.json";
      const mockStatOutput = "2 files changed, 8 insertions(+), 2 deletions(-)";

      mockExeca.mockImplementation((command, args) => {
        if (command === "git" && args.includes("diff") && args.includes("--name-status")) {
          return Promise.resolve({ stdout: mockDiffOutput, stderr: "" } as any);
        }
        if (command === "git" && args.includes("diff") && args.includes("--stat")) {
          return Promise.resolve({ stdout: mockStatOutput, stderr: "" } as any);
        }
        return Promise.resolve({ stdout: "", stderr: "" } as any);
      });

      const result = await analyzer.analyzeChanges(".");

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].type).toBe("chore");
      expect(result.categories[0].impact).toBe("low");
      expect(result.versionBumpType).toBe("patch");
    });

    it("should detect breaking changes", async () => {
      const mockDiffOutput = "M\tpackage.json\nM\tapi/schema.ts";
      const mockStatOutput = "2 files changed, 10 insertions(+), 5 deletions(-)";

      mockExeca.mockImplementation((command, args) => {
        if (command === "git" && args.includes("diff") && args.includes("--name-status")) {
          return Promise.resolve({ stdout: mockDiffOutput, stderr: "" } as any);
        }
        if (command === "git" && args.includes("diff") && args.includes("--stat")) {
          return Promise.resolve({ stdout: mockStatOutput, stderr: "" } as any);
        }
        return Promise.resolve({ stdout: "", stderr: "" } as any);
      });

      const result = await analyzer.analyzeChanges(".");

      expect(result.hasBreakingChanges).toBe(true);
      expect(result.versionBumpType).toBe("major");
    });

    it("should detect security changes", async () => {
      const mockDiffOutput = "M\tsrc/auth/security.ts\nM\tsrc/auth/password.ts";
      const mockStatOutput = "2 files changed, 12 insertions(+), 3 deletions(-)";

      mockExeca.mockImplementation((command, args) => {
        if (command === "git" && args.includes("diff") && args.includes("--name-status")) {
          return Promise.resolve({ stdout: mockDiffOutput, stderr: "" } as any);
        }
        if (command === "git" && args.includes("diff") && args.includes("--stat")) {
          return Promise.resolve({ stdout: mockStatOutput, stderr: "" } as any);
        }
        return Promise.resolve({ stdout: "", stderr: "" } as any);
      });

      const result = await analyzer.analyzeChanges(".");

      expect(result.securityChanges).toBe(true);
      expect(result.categories[0].type).toBe("fix");
      expect(result.categories[0].impact).toBe("low");
    });

    it("should detect performance changes", async () => {
      const mockDiffOutput = "M\tsrc/perf/optimize.ts\nM\tsrc/cache/memo.ts";
      const mockStatOutput = "2 files changed, 15 insertions(+), 4 deletions(-)";

      mockExeca.mockImplementation((command, args) => {
        if (command === "git" && args.includes("diff") && args.includes("--name-status")) {
          return Promise.resolve({ stdout: mockDiffOutput, stderr: "" } as any);
        }
        if (command === "git" && args.includes("diff") && args.includes("--stat")) {
          return Promise.resolve({ stdout: mockStatOutput, stderr: "" } as any);
        }
        return Promise.resolve({ stdout: "", stderr: "" } as any);
      });

      const result = await analyzer.analyzeChanges(".");

      expect(result.performanceChanges).toBe(true);
      expect(result.categories[0].type).toBe("perf");
      expect(result.categories[0].impact).toBe("high");
      expect(result.versionBumpType).toBe("minor");
    });

    it("should handle errors gracefully", async () => {
      mockExeca.mockRejectedValue(new Error("Git command failed"));

      await expect(analyzer.analyzeChanges(".")).rejects.toThrow("Git command failed");
    });
  });

  describe("displayResults", () => {
    it("should display analysis results correctly", () => {
      const result = {
        totalFiles: 3,
        totalAdditions: 15,
        totalDeletions: 3,
        categories: [
          {
            type: "feature" as const,
            files: [
              { file: "src/components/Button.tsx", status: "modified" as const },
              { file: "src/components/Modal.tsx", status: "added" as const },
            ],
            impact: "medium" as const,
            description: "New features and capabilities (2 files)",
          },
        ],
        versionBumpType: "minor" as const,
        hasBreakingChanges: false,
        securityChanges: false,
        performanceChanges: false,
      };

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      analyzer.displayResults(result);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("📁 Total files changed: 3"));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("➕ Additions: 15"));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("➖ Deletions: 3"));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("📈 Version bump: minor"));

      consoleSpy.mockRestore();
    });

    it("should display breaking changes warning", () => {
      const result = {
        totalFiles: 1,
        totalAdditions: 5,
        totalDeletions: 2,
        categories: [],
        versionBumpType: "major" as const,
        hasBreakingChanges: true,
        securityChanges: false,
        performanceChanges: false,
      };

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      analyzer.displayResults(result);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("⚠️  Breaking changes detected"));

      consoleSpy.mockRestore();
    });
  });
});
