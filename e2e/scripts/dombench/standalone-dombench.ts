/**
 * @fileoverview Standalone DOMBench - Self-contained DOM Rendering Performance Benchmark
 *
 * A completely self-contained benchmark that measures ONLY DOM rendering performance.
 * No external pages or servers required.
 *
 * @author Pool-Theorist-35 (Reynard Otter Specialist)
 * @since 1.0.0
 */

import { Browser, Page, chromium } from "@playwright/test";

export interface StandaloneDOMBenchResult {
  componentCount: number;
  renderTime: number;
  memoryDelta: number;
  domNodes: number;
  approach: string;
  category: string;
  timestamp: number;
}

export class StandaloneDOMBench {
  private browser: Browser;
  private page: Page;
  private results: StandaloneDOMBenchResult[] = [];

  async initialize(): Promise<void> {
    console.log("🦦 Initializing Standalone DOMBench...");
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();

    // Create a simple HTML page with our benchmark container
    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>DOMBench</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          #benchmark-container { min-height: 100px; border: 1px solid #ccc; padding: 10px; }
          .component-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
          .reynard-button { padding: 8px 16px; background: #007acc; color: white; border: none; border-radius: 4px; }
          .reynard-layout-item { padding: 10px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; }
          .reynard-data-item { padding: 8px; background: #e8f4fd; border: 1px solid #007acc; border-radius: 4px; }
          .reynard-overlay { padding: 12px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; }
          .lazy-placeholder { padding: 8px; background: #f8f9fa; border: 1px dashed #6c757d; border-radius: 4px; }
          .virtual-item { padding: 6px; background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>🦦 DOMBench - DOM Rendering Performance Test</h1>
        <div id="benchmark-container" data-testid="benchmark-container">Ready for benchmarking...</div>
      </body>
      </html>
    `);

    await this.page.waitForSelector('[data-testid="benchmark-container"]', { timeout: 10000 });
    console.log("✅ Standalone DOMBench initialized");
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Measure ONLY DOM rendering performance
   */
  async measureDOMRendering(category: string, approach: string, count: number): Promise<StandaloneDOMBenchResult> {
    const result = await this.page.evaluate(
      async ({ category, approach, count }) => {
        // Clear any existing content
        const container = document.querySelector('[data-testid="benchmark-container"]');
        if (!container) {
          throw new Error("Benchmark container not found");
        }
        container.innerHTML = "";

        // Force garbage collection if available
        if (window.gc) {
          window.gc();
        }

        const beforeMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const beforeNodes = document.querySelectorAll("*").length;

        // Start timing
        const startTime = performance.now();

        // Inline component creation function
        const createComponentInline = (category, index) => {
          switch (category) {
            case "primitives":
              const button = document.createElement("button");
              button.className = "reynard-button";
              button.textContent = `Btn ${index}`;
              button.setAttribute("data-testid", `button-${index}`);
              return button;

            case "layouts":
              const item = document.createElement("div");
              item.className = "reynard-layout-item";
              item.textContent = `Layout ${index}`;
              item.setAttribute("data-testid", `layout-${index}`);
              return item;

            case "data":
              const dataItem = document.createElement("div");
              dataItem.className = "reynard-data-item";
              dataItem.textContent = `Data ${index}`;
              dataItem.setAttribute("data-testid", `data-${index}`);
              return dataItem;

            case "overlays":
              const overlay = document.createElement("div");
              overlay.className = "reynard-overlay";
              overlay.textContent = `Overlay ${index}`;
              overlay.setAttribute("data-testid", `overlay-${index}`);
              return overlay;

            default:
              const div = document.createElement("div");
              div.textContent = `Component ${index}`;
              return div;
          }
        };

        // Create components based on approach
        switch (approach) {
          case "csr":
            // CSR: Create all components at once
            const grid = document.createElement("div");
            grid.className = "component-grid";

            const fragment = document.createDocumentFragment();
            for (let i = 0; i < count; i++) {
              const element = createComponentInline(category, i);
              fragment.appendChild(element);
            }

            grid.appendChild(fragment);
            container.appendChild(grid);
            break;

          case "lazy":
            // Lazy: Create placeholders first, then replace
            const lazyGrid = document.createElement("div");
            lazyGrid.className = "component-grid";

            const lazyFragment = document.createDocumentFragment();
            for (let i = 0; i < count; i++) {
              const placeholder = document.createElement("div");
              placeholder.className = "lazy-placeholder";
              placeholder.textContent = `Loading ${i}...`;
              placeholder.setAttribute("data-lazy", "true");
              placeholder.setAttribute("data-index", i.toString());
              lazyFragment.appendChild(placeholder);
            }

            lazyGrid.appendChild(lazyFragment);
            container.appendChild(lazyGrid);

            // Replace placeholders with actual components
            const placeholders = lazyGrid.querySelectorAll("[data-lazy]");
            for (const placeholder of placeholders) {
              const index = parseInt(placeholder.getAttribute("data-index") || "0");
              const component = createComponentInline(category, index);
              placeholder.replaceWith(component);
            }
            break;

          case "virtual":
            // Virtual: Only render visible items
            const virtualContainer = document.createElement("div");
            virtualContainer.className = "virtual-scroll-container";
            virtualContainer.style.height = "400px";
            virtualContainer.style.overflow = "auto";

            // Only render first 50 items for consistency
            const visibleCount = Math.min(count, 50);
            for (let i = 0; i < visibleCount; i++) {
              const item = document.createElement("div");
              item.className = "virtual-item";
              item.textContent = `${category} ${i}`;
              virtualContainer.appendChild(item);
            }

            container.appendChild(virtualContainer);
            break;

          case "batch":
            // Batch: Render in batches of 100
            const batchGrid = document.createElement("div");
            batchGrid.className = "component-grid";

            const batchSize = 100;
            const batches = Math.ceil(count / batchSize);

            for (let batch = 0; batch < batches; batch++) {
              const batchStart = batch * batchSize;
              const batchEnd = Math.min(batchStart + batchSize, count);

              const batchFragment = document.createDocumentFragment();
              for (let i = batchStart; i < batchEnd; i++) {
                const element = createComponentInline(category, i);
                batchFragment.appendChild(element);
              }

              batchGrid.appendChild(batchFragment);

              // Yield control between batches
              if (batch < batches - 1) {
                await new Promise(resolve => setTimeout(resolve, 0));
              }
            }

            container.appendChild(batchGrid);
            break;

          default:
            throw new Error(`Unknown approach: ${approach}`);
        }

        // End timing
        const endTime = performance.now();

        const afterMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const afterNodes = document.querySelectorAll("*").length;

        return {
          componentCount: count,
          renderTime: endTime - startTime,
          memoryDelta: (afterMemory - beforeMemory) / 1024 / 1024, // MB
          domNodes: afterNodes - beforeNodes,
          approach,
          category,
          timestamp: Date.now(),
        };
      },
      { category, approach, count }
    );

    return result;
  }

  /**
   * Run a single benchmark with multiple iterations
   */
  async runSingleBenchmark(
    category: string,
    approach: string,
    count: number,
    iterations: number = 3
  ): Promise<StandaloneDOMBenchResult[]> {
    const results: StandaloneDOMBenchResult[] = [];

    for (let i = 0; i < iterations; i++) {
      try {
        console.log(`    🧮 Iteration ${i + 1}/${iterations}...`);
        const result = await this.measureDOMRendering(category, approach, count);
        results.push(result);
        console.log(
          `      ✅ ${result.renderTime.toFixed(2)}ms (${result.memoryDelta.toFixed(2)}MB, ${result.domNodes} nodes)`
        );
      } catch (error) {
        console.log(`      ❌ Failed: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Run comprehensive benchmarks
   */
  async runFullBenchmark(): Promise<StandaloneDOMBenchResult[]> {
    console.log("🦦 Starting Standalone DOMBench - Accurate DOM Rendering Performance Tests...\n");

    const allResults: StandaloneDOMBenchResult[] = [];
    const categories = ["primitives", "layouts", "data", "overlays"];
    const approaches = ["csr", "lazy", "virtual", "batch"];
    const counts = [10, 100, 1000, 10000, 50000];
    const iterations = 2;

    for (const category of categories) {
      console.log(`\n🔍 Testing ${category} components:`);

      for (const approach of approaches) {
        console.log(`  📈 ${approach.toUpperCase()} approach:`);

        for (const count of counts) {
          try {
            console.log(`    🧮 ${count} components...`);
            const results = await this.runSingleBenchmark(category, approach, count, iterations);
            allResults.push(...results);

            // Calculate average for this configuration
            if (results.length > 0) {
              const avgTime = results.reduce((sum, r) => sum + r.renderTime, 0) / results.length;
              const avgMemory = results.reduce((sum, r) => sum + r.memoryDelta, 0) / results.length;
              console.log(`    📊 Average: ${avgTime.toFixed(2)}ms (${avgMemory.toFixed(2)}MB)`);
            }
          } catch (error) {
            console.log(`    ❌ Failed: ${error.message}`);
          }
        }
      }
    }

    this.results = allResults;
    return allResults;
  }

  /**
   * Generate performance analysis report
   */
  generateAnalysis(): string {
    if (this.results.length === 0) {
      return "No benchmark results available.";
    }

    let analysis = "\n🦦 STANDALONE DOMBENCH PERFORMANCE ANALYSIS\n";
    analysis += "=".repeat(50) + "\n\n";

    // Group by approach
    const byApproach = this.results.reduce(
      (acc, result) => {
        if (!acc[result.approach]) acc[result.approach] = [];
        acc[result.approach].push(result);
        return acc;
      },
      {} as Record<string, StandaloneDOMBenchResult[]>
    );

    analysis += "📊 PERFORMANCE BY APPROACH:\n";
    analysis += "-".repeat(30) + "\n";

    Object.entries(byApproach).forEach(([approach, approachResults]) => {
      const avgTime = approachResults.reduce((sum, r) => sum + r.renderTime, 0) / approachResults.length;
      const avgMemory = approachResults.reduce((sum, r) => sum + r.memoryDelta, 0) / approachResults.length;

      analysis += `\n${approach.toUpperCase()}:\n`;
      analysis += `  Average Time: ${avgTime.toFixed(2)}ms\n`;
      analysis += `  Average Memory: ${avgMemory.toFixed(2)}MB\n`;
      analysis += `  Tests: ${approachResults.length}\n`;
    });

    // Scaling analysis
    analysis += "\n📊 SCALING ANALYSIS:\n";
    analysis += "-".repeat(30) + "\n";

    const csrResults = this.results.filter(r => r.approach === "csr");
    const scalingData = csrResults.reduce(
      (acc, result) => {
        if (!acc[result.componentCount]) acc[result.componentCount] = [];
        acc[result.componentCount].push(result);
        return acc;
      },
      {} as Record<number, StandaloneDOMBenchResult[]>
    );

    Object.entries(scalingData)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([count, countResults]) => {
        const avgTime = countResults.reduce((sum, r) => sum + r.renderTime, 0) / countResults.length;
        const timePerComponent = avgTime / parseInt(count);

        analysis += `\n${count} components:\n`;
        analysis += `  Average Time: ${avgTime.toFixed(2)}ms\n`;
        analysis += `  Time per Component: ${timePerComponent.toFixed(4)}ms\n`;
      });

    // Performance recommendations
    analysis += "\n🎯 PERFORMANCE RECOMMENDATIONS:\n";
    analysis += "-".repeat(30) + "\n";

    const fastestApproach = Object.entries(byApproach).reduce(
      (fastest, [approach, results]) => {
        const avgTime = results.reduce((sum, r) => sum + r.renderTime, 0) / results.length;
        return avgTime < fastest.time ? { approach, time: avgTime } : fastest;
      },
      { approach: "", time: Infinity }
    );

    const mostMemoryEfficient = Object.entries(byApproach).reduce(
      (efficient, [approach, results]) => {
        const avgMemory = results.reduce((sum, r) => sum + r.memoryDelta, 0) / results.length;
        return avgMemory < efficient.memory ? { approach, memory: avgMemory } : efficient;
      },
      { approach: "", memory: Infinity }
    );

    analysis += `\nFastest Approach: ${fastestApproach.approach.toUpperCase()} (${fastestApproach.time.toFixed(2)}ms avg)\n`;
    analysis += `Most Memory Efficient: ${mostMemoryEfficient.approach.toUpperCase()} (${mostMemoryEfficient.memory.toFixed(2)}MB avg)\n`;

    return analysis;
  }

  /**
   * Save results to files
   */
  async saveResults(): Promise<void> {
    const fs = await import("fs");
    const path = await import("path");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const resultsDir = path.join(process.cwd(), "dombench-results");

    // Create results directory if it doesn't exist
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const resultsPath = path.join(resultsDir, `standalone-dombench-results-${timestamp}.json`);
    const analysisPath = path.join(resultsDir, `standalone-dombench-analysis-${timestamp}.txt`);

    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
    fs.writeFileSync(analysisPath, this.generateAnalysis());

    console.log(`\n📄 Results saved to: ${resultsPath}`);
    console.log(`📄 Analysis saved to: ${analysisPath}`);
  }
}

// Browser-side component creation function
const createComponent = (category: string, index: number): HTMLElement => {
  switch (category) {
    case "primitives":
      const button = document.createElement("button");
      button.className = "reynard-button";
      button.textContent = `Btn ${index}`;
      button.setAttribute("data-testid", `button-${index}`);
      return button;

    case "layouts":
      const item = document.createElement("div");
      item.className = "reynard-layout-item";
      item.textContent = `Layout ${index}`;
      item.setAttribute("data-testid", `layout-${index}`);
      return item;

    case "data":
      const dataItem = document.createElement("div");
      dataItem.className = "reynard-data-item";
      dataItem.textContent = `Data ${index}`;
      dataItem.setAttribute("data-testid", `data-${index}`);
      return dataItem;

    case "overlays":
      const overlay = document.createElement("div");
      overlay.className = "reynard-overlay";
      overlay.textContent = `Overlay ${index}`;
      overlay.setAttribute("data-testid", `overlay-${index}`);
      return overlay;

    default:
      const div = document.createElement("div");
      div.textContent = `Component ${index}`;
      return div;
  }
};

/**
 * Main execution function
 */
export async function runStandaloneDOMBench(): Promise<void> {
  const dombench = new StandaloneDOMBench();

  try {
    await dombench.initialize();
    await dombench.runFullBenchmark();
    const analysis = dombench.generateAnalysis();
    console.log(analysis);
    await dombench.saveResults();
  } catch (error) {
    console.error("❌ Standalone DOMBench failed:", error);
  } finally {
    await dombench.cleanup();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runStandaloneDOMBench().catch(console.error);
}
