/**
 * 🦦 Junk File Detector
 *
 * Detects development artifacts and junk files
 */

import { glob } from "fast-glob";
import { execa } from "execa";
import chalk from "chalk";
import ora from "ora";
import type { JunkFileResult, JunkDetectionResult } from "./types";

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
    ],
    typescript: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/.nuxt/**",
      "**/.cache/**",
      "**/.parcel-cache/**",
      "**/.vscode/**",
      "**/.idea/**",
      "**/*.log",
      "**/*.tmp",
      "**/*.temp",
      "**/.DS_Store",
      "**/Thumbs.db",
    ],
    reynard: ["**/.reynard/**", "**/reynard-cache/**", "**/reynard-temp/**", "**/.reynard-temp/**"],
    system: [
      "**/.DS_Store",
      "**/Thumbs.db",
      "**/.Spotlight-V100",
      "**/.Trashes",
      "**/.fseventsd",
      "**/.TemporaryItems",
      "**/.VolumeIcon.icns",
      "**/.com.apple.timemachine.donotpresent",
    ],
  };

  /**
   * Detect junk files in the repository
   */
  async detectJunkFiles(workingDir: string = "."): Promise<JunkDetectionResult> {
    const spinner = ora("🔍 Detecting junk files...").start();

    try {
      const categories: JunkFileResult[] = [];

      for (const [category, patterns] of Object.entries(this.patterns)) {
        const files = await this.findFiles(patterns, workingDir);
        if (files.length > 0) {
          categories.push({
            category: category as JunkFileResult["category"],
            files,
            count: files.length,
          });
        }
      }

      const totalFiles = categories.reduce((sum, cat) => sum + cat.count, 0);
      const hasJunk = totalFiles > 0;
      const recommendations = this.generateRecommendations(categories);

      const result: JunkDetectionResult = {
        totalFiles,
        categories,
        hasJunk,
        recommendations,
      };

      spinner.succeed(`Found ${totalFiles} junk files`);
      return result;
    } catch (error) {
      spinner.fail("Failed to detect junk files");
      throw error;
    }
  }

  /**
   * Clean up junk files
   */
  async cleanupJunkFiles(result: JunkDetectionResult, dryRun: boolean = false): Promise<void> {
    if (!result.hasJunk) {
      console.log(chalk.green("✅ No junk files to clean up"));
      return;
    }

    const spinner = ora("🧹 Cleaning up junk files...").start();

    try {
      for (const category of result.categories) {
        for (const file of category.files) {
          if (dryRun) {
            console.log(chalk.yellow(`Would remove: ${file}`));
          } else {
            await this.removeFile(file);
          }
        }
      }

      if (dryRun) {
        spinner.succeed("Dry run completed");
      } else {
        spinner.succeed(`Cleaned up ${result.totalFiles} junk files`);
      }
    } catch (error) {
      spinner.fail("Failed to clean up junk files");
      throw error;
    }
  }

  /**
   * Display detection results
   */
  displayResults(result: JunkDetectionResult): void {
    console.log(chalk.blue("\n🔍 Junk File Detection Results:"));
    console.log(chalk.blue("=".repeat(40)));

    if (!result.hasJunk) {
      console.log(chalk.green("✅ No junk files found"));
      return;
    }

    console.log(chalk.red(`❌ Found ${result.totalFiles} junk files`));

    for (const category of result.categories) {
      const emoji = this.getCategoryEmoji(category.category);
      console.log(chalk.yellow(`\n${emoji} ${category.category}: ${category.count} files`));

      for (const file of category.files.slice(0, 5)) {
        console.log(chalk.gray(`  - ${file}`));
      }

      if (category.files.length > 5) {
        console.log(chalk.gray(`  ... and ${category.files.length - 5} more`));
      }
    }

    if (result.recommendations.length > 0) {
      console.log(chalk.blue("\n💡 Recommendations:"));
      for (const rec of result.recommendations) {
        console.log(chalk.gray(`  - ${rec}`));
      }
    }
  }

  private async findFiles(patterns: string[], workingDir: string): Promise<string[]> {
    try {
      const files = await glob(patterns, {
        cwd: workingDir,
        absolute: true,
        ignore: ["**/.git/**"],
      });
      return files;
    } catch (error) {
      console.warn(`Failed to search for patterns: ${patterns.join(", ")}`);
      return [];
    }
  }

  private async removeFile(file: string): Promise<void> {
    try {
      await execa("rm", ["-rf", file]);
    } catch (error) {
      console.warn(`Failed to remove file: ${file}`);
    }
  }

  private generateRecommendations(categories: JunkFileResult[]): string[] {
    const recommendations: string[] = [];

    if (categories.some(cat => cat.category === "python")) {
      recommendations.push("Add Python-specific patterns to .gitignore");
    }

    if (categories.some(cat => cat.category === "typescript")) {
      recommendations.push("Add Node.js patterns to .gitignore");
    }

    if (categories.some(cat => cat.category === "system")) {
      recommendations.push("Add system files to .gitignore");
    }

    return recommendations;
  }

  private getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      python: "🐍",
      typescript: "📦",
      reynard: "🦊",
      system: "💻",
    };
    return emojis[category] || "📁";
  }
}
