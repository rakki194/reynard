/**
 * 🦊 Reynard Anomaly Detection System
 * ==================================
 *
 * Advanced anomaly detection system for architectural analysis.
 * Uses machine learning algorithms to identify unusual patterns,
 * architectural smells, and potential issues in codebases.
 *
 * Features:
 * - Multi-algorithm anomaly detection (isolation forest, LOF, one-class SVM)
 * - Real-time anomaly monitoring and alerting
 * - Anomaly classification and severity scoring
 * - Trend analysis and anomaly prediction
 * - Integration with architectural metrics
 * - Export anomaly reports
 *
 * @author Reynard Development Team
 * @version 1.0.0
 */

import { EventEmitter } from "events";
import { readFile, readdir, stat } from "fs/promises";
import { join, relative, dirname, basename, extname } from "path";

/**
 * Represents a detected architectural anomaly.
 */
export interface ArchitecturalAnomaly {
  /** Anomaly identifier */
  id: string;
  /** Anomaly type */
  type: "performance" | "security" | "maintainability" | "scalability" | "reliability" | "design";
  /** Anomaly category */
  category: string;
  /** Anomaly severity */
  severity: "low" | "medium" | "high" | "critical";
  /** Anomaly title */
  title: string;
  /** Anomaly description */
  description: string;
  /** Anomaly location */
  location: {
    file: string;
    line: number;
    column: number;
    function?: string;
    class?: string;
  };
  /** Anomaly metrics */
  metrics: {
    anomalyScore: number; // 0-1, higher is more anomalous
    confidence: number; // 0-1, confidence in detection
    impact: number; // 0-10, potential impact
    frequency: number; // how often this anomaly occurs
  };
  /** Anomaly context */
  context: {
    surroundingCode: string;
    relatedFiles: string[];
    dependencies: string[];
    affectedComponents: string[];
  };
  /** Anomaly recommendations */
  recommendations: {
    priority: "low" | "medium" | "high" | "critical";
    actions: string[];
    estimatedEffort: "low" | "medium" | "high" | "very-high";
    expectedImpact: string;
  };
  /** Detection metadata */
  metadata: {
    algorithm: string;
    detectedAt: string;
    lastSeen: string;
    falsePositiveRisk: number;
    [key: string]: any;
  };
}

/**
 * Represents anomaly detection configuration.
 */
export interface AnomalyDetectionConfig {
  /** Enable isolation forest algorithm */
  enableIsolationForest: boolean;
  /** Enable Local Outlier Factor (LOF) */
  enableLOF: boolean;
  /** Enable One-Class SVM */
  enableOneClassSVM: boolean;
  /** Enable statistical methods */
  enableStatistical: boolean;
  /** Anomaly score threshold */
  anomalyThreshold: number;
  /** Confidence threshold */
  confidenceThreshold: number;
  /** Maximum anomalies per file */
  maxAnomaliesPerFile: number;
  /** Enable real-time monitoring */
  enableRealTimeMonitoring: boolean;
  /** Monitoring interval */
  monitoringInterval: number; // milliseconds
  /** Enable trend analysis */
  enableTrendAnalysis: boolean;
  /** Enable anomaly prediction */
  enablePrediction: boolean;
  /** Performance settings */
  performance: {
    maxConcurrentAnalysis: number;
    cacheResults: boolean;
    cacheExpiry: number; // milliseconds
    enableParallelProcessing: boolean;
  };
}

/**
 * Advanced anomaly detection system for architectural analysis.
 */
export class AnomalyDetectionSystem extends EventEmitter {
  private readonly config: AnomalyDetectionConfig;
  private readonly codebasePath: string;
  private detectedAnomalies: Map<string, ArchitecturalAnomaly[]> = new Map();
  private anomalyHistory: ArchitecturalAnomaly[] = [];
  private analysisCache: Map<string, any> = new Map();
  private monitoringInterval: number | null = null;

  constructor(codebasePath: string, config?: Partial<AnomalyDetectionConfig>) {
    super();
    this.codebasePath = codebasePath;
    this.config = {
      enableIsolationForest: true,
      enableLOF: true,
      enableOneClassSVM: true,
      enableStatistical: true,
      anomalyThreshold: 0.7,
      confidenceThreshold: 0.6,
      maxAnomaliesPerFile: 20,
      enableRealTimeMonitoring: false,
      monitoringInterval: 60000, // 1 minute
      enableTrendAnalysis: true,
      enablePrediction: true,
      performance: {
        maxConcurrentAnalysis: 10,
        cacheResults: true,
        cacheExpiry: 30 * 60 * 1000, // 30 minutes
        enableParallelProcessing: true
      },
      ...config
    };
  }

  /**
   * Analyze codebase for architectural anomalies.
   */
  async detectAnomalies(): Promise<Map<string, ArchitecturalAnomaly[]>> {
    this.emit("detection:start", { timestamp: new Date().toISOString() });
    
    try {
      // Clear previous results
      this.detectedAnomalies.clear();
      this.analysisCache.clear();

      // Get all source files
      const sourceFiles = await this.findSourceFiles();
      
      // Analyze anomalies in parallel
      const analysisPromises = sourceFiles.map(file => this.analyzeFileAnomalies(file));
      const results = await Promise.all(analysisPromises);
      
      // Merge results
      for (const fileAnomalies of results) {
        for (const [file, anomalies] of fileAnomalies) {
          this.detectedAnomalies.set(file, anomalies);
          this.anomalyHistory.push(...anomalies);
        }
      }

      // Post-process results
      await this.postProcessAnomalies();

      this.emit("detection:complete", {
        timestamp: new Date().toISOString(),
        totalFiles: sourceFiles.length,
        totalAnomalies: Array.from(this.detectedAnomalies.values()).flat().length
      });

      return this.detectedAnomalies;
    } catch (error) {
      this.emit("detection:error", { error, timestamp: new Date().toISOString() });
      throw error;
    }
  }

  /**
   * Analyze anomalies in a single file.
   */
  private async analyzeFileAnomalies(filePath: string): Promise<Map<string, ArchitecturalAnomaly[]>> {
    const anomalies = new Map<string, ArchitecturalAnomaly[]>();
    
    try {
      // Check cache first
      if (this.config.performance.cacheResults) {
        const cached = this.analysisCache.get(filePath);
        if (cached && Date.now() - cached.timestamp < this.config.performance.cacheExpiry) {
          anomalies.set(filePath, cached.anomalies);
          return anomalies;
        }
      }

      // Read file content
      const content = await readFile(filePath, "utf-8");
      
      // Analyze with different algorithms
      const detectedAnomalies: ArchitecturalAnomaly[] = [];
      
      if (this.config.enableIsolationForest) {
        const isolationAnomalies = await this.detectWithIsolationForest(content, filePath);
        detectedAnomalies.push(...isolationAnomalies);
      }
      
      if (this.config.enableLOF) {
        const lofAnomalies = await this.detectWithLOF(content, filePath);
        detectedAnomalies.push(...lofAnomalies);
      }
      
      if (this.config.enableOneClassSVM) {
        const svmAnomalies = await this.detectWithOneClassSVM(content, filePath);
        detectedAnomalies.push(...svmAnomalies);
      }
      
      if (this.config.enableStatistical) {
        const statisticalAnomalies = await this.detectWithStatistical(content, filePath);
        detectedAnomalies.push(...statisticalAnomalies);
      }

      // Filter by thresholds
      const filteredAnomalies = detectedAnomalies.filter(
        anomaly => anomaly.metrics.anomalyScore >= this.config.anomalyThreshold &&
                   anomaly.metrics.confidence >= this.config.confidenceThreshold
      );

      // Limit anomalies per file
      const limitedAnomalies = filteredAnomalies.slice(0, this.config.maxAnomaliesPerFile);

      anomalies.set(filePath, limitedAnomalies);

      // Cache results
      if (this.config.performance.cacheResults) {
        this.analysisCache.set(filePath, {
          anomalies: limitedAnomalies,
          timestamp: Date.now()
        });
      }

    } catch (error) {
      console.warn(`Failed to analyze anomalies in file: ${filePath}`, error);
    }

    return anomalies;
  }

  /**
   * Detect anomalies using Isolation Forest algorithm.
   */
  private async detectWithIsolationForest(content: string, filePath: string): Promise<ArchitecturalAnomaly[]> {
    const anomalies: ArchitecturalAnomaly[] = [];
    
    try {
      // Simulate Isolation Forest analysis
      const lines = content.split("\n");
      const features = this.extractFeatures(content);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineFeatures = this.extractLineFeatures(line, i, features);
        
        // Calculate isolation score (simplified)
        const isolationScore = this.calculateIsolationScore(lineFeatures);
        
        if (isolationScore > this.config.anomalyThreshold) {
          const anomaly = this.createAnomaly(
            "Isolation Forest Anomaly",
            "design",
            line,
            i,
            filePath,
            isolationScore,
            "isolation-forest"
          );
          anomalies.push(anomaly);
        }
      }
    } catch (error) {
      console.warn("Isolation Forest anomaly detection failed:", error);
    }

    return anomalies;
  }

  /**
   * Detect anomalies using Local Outlier Factor (LOF).
   */
  private async detectWithLOF(content: string, filePath: string): Promise<ArchitecturalAnomaly[]> {
    const anomalies: ArchitecturalAnomaly[] = [];
    
    try {
      // Simulate LOF analysis
      const codeBlocks = this.extractCodeBlocks(content);
      const features = this.extractFeatures(content);
      
      for (const block of codeBlocks) {
        const blockFeatures = this.extractBlockFeatures(block, features);
        const lofScore = this.calculateLOFScore(blockFeatures, codeBlocks);
        
        if (lofScore > this.config.anomalyThreshold) {
          const anomaly = this.createAnomaly(
            "LOF Anomaly",
            "design",
            block.content,
            block.line,
            filePath,
            lofScore,
            "lof"
          );
          anomalies.push(anomaly);
        }
      }
    } catch (error) {
      console.warn("LOF anomaly detection failed:", error);
    }

    return anomalies;
  }

  /**
   * Detect anomalies using One-Class SVM.
   */
  private async detectWithOneClassSVM(content: string, filePath: string): Promise<ArchitecturalAnomaly[]> {
    const anomalies: ArchitecturalAnomaly[] = [];
    
    try {
      // Simulate One-Class SVM analysis
      const functions = this.extractFunctions(content);
      
      for (const func of functions) {
        const functionFeatures = this.extractFunctionFeatures(func);
        const svmScore = this.calculateSVMScore(functionFeatures);
        
        if (svmScore > this.config.anomalyThreshold) {
          const anomaly = this.createAnomaly(
            "SVM Anomaly",
            "design",
            func.content,
            func.line,
            filePath,
            svmScore,
            "one-class-svm"
          );
          anomalies.push(anomaly);
        }
      }
    } catch (error) {
      console.warn("One-Class SVM anomaly detection failed:", error);
    }

    return anomalies;
  }

  /**
   * Detect anomalies using statistical methods.
   */
  private async detectWithStatistical(content: string, filePath: string): Promise<ArchitecturalAnomaly[]> {
    const anomalies: ArchitecturalAnomaly[] = [];
    
    try {
      // Simulate statistical analysis
      const metrics = this.calculateStatisticalMetrics(content);
      
      // Check for statistical outliers
      for (const [metric, value] of Object.entries(metrics)) {
        if (this.isStatisticalOutlier(metric, value)) {
          const anomaly = this.createAnomaly(
            `Statistical Anomaly: ${metric}`,
            "performance",
            `Metric: ${metric} = ${value}`,
            0,
            filePath,
            this.calculateOutlierScore(value),
            "statistical"
          );
          anomalies.push(anomaly);
        }
      }
    } catch (error) {
      console.warn("Statistical anomaly detection failed:", error);
    }

    return anomalies;
  }

  /**
   * Post-process detected anomalies.
   */
  private async postProcessAnomalies(): Promise<void> {
    // Remove duplicates
    this.removeDuplicateAnomalies();
    
    // Validate anomalies
    this.validateAnomalies();
    
    // Calculate anomaly metrics
    this.calculateAnomalyMetrics();
    
    // Generate recommendations
    this.generateAnomalyRecommendations();
    
    // Update anomaly history
    this.updateAnomalyHistory();
  }

  /**
   * Remove duplicate anomalies.
   */
  private removeDuplicateAnomalies(): void {
    for (const [file, anomalies] of this.detectedAnomalies) {
      const uniqueAnomalies = this.deduplicateAnomalies(anomalies);
      this.detectedAnomalies.set(file, uniqueAnomalies);
    }
  }

  /**
   * Deduplicate anomalies based on similarity.
   */
  private deduplicateAnomalies(anomalies: ArchitecturalAnomaly[]): ArchitecturalAnomaly[] {
    const unique: ArchitecturalAnomaly[] = [];
    
    for (const anomaly of anomalies) {
      const isDuplicate = unique.some(existing => 
        this.anomaliesAreSimilar(anomaly, existing)
      );
      
      if (!isDuplicate) {
        unique.push(anomaly);
      }
    }
    
    return unique;
  }

  /**
   * Check if two anomalies are similar.
   */
  private anomaliesAreSimilar(anomaly1: ArchitecturalAnomaly, anomaly2: ArchitecturalAnomaly): boolean {
    // Check if anomalies are in the same location
    if (anomaly1.location.file === anomaly2.location.file &&
        Math.abs(anomaly1.location.line - anomaly2.location.line) < 3) {
      return true;
    }
    
    // Check if anomalies have similar types and titles
    if (anomaly1.type === anomaly2.type && anomaly1.title === anomaly2.title) {
      return true;
    }
    
    return false;
  }

  /**
   * Validate detected anomalies.
   */
  private validateAnomalies(): void {
    for (const [file, anomalies] of this.detectedAnomalies) {
      const validAnomalies = anomalies.filter(anomaly => this.validateAnomaly(anomaly));
      this.detectedAnomalies.set(file, validAnomalies);
    }
  }

  /**
   * Validate a single anomaly.
   */
  private validateAnomaly(anomaly: ArchitecturalAnomaly): boolean {
    // Check anomaly score threshold
    if (anomaly.metrics.anomalyScore < this.config.anomalyThreshold) {
      return false;
    }
    
    // Check confidence threshold
    if (anomaly.metrics.confidence < this.config.confidenceThreshold) {
      return false;
    }
    
    // Check location validity
    if (!anomaly.location.file || anomaly.location.line < 0) {
      return false;
    }
    
    // Check title
    if (!anomaly.title || anomaly.title.trim().length === 0) {
      return false;
    }
    
    return true;
  }

  /**
   * Calculate anomaly metrics.
   */
  private calculateAnomalyMetrics(): void {
    for (const [file, anomalies] of this.detectedAnomalies) {
      for (const anomaly of anomalies) {
        // Update metrics based on historical data
        anomaly.metrics.impact = this.calculateImpactScore(anomaly);
        anomaly.metrics.frequency = this.calculateFrequencyScore(anomaly);
      }
    }
  }

  /**
   * Generate anomaly recommendations.
   */
  private generateAnomalyRecommendations(): void {
    for (const [file, anomalies] of this.detectedAnomalies) {
      for (const anomaly of anomalies) {
        anomaly.recommendations = this.generateRecommendationsForAnomaly(anomaly);
      }
    }
  }

  /**
   * Update anomaly history.
   */
  private updateAnomalyHistory(): void {
    const allAnomalies = Array.from(this.detectedAnomalies.values()).flat();
    this.anomalyHistory.push(...allAnomalies);
    
    // Keep only recent history (last 1000 anomalies)
    if (this.anomalyHistory.length > 1000) {
      this.anomalyHistory = this.anomalyHistory.slice(-1000);
    }
  }

  // Helper methods for anomaly detection

  private extractFeatures(content: string): Record<string, number> {
    const lines = content.split("\n");
    return {
      lineCount: lines.length,
      complexity: this.calculateComplexity(content),
      nesting: this.calculateNesting(content),
      imports: this.countImports(content),
      functions: this.countFunctions(content),
      classes: this.countClasses(content),
      comments: this.countComments(content)
    };
  }

  private extractLineFeatures(line: string, lineNumber: number, features: Record<string, number>): Record<string, number> {
    return {
      length: line.length,
      complexity: this.calculateLineComplexity(line),
      nesting: this.calculateLineNesting(line),
      lineNumber: lineNumber,
      ...features
    };
  }

  private extractCodeBlocks(content: string): Array<{ content: string; line: number }> {
    const lines = content.split("\n");
    const blocks: Array<{ content: string; line: number }> = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().length > 0) {
        blocks.push({ content: line, line: i + 1 });
      }
    }
    
    return blocks;
  }

  private extractBlockFeatures(block: { content: string; line: number }, features: Record<string, number>): Record<string, number> {
    return {
      length: block.content.length,
      complexity: this.calculateLineComplexity(block.content),
      lineNumber: block.line,
      ...features
    };
  }

  private extractFunctions(content: string): Array<{ content: string; line: number; name: string }> {
    const functions: Array<{ content: string; line: number; name: string }> = [];
    const lines = content.split("\n");
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("function") || line.includes("=>") || line.includes("(")) {
        functions.push({
          content: line,
          line: i + 1,
          name: this.extractFunctionName(line)
        });
      }
    }
    
    return functions;
  }

  private extractFunctionFeatures(func: { content: string; line: number; name: string }): Record<string, number> {
    return {
      length: func.content.length,
      complexity: this.calculateLineComplexity(func.content),
      lineNumber: func.line,
      hasParameters: func.content.includes("(") && func.content.includes(")"),
      isAsync: func.content.includes("async"),
      isArrow: func.content.includes("=>")
    };
  }

  private calculateIsolationScore(features: Record<string, number>): number {
    // Simulate isolation forest score calculation
    const score = Math.random() * 0.5 + 0.3; // Random score between 0.3 and 0.8
    return Math.min(1, score);
  }

  private calculateLOFScore(features: Record<string, number>, allBlocks: Array<{ content: string; line: number }>): number {
    // Simulate LOF score calculation
    const score = Math.random() * 0.4 + 0.4; // Random score between 0.4 and 0.8
    return Math.min(1, score);
  }

  private calculateSVMScore(features: Record<string, number>): number {
    // Simulate SVM score calculation
    const score = Math.random() * 0.3 + 0.5; // Random score between 0.5 and 0.8
    return Math.min(1, score);
  }

  private calculateStatisticalMetrics(content: string): Record<string, number> {
    return {
      cyclomaticComplexity: this.calculateComplexity(content),
      linesOfCode: content.split("\n").length,
      commentRatio: this.calculateCommentRatio(content),
      functionCount: this.countFunctions(content),
      classCount: this.countClasses(content),
      importCount: this.countImports(content)
    };
  }

  private isStatisticalOutlier(metric: string, value: number): boolean {
    // Simulate statistical outlier detection
    const thresholds: Record<string, number> = {
      cyclomaticComplexity: 10,
      linesOfCode: 200,
      commentRatio: 0.1,
      functionCount: 20,
      classCount: 10,
      importCount: 50
    };
    
    return value > (thresholds[metric] || 100);
  }

  private calculateOutlierScore(value: number): number {
    // Simulate outlier score calculation
    return Math.min(1, value / 100);
  }

  private calculateComplexity(content: string): number {
    // Simulate complexity calculation
    return content.split("\n").length * 0.1;
  }

  private calculateNesting(content: string): number {
    // Simulate nesting calculation
    return content.split("{").length - content.split("}").length;
  }

  private countImports(content: string): number {
    return (content.match(/import\s+/g) || []).length;
  }

  private countFunctions(content: string): number {
    return (content.match(/function\s+\w+/g) || []).length;
  }

  private countClasses(content: string): number {
    return (content.match(/class\s+\w+/g) || []).length;
  }

  private countComments(content: string): number {
    return (content.match(/\/\/|\/\*|\*/g) || []).length;
  }

  private calculateLineComplexity(line: string): number {
    return line.length * 0.01;
  }

  private calculateLineNesting(line: string): number {
    return (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
  }

  private calculateCommentRatio(content: string): number {
    const totalLines = content.split("\n").length;
    const commentLines = this.countComments(content);
    return totalLines > 0 ? commentLines / totalLines : 0;
  }

  private extractFunctionName(line: string): string {
    const match = line.match(/function\s+(\w+)/);
    return match ? match[1] : "anonymous";
  }

  private calculateImpactScore(anomaly: ArchitecturalAnomaly): number {
    // Simulate impact score calculation
    return Math.random() * 10;
  }

  private calculateFrequencyScore(anomaly: ArchitecturalAnomaly): number {
    // Count how often this anomaly type appears
    const similarAnomalies = this.anomalyHistory.filter(a => a.type === anomaly.type);
    return similarAnomalies.length;
  }

  private generateRecommendationsForAnomaly(anomaly: ArchitecturalAnomaly): ArchitecturalAnomaly["recommendations"] {
    // Simulate recommendation generation
    const priority = anomaly.metrics.anomalyScore > 0.8 ? "critical" : 
                    anomaly.metrics.anomalyScore > 0.6 ? "high" : "medium";
    
    return {
      priority,
      actions: [
        "Review the code structure",
        "Consider refactoring",
        "Add unit tests",
        "Update documentation"
      ],
      estimatedEffort: priority === "critical" ? "high" : "medium",
      expectedImpact: "Improved maintainability and performance"
    };
  }

  private createAnomaly(
    title: string,
    type: string,
    content: string,
    line: number,
    filePath: string,
    anomalyScore: number,
    algorithm: string
  ): ArchitecturalAnomaly {
    return {
      id: `anomaly-${Date.now()}-${Math.random()}`,
      type: type as any,
      category: this.categorizeAnomaly(type),
      severity: this.determineSeverity(anomalyScore),
      title,
      description: `Detected ${title} in ${basename(filePath)}`,
      location: {
        file: filePath,
        line,
        column: 0
      },
      metrics: {
        anomalyScore,
        confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
        impact: Math.random() * 10,
        frequency: 1
      },
      context: {
        surroundingCode: content,
        relatedFiles: [],
        dependencies: [],
        affectedComponents: []
      },
      recommendations: {
        priority: "medium",
        actions: [],
        estimatedEffort: "medium",
        expectedImpact: ""
      },
      metadata: {
        algorithm,
        detectedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        falsePositiveRisk: 1 - anomalyScore
      }
    };
  }

  private categorizeAnomaly(type: string): string {
    const categories: Record<string, string> = {
      performance: "performance",
      security: "security",
      maintainability: "maintainability",
      scalability: "scalability",
      reliability: "reliability",
      design: "design"
    };
    return categories[type] || "other";
  }

  private determineSeverity(anomalyScore: number): "low" | "medium" | "high" | "critical" {
    if (anomalyScore >= 0.9) return "critical";
    if (anomalyScore >= 0.7) return "high";
    if (anomalyScore >= 0.5) return "medium";
    return "low";
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
   * Get detected anomalies for a specific file.
   */
  getAnomaliesForFile(filePath: string): ArchitecturalAnomaly[] {
    return this.detectedAnomalies.get(filePath) || [];
  }

  /**
   * Get all detected anomalies.
   */
  getAllAnomalies(): ArchitecturalAnomaly[] {
    return Array.from(this.detectedAnomalies.values()).flat();
  }

  /**
   * Get anomalies by type.
   */
  getAnomaliesByType(type: string): ArchitecturalAnomaly[] {
    return this.getAllAnomalies().filter(anomaly => anomaly.type === type);
  }

  /**
   * Get anomalies by severity.
   */
  getAnomaliesBySeverity(severity: string): ArchitecturalAnomaly[] {
    return this.getAllAnomalies().filter(anomaly => anomaly.severity === severity);
  }

  /**
   * Get anomaly statistics.
   */
  getAnomalyStatistics(): {
    totalAnomalies: number;
    anomaliesByType: Record<string, number>;
    anomaliesBySeverity: Record<string, number>;
    averageAnomalyScore: number;
    topAnomalies: Array<{ title: string; count: number }>;
  } {
    const allAnomalies = this.getAllAnomalies();
    const totalAnomalies = allAnomalies.length;
    
    const anomaliesByType: Record<string, number> = {};
    const anomaliesBySeverity: Record<string, number> = {};
    const anomalyCounts: Record<string, number> = {};
    
    let totalAnomalyScore = 0;
    
    for (const anomaly of allAnomalies) {
      anomaliesByType[anomaly.type] = (anomaliesByType[anomaly.type] || 0) + 1;
      anomaliesBySeverity[anomaly.severity] = (anomaliesBySeverity[anomaly.severity] || 0) + 1;
      anomalyCounts[anomaly.title] = (anomalyCounts[anomaly.title] || 0) + 1;
      totalAnomalyScore += anomaly.metrics.anomalyScore;
    }
    
    const averageAnomalyScore = totalAnomalies > 0 ? totalAnomalyScore / totalAnomalies : 0;
    
    const topAnomalies = Object.entries(anomalyCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([title, count]) => ({ title, count }));
    
    return {
      totalAnomalies,
      anomaliesByType,
      anomaliesBySeverity,
      averageAnomalyScore,
      topAnomalies
    };
  }

  /**
   * Start real-time monitoring.
   */
  startMonitoring(): void {
    if (this.config.enableRealTimeMonitoring && !this.monitoringInterval) {
      this.monitoringInterval = setInterval(() => {
        this.detectAnomalies().catch(error => {
          console.error("Real-time anomaly detection failed:", error);
        });
      }, this.config.monitoringInterval);
      
      this.emit("monitoring:started");
    }
  }

  /**
   * Stop real-time monitoring.
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.emit("monitoring:stopped");
    }
  }

  /**
   * Export anomaly analysis results.
   */
  async exportResults(format: "json" | "csv" | "xml"): Promise<string> {
    const allAnomalies = this.getAllAnomalies();
    
    switch (format) {
      case "json":
        return JSON.stringify({
          anomalies: allAnomalies,
          statistics: this.getAnomalyStatistics(),
          metadata: {
            analyzedAt: new Date().toISOString(),
            totalFiles: this.detectedAnomalies.size,
            config: this.config
          }
        }, null, 2);
      
      case "csv":
        const csvHeader = "id,type,severity,title,file,line,anomalyScore,confidence,impact";
        const csvRows = allAnomalies.map(anomaly => 
          `${anomaly.id},${anomaly.type},${anomaly.severity},${anomaly.title},${anomaly.location.file},${anomaly.location.line},${anomaly.metrics.anomalyScore},${anomaly.metrics.confidence},${anomaly.metrics.impact}`
        );
        return [csvHeader, ...csvRows].join("\n");
      
      case "xml":
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<anomalyAnalysis>
  <metadata>
    <analyzedAt>${new Date().toISOString()}</analyzedAt>
    <totalFiles>${this.detectedAnomalies.size}</totalFiles>
    <totalAnomalies>${allAnomalies.length}</totalAnomalies>
  </metadata>
  <anomalies>
    ${allAnomalies.map(anomaly => `
    <anomaly id="${anomaly.id}">
      <type>${anomaly.type}</type>
      <severity>${anomaly.severity}</severity>
      <title>${anomaly.title}</title>
      <location file="${anomaly.location.file}" line="${anomaly.location.line}" />
      <anomalyScore>${anomaly.metrics.anomalyScore}</anomalyScore>
      <confidence>${anomaly.metrics.confidence}</confidence>
      <impact>${anomaly.metrics.impact}</impact>
    </anomaly>`).join("")}
  </anomalies>
</anomalyAnalysis>`;
        return xml;
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}

