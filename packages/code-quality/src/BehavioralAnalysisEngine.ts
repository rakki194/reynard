/**
 * 🦊 Behavioral Analysis Engine
 *
 * *red fur gleams with intelligence* Analyzes git history and code evolution patterns
 * to identify hotspots, technical debt accumulation, and behavioral insights.
 * Leverages Reynard's existing git tools and ADR system.
 */

import { exec } from "child_process";
import { EventEmitter } from "events";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface CodeHotspot {
  file: string;
  complexity: number;
  changeFrequency: number;
  lastModified: Date;
  contributors: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  technicalDebt: number;
  recommendations: string[];
}

export interface BehavioralInsight {
  type: "hotspot" | "debt" | "pattern" | "trend";
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  description: string;
  evidence: string[];
  recommendations: string[];
  confidence: number;
  affectedFiles: string[];
}

export interface GitCommit {
  hash: string;
  author: string;
  date: Date;
  message: string;
  files: string[];
  linesAdded: number;
  linesDeleted: number;
}

export interface BehavioralAnalysisResult {
  hotspots: CodeHotspot[];
  insights: BehavioralInsight[];
  trends: {
    commitFrequency: number;
    averageCommitSize: number;
    topContributors: Array<{ name: string; commits: number; lines: number }>;
    fileStability: Array<{ file: string; stability: number; changes: number }>;
  };
  technicalDebt: {
    total: number;
    byFile: Array<{ file: string; debt: number; reasons: string[] }>;
    byType: Array<{ type: string; debt: number; count: number }>;
  };
  analysisDate: Date;
  timeRange: { from: Date; to: Date };
}

/**
 * 🦊 Behavioral Analysis Engine
 *
 * *whiskers twitch with anticipation* Analyzes code evolution patterns
 * to identify hotspots and technical debt accumulation.
 */
export class BehavioralAnalysisEngine extends EventEmitter {
  private readonly projectRoot: string;
  private readonly gitHistoryLimit: number;

  constructor(projectRoot: string, gitHistoryLimit: number = 100) {
    super();
    this.projectRoot = projectRoot;
    this.gitHistoryLimit = gitHistoryLimit;
  }

  /**
   * 🦊 Run comprehensive behavioral analysis
   */
  async analyzeBehavior(timeRange?: { from: Date; to: Date }): Promise<BehavioralAnalysisResult> {
    try {
      console.log("🦊 Starting behavioral analysis...");

      // Get git history
      const commits = await this.getGitHistory(timeRange);

      // Analyze hotspots
      const hotspots = await this.analyzeHotspots(commits);

      // Generate insights
      const insights = await this.generateInsights(hotspots, commits);

      // Calculate trends
      const trends = this.calculateTrends(commits);

      // Assess technical debt
      const technicalDebt = this.assessTechnicalDebt(hotspots, commits);

      const result: BehavioralAnalysisResult = {
        hotspots,
        insights,
        trends,
        technicalDebt,
        analysisDate: new Date(),
        timeRange: timeRange || { from: new Date(0), to: new Date() },
      };

      this.emit("analysisComplete", result);
      return result;
    } catch (error) {
      this.emit("analysisError", error);
      throw error;
    }
  }

  /**
   * 🦊 Get git history
   */
  private async getGitHistory(timeRange?: { from: Date; to: Date }): Promise<GitCommit[]> {
    try {
      let gitCommand = `git log --oneline --pretty=format:"%H|%an|%ad|%s" --date=iso --numstat`;

      if (timeRange) {
        gitCommand += ` --since="${timeRange.from.toISOString()}" --until="${timeRange.to.toISOString()}"`;
      }

      gitCommand += ` -n ${this.gitHistoryLimit}`;

      const { stdout } = await execAsync(gitCommand, { cwd: this.projectRoot });
      return this.parseGitLog(stdout);
    } catch (error) {
      console.error("Error getting git history:", error);
      return [];
    }
  }

  /**
   * 🦊 Parse git log output
   */
  private parseGitLog(logOutput: string): GitCommit[] {
    const commits: GitCommit[] = [];
    const lines = logOutput.trim().split("\n");

    let currentCommit: Partial<GitCommit> | null = null;

    for (const line of lines) {
      if (line.includes("|")) {
        // Commit header line
        if (currentCommit) {
          commits.push(currentCommit as GitCommit);
        }

        const [hash, author, date, ...messageParts] = line.split("|");
        currentCommit = {
          hash: hash.trim(),
          author: author.trim(),
          date: new Date(date.trim()),
          message: messageParts.join("|").trim(),
          files: [],
          linesAdded: 0,
          linesDeleted: 0,
        };
      } else if (currentCommit && line.trim()) {
        // File change line
        const parts = line.trim().split("\t");
        if (
          parts.length >= 3 &&
          currentCommit &&
          currentCommit.files &&
          currentCommit.linesAdded !== undefined &&
          currentCommit.linesDeleted !== undefined
        ) {
          const [added, deleted, file] = parts;
          currentCommit.files.push(file);
          currentCommit.linesAdded += parseInt(added) || 0;
          currentCommit.linesDeleted += parseInt(deleted) || 0;
        }
      }
    }

    if (currentCommit) {
      commits.push(currentCommit as GitCommit);
    }

    return commits;
  }

  /**
   * 🦊 Analyze code hotspots
   */
  private async analyzeHotspots(commits: GitCommit[]): Promise<CodeHotspot[]> {
    const fileStats = new Map<
      string,
      {
        changes: number;
        contributors: Set<string>;
        lastModified: Date;
        totalLines: number;
      }
    >();

    // Aggregate file statistics
    for (const commit of commits) {
      for (const file of commit.files) {
        if (!fileStats.has(file)) {
          fileStats.set(file, {
            changes: 0,
            contributors: new Set(),
            lastModified: commit.date,
            totalLines: 0,
          });
        }

        const stats = fileStats.get(file)!;
        stats.changes++;
        stats.contributors.add(commit.author);
        stats.lastModified = new Date(Math.max(stats.lastModified.getTime(), commit.date.getTime()));
        stats.totalLines += commit.linesAdded - commit.linesDeleted;
      }
    }

    // Convert to hotspots
    const hotspots: CodeHotspot[] = [];

    for (const [file, stats] of fileStats) {
      const changeFrequency = stats.changes / commits.length;
      const complexity = this.calculateFileComplexity(file, stats.totalLines);
      const riskLevel = this.calculateRiskLevel(changeFrequency, complexity, stats.contributors.size);
      const technicalDebt = this.calculateTechnicalDebt(changeFrequency, complexity);

      hotspots.push({
        file,
        complexity,
        changeFrequency,
        lastModified: stats.lastModified,
        contributors: Array.from(stats.contributors),
        riskLevel,
        technicalDebt,
        recommendations: this.generateHotspotRecommendations(changeFrequency, complexity, riskLevel),
      });
    }

    return hotspots.sort((a, b) => b.technicalDebt - a.technicalDebt);
  }

  /**
   * 🦊 Calculate file complexity
   */
  private calculateFileComplexity(file: string, lines: number): number {
    // Simple complexity calculation based on file type and size
    const extension = file.split(".").pop()?.toLowerCase();
    let baseComplexity = lines / 100; // Base complexity per 100 lines

    // Adjust for file type
    switch (extension) {
      case "ts":
      case "tsx":
      case "js":
      case "jsx":
        baseComplexity *= 1.2; // JavaScript/TypeScript is more complex
        break;
      case "py":
        baseComplexity *= 1.1; // Python is moderately complex
        break;
      case "md":
      case "txt":
        baseComplexity *= 0.3; // Documentation is less complex
        break;
      default:
        baseComplexity *= 1.0; // Default complexity
    }

    return Math.min(baseComplexity, 10); // Cap at 10
  }

  /**
   * 🦊 Calculate risk level
   */
  private calculateRiskLevel(
    changeFrequency: number,
    complexity: number,
    contributors: number
  ): "low" | "medium" | "high" | "critical" {
    const riskScore = changeFrequency * 0.4 + complexity * 0.4 + contributors * 0.2;

    if (riskScore > 7) return "critical";
    if (riskScore > 5) return "high";
    if (riskScore > 3) return "medium";
    return "low";
  }

  /**
   * 🦊 Calculate technical debt
   */
  private calculateTechnicalDebt(changeFrequency: number, complexity: number): number {
    // Technical debt increases with change frequency and complexity
    return Math.round(changeFrequency * 10 + complexity * 5);
  }

  /**
   * 🦊 Generate hotspot recommendations
   */
  private generateHotspotRecommendations(changeFrequency: number, complexity: number, riskLevel: string): string[] {
    const recommendations: string[] = [];

    if (changeFrequency > 0.3) {
      recommendations.push("High change frequency - consider refactoring for stability");
    }

    if (complexity > 5) {
      recommendations.push("High complexity - break down into smaller, focused modules");
    }

    if (riskLevel === "critical" || riskLevel === "high") {
      recommendations.push("High risk file - prioritize testing and documentation");
    }

    if (recommendations.length === 0) {
      recommendations.push("File appears stable - maintain current practices");
    }

    return recommendations;
  }

  /**
   * 🦊 Generate behavioral insights
   */
  private async generateInsights(hotspots: CodeHotspot[], commits: GitCommit[]): Promise<BehavioralInsight[]> {
    const insights: BehavioralInsight[] = [];

    // Hotspot insights
    const criticalHotspots = hotspots.filter(h => h.riskLevel === "critical");
    if (criticalHotspots.length > 0) {
      insights.push({
        type: "hotspot",
        severity: "critical",
        title: "Critical Code Hotspots Detected",
        description: `${criticalHotspots.length} files identified as critical hotspots requiring immediate attention`,
        evidence: criticalHotspots.map(
          h => `${h.file}: ${h.changeFrequency.toFixed(2)} changes/commit, complexity ${h.complexity.toFixed(1)}`
        ),
        recommendations: [
          "Prioritize refactoring of critical hotspots",
          "Increase test coverage for high-risk files",
          "Consider architectural improvements",
        ],
        confidence: 0.9,
        affectedFiles: criticalHotspots.map(h => h.file),
      });
    }

    // Technical debt insights
    const totalDebt = hotspots.reduce((sum, h) => sum + h.technicalDebt, 0);
    if (totalDebt > 100) {
      insights.push({
        type: "debt",
        severity: "warning",
        title: "High Technical Debt Accumulation",
        description: `Total technical debt score: ${totalDebt}`,
        evidence: [
          `${hotspots.length} files analyzed`,
          `Average debt per file: ${(totalDebt / hotspots.length).toFixed(1)}`,
        ],
        recommendations: [
          "Schedule technical debt reduction sprints",
          "Implement code quality gates",
          "Focus on high-debt files first",
        ],
        confidence: 0.8,
        affectedFiles: hotspots.filter(h => h.technicalDebt > 10).map(h => h.file),
      });
    }

    // Pattern insights
    const frequentContributors = this.getFrequentContributors(commits);
    if (frequentContributors.length > 0) {
      insights.push({
        type: "pattern",
        severity: "info",
        title: "Development Pattern Analysis",
        description: `Top contributors: ${frequentContributors
          .slice(0, 3)
          .map(c => c.name)
          .join(", ")}`,
        evidence: frequentContributors.slice(0, 3).map(c => `${c.name}: ${c.commits} commits, ${c.lines} lines`),
        recommendations: [
          "Ensure knowledge sharing among team members",
          "Document critical system components",
          "Consider pair programming for complex changes",
        ],
        confidence: 0.7,
        affectedFiles: [],
      });
    }

    return insights;
  }

  /**
   * 🦊 Get frequent contributors
   */
  private getFrequentContributors(commits: GitCommit[]): Array<{ name: string; commits: number; lines: number }> {
    const contributorStats = new Map<string, { commits: number; lines: number }>();

    for (const commit of commits) {
      if (!contributorStats.has(commit.author)) {
        contributorStats.set(commit.author, { commits: 0, lines: 0 });
      }

      const stats = contributorStats.get(commit.author)!;
      stats.commits++;
      stats.lines += commit.linesAdded + commit.linesDeleted;
    }

    return Array.from(contributorStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.commits - a.commits);
  }

  /**
   * 🦊 Calculate trends
   */
  private calculateTrends(commits: GitCommit[]) {
    const commitFrequency = commits.length / 30; // commits per day (assuming 30-day period)
    const averageCommitSize = commits.reduce((sum, c) => sum + c.linesAdded + c.linesDeleted, 0) / commits.length;
    const topContributors = this.getFrequentContributors(commits).slice(0, 5);

    const fileStability = new Map<string, number>();
    for (const commit of commits) {
      for (const file of commit.files) {
        fileStability.set(file, (fileStability.get(file) || 0) + 1);
      }
    }

    const fileStabilityArray = Array.from(fileStability.entries())
      .map(([file, changes]) => ({ file, stability: 1 / (changes + 1), changes }))
      .sort((a, b) => a.stability - b.stability);

    return {
      commitFrequency,
      averageCommitSize,
      topContributors,
      fileStability: fileStabilityArray,
    };
  }

  /**
   * 🦊 Assess technical debt
   */
  private assessTechnicalDebt(hotspots: CodeHotspot[], _commits: GitCommit[]) {
    const total = hotspots.reduce((sum, h) => sum + h.technicalDebt, 0);

    const byFile = hotspots.map(h => ({
      file: h.file,
      debt: h.technicalDebt,
      reasons: h.recommendations,
    }));

    const byType = [
      {
        type: "High Change Frequency",
        debt: hotspots.filter(h => h.changeFrequency > 0.3).reduce((sum, h) => sum + h.technicalDebt, 0),
        count: hotspots.filter(h => h.changeFrequency > 0.3).length,
      },
      {
        type: "High Complexity",
        debt: hotspots.filter(h => h.complexity > 5).reduce((sum, h) => sum + h.technicalDebt, 0),
        count: hotspots.filter(h => h.complexity > 5).length,
      },
      {
        type: "High Risk",
        debt: hotspots
          .filter(h => h.riskLevel === "high" || h.riskLevel === "critical")
          .reduce((sum, h) => sum + h.technicalDebt, 0),
        count: hotspots.filter(h => h.riskLevel === "high" || h.riskLevel === "critical").length,
      },
    ];

    return { total, byFile, byType };
  }
}

/**
 * 🦊 Create behavioral analysis engine
 */
export function createBehavioralAnalysisEngine(
  projectRoot: string,
  gitHistoryLimit?: number
): BehavioralAnalysisEngine {
  return new BehavioralAnalysisEngine(projectRoot, gitHistoryLimit);
}
