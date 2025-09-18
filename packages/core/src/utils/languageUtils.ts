/**
 * Language Utilities
 * Main module that re-exports language detection and mapping functions
 */

import { getLanguageInfo as getLanguageInfoFromDetection } from "./language-detection.js";

// Re-export types
export type {
  LanguageInfo,
  FileTypeInfo,
  LanguageCategory,
  LanguageDetectionResult,
  CodeBlockInfo,
  SyntaxHighlightingOptions,
  LanguageServerInfo,
} from "./language-types.js";

// Re-export language mappings
export { WEB_LANGUAGES, PROGRAMMING_LANGUAGES } from "./language-mappings.js";

// Re-export language detection functions
export {
  detectLanguageFromExtension,
  detectLanguageFromContent,
  getAllLanguages,
  getLanguagesByCategory,
} from "./language-detection.js";

// Import for internal use
import { detectLanguageFromExtension, detectLanguageFromContent } from "./language-detection.js";
import { useI18n } from "reynard-i18n";

// Legacy exports for backward compatibility
export { getLanguageInfo as detectLanguage } from "./language-detection.js";
export { getAllLanguages as getSupportedLanguages } from "./language-detection.js";

// Legacy function exports for backward compatibility with tests
export function getMonacoLanguage(filename: string): string {
  const result = detectLanguageFromExtension(filename);
  return result.language?.monacoLanguage || "plaintext";
}

export function getLanguageDisplayName(filename: string, t?: (key: string) => string): string {
  const result = detectLanguageFromExtension(filename);
  return result.language?.displayName || (t ? t("core.languageDetection.plainText") : "Plain Text");
}

export function isCodeFile(filename: string): boolean {
  const result = detectLanguageFromExtension(filename);
  return result.language?.isCode || false;
}

export function getLanguageCategory(filename: string): string {
  const result = detectLanguageFromExtension(filename);
  return result.language?.category || "other";
}

// Legacy getLanguageInfo function that returns the expected structure
export function getLanguageInfo(filename: string): {
  monacoLanguage: string;
  displayName: string;
  isCode: boolean;
  category: string;
} {
  const result = getLanguageInfoFromDetection(filename);
  if (result.language) {
    return {
      monacoLanguage: result.language.monacoLanguage,
      displayName: result.language.displayName,
      isCode: result.language.isCode,
      category: result.language.category,
    };
  }

  return {
    monacoLanguage: "plaintext",
    displayName: "Plain Text",
    isCode: false,
    category: "other",
  };
}

// Path utility functions
export function getFileExtension(filename: string): string {
  if (!filename || typeof filename !== "string") return "";
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
}

export function getFileName(path: string): string {
  if (!path || typeof path !== "string") return "";
  return path.split(/[/\\]/).pop() || "";
}

export function getFileNameWithoutExtension(path: string): string {
  const filename = getFileName(path);
  const extension = getFileExtension(filename);
  return extension ? filename.slice(0, -(extension.length + 1)) : filename;
}

export function getDirectoryPath(path: string): string {
  if (!path || typeof path !== "string") return "/";
  const parts = path.split(/[/\\]/);
  parts.pop(); // Remove filename
  return parts.length > 0 ? parts.join("/") : "/";
}
