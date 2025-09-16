/**
 * @fileoverview Full DOMBench with Integrated Plotting
 *
 * Runs the complete DOMBench suite and automatically generates beautiful plots.
 *
 * @author Pool-Theorist-35 (Reynard Otter Specialist)
 * @since 1.0.0
 */

import { Browser, Page, chromium } from "@playwright/test";

interface DOMBenchResult {
  componentCount: number;
  renderTime: number;
  memoryDelta: number;
  domNodes: number;
  approach: string;
  category: string;
  timestamp: number;
}

class FullDOMBenchWithPlots {
  private browser!: Browser;
  private page!: Page;
  private results: DOMBenchResult[] = [];

  async initialize(): Promise<void> {
    console.log("🦦 Initializing Full DOMBench with Plots...");
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();

    // Create a comprehensive HTML page
    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Full DOMBench with Plots</title>
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
        <h1>🦦 Full DOMBench with Integrated Plotting</h1>
        <div id="benchmark-container" data-testid="benchmark-container">Ready for comprehensive benchmarking...</div>
      </body>
      </html>
    `);

    await this.page.waitForSelector('[data-testid="benchmark-container"]', { timeout: 10000 });
    console.log("✅ Full DOMBench initialized");
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Measure DOM rendering performance
   */
  async measureDOMRendering(category: string, approach: string, count: number): Promise<DOMBenchResult> {
    const result = await this.page.evaluate(
      async ({ category, approach, count }) => {
        const container = document.querySelector('[data-testid="benchmark-container"]');
        if (!container) {
          throw new Error("Benchmark container not found");
        }

        container.innerHTML = "";

        const beforeMemory = (performance as any).memory?.usedJSHeapSize || 0;
        const beforeNodes = document.querySelectorAll("*").length;

        const startTime = performance.now();

        // Inline component creation function
        const createComponentInline = (category: string, index: number) => {
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
            const lazyGrid = document.createElement("div");
            lazyGrid.className = "component-grid";
            const lazyFragment = document.createDocumentFragment();
            for (let i = 0; i < count; i++) {
              const placeholder = document.createElement("div");
              placeholder.className = "lazy-placeholder";
              placeholder.setAttribute("data-lazy", "true");
              placeholder.setAttribute("data-index", i.toString());
              placeholder.textContent = `Loading ${category} ${i}...`;
              lazyFragment.appendChild(placeholder);
            }
            lazyGrid.appendChild(lazyFragment);
            container.appendChild(lazyGrid);

            const placeholders = lazyGrid.querySelectorAll("[data-lazy]");
            for (const placeholder of placeholders) {
              const index = parseInt(placeholder.getAttribute("data-index") || "0");
              const component = createComponentInline(category, index);
              placeholder.replaceWith(component);
            }
            break;

          case "virtual":
            const virtualContainer = document.createElement("div");
            virtualContainer.className = "virtual-container";
            const visibleItems = Math.min(count, 50);
            for (let i = 0; i < visibleItems; i++) {
              const element = createComponentInline(category, i);
              element.className += " virtual-item";
              virtualContainer.appendChild(element);
            }
            container.appendChild(virtualContainer);
            break;

          case "batch":
            const batchGrid = document.createElement("div");
            batchGrid.className = "component-grid";
            container.appendChild(batchGrid);

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

              if (batch < batches - 1) {
                await new Promise(resolve => setTimeout(resolve, 0));
              }
            }
            break;

          default:
            throw new Error(`Unknown approach: ${approach}`);
        }

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        const afterMemory = (performance as any).memory?.usedJSHeapSize || 0;
        const memoryDelta = (afterMemory - beforeMemory) / (1024 * 1024);

        const afterNodes = document.querySelectorAll("*").length;
        const domNodes = afterNodes - beforeNodes;

        return { renderTime, memoryDelta, domNodes };
      },
      { category, approach, count }
    );

    return {
      componentCount: count,
      renderTime: result.renderTime,
      memoryDelta: result.memoryDelta,
      domNodes: result.domNodes,
      approach,
      category,
      timestamp: Date.now(),
    };
  }

  /**
   * Run comprehensive benchmark
   */
  async runComprehensiveBenchmark(): Promise<DOMBenchResult[]> {
    console.log("🦦 Starting comprehensive DOMBench...\n");

    const categories = ["primitives", "layouts", "data", "overlays"];
    const approaches = ["csr", "lazy", "virtual", "batch"];
    const counts = [10, 100, 1000, 5000, 10000];
    const iterations = 3;

    const allResults: DOMBenchResult[] = [];

    for (const category of categories) {
      console.log(`\n🔍 Testing ${category} components:`);

      for (const count of counts) {
        console.log(`  📊 ${count} components:`);

        for (const approach of approaches) {
          console.log(`    🧮 ${approach.toUpperCase()} approach:`);

          const results: DOMBenchResult[] = [];
          for (let i = 0; i < iterations; i++) {
            try {
              const result = await this.measureDOMRendering(category, approach, count);
              results.push(result);
              console.log(
                `      ✅ ${result.renderTime.toFixed(2)}ms (${result.memoryDelta.toFixed(2)}MB, ${result.domNodes} nodes)`
              );
            } catch (error) {
              console.log(`      ❌ Failed: ${(error as Error).message}`);
            }
          }

          if (results.length > 0) {
            const avgTime = results.reduce((sum, r) => sum + r.renderTime, 0) / results.length;
            const avgMemory = results.reduce((sum, r) => sum + r.memoryDelta, 0) / results.length;
            const minTime = Math.min(...results.map(r => r.renderTime));
            const maxTime = Math.max(...results.map(r => r.renderTime));

            console.log(`    📈 Average: ${avgTime.toFixed(2)}ms (${avgMemory.toFixed(2)}MB)`);
            console.log(`    📈 Range: ${minTime.toFixed(2)}ms - ${maxTime.toFixed(2)}ms`);

            allResults.push(...results);
          }
        }
      }
    }

    this.results = allResults;
    return allResults;
  }

  /**
   * Save results to file
   */
  async saveResults(): Promise<string> {
    const fs = await import("fs");
    const path = await import("path");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const resultsDir = path.join(process.cwd(), "dombench-results");

    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const resultsPath = path.join(resultsDir, `full-dombench-results-${timestamp}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));

    console.log(`\n📄 Results saved to: ${resultsPath}`);
    return resultsPath;
  }

  /**
   * Generate and display plots
   */
  async generateAndDisplayPlots(resultsPath: string): Promise<void> {
    console.log("\n📈 Generating comprehensive plots...");

    // Import and run the plotting system
    const { plotBenchmarkResults } = await import("./plot-benchmark-results.js");
    await plotBenchmarkResults(resultsPath);
  }
}

/**
 * Main execution function
 */
export async function runFullDOMBenchWithPlots(): Promise<void> {
  const dombench = new FullDOMBenchWithPlots();

  try {
    await dombench.initialize();
    await dombench.runComprehensiveBenchmark();
    const resultsPath = await dombench.saveResults();
    await dombench.generateAndDisplayPlots(resultsPath);

    console.log("\n✅ Full DOMBench with plots completed successfully!");
    console.log("🦦 Check the dombench-results/ directory for all generated files!");
  } catch (error) {
    console.error("❌ Full DOMBench with plots failed:", error);
  } finally {
    await dombench.cleanup();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFullDOMBenchWithPlots().catch(console.error);
}
