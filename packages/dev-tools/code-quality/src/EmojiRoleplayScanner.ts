/**
 * Emoji and Roleplay Language Scanner
 *
 * Comprehensive scanner that detects emojis and roleplay language patterns
 * in documentation, Python, and TypeScript files to maintain professional standards.
 */

import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';

export interface EmojiRoleplayIssue {
  type: 'EMOJI' | 'ROLEPLAY_PATTERN' | 'ROLEPLAY_ACTION';
  severity: 'MAJOR' | 'MINOR' | 'INFO';
  line: number;
  column: number;
  message: string;
  pattern: string;
  suggestion: string;
}

export interface EmojiRoleplayScanResult {
  filePath: string;
  issues: EmojiRoleplayIssue[];
  totalIssues: number;
  emojiCount: number;
  roleplayPatternCount: number;
  roleplayActionCount: number;
}

export class EmojiRoleplayScanner {
  private readonly emojiPattern = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  
  private readonly roleplayPatterns = [
    // Animal actions with emotions
    {
      pattern: /(whiskers|snarls|splashes|prowls|gleams|twitch|eyes|claws|fur|paws|tail|ears|growls|howls|purrs|chirps)\s+(.*?)\s+with\s+(determination|cunning|enthusiasm|focus|intelligence|satisfaction|anticipation|joy|menace|authority|glee|satisfaction|pride|precision|dominance|savage|predatory)/gi,
      type: 'ROLEPLAY_PATTERN' as const,
      severity: 'MAJOR' as const,
      suggestion: 'Replace with professional technical language'
    },
    // Underscore roleplay actions
    {
      pattern: /_\s*(whiskers|snarls|splashes|prowls|gleams|twitch|eyes|claws|fur|paws|tail|ears|growls|howls|purrs|chirps)\s+(.*?)\s+with\s+(.*?)_/gi,
      type: 'ROLEPLAY_ACTION' as const,
      severity: 'MAJOR' as const,
      suggestion: 'Remove roleplay action and use professional language'
    },
    // Asterisk roleplay actions
    {
      pattern: /\*\s*(whiskers|snarls|splashes|prowls|gleams|twitch|eyes|claws|fur|paws|tail|ears|growls|howls|purrs|chirps)\s+(.*?)\s+with\s+(.*?)\*/gi,
      type: 'ROLEPLAY_ACTION' as const,
      severity: 'MAJOR' as const,
      suggestion: 'Remove roleplay action and use professional language'
    },
    // Common roleplay phrases
    {
      pattern: /(red fur gleams|whiskers twitch|snarls with|splashes with|prowls through|alpha wolf|pack hunting|fox's den|otter's stream)/gi,
      type: 'ROLEPLAY_PATTERN' as const,
      severity: 'MAJOR' as const,
      suggestion: 'Replace with professional technical language'
    }
  ];

  private readonly supportedExtensions = ['.md', '.py', '.ts', '.tsx', '.js', '.jsx', '.txt'];

  /**
   * Scan a single file for emojis and roleplay language
   */
  scanFile(filePath: string): EmojiRoleplayScanResult {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const extension = extname(filePath);
    if (!this.supportedExtensions.includes(extension)) {
      return {
        filePath,
        issues: [],
        totalIssues: 0,
        emojiCount: 0,
        roleplayPatternCount: 0,
        roleplayActionCount: 0
      };
    }

    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const issues: EmojiRoleplayIssue[] = [];

    let emojiCount = 0;
    let roleplayPatternCount = 0;
    let roleplayActionCount = 0;

    // Scan each line
    lines.forEach((line, lineIndex) => {
      const lineNumber = lineIndex + 1;

      // Check for emojis
      const emojiMatches = line.matchAll(this.emojiPattern);
      for (const match of emojiMatches) {
        emojiCount++;
        issues.push({
          type: 'EMOJI',
          severity: 'MINOR',
          line: lineNumber,
          column: match.index! + 1,
          message: `Emoji detected: ${match[0]}`,
          pattern: match[0],
          suggestion: 'Remove emoji and use professional text'
        });
      }

      // Check for roleplay patterns
      this.roleplayPatterns.forEach(({ pattern, type, severity, suggestion }) => {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          if (type === 'ROLEPLAY_PATTERN') {
            roleplayPatternCount++;
          } else if (type === 'ROLEPLAY_ACTION') {
            roleplayActionCount++;
          }

          issues.push({
            type,
            severity,
            line: lineNumber,
            column: match.index! + 1,
            message: `${type.replace('_', ' ').toLowerCase()} detected: ${match[0]}`,
            pattern: match[0],
            suggestion
          });
        }
      });
    });

    return {
      filePath,
      issues,
      totalIssues: issues.length,
      emojiCount,
      roleplayPatternCount,
      roleplayActionCount
    };
  }

  /**
   * Scan multiple files and return aggregated results
   */
  scanFiles(filePaths: string[]): EmojiRoleplayScanResult[] {
    return filePaths.map(filePath => this.scanFile(filePath));
  }

  /**
   * Get summary statistics for scan results
   */
  getScanSummary(results: EmojiRoleplayScanResult[]): {
    totalFiles: number;
    totalIssues: number;
    filesWithIssues: number;
    totalEmojis: number;
    totalRoleplayPatterns: number;
    totalRoleplayActions: number;
    severityBreakdown: Record<string, number>;
  } {
    const summary = {
      totalFiles: results.length,
      totalIssues: 0,
      filesWithIssues: 0,
      totalEmojis: 0,
      totalRoleplayPatterns: 0,
      totalRoleplayActions: 0,
      severityBreakdown: { MAJOR: 0, MINOR: 0, INFO: 0 }
    };

    results.forEach(result => {
      summary.totalIssues += result.totalIssues;
      summary.totalEmojis += result.emojiCount;
      summary.totalRoleplayPatterns += result.roleplayPatternCount;
      summary.totalRoleplayActions += result.roleplayActionCount;

      if (result.totalIssues > 0) {
        summary.filesWithIssues++;
      }

      result.issues.forEach(issue => {
        summary.severityBreakdown[issue.severity]++;
      });
    });

    return summary;
  }

  /**
   * Generate a detailed report of scan results
   */
  generateReport(results: EmojiRoleplayScanResult[]): string {
    const summary = this.getScanSummary(results);
    
    let report = `# Emoji and Roleplay Language Scan Report\n\n`;
    report += `## Summary\n`;
    report += `- **Total Files Scanned**: ${summary.totalFiles}\n`;
    report += `- **Files with Issues**: ${summary.filesWithIssues}\n`;
    report += `- **Total Issues**: ${summary.totalIssues}\n`;
    report += `- **Emojis Found**: ${summary.totalEmojis}\n`;
    report += `- **Roleplay Patterns**: ${summary.totalRoleplayPatterns}\n`;
    report += `- **Roleplay Actions**: ${summary.totalRoleplayActions}\n\n`;

    report += `## Severity Breakdown\n`;
    report += `- **Major Issues**: ${summary.severityBreakdown.MAJOR}\n`;
    report += `- **Minor Issues**: ${summary.severityBreakdown.MINOR}\n`;
    report += `- **Info Issues**: ${summary.severityBreakdown.INFO}\n\n`;

    if (summary.filesWithIssues > 0) {
      report += `## Files with Issues\n\n`;
      
      results
        .filter(result => result.totalIssues > 0)
        .forEach(result => {
          report += `### ${result.filePath}\n`;
          report += `- **Total Issues**: ${result.totalIssues}\n`;
          report += `- **Emojis**: ${result.emojiCount}\n`;
          report += `- **Roleplay Patterns**: ${result.roleplayPatternCount}\n`;
          report += `- **Roleplay Actions**: ${result.roleplayActionCount}\n\n`;

          result.issues.forEach(issue => {
            report += `**Line ${issue.line}:${issue.column}** - ${issue.severity}\n`;
            report += `- **Type**: ${issue.type}\n`;
            report += `- **Message**: ${issue.message}\n`;
            report += `- **Pattern**: \`${issue.pattern}\`\n`;
            report += `- **Suggestion**: ${issue.suggestion}\n\n`;
          });
        });
    }

    return report;
  }
}
