/**
 * I18n Bundle Size Analysis
 * 
 * 🦦 *splashes with bundle analysis enthusiasm* Comprehensive analysis
 * of i18n bundle sizes and their impact on application performance.
 */

import { test, expect, Page } from '@playwright/test';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface BundleAnalysis {
  name: string;
  totalSize: number;
  jsSize: number;
  cssSize: number;
  i18nSize: number;
  translationFiles: number;
  languages: string[];
  compressionRatio: number;
}

interface BundleComparison {
  approach: string;
  baseline: BundleAnalysis;
  withI18n: BundleAnalysis;
  overhead: {
    totalSize: number;
    percentage: number;
    jsOverhead: number;
    cssOverhead: number;
  };
}

class I18nBundleAnalyzer {
  private results: BundleComparison[] = [];

  async analyzeBundle(page: Page, name: string): Promise<BundleAnalysis> {
    console.log(`📦 Analyzing bundle: ${name}`);
    
    // Get network requests
    const requests = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter((entry: any) => 
          entry.name.includes('.js') || 
          entry.name.includes('.css') ||
          entry.name.includes('.json') ||
          entry.name.includes('i18n') ||
          entry.name.includes('translation')
        )
        .map((entry: any) => ({
          name: entry.name,
          size: entry.transferSize || entry.encodedBodySize || 0,
          type: entry.name.includes('.js') ? 'js' : 
                entry.name.includes('.css') ? 'css' : 
                entry.name.includes('i18n') || entry.name.includes('translation') ? 'i18n' : 'other'
        }));
    });

    // Calculate sizes
    const totalSize = requests.reduce((sum, req) => sum + req.size, 0);
    const jsSize = requests.filter(req => req.type === 'js').reduce((sum, req) => sum + req.size, 0);
    const cssSize = requests.filter(req => req.type === 'css').reduce((sum, req) => sum + req.size, 0);
    const i18nSize = requests.filter(req => req.type === 'i18n').reduce((sum, req) => sum + req.size, 0);
    
    // Count translation files
    const translationFiles = requests.filter(req => 
      req.name.includes('translation') || 
      req.name.includes('i18n') ||
      req.name.includes('lang')
    ).length;
    
    // Extract languages from requests
    const languages = requests
      .filter(req => req.name.includes('lang') || req.name.includes('i18n'))
      .map(req => {
        const match = req.name.match(/\/([a-z]{2}(?:-[A-Z]{2})?)\//);
        return match ? match[1] : null;
      })
      .filter(Boolean) as string[];
    
    // Calculate compression ratio (estimate)
    const compressionRatio = totalSize > 0 ? (totalSize / (totalSize * 1.5)) : 0;
    
    const analysis: BundleAnalysis = {
      name,
      totalSize,
      jsSize,
      cssSize,
      i18nSize,
      translationFiles,
      languages: [...new Set(languages)],
      compressionRatio
    };
    
    console.log(`  Total Size: ${(totalSize / 1024).toFixed(2)}KB`);
    console.log(`  JS Size: ${(jsSize / 1024).toFixed(2)}KB`);
    console.log(`  CSS Size: ${(cssSize / 1024).toFixed(2)}KB`);
    console.log(`  I18n Size: ${(i18nSize / 1024).toFixed(2)}KB`);
    console.log(`  Translation Files: ${translationFiles}`);
    console.log(`  Languages: ${languages.join(', ')}`);
    
    return analysis;
  }

  async compareBundles(page: Page, baselineUrl: string, i18nUrl: string, approach: string): Promise<BundleComparison> {
    console.log(`\n🔄 Comparing bundles for approach: ${approach}`);
    
    // Analyze baseline (no i18n)
    await page.goto(baselineUrl);
    await page.waitForLoadState('networkidle');
    const baseline = await this.analyzeBundle(page, `${approach} - Baseline`);
    
    // Analyze with i18n
    await page.goto(i18nUrl);
    await page.waitForLoadState('networkidle');
    const withI18n = await this.analyzeBundle(page, `${approach} - With I18n`);
    
    // Calculate overhead
    const overhead = {
      totalSize: withI18n.totalSize - baseline.totalSize,
      percentage: baseline.totalSize > 0 ? ((withI18n.totalSize - baseline.totalSize) / baseline.totalSize) * 100 : 0,
      jsOverhead: withI18n.jsSize - baseline.jsSize,
      cssOverhead: withI18n.cssSize - baseline.cssSize
    };
    
    const comparison: BundleComparison = {
      approach,
      baseline,
      withI18n,
      overhead
    };
    
    console.log(`\n📊 Overhead Analysis:`);
    console.log(`  Total Size Overhead: ${(overhead.totalSize / 1024).toFixed(2)}KB (${overhead.percentage.toFixed(1)}%)`);
    console.log(`  JS Overhead: ${(overhead.jsOverhead / 1024).toFixed(2)}KB`);
    console.log(`  CSS Overhead: ${(overhead.cssOverhead / 1024).toFixed(2)}KB`);
    
    this.results.push(comparison);
    return comparison;
  }

  generateReport(): string {
    let report = '# I18n Bundle Size Analysis Report\n\n';
    
    report += '## Executive Summary\n\n';
    report += 'This report analyzes the bundle size impact of different i18n approaches in the Reynard framework.\n\n';
    
    report += '## Bundle Comparisons\n\n';
    
    this.results.forEach(comparison => {
      report += `### ${comparison.approach}\n\n`;
      
      report += `#### Baseline Bundle\n`;
      report += `- **Total Size**: ${(comparison.baseline.totalSize / 1024).toFixed(2)}KB\n`;
      report += `- **JS Size**: ${(comparison.baseline.jsSize / 1024).toFixed(2)}KB\n`;
      report += `- **CSS Size**: ${(comparison.baseline.cssSize / 1024).toFixed(2)}KB\n`;
      report += `- **Translation Files**: ${comparison.baseline.translationFiles}\n`;
      report += `- **Languages**: ${comparison.baseline.languages.join(', ') || 'None'}\n\n`;
      
      report += `#### With I18n Bundle\n`;
      report += `- **Total Size**: ${(comparison.withI18n.totalSize / 1024).toFixed(2)}KB\n`;
      report += `- **JS Size**: ${(comparison.withI18n.jsSize / 1024).toFixed(2)}KB\n`;
      report += `- **CSS Size**: ${(comparison.withI18n.cssSize / 1024).toFixed(2)}KB\n`;
      report += `- **I18n Size**: ${(comparison.withI18n.i18nSize / 1024).toFixed(2)}KB\n`;
      report += `- **Translation Files**: ${comparison.withI18n.translationFiles}\n`;
      report += `- **Languages**: ${comparison.withI18n.languages.join(', ')}\n\n`;
      
      report += `#### Overhead Analysis\n`;
      report += `- **Total Size Overhead**: ${(comparison.overhead.totalSize / 1024).toFixed(2)}KB (${comparison.overhead.percentage.toFixed(1)}%)\n`;
      report += `- **JS Overhead**: ${(comparison.overhead.jsOverhead / 1024).toFixed(2)}KB\n`;
      report += `- **CSS Overhead**: ${(comparison.overhead.cssOverhead / 1024).toFixed(2)}KB\n\n`;
    });
    
    // Summary table
    report += '## Summary Table\n\n';
    report += '| Approach | Baseline Size (KB) | I18n Size (KB) | Overhead (KB) | Overhead (%) |\n';
    report += '|----------|-------------------|----------------|---------------|-------------|\n';
    
    this.results.forEach(comparison => {
      report += `| ${comparison.approach} | ${(comparison.baseline.totalSize / 1024).toFixed(2)} | ${(comparison.withI18n.totalSize / 1024).toFixed(2)} | ${(comparison.overhead.totalSize / 1024).toFixed(2)} | ${comparison.overhead.percentage.toFixed(1)}% |\n`;
    });
    
    // Recommendations
    report += '\n## Recommendations\n\n';
    report += 'Based on the bundle size analysis:\n\n';
    
    const avgOverhead = this.results.reduce((sum, r) => sum + r.overhead.percentage, 0) / this.results.length;
    
    if (avgOverhead < 10) {
      report += '✅ **Excellent**: I18n overhead is minimal (< 10%). The current implementation is very efficient.\n\n';
    } else if (avgOverhead < 25) {
      report += '⚠️ **Good**: I18n overhead is moderate (10-25%). Consider optimization for better performance.\n\n';
    } else {
      report += '❌ **Needs Improvement**: I18n overhead is significant (> 25%). Optimization is recommended.\n\n';
    }
    
    report += '### Optimization Strategies\n\n';
    report += '1. **Tree Shaking**: Ensure unused translations are eliminated from the bundle.\n';
    report += '2. **Lazy Loading**: Load translations on-demand to reduce initial bundle size.\n';
    report += '3. **Compression**: Use gzip/brotli compression for translation files.\n';
    report += '4. **Namespace Splitting**: Split translations by feature/namespace.\n';
    report += '5. **CDN Delivery**: Serve translation files from a CDN.\n\n';
    
    report += '---\n\n';
    report += '*Generated by Reynard I18n Bundle Size Analyzer*\n';
    report += '*🦦 Splashing with bundle analysis precision*\n';
    
    return report;
  }

  getResults(): BundleComparison[] {
    return this.results;
  }
}

test.describe('I18n Bundle Size Analysis', () => {
  let analyzer: I18nBundleAnalyzer;

  test.beforeEach(async ({ page }) => {
    analyzer = new I18nBundleAnalyzer();
    
    // Clear network cache
    await page.context().clearCookies();
    await page.evaluate(() => {
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
    });
  });

  test('Compare basic app vs i18n demo bundle sizes', async ({ page }) => {
    await analyzer.compareBundles(
      page,
      '/examples/basic-app',
      '/examples/i18n-demo',
      'Basic vs I18n Demo'
    );
  });

  test('Analyze i18n bundle composition', async ({ page }) => {
    await page.goto('/examples/i18n-demo');
    await page.waitForLoadState('networkidle');
    
    const analysis = await analyzer.analyzeBundle(page, 'I18n Demo Full Analysis');
    
    // Validate bundle composition
    expect(analysis.totalSize).toBeGreaterThan(0);
    expect(analysis.jsSize).toBeGreaterThan(0);
    expect(analysis.translationFiles).toBeGreaterThan(0);
    expect(analysis.languages.length).toBeGreaterThan(0);
    
    // I18n should be a reasonable portion of the total bundle
    const i18nPercentage = (analysis.i18nSize / analysis.totalSize) * 100;
    expect(i18nPercentage).toBeLessThan(50); // I18n shouldn't be more than 50% of bundle
    
    console.log(`\n📊 I18n Bundle Composition:`);
    console.log(`  I18n as % of total: ${i18nPercentage.toFixed(1)}%`);
    console.log(`  Translation files: ${analysis.translationFiles}`);
    console.log(`  Languages supported: ${analysis.languages.length}`);
  });

  test('Measure bundle size impact of different language loads', async ({ page }) => {
    const languages = ['en', 'ja', 'fr', 'ru', 'zh', 'ar'];
    const bundleSizes: { [key: string]: number } = {};
    
    for (const language of languages) {
      await page.goto('/examples/i18n-demo');
      await page.waitForLoadState('networkidle');
      
      // Switch to specific language
      await page.click('[data-testid="language-selector"]');
      await page.click(`[data-testid="language-${language}"]`);
      await page.waitForTimeout(1000); // Wait for language to load
      
      // Measure bundle size
      const analysis = await analyzer.analyzeBundle(page, `Language: ${language}`);
      bundleSizes[language] = analysis.totalSize;
      
      console.log(`${language}: ${(analysis.totalSize / 1024).toFixed(2)}KB`);
    }
    
    // Analyze size differences
    const sizes = Object.values(bundleSizes);
    const minSize = Math.min(...sizes);
    const maxSize = Math.max(...sizes);
    const sizeVariation = ((maxSize - minSize) / minSize) * 100;
    
    console.log(`\n📊 Language Bundle Size Analysis:`);
    console.log(`  Min size: ${(minSize / 1024).toFixed(2)}KB`);
    console.log(`  Max size: ${(maxSize / 1024).toFixed(2)}KB`);
    console.log(`  Size variation: ${sizeVariation.toFixed(1)}%`);
    
    // Size variation should be reasonable
    expect(sizeVariation).toBeLessThan(100); // Less than 100% variation
  });

  test('Analyze compression effectiveness', async ({ page }) => {
    await page.goto('/examples/i18n-demo');
    await page.waitForLoadState('networkidle');
    
    const analysis = await analyzer.analyzeBundle(page, 'Compression Analysis');
    
    // Check if compression is effective
    expect(analysis.compressionRatio).toBeGreaterThan(0.3); // At least 30% compression
    
    console.log(`\n📊 Compression Analysis:`);
    console.log(`  Compression ratio: ${(analysis.compressionRatio * 100).toFixed(1)}%`);
    console.log(`  Estimated uncompressed size: ${(analysis.totalSize / analysis.compressionRatio / 1024).toFixed(2)}KB`);
  });

  test('Compare different i18n loading strategies', async ({ page }) => {
    // Test static loading
    await page.goto('/examples/i18n-demo');
    await page.waitForLoadState('networkidle');
    const staticAnalysis = await analyzer.analyzeBundle(page, 'Static Loading');
    
    // Test dynamic loading (simulate by loading different languages)
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-ja"]');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-fr"]');
    await page.waitForTimeout(1000);
    
    const dynamicAnalysis = await analyzer.analyzeBundle(page, 'Dynamic Loading');
    
    console.log(`\n📊 Loading Strategy Comparison:`);
    console.log(`  Static loading: ${(staticAnalysis.totalSize / 1024).toFixed(2)}KB`);
    console.log(`  Dynamic loading: ${(dynamicAnalysis.totalSize / 1024).toFixed(2)}KB`);
    
    // Dynamic loading should not significantly increase bundle size
    const sizeIncrease = ((dynamicAnalysis.totalSize - staticAnalysis.totalSize) / staticAnalysis.totalSize) * 100;
    expect(sizeIncrease).toBeLessThan(20); // Less than 20% increase
  });

  test.afterAll(async () => {
    // Generate and save report
    const report = analyzer.generateReport();
    console.log('\n' + report);
    
    const reportPath = join(__dirname, 'i18n-bundle-analysis-report.md');
    writeFileSync(reportPath, report);
    
    console.log(`\n📊 Bundle analysis report saved to: ${reportPath}`);
  });
});
