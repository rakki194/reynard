/**
 * Performance Pattern Detector - Advanced Performance Analysis and Anti-Pattern Detection
 *
 * This module provides comprehensive detection of performance patterns and anti-patterns,
 * identifying optimization opportunities and performance bottlenecks.
 */

import { readFile, readdir, stat } from "fs/promises";
import { join, dirname, basename } from "path";

export interface PerformanceIssue {
  id: string;
  type:
    | "synchronous-io"
    | "memory-leak"
    | "inefficient-loop"
    | "blocking-operation"
    | "large-object"
    | "unnecessary-computation"
    | "inefficient-algorithm"
    | "resource-exhaustion";
  severity: "low" | "medium" | "high" | "critical";
  filePath: string;
  lineNumber: number;
  description: string;
  codeSnippet: string;
  impact: {
    performance: number; // 0-1, impact on performance
    memory: number; // 0-1, impact on memory usage
    scalability: number; // 0-1, impact on scalability
    userExperience: number; // 0-1, impact on user experience
  };
  suggestion: string;
  examples: string[];
  estimatedImprovement: string;
}

export interface PerformancePattern {
  name: string;
  type: "anti-pattern" | "optimization" | "best-practice";
  description: string;
  detection: {
    patterns: string[];
    conditions: string[];
  };
  impact: {
    performance: number;
    memory: number;
    maintainability: number;
  };
  remediation: {
    description: string;
    examples: string[];
    effort: "low" | "medium" | "high";
  };
}

export interface PerformanceReport {
  overallPerformance: number; // 0-100
  totalIssues: number;
  criticalIssues: number;
  issuesByType: Record<string, number>;
  issuesBySeverity: Record<string, number>;
  performanceScore: {
    overall: number;
    memory: number;
    cpu: number;
    io: number;
    scalability: number;
  };
  topIssues: PerformanceIssue[];
  detectedPatterns: {
    antiPatterns: PerformancePattern[];
    optimizations: PerformancePattern[];
    bestPractices: PerformancePattern[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  metrics: {
    averageFileSize: number;
    averageComplexity: number;
    synchronousOperations: number;
    asyncOperations: number;
    memoryIntensiveOperations: number;
  };
}

export class PerformancePatternDetector {
  private readonly codebasePath: string;
  private readonly issueCache: Map<string, PerformanceIssue[]> = new Map();
  private readonly patterns: PerformancePattern[] = [];

  constructor(codebasePath: string) {
    this.codebasePath = codebasePath;
    this.initializePerformancePatterns();
  }

  /**
   * Perform comprehensive performance pattern analysis
   */
  async analyzePerformancePatterns(): Promise<PerformanceReport> {
    console.log("🐺 Starting performance pattern analysis...");

    const files = await this.discoverFiles();
    const issues: PerformanceIssue[] = [];
    const detectedPatterns = {
      antiPatterns: [] as PerformancePattern[],
      optimizations: [] as PerformancePattern[],
      bestPractices: [] as PerformancePattern[],
    };

    // Analyze each file
    for (const file of files) {
      const fileIssues = await this.analyzeFilePerformance(file);
      issues.push(...fileIssues);
      this.issueCache.set(file, fileIssues);
    }

    // Detect patterns across the codebase
    const patterns = this.detectPatterns(issues);
    detectedPatterns.antiPatterns = patterns.filter(p => p.type === "anti-pattern");
    detectedPatterns.optimizations = patterns.filter(p => p.type === "optimization");
    detectedPatterns.bestPractices = patterns.filter(p => p.type === "best-practice");

    // Generate comprehensive report
    const report = this.generatePerformanceReport(files, issues, detectedPatterns);

    console.log(`✅ Performance pattern analysis complete: ${report.overallPerformance.toFixed(1)}% performance score`);
    return report;
  }

  /**
   * Analyze performance issues for a specific file
   */
  async analyzeFilePerformance(filePath: string): Promise<PerformanceIssue[]> {
    try {
      const content = await readFile(filePath, "utf-8");
      const issues: PerformanceIssue[] = [];

      // Detect synchronous I/O operations
      const syncIOIssues = this.detectSynchronousIO(content, filePath);
      issues.push(...syncIOIssues);

      // Detect memory leaks
      const memoryLeakIssues = this.detectMemoryLeaks(content, filePath);
      issues.push(...memoryLeakIssues);

      // Detect inefficient loops
      const loopIssues = this.detectInefficientLoops(content, filePath);
      issues.push(...loopIssues);

      // Detect blocking operations
      const blockingIssues = this.detectBlockingOperations(content, filePath);
      issues.push(...blockingIssues);

      // Detect large objects
      const largeObjectIssues = this.detectLargeObjects(content, filePath);
      issues.push(...largeObjectIssues);

      // Detect unnecessary computation
      const computationIssues = this.detectUnnecessaryComputation(content, filePath);
      issues.push(...computationIssues);

      // Detect inefficient algorithms
      const algorithmIssues = this.detectInefficientAlgorithms(content, filePath);
      issues.push(...algorithmIssues);

      // Detect resource exhaustion
      const resourceIssues = this.detectResourceExhaustion(content, filePath);
      issues.push(...resourceIssues);

      return issues;
    } catch (error) {
      console.warn(`Failed to analyze performance for ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Get performance issues for a specific file
   */
  getFilePerformanceIssues(filePath: string): PerformanceIssue[] {
    return this.issueCache.get(filePath) || [];
  }

  /**
   * Get performance score for a specific file
   */
  getFilePerformanceScore(filePath: string): number {
    const issues = this.getFilePerformanceIssues(filePath);
    if (issues.length === 0) return 100;

    let penalty = 0;
    for (const issue of issues) {
      switch (issue.severity) {
        case "critical":
          penalty += 25;
          break;
        case "high":
          penalty += 15;
          break;
        case "medium":
          penalty += 8;
          break;
        case "low":
          penalty += 3;
          break;
      }
    }

    return Math.max(0, 100 - penalty);
  }

  /**
   * Check if a file has good performance
   */
  isFilePerformant(filePath: string): boolean {
    const score = this.getFilePerformanceScore(filePath);
    return score >= 80;
  }

  /**
   * Get files with critical performance issues
   */
  getCriticalPerformanceFiles(): Array<{
    filePath: string;
    issues: PerformanceIssue[];
  }> {
    const criticalFiles: Array<{
      filePath: string;
      issues: PerformanceIssue[];
    }> = [];

    for (const [filePath, issues] of this.issueCache) {
      const criticalIssues = issues.filter(issue => issue.severity === "critical");
      if (criticalIssues.length > 0) {
        criticalFiles.push({ filePath, issues: criticalIssues });
      }
    }

    return criticalFiles.sort((a, b) => b.issues.length - a.issues.length);
  }

  /**
   * Generate performance optimization suggestions
   */
  generatePerformanceSuggestions(filePath: string): string[] {
    const issues = this.getFilePerformanceIssues(filePath);
    const suggestions: string[] = [];

    if (issues.length === 0) {
      suggestions.push("✅ File has good performance characteristics");
      return suggestions;
    }

    const issueTypes = new Set(issues.map(issue => issue.type));

    if (issueTypes.has("synchronous-io")) {
      suggestions.push("⚡ Replace synchronous I/O with asynchronous operations");
    }

    if (issueTypes.has("memory-leak")) {
      suggestions.push("🧠 Fix potential memory leaks");
    }

    if (issueTypes.has("inefficient-loop")) {
      suggestions.push("🔄 Optimize loop performance");
    }

    if (issueTypes.has("blocking-operation")) {
      suggestions.push("🚫 Remove blocking operations");
    }

    if (issueTypes.has("large-object")) {
      suggestions.push("📦 Optimize large object usage");
    }

    if (issueTypes.has("unnecessary-computation")) {
      suggestions.push("💡 Eliminate unnecessary computations");
    }

    if (issueTypes.has("inefficient-algorithm")) {
      suggestions.push("🎯 Use more efficient algorithms");
    }

    if (issueTypes.has("resource-exhaustion")) {
      suggestions.push("⚠️ Prevent resource exhaustion");
    }

    return suggestions;
  }

  // Private methods
  private async discoverFiles(): Promise<string[]> {
    const files: string[] = [];

    const scanDirectory = async (dir: string): Promise<void> => {
      try {
        const entries = await readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(dir, entry.name);

          if (entry.isDirectory()) {
            if (!["node_modules", ".git", "dist", "build", "coverage"].includes(entry.name)) {
              await scanDirectory(fullPath);
            }
          } else if (entry.isFile()) {
            const ext = fullPath.split(".").pop();
            if (["ts", "tsx", "js", "jsx", "py", "go", "rs", "java"].includes(ext || "")) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`Could not scan directory ${dir}:`, error);
      }
    };

    await scanDirectory(this.codebasePath);
    return files;
  }

  private detectSynchronousIO(content: string, filePath: string): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];
    const lines = content.split("\n");

    const syncIOPatterns = [
      "readFileSync",
      "writeFileSync",
      "readdirSync",
      "statSync",
      "existsSync",
      "mkdirSync",
      "rmdirSync",
      "unlinkSync",
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const pattern of syncIOPatterns) {
        if (line.includes(pattern)) {
          issues.push({
            id: this.generateIssueId(),
            type: "synchronous-io",
            severity: "high",
            filePath,
            lineNumber: i + 1,
            description: `Synchronous I/O operation detected: ${pattern}`,
            codeSnippet: line.trim(),
            impact: {
              performance: 0.8,
              memory: 0.3,
              scalability: 0.9,
              userExperience: 0.7,
            },
            suggestion: `Replace ${pattern} with asynchronous equivalent`,
            examples: [
              `// Instead of: ${pattern}('file.txt')`,
              `// Use: await ${pattern.replace("Sync", "")}('file.txt')`,
            ],
            estimatedImprovement: "Significant performance improvement, especially under load",
          });
        }
      }
    }

    return issues;
  }

  private detectMemoryLeaks(content: string, filePath: string): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];
    const lines = content.split("\n");

    const memoryLeakPatterns = [
      { pattern: "setInterval", description: "setInterval without cleanup" },
      { pattern: "setTimeout", description: "setTimeout without cleanup" },
      {
        pattern: "addEventListener",
        description: "Event listener without removal",
      },
      { pattern: "new Array(1000000)", description: "Large array allocation" },
      {
        pattern: "JSON.parse",
        description: "Large JSON parsing without size limits",
      },
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const { pattern, description } of memoryLeakPatterns) {
        if (line.includes(pattern)) {
          issues.push({
            id: this.generateIssueId(),
            type: "memory-leak",
            severity: this.getMemoryLeakSeverity(pattern),
            filePath,
            lineNumber: i + 1,
            description,
            codeSnippet: line.trim(),
            impact: {
              performance: 0.6,
              memory: 0.9,
              scalability: 0.8,
              userExperience: 0.5,
            },
            suggestion: "Implement proper cleanup and memory management",
            examples: [
              "// Store timer ID and clear it when done",
              "// Remove event listeners in cleanup",
              "// Limit array sizes and use streaming for large data",
            ],
            estimatedImprovement: "Prevents memory leaks and improves long-term stability",
          });
        }
      }
    }

    return issues;
  }

  private detectInefficientLoops(content: string, filePath: string): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Nested loops
      if (line.includes("for") && this.hasNestedLoop(content, i)) {
        issues.push({
          id: this.generateIssueId(),
          type: "inefficient-loop",
          severity: "medium",
          filePath,
          lineNumber: i + 1,
          description: "Nested loop detected - potential O(n²) complexity",
          codeSnippet: line.trim(),
          impact: {
            performance: 0.7,
            memory: 0.4,
            scalability: 0.8,
            userExperience: 0.6,
          },
          suggestion: "Consider using more efficient algorithms or data structures",
          examples: [
            "// Use Map or Set for O(1) lookups",
            "// Consider using array methods like filter, map, reduce",
            "// Use database queries instead of nested loops when possible",
          ],
          estimatedImprovement: "Significant performance improvement for large datasets",
        });
      }

      // Array operations in loops
      if (line.includes("for") && this.hasArrayOperationsInLoop(content, i)) {
        issues.push({
          id: this.generateIssueId(),
          type: "inefficient-loop",
          severity: "medium",
          filePath,
          lineNumber: i + 1,
          description: "Array operations inside loop - potential performance issue",
          codeSnippet: line.trim(),
          impact: {
            performance: 0.6,
            memory: 0.5,
            scalability: 0.7,
            userExperience: 0.5,
          },
          suggestion: "Move array operations outside the loop or use more efficient methods",
          examples: [
            "// Instead of: for (let i = 0; i < arr.length; i++)",
            "// Use: arr.forEach() or for...of loop",
            "// Or: const length = arr.length; for (let i = 0; i < length; i++)",
          ],
          estimatedImprovement: "Moderate performance improvement",
        });
      }
    }

    return issues;
  }

  private detectBlockingOperations(content: string, filePath: string): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];
    const lines = content.split("\n");

    const blockingPatterns = ["while(true)", "for(;;)", "sleep(", "wait(", "Thread.sleep", "time.sleep"];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const pattern of blockingPatterns) {
        if (line.includes(pattern)) {
          issues.push({
            id: this.generateIssueId(),
            type: "blocking-operation",
            severity: "critical",
            filePath,
            lineNumber: i + 1,
            description: `Blocking operation detected: ${pattern}`,
            codeSnippet: line.trim(),
            impact: {
              performance: 0.9,
              memory: 0.3,
              scalability: 0.9,
              userExperience: 0.9,
            },
            suggestion: "Replace blocking operations with non-blocking alternatives",
            examples: [
              "// Use async/await instead of blocking",
              "// Use event-driven programming",
              "// Use worker threads for CPU-intensive tasks",
            ],
            estimatedImprovement: "Critical performance improvement - prevents blocking",
          });
        }
      }
    }

    return issues;
  }

  private detectLargeObjects(content: string, filePath: string): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Large object literals
      if (line.includes("{") && this.isLargeObjectLiteral(content, i)) {
        issues.push({
          id: this.generateIssueId(),
          type: "large-object",
          severity: "medium",
          filePath,
          lineNumber: i + 1,
          description: "Large object literal detected",
          codeSnippet: line.trim(),
          impact: {
            performance: 0.5,
            memory: 0.7,
            scalability: 0.6,
            userExperience: 0.4,
          },
          suggestion: "Consider breaking large objects into smaller, focused objects",
          examples: [
            "// Split into multiple smaller objects",
            "// Use object composition",
            "// Consider using classes or interfaces",
          ],
          estimatedImprovement: "Improved memory usage and maintainability",
        });
      }

      // Large arrays
      if (line.includes("[") && this.isLargeArray(content, i)) {
        issues.push({
          id: this.generateIssueId(),
          type: "large-object",
          severity: "medium",
          filePath,
          lineNumber: i + 1,
          description: "Large array detected",
          codeSnippet: line.trim(),
          impact: {
            performance: 0.6,
            memory: 0.8,
            scalability: 0.7,
            userExperience: 0.5,
          },
          suggestion: "Consider using streaming or pagination for large datasets",
          examples: [
            "// Use streaming for large data",
            "// Implement pagination",
            "// Use database queries instead of in-memory arrays",
          ],
          estimatedImprovement: "Significant memory and performance improvement",
        });
      }
    }

    return issues;
  }

  private detectUnnecessaryComputation(content: string, filePath: string): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Repeated calculations
      if (this.hasRepeatedCalculations(content, i)) {
        issues.push({
          id: this.generateIssueId(),
          type: "unnecessary-computation",
          severity: "low",
          filePath,
          lineNumber: i + 1,
          description: "Repeated calculation detected",
          codeSnippet: line.trim(),
          impact: {
            performance: 0.4,
            memory: 0.2,
            scalability: 0.3,
            userExperience: 0.3,
          },
          suggestion: "Cache repeated calculations or move them outside loops",
          examples: [
            "// Cache the result: const result = expensiveCalculation()",
            "// Move outside loop: const length = arr.length; for (let i = 0; i < length; i++)",
          ],
          estimatedImprovement: "Minor performance improvement",
        });
      }

      // Unnecessary string operations
      if (this.hasUnnecessaryStringOperations(line)) {
        issues.push({
          id: this.generateIssueId(),
          type: "unnecessary-computation",
          severity: "low",
          filePath,
          lineNumber: i + 1,
          description: "Unnecessary string operation detected",
          codeSnippet: line.trim(),
          impact: {
            performance: 0.3,
            memory: 0.4,
            scalability: 0.2,
            userExperience: 0.2,
          },
          suggestion: "Optimize string operations or use more efficient methods",
          examples: [
            "// Use template literals instead of concatenation",
            "// Use array.join() for multiple concatenations",
            "// Avoid unnecessary string conversions",
          ],
          estimatedImprovement: "Minor performance improvement",
        });
      }
    }

    return issues;
  }

  private detectInefficientAlgorithms(content: string, filePath: string): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // O(n²) algorithms
      if (this.hasQuadraticAlgorithm(content, i)) {
        issues.push({
          id: this.generateIssueId(),
          type: "inefficient-algorithm",
          severity: "high",
          filePath,
          lineNumber: i + 1,
          description: "Inefficient O(n²) algorithm detected",
          codeSnippet: line.trim(),
          impact: {
            performance: 0.8,
            memory: 0.5,
            scalability: 0.9,
            userExperience: 0.7,
          },
          suggestion: "Use more efficient algorithms or data structures",
          examples: [
            "// Use Set or Map for O(1) lookups",
            "// Use sorting algorithms like quicksort or mergesort",
            "// Consider using database indexes for large datasets",
          ],
          estimatedImprovement: "Significant performance improvement for large datasets",
        });
      }
    }

    return issues;
  }

  private detectResourceExhaustion(content: string, filePath: string): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Unlimited recursion
      if (this.hasUnlimitedRecursion(content, i)) {
        issues.push({
          id: this.generateIssueId(),
          type: "resource-exhaustion",
          severity: "critical",
          filePath,
          lineNumber: i + 1,
          description: "Potential unlimited recursion detected",
          codeSnippet: line.trim(),
          impact: {
            performance: 0.9,
            memory: 0.9,
            scalability: 0.9,
            userExperience: 0.9,
          },
          suggestion: "Add proper base cases and recursion limits",
          examples: [
            "// Add base case: if (n <= 1) return 1;",
            '// Add recursion limit: if (depth > MAX_DEPTH) throw new Error("Max depth exceeded");',
            "// Consider iterative solutions for deep recursion",
          ],
          estimatedImprovement: "Prevents stack overflow and system crashes",
        });
      }

      // File handle leaks
      if (this.hasFileHandleLeak(content, i)) {
        issues.push({
          id: this.generateIssueId(),
          type: "resource-exhaustion",
          severity: "high",
          filePath,
          lineNumber: i + 1,
          description: "Potential file handle leak detected",
          codeSnippet: line.trim(),
          impact: {
            performance: 0.6,
            memory: 0.7,
            scalability: 0.8,
            userExperience: 0.6,
          },
          suggestion: "Ensure proper file handle cleanup",
          examples: [
            "// Use try-finally blocks",
            "// Use async/await with proper error handling",
            "// Consider using streams for large files",
          ],
          estimatedImprovement: "Prevents resource exhaustion and improves stability",
        });
      }
    }

    return issues;
  }

  private detectPatterns(issues: PerformanceIssue[]): PerformancePattern[] {
    const patterns: PerformancePattern[] = [];

    // Analyze issue patterns to detect common anti-patterns
    const issueTypes = new Set(issues.map(issue => issue.type));

    if (issueTypes.has("synchronous-io")) {
      patterns.push({
        name: "Synchronous I/O Anti-Pattern",
        type: "anti-pattern",
        description: "Using synchronous I/O operations that block the event loop",
        detection: {
          patterns: ["readFileSync", "writeFileSync", "readdirSync"],
          conditions: ["Blocking operations in async context"],
        },
        impact: {
          performance: 0.8,
          memory: 0.3,
          maintainability: 0.4,
        },
        remediation: {
          description: "Replace with asynchronous I/O operations",
          examples: ["Use fs.promises or async/await", "Implement proper error handling"],
          effort: "medium",
        },
      });
    }

    if (issueTypes.has("memory-leak")) {
      patterns.push({
        name: "Memory Leak Pattern",
        type: "anti-pattern",
        description: "Potential memory leaks from unmanaged resources",
        detection: {
          patterns: ["setInterval", "addEventListener", "large arrays"],
          conditions: ["Missing cleanup", "Unbounded growth"],
        },
        impact: {
          performance: 0.6,
          memory: 0.9,
          maintainability: 0.5,
        },
        remediation: {
          description: "Implement proper resource cleanup and memory management",
          examples: ["Clear timers and intervals", "Remove event listeners", "Limit data structures"],
          effort: "high",
        },
      });
    }

    return patterns;
  }

  private generatePerformanceReport(
    files: string[],
    issues: PerformanceIssue[],
    detectedPatterns: {
      antiPatterns: PerformancePattern[];
      optimizations: PerformancePattern[];
      bestPractices: PerformancePattern[];
    }
  ): PerformanceReport {
    const totalIssues = issues.length;
    const criticalIssues = issues.filter(issue => issue.severity === "critical").length;
    const overallPerformance = files.reduce((sum, file) => sum + this.getFilePerformanceScore(file), 0) / files.length;

    // Group issues by type and severity
    const issuesByType: Record<string, number> = {};
    const issuesBySeverity: Record<string, number> = {};

    for (const issue of issues) {
      issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
      issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1;
    }

    // Calculate performance scores by category
    const performanceScore = {
      overall: overallPerformance,
      memory: this.calculateMemoryScore(issues),
      cpu: this.calculateCPUScore(issues),
      io: this.calculateIOScore(issues),
      scalability: this.calculateScalabilityScore(issues),
    };

    // Get top issues
    const topIssues = issues
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .slice(0, 10);

    // Generate recommendations
    const recommendations = this.generateGlobalRecommendations(issues, detectedPatterns);

    // Calculate metrics
    const metrics = this.calculateMetrics(files, issues);

    return {
      overallPerformance,
      totalIssues,
      criticalIssues,
      issuesByType,
      issuesBySeverity,
      performanceScore,
      topIssues,
      detectedPatterns,
      recommendations,
      metrics,
    };
  }

  private generateGlobalRecommendations(
    issues: PerformanceIssue[],
    detectedPatterns: {
      antiPatterns: PerformancePattern[];
      optimizations: PerformancePattern[];
      bestPractices: PerformancePattern[];
    }
  ): PerformanceReport["recommendations"] {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];

    const criticalIssues = issues.filter(issue => issue.severity === "critical");
    const highIssues = issues.filter(issue => issue.severity === "high");
    const issueTypes = new Set(issues.map(issue => issue.type));

    if (criticalIssues.length > 0) {
      immediate.push(`🚨 Address ${criticalIssues.length} critical performance issues`);
    }

    if (highIssues.length > 0) {
      immediate.push(`⚠️ Fix ${highIssues.length} high-severity performance issues`);
    }

    if (issueTypes.has("synchronous-io")) {
      immediate.push("⚡ Replace all synchronous I/O operations");
    }

    if (issueTypes.has("blocking-operation")) {
      immediate.push("🚫 Remove all blocking operations");
    }

    if (issueTypes.has("memory-leak")) {
      shortTerm.push("🧠 Implement proper memory management");
    }

    if (issueTypes.has("inefficient-loop")) {
      shortTerm.push("🔄 Optimize loop performance");
    }

    if (issueTypes.has("inefficient-algorithm")) {
      shortTerm.push("🎯 Use more efficient algorithms");
    }

    shortTerm.push("📊 Implement performance monitoring");
    shortTerm.push("🔍 Add performance testing to CI/CD");

    longTerm.push("🏗️ Establish performance architecture guidelines");
    longTerm.push("📈 Create performance dashboards");
    longTerm.push("🎓 Conduct performance optimization training");
    longTerm.push("🔄 Implement automated performance optimization");

    return { immediate, shortTerm, longTerm };
  }

  private calculateMemoryScore(issues: PerformanceIssue[]): number {
    const memoryIssues = issues.filter(issue => issue.impact.memory > 0.5);
    return Math.max(0, 100 - memoryIssues.length * 10);
  }

  private calculateCPUScore(issues: PerformanceIssue[]): number {
    const cpuIssues = issues.filter(issue => issue.impact.performance > 0.5);
    return Math.max(0, 100 - cpuIssues.length * 8);
  }

  private calculateIOScore(issues: PerformanceIssue[]): number {
    const ioIssues = issues.filter(issue => issue.type === "synchronous-io" || issue.type === "blocking-operation");
    return Math.max(0, 100 - ioIssues.length * 15);
  }

  private calculateScalabilityScore(issues: PerformanceIssue[]): number {
    const scalabilityIssues = issues.filter(issue => issue.impact.scalability > 0.5);
    return Math.max(0, 100 - scalabilityIssues.length * 12);
  }

  private calculateMetrics(files: string[], issues: PerformanceIssue[]): PerformanceReport["metrics"] {
    const synchronousOperations = issues.filter(issue => issue.type === "synchronous-io").length;
    const asyncOperations = issues.filter(issue => issue.type === "blocking-operation").length;
    const memoryIntensiveOperations = issues.filter(issue => issue.impact.memory > 0.7).length;

    return {
      averageFileSize: 0, // Would calculate from actual file sizes
      averageComplexity: 0, // Would calculate from actual complexity
      synchronousOperations,
      asyncOperations,
      memoryIntensiveOperations,
    };
  }

  private initializePerformancePatterns(): void {
    // Initialize common performance patterns
    this.patterns.push({
      name: "Async/Await Pattern",
      type: "best-practice",
      description: "Using async/await for non-blocking operations",
      detection: {
        patterns: ["async", "await", "Promise"],
        conditions: ["Non-blocking operations"],
      },
      impact: {
        performance: 0.8,
        memory: 0.6,
        maintainability: 0.7,
      },
      remediation: {
        description: "Continue using async/await patterns",
        examples: ["Maintain current async patterns", "Add proper error handling"],
        effort: "low",
      },
    });
  }

  // Helper methods for pattern detection
  private hasNestedLoop(content: string, lineIndex: number): boolean {
    const lines = content.split("\n");
    let braceCount = 0;
    let foundLoop = false;

    for (let i = lineIndex; i < Math.min(lineIndex + 10, lines.length); i++) {
      const line = lines[i];
      if (line.includes("for") || line.includes("while")) {
        if (foundLoop) return true;
        foundLoop = true;
      }
    }

    return false;
  }

  private hasArrayOperationsInLoop(content: string, lineIndex: number): boolean {
    const lines = content.split("\n");
    const line = lines[lineIndex];

    return (
      line.includes("arr.length") || line.includes("array.length") || line.includes(".push(") || line.includes(".pop(")
    );
  }

  private isLargeObjectLiteral(content: string, lineIndex: number): boolean {
    const lines = content.split("\n");
    let braceCount = 0;
    let propertyCount = 0;

    for (let i = lineIndex; i < lines.length; i++) {
      const line = lines[i];
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;

      if (line.includes(":")) propertyCount++;

      if (braceCount === 0) break;
    }

    return propertyCount > 10;
  }

  private isLargeArray(content: string, lineIndex: number): boolean {
    const lines = content.split("\n");
    const line = lines[lineIndex];

    return line.includes("[") && (line.includes("1000") || line.includes("10000") || line.includes("100000"));
  }

  private hasRepeatedCalculations(content: string, lineIndex: number): boolean {
    const lines = content.split("\n");
    const line = lines[lineIndex];

    // Simple check for repeated calculations
    return line.includes("Math.") && line.includes("for");
  }

  private hasUnnecessaryStringOperations(line: string): boolean {
    return line.includes("+") && line.includes('"') && line.includes('"');
  }

  private hasQuadraticAlgorithm(content: string, lineIndex: number): boolean {
    const lines = content.split("\n");
    const line = lines[lineIndex];

    // Simple check for nested loops
    return line.includes("for") && this.hasNestedLoop(content, lineIndex);
  }

  private hasUnlimitedRecursion(content: string, lineIndex: number): boolean {
    const lines = content.split("\n");
    const line = lines[lineIndex];

    return line.includes("function") && line.includes("return") && !line.includes("if");
  }

  private hasFileHandleLeak(content: string, lineIndex: number): boolean {
    const lines = content.split("\n");
    const line = lines[lineIndex];

    return line.includes("fs.") && !line.includes("close") && !line.includes("finally");
  }

  private getMemoryLeakSeverity(pattern: string): "low" | "medium" | "high" | "critical" {
    if (pattern === "setInterval") return "high";
    if (pattern === "addEventListener") return "medium";
    if (pattern === "new Array(1000000)") return "critical";
    return "low";
  }

  private generateIssueId(): string {
    return `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
