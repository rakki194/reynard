/**
 * 🦊 Tests for main exports and factory functions
 *
 * *whiskers twitch with testing precision* Comprehensive tests for the main
 * entry point and factory functions with fox-like strategic analysis.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createCodeQualitySystem,
  quickAnalysis,
  CodeQualityAnalyzer,
  QualityGateManager,
  SecurityAnalysisIntegration,
  AIAnalysisEngine,
  BehavioralAnalysisEngine,
  EnhancedSecurityEngine,
  AnalysisOrchestrator,
} from "../index";

// Mock all dependencies
vi.mock("../CodeQualityAnalyzer");
vi.mock("../QualityGateManager");
vi.mock("../SecurityAnalysisIntegration");
vi.mock("../AIAnalysisEngine");
vi.mock("../BehavioralAnalysisEngine");
vi.mock("../EnhancedSecurityEngine");
vi.mock("../AnalysisOrchestrator");

describe("Main exports and factory functions", () => {
  let mockAnalyzer: any;
  let mockQualityGateManager: any;
  let mockSecurityIntegration: any;
  let mockAIEngine: any;
  let mockBehavioralEngine: any;
  let mockEnhancedSecurityEngine: any;
  let mockOrchestrator: any;

  beforeEach(() => {
    // Setup mocks
    mockAnalyzer = {
      analyzeProject: vi.fn(),
    };

    mockQualityGateManager = {
      evaluateQualityGates: vi.fn(),
    };

    mockSecurityIntegration = {
      runSecurityAnalysis: vi.fn(),
    };

    mockAIEngine = {};
    mockBehavioralEngine = {};
    mockEnhancedSecurityEngine = {};

    mockOrchestrator = {
      runCompleteAnalysis: vi.fn(),
      runEnhancedAnalysis: vi.fn(),
      initialize: vi.fn(),
    };

    // Mock constructors
    vi.mocked(CodeQualityAnalyzer).mockImplementation(() => mockAnalyzer);
    vi.mocked(QualityGateManager).mockImplementation(() => mockQualityGateManager);
    vi.mocked(SecurityAnalysisIntegration).mockImplementation(() => mockSecurityIntegration);
    vi.mocked(AIAnalysisEngine).mockImplementation(() => mockAIEngine);
    vi.mocked(BehavioralAnalysisEngine).mockImplementation(() => mockBehavioralEngine);
    vi.mocked(EnhancedSecurityEngine).mockImplementation(() => mockEnhancedSecurityEngine);
    vi.mocked(AnalysisOrchestrator).mockImplementation(() => mockOrchestrator);

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("createCodeQualitySystem", () => {
    it("should create a complete code quality system", () => {
      const system = createCodeQualitySystem("/test/project");

      // Verify all components were created
      expect(CodeQualityAnalyzer).toHaveBeenCalledWith("/test/project");
      expect(QualityGateManager).toHaveBeenCalledWith("/test/project");
      expect(SecurityAnalysisIntegration).toHaveBeenCalledWith("/test/project");
      expect(AIAnalysisEngine).toHaveBeenCalled();
      expect(BehavioralAnalysisEngine).toHaveBeenCalledWith("/test/project");
      expect(EnhancedSecurityEngine).toHaveBeenCalledWith("/test/project");
      expect(AnalysisOrchestrator).toHaveBeenCalledWith({
        analyzer: mockAnalyzer,
        qualityGateManager: mockQualityGateManager,
        securityIntegration: mockSecurityIntegration,
        aiEngine: mockAIEngine,
        behavioralEngine: mockBehavioralEngine,
        enhancedSecurityEngine: mockEnhancedSecurityEngine,
      });

      // Verify system structure
      expect(system).toEqual({
        analyzer: mockAnalyzer,
        qualityGateManager: mockQualityGateManager,
        securityIntegration: mockSecurityIntegration,
        aiEngine: mockAIEngine,
        behavioralEngine: mockBehavioralEngine,
        enhancedSecurityEngine: mockEnhancedSecurityEngine,
        orchestrator: mockOrchestrator,
        runCompleteAnalysis: expect.any(Function),
        runEnhancedAnalysis: expect.any(Function),
        initialize: expect.any(Function),
      });
    });

    it("should provide runCompleteAnalysis function", async () => {
      const system = createCodeQualitySystem("/test/project");
      const mockResult = { analysis: "complete" };
      mockOrchestrator.runCompleteAnalysis.mockResolvedValue(mockResult);

      const result = await system.runCompleteAnalysis("development");

      expect(mockOrchestrator.runCompleteAnalysis).toHaveBeenCalledWith("development");
      expect(result).toBe(mockResult);
    });

    it("should provide runEnhancedAnalysis function", async () => {
      const system = createCodeQualitySystem("/test/project");
      const mockResult = { analysis: "enhanced" };
      mockOrchestrator.runEnhancedAnalysis.mockResolvedValue(mockResult);

      const result = await system.runEnhancedAnalysis("production");

      expect(mockOrchestrator.runEnhancedAnalysis).toHaveBeenCalledWith("production");
      expect(result).toBe(mockResult);
    });

    it("should provide initialize function", async () => {
      const system = createCodeQualitySystem("/test/project");
      mockOrchestrator.initialize.mockResolvedValue(undefined);

      await system.initialize();

      expect(mockOrchestrator.initialize).toHaveBeenCalled();
    });
  });

  describe("quickAnalysis", () => {
    it("should run quick analysis with default options", async () => {
      const mockAnalysisResult = {
        projectKey: "reynard",
        analysisDate: new Date(),
        metrics: {
          linesOfCode: 1000,
          linesOfComments: 100,
          cyclomaticComplexity: 50,
          cognitiveComplexity: 60,
          maintainabilityIndex: 80,
          codeSmells: 5,
          bugs: 0,
          vulnerabilities: 0,
          securityHotspots: 0,
          duplications: 0,
          lineCoverage: 0,
          branchCoverage: 0,
          functionCoverage: 0,
          docstringCoverage: 80,
          docstringQualityScore: 85,
          documentedFunctions: 8,
          totalFunctions: 10,
          documentedClasses: 4,
          totalClasses: 5,
          documentedModules: 2,
          totalModules: 2,
          technicalDebt: 0,
          reliabilityRating: "A" as const,
          securityRating: "A" as const,
          maintainabilityRating: "A" as const,
        },
        issues: [],
        qualityGateStatus: "PASSED" as const,
        qualityGateDetails: [],
        languages: [],
        files: [],
      };

      const mockSecurityResult = {
        summary: {
          totalVulnerabilities: 0,
          securityRating: "A",
        },
      };

      const mockQualityGateResults = [
        {
          gateId: "test-gate",
          gateName: "Test Gate",
          status: "PASSED" as const,
          conditions: [],
          overallScore: 100,
          passedConditions: 1,
          totalConditions: 1,
          failedConditions: 0,
          warningConditions: 0,
        },
      ];

      mockOrchestrator.initialize.mockResolvedValue(undefined);
      mockAnalyzer.analyzeProject.mockResolvedValue(mockAnalysisResult);
      mockSecurityIntegration.runSecurityAnalysis.mockResolvedValue(mockSecurityResult);
      mockQualityGateManager.evaluateQualityGates.mockReturnValue(mockQualityGateResults);

      const result = await quickAnalysis("/test/project");

      expect(mockOrchestrator.initialize).toHaveBeenCalled();
      expect(mockAnalyzer.analyzeProject).toHaveBeenCalled();
      expect(mockSecurityIntegration.runSecurityAnalysis).toHaveBeenCalledWith([]);
      expect(mockQualityGateManager.evaluateQualityGates).toHaveBeenCalledWith(
        mockAnalysisResult.metrics,
        "development"
      );

      expect(result).toEqual({
        analysis: mockAnalysisResult,
        security: mockSecurityResult,
        qualityGates: mockQualityGateResults,
        timestamp: expect.any(String),
      });
    });

    it("should run quick analysis with custom options", async () => {
      const mockAnalysisResult = {
        projectKey: "reynard",
        analysisDate: new Date(),
        metrics: {
          linesOfCode: 1000,
          linesOfComments: 100,
          cyclomaticComplexity: 50,
          cognitiveComplexity: 60,
          maintainabilityIndex: 80,
          codeSmells: 5,
          bugs: 0,
          vulnerabilities: 0,
          securityHotspots: 0,
          duplications: 0,
          lineCoverage: 0,
          branchCoverage: 0,
          functionCoverage: 0,
          docstringCoverage: 80,
          docstringQualityScore: 85,
          documentedFunctions: 8,
          totalFunctions: 10,
          documentedClasses: 4,
          totalClasses: 5,
          documentedModules: 2,
          totalModules: 2,
          technicalDebt: 0,
          reliabilityRating: "A" as const,
          securityRating: "A" as const,
          maintainabilityRating: "A" as const,
        },
        issues: [],
        qualityGateStatus: "PASSED" as const,
        qualityGateDetails: [],
        languages: [],
        files: [
          { path: "/test/file1.ts", language: "typescript", lines: 100, issues: [], complexity: 10, coverage: 80 },
        ],
      };

      mockOrchestrator.initialize.mockResolvedValue(undefined);
      mockAnalyzer.analyzeProject.mockResolvedValue(mockAnalysisResult);

      const result = await quickAnalysis("/test/project", {
        environment: "production",
        includeSecurity: false,
        includeQualityGates: false,
      });

      expect(mockOrchestrator.initialize).toHaveBeenCalled();
      expect(mockAnalyzer.analyzeProject).toHaveBeenCalled();
      expect(mockSecurityIntegration.runSecurityAnalysis).not.toHaveBeenCalled();
      expect(mockQualityGateManager.evaluateQualityGates).not.toHaveBeenCalled();

      expect(result).toEqual({
        analysis: mockAnalysisResult,
        security: null,
        qualityGates: [],
        timestamp: expect.any(String),
      });
    });

    it("should handle security analysis with file paths", async () => {
      const mockAnalysisResult = {
        projectKey: "reynard",
        analysisDate: new Date(),
        metrics: {
          linesOfCode: 1000,
          linesOfComments: 100,
          cyclomaticComplexity: 50,
          cognitiveComplexity: 60,
          maintainabilityIndex: 80,
          codeSmells: 5,
          bugs: 0,
          vulnerabilities: 0,
          securityHotspots: 0,
          duplications: 0,
          lineCoverage: 0,
          branchCoverage: 0,
          functionCoverage: 0,
          docstringCoverage: 80,
          docstringQualityScore: 85,
          documentedFunctions: 8,
          totalFunctions: 10,
          documentedClasses: 4,
          totalClasses: 5,
          documentedModules: 2,
          totalModules: 2,
          technicalDebt: 0,
          reliabilityRating: "A" as const,
          securityRating: "A" as const,
          maintainabilityRating: "A" as const,
        },
        issues: [],
        qualityGateStatus: "PASSED" as const,
        qualityGateDetails: [],
        languages: [],
        files: [
          { path: "/test/file1.ts", language: "typescript", lines: 100, issues: [], complexity: 10, coverage: 80 },
          { path: "/test/file2.py", language: "python", lines: 200, issues: [], complexity: 15, coverage: 90 },
        ],
      };

      const mockSecurityResult = {
        summary: {
          totalVulnerabilities: 0,
          securityRating: "A",
        },
      };

      mockOrchestrator.initialize.mockResolvedValue(undefined);
      mockAnalyzer.analyzeProject.mockResolvedValue(mockAnalysisResult);
      mockSecurityIntegration.runSecurityAnalysis.mockResolvedValue(mockSecurityResult);
      mockQualityGateManager.evaluateQualityGates.mockReturnValue([]);

      await quickAnalysis("/test/project", {
        includeSecurity: true,
        includeQualityGates: true,
      });

      expect(mockSecurityIntegration.runSecurityAnalysis).toHaveBeenCalledWith(["/test/file1.ts", "/test/file2.py"]);
    });
  });

  describe("default export", () => {
    it("should export factory functions", () => {
      // Test that the main exports are available
      expect(createCodeQualitySystem).toBeDefined();
      expect(quickAnalysis).toBeDefined();
      expect(typeof createCodeQualitySystem).toBe("function");
      expect(typeof quickAnalysis).toBe("function");
    });
  });

  describe("error handling", () => {
    it("should handle initialization errors in quickAnalysis", async () => {
      const error = new Error("Initialization failed");
      mockOrchestrator.initialize.mockRejectedValue(error);

      await expect(quickAnalysis("/test/project")).rejects.toThrow("Initialization failed");
    });

    it("should handle analysis errors in quickAnalysis", async () => {
      const error = new Error("Analysis failed");
      mockOrchestrator.initialize.mockResolvedValue(undefined);
      mockAnalyzer.analyzeProject.mockRejectedValue(error);

      await expect(quickAnalysis("/test/project")).rejects.toThrow("Analysis failed");
    });

    it("should handle security analysis errors in quickAnalysis", async () => {
      const mockAnalysisResult = {
        projectKey: "reynard",
        analysisDate: new Date(),
        metrics: {
          linesOfCode: 1000,
          linesOfComments: 100,
          cyclomaticComplexity: 50,
          cognitiveComplexity: 60,
          maintainabilityIndex: 80,
          codeSmells: 5,
          bugs: 0,
          vulnerabilities: 0,
          securityHotspots: 0,
          duplications: 0,
          lineCoverage: 0,
          branchCoverage: 0,
          functionCoverage: 0,
          docstringCoverage: 80,
          docstringQualityScore: 85,
          documentedFunctions: 8,
          totalFunctions: 10,
          documentedClasses: 4,
          totalClasses: 5,
          documentedModules: 2,
          totalModules: 2,
          technicalDebt: 0,
          reliabilityRating: "A" as const,
          securityRating: "A" as const,
          maintainabilityRating: "A" as const,
        },
        issues: [],
        qualityGateStatus: "PASSED" as const,
        qualityGateDetails: [],
        languages: [],
        files: [],
      };

      const error = new Error("Security analysis failed");
      mockOrchestrator.initialize.mockResolvedValue(undefined);
      mockAnalyzer.analyzeProject.mockResolvedValue(mockAnalysisResult);
      mockSecurityIntegration.runSecurityAnalysis.mockRejectedValue(error);

      await expect(quickAnalysis("/test/project")).rejects.toThrow("Security analysis failed");
    });
  });
});
