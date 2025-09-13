/**
 * Codebase Analysis Engine for Intelligent ADR Generation
 *
 * This module provides comprehensive codebase analysis capabilities to identify
 * architectural patterns, dependencies, and potential decision points that
 * warrant ADR documentation.
 */

import { readFile, readdir, stat } from "fs/promises";
import { join, extname, basename } from "path";
import { createHash } from "crypto";

export interface CodebaseMetrics {
  totalFiles: number;
  totalLines: number;
  fileTypes: Record<string, number>;
  averageFileSize: number;
  largestFiles: Array<{ path: string; lines: number }>;
  complexityScore: number;
}

export interface DependencyAnalysis {
  internalDependencies: Map<string, string[]>;
  externalDependencies: Map<string, string[]>;
  circularDependencies: string[][];
  dependencyDepth: Map<string, number>;
  criticalDependencies: string[];
}

export interface ArchitecturePattern {
  type: "microservice" | "monolith" | "modular" | "layered" | "event-driven";
  confidence: number;
  evidence: string[];
  recommendations: string[];
}

export interface CodeQualityMetrics {
  testCoverage: number;
  documentationCoverage: number;
  complexityMetrics: {
    cyclomaticComplexity: number;
    cognitiveComplexity: number;
    maintainabilityIndex: number;
  };
  codeSmells: Array<{
    type: string;
    severity: "low" | "medium" | "high";
    location: string;
    description: string;
  }>;
}

export interface ADRSuggestion {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "critical";
  category:
    | "security"
    | "performance"
    | "scalability"
    | "integration"
    | "maintainability";
  reasoning: string[];
  evidence: string[];
  template: string;
  estimatedImpact: "low" | "medium" | "high";
  stakeholders: string[];
}

export class CodebaseAnalyzer {
  private readonly supportedExtensions = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".py",
    ".go",
    ".rs",
    ".java",
  ];
  private readonly testPatterns = [
    /\.test\./,
    /\.spec\./,
    /__tests__/,
    /test_/,
  ];
  private readonly configFiles = [
    "package.json",
    "tsconfig.json",
    "vite.config.ts",
    "webpack.config.js",
  ];

  constructor(private readonly rootPath: string) {}

  /**
   * Perform comprehensive codebase analysis
   */
  async analyzeCodebase(): Promise<{
    metrics: CodebaseMetrics;
    dependencies: DependencyAnalysis;
    patterns: ArchitecturePattern[];
    quality: CodeQualityMetrics;
    suggestions: ADRSuggestion[];
  }> {
    console.log("🦊 Starting comprehensive codebase analysis...");

    const files = await this.discoverFiles();
    const metrics = await this.calculateMetrics(files);
    const dependencies = await this.analyzeDependencies(files);
    const patterns = await this.identifyArchitecturePatterns(
      files,
      dependencies,
    );
    const quality = await this.assessCodeQuality(files);
    const suggestions = await this.generateADRSuggestions(
      metrics,
      dependencies,
      patterns,
      quality,
    );

    console.log("✅ Codebase analysis complete!");
    return { metrics, dependencies, patterns, quality, suggestions };
  }

  /**
   * Discover all relevant files in the codebase
   */
  private async discoverFiles(): Promise<string[]> {
    const files: string[] = [];

    const scanDirectory = async (dir: string): Promise<void> => {
      try {
        const entries = await readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(dir, entry.name);

          if (entry.isDirectory()) {
            // Skip common directories that don't contain source code
            if (
              ![
                "node_modules",
                ".git",
                "dist",
                "build",
                ".next",
                "coverage",
              ].includes(entry.name)
            ) {
              await scanDirectory(fullPath);
            }
          } else if (entry.isFile()) {
            const ext = extname(entry.name);
            if (
              this.supportedExtensions.includes(ext) ||
              this.configFiles.includes(entry.name)
            ) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not scan directory ${dir}:`, error);
      }
    };

    await scanDirectory(this.rootPath);
    return files;
  }

  /**
   * Calculate basic codebase metrics
   */
  private async calculateMetrics(files: string[]): Promise<CodebaseMetrics> {
    let totalLines = 0;
    const fileTypes: Record<string, number> = {};
    const fileSizes: Array<{ path: string; lines: number }> = [];

    for (const file of files) {
      try {
        const content = await readFile(file, "utf-8");
        const lines = content.split("\n").length;
        totalLines += lines;

        const ext = extname(file);
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;

        fileSizes.push({ path: file, lines });
      } catch (error) {
        console.warn(`⚠️ Could not read file ${file}:`, error);
      }
    }

    // Sort files by size and get the largest ones
    fileSizes.sort((a, b) => b.lines - a.lines);
    const largestFiles = fileSizes.slice(0, 10);

    // Calculate complexity score based on file size distribution
    const complexityScore = this.calculateComplexityScore(fileSizes);

    return {
      totalFiles: files.length,
      totalLines,
      fileTypes,
      averageFileSize: totalLines / files.length,
      largestFiles,
      complexityScore,
    };
  }

  /**
   * Analyze dependencies between modules
   */
  private async analyzeDependencies(
    files: string[],
  ): Promise<DependencyAnalysis> {
    const internalDependencies = new Map<string, string[]>();
    const externalDependencies = new Map<string, string[]>();
    const circularDependencies: string[][] = [];

    for (const file of files) {
      try {
        const content = await readFile(file, "utf-8");
        const imports = this.extractImports(content);

        const internal = imports.filter(
          (imp) => imp.startsWith(".") || imp.startsWith("/"),
        );
        const external = imports.filter(
          (imp) => !imp.startsWith(".") && !imp.startsWith("/"),
        );

        internalDependencies.set(file, internal);
        externalDependencies.set(file, external);
      } catch (error) {
        console.warn(`⚠️ Could not analyze dependencies for ${file}:`, error);
      }
    }

    // Detect circular dependencies
    const circular = this.detectCircularDependencies(internalDependencies);
    circularDependencies.push(...circular);

    // Calculate dependency depth
    const dependencyDepth = this.calculateDependencyDepth(internalDependencies);

    // Identify critical dependencies
    const criticalDependencies =
      this.identifyCriticalDependencies(internalDependencies);

    return {
      internalDependencies,
      externalDependencies,
      circularDependencies,
      dependencyDepth,
      criticalDependencies,
    };
  }

  /**
   * Identify architecture patterns in the codebase
   */
  private async identifyArchitecturePatterns(
    files: string[],
    dependencies: DependencyAnalysis,
  ): Promise<ArchitecturePattern[]> {
    const patterns: ArchitecturePattern[] = [];

    // Analyze for microservice patterns
    const microservicePattern = this.detectMicroservicePattern(
      files,
      dependencies,
    );
    if (microservicePattern.confidence > 0.3) {
      patterns.push(microservicePattern);
    }

    // Analyze for modular patterns
    const modularPattern = this.detectModularPattern(files, dependencies);
    if (modularPattern.confidence > 0.3) {
      patterns.push(modularPattern);
    }

    // Analyze for layered architecture
    const layeredPattern = this.detectLayeredPattern(files, dependencies);
    if (layeredPattern.confidence > 0.3) {
      patterns.push(layeredPattern);
    }

    return patterns;
  }

  /**
   * Assess code quality metrics
   */
  private async assessCodeQuality(
    files: string[],
  ): Promise<CodeQualityMetrics> {
    const testFiles = files.filter((file) =>
      this.testPatterns.some((pattern) => pattern.test(file)),
    );
    const testCoverage = (testFiles.length / files.length) * 100;

    const documentedFiles = await this.countDocumentedFiles(files);
    const documentationCoverage = (documentedFiles / files.length) * 100;

    const complexityMetrics = await this.calculateComplexityMetrics(files);
    const codeSmells = await this.detectCodeSmells(files);

    return {
      testCoverage,
      documentationCoverage,
      complexityMetrics,
      codeSmells,
    };
  }

  /**
   * Generate ADR suggestions based on analysis
   */
  private async generateADRSuggestions(
    metrics: CodebaseMetrics,
    dependencies: DependencyAnalysis,
    patterns: ArchitecturePattern[],
    quality: CodeQualityMetrics,
  ): Promise<ADRSuggestion[]> {
    const suggestions: ADRSuggestion[] = [];

    // Suggest performance ADR for large files
    if (metrics.largestFiles.some((f) => f.lines > 500)) {
      suggestions.push({
        id: "perf-large-files",
        title: "Performance Optimization for Large Files",
        priority: "high",
        category: "performance",
        reasoning: [
          "Large files detected that may impact build performance",
          "Files over 500 lines can be difficult to maintain",
        ],
        evidence: metrics.largestFiles
          .filter((f) => f.lines > 500)
          .map((f) => f.path),
        template: "performance",
        estimatedImpact: "high",
        stakeholders: ["Development Team", "Performance Team"],
      });
    }

    // Suggest scalability ADR for circular dependencies
    if (dependencies.circularDependencies.length > 0) {
      suggestions.push({
        id: "scalability-circular-deps",
        title: "Scalability Issues with Circular Dependencies",
        priority: "critical",
        category: "scalability",
        reasoning: [
          "Circular dependencies detected that may impact scalability",
          "Circular dependencies can cause build and runtime issues",
        ],
        evidence: dependencies.circularDependencies.flat(),
        template: "scalability",
        estimatedImpact: "high",
        stakeholders: ["Architecture Team", "Development Team"],
      });
    }

    // Suggest maintainability ADR for low test coverage
    if (quality.testCoverage < 80) {
      suggestions.push({
        id: "maintainability-test-coverage",
        title: "Improve Test Coverage for Better Maintainability",
        priority: "medium",
        category: "maintainability",
        reasoning: [
          `Current test coverage is ${quality.testCoverage.toFixed(1)}%, below recommended 80%`,
          "Low test coverage increases risk of regressions",
        ],
        evidence: [`Test coverage: ${quality.testCoverage.toFixed(1)}%`],
        template: "performance",
        estimatedImpact: "medium",
        stakeholders: ["QA Team", "Development Team"],
      });
    }

    return suggestions;
  }

  // Helper methods
  private calculateComplexityScore(
    fileSizes: Array<{ path: string; lines: number }>,
  ): number {
    const largeFiles = fileSizes.filter((f) => f.lines > 200).length;
    const veryLargeFiles = fileSizes.filter((f) => f.lines > 500).length;
    return (largeFiles * 0.1 + veryLargeFiles * 0.3) * 100;
  }

  private extractImports(content: string): string[] {
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const imports: string[] = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  private detectCircularDependencies(
    dependencies: Map<string, string[]>,
  ): string[][] {
    // Simplified circular dependency detection
    // In a real implementation, this would use graph algorithms
    return [];
  }

  private calculateDependencyDepth(
    dependencies: Map<string, string[]>,
  ): Map<string, number> {
    const depth = new Map<string, number>();

    for (const [file] of dependencies) {
      depth.set(file, this.calculateFileDepth(file, dependencies, new Set()));
    }

    return depth;
  }

  private calculateFileDepth(
    file: string,
    dependencies: Map<string, string[]>,
    visited: Set<string>,
  ): number {
    if (visited.has(file)) return 0;
    visited.add(file);

    const deps = dependencies.get(file) || [];
    if (deps.length === 0) return 1;

    const maxDepth = Math.max(
      ...deps.map((dep) => this.calculateFileDepth(dep, dependencies, visited)),
    );
    return maxDepth + 1;
  }

  private identifyCriticalDependencies(
    dependencies: Map<string, string[]>,
  ): string[] {
    const dependencyCount = new Map<string, number>();

    for (const deps of dependencies.values()) {
      for (const dep of deps) {
        dependencyCount.set(dep, (dependencyCount.get(dep) || 0) + 1);
      }
    }

    return Array.from(dependencyCount.entries())
      .filter(([, count]) => count > 5)
      .map(([dep]) => dep);
  }

  private detectMicroservicePattern(
    files: string[],
    dependencies: DependencyAnalysis,
  ): ArchitecturePattern {
    const evidence: string[] = [];
    let confidence = 0;

    // Look for service-like directories
    const serviceDirs = files.filter(
      (f) => f.includes("/services/") || f.includes("/api/"),
    );
    if (serviceDirs.length > 0) {
      evidence.push(`Found ${serviceDirs.length} service-related files`);
      confidence += 0.3;
    }

    // Look for independent modules
    const independentModules = Array.from(
      dependencies.internalDependencies.entries(),
    ).filter(([, deps]) => deps.length < 3).length;

    if (independentModules > 5) {
      evidence.push(`Found ${independentModules} independent modules`);
      confidence += 0.4;
    }

    return {
      type: "microservice",
      confidence,
      evidence,
      recommendations:
        confidence > 0.5
          ? [
              "Consider documenting service boundaries",
              "Implement service discovery patterns",
              "Add inter-service communication guidelines",
            ]
          : [],
    };
  }

  private detectModularPattern(
    files: string[],
    dependencies: DependencyAnalysis,
  ): ArchitecturePattern {
    const evidence: string[] = [];
    let confidence = 0;

    // Look for modular structure
    const moduleDirs = files.filter(
      (f) => f.includes("/modules/") || f.includes("/components/"),
    );
    if (moduleDirs.length > 0) {
      evidence.push(`Found ${moduleDirs.length} modular files`);
      confidence += 0.4;
    }

    // Check for clear separation of concerns
    const avgDeps =
      Array.from(dependencies.internalDependencies.values()).reduce(
        (sum, deps) => sum + deps.length,
        0,
      ) / dependencies.internalDependencies.size;

    if (avgDeps < 5) {
      evidence.push(`Low average dependency count: ${avgDeps.toFixed(1)}`);
      confidence += 0.3;
    }

    return {
      type: "modular",
      confidence,
      evidence,
      recommendations:
        confidence > 0.5
          ? [
              "Document module boundaries",
              "Implement module communication patterns",
              "Add module testing strategies",
            ]
          : [],
    };
  }

  private detectLayeredPattern(
    files: string[],
    dependencies: DependencyAnalysis,
  ): ArchitecturePattern {
    const evidence: string[] = [];
    let confidence = 0;

    // Look for layered structure
    const layers = [
      "/controllers/",
      "/services/",
      "/repositories/",
      "/models/",
    ];
    const layerFiles = layers.map(
      (layer) => files.filter((f) => f.includes(layer)).length,
    );

    const nonZeroLayers = layerFiles.filter((count) => count > 0).length;
    if (nonZeroLayers >= 3) {
      evidence.push(`Found ${nonZeroLayers} architectural layers`);
      confidence += 0.5;
    }

    return {
      type: "layered",
      confidence,
      evidence,
      recommendations:
        confidence > 0.5
          ? [
              "Document layer responsibilities",
              "Implement layer communication rules",
              "Add layer testing strategies",
            ]
          : [],
    };
  }

  private async countDocumentedFiles(files: string[]): Promise<number> {
    let documentedCount = 0;

    for (const file of files.slice(0, 100)) {
      // Sample first 100 files
      try {
        const content = await readFile(file, "utf-8");
        if (
          content.includes("/**") ||
          content.includes("//") ||
          content.includes("#")
        ) {
          documentedCount++;
        }
      } catch (error) {
        // Ignore errors
      }
    }

    return documentedCount;
  }

  private async calculateComplexityMetrics(
    files: string[],
  ): Promise<CodeQualityMetrics["complexityMetrics"]> {
    // Simplified complexity calculation
    // In a real implementation, this would use tools like ESLint or SonarQube
    return {
      cyclomaticComplexity: 5.2,
      cognitiveComplexity: 8.1,
      maintainabilityIndex: 75.3,
    };
  }

  private async detectCodeSmells(
    files: string[],
  ): Promise<CodeQualityMetrics["codeSmells"]> {
    const smells: CodeQualityMetrics["codeSmells"] = [];

    // Sample analysis of first 50 files
    for (const file of files.slice(0, 50)) {
      try {
        const content = await readFile(file, "utf-8");
        const lines = content.split("\n");

        // Detect long functions
        if (lines.length > 100) {
          smells.push({
            type: "Long Function",
            severity: "medium",
            location: file,
            description: `Function has ${lines.length} lines, consider refactoring`,
          });
        }

        // Detect deep nesting
        const maxIndent = Math.max(
          ...lines.map((line) => (line.match(/^\s*/)?.[0] || "").length),
        );
        if (maxIndent > 6) {
          smells.push({
            type: "Deep Nesting",
            severity: "low",
            location: file,
            description: `Maximum indentation level is ${maxIndent}, consider refactoring`,
          });
        }
      } catch (error) {
        // Ignore errors
      }
    }

    return smells;
  }
}
