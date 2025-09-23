#!/usr/bin/env node

/**
 * 🦊 Performance Test Runner Script
 * 
 * Command-line script to run comprehensive performance tests for the animation system.
 * Provides various options for different testing scenarios and output formats.
 * 
 * Usage:
 *   npm run test:performance
 *   npm run test:performance -- --format=json
 *   npm run test:performance -- --threshold=strict
 *   npm run test:performance -- --regression-check
 * 
 * @author Vulpine (Strategic Fox Specialist)
 * @since 1.0.0
 */

import { PerformanceTestRunner, defaultPerformanceConfig, type PerformanceTestConfig } from "../src/__tests__/performance-test-runner";
import { performance } from "perf_hooks";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

interface CLIOptions {
  format: 'json' | 'html' | 'markdown' | 'console';
  threshold: 'lenient' | 'normal' | 'strict';
  regressionCheck: boolean;
  output: string;
  iterations: number;
  verbose: boolean;
  help: boolean;
}

class PerformanceTestCLI {
  private options: CLIOptions;
  private testRunner: PerformanceTestRunner;
  
  constructor() {
    this.options = this.parseArguments();
    this.testRunner = new PerformanceTestRunner(this.getConfig());
  }
  
  /**
   * Parse command line arguments
   */
  private parseArguments(): CLIOptions {
    const args = process.argv.slice(2);
    const options: CLIOptions = {
      format: 'console',
      threshold: 'normal',
      regressionCheck: false,
      output: './performance-reports',
      iterations: 1000,
      verbose: false,
      help: false,
    };
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--format':
        case '-f':
          const format = args[++i];
          if (['json', 'html', 'markdown', 'console'].includes(format)) {
            options.format = format as CLIOptions['format'];
          } else {
            console.error(`❌ Invalid format: ${format}`);
            process.exit(1);
          }
          break;
          
        case '--threshold':
        case '-t':
          const threshold = args[++i];
          if (['lenient', 'normal', 'strict'].includes(threshold)) {
            options.threshold = threshold as CLIOptions['threshold'];
          } else {
            console.error(`❌ Invalid threshold: ${threshold}`);
            process.exit(1);
          }
          break;
          
        case '--regression-check':
        case '-r':
          options.regressionCheck = true;
          break;
          
        case '--output':
        case '-o':
          options.output = args[++i];
          break;
          
        case '--iterations':
        case '-i':
          const iterations = parseInt(args[++i]);
          if (isNaN(iterations) || iterations <= 0) {
            console.error(`❌ Invalid iterations: ${args[i]}`);
            process.exit(1);
          }
          options.iterations = iterations;
          break;
          
        case '--verbose':
        case '-v':
          options.verbose = true;
          break;
          
        case '--help':
        case '-h':
          options.help = true;
          break;
          
        default:
          console.error(`❌ Unknown option: ${arg}`);
          this.showHelp();
          process.exit(1);
      }
    }
    
    return options;
  }
  
  /**
   * Get configuration based on threshold setting
   */
  private getConfig(): PerformanceTestConfig {
    const config = { ...defaultPerformanceConfig };
    
    // Adjust configuration based on threshold
    switch (this.options.threshold) {
      case 'lenient':
        config.benchmark.threshold = {
          memory: 200, // 200MB
          timing: 5000, // 5s
          frameRate: 20, // 20fps
        };
        config.bundleSize.maxSize = 200 * 1024; // 200KB
        config.monitoring.alertThresholds = {
          memory: { warning: 100 * 1024 * 1024, critical: 200 * 1024 * 1024 }, // 100MB/200MB
          timing: { warning: 5000, critical: 10000 }, // 5s/10s
          frameRate: { warning: 30, critical: 20 }, // 30fps/20fps
        };
        break;
        
      case 'strict':
        config.benchmark.threshold = {
          memory: 25, // 25MB
          timing: 500, // 500ms
          frameRate: 50, // 50fps
        };
        config.bundleSize.maxSize = 25 * 1024; // 25KB
        config.monitoring.alertThresholds = {
          memory: { warning: 25 * 1024 * 1024, critical: 50 * 1024 * 1024 }, // 25MB/50MB
          timing: { warning: 1000, critical: 2000 }, // 1s/2s
          frameRate: { warning: 50, critical: 40 }, // 50fps/40fps
        };
        break;
        
      case 'normal':
      default:
        // Use default configuration
        break;
    }
    
    // Set iterations
    config.benchmark.iterations = this.options.iterations;
    
    // Set output format
    config.reporting.outputFormat = this.options.format === 'console' ? 'markdown' : this.options.format;
    config.reporting.outputPath = this.options.output;
    
    return config;
  }
  
  /**
   * Show help information
   */
  private showHelp(): void {
    console.log(`
🦊 Animation Performance Test Runner

Usage: npm run test:performance [options]

Options:
  -f, --format <format>     Output format (json|html|markdown|console) [default: console]
  -t, --threshold <level>   Performance threshold (lenient|normal|strict) [default: normal]
  -r, --regression-check    Check for performance regressions
  -o, --output <path>       Output directory for reports [default: ./performance-reports]
  -i, --iterations <num>    Number of benchmark iterations [default: 1000]
  -v, --verbose             Verbose output
  -h, --help                Show this help message

Examples:
  npm run test:performance
  npm run test:performance -- --format=json
  npm run test:performance -- --threshold=strict
  npm run test:performance -- --regression-check --verbose
  npm run test:performance -- --output=./reports --format=html

Performance Thresholds:
  lenient:  Relaxed thresholds for development
  normal:   Standard thresholds for production
  strict:   Strict thresholds for performance-critical applications

Output Formats:
  console:  Human-readable console output (default)
  json:     JSON format for programmatic processing
  html:     HTML report with charts and visualizations
  markdown: Markdown format for documentation
    `.trim());
  }
  
  /**
   * Run performance tests
   */
  async run(): Promise<void> {
    if (this.options.help) {
      this.showHelp();
      return;
    }
    
    console.log('🦊 Starting Animation Performance Tests...\n');
    
    if (this.options.verbose) {
      console.log('Configuration:');
      console.log(`  Format: ${this.options.format}`);
      console.log(`  Threshold: ${this.options.threshold}`);
      console.log(`  Iterations: ${this.options.iterations}`);
      console.log(`  Output: ${this.options.output}`);
      console.log(`  Regression Check: ${this.options.regressionCheck}`);
      console.log('');
    }
    
    try {
      const startTime = performance.now();
      
      // Run performance tests
      const result = await this.testRunner.runAllTests();
      
      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      
      // Check for regressions if requested
      if (this.options.regressionCheck) {
        const regressionCheck = this.testRunner.checkForRegressions();
        if (regressionCheck.hasRegression) {
          console.log('⚠️  Performance regression detected!');
          regressionCheck.regressionDetails.forEach(detail => {
            console.log(`  ${detail.metric}: ${detail.changePercentage.toFixed(1)}% change`);
          });
        } else {
          console.log('✅ No performance regressions detected');
        }
        console.log('');
      }
      
      // Output results based on format
      await this.outputResults(result, totalDuration);
      
      // Exit with appropriate code
      if (result.summary.status === 'fail') {
        console.log('❌ Performance tests failed');
        process.exit(1);
      } else if (result.summary.status === 'warning') {
        console.log('⚠️  Performance tests passed with warnings');
        process.exit(0);
      } else {
        console.log('✅ Performance tests passed');
        process.exit(0);
      }
      
    } catch (error) {
      console.error('❌ Performance tests failed with error:', error);
      process.exit(1);
    }
  }
  
  /**
   * Output results in the specified format
   */
  private async outputResults(result: any, totalDuration: number): Promise<void> {
    const timestamp = new Date().toISOString();
    const filename = `performance-report-${timestamp.replace(/[:.]/g, '-')}`;
    
    switch (this.options.format) {
      case 'json':
        await this.outputJSON(result, filename, totalDuration);
        break;
        
      case 'html':
        await this.outputHTML(result, filename, totalDuration);
        break;
        
      case 'markdown':
        await this.outputMarkdown(result, filename, totalDuration);
        break;
        
      case 'console':
      default:
        this.outputConsole(result, totalDuration);
        break;
    }
  }
  
  /**
   * Output results to console
   */
  private outputConsole(result: any, totalDuration: number): void {
    console.log('📊 Performance Test Results');
    console.log('='.repeat(50));
    console.log(`Test ID: ${result.testId}`);
    console.log(`Duration: ${totalDuration.toFixed(2)}ms`);
    console.log(`Overall Score: ${result.summary.overallScore}/100`);
    console.log(`Status: ${result.summary.status.toUpperCase()}`);
    console.log('');
    
    console.log('🏃 Benchmarks:');
    result.benchmarks.forEach((benchmark: any) => {
      const status = benchmark.passed ? '✅' : '❌';
      console.log(`  ${status} ${benchmark.name}: ${benchmark.averageTime}ms (${benchmark.memoryUsage} bytes)`);
    });
    console.log('');
    
    console.log('📦 Bundle Size:');
    console.log(`  Total: ${(result.bundleSize.totalSize / 1024).toFixed(1)}KB`);
    console.log(`  Gzip: ${(result.bundleSize.gzipSize / 1024).toFixed(1)}KB`);
    console.log(`  Compression: ${((1 - result.bundleSize.gzipSize / result.bundleSize.totalSize) * 100).toFixed(1)}%`);
    console.log('');
    
    console.log('📈 Performance Monitoring:');
    console.log(`  Memory: ${(result.monitoring.averageMemoryUsage / 1024 / 1024).toFixed(1)}MB`);
    console.log(`  Load Time: ${result.monitoring.averageLoadTime}ms`);
    console.log(`  Frame Rate: ${result.monitoring.averageFrameRate}fps`);
    console.log(`  Alerts: ${result.monitoring.alerts.length}`);
    console.log('');
    
    if (result.summary.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      result.summary.recommendations.forEach((rec: string) => {
        console.log(`  • ${rec}`);
      });
      console.log('');
    }
  }
  
  /**
   * Output results as JSON
   */
  private async outputJSON(result: any, filename: string, totalDuration: number): Promise<void> {
    const output = {
      ...result,
      totalDuration,
      generatedAt: new Date().toISOString(),
      config: this.getConfig(),
    };
    
    const outputPath = join(this.options.output, `${filename}.json`);
    mkdirSync(this.options.output, { recursive: true });
    writeFileSync(outputPath, JSON.stringify(output, null, 2));
    
    console.log(`📄 JSON report saved to: ${outputPath}`);
  }
  
  /**
   * Output results as HTML
   */
  private async outputHTML(result: any, filename: string, totalDuration: number): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🦊 Animation Performance Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-value { font-size: 2em; font-weight: bold; color: #333; }
        .metric-label { color: #666; font-size: 0.9em; }
        .status-pass { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-fail { color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: 600; }
        .recommendations { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .recommendations h3 { margin-top: 0; color: #1976d2; }
        .recommendations ul { margin: 0; }
        .recommendations li { margin: 8px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🦊 Animation Performance Report</h1>
            <p>Generated: ${new Date().toISOString()}</p>
            <p>Test ID: ${result.testId}</p>
        </div>
        <div class="content">
            <div class="metric">
                <div class="metric-value status-${result.summary.status}">${result.summary.overallScore}/100</div>
                <div class="metric-label">Overall Score</div>
            </div>
            <div class="metric">
                <div class="metric-value">${result.summary.status.toUpperCase()}</div>
                <div class="metric-label">Status</div>
            </div>
            <div class="metric">
                <div class="metric-value">${totalDuration.toFixed(0)}ms</div>
                <div class="metric-label">Duration</div>
            </div>
            
            <h2>🏃 Benchmarks</h2>
            <table>
                <thead>
                    <tr>
                        <th>Test</th>
                        <th>Status</th>
                        <th>Average Time</th>
                        <th>Memory Usage</th>
                    </tr>
                </thead>
                <tbody>
                    ${result.benchmarks.map((benchmark: any) => `
                        <tr>
                            <td>${benchmark.name}</td>
                            <td class="status-${benchmark.passed ? 'pass' : 'fail'}">${benchmark.passed ? '✅ PASS' : '❌ FAIL'}</td>
                            <td>${benchmark.averageTime}ms</td>
                            <td>${benchmark.memoryUsage} bytes</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h2>📦 Bundle Size</h2>
            <table>
                <tr>
                    <td>Total Size</td>
                    <td>${(result.bundleSize.totalSize / 1024).toFixed(1)}KB</td>
                </tr>
                <tr>
                    <td>Gzip Size</td>
                    <td>${(result.bundleSize.gzipSize / 1024).toFixed(1)}KB</td>
                </tr>
                <tr>
                    <td>Compression Ratio</td>
                    <td>${((1 - result.bundleSize.gzipSize / result.bundleSize.totalSize) * 100).toFixed(1)}%</td>
                </tr>
            </table>
            
            <h2>📈 Performance Monitoring</h2>
            <table>
                <tr>
                    <td>Average Memory Usage</td>
                    <td>${(result.monitoring.averageMemoryUsage / 1024 / 1024).toFixed(1)}MB</td>
                </tr>
                <tr>
                    <td>Average Load Time</td>
                    <td>${result.monitoring.averageLoadTime}ms</td>
                </tr>
                <tr>
                    <td>Average Frame Rate</td>
                    <td>${result.monitoring.averageFrameRate}fps</td>
                </tr>
                <tr>
                    <td>Alerts</td>
                    <td>${result.monitoring.alerts.length}</td>
                </tr>
            </table>
            
            ${result.summary.recommendations.length > 0 ? `
                <div class="recommendations">
                    <h3>💡 Recommendations</h3>
                    <ul>
                        ${result.summary.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    </div>
</body>
</html>
    `.trim();
    
    const outputPath = join(this.options.output, `${filename}.html`);
    mkdirSync(this.options.output, { recursive: true });
    writeFileSync(outputPath, html);
    
    console.log(`📄 HTML report saved to: ${outputPath}`);
  }
  
  /**
   * Output results as Markdown
   */
  private async outputMarkdown(result: any, filename: string, totalDuration: number): Promise<void> {
    const markdown = `
# 🦊 Animation Performance Report

**Test ID**: ${result.testId}  
**Generated**: ${new Date().toISOString()}  
**Duration**: ${totalDuration.toFixed(2)}ms  
**Overall Score**: ${result.summary.overallScore}/100  
**Status**: ${result.summary.status.toUpperCase()}

## 📊 Benchmarks

| Test | Status | Average Time | Memory Usage |
|------|--------|--------------|--------------|
${result.benchmarks.map((benchmark: any) => 
  `| ${benchmark.name} | ${benchmark.passed ? '✅ PASS' : '❌ FAIL'} | ${benchmark.averageTime}ms | ${benchmark.memoryUsage} bytes |`
).join('\n')}

## 📦 Bundle Size

- **Total Size**: ${(result.bundleSize.totalSize / 1024).toFixed(1)}KB
- **Gzip Size**: ${(result.bundleSize.gzipSize / 1024).toFixed(1)}KB
- **Compression Ratio**: ${((1 - result.bundleSize.gzipSize / result.bundleSize.totalSize) * 100).toFixed(1)}%

## 📈 Performance Monitoring

- **Average Memory Usage**: ${(result.monitoring.averageMemoryUsage / 1024 / 1024).toFixed(1)}MB
- **Average Load Time**: ${result.monitoring.averageLoadTime}ms
- **Average Frame Rate**: ${result.monitoring.averageFrameRate}fps
- **Alerts**: ${result.monitoring.alerts.length}

${result.summary.recommendations.length > 0 ? `
## 💡 Recommendations

${result.summary.recommendations.map((rec: string) => `- ${rec}`).join('\n')}
` : ''}
    `.trim();
    
    const outputPath = join(this.options.output, `${filename}.md`);
    mkdirSync(this.options.output, { recursive: true });
    writeFileSync(outputPath, markdown);
    
    console.log(`📄 Markdown report saved to: ${outputPath}`);
  }
}

// Run the CLI if this script is executed directly
if (require.main === module) {
  const cli = new PerformanceTestCLI();
  cli.run().catch(error => {
    console.error('❌ CLI execution failed:', error);
    process.exit(1);
  });
}

export { PerformanceTestCLI };
