/**
 * 🦊 Tests for LanguageAnalyzer
 *
 * *whiskers twitch with testing precision* Comprehensive tests for the language
 * analyzer that processes code by language with fox-like strategic analysis.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { LanguageAnalyzer } from "../LanguageAnalyzer";
import { FileDiscoveryService } from "../FileDiscoveryService";

// Mock FileDiscoveryService
vi.mock("../FileDiscoveryService");

describe("LanguageAnalyzer", () => {
  let analyzer: LanguageAnalyzer;
  let mockFileDiscovery: any;

  beforeEach(() => {
    mockFileDiscovery = {
      detectLanguage: vi.fn(),
      countLines: vi.fn(),
    };
    
    vi.mocked(FileDiscoveryService).mockImplementation(() => mockFileDiscovery);
    analyzer = new LanguageAnalyzer();
  });

  describe("analyzeLanguages", () => {
    it("should analyze files by language", async () => {
      const files = [
        "/test/file1.ts",
        "/test/file2.ts",
        "/test/file3.js",
        "/test/file4.py",
        "/test/file5.md",
      ];

      mockFileDiscovery.detectLanguage
        .mockReturnValueOnce("typescript")
        .mockReturnValueOnce("typescript")
        .mockReturnValueOnce("javascript")
        .mockReturnValueOnce("python")
        .mockReturnValueOnce("markdown");

      mockFileDiscovery.countLines
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(150)
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(75)
        .mockResolvedValueOnce(50);

      const result = await analyzer.analyzeLanguages(files);

      expect(result).toHaveLength(4);
      
      const typescript = result.find(r => r.language === "typescript");
      expect(typescript).toEqual({
        language: "typescript",
        files: 2,
        lines: 250,
        issues: 0,
        coverage: 0,
      });

      const javascript = result.find(r => r.language === "javascript");
      expect(javascript).toEqual({
        language: "javascript",
        files: 1,
        lines: 200,
        issues: 0,
        coverage: 0,
      });

      const python = result.find(r => r.language === "python");
      expect(python).toEqual({
        language: "python",
        files: 1,
        lines: 75,
        issues: 0,
        coverage: 0,
      });

      const markdown = result.find(r => r.language === "markdown");
      expect(markdown).toEqual({
        language: "markdown",
        files: 1,
        lines: 50,
        issues: 0,
        coverage: 0,
      });
    });

    it("should handle empty file list", async () => {
      const result = await analyzer.analyzeLanguages([]);
      expect(result).toEqual([]);
    });

    it("should handle files with same language", async () => {
      const files = ["/test/file1.ts", "/test/file2.ts", "/test/file3.ts"];

      mockFileDiscovery.detectLanguage.mockReturnValue("typescript");
      mockFileDiscovery.countLines
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(150);

      const result = await analyzer.analyzeLanguages(files);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        language: "typescript",
        files: 3,
        lines: 450,
        issues: 0,
        coverage: 0,
      });
    });
  });

  describe("getLanguageStats", () => {
    it("should return stats for specific language", () => {
      const analyses = [
        { language: "typescript", files: 5, lines: 1000, issues: 10, coverage: 80 },
        { language: "python", files: 3, lines: 500, issues: 5, coverage: 90 },
        { language: "javascript", files: 2, lines: 300, issues: 3, coverage: 70 },
      ];

      const result = analyzer.getLanguageStats(analyses, "python");

      expect(result).toEqual({
        language: "python",
        files: 3,
        lines: 500,
        issues: 5,
        coverage: 90,
      });
    });

    it("should return null for non-existent language", () => {
      const analyses = [
        { language: "typescript", files: 5, lines: 1000, issues: 10, coverage: 80 },
      ];

      const result = analyzer.getLanguageStats(analyses, "rust");

      expect(result).toBeNull();
    });
  });

  describe("getTotalLines", () => {
    it("should calculate total lines across all languages", () => {
      const analyses = [
        { language: "typescript", files: 5, lines: 1000, issues: 10, coverage: 80 },
        { language: "python", files: 3, lines: 500, issues: 5, coverage: 90 },
        { language: "javascript", files: 2, lines: 300, issues: 3, coverage: 70 },
      ];

      const result = analyzer.getTotalLines(analyses);

      expect(result).toBe(1800);
    });

    it("should return 0 for empty analyses", () => {
      const result = analyzer.getTotalLines([]);
      expect(result).toBe(0);
    });
  });

  describe("getTotalFiles", () => {
    it("should calculate total files across all languages", () => {
      const analyses = [
        { language: "typescript", files: 5, lines: 1000, issues: 10, coverage: 80 },
        { language: "python", files: 3, lines: 500, issues: 5, coverage: 90 },
        { language: "javascript", files: 2, lines: 300, issues: 3, coverage: 70 },
      ];

      const result = analyzer.getTotalFiles(analyses);

      expect(result).toBe(10);
    });

    it("should return 0 for empty analyses", () => {
      const result = analyzer.getTotalFiles([]);
      expect(result).toBe(0);
    });
  });

  describe("getLanguageDistribution", () => {
    it("should calculate language distribution as percentages", () => {
      const analyses = [
        { language: "typescript", files: 5, lines: 1000, issues: 10, coverage: 80 },
        { language: "python", files: 3, lines: 500, issues: 5, coverage: 90 },
        { language: "javascript", files: 2, lines: 300, issues: 3, coverage: 70 },
      ];

      const result = analyzer.getLanguageDistribution(analyses);

      expect(result).toHaveLength(3);
      
      const typescript = result.find(r => r.language === "typescript");
      expect(typescript?.percentage).toBeCloseTo(55.56, 2); // 1000/1800 * 100
      
      const python = result.find(r => r.language === "python");
      expect(python?.percentage).toBeCloseTo(27.78, 2); // 500/1800 * 100
      
      const javascript = result.find(r => r.language === "javascript");
      expect(javascript?.percentage).toBeCloseTo(16.67, 2); // 300/1800 * 100
    });

    it("should handle zero total lines", () => {
      const analyses = [
        { language: "typescript", files: 0, lines: 0, issues: 0, coverage: 0 },
        { language: "python", files: 0, lines: 0, issues: 0, coverage: 0 },
      ];

      const result = analyzer.getLanguageDistribution(analyses);

      expect(result).toHaveLength(2);
      expect(result[0].percentage).toBe(0);
      expect(result[1].percentage).toBe(0);
    });

    it("should return empty array for empty analyses", () => {
      const result = analyzer.getLanguageDistribution([]);
      expect(result).toEqual([]);
    });
  });
});
