/**
 * 📚 Changelog Generator
 *
 * Generates CHANGELOG.md content from structured data
 */

import type { ChangelogStructure, ChangelogSection, ChangelogEntry } from "./types";

export class ChangelogGenerator {
  /**
   * Generate changelog content from structure
   */
  generateChangelogContent(structure: ChangelogStructure): string {
    const lines: string[] = [];

    // Add header
    if (structure.header) {
      lines.push(structure.header);
      lines.push("");
    }

    // Add unreleased section
    if (structure.unreleased.length > 0) {
      lines.push("## [Unreleased]");
      lines.push("");
      this.addEntries(lines, structure.unreleased);
      lines.push("");
    }

    // Add releases
    for (const release of structure.releases) {
      this.addRelease(lines, release);
    }

    return lines.join("\n");
  }

  /**
   * Generate changelog entry line
   */
  generateEntryLine(entry: ChangelogEntry): string {
    const typeEmoji = this.getTypeEmoji(entry.type);
    return `- ${typeEmoji} **${entry.type}**: ${entry.description}`;
  }

  /**
   * Generate release section
   */
  generateReleaseSection(release: ChangelogSection): string {
    const lines: string[] = [];

    const versionLine = release.date ? `## [${release.version}] - ${release.date}` : `## [${release.version}]`;

    lines.push(versionLine);
    lines.push("");

    this.addEntries(lines, release.entries);

    return lines.join("\n");
  }

  private addRelease(lines: string[], release: ChangelogSection): void {
    const versionLine = release.date ? `## [${release.version}] - ${release.date}` : `## [${release.version}]`;

    lines.push(versionLine);
    lines.push("");

    this.addEntries(lines, release.entries);
    lines.push("");
  }

  private addEntries(lines: string[], entries: ChangelogEntry[]): void {
    // Group entries by type
    const groupedEntries = this.groupEntriesByType(entries);

    // Add entries in order
    const typeOrder: ChangelogEntry["type"][] = ["added", "changed", "deprecated", "removed", "fixed", "security"];

    for (const type of typeOrder) {
      if (groupedEntries[type] && groupedEntries[type].length > 0) {
        for (const entry of groupedEntries[type]) {
          lines.push(this.generateEntryLine(entry));
        }
      }
    }
  }

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

  private getTypeEmoji(type: ChangelogEntry["type"]): string {
    const emojis: Record<ChangelogEntry["type"], string> = {
      added: "✨",
      changed: "🔄",
      deprecated: "⚠️",
      removed: "🗑️",
      fixed: "🐛",
      security: "🔒",
    };
    return emojis[type] || "📝";
  }
}
