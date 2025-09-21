/**
 * Tests for CodeQualityAnalyzer with docstring integration
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { CodeQualityAnalyzer } from "../CodeQualityAnalyzer";
import { join } from "path";

// Mock the component services
vi.mock("../FileDiscoveryService", () => ({
  FileDiscoveryService: vi.fn().mockImplementation(() => ({
    discoverFiles: vi.fn().mockResolvedValue([]),
    countLines: vi.fn().mockResolvedValue(0),
    detectLanguage: vi.fn().mockResolvedValue("unknown"),
  })),
}));

vi.mock("../LanguageAnalyzer", () => ({
  LanguageAnalyzer: vi.fn().mockImplementation(() => ({
    analyzeLanguages: vi.fn().mockResolvedValue([]),
  })),
}));

vi.mock("../MetricsCalculator", () => ({
  MetricsCalculator: vi.fn().mockImplementation(() => ({
    calculateMetrics: vi.fn().mockResolvedValue({}),
    updateMetricsWithIssues: vi.fn().mockReturnValue({}),
    updateMetricsWithJunkFiles: vi.fn().mockReturnValue({}),
  })),
}));

vi.mock("../IssueDetector", () => ({
  IssueDetector: vi.fn().mockImplementation(() => ({
    detectIssues: vi.fn().mockResolvedValue([]),
  })),
}));

vi.mock("../QualityGateEvaluator", () => ({
  QualityGateEvaluator: vi.fn().mockImplementation(() => ({
    evaluateQualityGates: vi.fn().mockReturnValue([]),
    determineQualityGateStatus: vi.fn().mockReturnValue("PASSED"),
    addQualityGate: vi.fn(),
    removeQualityGate: vi.fn(),
    getQualityGates: vi.fn().mockReturnValue([]),
  })),
}));

vi.mock("../FileAnalyzer", () => ({
  FileAnalyzer: vi.fn().mockImplementation(() => ({
    analyzeFiles: vi.fn().mockResolvedValue([]),
  })),
}));

describe("CodeQualityAnalyzer", () => {
  let analyzer: CodeQualityAnalyzer;
  let tempDir: string;

  beforeEach(() => {
    analyzer = new CodeQualityAnalyzer(".");
    tempDir = join(process.cwd(), "temp-test-files");
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  describe("Docstring Integration", () => {
    it("should include docstring analysis in comprehensive analysis", async () => {
      // Mock all the component services
      const mockFileDiscovery = analyzer["fileDiscovery"];
      const mockLanguageAnalyzer = analyzer["languageAnalyzer"];
      const mockMetricsCalculator = analyzer["metricsCalculator"];
      const mockIssueDetector = analyzer["issueDetector"];
      const mockQualityGateEvaluator = analyzer["qualityGateEvaluator"];
      const mockFileAnalyzer = analyzer["fileAnalyzer"];

      // Setup mock implementations
      mockFileDiscovery.discoverFiles.mockResolvedValue([
        "test1.py",
        "test2.ts",
      ]);

      mockLanguageAnalyzer.analyzeLanguages.mockResolvedValue([
        {
          language: "python",
          files: 1,
          lines: 50,
          issues: 0,
          coverage: 0,
        },
        {
          language: "typescript",
          files: 1,
          lines: 30,
          issues: 0,
          coverage: 0,
        },
      ]);

      const mockMetrics = {
        linesOfCode: 80,
        linesOfComments: 10,
        cyclomaticComplexity: 20,
        cognitiveComplexity: 24,
        maintainabilityIndex: 75,
        codeSmells: 2,
        bugs: 0,
        vulnerabilities: 0,
        securityHotspots: 0,
        duplications: 0,
        lineCoverage: 0,
        branchCoverage: 0,
        functionCoverage: 0,
        // Docstring metrics
        docstringCoverage: 85,
        docstringQualityScore: 80,
        documentedFunctions: 8,
        totalFunctions: 10,
        documentedClasses: 4,
        totalClasses: 5,
        documentedModules: 2,
        totalModules: 2,
        technicalDebt: 60,
        reliabilityRating: "A" as const,
        securityRating: "A" as const,
        maintainabilityRating: "B" as const,
        junkFiles: 0,
        criticalJunkFiles: 0,
        highJunkFiles: 0,
        junkFileQualityScore: 100,
      };

      mockMetricsCalculator.calculateMetrics.mockResolvedValue(mockMetrics);
      mockMetricsCalculator.updateMetricsWithIssues.mockReturnValue(mockMetrics);
      mockMetricsCalculator.updateMetricsWithJunkFiles.mockReturnValue(mockMetrics);

      const mockIssues = [
        {
          id: "docstring-issue-1",
          type: "CODE_SMELL",
          severity: "MAJOR",
          message: "Missing function docstring",
          file: "test1.py",
          line: 5,
          rule: "docstring-missing",
          effort: 15,
          tags: ["docstring", "documentation"],
          createdAt: new Date(),
        },
        {
          id: "eslint-issue-1",
          type: "CODE_SMELL",
          severity: "MINOR",
          message: "Unused variable",
          file: "test2.ts",
          line: 10,
          rule: "no-unused-vars",
          effort: 5,
          tags: ["eslint"],
          createdAt: new Date(),
        },
      ];

      mockIssueDetector.detectIssues.mockResolvedValue(mockIssues);

      mockQualityGateEvaluator.evaluateQualityGates.mockReturnValue([
        {
          condition: {
            metric: "docstringCoverage",
            operator: "GT",
            threshold: 80,
          },
          status: "PASSED",
          actualValue: 85,
          threshold: 80,
        },
      ]);

      mockQualityGateEvaluator.determineQualityGateStatus.mockReturnValue("PASSED");

      mockFileAnalyzer.analyzeFiles.mockResolvedValue([
        {
          path: "test1.py",
          language: "python",
          lines: 50,
          issues: [mockIssues[0]],
          complexity: 10,
          coverage: 0,
        },
        {
          path: "test2.ts",
          language: "typescript",
          lines: 30,
          issues: [mockIssues[1]],
          complexity: 5,
          coverage: 0,
        },
      ]);

      // Run the analysis
      const result = await analyzer.analyzeProject();

      // Verify the result includes docstring metrics
      expect(result.metrics).toHaveProperty("docstringCoverage");
      expect(result.metrics).toHaveProperty("docstringQualityScore");
      expect(result.metrics).toHaveProperty("documentedFunctions");
      expect(result.metrics).toHaveProperty("totalFunctions");
      expect(result.metrics).toHaveProperty("documentedClasses");
      expect(result.metrics).toHaveProperty("totalClasses");
      expect(result.metrics).toHaveProperty("documentedModules");
      expect(result.metrics).toHaveProperty("totalModules");

      // Verify docstring metrics values
      expect(result.metrics.docstringCoverage).toBe(85);
      expect(result.metrics.docstringQualityScore).toBe(80);
      expect(result.metrics.documentedFunctions).toBe(8);
      expect(result.metrics.totalFunctions).toBe(10);
      expect(result.metrics.documentedClasses).toBe(4);
      expect(result.metrics.totalClasses).toBe(5);
      expect(result.metrics.documentedModules).toBe(2);
      expect(result.metrics.totalModules).toBe(2);

      // Verify that docstring issues are included
      const docstringIssues = result.issues.filter(issue => 
        issue.tags.includes("docstring")
      );
      expect(docstringIssues.length).toBeGreaterThan(0);
      expect(docstringIssues[0].rule).toBe("docstring-missing");

      // Verify that IssueDetector was called with the discovered files
      expect(mockIssueDetector.detectIssues).toHaveBeenCalledWith([
        "test1.py",
        "test2.ts",
      ]);

      // Verify that MetricsCalculator was called with the discovered files
      expect(mockMetricsCalculator.calculateMetrics).toHaveBeenCalledWith(
        ["test1.py", "test2.ts"],
        expect.any(Array)
      );
    });

    it("should handle analysis errors gracefully", async () => {
      const mockFileDiscovery = analyzer["fileDiscovery"];
      mockFileDiscovery.discoverFiles.mockRejectedValue(new Error("File discovery failed"));

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(analyzer.analyzeProject()).rejects.toThrow("File discovery failed");

      consoleSpy.mockRestore();
    });

    it("should emit analysis events", async () => {
      const mockFileDiscovery = analyzer["fileDiscovery"];
      const mockLanguageAnalyzer = analyzer["languageAnalyzer"];
      const mockMetricsCalculator = analyzer["metricsCalculator"];
      const mockIssueDetector = analyzer["issueDetector"];
      const mockQualityGateEvaluator = analyzer["qualityGateEvaluator"];
      const mockFileAnalyzer = analyzer["fileAnalyzer"];

      // Setup minimal mocks for successful analysis
      mockFileDiscovery.discoverFiles.mockResolvedValue([]);
      mockLanguageAnalyzer.analyzeLanguages.mockResolvedValue([]);
      mockMetricsCalculator.calculateMetrics.mockResolvedValue({
        linesOfCode: 0,
        linesOfComments: 0,
        cyclomaticComplexity: 0,
        cognitiveComplexity: 0,
        maintainabilityIndex: 100,
        codeSmells: 0,
        bugs: 0,
        vulnerabilities: 0,
        securityHotspots: 0,
        duplications: 0,
        lineCoverage: 0,
        branchCoverage: 0,
        functionCoverage: 0,
        docstringCoverage: 100,
        docstringQualityScore: 100,
        documentedFunctions: 0,
        totalFunctions: 0,
        documentedClasses: 0,
        totalClasses: 0,
        documentedModules: 0,
        totalModules: 0,
        technicalDebt: 0,
        reliabilityRating: "A" as const,
        securityRating: "A" as const,
        maintainabilityRating: "A" as const,
      });
      mockMetricsCalculator.updateMetricsWithIssues.mockReturnValue({
        linesOfCode: 0,
        linesOfComments: 0,
        cyclomaticComplexity: 0,
        cognitiveComplexity: 0,
        maintainabilityIndex: 100,
        codeSmells: 0,
        bugs: 0,
        vulnerabilities: 0,
        securityHotspots: 0,
        duplications: 0,
        lineCoverage: 0,
        branchCoverage: 0,
        functionCoverage: 0,
        docstringCoverage: 100,
        docstringQualityScore: 100,
        documentedFunctions: 0,
        totalFunctions: 0,
        documentedClasses: 0,
        totalClasses: 0,
        documentedModules: 0,
        totalModules: 0,
        technicalDebt: 0,
        reliabilityRating: "A" as const,
        securityRating: "A" as const,
        maintainabilityRating: "A" as const,
      });
      mockIssueDetector.detectIssues.mockResolvedValue([]);
      mockQualityGateEvaluator.evaluateQualityGates.mockReturnValue([]);
      mockQualityGateEvaluator.determineQualityGateStatus.mockReturnValue("PASSED");
      mockFileAnalyzer.analyzeFiles.mockResolvedValue([]);

      const analysisCompleteSpy = vi.fn();
      analyzer.on("analysisComplete", analysisCompleteSpy);

      const result = await analyzer.analyzeProject();

      expect(analysisCompleteSpy).toHaveBeenCalledWith(result);
    });
  });

  describe("Quality Gate Management", () => {
    it("should allow adding and removing quality gates", () => {
      const mockQualityGateEvaluator = analyzer["qualityGateEvaluator"];
      
      const testGate = {
        id: "test-gate",
        name: "Test Gate",
        conditions: [],
        enabled: true,
      };

      analyzer.addQualityGate(testGate);
      expect(mockQualityGateEvaluator.addQualityGate).toHaveBeenCalledWith(testGate);

      analyzer.removeQualityGate("test-gate");
      expect(mockQualityGateEvaluator.removeQualityGate).toHaveBeenCalledWith("test-gate");

      analyzer.getQualityGates();
      expect(mockQualityGateEvaluator.getQualityGates).toHaveBeenCalled();
    });
  });

  describe("Analysis History", () => {
    it("should maintain analysis history", async () => {
      const mockFileDiscovery = analyzer["fileDiscovery"];
      const mockLanguageAnalyzer = analyzer["languageAnalyzer"];
      const mockMetricsCalculator = analyzer["metricsCalculator"];
      const mockIssueDetector = analyzer["issueDetector"];
      const mockQualityGateEvaluator = analyzer["qualityGateEvaluator"];
      const mockFileAnalyzer = analyzer["fileAnalyzer"];

      // Setup minimal mocks
      mockFileDiscovery.discoverFiles.mockResolvedValue([]);
      mockLanguageAnalyzer.analyzeLanguages.mockResolvedValue([]);
      mockMetricsCalculator.calculateMetrics.mockResolvedValue({
        linesOfCode: 0,
        linesOfComments: 0,
        cyclomaticComplexity: 0,
        cognitiveComplexity: 0,
        maintainabilityIndex: 100,
        codeSmells: 0,
        bugs: 0,
        vulnerabilities: 0,
        securityHotspots: 0,
        duplications: 0,
        lineCoverage: 0,
        branchCoverage: 0,
        functionCoverage: 0,
        docstringCoverage: 100,
        docstringQualityScore: 100,
        documentedFunctions: 0,
        totalFunctions: 0,
        documentedClasses: 0,
        totalClasses: 0,
        documentedModules: 0,
        totalModules: 0,
        technicalDebt: 0,
        reliabilityRating: "A" as const,
        securityRating: "A" as const,
        maintainabilityRating: "A" as const,
      });
      mockMetricsCalculator.updateMetricsWithIssues.mockReturnValue({
        linesOfCode: 0,
        linesOfComments: 0,
        cyclomaticComplexity: 0,
        cognitiveComplexity: 0,
        maintainabilityIndex: 100,
        codeSmells: 0,
        bugs: 0,
        vulnerabilities: 0,
        securityHotspots: 0,
        duplications: 0,
        lineCoverage: 0,
        branchCoverage: 0,
        functionCoverage: 0,
        docstringCoverage: 100,
        docstringQualityScore: 100,
        documentedFunctions: 0,
        totalFunctions: 0,
        documentedClasses: 0,
        totalClasses: 0,
        documentedModules: 0,
        totalModules: 0,
        technicalDebt: 0,
        reliabilityRating: "A" as const,
        securityRating: "A" as const,
        maintainabilityRating: "A" as const,
      });
      mockIssueDetector.detectIssues.mockResolvedValue([]);
      mockQualityGateEvaluator.evaluateQualityGates.mockReturnValue([]);
      mockQualityGateEvaluator.determineQualityGateStatus.mockReturnValue("PASSED");
      mockFileAnalyzer.analyzeFiles.mockResolvedValue([]);

      // Run analysis twice
      await analyzer.analyzeProject();
      await analyzer.analyzeProject();

      const history = analyzer.getAnalysisHistory();
      expect(history).toHaveLength(2);

      const latest = analyzer.getLatestAnalysis();
      expect(latest).toBeDefined();
      expect(latest).toBe(history[1]);
    });
  });
});