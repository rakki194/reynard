/**
 * Utility functions for humility parser
 */

import { SeverityLevel, DetectionCategory, ConfidenceLevel } from './types';

/**
 * Convert severity level to numeric value for comparison
 */
export function severityToNumber(severity: SeverityLevel): number {
  const severityMap = {
    [SeverityLevel.LOW]: 1,
    [SeverityLevel.MEDIUM]: 2,
    [SeverityLevel.HIGH]: 3,
    [SeverityLevel.CRITICAL]: 4
  };
  return severityMap[severity];
}

/**
 * Convert confidence level to numeric value for comparison
 */
export function confidenceToNumber(confidence: ConfidenceLevel): number {
  const confidenceMap = {
    [ConfidenceLevel.LOW]: 1,
    [ConfidenceLevel.MEDIUM]: 2,
    [ConfidenceLevel.HIGH]: 3,
    [ConfidenceLevel.VERY_HIGH]: 4
  };
  return confidenceMap[confidence];
}

/**
 * Get severity level from numeric value
 */
export function numberToSeverity(value: number): SeverityLevel {
  if (value <= 1) return SeverityLevel.LOW;
  if (value <= 2) return SeverityLevel.MEDIUM;
  if (value <= 3) return SeverityLevel.HIGH;
  return SeverityLevel.CRITICAL;
}

/**
 * Get confidence level from numeric value
 */
export function numberToConfidence(value: number): ConfidenceLevel {
  if (value <= 1) return ConfidenceLevel.LOW;
  if (value <= 2) return ConfidenceLevel.MEDIUM;
  if (value <= 3) return ConfidenceLevel.HIGH;
  return ConfidenceLevel.VERY_HIGH;
}

/**
 * Format humility score with appropriate emoji
 */
export function formatHumilityScore(score: number): string {
  if (score >= 90) return `🟢 ${score.toFixed(1)}/100 (Excellent)`;
  if (score >= 80) return `🟡 ${score.toFixed(1)}/100 (Good)`;
  if (score >= 70) return `🟠 ${score.toFixed(1)}/100 (Fair)`;
  if (score >= 60) return `🔴 ${score.toFixed(1)}/100 (Poor)`;
  return `⚫ ${score.toFixed(1)}/100 (Critical)`;
}

/**
 * Format severity with appropriate emoji
 */
export function formatSeverity(severity: SeverityLevel): string {
  const severityEmojis = {
    [SeverityLevel.LOW]: '🟢',
    [SeverityLevel.MEDIUM]: '🟡',
    [SeverityLevel.HIGH]: '🟠',
    [SeverityLevel.CRITICAL]: '🔴'
  };
  return `${severityEmojis[severity]} ${severity.toUpperCase()}`;
}

/**
 * Format confidence with appropriate emoji
 */
export function formatConfidence(confidence: ConfidenceLevel): string {
  const confidenceEmojis = {
    [ConfidenceLevel.LOW]: '🔵',
    [ConfidenceLevel.MEDIUM]: '🟡',
    [ConfidenceLevel.HIGH]: '🟠',
    [ConfidenceLevel.VERY_HIGH]: '🔴'
  };
  return `${confidenceEmojis[confidence]} ${confidence.toUpperCase()}`;
}

/**
 * Get category description
 */
export function getCategoryDescription(category: DetectionCategory): string {
  const descriptions = {
    [DetectionCategory.SUPERLATIVES]: 'Use of superlative language (best, greatest, amazing)',
    [DetectionCategory.EXAGGERATION]: 'Exaggerated claims or statements',
    [DetectionCategory.SELF_PROMOTION]: 'Self-promotional or boastful language',
    [DetectionCategory.DISMISSIVENESS]: 'Dismissive or condescending language',
    [DetectionCategory.ABSOLUTE_CLAIMS]: 'Absolute or definitive claims without qualification',
    [DetectionCategory.HYPE_LANGUAGE]: 'Hype or marketing language'
  };
  return descriptions[category];
}

/**
 * Get suggested improvements for a category
 */
export function getCategorySuggestions(category: DetectionCategory): string[] {
  const suggestions = {
    [DetectionCategory.SUPERLATIVES]: [
      'Use more moderate language (good instead of best)',
      'Provide specific evidence for claims',
      'Acknowledge limitations or alternatives'
    ],
    [DetectionCategory.EXAGGERATION]: [
      'Use precise, factual language',
      'Avoid hyperbole and overstatement',
      'Provide concrete examples and data'
    ],
    [DetectionCategory.SELF_PROMOTION]: [
      'Focus on user value rather than system capabilities',
      'Use third-person perspective when possible',
      'Acknowledge other approaches and solutions'
    ],
    [DetectionCategory.DISMISSIVENESS]: [
      'Use respectful, inclusive language',
      'Acknowledge different perspectives',
      'Focus on constructive alternatives'
    ],
    [DetectionCategory.ABSOLUTE_CLAIMS]: [
      'Use qualifying language (often, typically, usually)',
      'Acknowledge exceptions and edge cases',
      'Express uncertainty when appropriate'
    ],
    [DetectionCategory.HYPE_LANGUAGE]: [
      'Use professional, technical language',
      'Focus on functionality over marketing',
      'Provide clear, factual descriptions'
    ]
  };
  return suggestions[category];
}

/**
 * Calculate overall improvement score
 */
export function calculateImprovementScore(
  originalScore: number, 
  newScore: number
): { improvement: number; percentage: number; direction: 'improved' | 'declined' | 'unchanged' } {
  const improvement = newScore - originalScore;
  const percentage = originalScore > 0 ? (improvement / originalScore) * 100 : 0;
  const direction = improvement > 0 ? 'improved' : improvement < 0 ? 'declined' : 'unchanged';
  
  return { improvement, percentage, direction };
}

/**
 * Generate improvement recommendations based on findings
 */
export function generateImprovementRecommendations(
  findings: Array<{ category: DetectionCategory; severity: SeverityLevel; count: number }>
): string[] {
  const recommendations: string[] = [];
  const categoryCounts = new Map<DetectionCategory, number>();
  
  // Count findings by category
  for (const finding of findings) {
    const current = categoryCounts.get(finding.category) || 0;
    categoryCounts.set(finding.category, current + finding.count);
  }
  
  // Generate recommendations for top categories
  const sortedCategories = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  for (const [category, count] of sortedCategories) {
    const suggestions = getCategorySuggestions(category);
    recommendations.push(
      `Focus on ${category} (${count} findings): ${suggestions[0]}`
    );
  }
  
  // Add general recommendations
  recommendations.push(
    'Consider a comprehensive review of communication style',
    'Focus on sincere and modest expression',
    'Acknowledge limitations and alternative approaches'
  );
  
  return recommendations;
}

/**
 * Validate file path for humility report
 */
export function validateReportFilePath(filePath: string): boolean {
  return filePath.endsWith('.json') && filePath.length > 0;
}

/**
 * Extract file name from full path
 */
export function extractFileName(filePath: string): string {
  return filePath.split('/').pop() || filePath;
}

/**
 * Format file path for display (truncate if too long)
 */
export function formatFilePath(filePath: string, maxLength = 60): string {
  if (filePath.length <= maxLength) return filePath;
  
  const parts = filePath.split('/');
  const fileName = parts.pop() || '';
  const remainingLength = maxLength - fileName.length - 3; // 3 for "..."
  
  if (remainingLength <= 0) return `...${fileName}`;
  
  const truncatedPath = parts.join('/');
  const startIndex = Math.max(0, truncatedPath.length - remainingLength);
  
  return `...${truncatedPath.slice(startIndex)}/${fileName}`;
}
