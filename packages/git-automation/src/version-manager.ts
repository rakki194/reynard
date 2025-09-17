/**
 * 📦 Version Manager
 *
 * Modular component for managing package versions and Git tags
 * with semantic versioning support.
 */

import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { execa } from "execa";
import semver from "semver";
import chalk from "chalk";
import ora from "ora";

export interface VersionInfo {
  current: string;
  next: string;
  bumpType: "major" | "minor" | "patch";
}

export interface PackageVersionInfo {
  name: string;
  currentVersion: string;
  nextVersion: string;
  bumpType: "major" | "minor" | "patch";
  path: string;
}

export class VersionManager {
  private readonly workingDir: string;
  private readonly packageJsonPath: string;

  constructor(workingDir: string = ".") {
    this.workingDir = workingDir;
    this.packageJsonPath = join(workingDir, "package.json");
  }

  /**
   * Get current version from package.json
   */
  async getCurrentVersion(): Promise<string> {
    try {
      const content = await readFile(this.packageJsonPath, "utf-8");
      const packageJson = JSON.parse(content);

      if (!packageJson.version) {
        throw new Error("No version field found in package.json");
      }

      return packageJson.version;
    } catch (error) {
      throw new Error(`Failed to read current version: ${error}`);
    }
  }

  /**
   * Calculate next version based on bump type
   */
  calculateNextVersion(currentVersion: string, bumpType: "major" | "minor" | "patch"): string {
    if (!semver.valid(currentVersion)) {
      throw new Error(`Invalid current version: ${currentVersion}`);
    }

    return semver.inc(currentVersion, bumpType) || currentVersion;
  }

  /**
   * Update package.json version
   */
  async updateVersion(newVersion: string): Promise<void> {
    const spinner = ora(`📦 Updating version to ${newVersion}...`).start();

    try {
      const content = await readFile(this.packageJsonPath, "utf-8");
      const packageJson = JSON.parse(content);

      packageJson.version = newVersion;

      await writeFile(this.packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n", "utf-8");

      spinner.succeed(`Version updated to ${newVersion}`);
    } catch (error) {
      spinner.fail("Failed to update version");
      throw error;
    }
  }

  /**
   * Create Git tag for version
   */
  async createGitTag(version: string, message?: string): Promise<void> {
    const spinner = ora(`🏷️  Creating Git tag v${version}...`).start();

    try {
      const tagName = `v${version}`;
      const tagMessage = message || `Release ${tagName}`;

      await execa("git", ["tag", "-a", tagName, "-m", tagMessage], {
        cwd: this.workingDir,
      });

      spinner.succeed(`Created Git tag ${tagName}`);
    } catch (error) {
      spinner.fail("Failed to create Git tag");
      throw error;
    }
  }

  /**
   * Push Git tag to remote
   */
  async pushGitTag(version: string): Promise<void> {
    const spinner = ora(`🚀 Pushing Git tag v${version}...`).start();

    try {
      const tagName = `v${version}`;

      await execa("git", ["push", "origin", tagName], {
        cwd: this.workingDir,
      });

      spinner.succeed(`Pushed Git tag ${tagName}`);
    } catch (error) {
      spinner.fail("Failed to push Git tag");
      throw error;
    }
  }

  /**
   * Get all existing Git tags
   */
  async getGitTags(): Promise<string[]> {
    try {
      const { stdout } = await execa("git", ["tag", "--list", "--sort=-version:refname"], {
        cwd: this.workingDir,
      });

      return stdout
        .trim()
        .split("\n")
        .filter(tag => tag.trim());
    } catch (error) {
      return [];
    }
  }

  /**
   * Get the latest Git tag
   */
  async getLatestGitTag(): Promise<string | null> {
    const tags = await this.getGitTags();
    return tags.length > 0 ? tags[0] : null;
  }

  /**
   * Check if a Git tag exists
   */
  async gitTagExists(version: string): Promise<boolean> {
    const tagName = `v${version}`;
    const tags = await this.getGitTags();
    return tags.includes(tagName);
  }

  /**
   * Delete a Git tag (local and remote)
   */
  async deleteGitTag(version: string): Promise<void> {
    const spinner = ora(`🗑️  Deleting Git tag v${version}...`).start();

    try {
      const tagName = `v${version}`;

      // Delete local tag
      await execa("git", ["tag", "-d", tagName], {
        cwd: this.workingDir,
      });

      // Delete remote tag
      await execa("git", ["push", "origin", "--delete", tagName], {
        cwd: this.workingDir,
      });

      spinner.succeed(`Deleted Git tag ${tagName}`);
    } catch (error) {
      spinner.fail("Failed to delete Git tag");
      throw error;
    }
  }

  /**
   * Get version information for all packages in monorepo
   */
  async getMonorepoVersions(): Promise<PackageVersionInfo[]> {
    const spinner = ora("📦 Analyzing monorepo package versions...").start();

    try {
      const packages: PackageVersionInfo[] = [];

      // Get root package version
      const rootVersion = await this.getCurrentVersion();
      packages.push({
        name: "root",
        currentVersion: rootVersion,
        nextVersion: rootVersion, // Will be calculated later
        bumpType: "patch",
        path: this.workingDir,
      });

      // Find all package.json files in packages directory
      const { stdout } = await execa("find", ["packages", "-name", "package.json", "-type", "f"], {
        cwd: this.workingDir,
      });

      const packagePaths = stdout
        .trim()
        .split("\n")
        .filter(path => path.trim());

      for (const packagePath of packagePaths) {
        try {
          const fullPath = join(this.workingDir, packagePath);
          const content = await readFile(fullPath, "utf-8");
          const packageJson = JSON.parse(content);

          if (packageJson.version) {
            packages.push({
              name: packageJson.name || "unknown",
              currentVersion: packageJson.version,
              nextVersion: packageJson.version, // Will be calculated later
              bumpType: "patch",
              path: fullPath,
            });
          }
        } catch (error) {
          // Skip packages that can't be read
          continue;
        }
      }

      spinner.succeed(`Found ${packages.length} packages with versions`);
      return packages;
    } catch (error) {
      spinner.fail("Failed to analyze monorepo versions");
      throw error;
    }
  }

  /**
   * Update all package versions in monorepo
   */
  async updateMonorepoVersions(bumpType: "major" | "minor" | "patch"): Promise<void> {
    const spinner = ora("📦 Updating all package versions...").start();

    try {
      const packages = await this.getMonorepoVersions();
      let updatedCount = 0;

      for (const pkg of packages) {
        const nextVersion = this.calculateNextVersion(pkg.currentVersion, bumpType);

        if (nextVersion !== pkg.currentVersion) {
          await this.updatePackageVersion(pkg.path, nextVersion);
          updatedCount++;
        }
      }

      spinner.succeed(`Updated ${updatedCount} package versions`);
    } catch (error) {
      spinner.fail("Failed to update monorepo versions");
      throw error;
    }
  }

  /**
   * Update version in a specific package.json file
   */
  private async updatePackageVersion(packagePath: string, newVersion: string): Promise<void> {
    try {
      const content = await readFile(packagePath, "utf-8");
      const packageJson = JSON.parse(content);

      packageJson.version = newVersion;

      await writeFile(packagePath, JSON.stringify(packageJson, null, 2) + "\n", "utf-8");
    } catch (error) {
      throw new Error(`Failed to update version in ${packagePath}: ${error}`);
    }
  }

  /**
   * Generate release notes from changelog
   */
  async generateReleaseNotes(version: string, changelogPath?: string): Promise<string> {
    try {
      const path = changelogPath || join(this.workingDir, "CHANGELOG.md");
      const content = await readFile(path, "utf-8");

      // Extract release notes for the specific version
      const versionSection = this.extractVersionSection(content, version);

      if (!versionSection) {
        return `Release ${version}\n\nNo release notes available.`;
      }

      return versionSection;
    } catch (error) {
      return `Release ${version}\n\nFailed to generate release notes: ${error}`;
    }
  }

  /**
   * Extract version section from changelog content
   */
  private extractVersionSection(content: string, version: string): string | null {
    const lines = content.split("\n");
    const versionHeader = `## [${version}]`;

    let startIndex = -1;
    let endIndex = -1;

    // Find the start of the version section
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith(versionHeader)) {
        startIndex = i;
        break;
      }
    }

    if (startIndex === -1) {
      return null;
    }

    // Find the end of the version section (next version header or end of file)
    for (let i = startIndex + 1; i < lines.length; i++) {
      if (lines[i].trim().startsWith("## [")) {
        endIndex = i;
        break;
      }
    }

    if (endIndex === -1) {
      endIndex = lines.length;
    }

    // Extract the section
    const sectionLines = lines.slice(startIndex, endIndex);
    return sectionLines.join("\n").trim();
  }

  /**
   * Display version information
   */
  displayVersionInfo(info: VersionInfo): void {
    console.log(chalk.blue("\n📦 Version Information:"));
    console.log(chalk.blue("=".repeat(30)));

    console.log(chalk.cyan(`Current version: ${info.current}`));
    console.log(chalk.green(`Next version: ${info.next}`));
    console.log(chalk.yellow(`Bump type: ${info.bumpType}`));
  }

  /**
   * Display monorepo version information
   */
  displayMonorepoVersions(packages: PackageVersionInfo[]): void {
    console.log(chalk.blue("\n📦 Monorepo Package Versions:"));
    console.log(chalk.blue("=".repeat(40)));

    for (const pkg of packages) {
      console.log(chalk.cyan(`${pkg.name}: ${pkg.currentVersion}`));
    }
  }

  /**
   * Validate version format
   */
  validateVersion(version: string): boolean {
    return semver.valid(version) !== null;
  }

  /**
   * Compare two versions
   */
  compareVersions(version1: string, version2: string): number {
    return semver.compare(version1, version2);
  }

  /**
   * Check if version is greater than another
   */
  isVersionGreater(version1: string, version2: string): boolean {
    return semver.gt(version1, version2);
  }

  /**
   * Get version bump type between two versions
   */
  getBumpType(fromVersion: string, toVersion: string): "major" | "minor" | "patch" | null {
    if (!semver.valid(fromVersion) || !semver.valid(toVersion)) {
      return null;
    }

    if (semver.major(fromVersion) !== semver.major(toVersion)) {
      return "major";
    }

    if (semver.minor(fromVersion) !== semver.minor(toVersion)) {
      return "minor";
    }

    if (semver.patch(fromVersion) !== semver.patch(toVersion)) {
      return "patch";
    }

    return null;
  }
}
