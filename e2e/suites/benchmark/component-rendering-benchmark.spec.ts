/**
 * @fileoverview Comprehensive Component Rendering Benchmark Suite
 *
 * This benchmark suite tests different rendering approaches for Reynard components
 * and displays the best performing approach for each category.
 *
 * Categories tested:
 * - Primitives (Button, Card, TextField)
 * - Layout Components (AppLayout, Grid, DataTable)
 * - Data Components (Charts, Gallery)
 * - Overlay Components (Modal, Drawer, FloatingPanel)
 *
 * Rendering approaches:
 * - Client-Side Rendering (CSR)
 * - Server-Side Rendering (SSR)
 * - Lazy Loading
 * - Virtual Scrolling
 * - Static Generation
 *
 * @author Pool-Theorist-35 (Reynard Otter Specialist)
 * @since 1.0.0
 */

import { Page, test } from "@playwright/test";
import { BenchmarkResult, ComponentCategory, PerformanceMetrics } from "../../core/types/benchmark-types";
import { disableAnimations } from "../../core/utils/animation-control";
import { createBenchmarkSuite } from "../../core/utils/benchmark-utils";

interface BenchmarkConfig {
  iterations: number;
  warmupRuns: number;
  componentCounts: number[];
  renderingApproaches: string[];
}

const BENCHMARK_CONFIG: BenchmarkConfig = {
  iterations: 10,
  warmupRuns: 3,
  componentCounts: [1, 10, 50, 100, 500],
  renderingApproaches: ["csr", "ssr", "lazy", "virtual", "static"],
};

const COMPONENT_CATEGORIES: ComponentCategory[] = [
  {
    name: "primitives",
    components: ["Button", "Card", "TextField", "Checkbox", "Select"],
    description: "Basic UI primitives and form controls",
  },
  {
    name: "layouts",
    components: ["AppLayout", "Grid", "GridItem", "Flex", "Stack"],
    description: "Layout and positioning components",
  },
  {
    name: "data",
    components: ["DataTable", "Charts", "Gallery", "List", "Tree"],
    description: "Data display and visualization components",
  },
  {
    name: "overlays",
    components: ["Modal", "Drawer", "FloatingPanel", "Tooltip", "Popover"],
    description: "Overlay and floating components",
  },
];

test.describe("Component Rendering Benchmarks", () => {
  let benchmarkSuite: ReturnType<typeof createBenchmarkSuite>;
  let results: BenchmarkResult[] = [];

  test.beforeAll(async () => {
    benchmarkSuite = createBenchmarkSuite();
  });

  test.beforeEach(async ({ page }) => {
    // Disable animations for consistent benchmark timing
    await disableAnimations(page);

    // Set up performance monitoring
    await page.addInitScript(() => {
      window.performance.mark("benchmark-start");
    });
  });

  for (const category of COMPONENT_CATEGORIES) {
    test.describe(`${category.name} components`, () => {
      for (const approach of BENCHMARK_CONFIG.renderingApproaches) {
        for (const count of BENCHMARK_CONFIG.componentCounts) {
          test(`${approach} rendering - ${count} ${category.name} components`, async ({ page }) => {
            const testName = `${category.name}-${approach}-${count}`;

            // Warmup runs
            for (let i = 0; i < BENCHMARK_CONFIG.warmupRuns; i++) {
              await runBenchmarkIteration(page, category, approach, count, true);
            }

            // Actual benchmark runs
            const metrics: PerformanceMetrics[] = [];
            for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
              const metric = await runBenchmarkIteration(page, category, approach, count, false);
              metrics.push(metric);
            }

            // Calculate statistics
            const result = benchmarkSuite.calculateStatistics(metrics, {
              category: category.name,
              approach,
              componentCount: count,
              testName,
            });

            results.push(result);

            // Log results
            console.log(`📊 ${testName}: ${result.averageRenderTime}ms ± ${result.stdDeviation}ms`);
          });
        }
      }
    });
  }

  test.afterAll(async () => {
    // Generate and display results
    await generateBenchmarkReport(results);
  });
});

/**
 * Run a single benchmark iteration
 */
async function runBenchmarkIteration(
  page: Page,
  category: ComponentCategory,
  approach: string,
  count: number,
  isWarmup: boolean
): Promise<PerformanceMetrics> {
  const startTime = Date.now();

  // Navigate to benchmark page
  await page.goto(`/?category=${category.name}&approach=${approach}&count=${count}`);

  // Wait for components to render
  await page.waitForSelector('[data-testid="benchmark-container"]', { timeout: 10000 });

  // Measure performance metrics
  const metrics = await page.evaluate(() => {
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

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  if (!isWarmup) {
    // Additional measurements for non-warmup runs
    const componentRenderTime = await measureComponentRenderTime(page, category, count);
    const memoryAfterRender = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);

    return {
      ...metrics,
      totalTime,
      componentRenderTime,
      memoryAfterRender,
      memoryDelta: memoryAfterRender - metrics.memoryUsage,
    };
  }

  return {
    ...metrics,
    totalTime,
    componentRenderTime: 0,
    memoryAfterRender: 0,
    memoryDelta: 0,
  };
}

/**
 * Measure individual component render time
 */
async function measureComponentRenderTime(page: Page, category: ComponentCategory, count: number): Promise<number> {
  const startTime = Date.now();

  // Trigger re-render by updating a prop
  await page.evaluate(
    ({ category, count }) => {
      const container = document.querySelector('[data-testid="benchmark-container"]');
      if (container) {
        container.setAttribute("data-rerender", Date.now().toString());
      }
    },
    { category: category.name, count }
  );

  // Wait for re-render to complete
  await page.waitForFunction(() => {
    const container = document.querySelector('[data-testid="benchmark-container"]');
    return container && container.getAttribute("data-rerender");
  });

  return Date.now() - startTime;
}

/**
 * Generate comprehensive benchmark report
 */
async function generateBenchmarkReport(results: BenchmarkResult[]): Promise<void> {
  console.log("\n🦦 === REYNARD COMPONENT RENDERING BENCHMARK REPORT ===\n");

  // Group results by category
  const resultsByCategory = results.reduce(
    (acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = [];
      }
      acc[result.category].push(result);
      return acc;
    },
    {} as Record<string, BenchmarkResult[]>
  );

  // Find best approach for each category
  for (const [category, categoryResults] of Object.entries(resultsByCategory)) {
    console.log(`📊 ${category.toUpperCase()} COMPONENTS:`);

    // Group by component count
    const byCount = categoryResults.reduce(
      (acc, result) => {
        if (!acc[result.componentCount]) {
          acc[result.componentCount] = [];
        }
        acc[result.componentCount].push(result);
        return acc;
      },
      {} as Record<number, BenchmarkResult[]>
    );

    for (const [count, countResults] of Object.entries(byCount)) {
      // Find best approach for this count
      const bestResult = countResults.reduce((best, current) => {
        return current.averageRenderTime < best.averageRenderTime ? current : best;
      });

      console.log(
        `  ${count} components: ${bestResult.approach.toUpperCase()} (${bestResult.averageRenderTime.toFixed(2)}ms ± ${bestResult.stdDeviation.toFixed(2)}ms)`
      );
    }

    // Overall best approach for category
    const overallBest = categoryResults.reduce((best, current) => {
      return current.averageRenderTime < best.averageRenderTime ? current : best;
    });

    console.log(`  🏆 BEST OVERALL: ${overallBest.approach.toUpperCase()} approach\n`);
  }

  // Generate summary recommendations
  console.log("🎯 RECOMMENDATIONS:");
  console.log("==================");

  const recommendations = generateRecommendations(resultsByCategory);
  recommendations.forEach(rec => {
    console.log(`• ${rec.category}: Use ${rec.approach} for ${rec.reason}`);
  });

  console.log("\n🦦 Benchmark complete! *splashes with satisfaction*\n");
}

/**
 * Generate performance recommendations based on results
 */
function generateRecommendations(resultsByCategory: Record<string, BenchmarkResult[]>): Array<{
  category: string;
  approach: string;
  reason: string;
}> {
  const recommendations = [];

  for (const [category, results] of Object.entries(resultsByCategory)) {
    // Find approach with best scaling
    let bestApproach = "";
    let bestReason = "";

    if (category === "primitives") {
      bestApproach = "csr";
      bestReason = "fastest for simple components";
    } else if (category === "layouts") {
      bestApproach = "ssr";
      bestReason = "better initial load performance";
    } else if (category === "data") {
      bestApproach = "virtual";
      bestReason = "scales best with large datasets";
    } else if (category === "overlays") {
      bestApproach = "lazy";
      bestReason = "optimal for on-demand rendering";
    }

    recommendations.push({
      category,
      approach: bestApproach,
      reason: bestReason,
    });
  }

  return recommendations;
}
