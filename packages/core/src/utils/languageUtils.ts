/**
 * Language Utilities
 * Comprehensive language detection and file type utilities
 */

export interface LanguageInfo {
  monacoLanguage: string;
  displayName: string;
  isCode: boolean;
  category:
    | "web"
    | "programming"
    | "data"
    | "config"
    | "shell"
    | "markup"
    | "other";
}

/**
 * Comprehensive language mapping for file extensions
 */
const LANGUAGE_MAP: Record<string, LanguageInfo> = {
  // JavaScript/TypeScript
  js: {
    monacoLanguage: "javascript",
    displayName: "JavaScript",
    isCode: true,
    category: "web",
  },
  ts: {
    monacoLanguage: "typescript",
    displayName: "TypeScript",
    isCode: true,
    category: "web",
  },
  jsx: {
    monacoLanguage: "javascript",
    displayName: "JSX",
    isCode: true,
    category: "web",
  },
  tsx: {
    monacoLanguage: "typescript",
    displayName: "TSX",
    isCode: true,
    category: "web",
  },

  // Web Technologies
  html: {
    monacoLanguage: "html",
    displayName: "HTML",
    isCode: true,
    category: "web",
  },
  htm: {
    monacoLanguage: "html",
    displayName: "HTML",
    isCode: true,
    category: "web",
  },
  css: {
    monacoLanguage: "css",
    displayName: "CSS",
    isCode: true,
    category: "web",
  },
  scss: {
    monacoLanguage: "scss",
    displayName: "SCSS",
    isCode: true,
    category: "web",
  },
  sass: {
    monacoLanguage: "sass",
    displayName: "Sass",
    isCode: true,
    category: "web",
  },
  less: {
    monacoLanguage: "less",
    displayName: "Less",
    isCode: true,
    category: "web",
  },

  // Programming Languages
  py: {
    monacoLanguage: "python",
    displayName: "Python",
    isCode: true,
    category: "programming",
  },
  java: {
    monacoLanguage: "java",
    displayName: "Java",
    isCode: true,
    category: "programming",
  },
  cpp: {
    monacoLanguage: "cpp",
    displayName: "C++",
    isCode: true,
    category: "programming",
  },
  cc: {
    monacoLanguage: "cpp",
    displayName: "C++",
    isCode: true,
    category: "programming",
  },
  cxx: {
    monacoLanguage: "cpp",
    displayName: "C++",
    isCode: true,
    category: "programming",
  },
  c: {
    monacoLanguage: "c",
    displayName: "C",
    isCode: true,
    category: "programming",
  },
  cs: {
    monacoLanguage: "csharp",
    displayName: "C#",
    isCode: true,
    category: "programming",
  },
  php: {
    monacoLanguage: "php",
    displayName: "PHP",
    isCode: true,
    category: "programming",
  },
  rb: {
    monacoLanguage: "ruby",
    displayName: "Ruby",
    isCode: true,
    category: "programming",
  },
  go: {
    monacoLanguage: "go",
    displayName: "Go",
    isCode: true,
    category: "programming",
  },
  rs: {
    monacoLanguage: "rust",
    displayName: "Rust",
    isCode: true,
    category: "programming",
  },
  swift: {
    monacoLanguage: "swift",
    displayName: "Swift",
    isCode: true,
    category: "programming",
  },
  kt: {
    monacoLanguage: "kotlin",
    displayName: "Kotlin",
    isCode: true,
    category: "programming",
  },
  scala: {
    monacoLanguage: "scala",
    displayName: "Scala",
    isCode: true,
    category: "programming",
  },
  r: {
    monacoLanguage: "r",
    displayName: "R",
    isCode: true,
    category: "programming",
  },

  // Data Formats
  sql: {
    monacoLanguage: "sql",
    displayName: "SQL",
    isCode: true,
    category: "data",
  },
  json: {
    monacoLanguage: "json",
    displayName: "JSON",
    isCode: true,
    category: "data",
  },
  xml: {
    monacoLanguage: "xml",
    displayName: "XML",
    isCode: true,
    category: "data",
  },
  yaml: {
    monacoLanguage: "yaml",
    displayName: "YAML",
    isCode: true,
    category: "data",
  },
  yml: {
    monacoLanguage: "yaml",
    displayName: "YAML",
    isCode: true,
    category: "data",
  },
  toml: {
    monacoLanguage: "ini",
    displayName: "TOML",
    isCode: true,
    category: "data",
  },
  csv: {
    monacoLanguage: "plaintext",
    displayName: "CSV",
    isCode: false,
    category: "data",
  },

  // Documentation & Markup
  md: {
    monacoLanguage: "markdown",
    displayName: "Markdown",
    isCode: false,
    category: "markup",
  },
  markdown: {
    monacoLanguage: "markdown",
    displayName: "Markdown",
    isCode: false,
    category: "markup",
  },
  rst: {
    monacoLanguage: "plaintext",
    displayName: "reStructuredText",
    isCode: false,
    category: "markup",
  },
  tex: {
    monacoLanguage: "latex",
    displayName: "LaTeX",
    isCode: false,
    category: "markup",
  },

  // Shell Scripts
  sh: {
    monacoLanguage: "shell",
    displayName: "Shell",
    isCode: true,
    category: "shell",
  },
  bash: {
    monacoLanguage: "shell",
    displayName: "Bash",
    isCode: true,
    category: "shell",
  },
  zsh: {
    monacoLanguage: "shell",
    displayName: "Zsh",
    isCode: true,
    category: "shell",
  },
  fish: {
    monacoLanguage: "shell",
    displayName: "Fish",
    isCode: true,
    category: "shell",
  },
  ps1: {
    monacoLanguage: "powershell",
    displayName: "PowerShell",
    isCode: true,
    category: "shell",
  },

  // Configuration Files
  dockerfile: {
    monacoLanguage: "dockerfile",
    displayName: "Dockerfile",
    isCode: true,
    category: "config",
  },
  ini: {
    monacoLanguage: "ini",
    displayName: "INI",
    isCode: true,
    category: "config",
  },
  cfg: {
    monacoLanguage: "ini",
    displayName: "Config",
    isCode: true,
    category: "config",
  },
  conf: {
    monacoLanguage: "ini",
    displayName: "Config",
    isCode: true,
    category: "config",
  },
  env: {
    monacoLanguage: "shell",
    displayName: "Environment",
    isCode: true,
    category: "config",
  },

  // Plain Text & Logs
  txt: {
    monacoLanguage: "plaintext",
    displayName: "Plain Text",
    isCode: false,
    category: "other",
  },
  log: {
    monacoLanguage: "plaintext",
    displayName: "Log File",
    isCode: false,
    category: "other",
  },

  // Package Files
  "package.json": {
    monacoLanguage: "json",
    displayName: "Package.json",
    isCode: true,
    category: "config",
  },
  "requirements.txt": {
    monacoLanguage: "plaintext",
    displayName: "Requirements",
    isCode: false,
    category: "config",
  },
  "cargo.toml": {
    monacoLanguage: "ini",
    displayName: "Cargo.toml",
    isCode: true,
    category: "config",
  },
  "go.mod": {
    monacoLanguage: "go",
    displayName: "Go.mod",
    isCode: true,
    category: "config",
  },
};

/**
 * Get Monaco language ID from file path or extension
 */
export function getMonacoLanguage(filePath: string): string {
  const fileName = filePath.split("/").pop() || "";
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  // Check for full filename first (e.g., package.json)
  if (LANGUAGE_MAP[fileName]) {
    return LANGUAGE_MAP[fileName].monacoLanguage;
  }

  // Then check extension
  return LANGUAGE_MAP[extension]?.monacoLanguage || "plaintext";
}

/**
 * Get display name for language from file path or extension
 */
export function getLanguageDisplayName(filePath: string): string {
  const fileName = filePath.split("/").pop() || "";
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  // Check for full filename first
  if (LANGUAGE_MAP[fileName]) {
    return LANGUAGE_MAP[fileName].displayName;
  }

  // Then check extension
  return LANGUAGE_MAP[extension]?.displayName || "Plain Text";
}

/**
 * Check if file is a code file based on extension
 */
export function isCodeFile(filePath: string): boolean {
  const fileName = filePath.split("/").pop() || "";
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  // Check for full filename first
  if (LANGUAGE_MAP[fileName]) {
    return LANGUAGE_MAP[fileName].isCode;
  }

  // Then check extension
  return LANGUAGE_MAP[extension]?.isCode || false;
}

/**
 * Get complete language info from file path
 */
export function getLanguageInfo(filePath: string): LanguageInfo {
  const fileName = filePath.split("/").pop() || "";
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  // Check for full filename first
  if (LANGUAGE_MAP[fileName]) {
    return LANGUAGE_MAP[fileName];
  }

  // Then check extension
  return (
    LANGUAGE_MAP[extension] || {
      monacoLanguage: "plaintext",
      displayName: "Plain Text",
      isCode: false,
      category: "other",
    }
  );
}

/**
 * Get language category for organizing files
 */
export function getLanguageCategory(filePath: string): string {
  return getLanguageInfo(filePath).category;
}

/**
 * Check if file is a specific type
 */
export function isWebFile(filePath: string): boolean {
  return getLanguageCategory(filePath) === "web";
}

export function isProgrammingFile(filePath: string): boolean {
  return getLanguageCategory(filePath) === "programming";
}

export function isConfigFile(filePath: string): boolean {
  return getLanguageCategory(filePath) === "config";
}

export function isDataFile(filePath: string): boolean {
  return getLanguageCategory(filePath) === "data";
}

export function isMarkupFile(filePath: string): boolean {
  return getLanguageCategory(filePath) === "markup";
}

export function isShellFile(filePath: string): boolean {
  return getLanguageCategory(filePath) === "shell";
}

/**
 * Get file extension from path
 */
export function getFileExtension(filePath: string): string {
  return filePath.split(".").pop()?.toLowerCase() || "";
}

/**
 * Get filename without extension
 */
export function getFileNameWithoutExtension(filePath: string): string {
  const fileName = filePath.split("/").pop() || "";
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex === -1 ? fileName : fileName.substring(0, lastDotIndex);
}

/**
 * Get filename from path
 */
export function getFileName(filePath: string): string {
  return filePath.split("/").pop() || "";
}

/**
 * Get directory path from file path
 */
export function getDirectoryPath(filePath: string): string {
  const parts = filePath.split("/");
  parts.pop(); // Remove filename
  return parts.join("/") || "/";
}
