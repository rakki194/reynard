/**
 * @fileoverview Global setup for component rendering benchmarks
 *
 * Initializes the benchmark environment, sets up performance monitoring,
 * and prepares the test infrastructure for consistent benchmark results.
 *
 * @author Pool-Theorist-35 (Reynard Otter Specialist)
 * @since 1.0.0
 */

import { FullConfig } from "@playwright/test";
import { mkdirSync, writeFileSync } from "fs";
import { cpus, totalmem } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function globalSetup(config: FullConfig) {
  console.log("🦦 Setting up benchmark environment...");

  // Create results directory
  const resultsDir = join(__dirname, "../../results");
  try {
    mkdirSync(resultsDir, { recursive: true });
    console.log("✅ Created results directory");
  } catch (error) {
    console.log("ℹ️ Results directory already exists");
  }

  // Create benchmark-specific directories
  const benchmarkDirs = ["benchmark-results", "benchmark-artifacts", "benchmark-reports"];

  for (const dir of benchmarkDirs) {
    try {
      mkdirSync(join(resultsDir, dir), { recursive: true });
      console.log(`✅ Created ${dir} directory`);
    } catch (error) {
      console.log(`ℹ️ ${dir} directory already exists`);
    }
  }

  // Initialize benchmark configuration
  const benchmarkConfig = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpus: cpus().length,
      memory: totalmem(),
    },
    config: {
      iterations: 10,
      warmupRuns: 3,
      componentCounts: [1, 10, 50, 100, 500],
      renderingApproaches: ["csr", "ssr", "lazy", "virtual", "static"],
    },
    categories: [
      { name: "primitives", components: ["Button", "Card", "TextField"] },
      { name: "layouts", components: ["AppLayout", "Grid", "DataTable"] },
      { name: "data", components: ["Charts", "Gallery", "List"] },
      { name: "overlays", components: ["Modal", "Drawer", "FloatingPanel"] },
    ],
  };

  // Save configuration
  writeFileSync(join(resultsDir, "benchmark-config.json"), JSON.stringify(benchmarkConfig, null, 2));

  console.log("✅ Benchmark configuration saved");

  // Create animation control utilities documentation
  const animationControlDoc = `/**
 * Animation Control for Benchmark Tests
 *
 * Use the animation-control utilities to ensure consistent timing:
 *
 * import { disableAnimations, setupBenchmarkPage } from '../core/utils/animation-control';
 *
 * // In your test:
 * await setupBenchmarkPage(page, 'http://localhost:3000');
 * // or
 * await disableAnimations(page);
 */`;

  writeFileSync(join(resultsDir, "animation-control-guide.md"), animationControlDoc);
  console.log("✅ Animation control guide created");

  console.log("🦦 *splashes with anticipation* Benchmark environment ready!\n");
}

export default globalSetup;
