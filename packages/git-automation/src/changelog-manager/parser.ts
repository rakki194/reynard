/**
 * 📚 Changelog Parser
 *
 * Parses CHANGELOG.md files into structured data
 */

import type { ChangelogStructure, ChangelogSection, ChangelogEntry } from "./types";

export class ChangelogParser {
  /**
   * Parse changelog content into structured data
   */
  parseChangelog(content: string): ChangelogStructure {
    const lines = content.split("\n");
    const structure: ChangelogStructure = {
      header: "",
      unreleased: [],
      releases: [],
    };

    let currentSection: ChangelogSection | null = null;
    let inUnreleased = false;
    const headerLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip empty lines
      if (!line.trim()) continue;

      // Check for version headers
      if (this.isVersionHeader(line)) {
        // Save previous section
        if (currentSection) {
          structure.releases.push(currentSection);
        }

        // Start new section
        const version = this.extractVersion(line);
        const date = this.extractDate(line);

        if (version === "Unreleased") {
          inUnreleased = true;
          currentSection = null;
        } else {
          inUnreleased = false;
          currentSection = {
            version,
            date: date || "",
            entries: [],
          };
        }
        continue;
      }

      // Check for entry lines
      if (this.isEntryLine(line)) {
        const entry = this.parseEntry(line);

        if (inUnreleased) {
          structure.unreleased.push(entry);
        } else if (currentSection) {
          currentSection.entries.push(entry);
        }
        continue;
      }

      // Collect header lines (before first version)
      if (!currentSection && !inUnreleased && !this.isVersionHeader(line)) {
        headerLines.push(line);
      }
    }

    // Add final section
    if (currentSection) {
      structure.releases.push(currentSection);
    }

    structure.header = headerLines.join("\n").trim();

    return structure;
  }

  private isVersionHeader(line: string): boolean {
    return /^##\s+\[?(\d+\.\d+\.\d+|Unreleased)\]?/.test(line);
  }

  private isEntryLine(line: string): boolean {
    return /^\s*[-*]\s+(added|changed|deprecated|removed|fixed|security):/i.test(line);
  }

  private extractVersion(line: string): string {
    const match = line.match(/^##\s+\[?(\d+\.\d+\.\d+|Unreleased)\]?/);
    return match ? match[1] : "";
  }

  private extractDate(line: string): string | null {
    const match = line.match(/\((\d{4}-\d{2}-\d{2})\)/);
    return match ? match[1] : null;
  }

  private parseEntry(line: string): ChangelogEntry {
    const match = line.match(/^\s*[-*]\s+(added|changed|deprecated|removed|fixed|security):\s*(.+)/i);

    if (match) {
      return {
        type: match[1].toLowerCase() as ChangelogEntry["type"],
        description: match[2].trim(),
      };
    }

    // Fallback for malformed entries
    return {
      type: "changed",
      description: line.replace(/^\s*[-*]\s*/, "").trim(),
    };
  }
}
