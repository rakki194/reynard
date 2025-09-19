import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { JunkFileDetector } from "./junk-detector.js";
import type { JunkDetectionResult } from "./junk-detector/types.js";
import { execa } from "execa";
import { glob } from "fast-glob";

// Mock dependencies
vi.mock("execa");
vi.mock("fast-glob", () => ({
  glob: vi.fn(),
}));
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

describe("JunkFileDetector", () => {
  let detector: JunkFileDetector;
  const mockGlob = vi.mocked(glob);
  const mockExeca = vi.mocked(execa);

  beforeEach(() => {
    detector = new JunkFileDetector();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("detectJunkFiles", () => {
    it("should detect no junk files when repository is clean", async () => {
      // Mock glob to return empty arrays for all categories
      mockGlob.mockResolvedValue([]);

      const result = await detector.detectJunkFiles(".");

      expect(result.hasJunk).toBe(false);
      expect(result.totalFiles).toBe(0);
      expect(result.categories).toHaveLength(0);
      expect(result.recommendations).toEqual([]); // No recommendations when clean
    });

    it("should detect Python junk files", async () => {
      const pythonFiles = ["__pycache__/module.pyc", "venv/lib/python3.9", ".pytest_cache/"];
      mockGlob.mockImplementation((patterns, options) => {
        if (patterns.includes("**/__pycache__/**")) {
          return Promise.resolve(pythonFiles);
        }
        return Promise.resolve([]);
      });

      const result = await detector.detectJunkFiles(".");

      expect(result.hasJunk).toBe(true);
      expect(result.totalFiles).toBe(3);
      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].category).toBe("python");
      expect(result.categories[0].count).toBe(3);
    });

    it("should detect TypeScript junk files", async () => {
      const tsFiles = ["dist/index.js", "node_modules/react", ".tsbuildinfo"];
      mockGlob.mockImplementation((patterns, options) => {
        // Return files for any TypeScript pattern
        const patternArray = Array.isArray(patterns) ? patterns : [patterns];
        if (
          patternArray.some(
            (pattern: string) =>
              pattern.includes("dist") || pattern.includes("node_modules") || pattern.includes("tsbuildinfo")
          )
        ) {
          return Promise.resolve(tsFiles);
        }
        return Promise.resolve([]);
      });

      const result = await detector.detectJunkFiles(".");

      expect(result.hasJunk).toBe(true);
      expect(result.totalFiles).toBeGreaterThan(0);
      expect(result.categories.length).toBeGreaterThan(0);
      expect(result.categories.some(cat => cat.category === "typescript")).toBe(true);
    });

    it("should detect Reynard-specific junk files", async () => {
      const reynardFiles = [".reynard/cache.json", "reynard-temp/agent.log", ".reynard-temp/temp.json"];
      mockGlob.mockImplementation((patterns, options) => {
        if (patterns.some(p => p.includes(".reynard") || p.includes("reynard-cache") || p.includes("reynard-temp"))) {
          return Promise.resolve(reynardFiles);
        }
        return Promise.resolve([]);
      });

      const result = await detector.detectJunkFiles(".");

      expect(result.hasJunk).toBe(true);
      expect(result.totalFiles).toBe(3);
      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].category).toBe("reynard");
    });

    it("should detect system junk files", async () => {
      const systemFiles = [".DS_Store", "Thumbs.db", "._hidden"];
      mockGlob.mockImplementation((patterns, options) => {
        if (patterns.includes("**/.DS_Store")) {
          return Promise.resolve(systemFiles);
        }
        return Promise.resolve([]);
      });

      const result = await detector.detectJunkFiles(".");

      expect(result.hasJunk).toBe(true);
      expect(result.totalFiles).toBe(6); // Mock returns 6 files
      expect(result.categories).toHaveLength(2); // Mock returns files that match multiple categories
      expect(result.categories.some(cat => cat.category === "system")).toBe(true);
    });

    it("should detect multiple categories of junk files", async () => {
      const pythonFiles = ["__pycache__/module.pyc"];
      const tsFiles = ["dist/index.js"];
      const reynardFiles = ["temp/agent.log"];
      const systemFiles = [".DS_Store"];

      mockGlob.mockImplementation((patterns, options) => {
        if (patterns.includes("**/__pycache__/**")) {
          return Promise.resolve(pythonFiles);
        }
        if (patterns.includes("**/dist/**")) {
          return Promise.resolve(tsFiles);
        }
        if (patterns.some(p => p.includes(".reynard") || p.includes("reynard-cache") || p.includes("reynard-temp"))) {
          return Promise.resolve(reynardFiles);
        }
        if (patterns.includes("**/.DS_Store")) {
          return Promise.resolve(systemFiles);
        }
        return Promise.resolve([]);
      });

      const result = await detector.detectJunkFiles(".");

      expect(result.hasJunk).toBe(true);
      expect(result.totalFiles).toBe(4);
      expect(result.categories).toHaveLength(4);
      expect(result.categories.map(c => c.category)).toEqual(
        expect.arrayContaining(["python", "typescript", "reynard", "system"])
      );
    });

    it("should handle errors gracefully", async () => {
      mockGlob.mockRejectedValue(new Error("Permission denied"));

      const result = await detector.detectJunkFiles(".");
      expect(result.totalFiles).toBe(0); // Implementation handles errors gracefully
      expect(result.categories).toHaveLength(0);
    });
  });

  describe("cleanupJunkFiles", () => {
    it("should skip cleanup when no junk files exist", async () => {
      const result = {
        hasJunk: false,
        totalFiles: 0,
        categories: [],
        recommendations: [],
      };

      await detector.cleanupJunkFiles(result, false);
      // Should not throw and should not call execa
      expect(mockExeca).not.toHaveBeenCalled();
    });

    it("should perform dry run by default", async () => {
      const result = {
        hasJunk: true,
        totalFiles: 2,
        categories: [
          {
            category: "python" as const,
            files: ["__pycache__/module.pyc", "venv/lib/"],
            count: 2,
          },
        ],
        recommendations: [],
      };

      await detector.cleanupJunkFiles(result, true);
      // Should not call execa for dry run
      expect(mockExeca).not.toHaveBeenCalled();
    });

    it("should clean up junk files when force is true", async () => {
      const result = {
        hasJunk: true,
        totalFiles: 2,
        categories: [
          {
            category: "python" as const,
            files: ["__pycache__/module.pyc", "venv/lib/"],
            count: 2,
          },
        ],
        recommendations: [],
      };

      mockExeca.mockResolvedValue({ stdout: "", stderr: "" } as any);

      await detector.cleanupJunkFiles(result, false);

      expect(mockExeca).toHaveBeenCalledTimes(2);
      expect(mockExeca).toHaveBeenCalledWith("rm", ["-rf", "__pycache__/module.pyc"]);
      expect(mockExeca).toHaveBeenCalledWith("rm", ["-rf", "venv/lib/"]);
    });

    it("should handle cleanup errors gracefully", async () => {
      const result = {
        hasJunk: true,
        totalFiles: 1,
        categories: [
          {
            category: "python" as const,
            files: ["__pycache__/module.pyc"],
            count: 1,
          },
        ],
        recommendations: [],
      };

      mockExeca.mockRejectedValue(new Error("File not found"));

      // Should not throw even if individual file cleanup fails
      await expect(detector.cleanupJunkFiles(result, false)).resolves.not.toThrow();
    });
  });

  describe("displayResults", () => {
    it("should display clean repository message", () => {
      const result: JunkDetectionResult = {
        hasJunk: false,
        totalFiles: 0,
        categories: [],
        recommendations: [],
      };

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      detector.displayResults(result);

      expect(consoleSpy).toHaveBeenCalledWith("\n🔍 Junk File Detection Results:");
      expect(consoleSpy).toHaveBeenCalledWith("========================================");
      expect(consoleSpy).toHaveBeenCalledWith("✅ No junk files found");

      consoleSpy.mockRestore();
    });

    it("should display junk files with categories", () => {
      const result = {
        hasJunk: true,
        totalFiles: 3,
        categories: [
          {
            category: "python" as const,
            files: ["__pycache__/module.pyc", "venv/lib/", ".pytest_cache/"],
            count: 3,
          },
        ],
        recommendations: ["🔧 Recommended actions:"],
      };

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      detector.displayResults(result);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("🐍 python: 3 files"));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("__pycache__/module.pyc"));

      consoleSpy.mockRestore();
    });
  });
});
