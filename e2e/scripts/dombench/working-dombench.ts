/**
 * @fileoverview Working DOMBench - Simple, Accurate DOM Rendering Performance Benchmark
 *
 * A simple, working benchmark that measures ONLY DOM rendering performance.
 * No external dependencies, no complex setup - just accurate measurements.
 *
 * @author Pool-Theorist-35 (Reynard Otter Specialist)
 * @since 1.0.0
 */

import { Browser, Page, chromium } from "@playwright/test";

export interface WorkingDOMBenchResult {
  componentCount: number;
  renderTime: number;
  memoryDelta: number;
  domNodes: number;
  approach: string;
  category: string;
  timestamp: number;
}

export class WorkingDOMBench {
  private browser: Browser;
  private page: Page;
  private results: WorkingDOMBenchResult[] = [];

  async initialize(): Promise<void> {
    console.log("🦦 Initializing Working DOMBench...");
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();

    // Create a simple HTML page
    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Working DOMBench</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          #benchmark-container { min-height: 100px; border: 1px solid #ccc; padding: 10px; }
          .component-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
          .reynard-button { padding: 8px 16px; background: #007acc; color: white; border: none; border-radius: 4px; }
          .reynard-layout-item { padding: 10px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; }
          .reynard-data-item { padding: 8px; background: #e8f4fd; border: 1px solid #007acc; border-radius: 4px; }
          .reynard-overlay { padding: 12px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>🦦 Working DOMBench - DOM Rendering Performance Test</h1>
        <div id="benchmark-container" data-testid="benchmark-container">Ready for benchmarking...</div>
      </body>
      </html>
    `);

    await this.page.waitForSelector('[data-testid="benchmark-container"]', { timeout: 10000 });
    console.log("✅ Working DOMBench initialized");
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Measure ONLY DOM rendering performance
   */
  async measureDOMRendering(category: string, approach: string, count: number): Promise<WorkingDOMBenchResult> {
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

        // Create components based on approach
        if (approach === "csr") {
          // CSR: Create all components at once
          const grid = document.createElement("div");
          grid.className = "component-grid";

          const fragment = document.createDocumentFragment();
          for (let i = 0; i < count; i++) {
            let element;
            if (category === "primitives") {
              element = document.createElement("button");
              element.className = "reynard-button";
              element.textContent = `Btn ${i}`;
            } else if (category === "layouts") {
              element = document.createElement("div");
              element.className = "reynard-layout-item";
              element.textContent = `Layout ${i}`;
            } else if (category === "data") {
              element = document.createElement("div");
              element.className = "reynard-data-item";
              element.textContent = `Data ${i}`;
            } else if (category === "overlays") {
              element = document.createElement("div");
              element.className = "reynard-overlay";
              element.textContent = `Overlay ${i}`;
            } else {
              element = document.createElement("div");
              element.textContent = `Component ${i}`;
            }
            fragment.appendChild(element);
          }

          grid.appendChild(fragment);
          container.appendChild(grid);
        } else if (approach === "lazy") {
          // Lazy: Create placeholders first, then replace
          const grid = document.createElement("div");
          grid.className = "component-grid";

          const fragment = document.createDocumentFragment();
          for (let i = 0; i < count; i++) {
            const placeholder = document.createElement("div");
            placeholder.textContent = `Loading ${i}...`;
            placeholder.setAttribute("data-lazy", "true");
            placeholder.setAttribute("data-index", i.toString());
            fragment.appendChild(placeholder);
          }

          grid.appendChild(fragment);
          container.appendChild(grid);

          // Replace placeholders with actual components
          const placeholders = grid.querySelectorAll("[data-lazy]");
          for (const placeholder of placeholders) {
            const index = parseInt(placeholder.getAttribute("data-index") || "0");
            let element;
            if (category === "primitives") {
              element = document.createElement("button");
              element.className = "reynard-button";
              element.textContent = `Btn ${index}`;
            } else if (category === "layouts") {
              element = document.createElement("div");
              element.className = "reynard-layout-item";
              element.textContent = `Layout ${index}`;
            } else if (category === "data") {
              element = document.createElement("div");
              element.className = "reynard-data-item";
              element.textContent = `Data ${index}`;
            } else if (category === "overlays") {
              element = document.createElement("div");
              element.className = "reynard-overlay";
              element.textContent = `Overlay ${index}`;
            } else {
              element = document.createElement("div");
              element.textContent = `Component ${index}`;
            }
            placeholder.replaceWith(element);
          }
        } else if (approach === "virtual") {
          // Virtual: Only render visible items
          const virtualContainer = document.createElement("div");
          virtualContainer.style.height = "400px";
          virtualContainer.style.overflow = "auto";

          // Only render first 50 items for consistency
          const visibleCount = Math.min(count, 50);
          for (let i = 0; i < visibleCount; i++) {
            const item = document.createElement("div");
            item.textContent = `${category} ${i}`;
            virtualContainer.appendChild(item);
          }

          container.appendChild(virtualContainer);
        } else if (approach === "batch") {
          // Batch: Render in batches of 100
          const grid = document.createElement("div");
          grid.className = "component-grid";

          const batchSize = 100;
          const batches = Math.ceil(count / batchSize);

          for (let batch = 0; batch < batches; batch++) {
            const batchStart = batch * batchSize;
            const batchEnd = Math.min(batchStart + batchSize, count);

            const fragment = document.createDocumentFragment();
            for (let i = batchStart; i < batchEnd; i++) {
              let element;
              if (category === "primitives") {
                element = document.createElement("button");
                element.className = "reynard-button";
                element.textContent = `Btn ${i}`;
              } else if (category === "layouts") {
                element = document.createElement("div");
                element.className = "reynard-layout-item";
                element.textContent = `Layout ${i}`;
              } else if (category === "data") {
                element = document.createElement("div");
                element.className = "reynard-data-item";
                element.textContent = `Data ${i}`;
              } else if (category === "overlays") {
                element = document.createElement("div");
                element.className = "reynard-overlay";
                element.textContent = `Overlay ${i}`;
              } else {
                element = document.createElement("div");
                element.textContent = `Component ${i}`;
              }
              fragment.appendChild(element);
            }

            grid.appendChild(fragment);

            // Yield control between batches
            if (batch < batches - 1) {
              await new Promise(resolve => setTimeout(resolve, 0));
            }
          }

          container.appendChild(grid);
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
  ): Promise<WorkingDOMBenchResult[]> {
    const results: WorkingDOMBenchResult[] = [];

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
  async runFullBenchmark(): Promise<WorkingDOMBenchResult[]> {
    console.log("🦦 Starting Working DOMBench - Accurate DOM Rendering Performance Tests...\n");

    const allResults: WorkingDOMBenchResult[] = [];
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

    let analysis = "\n🦦 WORKING DOMBENCH PERFORMANCE ANALYSIS\n";
    analysis += "=".repeat(50) + "\n\n";

    // Group by approach
    const byApproach = this.results.reduce(
      (acc, result) => {
        if (!acc[result.approach]) acc[result.approach] = [];
        acc[result.approach].push(result);
        return acc;
      },
      {} as Record<string, WorkingDOMBenchResult[]>
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
      {} as Record<number, WorkingDOMBenchResult[]>
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

    const resultsPath = path.join(resultsDir, `working-dombench-results-${timestamp}.json`);
    const analysisPath = path.join(resultsDir, `working-dombench-analysis-${timestamp}.txt`);

    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
    fs.writeFileSync(analysisPath, this.generateAnalysis());

    console.log(`\n📄 Results saved to: ${resultsPath}`);
    console.log(`📄 Analysis saved to: ${analysisPath}`);
  }
}

/**
 * Main execution function
 */
export async function runWorkingDOMBench(): Promise<void> {
  const dombench = new WorkingDOMBench();

  try {
    await dombench.initialize();
    await dombench.runFullBenchmark();
    const analysis = dombench.generateAnalysis();
    console.log(analysis);
    await dombench.saveResults();
  } catch (error) {
    console.error("❌ Working DOMBench failed:", error);
  } finally {
    await dombench.cleanup();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runWorkingDOMBench().catch(console.error);
}

