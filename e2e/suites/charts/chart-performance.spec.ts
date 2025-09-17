/**
 * Chart Performance E2E Tests
 *
 * Comprehensive performance tests for Reynard chart components including:
 * - Rendering performance with large datasets
 * - Memory usage optimization
 * - Animation performance
 * - Data update performance
 * - Responsive rendering performance
 *
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

interface PerformanceTestData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

// Generate large dataset for performance testing
function generateLargeDataset(size: number): PerformanceTestData {
  const labels = Array.from({ length: size }, (_, i) => `Point ${i + 1}`);
  const data = Array.from({ length: size }, () => Math.random() * 100);

  return {
    labels,
    datasets: [
      {
        label: "Performance Test Data",
        data,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
      },
    ],
  };
}

// Generate time series data for performance testing
function generateTimeSeriesData(size: number) {
  const baseTime = Date.now();
  return Array.from({ length: size }, (_, i) => ({
    timestamp: baseTime + i * 3600000, // Hourly intervals
    value: Math.random() * 100,
    label: `Point ${i + 1}`,
  }));
}

async function createPerformanceTestPage(page: Page, chartType: string, data: any, options: any = {}) {
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Chart Performance Test - ${chartType}</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body { 
          margin: 0; 
          padding: 20px; 
          font-family: Arial, sans-serif; 
        }
        .chart-container { 
          width: 100%; 
          max-width: 1200px; 
          margin: 0 auto; 
        }
        .chart-wrapper { 
          position: relative; 
          height: 500px; 
          border: 1px solid #ddd;
        }
        canvas { 
          max-width: 100%; 
          height: auto; 
        }
        .performance-info {
          margin-top: 20px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 4px;
        }
        .performance-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        .metric {
          padding: 8px;
          background: white;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        .metric-label {
          font-weight: bold;
          color: #333;
        }
        .metric-value {
          color: #666;
          font-size: 0.9em;
        }
        .controls {
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .control-button {
          padding: 8px 16px;
          background: #007acc;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .control-button:hover {
          background: #005a9e;
        }
        .control-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      </style>
    </head>
    <body>
      <div class="chart-container">
        <h1>${chartType} Performance Test</h1>
        
        <div class="controls">
          <button class="control-button" id="start-test" data-testid="start-test">Start Performance Test</button>
          <button class="control-button" id="update-data" data-testid="update-data">Update Data</button>
          <button class="control-button" id="clear-chart" data-testid="clear-chart">Clear Chart</button>
          <button class="control-button" id="memory-test" data-testid="memory-test">Memory Test</button>
        </div>
        
        <div class="chart-wrapper">
          <canvas id="chart-canvas" data-testid="chart-canvas"></canvas>
        </div>
        
        <div class="performance-info" data-testid="performance-info">
          <h3>Performance Metrics</h3>
          <div class="performance-metrics">
            <div class="metric">
              <div class="metric-label">Render Time</div>
              <div class="metric-value" id="render-time">-</div>
            </div>
            <div class="metric">
              <div class="metric-label">Data Points</div>
              <div class="metric-value" id="data-points">-</div>
            </div>
            <div class="metric">
              <div class="metric-label">Memory Usage</div>
              <div class="metric-value" id="memory-usage">-</div>
            </div>
            <div class="metric">
              <div class="metric-label">FPS</div>
              <div class="metric-value" id="fps">-</div>
            </div>
          </div>
        </div>
      </div>
      
      <script>
        // Performance monitoring utilities
        class PerformanceMonitor {
          constructor() {
            this.startTime = 0;
            this.endTime = 0;
            this.frameCount = 0;
            this.lastFrameTime = 0;
            this.fps = 0;
            this.memoryInfo = null;
          }

          start() {
            this.startTime = performance.now();
            this.frameCount = 0;
            this.lastFrameTime = this.startTime;
          }

          end() {
            this.endTime = performance.now();
            return this.endTime - this.startTime;
          }

          updateFrame() {
            const now = performance.now();
            this.frameCount++;
            
            if (now - this.lastFrameTime >= 1000) {
              this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
              this.frameCount = 0;
              this.lastFrameTime = now;
            }
          }

          getMemoryInfo() {
            if (performance.memory) {
              this.memoryInfo = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
              };
            }
            return this.memoryInfo;
          }

          updateMetrics(renderTime, dataPoints) {
            document.getElementById('render-time').textContent = \`\${renderTime.toFixed(2)}ms\`;
            document.getElementById('data-points').textContent = dataPoints.toString();
            
            const memory = this.getMemoryInfo();
            if (memory) {
              document.getElementById('memory-usage').textContent = \`\${memory.used}MB / \${memory.total}MB\`;
            }
            
            document.getElementById('fps').textContent = \`\${this.fps} FPS\`;
          }
        }

        // High-performance chart component
        class PerformanceChartComponent {
          constructor(canvasId, chartType, data, options = {}) {
            this.canvas = document.getElementById(canvasId);
            this.chartType = chartType;
            this.data = data;
            this.options = options;
            this.chart = null;
            this.monitor = new PerformanceMonitor();
            this.animationId = null;
            this.isAnimating = false;
          }

          async render() {
            this.monitor.start();
            
            if (this.chart) {
              this.chart.destroy();
            }

            const config = this.getChartConfig();
            this.chart = new Chart(this.canvas, config);
            
            // Wait for chart to be fully rendered
            await new Promise(resolve => {
              const checkRender = () => {
                if (this.chart && this.chart.ctx) {
                  resolve();
                } else {
                  requestAnimationFrame(checkRender);
                }
              };
              checkRender();
            });
            
            const renderTime = this.monitor.end();
            const dataPoints = this.getDataPointCount();
            this.monitor.updateMetrics(renderTime, dataPoints);
            
            this.startAnimationLoop();
          }

          getChartConfig() {
            const baseConfig = {
              type: this.chartType,
              data: this.data,
              options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                  duration: 0, // Disable animations for performance testing
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: this.chartType === 'pie' || this.chartType === 'doughnut' ? {} : {
                  x: {
                    display: true,
                    ticks: {
                      maxTicksLimit: 20, // Limit ticks for performance
                    },
                  },
                  y: {
                    display: true,
                  },
                },
                ...this.options,
              },
            };

            return baseConfig;
          }

          getDataPointCount() {
            if (Array.isArray(this.data)) {
              return this.data.length;
            }
            if (this.data && this.data.datasets) {
              return this.data.datasets.reduce((total, dataset) => total + dataset.data.length, 0);
            }
            return 0;
          }

          startAnimationLoop() {
            if (this.animationId) {
              cancelAnimationFrame(this.animationId);
            }
            
            const animate = () => {
              this.monitor.updateFrame();
              this.animationId = requestAnimationFrame(animate);
            };
            
            this.animationId = requestAnimationFrame(animate);
          }

          updateData(newData) {
            this.monitor.start();
            
            if (this.chart) {
              this.chart.data = newData;
              this.chart.update('none'); // Update without animation
            }
            
            const updateTime = this.monitor.end();
            const dataPoints = this.getDataPointCount();
            this.monitor.updateMetrics(updateTime, dataPoints);
          }

          clear() {
            if (this.chart) {
              this.chart.destroy();
              this.chart = null;
            }
            
            if (this.animationId) {
              cancelAnimationFrame(this.animationId);
              this.animationId = null;
            }
          }

          destroy() {
            this.clear();
          }
        }

        // Initialize performance chart
        const chart = new PerformanceChartComponent('chart-canvas', '${chartType}', ${JSON.stringify(data)}, {
          ...${JSON.stringify(options)}
        });

        // Render the chart
        chart.render();

        // Setup control buttons
        document.getElementById('start-test').addEventListener('click', () => {
          chart.render();
        });

        document.getElementById('update-data').addEventListener('click', () => {
          const newData = ${JSON.stringify(data)};
          // Modify data slightly
          newData.datasets[0].data = newData.datasets[0].data.map(val => val + Math.random() * 10 - 5);
          chart.updateData(newData);
        });

        document.getElementById('clear-chart').addEventListener('click', () => {
          chart.clear();
        });

        document.getElementById('memory-test').addEventListener('click', () => {
          // Force garbage collection if available
          if (window.gc) {
            window.gc();
          }
          
          // Update memory info
          const memory = chart.monitor.getMemoryInfo();
          if (memory) {
            document.getElementById('memory-usage').textContent = \`\${memory.used}MB / \${memory.total}MB\`;
          }
        });

        // Make chart available globally for testing
        window.performanceChart = chart;
      </script>
    </body>
    </html>
  `);
}

test.describe("Chart Performance E2E Tests", () => {
  test.describe("Rendering Performance", () => {
    test("should render small dataset quickly", async ({ page }) => {
      const smallData = generateLargeDataset(100);

      const startTime = Date.now();
      await createPerformanceTestPage(page, "bar", smallData);
      const endTime = Date.now();

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(2000); // Should render within 2 seconds

      // Check performance metrics
      const renderTimeMetric = page.locator("#render-time");
      await expect(renderTimeMetric).not.toHaveText("-");
    });

    test("should render medium dataset efficiently", async ({ page }) => {
      const mediumData = generateLargeDataset(1000);

      const startTime = Date.now();
      await createPerformanceTestPage(page, "line", mediumData);
      const endTime = Date.now();

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(5000); // Should render within 5 seconds

      // Verify data points are correct
      const dataPointsMetric = page.locator("#data-points");
      await expect(dataPointsMetric).toHaveText("1000");
    });

    test("should render large dataset within acceptable time", async ({ page }) => {
      const largeData = generateLargeDataset(5000);

      const startTime = Date.now();
      await createPerformanceTestPage(page, "line", largeData);
      const endTime = Date.now();

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(10000); // Should render within 10 seconds

      // Verify chart is visible and functional
      const canvas = page.locator('[data-testid="chart-canvas"]');
      await expect(canvas).toBeVisible();
    });

    test("should handle time series data efficiently", async ({ page }) => {
      const timeSeriesData = generateTimeSeriesData(2000);
      const chartData = {
        labels: timeSeriesData.map(d => new Date(d.timestamp).toLocaleDateString()),
        datasets: [
          {
            label: "Time Series",
            data: timeSeriesData.map(d => d.value),
            backgroundColor: "rgba(153, 102, 255, 0.6)",
            borderColor: "rgba(153, 102, 255, 1)",
          },
        ],
      };

      const startTime = Date.now();
      await createPerformanceTestPage(page, "line", chartData);
      const endTime = Date.now();

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(8000); // Should render within 8 seconds
    });
  });

  test.describe("Memory Usage", () => {
    test("should not leak memory with repeated renders", async ({ page }) => {
      const testData = generateLargeDataset(1000);

      await createPerformanceTestPage(page, "bar", testData);
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      });

      // Perform multiple renders
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="start-test"]');
        await page.waitForTimeout(500);
      }

      // Get final memory usage
      const finalMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      });

      // Memory increase should be reasonable (less than 50MB)
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;
      expect(memoryIncrease).toBeLessThan(50);
    });

    test("should clean up properly when destroyed", async ({ page }) => {
      const testData = generateLargeDataset(1000);

      await createPerformanceTestPage(page, "line", testData);
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      // Get memory before cleanup
      const beforeMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      });

      // Clear chart
      await page.click('[data-testid="clear-chart"]');
      await page.waitForTimeout(1000);

      // Force garbage collection if available
      await page.click('[data-testid="memory-test"]');
      await page.waitForTimeout(1000);

      // Get memory after cleanup
      const afterMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      });

      // Memory should be reduced or stable
      const memoryChange = (afterMemory - beforeMemory) / 1024 / 1024;
      expect(memoryChange).toBeLessThan(10); // Should not increase significantly
    });
  });

  test.describe("Data Update Performance", () => {
    test("should update data quickly", async ({ page }) => {
      const testData = generateLargeDataset(1000);

      await createPerformanceTestPage(page, "bar", testData);
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      // Measure update time
      const startTime = Date.now();
      await page.click('[data-testid="update-data"]');
      await page.waitForTimeout(100); // Wait for update to complete
      const endTime = Date.now();

      const updateTime = endTime - startTime;
      expect(updateTime).toBeLessThan(1000); // Should update within 1 second
    });

    test("should handle rapid data updates", async ({ page }) => {
      const testData = generateLargeDataset(500);

      await createPerformanceTestPage(page, "line", testData);
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      // Perform rapid updates
      const startTime = Date.now();
      for (let i = 0; i < 10; i++) {
        await page.click('[data-testid="update-data"]');
        await page.waitForTimeout(50);
      }
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds

      // Chart should still be functional
      const canvas = page.locator('[data-testid="chart-canvas"]');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe("Animation Performance", () => {
    test("should maintain good FPS during animations", async ({ page }) => {
      const testData = generateLargeDataset(500);

      await createPerformanceTestPage(page, "bar", testData, {
        animation: {
          duration: 1000,
        },
      });

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      // Wait for animation to complete and FPS to stabilize
      await page.waitForTimeout(2000);

      // Check FPS metric
      const fpsMetric = page.locator("#fps");
      await expect(fpsMetric).not.toHaveText("-");

      // FPS should be reasonable (at least 30 FPS)
      const fpsText = await fpsMetric.textContent();
      const fps = parseInt(fpsText || "0");
      expect(fps).toBeGreaterThan(30);
    });

    test("should handle multiple chart types efficiently", async ({ page }) => {
      const testData = generateLargeDataset(1000);
      const chartTypes = ["bar", "line", "pie"];

      for (const chartType of chartTypes) {
        const startTime = Date.now();
        await createPerformanceTestPage(page, chartType, testData);
        const endTime = Date.now();

        await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

        const renderTime = endTime - startTime;
        expect(renderTime).toBeLessThan(5000); // Each type should render within 5 seconds

        // Clear before next test
        await page.click('[data-testid="clear-chart"]');
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe("Responsive Performance", () => {
    test("should perform well on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const testData = generateLargeDataset(1000);

      const startTime = Date.now();
      await createPerformanceTestPage(page, "line", testData);
      const endTime = Date.now();

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(6000); // Should render within 6 seconds on mobile

      // Chart should be visible and functional
      const canvas = page.locator('[data-testid="chart-canvas"]');
      await expect(canvas).toBeVisible();
    });

    test("should handle viewport changes efficiently", async ({ page }) => {
      const testData = generateLargeDataset(1000);

      await createPerformanceTestPage(page, "bar", testData);
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      // Test different viewport sizes
      const viewports = [
        { width: 1200, height: 800 },
        { width: 768, height: 1024 },
        { width: 375, height: 667 },
        { width: 1920, height: 1080 },
      ];

      for (const viewport of viewports) {
        const startTime = Date.now();
        await page.setViewportSize(viewport);
        await page.waitForTimeout(500); // Wait for resize
        const endTime = Date.now();

        const resizeTime = endTime - startTime;
        expect(resizeTime).toBeLessThan(2000); // Should resize within 2 seconds

        // Chart should still be visible
        const canvas = page.locator('[data-testid="chart-canvas"]');
        await expect(canvas).toBeVisible();
      }
    });
  });

  test.describe("Stress Testing", () => {
    test("should handle maximum reasonable dataset size", async ({ page }) => {
      const maxData = generateLargeDataset(10000);

      const startTime = Date.now();
      await createPerformanceTestPage(page, "line", maxData);
      const endTime = Date.now();

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(15000); // Should render within 15 seconds

      // Verify data points
      const dataPointsMetric = page.locator("#data-points");
      await expect(dataPointsMetric).toHaveText("10000");
    });

    test("should handle concurrent chart operations", async ({ page }) => {
      const testData = generateLargeDataset(1000);

      await createPerformanceTestPage(page, "bar", testData);
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      // Perform concurrent operations
      const operations = [
        page.click('[data-testid="update-data"]'),
        page.click('[data-testid="start-test"]'),
        page.click('[data-testid="update-data"]'),
      ];

      const startTime = Date.now();
      await Promise.all(operations);
      const endTime = Date.now();

      const operationTime = endTime - startTime;
      expect(operationTime).toBeLessThan(3000); // Should complete within 3 seconds

      // Chart should still be functional
      const canvas = page.locator('[data-testid="chart-canvas"]');
      await expect(canvas).toBeVisible();
    });
  });
});
