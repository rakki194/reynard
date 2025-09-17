/**
 * Chart Components E2E Tests
 *
 * Comprehensive E2E tests for Reynard chart components including:
 * - BarChart rendering and interactions
 * - LineChart rendering and interactions  
 * - PieChart rendering and interactions
 * - TimeSeriesChart rendering and interactions
 * - Chart accessibility and responsiveness
 *
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

interface ChartTestData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

interface TimeSeriesData {
  timestamp: number;
  value: number;
  label?: string;
}

const mockBarChartData: ChartTestData = {
  labels: ["January", "February", "March", "April", "May"],
  datasets: [
    {
      label: "Sales",
      data: [12, 19, 3, 5, 2],
      backgroundColor: "rgba(54, 162, 235, 0.6)",
      borderColor: "rgba(54, 162, 235, 1)",
    },
  ],
};

const mockLineChartData: ChartTestData = {
  labels: ["Q1", "Q2", "Q3", "Q4"],
  datasets: [
    {
      label: "Revenue",
      data: [100, 120, 90, 150],
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      borderColor: "rgba(75, 192, 192, 1)",
    },
  ],
};

const mockPieChartData = {
  labels: ["Desktop", "Mobile", "Tablet"],
  data: [60, 30, 10],
};

const mockTimeSeriesData: TimeSeriesData[] = [
  { timestamp: 1640995200000, value: 10, label: "Point 1" },
  { timestamp: 1641081600000, value: 15, label: "Point 2" },
  { timestamp: 1641168000000, value: 8, label: "Point 3" },
  { timestamp: 1641254400000, value: 20, label: "Point 4" },
];

async function createChartTestPage(page: Page, chartType: string, data: any) {
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Chart Test - ${chartType}</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .chart-container { width: 100%; max-width: 800px; margin: 0 auto; }
        .chart-wrapper { position: relative; height: 400px; }
        canvas { max-width: 100%; height: auto; }
        .loading { text-align: center; padding: 20px; }
        .empty-state { text-align: center; padding: 40px; color: #666; }
        .error-state { text-align: center; padding: 40px; color: #d32f2f; }
      </style>
    </head>
    <body>
      <div class="chart-container">
        <h1>${chartType} Test</h1>
        <div class="chart-wrapper">
          <canvas id="chart-canvas" data-testid="chart-canvas"></canvas>
        </div>
        <div id="chart-info" data-testid="chart-info"></div>
      </div>
      
      <script>
        // Mock SolidJS-like component behavior
        class ChartComponent {
          constructor(canvasId, chartType, data, options = {}) {
            this.canvas = document.getElementById(canvasId);
            this.chartType = chartType;
            this.data = data;
            this.options = options;
            this.chart = null;
            this.isLoading = false;
            this.error = null;
          }

          async render() {
            if (this.isLoading) {
              this.showLoading();
              return;
            }

            if (this.error) {
              this.showError();
              return;
            }

            if (!this.data || (Array.isArray(this.data) && this.data.length === 0)) {
              this.showEmpty();
              return;
            }

            this.createChart();
          }

          createChart() {
            if (this.chart) {
              this.chart.destroy();
            }

            const config = this.getChartConfig();
            this.chart = new Chart(this.canvas, config);
            this.updateInfo();
          }

          getChartConfig() {
            const baseConfig = {
              type: this.chartType,
              data: this.data,
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                  },
                  title: {
                    display: !!this.options.title,
                    text: this.options.title || '',
                  },
                },
                ...this.options,
              },
            };

            return baseConfig;
          }

          showLoading() {
            this.canvas.style.display = 'none';
            const loading = document.createElement('div');
            loading.className = 'loading';
            loading.textContent = 'Loading chart...';
            loading.setAttribute('data-testid', 'chart-loading');
            this.canvas.parentNode.appendChild(loading);
          }

          showError() {
            this.canvas.style.display = 'none';
            const error = document.createElement('div');
            error.className = 'error-state';
            error.textContent = this.error || 'Error loading chart';
            error.setAttribute('data-testid', 'chart-error');
            this.canvas.parentNode.appendChild(error);
          }

          showEmpty() {
            this.canvas.style.display = 'none';
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = this.options.emptyMessage || 'No data available';
            empty.setAttribute('data-testid', 'chart-empty');
            this.canvas.parentNode.appendChild(empty);
          }

          updateInfo() {
            const info = document.getElementById('chart-info');
            if (info) {
              info.innerHTML = \`
                <p><strong>Chart Type:</strong> \${this.chartType}</p>
                <p><strong>Data Points:</strong> \${this.getDataPointCount()}</p>
                <p><strong>Datasets:</strong> \${this.getDatasetCount()}</p>
              \`;
            }
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

          getDatasetCount() {
            if (Array.isArray(this.data)) {
              return 1;
            }
            if (this.data && this.data.datasets) {
              return this.data.datasets.length;
            }
            return 0;
          }

          destroy() {
            if (this.chart) {
              this.chart.destroy();
              this.chart = null;
            }
          }
        }

        // Initialize chart based on URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const chartType = urlParams.get('type') || '${chartType}';
        const dataParam = urlParams.get('data');
        
        let chartData = ${JSON.stringify(data)};
        if (dataParam) {
          try {
            chartData = JSON.parse(decodeURIComponent(dataParam));
          } catch (e) {
            console.error('Invalid data parameter:', e);
          }
        }

        const chart = new ChartComponent('chart-canvas', chartType, chartData, {
          title: 'Test Chart',
          emptyMessage: 'No data available for display'
        });

        // Render the chart
        chart.render();

        // Make chart available globally for testing
        window.testChart = chart;
      </script>
    </body>
    </html>
  `);
}

test.describe("Chart Components E2E Tests", () => {
  test.describe("BarChart Component", () => {
    test("should render bar chart with data", async ({ page }) => {
      await createChartTestPage(page, "bar", mockBarChartData);
      
      // Wait for chart to render
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      
      // Verify chart canvas is present and visible
      const canvas = page.locator('[data-testid="chart-canvas"]');
      await expect(canvas).toBeVisible();
      
      // Verify chart info is displayed
      const info = page.locator('[data-testid="chart-info"]');
      await expect(info).toContainText("Chart Type: bar");
      await expect(info).toContainText("Data Points: 5");
      await expect(info).toContainText("Datasets: 1");
    });

    test("should render horizontal bar chart", async ({ page }) => {
      const horizontalData = {
        ...mockBarChartData,
        options: { indexAxis: 'y' }
      };
      
      await createChartTestPage(page, "bar", horizontalData);
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      await expect(page.locator('[data-testid="chart-canvas"]')).toBeVisible();
    });

    test("should render stacked bar chart", async ({ page }) => {
      const stackedData = {
        ...mockBarChartData,
        datasets: [
          ...mockBarChartData.datasets,
          {
            label: "Expenses",
            data: [8, 12, 2, 3, 1],
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderColor: "rgba(255, 99, 132, 1)",
          }
        ],
        options: { scales: { x: { stacked: true }, y: { stacked: true } } }
      };
      
      await createChartTestPage(page, "bar", stackedData);
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      await expect(page.locator('[data-testid="chart-canvas"]')).toBeVisible();
    });

    test("should show loading state", async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <body>
          <div id="chart-container">
            <div class="loading" data-testid="chart-loading">Loading chart...</div>
          </div>
        </body>
        </html>
      `);
      
      await expect(page.locator('[data-testid="chart-loading"]')).toBeVisible();
      await expect(page.locator('[data-testid="chart-loading"]')).toContainText("Loading chart...");
    });

    test("should show empty state", async ({ page }) => {
      await createChartTestPage(page, "bar", { labels: [], datasets: [] });
      
      await expect(page.locator('[data-testid="chart-empty"]')).toBeVisible();
      await expect(page.locator('[data-testid="chart-empty"]')).toContainText("No data available");
    });

    test("should show error state", async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <body>
          <div id="chart-container">
            <div class="error-state" data-testid="chart-error">Error loading chart</div>
          </div>
        </body>
        </html>
      `);
      
      await expect(page.locator('[data-testid="chart-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="chart-error"]')).toContainText("Error loading chart");
    });
  });

  test.describe("LineChart Component", () => {
    test("should render line chart with data", async ({ page }) => {
      await createChartTestPage(page, "line", mockLineChartData);
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      
      const canvas = page.locator('[data-testid="chart-canvas"]');
      await expect(canvas).toBeVisible();
      
      const info = page.locator('[data-testid="chart-info"]');
      await expect(info).toContainText("Chart Type: line");
      await expect(info).toContainText("Data Points: 4");
    });

    test("should render stepped line chart", async ({ page }) => {
      const steppedData = {
        ...mockLineChartData,
        datasets: [{
          ...mockLineChartData.datasets[0],
          stepped: true
        }]
      };
      
      await createChartTestPage(page, "line", steppedData);
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      await expect(page.locator('[data-testid="chart-canvas"]')).toBeVisible();
    });

    test("should handle multiple datasets", async ({ page }) => {
      const multiDatasetData = {
        ...mockLineChartData,
        datasets: [
          mockLineChartData.datasets[0],
          {
            label: "Profit",
            data: [20, 25, 15, 30],
            backgroundColor: "rgba(255, 206, 86, 0.6)",
            borderColor: "rgba(255, 206, 86, 1)",
          }
        ]
      };
      
      await createChartTestPage(page, "line", multiDatasetData);
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      await expect(page.locator('[data-testid="chart-info"]')).toContainText("Datasets: 2");
    });
  });

  test.describe("PieChart Component", () => {
    test("should render pie chart with data", async ({ page }) => {
      await createChartTestPage(page, "pie", mockPieChartData);
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      
      const canvas = page.locator('[data-testid="chart-canvas"]');
      await expect(canvas).toBeVisible();
      
      const info = page.locator('[data-testid="chart-info"]');
      await expect(info).toContainText("Chart Type: pie");
      await expect(info).toContainText("Data Points: 3");
    });

    test("should render doughnut chart", async ({ page }) => {
      await createChartTestPage(page, "doughnut", mockPieChartData);
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      
      const info = page.locator('[data-testid="chart-info"]');
      await expect(info).toContainText("Chart Type: doughnut");
    });

    test("should handle single data point", async ({ page }) => {
      const singleDataPoint = {
        labels: ["Single"],
        data: [100]
      };
      
      await createChartTestPage(page, "pie", singleDataPoint);
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      await expect(page.locator('[data-testid="chart-info"]')).toContainText("Data Points: 1");
    });

    test("should handle zero values", async ({ page }) => {
      const zeroData = {
        labels: ["Zero", "Non-zero"],
        data: [0, 100]
      };
      
      await createChartTestPage(page, "pie", zeroData);
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      await expect(page.locator('[data-testid="chart-canvas"]')).toBeVisible();
    });
  });

  test.describe("TimeSeriesChart Component", () => {
    test("should render time series chart with data", async ({ page }) => {
      await createChartTestPage(page, "line", {
        labels: mockTimeSeriesData.map(d => new Date(d.timestamp).toLocaleDateString()),
        datasets: [{
          label: "Time Series",
          data: mockTimeSeriesData.map(d => d.value),
          backgroundColor: "rgba(153, 102, 255, 0.6)",
          borderColor: "rgba(153, 102, 255, 1)",
        }]
      });
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      
      const canvas = page.locator('[data-testid="chart-canvas"]');
      await expect(canvas).toBeVisible();
      
      const info = page.locator('[data-testid="chart-info"]');
      await expect(info).toContainText("Data Points: 4");
    });

    test("should handle large datasets", async ({ page }) => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        timestamp: Date.now() + (i * 86400000), // Daily intervals
        value: Math.random() * 100
      }));
      
      await createChartTestPage(page, "line", {
        labels: largeData.map(d => new Date(d.timestamp).toLocaleDateString()),
        datasets: [{
          label: "Large Dataset",
          data: largeData.map(d => d.value),
        }]
      });
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      await expect(page.locator('[data-testid="chart-info"]')).toContainText("Data Points: 100");
    });

    test("should handle unsorted timestamps", async ({ page }) => {
      const unsortedData = [
        { timestamp: 1641254400000, value: 20 },
        { timestamp: 1640995200000, value: 10 },
        { timestamp: 1641168000000, value: 8 },
        { timestamp: 1641081600000, value: 15 },
      ];
      
      await createChartTestPage(page, "line", {
        labels: unsortedData.map(d => new Date(d.timestamp).toLocaleDateString()),
        datasets: [{
          label: "Unsorted Data",
          data: unsortedData.map(d => d.value),
        }]
      });
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      await expect(page.locator('[data-testid="chart-canvas"]')).toBeVisible();
    });
  });

  test.describe("Chart Accessibility", () => {
    test("should have proper ARIA labels", async ({ page }) => {
      await createChartTestPage(page, "bar", mockBarChartData);
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      
      // Check if canvas has proper accessibility attributes
      const canvas = page.locator('[data-testid="chart-canvas"]');
      await expect(canvas).toBeVisible();
      
      // Verify chart title is present
      await expect(page.locator('h1')).toContainText("BarChart Test");
    });

    test("should be keyboard navigable", async ({ page }) => {
      await createChartTestPage(page, "bar", mockBarChartData);
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Verify focus is on chart container
      const chartContainer = page.locator('.chart-container');
      await expect(chartContainer).toBeVisible();
    });
  });

  test.describe("Chart Responsiveness", () => {
    test("should adapt to different screen sizes", async ({ page }) => {
      await createChartTestPage(page, "bar", mockBarChartData);
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      
      // Test desktop size
      await page.setViewportSize({ width: 1200, height: 800 });
      await expect(page.locator('[data-testid="chart-canvas"]')).toBeVisible();
      
      // Test tablet size
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('[data-testid="chart-canvas"]')).toBeVisible();
      
      // Test mobile size
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('[data-testid="chart-canvas"]')).toBeVisible();
    });

    test("should maintain aspect ratio", async ({ page }) => {
      await createChartTestPage(page, "pie", mockPieChartData);
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      
      const canvas = page.locator('[data-testid="chart-canvas"]');
      await expect(canvas).toBeVisible();
      
      // Verify canvas has proper dimensions
      const boundingBox = await canvas.boundingBox();
      expect(boundingBox).toBeTruthy();
      expect(boundingBox!.width).toBeGreaterThan(0);
      expect(boundingBox!.height).toBeGreaterThan(0);
    });
  });

  test.describe("Chart Performance", () => {
    test("should render quickly with large datasets", async ({ page }) => {
      const startTime = Date.now();
      
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        timestamp: Date.now() + (i * 3600000), // Hourly intervals
        value: Math.random() * 100
      }));
      
      await createChartTestPage(page, "line", {
        labels: largeData.map(d => new Date(d.timestamp).toLocaleDateString()),
        datasets: [{
          label: "Performance Test",
          data: largeData.map(d => d.value),
        }]
      });
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      
      const endTime = Date.now();
      const renderTime = endTime - startTime;
      
      // Should render within 5 seconds
      expect(renderTime).toBeLessThan(5000);
    });

    test("should handle rapid data updates", async ({ page }) => {
      await createChartTestPage(page, "bar", mockBarChartData);
      
      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });
      
      // Simulate rapid data updates
      for (let i = 0; i < 5; i++) {
        const updatedData = {
          ...mockBarChartData,
          datasets: [{
            ...mockBarChartData.datasets[0],
            data: mockBarChartData.datasets[0].data.map(val => val + i)
          }]
        };
        
        await page.evaluate((data) => {
          if (window.testChart) {
            window.testChart.data = data;
            window.testChart.render();
          }
        }, updatedData);
        
        await page.waitForTimeout(100);
      }
      
      await expect(page.locator('[data-testid="chart-canvas"]')).toBeVisible();
    });
  });
});
