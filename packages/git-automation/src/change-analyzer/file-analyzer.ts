/**
 * 🦊 File Change Analyzer
 *
 * Analyzes individual file changes and categorizes them
 */

import { execa } from "execa";
import type { FileChange, ChangeCategory } from "./types";

export class FileChangeAnalyzer {
  /**
   * Get all file changes from Git
   */
  async getFileChanges(workingDir: string = "."): Promise<FileChange[]> {
    try {
      const { stdout } = await execa("git", ["diff", "--cached", "--name-status"], {
        cwd: workingDir,
      });

      if (!stdout.trim()) {
        return [];
      }

      return stdout
        .trim()
        .split("\n")
        .map(line => {
          const [status, file] = line.split("\t");
          return {
            file,
            status: this.mapGitStatus(status),
          };
        });
    } catch (error) {
      console.warn("Failed to get file changes:", error);
      return [];
    }
  }

  /**
   * Get diff statistics
   */
  async getDiffStatistics(workingDir: string = "."): Promise<{
    additions: number;
    deletions: number;
  }> {
    try {
      const { stdout } = await execa("git", ["diff", "--cached", "--numstat"], {
        cwd: workingDir,
      });

      if (!stdout.trim()) {
        return { additions: 0, deletions: 0 };
      }

      let additions = 0;
      let deletions = 0;

      stdout
        .trim()
        .split("\n")
        .forEach(line => {
          const [add, del] = line.split("\t");
          additions += parseInt(add) || 0;
          deletions += parseInt(del) || 0;
        });

      return { additions, deletions };
    } catch (error) {
      console.warn("Failed to get diff statistics:", error);
      return { additions: 0, deletions: 0 };
    }
  }

  /**
   * Categorize file changes
   */
  categorizeFiles(fileChanges: FileChange[]): ChangeCategory[] {
    const categories: ChangeCategory[] = [];
    const categoryMap = new Map<string, FileChange[]>();

    // Group files by category
    fileChanges.forEach(change => {
      const category = this.determineFileCategory(change.file);
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(change);
    });

    // Create category objects
    categoryMap.forEach((files, type) => {
      categories.push({
        type: type as ChangeCategory["type"],
        files,
        impact: this.calculateImpact(files),
        description: this.generateDescription(type, files),
      });
    });

    return categories;
  }

  private mapGitStatus(status: string): FileChange["status"] {
    const statusMap: Record<string, FileChange["status"]> = {
      A: "added",
      M: "modified",
      D: "deleted",
      R: "renamed",
      C: "copied",
    };
    return statusMap[status] || "modified";
  }

  private determineFileCategory(file: string): string {
    if (file.includes("test") || file.includes("spec")) return "test";
    if (file.includes("docs") || file.endsWith(".md")) return "docs";
    if (file.includes("package.json") || file.includes("pnpm-lock")) return "chore";
    if (file.includes(".css") || file.includes(".scss")) return "style";
    if (file.includes("perf") || file.includes("performance")) return "perf";
    if (file.includes("refactor")) return "refactor";
    if (file.includes("fix") || file.includes("bug")) return "fix";
    return "feature";
  }

  private calculateImpact(files: FileChange[]): "low" | "medium" | "high" {
    const totalChanges = files.reduce((sum, file) => (file.additions || 0) + (file.deletions || 0), 0);

    if (totalChanges > 100) return "high";
    if (totalChanges > 20) return "medium";
    return "low";
  }

  private generateDescription(type: string, files: FileChange[]): string {
    const count = files.length;
    const fileList = files
      .slice(0, 3)
      .map(f => f.file)
      .join(", ");
    const more = count > 3 ? ` and ${count - 3} more` : "";

    return `${type} changes in ${count} file${count > 1 ? "s" : ""}: ${fileList}${more}`;
  }
}
