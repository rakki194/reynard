#!/usr/bin/env node
/**
 * 🦊 Watch Command Handler
 *
 * *whiskers twitch with intelligence* Handles file watching and
 * continuous analysis for development workflows.
 */

import { watch } from "chokidar";
import { join } from "path";
import { CodeQualityAnalyzer } from "../CodeQualityAnalyzer";

export interface WatchOptions {
  project: string;
  interval: string;
}

export async function handleWatchCommand(options: WatchOptions): Promise<void> {
  console.log("🦊 Starting file watcher...");

  const watcher = watch(join(options.project, "**/*"), {
    ignored: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.git/**",
      "**/venv/**",
      "**/__pycache__/**",
      "**/third_party/**",
    ],
    persistent: true,
  });

  let isAnalyzing = false;

  watcher.on("change", async (path: string) => {
    if (isAnalyzing) return;

    isAnalyzing = true;
    console.log(`📁 File changed: ${path}`);

    try {
      // Run quick analysis
      const analyzer = new CodeQualityAnalyzer(options.project);
      const result = await analyzer.analyzeProject();

      console.log(`✅ Analysis complete: ${result.issues.length} issues found`);

      // Show critical issues
      const criticalIssues = result.issues.filter(
        issue => issue.severity === "CRITICAL" || issue.severity === "BLOCKER"
      );

      if (criticalIssues.length > 0) {
        console.log("🚨 Critical issues found:");
        for (const issue of criticalIssues) {
          console.log(`   ${issue.severity}: ${issue.message} (${issue.file}:${issue.line})`);
        }
      }
    } catch (error: any) {
      console.error("❌ Analysis failed:", error.message);
    } finally {
      isAnalyzing = false;
    }
  });

  console.log("👀 Watching for changes... (Press Ctrl+C to stop)");
}
