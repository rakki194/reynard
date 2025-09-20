/**
 * 🦦 Reynard File Analyzer
 *
 * *splashes with thoroughness* Analyzes individual files with
 * otter-like attention to detail.
 */

import { FileDiscoveryService } from "./FileDiscoveryService";
import { FileAnalysis, QualityIssue } from "./types";

export class FileAnalyzer {
  private readonly fileDiscovery: FileDiscoveryService;

  constructor() {
    this.fileDiscovery = new FileDiscoveryService();
  }

  /**
   * 🦦 Analyze files with their issues
   */
  async analyzeFiles(files: string[], issues: QualityIssue[]): Promise<FileAnalysis[]> {
    const fileMap = new Map<string, QualityIssue[]>();

    // Group issues by file
    for (const issue of issues) {
      if (!fileMap.has(issue.file)) {
        fileMap.set(issue.file, []);
      }
      fileMap.get(issue.file)!.push(issue);
    }

    const analyses: FileAnalysis[] = [];

    for (const file of files) {
      const fileIssues = fileMap.get(file) || [];
      const lines = await this.fileDiscovery.countLines(file);
      const language = this.fileDiscovery.detectLanguage(file);

      analyses.push({
        path: file,
        language,
        lines,
        issues: fileIssues,
        complexity: fileIssues.length * 2, // Rough estimate
        coverage: 0, // Would be calculated from test coverage
      });
    }

    return analyses;
  }

  /**
   * 🦦 Get files with most issues
   */
  getFilesWithMostIssues(analyses: FileAnalysis[], limit: number = 10): FileAnalysis[] {
    return analyses.sort((a, b) => b.issues.length - a.issues.length).slice(0, limit);
  }

  /**
   * 🦦 Get files by language
   */
  getFilesByLanguage(analyses: FileAnalysis[], language: string): FileAnalysis[] {
    return analyses.filter(analysis => analysis.language === language);
  }

  /**
   * 🦦 Get files with no issues
   */
  getCleanFiles(analyses: FileAnalysis[]): FileAnalysis[] {
    return analyses.filter(analysis => analysis.issues.length === 0);
  }

  /**
   * 🦦 Get files with critical issues
   */
  getFilesWithCriticalIssues(analyses: FileAnalysis[]): FileAnalysis[] {
    return analyses.filter(analysis =>
      analysis.issues.some(issue => issue.severity === "CRITICAL" || issue.severity === "BLOCKER")
    );
  }

  /**
   * 🦦 Calculate average complexity per file
   */
  calculateAverageComplexity(analyses: FileAnalysis[]): number {
    if (analyses.length === 0) return 0;

    const totalComplexity = analyses.reduce((sum, analysis) => sum + analysis.complexity, 0);
    return totalComplexity / analyses.length;
  }

  /**
   * 🦦 Calculate average issues per file
   */
  calculateAverageIssues(analyses: FileAnalysis[]): number {
    if (analyses.length === 0) return 0;

    const totalIssues = analyses.reduce((sum, analysis) => sum + analysis.issues.length, 0);
    return totalIssues / analyses.length;
  }
}
