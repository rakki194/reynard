/**
 * I18n Performance Reporter
 * 
 * 🦦 *splashes with reporting precision* Comprehensive reporting utilities
 * for i18n performance benchmark results.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface PerformanceResult {
  testName: string;
  approach: string;
  metrics: {
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
    bundleSize?: number;
    languageSwitchTime?: number;
    pluralizationTime?: number;
    cacheHitRate?: number;
  };
  timestamp: Date;
  browser: string;
  iteration: number;
}

export interface BenchmarkSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageLoadTime: number;
  averageRenderTime: number;
  averageMemoryUsage: number;
  performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
}

export class I18nPerformanceReporter {
  private results: PerformanceResult[] = [];
  private outputDir: string;

  constructor(outputDir: string = 'i18n-benchmark-results') {
    this.outputDir = outputDir;
    this.ensureOutputDir();
  }

  private ensureOutputDir(): void {
    mkdirSync(this.outputDir, { recursive: true });
  }

  addResult(result: PerformanceResult): void {
    this.results.push(result);
  }

  addResults(results: PerformanceResult[]): void {
    this.results.push(...results);
  }

  generateSummary(): BenchmarkSummary {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => this.isResultPassing(r)).length;
    const failedTests = totalTests - passedTests;

    const averageLoadTime = this.results.reduce((sum, r) => sum + r.metrics.loadTime, 0) / totalTests;
    const averageRenderTime = this.results.reduce((sum, r) => sum + r.metrics.renderTime, 0) / totalTests;
    const averageMemoryUsage = this.results.reduce((sum, r) => sum + r.metrics.memoryUsage, 0) / totalTests;

    const performanceGrade = this.calculatePerformanceGrade(averageLoadTime, averageRenderTime, averageMemoryUsage);
    const recommendations = this.generateRecommendations();

    return {
      totalTests,
      passedTests,
      failedTests,
      averageLoadTime,
      averageRenderTime,
      averageMemoryUsage,
      performanceGrade,
      recommendations,
    };
  }

  private isResultPassing(result: PerformanceResult): boolean {
    const thresholds = {
      maxLoadTime: 1000,
      maxRenderTime: 100,
      maxMemoryUsage: 50 * 1024 * 1024,
      maxLanguageSwitchTime: 500,
      maxPluralizationTime: 50,
    };

    return (
      result.metrics.loadTime < thresholds.maxLoadTime &&
      result.metrics.renderTime < thresholds.maxRenderTime &&
      result.metrics.memoryUsage < thresholds.maxMemoryUsage &&
      (!result.metrics.languageSwitchTime || result.metrics.languageSwitchTime < thresholds.maxLanguageSwitchTime) &&
      (!result.metrics.pluralizationTime || result.metrics.pluralizationTime < thresholds.maxPluralizationTime)
    );
  }

  private calculatePerformanceGrade(loadTime: number, renderTime: number, memoryUsage: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    let score = 100;

    // Load time scoring (40% weight)
    if (loadTime > 1000) score -= 40;
    else if (loadTime > 500) score -= 20;
    else if (loadTime > 200) score -= 10;

    // Render time scoring (30% weight)
    if (renderTime > 100) score -= 30;
    else if (renderTime > 50) score -= 15;
    else if (renderTime > 20) score -= 5;

    // Memory usage scoring (30% weight)
    const memoryMB = memoryUsage / 1024 / 1024;
    if (memoryMB > 50) score -= 30;
    else if (memoryMB > 25) score -= 15;
    else if (memoryMB > 10) score -= 5;

    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const summary = this.generateSummary();

    if (summary.averageLoadTime > 500) {
      recommendations.push('Consider implementing lazy loading for translations');
      recommendations.push('Use code splitting to reduce initial bundle size');
    }

    if (summary.averageRenderTime > 50) {
      recommendations.push('Optimize translation rendering with memoization');
      recommendations.push('Consider using virtual DOM for large translation sets');
    }

    if (summary.averageMemoryUsage > 25 * 1024 * 1024) {
      recommendations.push('Implement translation cleanup for unused languages');
      recommendations.push('Use weak references for cached translations');
    }

    if (summary.performanceGrade === 'F') {
      recommendations.push('Critical performance issues detected - immediate optimization required');
    } else if (summary.performanceGrade === 'D') {
      recommendations.push('Performance below acceptable thresholds - optimization recommended');
    }

    return recommendations;
  }

  generateMarkdownReport(): string {
    const summary = this.generateSummary();
    const timestamp = new Date().toISOString();

    let report = `# I18n Performance Benchmark Report\n\n`;
    report += `**Generated**: ${timestamp}\n`;
    report += `**Total Tests**: ${summary.totalTests}\n`;
    report += `**Passed**: ${summary.passedTests} (${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}%)\n`;
    report += `**Failed**: ${summary.failedTests}\n`;
    report += `**Performance Grade**: ${summary.performanceGrade}\n\n`;

    report += `## Executive Summary\n\n`;
    report += `This report presents comprehensive performance benchmarks for i18n implementations in the Reynard framework.\n\n`;

    report += `### Key Metrics\n\n`;
    report += `- **Average Load Time**: ${summary.averageLoadTime.toFixed(2)}ms\n`;
    report += `- **Average Render Time**: ${summary.averageRenderTime.toFixed(2)}ms\n`;
    report += `- **Average Memory Usage**: ${(summary.averageMemoryUsage / 1024 / 1024).toFixed(2)}MB\n\n`;

    report += `### Performance Grade: ${summary.performanceGrade}\n\n`;
    report += this.getGradeDescription(summary.performanceGrade);

    report += `## Detailed Results\n\n`;

    // Group results by approach
    const groupedResults = this.groupResultsByApproach();
    groupedResults.forEach((results, approach) => {
      report += `### ${approach}\n\n`;
      
      const avgLoadTime = results.reduce((sum, r) => sum + r.metrics.loadTime, 0) / results.length;
      const avgRenderTime = results.reduce((sum, r) => sum + r.metrics.renderTime, 0) / results.length;
      const avgMemoryUsage = results.reduce((sum, r) => sum + r.metrics.memoryUsage, 0) / results.length;
      const passRate = (results.filter(r => this.isResultPassing(r)).length / results.length) * 100;

      report += `- **Tests**: ${results.length}\n`;
      report += `- **Pass Rate**: ${passRate.toFixed(1)}%\n`;
      report += `- **Avg Load Time**: ${avgLoadTime.toFixed(2)}ms\n`;
      report += `- **Avg Render Time**: ${avgRenderTime.toFixed(2)}ms\n`;
      report += `- **Avg Memory Usage**: ${(avgMemoryUsage / 1024 / 1024).toFixed(2)}MB\n\n`;

      // Individual results table
      report += `| Test | Load Time (ms) | Render Time (ms) | Memory (MB) | Status |\n`;
      report += `|------|----------------|------------------|-------------|--------|\n`;
      
      results.forEach((result, index) => {
        const status = this.isResultPassing(result) ? '✅ PASS' : '❌ FAIL';
        report += `| ${index + 1} | ${result.metrics.loadTime.toFixed(2)} | ${result.metrics.renderTime.toFixed(2)} | ${(result.metrics.memoryUsage / 1024 / 1024).toFixed(2)} | ${status} |\n`;
      });
      
      report += `\n`;
    });

    report += `## Performance Comparison\n\n`;
    report += `| Approach | Avg Load Time (ms) | Avg Render Time (ms) | Avg Memory (MB) | Pass Rate |\n`;
    report += `|----------|-------------------|---------------------|-----------------|----------|\n`;

    groupedResults.forEach((results, approach) => {
      const avgLoadTime = results.reduce((sum, r) => sum + r.metrics.loadTime, 0) / results.length;
      const avgRenderTime = results.reduce((sum, r) => sum + r.metrics.renderTime, 0) / results.length;
      const avgMemoryUsage = results.reduce((sum, r) => sum + r.metrics.memoryUsage, 0) / results.length;
      const passRate = (results.filter(r => this.isResultPassing(r)).length / results.length) * 100;

      report += `| ${approach} | ${avgLoadTime.toFixed(2)} | ${avgRenderTime.toFixed(2)} | ${(avgMemoryUsage / 1024 / 1024).toFixed(2)} | ${passRate.toFixed(1)}% |\n`;
    });

    report += `\n## Recommendations\n\n`;
    summary.recommendations.forEach((recommendation, index) => {
      report += `${index + 1}. ${recommendation}\n`;
    });

    report += `\n## Methodology\n\n`;
    report += `This benchmark suite uses Playwright for browser automation and the Performance API for accurate measurements.\n\n`;
    report += `### Test Environment\n`;
    report += `- **Browsers**: Chromium, Firefox, WebKit\n`;
    report += `- **Iterations**: 10 per test\n`;
    report += `- **Warmup**: 3 iterations before measurement\n`;
    report += `- **Thresholds**: Based on industry standards and user experience requirements\n\n`;

    report += `### Metrics Explained\n`;
    report += `- **Load Time**: Time to load and initialize the application\n`;
    report += `- **Render Time**: Time to render translated content\n`;
    report += `- **Memory Usage**: JavaScript heap memory consumption\n`;
    report += `- **Language Switch Time**: Time to switch between languages\n`;
    report += `- **Pluralization Time**: Time to process pluralization rules\n\n`;

    report += `---\n\n`;
    report += `*Generated by Reynard I18n Performance Benchmark Suite*\n`;
    report += `*🦦 Splashing with performance testing precision*\n`;

    return report;
  }

  private groupResultsByApproach(): Map<string, PerformanceResult[]> {
    const grouped = new Map<string, PerformanceResult[]>();
    
    this.results.forEach(result => {
      if (!grouped.has(result.approach)) {
        grouped.set(result.approach, []);
      }
      grouped.get(result.approach)!.push(result);
    });
    
    return grouped;
  }

  private getGradeDescription(grade: 'A' | 'B' | 'C' | 'D' | 'F'): string {
    const descriptions = {
      'A': 'Excellent performance - all metrics well within acceptable thresholds',
      'B': 'Good performance - minor optimizations may be beneficial',
      'C': 'Acceptable performance - some optimizations recommended',
      'D': 'Below average performance - optimization strongly recommended',
      'F': 'Poor performance - immediate optimization required'
    };
    
    return descriptions[grade] + '\n\n';
  }

  generateJSONReport(): string {
    const summary = this.generateSummary();
    const groupedResults = this.groupResultsByApproach();
    
    const report = {
      timestamp: new Date().toISOString(),
      summary,
      results: this.results,
      groupedResults: Object.fromEntries(groupedResults),
      metadata: {
        totalApproaches: groupedResults.size,
        browsers: [...new Set(this.results.map(r => r.browser))],
        testNames: [...new Set(this.results.map(r => r.testName))],
      }
    };
    
    return JSON.stringify(report, null, 2);
  }

  saveReports(): void {
    const markdownReport = this.generateMarkdownReport();
    const jsonReport = this.generateJSONReport();
    
    const markdownPath = join(this.outputDir, 'i18n-performance-report.md');
    const jsonPath = join(this.outputDir, 'i18n-performance-report.json');
    
    writeFileSync(markdownPath, markdownReport);
    writeFileSync(jsonPath, jsonReport);
    
    console.log(`📊 Performance reports saved:`);
    console.log(`  Markdown: ${markdownPath}`);
    console.log(`  JSON: ${jsonPath}`);
  }

  getResults(): PerformanceResult[] {
    return this.results;
  }

  clearResults(): void {
    this.results = [];
  }
}
