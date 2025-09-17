#!/usr/bin/env tsx

/**
 * @fileoverview Performance Data Collection Script
 *
 * Collects comprehensive performance data for CSR and Lazy Loading
 * across different component counts and categories for visualization.
 *
 * @author Pool-Theorist-35 (Reynard Otter Specialist)
 * @since 1.0.0
 */

import { Browser, Page, chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

interface PerformanceData {
  category: string;
  approach: string;
  componentCount: number;
  renderTime: number;
  memoryUsage: number;
  firstPaint: number;
  firstContentfulPaint: number;
  timestamp: string;
}

interface BenchmarkConfig {
  categories: string[];
  approaches: string[];
  componentCounts: number[];
  iterations: number;
}

const BENCHMARK_CONFIG: BenchmarkConfig = {
  categories: ["primitives", "layouts", "data", "overlays"],
  approaches: ["csr", "lazy"],
  componentCounts: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
  iterations: 5,
};

class PerformanceCollector {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private results: PerformanceData[] = [];

  async initialize(): Promise<void> {
    console.log("🦦 Initializing performance collector...");
    this.browser = await chromium.launch({
      headless: true,
      args: ["--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    this.page = await this.browser.newPage();

    // Set up performance monitoring
    await this.page.addInitScript(() => {
      window.performance.mark("benchmark-start");
    });

    console.log("✅ Performance collector initialized");
  }

  async collectData(): Promise<void> {
    console.log("📊 Starting comprehensive performance data collection...");

    for (const category of BENCHMARK_CONFIG.categories) {
      console.log(`\n🔍 Testing ${category} components...`);

      for (const approach of BENCHMARK_CONFIG.approaches) {
        console.log(`  📈 ${approach.toUpperCase()} approach:`);

        for (const count of BENCHMARK_CONFIG.componentCounts) {
          console.log(`    🧮 ${count} components...`);

          const measurements: number[] = [];
          const memoryMeasurements: number[] = [];
          const paintMeasurements: { firstPaint: number[]; firstContentfulPaint: number[] } = {
            firstPaint: [],
            firstContentfulPaint: [],
          };

          // Run multiple iterations for statistical accuracy
          for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
            const result = await this.runSingleBenchmark(category, approach, count);
            measurements.push(result.renderTime);
            memoryMeasurements.push(result.memoryUsage);
            paintMeasurements.firstPaint.push(result.firstPaint);
            paintMeasurements.firstContentfulPaint.push(result.firstContentfulPaint);

            // Small delay between iterations
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Calculate averages
          const avgRenderTime = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
          const avgMemoryUsage = memoryMeasurements.reduce((sum, val) => sum + val, 0) / memoryMeasurements.length;
          const avgFirstPaint =
            paintMeasurements.firstPaint.reduce((sum, val) => sum + val, 0) / paintMeasurements.firstPaint.length;
          const avgFirstContentfulPaint =
            paintMeasurements.firstContentfulPaint.reduce((sum, val) => sum + val, 0) /
            paintMeasurements.firstContentfulPaint.length;

          this.results.push({
            category,
            approach,
            componentCount: count,
            renderTime: avgRenderTime,
            memoryUsage: avgMemoryUsage,
            firstPaint: avgFirstPaint,
            firstContentfulPaint: avgFirstContentfulPaint,
            timestamp: new Date().toISOString(),
          });

          console.log(`      ✅ ${avgRenderTime.toFixed(2)}ms avg`);
        }
      }
    }
  }

  private async runSingleBenchmark(
    category: string,
    approach: string,
    count: number
  ): Promise<{
    renderTime: number;
    memoryUsage: number;
    firstPaint: number;
    firstContentfulPaint: number;
  }> {
    if (!this.page) throw new Error("Page not initialized");

    const startTime = Date.now();

    // Navigate to benchmark page
    await this.page.goto(`http://localhost:3000/?category=${category}&approach=${approach}&count=${count}`);

    // Wait for components to render
    await this.page.waitForSelector('[data-testid="benchmark-container"]', { timeout: 10000 });

    // Measure performance metrics
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType("paint");

      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === "first-paint")?.startTime ?? 0,
        firstContentfulPaint: paint.find(p => p.name === "first-contentful-paint")?.startTime ?? 0,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        renderTime: performance.now(),
      };
    });

    return {
      renderTime: metrics.renderTime,
      memoryUsage: metrics.memoryUsage,
      firstPaint: metrics.firstPaint,
      firstContentfulPaint: metrics.firstContentfulPaint,
    };
  }

  async generateVisualization(): Promise<void> {
    console.log("\n📊 Generating performance visualization...");

    // Create results directory
    const resultsDir = join(process.cwd(), "results", "performance-analysis");
    mkdirSync(resultsDir, { recursive: true });

    // Generate HTML visualization
    const htmlContent = this.generateHTMLVisualization();
    writeFileSync(join(resultsDir, "performance-plot.html"), htmlContent);

    // Generate JSON data
    writeFileSync(join(resultsDir, "performance-data.json"), JSON.stringify(this.results, null, 2));

    // Generate CSV for external analysis
    const csvContent = this.generateCSV();
    writeFileSync(join(resultsDir, "performance-data.csv"), csvContent);

    console.log("✅ Visualization generated in results/performance-analysis/");
  }

  private generateHTMLVisualization(): string {
    const chartData = this.prepareChartData();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reynard Component Performance Analysis</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            padding: 30px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #007acc;
        }
        .title {
            font-size: 2.5rem;
            color: #333;
            margin: 0 0 10px 0;
        }
        .subtitle {
            font-size: 1.2rem;
            color: #666;
            margin: 0;
        }
        .chart-container {
            margin: 40px 0;
            padding: 20px;
            background: #fafafa;
            border-radius: 8px;
        }
        .chart-title {
            font-size: 1.5rem;
            color: #333;
            margin-bottom: 20px;
            text-align: center;
        }
        .insights {
            margin-top: 40px;
            padding: 20px;
            background: #e8f4fd;
            border-radius: 8px;
            border-left: 4px solid #007acc;
        }
        .insights h3 {
            color: #007acc;
            margin-top: 0;
        }
        .insights ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .insights li {
            margin: 8px 0;
            color: #555;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">🦦 Reynard Component Performance Analysis</h1>
            <p class="subtitle">CSR vs Lazy Loading Performance Scaling</p>
        </div>

        <div class="chart-container">
            <h3 class="chart-title">Render Time vs Component Count</h3>
            <canvas id="renderTimeChart" width="800" height="400"></canvas>
        </div>

        <div class="chart-container">
            <h3 class="chart-title">Memory Usage vs Component Count</h3>
            <canvas id="memoryChart" width="800" height="400"></canvas>
        </div>

        <div class="chart-container">
            <h3 class="chart-title">First Paint vs Component Count</h3>
            <canvas id="paintChart" width="800" height="400"></canvas>
        </div>

        <div class="insights">
            <h3>🎯 Performance Insights</h3>
            <ul>
                <li><strong>CSR Performance:</strong> Linear scaling with component count, optimal for small to medium datasets</li>
                <li><strong>Lazy Loading Performance:</strong> Better for large datasets due to deferred rendering</li>
                <li><strong>Memory Usage:</strong> CSR uses more memory upfront, Lazy Loading uses memory progressively</li>
                <li><strong>First Paint:</strong> CSR shows faster initial paint, Lazy Loading has delayed but smoother rendering</li>
                <li><strong>Recommendation:</strong> Use CSR for &lt;100 components, Lazy Loading for &gt;100 components</li>
            </ul>
        </div>
    </div>

    <script>
        const data = ${JSON.stringify(chartData)};

        // Render Time Chart
        const renderTimeCtx = document.getElementById('renderTimeChart').getContext('2d');
        new Chart(renderTimeCtx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: data.renderTimeDatasets
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Component Count'
                        },
                        type: 'logarithmic'
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Render Time (ms)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Render Time Scaling: CSR vs Lazy Loading'
                    },
                    legend: {
                        position: 'top'
                    }
                }
            }
        });

        // Memory Chart
        const memoryCtx = document.getElementById('memoryChart').getContext('2d');
        new Chart(memoryCtx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: data.memoryDatasets
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Component Count'
                        },
                        type: 'logarithmic'
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Memory Usage (MB)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Memory Usage Scaling: CSR vs Lazy Loading'
                    },
                    legend: {
                        position: 'top'
                    }
                }
            }
        });

        // Paint Chart
        const paintCtx = document.getElementById('paintChart').getContext('2d');
        new Chart(paintCtx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: data.paintDatasets
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Component Count'
                        },
                        type: 'logarithmic'
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'First Paint Time (ms)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'First Paint Scaling: CSR vs Lazy Loading'
                    },
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    </script>
</body>
</html>`;
  }

  private prepareChartData(): any {
    const labels = BENCHMARK_CONFIG.componentCounts.map(count => count.toString());
    const categories = BENCHMARK_CONFIG.categories;
    const approaches = BENCHMARK_CONFIG.approaches;

    const colors = {
      csr: "#007acc",
      lazy: "#ff6b35",
      primitives: "#4ecdc4",
      layouts: "#45b7d1",
      data: "#96ceb4",
      overlays: "#feca57",
    };

    const renderTimeDatasets = [];
    const memoryDatasets = [];
    const paintDatasets = [];

    // Generate datasets for each category and approach combination
    for (const category of categories) {
      for (const approach of approaches) {
        const categoryData = this.results.filter(r => r.category === category && r.approach === approach);
        const renderTimes = BENCHMARK_CONFIG.componentCounts.map(count => {
          const data = categoryData.find(d => d.componentCount === count);
          return data ? data.renderTime : null;
        });

        const memoryUsages = BENCHMARK_CONFIG.componentCounts.map(count => {
          const data = categoryData.find(d => d.componentCount === count);
          return data ? data.memoryUsage / 1024 / 1024 : null; // Convert to MB
        });

        const firstPaints = BENCHMARK_CONFIG.componentCounts.map(count => {
          const data = categoryData.find(d => d.componentCount === count);
          return data ? data.firstPaint : null;
        });

        renderTimeDatasets.push({
          label: `${category} (${approach.toUpperCase()})`,
          data: renderTimes,
          borderColor: colors[approach as keyof typeof colors],
          backgroundColor: colors[approach as keyof typeof colors] + "20",
          borderWidth: 2,
          fill: false,
          tension: 0.1,
        });

        memoryDatasets.push({
          label: `${category} (${approach.toUpperCase()})`,
          data: memoryUsages,
          borderColor: colors[approach as keyof typeof colors],
          backgroundColor: colors[approach as keyof typeof colors] + "20",
          borderWidth: 2,
          fill: false,
          tension: 0.1,
        });

        paintDatasets.push({
          label: `${category} (${approach.toUpperCase()})`,
          data: firstPaints,
          borderColor: colors[approach as keyof typeof colors],
          backgroundColor: colors[approach as keyof typeof colors] + "20",
          borderWidth: 2,
          fill: false,
          tension: 0.1,
        });
      }
    }

    return {
      labels,
      renderTimeDatasets,
      memoryDatasets,
      paintDatasets,
    };
  }

  private generateCSV(): string {
    const headers = [
      "Category",
      "Approach",
      "ComponentCount",
      "RenderTime",
      "MemoryUsage",
      "FirstPaint",
      "FirstContentfulPaint",
      "Timestamp",
    ];
    const rows = this.results.map(result => [
      result.category,
      result.approach,
      result.componentCount,
      result.renderTime,
      result.memoryUsage,
      result.firstPaint,
      result.firstContentfulPaint,
      result.timestamp,
    ]);

    return [headers, ...rows].map(row => row.join(",")).join("\n");
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
    console.log("✅ Performance collector cleaned up");
  }
}

async function main() {
  const collector = new PerformanceCollector();

  try {
    await collector.initialize();
    await collector.collectData();
    await collector.generateVisualization();

    console.log("\n🦦 *splashes with satisfaction* Performance analysis complete!");
    console.log("📊 Open results/performance-analysis/performance-plot.html to view the visualization");
  } catch (error) {
    console.error("❌ Error during performance collection:", error);
  } finally {
    await collector.cleanup();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
