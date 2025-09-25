/**
 * 🦊 Reynard Architectural Health Scoring
 * ======================================
 *
 * Advanced architectural health scoring system for comprehensive
 * codebase quality assessment. Uses multi-dimensional analysis to
 * calculate health scores across various architectural dimensions.
 *
 * Features:
 * - Multi-dimensional health scoring
 * - Performance health assessment
 * - Maintainability health analysis
 * - Security health evaluation
 * - Scalability health measurement
 * - Reliability health scoring
 * - Overall health aggregation
 *
 * @author Reynard Development Team
 * @version 1.0.0
 */

import { EventEmitter } from "events";
import { readFile, readdir, stat } from "fs/promises";
import { join, relative, dirname, basename, extname } from "path";

/**
 * Represents an architectural health score.
 */
export interface ArchitecturalHealthScore {
  /** Score identifier */
  id: string;
  /** Score type */
  type: "performance" | "maintainability" | "security" | "scalability" | "reliability" | "overall";
  /** Score category */
  category: string;
  /** Score value (0-100) */
  score: number;
  /** Score grade */
  grade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D+" | "D" | "F";
  /** Score description */
  description: string;
  /** Score location */
  location: {
    file?: string;
    component?: string;
    module?: string;
    package?: string;
  };
  /** Score metrics */
  metrics: {
    rawScore: number; // 0-100, raw calculated score
    normalizedScore: number; // 0-100, normalized score
    confidence: number; // 0-1, confidence in score
    trend: "improving" | "stable" | "declining";
    lastUpdated: string;
  };
  /** Score breakdown */
  breakdown: {
    factors: Array<{
      name: string;
      weight: number; // 0-1, factor weight
      score: number; // 0-100, factor score
      impact: number; // 0-100, impact on overall score
    }>;
    totalWeight: number;
    weightedScore: number;
  };
  /** Score recommendations */
  recommendations: {
    priority: "low" | "medium" | "high" | "critical";
    actions: string[];
    expectedImprovement: number; // 0-100, expected score improvement
    effort: "low" | "medium" | "high" | "very-high";
  };
  /** Score metadata */
  metadata: {
    algorithm: string;
    calculatedAt: string;
    version: string;
    dataPoints: number;
    [key: string]: any;
  };
}

/**
 * Represents health scoring configuration.
 */
export interface HealthScoringConfig {
  /** Enable performance health scoring */
  enablePerformanceScoring: boolean;
  /** Enable maintainability health scoring */
  enableMaintainabilityScoring: boolean;
  /** Enable security health scoring */
  enableSecurityScoring: boolean;
  /** Enable scalability health scoring */
  enableScalabilityScoring: boolean;
  /** Enable reliability health scoring */
  enableReliabilityScoring: boolean;
  /** Enable overall health scoring */
  enableOverallScoring: boolean;
  /** Minimum confidence threshold */
  confidenceThreshold: number;
  /** Enable trend analysis */
  enableTrendAnalysis: boolean;
  /** Trend analysis window (days) */
  trendAnalysisWindow: number;
  /** Enable historical comparison */
  enableHistoricalComparison: boolean;
  /** Historical comparison window (days) */
  historicalComparisonWindow: number;
  /** Performance settings */
  performance: {
    maxConcurrentAnalysis: number;
    cacheResults: boolean;
    cacheExpiry: number; // milliseconds
    enableParallelProcessing: boolean;
  };
}

/**
 * Advanced architectural health scoring system.
 */
export class ArchitecturalHealthScoring extends EventEmitter {
  private readonly config: HealthScoringConfig;
  private readonly codebasePath: string;
  private healthScores: Map<string, ArchitecturalHealthScore[]> = new Map();
  private historicalScores: Map<string, any[]> = new Map();
  private analysisCache: Map<string, any> = new Map();

  constructor(codebasePath: string, config?: Partial<HealthScoringConfig>) {
    super();
    this.codebasePath = codebasePath;
    this.config = {
      enablePerformanceScoring: true,
      enableMaintainabilityScoring: true,
      enableSecurityScoring: true,
      enableScalabilityScoring: true,
      enableReliabilityScoring: true,
      enableOverallScoring: true,
      confidenceThreshold: 0.7,
      enableTrendAnalysis: true,
      trendAnalysisWindow: 30, // 30 days
      enableHistoricalComparison: true,
      historicalComparisonWindow: 90, // 90 days
      performance: {
        maxConcurrentAnalysis: 10,
        cacheResults: true,
        cacheExpiry: 60 * 60 * 1000, // 1 hour
        enableParallelProcessing: true,
      },
      ...config,
    };
  }

  /**
   * Calculate architectural health scores for the codebase.
   */
  async calculateHealthScores(): Promise<Map<string, ArchitecturalHealthScore[]>> {
    this.emit("scoring:start", { timestamp: new Date().toISOString() });

    try {
      // Clear previous results
      this.healthScores.clear();
      this.analysisCache.clear();

      // Get all source files
      const sourceFiles = await this.findSourceFiles();

      // Calculate scores in parallel
      const scoringPromises = sourceFiles.map(file => this.calculateFileHealthScores(file));
      const results = await Promise.all(scoringPromises);

      // Merge results
      for (const fileScores of results) {
        for (const [file, scores] of fileScores) {
          this.healthScores.set(file, scores);
        }
      }

      // Post-process results
      await this.postProcessScores();

      this.emit("scoring:complete", {
        timestamp: new Date().toISOString(),
        totalFiles: sourceFiles.length,
        totalScores: Array.from(this.healthScores.values()).flat().length,
      });

      return this.healthScores;
    } catch (error) {
      this.emit("scoring:error", { error, timestamp: new Date().toISOString() });
      throw error;
    }
  }

  /**
   * Calculate health scores for a single file.
   */
  private async calculateFileHealthScores(filePath: string): Promise<Map<string, ArchitecturalHealthScore[]>> {
    const scores = new Map<string, ArchitecturalHealthScore[]>();

    try {
      // Check cache first
      if (this.config.performance.cacheResults) {
        const cached = this.analysisCache.get(filePath);
        if (cached && Date.now() - cached.timestamp < this.config.performance.cacheExpiry) {
          scores.set(filePath, cached.scores);
          return scores;
        }
      }

      // Read file content
      const content = await readFile(filePath, "utf-8");

      // Calculate scores using different methods
      const calculatedScores: ArchitecturalHealthScore[] = [];

      if (this.config.enablePerformanceScoring) {
        const performanceScore = await this.calculatePerformanceHealthScore(content, filePath);
        calculatedScores.push(performanceScore);
      }

      if (this.config.enableMaintainabilityScoring) {
        const maintainabilityScore = await this.calculateMaintainabilityHealthScore(content, filePath);
        calculatedScores.push(maintainabilityScore);
      }

      if (this.config.enableSecurityScoring) {
        const securityScore = await this.calculateSecurityHealthScore(content, filePath);
        calculatedScores.push(securityScore);
      }

      if (this.config.enableScalabilityScoring) {
        const scalabilityScore = await this.calculateScalabilityHealthScore(content, filePath);
        calculatedScores.push(scalabilityScore);
      }

      if (this.config.enableReliabilityScoring) {
        const reliabilityScore = await this.calculateReliabilityHealthScore(content, filePath);
        calculatedScores.push(reliabilityScore);
      }

      if (this.config.enableOverallScoring) {
        const overallScore = await this.calculateOverallHealthScore(calculatedScores, filePath);
        calculatedScores.push(overallScore);
      }

      // Filter by confidence threshold
      const filteredScores = calculatedScores.filter(
        score => score.metrics.confidence >= this.config.confidenceThreshold
      );

      scores.set(filePath, filteredScores);

      // Cache results
      if (this.config.performance.cacheResults) {
        this.analysisCache.set(filePath, {
          scores: filteredScores,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.warn(`Failed to calculate health scores for file: ${filePath}`, error);
    }

    return scores;
  }

  /**
   * Calculate performance health score.
   */
  private async calculatePerformanceHealthScore(content: string, filePath: string): Promise<ArchitecturalHealthScore> {
    const factors = [
      {
        name: "Code Complexity",
        weight: 0.3,
        score: this.calculateComplexityScore(content),
        impact: 0,
      },
      {
        name: "Loop Efficiency",
        weight: 0.25,
        score: this.calculateLoopEfficiencyScore(content),
        impact: 0,
      },
      {
        name: "Memory Usage",
        weight: 0.2,
        score: this.calculateMemoryUsageScore(content),
        impact: 0,
      },
      {
        name: "Async Operations",
        weight: 0.15,
        score: this.calculateAsyncOperationsScore(content),
        impact: 0,
      },
      {
        name: "Algorithm Efficiency",
        weight: 0.1,
        score: this.calculateAlgorithmEfficiencyScore(content),
        impact: 0,
      },
    ];

    const weightedScore = this.calculateWeightedScore(factors);
    const grade = this.calculateGrade(weightedScore);
    const confidence = this.calculateConfidence(factors);

    return this.createHealthScore(
      "Performance Health",
      "performance",
      `Performance health score: ${weightedScore.toFixed(1)}/100`,
      filePath,
      weightedScore,
      grade,
      factors,
      confidence,
      "performance-scoring"
    );
  }

  /**
   * Calculate maintainability health score.
   */
  private async calculateMaintainabilityHealthScore(
    content: string,
    filePath: string
  ): Promise<ArchitecturalHealthScore> {
    const factors = [
      {
        name: "Code Readability",
        weight: 0.25,
        score: this.calculateReadabilityScore(content),
        impact: 0,
      },
      {
        name: "Documentation",
        weight: 0.2,
        score: this.calculateDocumentationScore(content),
        impact: 0,
      },
      {
        name: "Function Length",
        weight: 0.2,
        score: this.calculateFunctionLengthScore(content),
        impact: 0,
      },
      {
        name: "Cyclomatic Complexity",
        weight: 0.15,
        score: this.calculateCyclomaticComplexityScore(content),
        impact: 0,
      },
      {
        name: "Code Duplication",
        weight: 0.1,
        score: this.calculateCodeDuplicationScore(content),
        impact: 0,
      },
      {
        name: "Naming Conventions",
        weight: 0.1,
        score: this.calculateNamingConventionsScore(content),
        impact: 0,
      },
    ];

    const weightedScore = this.calculateWeightedScore(factors);
    const grade = this.calculateGrade(weightedScore);
    const confidence = this.calculateConfidence(factors);

    return this.createHealthScore(
      "Maintainability Health",
      "maintainability",
      `Maintainability health score: ${weightedScore.toFixed(1)}/100`,
      filePath,
      weightedScore,
      grade,
      factors,
      confidence,
      "maintainability-scoring"
    );
  }

  /**
   * Calculate security health score.
   */
  private async calculateSecurityHealthScore(content: string, filePath: string): Promise<ArchitecturalHealthScore> {
    const factors = [
      {
        name: "Vulnerability Detection",
        weight: 0.3,
        score: this.calculateVulnerabilityScore(content),
        impact: 0,
      },
      {
        name: "Input Validation",
        weight: 0.25,
        score: this.calculateInputValidationScore(content),
        impact: 0,
      },
      {
        name: "Authentication",
        weight: 0.2,
        score: this.calculateAuthenticationScore(content),
        impact: 0,
      },
      {
        name: "Authorization",
        weight: 0.15,
        score: this.calculateAuthorizationScore(content),
        impact: 0,
      },
      {
        name: "Data Encryption",
        weight: 0.1,
        score: this.calculateDataEncryptionScore(content),
        impact: 0,
      },
    ];

    const weightedScore = this.calculateWeightedScore(factors);
    const grade = this.calculateGrade(weightedScore);
    const confidence = this.calculateConfidence(factors);

    return this.createHealthScore(
      "Security Health",
      "security",
      `Security health score: ${weightedScore.toFixed(1)}/100`,
      filePath,
      weightedScore,
      grade,
      factors,
      confidence,
      "security-scoring"
    );
  }

  /**
   * Calculate scalability health score.
   */
  private async calculateScalabilityHealthScore(content: string, filePath: string): Promise<ArchitecturalHealthScore> {
    const factors = [
      {
        name: "Concurrency Support",
        weight: 0.3,
        score: this.calculateConcurrencyScore(content),
        impact: 0,
      },
      {
        name: "Resource Management",
        weight: 0.25,
        score: this.calculateResourceManagementScore(content),
        impact: 0,
      },
      {
        name: "Load Balancing",
        weight: 0.2,
        score: this.calculateLoadBalancingScore(content),
        impact: 0,
      },
      {
        name: "Caching Strategy",
        weight: 0.15,
        score: this.calculateCachingStrategyScore(content),
        impact: 0,
      },
      {
        name: "Database Optimization",
        weight: 0.1,
        score: this.calculateDatabaseOptimizationScore(content),
        impact: 0,
      },
    ];

    const weightedScore = this.calculateWeightedScore(factors);
    const grade = this.calculateGrade(weightedScore);
    const confidence = this.calculateConfidence(factors);

    return this.createHealthScore(
      "Scalability Health",
      "scalability",
      `Scalability health score: ${weightedScore.toFixed(1)}/100`,
      filePath,
      weightedScore,
      grade,
      factors,
      confidence,
      "scalability-scoring"
    );
  }

  /**
   * Calculate reliability health score.
   */
  private async calculateReliabilityHealthScore(content: string, filePath: string): Promise<ArchitecturalHealthScore> {
    const factors = [
      {
        name: "Error Handling",
        weight: 0.3,
        score: this.calculateErrorHandlingScore(content),
        impact: 0,
      },
      {
        name: "Logging",
        weight: 0.25,
        score: this.calculateLoggingScore(content),
        impact: 0,
      },
      {
        name: "Monitoring",
        weight: 0.2,
        score: this.calculateMonitoringScore(content),
        impact: 0,
      },
      {
        name: "Fault Tolerance",
        weight: 0.15,
        score: this.calculateFaultToleranceScore(content),
        impact: 0,
      },
      {
        name: "Testing Coverage",
        weight: 0.1,
        score: this.calculateTestingCoverageScore(content),
        impact: 0,
      },
    ];

    const weightedScore = this.calculateWeightedScore(factors);
    const grade = this.calculateGrade(weightedScore);
    const confidence = this.calculateConfidence(factors);

    return this.createHealthScore(
      "Reliability Health",
      "reliability",
      `Reliability health score: ${weightedScore.toFixed(1)}/100`,
      filePath,
      weightedScore,
      grade,
      factors,
      confidence,
      "reliability-scoring"
    );
  }

  /**
   * Calculate overall health score.
   */
  private async calculateOverallHealthScore(
    individualScores: ArchitecturalHealthScore[],
    filePath: string
  ): Promise<ArchitecturalHealthScore> {
    const factors = individualScores.map(score => ({
      name: score.type.charAt(0).toUpperCase() + score.type.slice(1),
      weight: this.getOverallWeight(score.type),
      score: score.score,
      impact: 0,
    }));

    const weightedScore = this.calculateWeightedScore(factors);
    const grade = this.calculateGrade(weightedScore);
    const confidence = this.calculateConfidence(factors);

    return this.createHealthScore(
      "Overall Health",
      "overall",
      `Overall health score: ${weightedScore.toFixed(1)}/100`,
      filePath,
      weightedScore,
      grade,
      factors,
      confidence,
      "overall-scoring"
    );
  }

  /**
   * Post-process health scores.
   */
  private async postProcessScores(): Promise<void> {
    // Calculate impact for each factor
    this.calculateFactorImpacts();

    // Update historical data
    this.updateHistoricalData();

    // Calculate trends
    if (this.config.enableTrendAnalysis) {
      this.calculateTrends();
    }

    // Generate recommendations
    this.generateRecommendations();
  }

  /**
   * Calculate impact for each factor.
   */
  private calculateFactorImpacts(): void {
    for (const [file, scores] of this.healthScores) {
      for (const score of scores) {
        for (const factor of score.breakdown.factors) {
          factor.impact = factor.weight * factor.score;
        }
      }
    }
  }

  /**
   * Update historical data.
   */
  private updateHistoricalData(): void {
    const allScores = Array.from(this.healthScores.values()).flat();

    for (const score of allScores) {
      const key = `${score.type}-${score.location.file}`;
      if (!this.historicalScores.has(key)) {
        this.historicalScores.set(key, []);
      }

      const history = this.historicalScores.get(key)!;
      history.push({
        timestamp: new Date().toISOString(),
        score: score.score,
        grade: score.grade,
        confidence: score.metrics.confidence,
      });

      // Keep only recent history
      if (history.length > 1000) {
        history.splice(0, history.length - 1000);
      }
    }
  }

  /**
   * Calculate trends for health scores.
   */
  private calculateTrends(): void {
    for (const [file, scores] of this.healthScores) {
      for (const score of scores) {
        const key = `${score.type}-${file}`;
        const history = this.historicalScores.get(key) || [];

        if (history.length >= 2) {
          const recent = history.slice(-2);
          const trend = this.calculateTrend(recent);
          score.metrics.trend = trend;
        } else {
          score.metrics.trend = "stable";
        }
      }
    }
  }

  /**
   * Generate recommendations for health scores.
   */
  private generateRecommendations(): void {
    for (const [file, scores] of this.healthScores) {
      for (const score of scores) {
        score.recommendations = this.generateRecommendationsForScore(score);
      }
    }
  }

  // Scoring helper methods

  private calculateComplexityScore(content: string): number {
    const lines = content.split("\n").length;
    const complexity = lines * 0.1;
    return Math.max(0, 100 - complexity * 10);
  }

  private calculateLoopEfficiencyScore(content: string): number {
    const loops = (content.match(/for\s*\(|while\s*\(|forEach/g) || []).length;
    const efficiency = Math.max(0, 100 - loops * 5);
    return efficiency;
  }

  private calculateMemoryUsageScore(content: string): number {
    const memoryIntensive = (content.match(/new\s+Array|new\s+Object|JSON\.parse/g) || []).length;
    const score = Math.max(0, 100 - memoryIntensive * 10);
    return score;
  }

  private calculateAsyncOperationsScore(content: string): number {
    const asyncOps = (content.match(/async|await|Promise/g) || []).length;
    const score = Math.min(100, 50 + asyncOps * 5);
    return score;
  }

  private calculateAlgorithmEfficiencyScore(content: string): number {
    const efficient = (content.match(/map|filter|reduce|find/g) || []).length;
    const inefficient = (content.match(/for\s*\(.*\.length|while\s*\(true\)/g) || []).length;
    const score = Math.max(0, 100 - inefficient * 20 + efficient * 5);
    return score;
  }

  private calculateReadabilityScore(content: string): number {
    const lines = content.split("\n");
    const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
    const score = Math.max(0, 100 - avgLineLength * 0.5);
    return score;
  }

  private calculateDocumentationScore(content: string): number {
    const totalLines = content.split("\n").length;
    const commentLines = (content.match(/\/\/|\/\*|\*/g) || []).length;
    const ratio = totalLines > 0 ? commentLines / totalLines : 0;
    return Math.min(100, ratio * 200);
  }

  private calculateFunctionLengthScore(content: string): number {
    const functions = content.split(/function\s+\w+|const\s+\w+\s*=\s*\(/);
    const avgLength = functions.reduce((sum, func) => sum + func.length, 0) / functions.length;
    const score = Math.max(0, 100 - avgLength * 0.1);
    return score;
  }

  private calculateCyclomaticComplexityScore(content: string): number {
    const complexity = (content.match(/if\s*\(|else\s*if|while\s*\(|for\s*\(|switch\s*\(|case\s+/g) || []).length;
    const score = Math.max(0, 100 - complexity * 5);
    return score;
  }

  private calculateCodeDuplicationScore(content: string): number {
    const lines = content.split("\n");
    const uniqueLines = new Set(lines);
    const duplicationRatio = 1 - uniqueLines.size / lines.length;
    const score = Math.max(0, 100 - duplicationRatio * 100);
    return score;
  }

  private calculateNamingConventionsScore(content: string): number {
    const camelCase = (content.match(/[a-z][a-zA-Z0-9]*[A-Z]/g) || []).length;
    const snakeCase = (content.match(/[a-z][a-zA-Z0-9]*_[a-zA-Z0-9]/g) || []).length;
    const total = camelCase + snakeCase;
    const score = total > 0 ? (camelCase / total) * 100 : 50;
    return score;
  }

  private calculateVulnerabilityScore(content: string): number {
    const vulnerabilities = (content.match(/eval\s*\(|innerHTML|document\.write|setTimeout\s*\(.*string/g) || [])
      .length;
    const score = Math.max(0, 100 - vulnerabilities * 20);
    return score;
  }

  private calculateInputValidationScore(content: string): number {
    const validation = (content.match(/validate|sanitize|escape|trim/g) || []).length;
    const score = Math.min(100, 50 + validation * 10);
    return score;
  }

  private calculateAuthenticationScore(content: string): number {
    const auth = (content.match(/auth|login|password|token|session/g) || []).length;
    const score = Math.min(100, auth * 15);
    return score;
  }

  private calculateAuthorizationScore(content: string): number {
    const authz = (content.match(/permission|role|access|authorize/g) || []).length;
    const score = Math.min(100, authz * 20);
    return score;
  }

  private calculateDataEncryptionScore(content: string): number {
    const encryption = (content.match(/encrypt|decrypt|crypto|hash|salt/g) || []).length;
    const score = Math.min(100, encryption * 25);
    return score;
  }

  private calculateConcurrencyScore(content: string): number {
    const concurrency = (content.match(/async|await|Promise|Worker|Thread/g) || []).length;
    const score = Math.min(100, 50 + concurrency * 10);
    return score;
  }

  private calculateResourceManagementScore(content: string): number {
    const resources = (content.match(/close|dispose|cleanup|destroy/g) || []).length;
    const score = Math.min(100, 50 + resources * 15);
    return score;
  }

  private calculateLoadBalancingScore(content: string): number {
    const loadBalancing = (content.match(/load|balance|distribute|cluster/g) || []).length;
    const score = Math.min(100, loadBalancing * 25);
    return score;
  }

  private calculateCachingStrategyScore(content: string): number {
    const caching = (content.match(/cache|memoize|store|redis/g) || []).length;
    const score = Math.min(100, caching * 20);
    return score;
  }

  private calculateDatabaseOptimizationScore(content: string): number {
    const dbOpt = (content.match(/index|query|optimize|connection/g) || []).length;
    const score = Math.min(100, dbOpt * 15);
    return score;
  }

  private calculateErrorHandlingScore(content: string): number {
    const errorHandling = (content.match(/try\s*\{|catch\s*\(|throw\s+/g) || []).length;
    const score = Math.min(100, errorHandling * 20);
    return score;
  }

  private calculateLoggingScore(content: string): number {
    const logging = (content.match(/console\.|log|debug|info|warn|error/g) || []).length;
    const score = Math.min(100, logging * 15);
    return score;
  }

  private calculateMonitoringScore(content: string): number {
    const monitoring = (content.match(/monitor|metric|track|measure/g) || []).length;
    const score = Math.min(100, monitoring * 20);
    return score;
  }

  private calculateFaultToleranceScore(content: string): number {
    const faultTolerance = (content.match(/retry|fallback|circuit|breaker/g) || []).length;
    const score = Math.min(100, faultTolerance * 25);
    return score;
  }

  private calculateTestingCoverageScore(content: string): number {
    const testing = (content.match(/test|spec|mock|stub|spy/g) || []).length;
    const score = Math.min(100, testing * 20);
    return score;
  }

  private calculateWeightedScore(
    factors: Array<{ name: string; weight: number; score: number; impact: number }>
  ): number {
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    const weightedSum = factors.reduce((sum, factor) => sum + factor.weight * factor.score, 0);
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private calculateGrade(score: number): "A+" | "A" | "B+" | "B" | "C+" | "C" | "D+" | "D" | "F" {
    if (score >= 97) return "A+";
    if (score >= 93) return "A";
    if (score >= 90) return "B+";
    if (score >= 87) return "B";
    if (score >= 83) return "C+";
    if (score >= 80) return "C";
    if (score >= 77) return "D+";
    if (score >= 70) return "D";
    return "F";
  }

  private calculateConfidence(factors: Array<{ name: string; weight: number; score: number; impact: number }>): number {
    // Simulate confidence calculation based on factor consistency
    const scores = factors.map(f => f.score);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
    const confidence = Math.max(0.5, 1 - variance / 10000);
    return Math.min(1, confidence);
  }

  private getOverallWeight(type: string): number {
    const weights: Record<string, number> = {
      performance: 0.25,
      maintainability: 0.25,
      security: 0.2,
      scalability: 0.15,
      reliability: 0.15,
    };
    return weights[type] || 0.1;
  }

  private calculateTrend(history: any[]): "improving" | "stable" | "declining" {
    if (history.length < 2) return "stable";

    const recent = history[history.length - 1].score;
    const previous = history[history.length - 2].score;
    const diff = recent - previous;

    if (diff > 5) return "improving";
    if (diff < -5) return "declining";
    return "stable";
  }

  private generateRecommendationsForScore(
    score: ArchitecturalHealthScore
  ): ArchitecturalHealthScore["recommendations"] {
    const priority = score.score < 60 ? "critical" : score.score < 70 ? "high" : score.score < 80 ? "medium" : "low";

    const actions = [];
    if (score.score < 80) {
      actions.push("Review and refactor code");
      actions.push("Add comprehensive testing");
      actions.push("Improve documentation");
    }

    const expectedImprovement = Math.min(20, 100 - score.score);

    return {
      priority,
      actions,
      expectedImprovement,
      effort: priority === "critical" ? "high" : "medium",
    };
  }

  private createHealthScore(
    title: string,
    type: string,
    description: string,
    filePath: string,
    score: number,
    grade: string,
    factors: Array<{ name: string; weight: number; score: number; impact: number }>,
    confidence: number,
    algorithm: string
  ): ArchitecturalHealthScore {
    return {
      id: `health-score-${Date.now()}-${Math.random()}`,
      type: type as any,
      category: this.categorizeHealthScore(type),
      score,
      grade: grade as any,
      description,
      location: {
        file: filePath,
      },
      metrics: {
        rawScore: score,
        normalizedScore: score,
        confidence,
        trend: "stable",
        lastUpdated: new Date().toISOString(),
      },
      breakdown: {
        factors,
        totalWeight: factors.reduce((sum, factor) => sum + factor.weight, 0),
        weightedScore: score,
      },
      recommendations: {
        priority: "medium",
        actions: [],
        expectedImprovement: 0,
        effort: "medium",
      },
      metadata: {
        algorithm,
        calculatedAt: new Date().toISOString(),
        version: "1.0.0",
        dataPoints: factors.length,
      },
    };
  }

  private categorizeHealthScore(type: string): string {
    const categories: Record<string, string> = {
      performance: "performance",
      maintainability: "maintainability",
      security: "security",
      scalability: "scalability",
      reliability: "reliability",
      overall: "overall",
    };
    return categories[type] || "other";
  }

  private async findSourceFiles(): Promise<string[]> {
    const files: string[] = [];
    await this.findFilesRecursive(this.codebasePath, "**/*.{ts,tsx,js,jsx}", files, 0);
    return files;
  }

  private async findFilesRecursive(dir: string, pattern: string, files: string[], depth: number): Promise<void> {
    if (depth > 10) return;

    try {
      const entries = await readdir(dir);
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = await this.stat(fullPath);

        if (stat.isDirectory()) {
          await this.findFilesRecursive(fullPath, pattern, files, depth + 1);
        } else if (this.matchesPattern(entry, pattern)) {
          files.push(relative(this.codebasePath, fullPath));
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  private async stat(path: string): Promise<any> {
    try {
      return await stat(path);
    } catch {
      return { isDirectory: () => false, isFile: () => false };
    }
  }

  private matchesPattern(filename: string, pattern: string): boolean {
    if (pattern.includes("**/*")) {
      const ext = pattern.split(".").pop();
      return filename.endsWith(`.${ext}`);
    }
    return filename === pattern;
  }

  /**
   * Get health scores for a specific file.
   */
  getHealthScoresForFile(filePath: string): ArchitecturalHealthScore[] {
    return this.healthScores.get(filePath) || [];
  }

  /**
   * Get all health scores.
   */
  getAllHealthScores(): ArchitecturalHealthScore[] {
    return Array.from(this.healthScores.values()).flat();
  }

  /**
   * Get health scores by type.
   */
  getHealthScoresByType(type: string): ArchitecturalHealthScore[] {
    return this.getAllHealthScores().filter(score => score.type === type);
  }

  /**
   * Get health score statistics.
   */
  getHealthScoreStatistics(): {
    totalScores: number;
    scoresByType: Record<string, number>;
    scoresByGrade: Record<string, number>;
    averageScore: number;
    averageConfidence: number;
    topScores: Array<{ type: string; count: number }>;
  } {
    const allScores = this.getAllHealthScores();
    const totalScores = allScores.length;

    const scoresByType: Record<string, number> = {};
    const scoresByGrade: Record<string, number> = {};
    const scoreCounts: Record<string, number> = {};

    let totalScore = 0;
    let totalConfidence = 0;

    for (const score of allScores) {
      scoresByType[score.type] = (scoresByType[score.type] || 0) + 1;
      scoresByGrade[score.grade] = (scoresByGrade[score.grade] || 0) + 1;
      scoreCounts[score.type] = (scoreCounts[score.type] || 0) + 1;

      totalScore += score.score;
      totalConfidence += score.metrics.confidence;
    }

    const averageScore = totalScores > 0 ? totalScore / totalScores : 0;
    const averageConfidence = totalScores > 0 ? totalConfidence / totalScores : 0;

    const topScores = Object.entries(scoreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }));

    return {
      totalScores,
      scoresByType,
      scoresByGrade,
      averageScore,
      averageConfidence,
      topScores,
    };
  }

  /**
   * Export health scores.
   */
  async exportHealthScores(format: "json" | "csv" | "xml"): Promise<string> {
    const allScores = this.getAllHealthScores();

    switch (format) {
      case "json":
        return JSON.stringify(
          {
            healthScores: allScores,
            statistics: this.getHealthScoreStatistics(),
            metadata: {
              analyzedAt: new Date().toISOString(),
              totalFiles: this.healthScores.size,
              config: this.config,
            },
          },
          null,
          2
        );

      case "csv":
        const csvHeader = "id,type,score,grade,file,confidence,trend";
        const csvRows = allScores.map(
          score =>
            `${score.id},${score.type},${score.score},${score.grade},${score.location.file},${score.metrics.confidence},${score.metrics.trend}`
        );
        return [csvHeader, ...csvRows].join("\n");

      case "xml":
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<healthScores>
  <metadata>
    <analyzedAt>${new Date().toISOString()}</analyzedAt>
    <totalFiles>${this.healthScores.size}</totalFiles>
    <totalScores>${allScores.length}</totalScores>
  </metadata>
  <scores>
    ${allScores
      .map(
        score => `
    <score id="${score.id}">
      <type>${score.type}</type>
      <score>${score.score}</score>
      <grade>${score.grade}</grade>
      <file>${score.location.file}</file>
      <confidence>${score.metrics.confidence}</confidence>
      <trend>${score.metrics.trend}</trend>
    </score>`
      )
      .join("")}
  </scores>
</healthScores>`;
        return xml;

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}
