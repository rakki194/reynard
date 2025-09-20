/**
 * 📦 Version Manager
 *
 * Manages package versions and version bumping
 */

import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { execa } from "execa";
// import chalk from "chalk"; // Removed unused import
import ora from "ora";
import type { ChangeAnalysisResult } from "../change-analyzer/types";
import type { VersionInfo } from "./types";

export class VersionManager {
  private readonly packageJsonPath: string;
  private readonly workingDir: string;

  constructor(workingDir: string = ".") {
    this.workingDir = workingDir;
    this.packageJsonPath = join(workingDir, "package.json");
  }

  /**
   * Get current version from package.json
   */
  async getCurrentVersion(): Promise<string> {
    try {
      const packageJsonContent = await readFile(this.packageJsonPath, "utf-8");
      const packageJson = JSON.parse(packageJsonContent);
      return packageJson.version || "0.0.0";
    } catch (error) {
      console.warn("Failed to read package.json, using default version");
      return "0.0.0";
    }
  }

  /**
   * Bump version based on change analysis
   */
  async bumpVersion(bumpType: "major" | "minor" | "patch"): Promise<void> {
    const spinner = ora("📦 Bumping version...").start();

    try {
      const currentVersion = await this.getCurrentVersion();
      const nextVersion = this.calculateNextVersion(currentVersion, bumpType);

      await this.updatePackageJson(nextVersion);
      await this.createGitTag(nextVersion);

      spinner.succeed(`Version bumped to ${nextVersion}`);
    } catch (error) {
      spinner.fail("Failed to bump version");
      throw error;
    }
  }

  /**
   * Update version to a specific version
   */
  async updateVersion(newVersion: string): Promise<void> {
    const spinner = ora(`📦 Updating version to ${newVersion}...`).start();

    try {
      await this.updatePackageJson(newVersion);
      spinner.succeed(`Version updated to ${newVersion}`);
    } catch (error) {
      spinner.fail("Failed to update version");
      throw error;
    }
  }

  /**
   * Calculate next version
   */
  calculateNextVersion(currentVersion: string, bumpType: "major" | "minor" | "patch"): string {
    // Remove pre-release and build metadata for calculation
    const cleanVersion = currentVersion.split(/[-+]/)[0];
    const [major, minor, patch] = cleanVersion.split(".").map(Number);

    // Handle invalid versions
    if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
      throw new Error(`Invalid version format: ${currentVersion}`);
    }

    switch (bumpType) {
      case "major":
        return `${major + 1}.0.0`;
      case "minor":
        return `${major}.${minor + 1}.0`;
      case "patch":
        return `${major}.${minor}.${patch + 1}`;
      default:
        return currentVersion;
    }
  }

  /**
   * Get version info
   */
  async getVersionInfo(analysis: ChangeAnalysisResult): Promise<VersionInfo> {
    const current = await this.getCurrentVersion();
    const next = this.calculateNextVersion(current, analysis.versionBumpType);

    return {
      current,
      next,
      bumpType: analysis.versionBumpType,
    };
  }

  private async updatePackageJson(version: string): Promise<void> {
    try {
      const packageJson = JSON.parse(await readFile(this.packageJsonPath, "utf-8"));
      packageJson.version = version;
      await writeFile(this.packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n", "utf-8");
    } catch (error) {
      throw new Error(`Failed to update package.json: ${error}`);
    }
  }

  async createGitTag(version: string, message?: string): Promise<void> {
    try {
      const defaultMessage = `Release v${version}`;
      const tagMessage = message || defaultMessage;
      await execa("git", ["tag", "-a", `v${version}`, "-m", tagMessage], { cwd: this.workingDir });
    } catch (error) {
      console.warn(`Failed to create git tag: ${error}`);
    }
  }

  /**
   * Push Git tag to remote repository
   */
  async pushGitTag(version: string): Promise<void> {
    try {
      await execa("git", ["push", "origin", `v${version}`], { cwd: this.workingDir });
    } catch (error) {
      throw new Error(`Failed to push git tag: ${error}`);
    }
  }

  /**
   * Get the latest Git tag
   */
  async getLatestGitTag(): Promise<string | null> {
    try {
      const { stdout } = await execa("git", ["describe", "--tags", "--abbrev=0"], { cwd: this.workingDir });
      return stdout.trim() || null;
    } catch (error) {
      // No tags found or other error
      return null;
    }
  }

  /**
   * Get monorepo package versions
   */
  async getMonorepoVersions(): Promise<
    Array<{
      name: string;
      currentVersion: string;
      nextVersion: string;
      bumpType: "major" | "minor" | "patch";
      path: string;
    }>
  > {
    try {
      const { stdout } = await execa(
        "find",
        [this.workingDir, "-name", "package.json", "-not", "-path", "*/node_modules/*"],
        { cwd: this.workingDir }
      );
      const packageJsonPaths = stdout.trim().split("\n").filter(Boolean);

      const versions = [];
      for (const packagePath of packageJsonPaths) {
        try {
          const packageJson = JSON.parse(await readFile(packagePath, "utf-8"));
          if (packageJson.name && packageJson.version) {
            const currentVersion = packageJson.version;
            const nextVersion = this.calculateNextVersion(currentVersion, "patch"); // Default to patch bump

            versions.push({
              name: packageJson.name,
              currentVersion,
              nextVersion,
              bumpType: "patch" as const,
              path: packagePath.replace(this.workingDir, "").replace("/package.json", ""),
            });
          }
        } catch (error) {
          console.warn(`Failed to read package.json at ${packagePath}: ${error}`);
        }
      }

      return versions;
    } catch (error) {
      throw new Error(`Failed to get monorepo versions: ${error}`);
    }
  }

  /**
   * Generate release notes for a specific version
   */
  async generateReleaseNotes(version: string, changelogPath?: string): Promise<string> {
    try {
      const changelogFile = changelogPath || join(this.workingDir, "CHANGELOG.md");
      const changelogContent = await readFile(changelogFile, "utf-8");

      // Find the section for the specified version
      const versionRegex = new RegExp(`## \\[${version}\\][\\s\\S]*?(?=## \\[|$)`, "i");
      const match = changelogContent.match(versionRegex);

      if (match) {
        return match[0].trim();
      } else {
        return `Release ${version}\n\nNo release notes available.`;
      }
    } catch (error) {
      throw new Error(`Failed to generate release notes: ${error}`);
    }
  }

  /**
   * Check if a Git tag exists
   */
  async gitTagExists(version: string): Promise<boolean> {
    try {
      await execa("git", ["rev-parse", `v${version}`], { cwd: this.workingDir });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all Git tags
   */
  async getGitTags(): Promise<string[]> {
    try {
      const { stdout } = await execa("git", ["tag", "--list", "--sort=-version:refname"], { cwd: this.workingDir });
      return stdout.trim().split("\n").filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  /**
   * Delete a Git tag
   */
  async deleteGitTag(version: string): Promise<void> {
    try {
      // Delete local tag
      await execa("git", ["tag", "-d", `v${version}`], { cwd: this.workingDir });
      // Delete remote tag
      await execa("git", ["push", "origin", "--delete", `v${version}`], { cwd: this.workingDir });
    } catch (error) {
      throw new Error(`Failed to delete git tag: ${error}`);
    }
  }

  /**
   * Validate version format
   */
  validateVersion(version: string): boolean {
    // Check if version matches semantic versioning pattern (major.minor.patch)
    const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
    return semverRegex.test(version);
  }

  /**
   * Compare two versions
   */
  compareVersions(version1: string, version2: string): number {
    // Remove pre-release and build metadata for comparison
    const cleanVersion1 = version1.split(/[-+]/)[0];
    const cleanVersion2 = version2.split(/[-+]/)[0];

    const v1Parts = cleanVersion1.split(".").map(Number);
    const v2Parts = cleanVersion2.split(".").map(Number);

    // Ensure both versions have 3 parts
    while (v1Parts.length < 3) v1Parts.push(0);
    while (v2Parts.length < 3) v2Parts.push(0);

    for (let i = 0; i < 3; i++) {
      if (v1Parts[i] > v2Parts[i]) return 1;
      if (v1Parts[i] < v2Parts[i]) return -1;
    }

    return 0;
  }

  /**
   * Get version bump type between two versions
   */
  getBumpType(fromVersion: string, toVersion: string): "major" | "minor" | "patch" | null {
    // Remove pre-release and build metadata for comparison
    const cleanFrom = fromVersion.split(/[-+]/)[0];
    const cleanTo = toVersion.split(/[-+]/)[0];

    const fromParts = cleanFrom.split(".").map(Number);
    const toParts = cleanTo.split(".").map(Number);

    // Ensure both versions have 3 parts
    while (fromParts.length < 3) fromParts.push(0);
    while (toParts.length < 3) toParts.push(0);

    // Check if versions are valid
    if (fromParts.some(isNaN) || toParts.some(isNaN)) {
      return null;
    }

    // Compare versions
    if (toParts[0] > fromParts[0]) return "major";
    if (toParts[0] < fromParts[0]) return null; // Downgrade

    if (toParts[1] > fromParts[1]) return "minor";
    if (toParts[1] < fromParts[1]) return null; // Downgrade

    if (toParts[2] > fromParts[2]) return "patch";
    if (toParts[2] < fromParts[2]) return null; // Downgrade

    return null; // Same version
  }
}
