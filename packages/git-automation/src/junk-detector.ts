/**
 * 🦦 Junk File Detector
 *
 * Modular component for detecting development artifacts and junk files
 * that should not be committed to version control.
 */

import { glob } from "fast-glob";
import { execa } from "execa";
import chalk from "chalk";
import ora from "ora";

export interface JunkFileResult {
  category: "python" | "typescript" | "reynard" | "system";
  files: string[];
  count: number;
}

export interface JunkDetectionResult {
  totalFiles: number;
  categories: JunkFileResult[];
  hasJunk: boolean;
  recommendations: string[];
}

export class JunkFileDetector {
  private readonly patterns = {
    python: [
      "**/__pycache__/**",
      "**/*.pyc",
      "**/*.pyo",
      "**/*.pyd",
      "**/*.so",
      "**/venv/**",
      "**/.venv/**",
      "**/env/**",
      "**/.env/**",
      "**/build/**",
      "**/dist/**",
      "**/*.egg-info/**",
      "**/.pytest_cache/**",
      "**/.coverage",
      "**/htmlcov/**",
      "**/.vscode/**",
      "**/.idea/**",
      "**/*.swp",
      "**/*.swo",
      "**/.ropeproject/**",
      "**/.mypy_cache/**",
      "**/.tox/**",
      "**/*.log",
      "**/*.tmp",
      "**/*.temp",
    ],
    typescript: [
      "**/*.d.ts",
      "**/*.js.map",
      "**/*.d.ts.map",
      "**/dist/**",
      "**/build/**",
      "**/out/**",
      "**/node_modules/**",
      "**/.tsbuildinfo",
      "**/*.tsbuildinfo",
      "**/.eslintcache",
      "**/.stylelintcache",
      "**/coverage/**",
      "**/.nyc_output/**",
      "**/.vite/**",
      "**/.rollup.cache/**",
      "**/.turbo/**",
      "**/*.bundle.js",
      "**/*.chunk.js",
      "**/*.vendor.js",
    ],
    reynard: [
      "**/*.generated.*",
      "**/*.auto.*",
      "**/temp/**",
      "**/tmp/**",
      "**/.temp/**",
      "**/*.backup",
      "**/*.bak",
      "**/*.orig",
      "**/*.mcp.log",
      "**/mcp-*.json",
      "**/.mcp-cache/**",
      "**/mcp-temp/**",
      "**/*.sim.log",
      "**/ecs-*.json",
      "**/.ecs-cache/**",
      "**/simulation-temp/**",
      "**/agent-names-*.json",
      "**/.agent-cache/**",
      "**/*.agent.log",
      "**/agent-temp/**",
    ],
    system: [
      "**/.DS_Store",
      "**/.DS_Store?",
      "**/._*",
      "**/.Spotlight-V100",
      "**/.Trashes",
      "**/ehthumbs.db",
      "**/Thumbs.db",
    ],
  };

  /**
   * Detect junk files in the repository
   */
  async detectJunkFiles(workingDir: string = "."): Promise<JunkDetectionResult> {
    const spinner = ora("🔍 Scanning for junk files...").start();

    try {
      const categories: JunkFileResult[] = [];
      let totalFiles = 0;

      for (const [category, patterns] of Object.entries(this.patterns)) {
        const files = await glob(patterns, {
          cwd: workingDir,
          ignore: ["**/node_modules/**", "**/.git/**"],
          absolute: false,
        });

        if (files.length > 0) {
          categories.push({
            category: category as JunkFileResult["category"],
            files,
            count: files.length,
          });
          totalFiles += files.length;
        }
      }

      const hasJunk = totalFiles > 0;
      const recommendations = this.generateRecommendations(categories);

      spinner.succeed(`Found ${totalFiles} potential junk files`);

      return {
        totalFiles,
        categories,
        hasJunk,
        recommendations,
      };
    } catch (error) {
      spinner.fail("Failed to detect junk files");
      throw error;
    }
  }

  /**
   * Generate recommendations for handling junk files
   */
  private generateRecommendations(categories: JunkFileResult[]): string[] {
    const recommendations: string[] = [];

    if (categories.length === 0) {
      return ["✅ Repository is clean - no junk files detected"];
    }

    recommendations.push("🔧 Recommended actions:");
    recommendations.push("1. Review each file to determine if it should be committed");
    recommendations.push("2. Add appropriate patterns to .gitignore if needed");
    recommendations.push("3. Remove or clean up unnecessary files");
    recommendations.push("4. Re-run detection after cleanup");

    // Category-specific recommendations
    for (const category of categories) {
      switch (category.category) {
        case "python":
          recommendations.push(
            `🐍 Python artifacts (${category.count} files): Consider adding Python patterns to .gitignore`
          );
          break;
        case "typescript":
          recommendations.push(
            `📦 TypeScript/JS artifacts (${category.count} files): Consider adding build output patterns to .gitignore`
          );
          break;
        case "reynard":
          recommendations.push(
            `🦊 Reynard-specific artifacts (${category.count} files): Consider adding Reynard patterns to .gitignore`
          );
          break;
        case "system":
          recommendations.push(
            `💻 System files (${category.count} files): Consider adding system file patterns to .gitignore`
          );
          break;
      }
    }

    return recommendations;
  }

  /**
   * Display junk file detection results
   */
  displayResults(result: JunkDetectionResult): void {
    console.log(chalk.blue("\n📊 Junk File Detection Results:"));
    console.log(chalk.blue("=".repeat(40)));

    if (!result.hasJunk) {
      console.log(chalk.green("✅ No junk files detected! Repository is clean."));
      return;
    }

    console.log(chalk.red(`⚠️  POTENTIAL JUNK FILES DETECTED!`));
    console.log(chalk.yellow(`📋 Total potential junk files: ${result.totalFiles} files\n`));

    for (const category of result.categories) {
      const emoji = this.getCategoryEmoji(category.category);
      console.log(chalk.cyan(`${emoji} ${category.category} artifacts: ${category.count} files`));

      // Show first 5 files as examples
      const examples = category.files.slice(0, 5);
      examples.forEach(file => {
        console.log(chalk.gray(`   ${file}`));
      });

      if (category.files.length > 5) {
        console.log(chalk.gray(`   ... and ${category.files.length - 5} more files`));
      }
      console.log();
    }

    console.log(chalk.yellow("🔧 Recommendations:"));
    result.recommendations.forEach(rec => {
      console.log(chalk.gray(`   ${rec}`));
    });
  }

  /**
   * Get emoji for category
   */
  private getCategoryEmoji(category: string): string {
    const emojis = {
      python: "🐍",
      typescript: "📦",
      reynard: "🦊",
      system: "💻",
    };
    return emojis[category as keyof typeof emojis] || "📁";
  }

  /**
   * Clean up junk files (with confirmation)
   */
  async cleanupJunkFiles(result: JunkDetectionResult, dryRun: boolean = true): Promise<void> {
    if (!result.hasJunk) {
      console.log(chalk.green("✅ No junk files to clean up"));
      return;
    }

    if (dryRun) {
      console.log(chalk.yellow("🧹 Dry run - no files will be deleted"));
      console.log(chalk.yellow("Use --force flag to actually delete files"));
      return;
    }

    const spinner = ora("🧹 Cleaning up junk files...").start();

    try {
      for (const category of result.categories) {
        for (const file of category.files) {
          try {
            await execa("rm", ["-rf", file]);
          } catch (error) {
            // Ignore errors for files that don't exist
          }
        }
      }

      spinner.succeed(`Cleaned up ${result.totalFiles} junk files`);
    } catch (error) {
      spinner.fail("Failed to clean up junk files");
      throw error;
    }
  }
}
