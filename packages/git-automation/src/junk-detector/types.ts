/**
 * 🦦 Junk File Detector Types
 *
 * Type definitions for the junk file detector module
 */

export interface JunkFileResult {
  category: "python" | "typescript" | "reynard" | "system";
  files: string[];
  count: number;
}

export interface JunkDetectionResult {
  totalFiles: number;
  categories: JunkFileResult[];
  hasJunk: boolean;
  recommendations: string[];
}
