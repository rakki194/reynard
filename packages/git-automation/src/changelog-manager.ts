/**
 * 📚 Changelog Manager
 *
 * Modular component for managing CHANGELOG.md files with proper
 * version promotion and structure maintenance.
 */

import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import chalk from "chalk";
import ora from "ora";

export interface ChangelogEntry {
  type: "added" | "changed" | "deprecated" | "removed" | "fixed" | "security";
  description: string;
}

export interface ChangelogSection {
  version: string;
  date: string;
  entries: ChangelogEntry[];
}

export interface ChangelogStructure {
  header: string;
  unreleased: ChangelogEntry[];
  releases: ChangelogSection[];
}

export class ChangelogManager {
  private readonly changelogPath: string;
  private readonly dateFormat = "YYYY-MM-DD";

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
      const structure = this.parseChangelog(content);

      spinner.succeed("CHANGELOG.md read successfully");
      return structure;
    } catch (error) {
      spinner.fail("Failed to read CHANGELOG.md");
      throw error;
    }
  }

  /**
   * Parse CHANGELOG.md content into structured format
   */
  private parseChangelog(content: string): ChangelogStructure {
    const lines = content.split("\n");
    const structure: ChangelogStructure = {
      header: "",
      unreleased: [],
      releases: [],
    };

    let currentSection: "header" | "unreleased" | "release" = "header";
    let currentRelease: ChangelogSection | null = null;
    let currentType: ChangelogEntry["type"] | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) continue;

      // Check for unreleased section
      if (trimmedLine.startsWith("## [Unreleased]")) {
        currentSection = "unreleased";
        continue;
      }

      // Check for version release section (more flexible date format)
      const versionMatch = trimmedLine.match(/^## \[([^\]]+)\] - (.+)$/);
      if (versionMatch) {
        if (currentRelease) {
          structure.releases.push(currentRelease);
        }
        currentRelease = {
          version: versionMatch[1],
          date: versionMatch[2],
          entries: [],
        };
        currentSection = "release";
        continue;
      }

      // Check for entry type headers
      if (trimmedLine.startsWith("### ")) {
        const typeMatch = trimmedLine.match(/^### (Added|Changed|Deprecated|Removed|Fixed|Security)$/i);
        if (typeMatch) {
          currentType = typeMatch[1].toLowerCase() as ChangelogEntry["type"];
          continue;
        }
      }

      // Check for entry items
      if (trimmedLine.startsWith("- ") && currentType) {
        const description = trimmedLine.substring(2);
        const entry: ChangelogEntry = {
          type: currentType,
          description,
        };

        if (currentSection === "unreleased") {
          structure.unreleased.push(entry);
        } else if (currentSection === "release" && currentRelease) {
          currentRelease.entries.push(entry);
        }
        continue;
      }

      // Handle header content
      if (currentSection === "header") {
        if (structure.header) {
          structure.header += "\n";
        }
        structure.header += line;
      }
    }

    // Add the last release if it exists
    if (currentRelease) {
      structure.releases.push(currentRelease);
    }

    return structure;
  }

  /**
   * Promote unreleased changes to a versioned release
   */
  async promoteUnreleasedToRelease(version: string, date: string): Promise<void> {
    const spinner = ora(`📚 Promoting unreleased changes to v${version}...`).start();

    try {
      const structure = await this.readChangelog();

      if (structure.unreleased.length === 0) {
        spinner.warn("No unreleased changes to promote");
        return;
      }

      // Create new release section
      const newRelease: ChangelogSection = {
        version,
        date,
        entries: [...structure.unreleased],
      };

      // Add to releases (at the beginning for chronological order)
      structure.releases.unshift(newRelease);

      // Clear unreleased entries
      structure.unreleased = [];

      // Write updated changelog
      await this.writeChangelog(structure);

      spinner.succeed(`Promoted ${newRelease.entries.length} changes to v${version}`);
    } catch (error) {
      spinner.fail("Failed to promote unreleased changes");
      throw error;
    }
  }

  /**
   * Add new entry to unreleased section
   */
  async addUnreleasedEntry(type: ChangelogEntry["type"], description: string): Promise<void> {
    const spinner = ora("📚 Adding entry to unreleased section...").start();

    try {
      const structure = await this.readChangelog();

      const entry: ChangelogEntry = {
        type,
        description,
      };

      structure.unreleased.push(entry);

      await this.writeChangelog(structure);

      spinner.succeed("Added entry to unreleased section");
    } catch (error) {
      spinner.fail("Failed to add unreleased entry");
      throw error;
    }
  }

  /**
   * Write changelog structure back to file
   */
  private async writeChangelog(structure: ChangelogStructure): Promise<void> {
    const content = this.generateChangelogContent(structure);
    await writeFile(this.changelogPath, content, "utf-8");
  }

  /**
   * Generate CHANGELOG.md content from structure
   */
  private generateChangelogContent(structure: ChangelogStructure): string {
    const lines: string[] = [];

    // Add header
    if (structure.header) {
      lines.push(structure.header);
      lines.push("");
    }

    // Add unreleased section
    lines.push("## [Unreleased]");
    lines.push("");

    if (structure.unreleased.length === 0) {
      lines.push("### Added");
      lines.push("");
      lines.push("### Changed");
      lines.push("");
      lines.push("### Deprecated");
      lines.push("");
      lines.push("### Removed");
      lines.push("");
      lines.push("### Fixed");
      lines.push("");
      lines.push("### Security");
      lines.push("");
    } else {
      // Group entries by type
      const entriesByType = this.groupEntriesByType(structure.unreleased);

      const typeOrder: ChangelogEntry["type"][] = ["added", "changed", "deprecated", "removed", "fixed", "security"];

      for (const type of typeOrder) {
        const entries = entriesByType[type] || [];
        if (entries.length > 0) {
          lines.push(`### ${this.capitalizeType(type)}`);
          lines.push("");
          for (const entry of entries) {
            lines.push(`- ${entry.description}`);
          }
          lines.push("");
        }
      }
    }

    // Add versioned releases
    for (const release of structure.releases) {
      lines.push(`## [${release.version}] - ${release.date}`);
      lines.push("");

      // Group entries by type
      const entriesByType = this.groupEntriesByType(release.entries);

      const typeOrder: ChangelogEntry["type"][] = ["added", "changed", "deprecated", "removed", "fixed", "security"];

      for (const type of typeOrder) {
        const entries = entriesByType[type] || [];
        if (entries.length > 0) {
          lines.push(`### ${this.capitalizeType(type)}`);
          lines.push("");
          for (const entry of entries) {
            lines.push(`- ${entry.description}`);
          }
          lines.push("");
        }
      }
    }

    return lines.join("\n");
  }

  /**
   * Group entries by type
   */
  private groupEntriesByType(entries: ChangelogEntry[]): Record<ChangelogEntry["type"], ChangelogEntry[]> {
    const grouped: Record<ChangelogEntry["type"], ChangelogEntry[]> = {
      added: [],
      changed: [],
      deprecated: [],
      removed: [],
      fixed: [],
      security: [],
    };

    for (const entry of entries) {
      grouped[entry.type].push(entry);
    }

    return grouped;
  }

  /**
   * Capitalize type for display
   */
  private capitalizeType(type: ChangelogEntry["type"]): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  /**
   * Validate changelog structure
   */
  async validateChangelog(): Promise<{ valid: boolean; issues: string[] }> {
    const spinner = ora("📚 Validating CHANGELOG.md structure...").start();

    try {
      const structure = await this.readChangelog();
      const issues: string[] = [];

      // Check for unreleased section
      if (!structure.unreleased || structure.unreleased.length === 0) {
        // This is actually valid - empty unreleased section is okay
        // Only check if the section header exists in the content
        const content = await readFile(this.changelogPath, "utf-8");
        if (!content.includes("## [Unreleased]")) {
          issues.push("Missing [Unreleased] section");
        }
      }

      // Check for proper version format
      for (const release of structure.releases) {
        if (!/^\d+\.\d+\.\d+$/.test(release.version)) {
          issues.push(`Invalid version format: ${release.version}`);
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(release.date)) {
          issues.push(`Invalid date format: ${release.date}`);
        }
      }

      // Check for chronological order (newest first)
      for (let i = 1; i < structure.releases.length; i++) {
        const current = new Date(structure.releases[i].date);
        const previous = new Date(structure.releases[i - 1].date);

        if (current > previous) {
          issues.push("Releases are not in chronological order (newest first)");
          break;
        }
      }

      const valid = issues.length === 0;

      if (valid) {
        spinner.succeed("CHANGELOG.md structure is valid");
      } else {
        spinner.fail(`CHANGELOG.md has ${issues.length} issues`);
      }

      return { valid, issues };
    } catch (error) {
      spinner.fail("Failed to validate CHANGELOG.md");
      throw error;
    }
  }

  /**
   * Display changelog structure
   */
  displayChangelog(structure: ChangelogStructure): void {
    console.log(chalk.blue("\n📚 CHANGELOG.md Structure:"));
    console.log(chalk.blue("=".repeat(40)));

    console.log(chalk.cyan(`📝 Unreleased entries: ${structure.unreleased.length}`));

    if (structure.unreleased.length > 0) {
      const entriesByType = this.groupEntriesByType(structure.unreleased);
      for (const [type, entries] of Object.entries(entriesByType)) {
        if (entries.length > 0) {
          console.log(chalk.gray(`  ${this.capitalizeType(type as ChangelogEntry["type"])}: ${entries.length}`));
        }
      }
    }

    console.log(chalk.cyan(`📦 Versioned releases: ${structure.releases.length}`));

    if (structure.releases.length > 0) {
      console.log(chalk.gray("Recent releases:"));
      for (const release of structure.releases.slice(0, 3)) {
        console.log(chalk.gray(`  v${release.version} (${release.date}): ${release.entries.length} entries`));
      }
    }
  }

  /**
   * Get current date in the required format
   */
  getCurrentDate(): string {
    const now = new Date();
    return now.toISOString().split("T")[0];
  }
}
