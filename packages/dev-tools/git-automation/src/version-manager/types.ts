/**
 * 📦 Version Manager Types
 *
 * Type definitions for the version manager module
 */

export interface VersionInfo {
  current: string;
  next: string;
  bumpType: "major" | "minor" | "patch";
}
