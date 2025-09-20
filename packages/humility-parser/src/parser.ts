/**
 * Main parser class for humility detector output
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { 
  HumilityReport, 
  ParsedHumilityReport, 
  FilteredHumilityReport,
  HumilityAnalysisOptions,
  SeverityLevel,
  DetectionCategory
} from './types';
import { 
  HumilityReportSchema, 
  ParsedHumilityReportSchema,
  HumilityAnalysisOptionsSchema 
} from './schemas';

export class HumilityParser {
  private readonly parserVersion = '1.0.0';

  /**
   * Parse humility detector JSON output from file
   */
  parseFromFile(filePath: string): ParsedHumilityReport {
    if (!existsSync(filePath)) {
      throw new Error(`Humility report file not found: ${filePath}`);
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      return this.parseFromString(content, filePath);
    } catch (error) {
      throw new Error(`Failed to read humility report file: ${error}`);
    }
  }

  /**
   * Parse humility detector JSON output from string
   */
  parseFromString(jsonString: string, sourceFile?: string): ParsedHumilityReport {
    try {
      const rawData = JSON.parse(jsonString);
      
      // Validate the basic structure
      const validatedData = HumilityReportSchema.parse(rawData);
      
      // Add metadata
      const parsedReport: ParsedHumilityReport = {
        ...validatedData,
        metadata: {
          parsed_at: new Date().toISOString(),
          parser_version: this.parserVersion,
          source_file: sourceFile
        }
      };

      return parsedReport;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse humility report: ${error.message}`);
      }
      throw new Error('Failed to parse humility report: Invalid JSON format');
    }
  }

  /**
   * Filter report based on analysis options
   */
  filterReport(
    report: ParsedHumilityReport, 
    options: HumilityAnalysisOptions = {}
  ): FilteredHumilityReport {
    // Validate options
    const validatedOptions = HumilityAnalysisOptionsSchema.parse(options);
    
    const filteredProfiles: Record<string, typeof report.profiles[string]> = {};
    let totalFilteredFindings = 0;
    let totalScore = 0;
    let fileCount = 0;

    for (const [filePath, profile] of Object.entries(report.profiles)) {
      // Filter by file patterns if specified
      if (validatedOptions.filePatterns && validatedOptions.filePatterns.length > 0) {
        const matchesPattern = validatedOptions.filePatterns.some(pattern => 
          filePath.includes(pattern)
        );
        if (!matchesPattern) continue;
      }

      // Filter findings based on criteria
      const filteredFindings = profile.findings.filter(finding => {
        // Filter by minimum severity
        if (validatedOptions.minSeverity) {
          const severityOrder = ['low', 'medium', 'high', 'critical'];
          const findingSeverityIndex = severityOrder.indexOf(finding.severity);
          const minSeverityIndex = severityOrder.indexOf(validatedOptions.minSeverity);
          if (findingSeverityIndex < minSeverityIndex) return false;
        }

        // Filter by minimum confidence
        if (validatedOptions.minConfidence !== undefined) {
          if (finding.confidence_score < validatedOptions.minConfidence) return false;
        }

        // Filter by categories
        if (validatedOptions.categories && validatedOptions.categories.length > 0) {
          if (!validatedOptions.categories.includes(finding.category)) return false;
        }

        return true;
      });

      // Only include profiles that have findings after filtering
      if (filteredFindings.length > 0 || Object.keys(validatedOptions).length === 0) {
        filteredProfiles[filePath] = {
          ...profile,
          findings: filteredFindings
        };
        
        totalFilteredFindings += filteredFindings.length;
        totalScore += profile.overall_score;
        fileCount++;
      }
    }

    const averageScore = fileCount > 0 ? totalScore / fileCount : 0;

    return {
      ...report,
      profiles: filteredProfiles,
      filtered_summary: {
        filtered_files: fileCount,
        filtered_findings: totalFilteredFindings,
        average_score: averageScore,
        original_total_files: report.summary.total_files,
        original_total_findings: report.summary.total_findings
      }
    };
  }

  /**
   * Get summary statistics from a report
   */
  getSummary(report: ParsedHumilityReport | FilteredHumilityReport) {
    const isFiltered = 'filtered_summary' in report;
    const summary = isFiltered ? report.filtered_summary : report.summary;

    return {
      totalFiles: summary.filtered_files || summary.total_files,
      totalFindings: summary.filtered_findings || summary.total_findings,
      averageScore: summary.average_score,
      isFiltered,
      ...(isFiltered && {
        originalFiles: report.summary.total_files,
        originalFindings: report.summary.total_findings
      })
    };
  }

  /**
   * Get findings grouped by category
   */
  getFindingsByCategory(report: ParsedHumilityReport | FilteredHumilityReport) {
    const categoryMap = new Map<DetectionCategory, number>();
    
    for (const profile of Object.values(report.profiles)) {
      for (const finding of profile.findings) {
        const current = categoryMap.get(finding.category) || 0;
        categoryMap.set(finding.category, current + 1);
      }
    }

    return Object.fromEntries(categoryMap);
  }

  /**
   * Get findings grouped by severity
   */
  getFindingsBySeverity(report: ParsedHumilityReport | FilteredHumilityReport) {
    const severityMap = new Map<SeverityLevel, number>();
    
    for (const profile of Object.values(report.profiles)) {
      for (const finding of profile.findings) {
        const current = severityMap.get(finding.severity) || 0;
        severityMap.set(finding.severity, current + 1);
      }
    }

    return Object.fromEntries(severityMap);
  }

  /**
   * Get files with lowest humility scores
   */
  getLowestScoringFiles(report: ParsedHumilityReport | FilteredHumilityReport, limit = 10) {
    const files = Object.entries(report.profiles)
      .map(([filePath, profile]) => ({
        filePath,
        score: profile.overall_score,
        findings: profile.findings.length
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, limit);

    return files;
  }

  /**
   * Get files with highest humility scores
   */
  getHighestScoringFiles(report: ParsedHumilityReport | FilteredHumilityReport, limit = 10) {
    const files = Object.entries(report.profiles)
      .map(([filePath, profile]) => ({
        filePath,
        score: profile.overall_score,
        findings: profile.findings.length
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return files;
  }

  /**
   * Export report to different formats
   */
  exportToFormat(report: ParsedHumilityReport | FilteredHumilityReport, format: 'json' | 'csv' | 'summary') {
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      
      case 'csv':
        return this.exportToCSV(report);
      
      case 'summary':
        return this.exportToSummary(report);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private exportToCSV(report: ParsedHumilityReport | FilteredHumilityReport): string {
    const headers = [
      'File Path',
      'Overall Score',
      'Findings Count',
      'Category',
      'Severity',
      'Confidence',
      'Original Text',
      'Suggested Replacement',
      'Context'
    ];

    const rows: string[] = [headers.join(',')];

    for (const [filePath, profile] of Object.entries(report.profiles)) {
      if (profile.findings.length === 0) {
        rows.push([
          filePath,
          profile.overall_score,
          '0',
          '',
          '',
          '',
          '',
          '',
          ''
        ].map(field => `"${field}"`).join(','));
      } else {
        for (const finding of profile.findings) {
          rows.push([
            filePath,
            profile.overall_score,
            profile.findings.length,
            finding.category,
            finding.severity,
            finding.confidence,
            finding.original_text,
            finding.suggested_replacement,
            finding.context
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
        }
      }
    }

    return rows.join('\n');
  }

  private exportToSummary(report: ParsedHumilityReport | FilteredHumilityReport): string {
    const summary = this.getSummary(report);
    const byCategory = this.getFindingsByCategory(report);
    const bySeverity = this.getFindingsBySeverity(report);
    const lowest = this.getLowestScoringFiles(report, 5);

    return `
Humility Analysis Summary
========================

Files Analyzed: ${summary.totalFiles}
Total Findings: ${summary.totalFindings}
Average Score: ${summary.averageScore.toFixed(2)}/100

Findings by Category:
${Object.entries(byCategory).map(([cat, count]) => `  ${cat}: ${count}`).join('\n')}

Findings by Severity:
${Object.entries(bySeverity).map(([sev, count]) => `  ${sev}: ${count}`).join('\n')}

Lowest Scoring Files:
${lowest.map(f => `  ${f.filePath}: ${f.score.toFixed(2)}/100 (${f.findings} findings)`).join('\n')}
    `.trim();
  }
}
