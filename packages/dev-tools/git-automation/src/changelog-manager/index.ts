/**
 * 📚 Changelog Manager
 *
 * Main entry point for the changelog manager module
 */

import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import chalk from "chalk";
import ora from "ora";
import { ChangelogParser } from "./parser";
import { ChangelogGenerator } from "./generator";
import type { ChangelogStructure, ChangelogEntry } from "./types";

export class ChangelogManager {
  private readonly changelogPath: string;
  private readonly dateFormat = "YYYY-MM-DD";
  private parser = new ChangelogParser();
  private generator = new ChangelogGenerator();

  constructor(workingDir: string = ".") {
    this.changelogPath = join(workingDir, "CHANGELOG.md");
  }

  /**
   * Read and parse the current CHANGELOG.md
   */
  async readChangelog(): Promise<ChangelogStructure> {
    const spinner = ora("📚 Reading CHANGELOG.md...").start();

    try {
      const content = await readFile(this.changelogPath, "utf-8");
      const structure = this.parser.parseChangelog(content);

      spinner.succeed("CHANGELOG.md read successfully");
      return structure;
    } catch (error) {
      spinner.fail("Failed to read CHANGELOG.md");
      throw error;
    }
  }

  /**
   * Write changelog structure to file
   */
  async writeChangelog(structure: ChangelogStructure): Promise<void> {
    const spinner = ora("📝 Writing CHANGELOG.md...").start();

    try {
      const content = this.generator.generateChangelogContent(structure);
      await writeFile(this.changelogPath, content, "utf-8");

      spinner.succeed("CHANGELOG.md written successfully");
    } catch (error) {
      spinner.fail("Failed to write CHANGELOG.md");
      throw error;
    }
  }

  /**
   * Add entry to unreleased section
   */
  async addEntry(entry: ChangelogEntry): Promise<void> {
    const structure = await this.readChangelog();
    structure.unreleased.push(entry);
    await this.writeChangelog(structure);
  }

  /**
   * Promote unreleased entries to a new version
   */
  async promoteToVersion(version: string): Promise<void> {
    const structure = await this.readChangelog();

    if (structure.unreleased.length === 0) {
      console.log(chalk.yellow("No unreleased entries to promote"));
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    structure.releases.unshift({
      version,
      date: today,
      entries: [...structure.unreleased],
    });

    structure.unreleased = [];
    await this.writeChangelog(structure);

    console.log(chalk.green(`✅ Promoted ${structure.releases[0].entries.length} entries to version ${version}`));
  }

  /**
   * Get current version from changelog
   */
  getCurrentVersion(structure: ChangelogStructure): string | null {
    if (structure.releases.length === 0) return null;
    return structure.releases[0].version;
  }

  /**
   * Get next version based on change types
   */
  getNextVersion(currentVersion: string, changeTypes: string[]): string {
    const [major, minor, patch] = currentVersion.split(".").map(Number);

    if (changeTypes.includes("breaking") || changeTypes.includes("major")) {
      return `${major + 1}.0.0`;
    }

    if (changeTypes.includes("feature") || changeTypes.includes("minor")) {
      return `${major}.${minor + 1}.0`;
    }

    return `${major}.${minor}.${patch + 1}`;
  }
}

// Re-export types
export * from "./types";
