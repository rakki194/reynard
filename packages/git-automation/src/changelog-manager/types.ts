/**
 * 📚 Changelog Manager Types
 *
 * Type definitions for the changelog manager module
 */

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
