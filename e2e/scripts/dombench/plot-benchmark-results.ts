/**
 * @fileoverview Benchmark Results Plotting System
 *
 * Generates comprehensive plots of DOMBench results and displays them with imv.
 * Creates beautiful visualizations showing performance differences between rendering techniques.
 *
 * @author Pool-Theorist-35 (Reynard Otter Specialist)
 * @since 1.0.0
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface BenchmarkResult {
  componentCount: number;
  renderTime: number;
  memoryDelta: number;
  domNodes: number;
  approach: string;
  category: string;
  timestamp: number;
}

interface PlotData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
  }[];
}

class BenchmarkPlotter {
  private results: BenchmarkResult[] = [];
  private outputDir: string;

  constructor(outputDir: string = "dombench-results") {
    this.outputDir = outputDir;
    this.ensureOutputDir();
  }

  private ensureOutputDir(): void {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Load benchmark results from JSON file
   */
  loadResults(filePath: string): void {
    try {
      const data = readFileSync(filePath, "utf-8");
      this.results = JSON.parse(data);
      console.log(`🦦 Loaded ${this.results.length} benchmark results from ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to load results from ${filePath}:`, (error as Error).message);
      throw error;
    }
  }

  /**
   * Generate comprehensive performance plots
   */
  async generatePlots(): Promise<void> {
    console.log("🦦 Generating comprehensive benchmark plots...");

    // Generate different types of plots
    await this.generateRenderTimePlot();
    await this.generateMemoryUsagePlot();
    await this.generateDOMNodesPlot();
    await this.generateScalingAnalysisPlot();
    await this.generatePerformanceComparisonPlot();
    await this.generateCategoryBreakdownPlot();
    await this.generateEfficiencyPlot();

    console.log("✅ All plots generated successfully!");
  }

  /**
   * Generate render time performance plot
   */
  private async generateRenderTimePlot(): Promise<void> {
    const plotData = this.prepareRenderTimeData();
    const html = this.createChartHTML(
      "Render Time Performance",
      "Component Count",
      "Render Time (ms)",
      plotData,
      "line"
    );

    const filePath = join(this.outputDir, "render-time-performance.html");
    writeFileSync(filePath, html);
    console.log(`📊 Render time plot saved to: ${filePath}`);
  }

  /**
   * Generate memory usage plot
   */
  private async generateMemoryUsagePlot(): Promise<void> {
    const plotData = this.prepareMemoryUsageData();
    const html = this.createChartHTML("Memory Usage Analysis", "Component Count", "Memory Usage (MB)", plotData, "bar");

    const filePath = join(this.outputDir, "memory-usage-analysis.html");
    writeFileSync(filePath, html);
    console.log(`📊 Memory usage plot saved to: ${filePath}`);
  }

  /**
   * Generate DOM nodes plot
   */
  private async generateDOMNodesPlot(): Promise<void> {
    const plotData = this.prepareDOMNodesData();
    const html = this.createChartHTML("DOM Nodes Analysis", "Component Count", "DOM Nodes", plotData, "bar");

    const filePath = join(this.outputDir, "dom-nodes-analysis.html");
    writeFileSync(filePath, html);
    console.log(`📊 DOM nodes plot saved to: ${filePath}`);
  }

  /**
   * Generate scaling analysis plot
   */
  private async generateScalingAnalysisPlot(): Promise<void> {
    const plotData = this.prepareScalingData();
    const html = this.createChartHTML(
      "Scaling Analysis - Time per Component",
      "Component Count",
      "Time per Component (ms)",
      plotData,
      "line"
    );

    const filePath = join(this.outputDir, "scaling-analysis.html");
    writeFileSync(filePath, html);
    console.log(`📊 Scaling analysis plot saved to: ${filePath}`);
  }

  /**
   * Generate performance comparison plot
   */
  private async generatePerformanceComparisonPlot(): Promise<void> {
    const plotData = this.prepareComparisonData();
    const html = this.createChartHTML(
      "Performance Comparison - All Approaches",
      "Component Count",
      "Render Time (ms)",
      plotData,
      "line"
    );

    const filePath = join(this.outputDir, "performance-comparison.html");
    writeFileSync(filePath, html);
    console.log(`📊 Performance comparison plot saved to: ${filePath}`);
  }

  /**
   * Generate category breakdown plot
   */
  private async generateCategoryBreakdownPlot(): Promise<void> {
    const plotData = this.prepareCategoryData();
    const html = this.createChartHTML(
      "Performance by Component Category",
      "Component Category",
      "Average Render Time (ms)",
      plotData,
      "doughnut"
    );

    const filePath = join(this.outputDir, "category-breakdown.html");
    writeFileSync(filePath, html);
    console.log(`📊 Category breakdown plot saved to: ${filePath}`);
  }

  /**
   * Generate efficiency plot (time per component)
   */
  private async generateEfficiencyPlot(): Promise<void> {
    const plotData = this.prepareEfficiencyData();
    const html = this.createChartHTML(
      "Rendering Efficiency Analysis",
      "Component Count",
      "Efficiency (components/ms)",
      plotData,
      "line"
    );

    const filePath = join(this.outputDir, "efficiency-analysis.html");
    writeFileSync(filePath, html);
    console.log(`📊 Efficiency analysis plot saved to: ${filePath}`);
  }

  /**
   * Prepare render time data for plotting
   */
  private prepareRenderTimeData(): PlotData {
    const approaches = [...new Set(this.results.map(r => r.approach))];
    const componentCounts = [...new Set(this.results.map(r => r.componentCount))].sort((a, b) => a - b);

    const datasets = approaches.map((approach, index) => {
      const colors = this.getApproachColors();
      const color = colors[index % colors.length];

      const data = componentCounts.map(count => {
        const approachResults = this.results.filter(r => r.approach === approach && r.componentCount === count);
        if (approachResults.length === 0) return 0;
        return approachResults.reduce((sum, r) => sum + r.renderTime, 0) / approachResults.length;
      });

      return {
        label: approach.toUpperCase(),
        data,
        borderColor: color.border,
        backgroundColor: color.background,
        fill: false,
      };
    });

    return {
      labels: componentCounts.map(count => count.toString()),
      datasets,
    };
  }

  /**
   * Prepare memory usage data for plotting
   */
  private prepareMemoryUsageData(): PlotData {
    const approaches = [...new Set(this.results.map(r => r.approach))];
    const componentCounts = [...new Set(this.results.map(r => r.componentCount))].sort((a, b) => a - b);

    const datasets = approaches.map((approach, index) => {
      const colors = this.getApproachColors();
      const color = colors[index % colors.length];

      const data = componentCounts.map(count => {
        const approachResults = this.results.filter(r => r.approach === approach && r.componentCount === count);
        if (approachResults.length === 0) return 0;
        return approachResults.reduce((sum, r) => sum + r.memoryDelta, 0) / approachResults.length;
      });

      return {
        label: approach.toUpperCase(),
        data,
        borderColor: color.border,
        backgroundColor: color.background,
        fill: true,
      };
    });

    return {
      labels: componentCounts.map(count => count.toString()),
      datasets,
    };
  }

  /**
   * Prepare DOM nodes data for plotting
   */
  private prepareDOMNodesData(): PlotData {
    const approaches = [...new Set(this.results.map(r => r.approach))];
    const componentCounts = [...new Set(this.results.map(r => r.componentCount))].sort((a, b) => a - b);

    const datasets = approaches.map((approach, index) => {
      const colors = this.getApproachColors();
      const color = colors[index % colors.length];

      const data = componentCounts.map(count => {
        const approachResults = this.results.filter(r => r.approach === approach && r.componentCount === count);
        if (approachResults.length === 0) return 0;
        return approachResults.reduce((sum, r) => sum + r.domNodes, 0) / approachResults.length;
      });

      return {
        label: approach.toUpperCase(),
        data,
        borderColor: color.border,
        backgroundColor: color.background,
        fill: true,
      };
    });

    return {
      labels: componentCounts.map(count => count.toString()),
      datasets,
    };
  }

  /**
   * Prepare scaling analysis data
   */
  private prepareScalingData(): PlotData {
    const approaches = [...new Set(this.results.map(r => r.approach))];
    const componentCounts = [...new Set(this.results.map(r => r.componentCount))].sort((a, b) => a - b);

    const datasets = approaches.map((approach, index) => {
      const colors = this.getApproachColors();
      const color = colors[index % colors.length];

      const data = componentCounts.map(count => {
        const approachResults = this.results.filter(r => r.approach === approach && r.componentCount === count);
        if (approachResults.length === 0) return 0;
        const avgTime = approachResults.reduce((sum, r) => sum + r.renderTime, 0) / approachResults.length;
        return avgTime / count; // Time per component
      });

      return {
        label: approach.toUpperCase(),
        data,
        borderColor: color.border,
        backgroundColor: color.background,
        fill: false,
      };
    });

    return {
      labels: componentCounts.map(count => count.toString()),
      datasets,
    };
  }

  /**
   * Prepare performance comparison data
   */
  private prepareComparisonData(): PlotData {
    return this.prepareRenderTimeData(); // Same as render time data
  }

  /**
   * Prepare category breakdown data
   */
  private prepareCategoryData(): PlotData {
    const categories = [...new Set(this.results.map(r => r.category))];

    const data = categories.map(category => {
      const categoryResults = this.results.filter(r => r.category === category);
      return categoryResults.reduce((sum, r) => sum + r.renderTime, 0) / categoryResults.length;
    });

    const datasets = [
      {
        label: "Average Render Time",
        data,
        borderColor: "#007acc",
        backgroundColor: "rgba(0, 122, 204, 0.1)",
        fill: true,
      },
    ];

    return {
      labels: categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
      datasets,
    };
  }

  /**
   * Prepare efficiency data (components per millisecond)
   */
  private prepareEfficiencyData(): PlotData {
    const approaches = [...new Set(this.results.map(r => r.approach))];
    const componentCounts = [...new Set(this.results.map(r => r.componentCount))].sort((a, b) => a - b);

    const datasets = approaches.map((approach, index) => {
      const colors = this.getApproachColors();
      const color = colors[index % colors.length];

      const data = componentCounts.map(count => {
        const approachResults = this.results.filter(r => r.approach === approach && r.componentCount === count);
        if (approachResults.length === 0) return 0;
        const avgTime = approachResults.reduce((sum, r) => sum + r.renderTime, 0) / approachResults.length;
        return count / avgTime; // Components per millisecond
      });

      return {
        label: approach.toUpperCase(),
        data,
        borderColor: color.border,
        backgroundColor: color.background,
        fill: false,
      };
    });

    return {
      labels: componentCounts.map(count => count.toString()),
      datasets,
    };
  }

  /**
   * Create HTML with Chart.js for plotting
   */
  private createChartHTML(title: string, xLabel: string, yLabel: string, data: PlotData, type: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${title} - DOMBench Results</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #007acc 0%, #005a9e 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .chart-container {
            padding: 40px;
            position: relative;
            height: 600px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 20px 40px;
            background: #f8f9fa;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            text-align: center;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #007acc;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
        .footer {
            background: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 0.9em;
        }
        .otter-emoji {
            font-size: 1.5em;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><span class="otter-emoji">🦦</span>${title}</h1>
            <p>DOMBench Performance Analysis - ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="chart-container">
            <canvas id="performanceChart"></canvas>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${this.results.length}</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${[...new Set(this.results.map(r => r.approach))].length}</div>
                <div class="stat-label">Rendering Approaches</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${[...new Set(this.results.map(r => r.componentCount))].length}</div>
                <div class="stat-label">Component Counts</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Math.round((this.results.reduce((sum, r) => sum + r.renderTime, 0) / this.results.length) * 100) / 100}</div>
                <div class="stat-label">Avg Render Time (ms)</div>
            </div>
        </div>

        <div class="footer">
            <p>🦦 Generated by DOMBench Plotting System - Reynard Framework</p>
        </div>
    </div>

    <script>
        const ctx = document.getElementById('performanceChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: '${type}',
            data: ${JSON.stringify(data)},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '${title}',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: '#007acc',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: '${xLabel}',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: '${yLabel}',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    </script>
</body>
</html>`;
  }

  /**
   * Get color scheme for different approaches
   */
  private getApproachColors(): Array<{ border: string; background: string }> {
    return [
      { border: "#007acc", background: "rgba(0, 122, 204, 0.1)" }, // CSR - Blue
      { border: "#28a745", background: "rgba(40, 167, 69, 0.1)" }, // Lazy - Green
      { border: "#ffc107", background: "rgba(255, 193, 7, 0.1)" }, // Virtual - Yellow
      { border: "#dc3545", background: "rgba(220, 53, 69, 0.1)" }, // Batch - Red
      { border: "#6f42c1", background: "rgba(111, 66, 193, 0.1)" }, // Purple
      { border: "#fd7e14", background: "rgba(253, 126, 20, 0.1)" }, // Orange
    ];
  }

  /**
   * Get color scheme for different categories
   */
  private getCategoryColors(): Array<{ border: string; background: string }> {
    return [
      { border: "#007acc", background: "rgba(0, 122, 204, 0.8)" }, // Primitives - Blue
      { border: "#28a745", background: "rgba(40, 167, 69, 0.8)" }, // Layouts - Green
      { border: "#ffc107", background: "rgba(255, 193, 7, 0.8)" }, // Data - Yellow
      { border: "#dc3545", background: "rgba(220, 53, 69, 0.8)" }, // Overlays - Red
    ];
  }

  /**
   * Display plots using Playwright browser
   */
  async displayPlots(): Promise<void> {
    console.log("🦦 Displaying benchmark plots with Playwright browser...");

    const plotFiles = [
      "render-time-performance.html",
      "memory-usage-analysis.html",
      "dom-nodes-analysis.html",
      "scaling-analysis.html",
      "performance-comparison.html",
      "category-breakdown.html",
      "efficiency-analysis.html",
    ];

    try {
      // Import Playwright dynamically
      const { chromium } = await import("@playwright/test");

      // Launch browser
      const browser = await chromium.launch({
        headless: false, // Show the browser
        slowMo: 1000, // Slow down for better viewing
      });

      const context = await browser.newContext();
      const page = await context.newPage();

      for (const file of plotFiles) {
        const filePath = join(this.outputDir, file);
        if (existsSync(filePath)) {
          try {
            console.log(`📊 Opening ${file} in browser...`);

            // Convert to file:// URL with absolute path
            const { resolve } = await import("path");
            const absolutePath = resolve(filePath);
            const fileUrl = `file://${absolutePath}`;
            await page.goto(fileUrl);

            // Wait a bit for the chart to render
            await page.waitForTimeout(2000);

            // Take a screenshot for reference
            const screenshotPath = join(this.outputDir, `${file.replace(".html", "")}-screenshot.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`📸 Screenshot saved: ${screenshotPath}`);

            // Wait for user to view (or auto-close after 5 seconds)
            console.log(`⏳ Viewing ${file} for 5 seconds...`);
            await page.waitForTimeout(5000);
          } catch (error) {
            console.log(`⚠️  Could not open ${file}: ${(error as Error).message}`);
          }
        }
      }

      await browser.close();
      console.log("✅ Plot display complete!");
    } catch (error) {
      console.log(`⚠️  Could not launch browser: ${(error as Error).message}`);
      console.log("📁 You can manually open the HTML files in your browser from the dombench-results/ directory");
    }
  }

  /**
   * Generate summary report
   */
  generateSummaryReport(): string {
    const approaches = [...new Set(this.results.map(r => r.approach))];
    const categories = [...new Set(this.results.map(r => r.category))];
    const componentCounts = [...new Set(this.results.map(r => r.componentCount))].sort((a, b) => a - b);

    let report = "\n🦦 DOMBENCH PERFORMANCE SUMMARY REPORT\n";
    report += "=".repeat(50) + "\n\n";

    report += `📊 Test Overview:\n`;
    report += `  Total Tests: ${this.results.length}\n`;
    report += `  Approaches: ${approaches.join(", ")}\n`;
    report += `  Categories: ${categories.join(", ")}\n`;
    report += `  Component Counts: ${componentCounts.join(", ")}\n\n`;

    report += `📈 Performance by Approach:\n`;
    approaches.forEach(approach => {
      const approachResults = this.results.filter(r => r.approach === approach);
      const avgTime = approachResults.reduce((sum, r) => sum + r.renderTime, 0) / approachResults.length;
      const avgMemory = approachResults.reduce((sum, r) => sum + r.memoryDelta, 0) / approachResults.length;
      const avgNodes = approachResults.reduce((sum, r) => sum + r.domNodes, 0) / approachResults.length;

      report += `  ${approach.toUpperCase()}:\n`;
      report += `    Average Render Time: ${avgTime.toFixed(2)}ms\n`;
      report += `    Average Memory Usage: ${avgMemory.toFixed(2)}MB\n`;
      report += `    Average DOM Nodes: ${avgNodes.toFixed(0)}\n\n`;
    });

    report += `📊 Best Performance:\n`;
    const bestApproach = approaches.reduce((best, approach) => {
      const approachResults = this.results.filter(r => r.approach === approach);
      const avgTime = approachResults.reduce((sum, r) => sum + r.renderTime, 0) / approachResults.length;
      const bestTime =
        this.results.filter(r => r.approach === best).reduce((sum, r) => sum + r.renderTime, 0) /
        this.results.filter(r => r.approach === best).length;
      return avgTime < bestTime ? approach : best;
    });

    const bestResults = this.results.filter(r => r.approach === bestApproach);
    const bestTime = bestResults.reduce((sum, r) => sum + r.renderTime, 0) / bestResults.length;

    report += `  Fastest Approach: ${bestApproach.toUpperCase()} (${bestTime.toFixed(2)}ms average)\n`;
    report += `  Most Memory Efficient: ${approaches
      .reduce((best, approach) => {
        const approachResults = this.results.filter(r => r.approach === approach);
        const avgMemory = approachResults.reduce((sum, r) => sum + r.memoryDelta, 0) / approachResults.length;
        const bestMemory =
          this.results.filter(r => r.approach === best).reduce((sum, r) => sum + r.memoryDelta, 0) /
          this.results.filter(r => r.approach === best).length;
        return avgMemory < bestMemory ? approach : best;
      })
      .toUpperCase()}\n\n`;

    report += `📁 Generated Files:\n`;
    const plotFiles = [
      "render-time-performance.html",
      "memory-usage-analysis.html",
      "dom-nodes-analysis.html",
      "scaling-analysis.html",
      "performance-comparison.html",
      "category-breakdown.html",
      "efficiency-analysis.html",
    ];

    plotFiles.forEach(file => {
      const filePath = join(this.outputDir, file);
      if (existsSync(filePath)) {
        report += `  ✅ ${file}\n`;
      } else {
        report += `  ❌ ${file}\n`;
      }
    });

    return report;
  }
}

/**
 * Main execution function
 */
export async function plotBenchmarkResults(resultsFile?: string): Promise<void> {
  const plotter = new BenchmarkPlotter();

  // Find the most recent results file if not specified
  if (!resultsFile) {
    const resultsDir = "dombench-results";
    if (existsSync(resultsDir)) {
      const files = execSync(`ls -t ${resultsDir}/*.json 2>/dev/null || true`, { encoding: "utf-8" })
        .trim()
        .split("\n");
      if (files.length > 0 && files[0]) {
        resultsFile = files[0];
      }
    }
  }

  if (!resultsFile || !existsSync(resultsFile)) {
    console.error("❌ No benchmark results file found. Please run DOMBench first.");
    return;
  }

  try {
    plotter.loadResults(resultsFile);
    await plotter.generatePlots();

    const summary = plotter.generateSummaryReport();
    console.log(summary);

    // Save summary to file
    const summaryPath = join(plotter["outputDir"], "benchmark-summary.txt");
    writeFileSync(summaryPath, summary);
    console.log(`📄 Summary report saved to: ${summaryPath}`);

    // Display plots
    await plotter.displayPlots();
  } catch (error) {
    console.error("❌ Failed to generate plots:", (error as Error).message);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const resultsFile = process.argv[2];
  plotBenchmarkResults(resultsFile).catch(console.error);
}
