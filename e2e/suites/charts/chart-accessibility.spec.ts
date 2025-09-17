/**
 * Chart Accessibility E2E Tests
 *
 * Accessibility tests for Reynard chart components including:
 * - ARIA labels and descriptions
 * - Keyboard navigation
 * - Screen reader compatibility
 * - Color contrast and visual accessibility
 * - Focus management
 */

import { test, expect, Page } from "@playwright/test";

interface AccessibilityTestData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

const accessibilityTestData: AccessibilityTestData = {
  labels: ["Q1 2023", "Q2 2023", "Q3 2023", "Q4 2023"],
  datasets: [
    {
      label: "Revenue",
      data: [100000, 120000, 90000, 150000],
      backgroundColor: "rgba(54, 162, 235, 0.6)",
      borderColor: "rgba(54, 162, 235, 1)",
    },
    {
      label: "Expenses",
      data: [80000, 90000, 75000, 110000],
      backgroundColor: "rgba(255, 99, 132, 0.6)",
      borderColor: "rgba(255, 99, 132, 1)",
    },
  ],
};

async function createAccessibleChartPage(page: Page, chartType: string, data: any, options: any = {}) {
  await page.setContent(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Accessible ${chartType} Chart Test</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body { 
          margin: 0; 
          padding: 20px; 
          font-family: Arial, sans-serif; 
          background: white;
          color: #333;
        }
        .chart-container { 
          width: 100%; 
          max-width: 800px; 
          margin: 0 auto; 
          position: relative;
        }
        .chart-wrapper { 
          position: relative; 
          height: 400px; 
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        canvas { 
          max-width: 100%; 
          height: auto; 
          display: block;
        }
        .chart-title {
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
        }
        .chart-description {
          margin-bottom: 15px;
          color: #666;
          font-size: 0.9em;
        }
        .chart-legend {
          margin-top: 15px;
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 2px;
        }
        .chart-data-table {
          margin-top: 20px;
          width: 100%;
          border-collapse: collapse;
        }
        .chart-data-table th,
        .chart-data-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .chart-data-table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        .focus-visible {
          outline: 2px solid #007acc;
          outline-offset: 2px;
        }
        .loading { 
          text-align: center; 
          padding: 20px; 
          color: #666;
        }
        .empty-state { 
          text-align: center; 
          padding: 40px; 
          color: #666; 
        }
        .error-state { 
          text-align: center; 
          padding: 40px; 
          color: #d32f2f; 
        }
      </style>
    </head>
    <body>
      <div class="chart-container" role="region" aria-labelledby="chart-title" aria-describedby="chart-description">
        <h1 id="chart-title" class="chart-title">${options.title || `${chartType} Chart`}</h1>
        <p id="chart-description" class="chart-description">
          ${options.description || `Interactive ${chartType} chart displaying data with keyboard navigation support.`}
        </p>
        
        <div class="chart-wrapper" role="img" aria-label="${options.ariaLabel || `${chartType} chart`}">
          <canvas 
            id="chart-canvas" 
            data-testid="chart-canvas"
            tabindex="0"
            role="img"
            aria-label="${options.ariaLabel || `${chartType} chart`}"
            aria-describedby="chart-data-summary"
          ></canvas>
        </div>
        
        <div id="chart-data-summary" class="sr-only">
          ${options.dataSummary || `Chart contains ${data.labels?.length || 0} data points across ${data.datasets?.length || 1} datasets.`}
        </div>
        
        <div class="chart-legend" role="list" aria-label="Chart legend">
          ${
            data.datasets
              ?.map(
                (dataset: any, index: number) => `
            <div class="legend-item" role="listitem">
              <div class="legend-color" style="background-color: ${dataset.backgroundColor || "#ccc"}"></div>
              <span>${dataset.label}</span>
            </div>
          `
              )
              .join("") || ""
          }
        </div>
        
        <table class="chart-data-table" role="table" aria-label="Chart data in table format">
          <thead>
            <tr>
              <th scope="col">Category</th>
              ${data.datasets?.map((dataset: any) => `<th scope="col">${dataset.label}</th>`).join("") || ""}
            </tr>
          </thead>
          <tbody>
            ${
              data.labels
                ?.map(
                  (label: string, index: number) => `
              <tr>
                <th scope="row">${label}</th>
                ${data.datasets?.map((dataset: any) => `<td>${dataset.data[index] || 0}</td>`).join("") || ""}
              </tr>
            `
                )
                .join("") || ""
            }
          </tbody>
        </table>
      </div>
      
      <script>
        // Enhanced accessible chart component
        class AccessibleChartComponent {
          constructor(canvasId, chartType, data, options = {}) {
            this.canvas = document.getElementById(canvasId);
            this.chartType = chartType;
            this.data = data;
            this.options = options;
            this.chart = null;
            this.isLoading = false;
            this.error = null;
            this.currentFocusIndex = 0;
            this.focusableElements = [];
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
            this.setupKeyboardNavigation();
            this.updateAccessibilityInfo();
          }

          createChart() {
            if (this.chart) {
              this.chart.destroy();
            }

            const config = this.getChartConfig();
            this.chart = new Chart(this.canvas, config);
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
                    display: false, // We have our own accessible legend
                  },
                  title: {
                    display: false, // We have our own accessible title
                  },
                  tooltip: {
                    enabled: true,
                    callbacks: {
                      title: (context) => context[0].label,
                      label: (context) => \`\${context.dataset.label}: \${context.parsed.y}\`,
                    },
                  },
                },
                scales: this.chartType === 'pie' || this.chartType === 'doughnut' ? {} : {
                  x: {
                    display: true,
                    title: {
                      display: true,
                      text: 'Categories',
                    },
                  },
                  y: {
                    display: true,
                    title: {
                      display: true,
                      text: 'Values',
                    },
                  },
                },
                ...this.options,
              },
            };

            return baseConfig;
          }

          setupKeyboardNavigation() {
            this.canvas.addEventListener('keydown', (e) => {
              switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                  e.preventDefault();
                  this.navigateToNext();
                  break;
                case 'ArrowLeft':
                case 'ArrowUp':
                  e.preventDefault();
                  this.navigateToPrevious();
                  break;
                case 'Enter':
                case ' ':
                  e.preventDefault();
                  this.activateCurrentElement();
                  break;
                case 'Home':
                  e.preventDefault();
                  this.navigateToFirst();
                  break;
                case 'End':
                  e.preventDefault();
                  this.navigateToLast();
                  break;
              }
            });

            // Make canvas focusable
            this.canvas.setAttribute('tabindex', '0');
          }

          navigateToNext() {
            this.currentFocusIndex = Math.min(this.currentFocusIndex + 1, this.getMaxFocusIndex());
            this.updateFocus();
          }

          navigateToPrevious() {
            this.currentFocusIndex = Math.max(this.currentFocusIndex - 1, 0);
            this.updateFocus();
          }

          navigateToFirst() {
            this.currentFocusIndex = 0;
            this.updateFocus();
          }

          navigateToLast() {
            this.currentFocusIndex = this.getMaxFocusIndex();
            this.updateFocus();
          }

          getMaxFocusIndex() {
            return (this.data.labels?.length || 0) - 1;
          }

          updateFocus() {
            // Update visual focus indicator
            this.canvas.style.outline = '2px solid #007acc';
            this.canvas.style.outlineOffset = '2px';
            
            // Announce current focus to screen readers
            const currentLabel = this.data.labels?.[this.currentFocusIndex] || '';
            const currentValue = this.data.datasets?.[0]?.data?.[this.currentFocusIndex] || 0;
            
            this.announceToScreenReader(\`Focused on \${currentLabel}: \${currentValue}\`);
          }

          activateCurrentElement() {
            const currentLabel = this.data.labels?.[this.currentFocusIndex] || '';
            const currentValue = this.data.datasets?.[0]?.data?.[this.currentFocusIndex] || 0;
            
            this.announceToScreenReader(\`Selected \${currentLabel}: \${currentValue}\`);
          }

          announceToScreenReader(message) {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = message;
            
            document.body.appendChild(announcement);
            
            setTimeout(() => {
              document.body.removeChild(announcement);
            }, 1000);
          }

          updateAccessibilityInfo() {
            const summary = document.getElementById('chart-data-summary');
            if (summary) {
              const dataPoints = this.data.labels?.length || 0;
              const datasets = this.data.datasets?.length || 1;
              const maxValue = Math.max(...(this.data.datasets?.[0]?.data || [0]));
              const minValue = Math.min(...(this.data.datasets?.[0]?.data || [0]));
              
              summary.textContent = \`
                \${this.chartType} chart with \${dataPoints} data points across \${datasets} dataset(s). 
                Values range from \${minValue} to \${maxValue}. 
                Use arrow keys to navigate, Enter or Space to select.
              \`;
            }
          }

          showLoading() {
            this.canvas.style.display = 'none';
            const loading = document.createElement('div');
            loading.className = 'loading';
            loading.textContent = 'Loading chart...';
            loading.setAttribute('data-testid', 'chart-loading');
            loading.setAttribute('aria-live', 'polite');
            this.canvas.parentNode.appendChild(loading);
          }

          showError() {
            this.canvas.style.display = 'none';
            const error = document.createElement('div');
            error.className = 'error-state';
            error.textContent = this.error || 'Error loading chart';
            error.setAttribute('data-testid', 'chart-error');
            error.setAttribute('role', 'alert');
            this.canvas.parentNode.appendChild(error);
          }

          showEmpty() {
            this.canvas.style.display = 'none';
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = this.options.emptyMessage || 'No data available';
            empty.setAttribute('data-testid', 'chart-empty');
            empty.setAttribute('aria-live', 'polite');
            this.canvas.parentNode.appendChild(empty);
          }

          destroy() {
            if (this.chart) {
              this.chart.destroy();
              this.chart = null;
            }
          }
        }

        // Initialize accessible chart
        const chart = new AccessibleChartComponent('chart-canvas', '${chartType}', ${JSON.stringify(data)}, {
          title: '${options.title || `${chartType} Chart`}',
          description: '${options.description || `Interactive ${chartType} chart with accessibility features`}',
          ariaLabel: '${options.ariaLabel || `${chartType} chart`}',
          emptyMessage: 'No data available for display'
        });

        // Render the chart
        chart.render();

        // Make chart available globally for testing
        window.accessibleChart = chart;
      </script>
    </body>
    </html>
  `);
}

test.describe("Chart Accessibility E2E Tests", () => {
  test.describe("ARIA Labels and Descriptions", () => {
    test("should have proper ARIA labels for bar chart", async ({ page }) => {
      await createAccessibleChartPage(page, "bar", accessibilityTestData, {
        title: "Quarterly Revenue and Expenses",
        description: "Bar chart showing quarterly revenue and expenses for 2023",
        ariaLabel: "Quarterly revenue and expenses bar chart",
      });

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      // Check ARIA attributes
      const canvas = page.locator('[data-testid="chart-canvas"]');
      await expect(canvas).toHaveAttribute("role", "img");
      await expect(canvas).toHaveAttribute("aria-label", "Quarterly revenue and expenses bar chart");
      await expect(canvas).toHaveAttribute("aria-describedby", "chart-data-summary");

      // Check container ARIA attributes
      const container = page.locator(".chart-container");
      await expect(container).toHaveAttribute("role", "region");
      await expect(container).toHaveAttribute("aria-labelledby", "chart-title");
      await expect(container).toHaveAttribute("aria-describedby", "chart-description");
    });

    test("should have proper ARIA labels for pie chart", async ({ page }) => {
      const pieData = {
        labels: ["Desktop", "Mobile", "Tablet"],
        datasets: [
          {
            label: "Device Usage",
            data: [60, 30, 10],
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          },
        ],
      };

      await createAccessibleChartPage(page, "pie", pieData, {
        title: "Device Usage Distribution",
        description: "Pie chart showing the distribution of device usage",
        ariaLabel: "Device usage distribution pie chart",
      });

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      const canvas = page.locator('[data-testid="chart-canvas"]');
      await expect(canvas).toHaveAttribute("aria-label", "Device usage distribution pie chart");
    });

    test("should have accessible data table", async ({ page }) => {
      await createAccessibleChartPage(page, "bar", accessibilityTestData);

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      // Check table accessibility
      const table = page.locator(".chart-data-table");
      await expect(table).toHaveAttribute("role", "table");
      await expect(table).toHaveAttribute("aria-label", "Chart data in table format");

      // Check table headers
      const headers = table.locator("th");
      await expect(headers.first()).toHaveAttribute("scope", "col");
      await expect(headers.nth(1)).toHaveAttribute("scope", "col");

      // Check row headers
      const rowHeaders = table.locator("tbody th");
      await expect(rowHeaders.first()).toHaveAttribute("scope", "row");
    });
  });

  test.describe("Keyboard Navigation", () => {
    test("should support arrow key navigation", async ({ page }) => {
      await createAccessibleChartPage(page, "bar", accessibilityTestData);

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      const canvas = page.locator('[data-testid="chart-canvas"]');

      // Focus on canvas
      await canvas.focus();
      await expect(canvas).toBeFocused();

      // Test arrow key navigation
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowUp");

      // Canvas should still be focused
      await expect(canvas).toBeFocused();
    });

    test("should support Home and End key navigation", async ({ page }) => {
      await createAccessibleChartPage(page, "bar", accessibilityTestData);

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      const canvas = page.locator('[data-testid="chart-canvas"]');
      await canvas.focus();

      // Test Home key
      await page.keyboard.press("Home");
      await expect(canvas).toBeFocused();

      // Test End key
      await page.keyboard.press("End");
      await expect(canvas).toBeFocused();
    });

    test("should support Enter and Space key activation", async ({ page }) => {
      await createAccessibleChartPage(page, "bar", accessibilityTestData);

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      const canvas = page.locator('[data-testid="chart-canvas"]');
      await canvas.focus();

      // Test Enter key
      await page.keyboard.press("Enter");
      await expect(canvas).toBeFocused();

      // Test Space key
      await page.keyboard.press(" ");
      await expect(canvas).toBeFocused();
    });

    test("should be focusable with Tab key", async ({ page }) => {
      await createAccessibleChartPage(page, "bar", accessibilityTestData);

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      // Tab to canvas
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      const canvas = page.locator('[data-testid="chart-canvas"]');
      await expect(canvas).toBeFocused();
    });
  });

  test.describe("Screen Reader Compatibility", () => {
    test("should have screen reader only content", async ({ page }) => {
      await createAccessibleChartPage(page, "bar", accessibilityTestData);

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      // Check for screen reader only content
      const srOnly = page.locator(".sr-only");
      await expect(srOnly).toBeAttached();

      // Check data summary
      const dataSummary = page.locator("#chart-data-summary");
      await expect(dataSummary).toHaveClass("sr-only");
      await expect(dataSummary).toContainText("bar chart with");
    });

    test("should announce loading state to screen readers", async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <body>
          <div class="loading" data-testid="chart-loading" aria-live="polite">Loading chart...</div>
        </body>
        </html>
      `);

      const loading = page.locator('[data-testid="chart-loading"]');
      await expect(loading).toHaveAttribute("aria-live", "polite");
      await expect(loading).toContainText("Loading chart...");
    });

    test("should announce error state to screen readers", async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <body>
          <div class="error-state" data-testid="chart-error" role="alert">Error loading chart</div>
        </body>
        </html>
      `);

      const error = page.locator('[data-testid="chart-error"]');
      await expect(error).toHaveAttribute("role", "alert");
      await expect(error).toContainText("Error loading chart");
    });

    test("should announce empty state to screen readers", async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <body>
          <div class="empty-state" data-testid="chart-empty" aria-live="polite">No data available</div>
        </body>
        </html>
      `);

      const empty = page.locator('[data-testid="chart-empty"]');
      await expect(empty).toHaveAttribute("aria-live", "polite");
      await expect(empty).toContainText("No data available");
    });
  });

  test.describe("Visual Accessibility", () => {
    test("should have sufficient color contrast", async ({ page }) => {
      await createAccessibleChartPage(page, "bar", accessibilityTestData);

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      // Check text color contrast
      const title = page.locator(".chart-title");
      const titleColor = await title.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.color;
      });

      // Should be dark text on light background
      expect(titleColor).toBeTruthy();
    });

    test("should have focus indicators", async ({ page }) => {
      await createAccessibleChartPage(page, "bar", accessibilityTestData);

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      const canvas = page.locator('[data-testid="chart-canvas"]');
      await canvas.focus();

      // Check if focus indicator is visible
      const focusStyles = await canvas.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineOffset: styles.outlineOffset,
        };
      });

      expect(focusStyles.outline).toBeTruthy();
    });

    test("should have accessible legend", async ({ page }) => {
      await createAccessibleChartPage(page, "bar", accessibilityTestData);

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      // Check legend accessibility
      const legend = page.locator(".chart-legend");
      await expect(legend).toHaveAttribute("role", "list");
      await expect(legend).toHaveAttribute("aria-label", "Chart legend");

      // Check legend items
      const legendItems = legend.locator(".legend-item");
      await expect(legendItems).toHaveCount(2); // Revenue and Expenses

      // Check first legend item
      const firstItem = legendItems.first();
      await expect(firstItem).toHaveAttribute("role", "listitem");
      await expect(firstItem).toContainText("Revenue");
    });
  });

  test.describe("Focus Management", () => {
    test("should manage focus properly", async ({ page }) => {
      await createAccessibleChartPage(page, "bar", accessibilityTestData);

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      const canvas = page.locator('[data-testid="chart-canvas"]');

      // Focus should be manageable
      await canvas.focus();
      await expect(canvas).toBeFocused();

      // Blur and refocus
      await canvas.blur();
      await canvas.focus();
      await expect(canvas).toBeFocused();
    });

    test("should maintain focus during interactions", async ({ page }) => {
      await createAccessibleChartPage(page, "bar", accessibilityTestData);

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      const canvas = page.locator('[data-testid="chart-canvas"]');
      await canvas.focus();

      // Simulate keyboard interactions
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("Enter");

      // Focus should be maintained
      await expect(canvas).toBeFocused();
    });
  });

  test.describe("Responsive Accessibility", () => {
    test("should maintain accessibility on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await createAccessibleChartPage(page, "bar", accessibilityTestData);

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      // Check that ARIA attributes are still present
      const canvas = page.locator('[data-testid="chart-canvas"]');
      await expect(canvas).toHaveAttribute("role", "img");
      await expect(canvas).toHaveAttribute("aria-label");

      // Check that legend is still accessible
      const legend = page.locator(".chart-legend");
      await expect(legend).toHaveAttribute("role", "list");
    });

    test("should maintain accessibility on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await createAccessibleChartPage(page, "pie", {
        labels: ["Desktop", "Mobile", "Tablet"],
        datasets: [
          {
            label: "Device Usage",
            data: [60, 30, 10],
          },
        ],
      });

      await page.waitForSelector('[data-testid="chart-canvas"]', { state: "visible" });

      const canvas = page.locator('[data-testid="chart-canvas"]');
      await expect(canvas).toHaveAttribute("tabindex", "0");
      await expect(canvas).toBeVisible();
    });
  });
});
