/**
 * Language Detection Utilities
 *
 * Provides utilities for detecting programming languages and extracting
 * dependencies from code files.
 */

/**
 * Detect programming language from file extension
 */
export function detectProgrammingLanguage(extension: string): string {
  const languageMap: Record<string, string> = {
    ".py": "Python",
    ".js": "JavaScript",
    ".ts": "TypeScript",
    ".jsx": "JSX",
    ".tsx": "TSX",
    ".html": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".sass": "Sass",
    ".less": "Less",
    ".java": "Java",
    ".cpp": "C++",
    ".c": "C",
    ".h": "C Header",
    ".hpp": "C++ Header",
    ".cs": "C#",
    ".php": "PHP",
    ".rb": "Ruby",
    ".go": "Go",
    ".rs": "Rust",
    ".swift": "Swift",
    ".kt": "Kotlin",
    ".scala": "Scala",
    ".clj": "Clojure",
    ".hs": "Haskell",
    ".ml": "OCaml",
    ".fs": "F#",
    ".v": "Verilog",
    ".zig": "Zig",
    ".nim": "Nim",
    ".sh": "Shell",
    ".bash": "Bash",
    ".zsh": "Zsh",
    ".fish": "Fish",
    ".ps1": "PowerShell",
    ".bat": "Batch",
    ".cmd": "Command",
    ".vbs": "VBScript",
  };

  return languageMap[extension] || "Unknown";
}

/**
 * Extract dependencies from code content based on file type
 */
export function extractDependencies(content: string, extension: string): string[] {
  const dependencies: string[] = [];

  // Extract dependencies based on file type
  if (extension === ".py") {
    // Python imports
    const importMatches = content.match(
      /^(?:from|import)\s+([a-zA-Z_][a-zA-Z0-9_.]*)/gm,
    );
    if (importMatches) {
      dependencies.push(
        ...importMatches.map((match) =>
          match.replace(/^(?:from|import)\s+/, ""),
        ),
      );
    }
  } else if (extension === ".js" || extension === ".ts") {
    // JavaScript/TypeScript imports
    const importMatches = content.match(
      /^(?:import|export)\s+.*?from\s+['"]([^'"]+)['"]/gm,
    );
    if (importMatches) {
      dependencies.push(
        ...importMatches
          .map((match) => {
            const fromMatch = match.match(/from\s+['"]([^'"]+)['"]/);
            return fromMatch ? fromMatch[1] : "";
          })
          .filter(Boolean),
      );
    }
  } else if (extension === ".java") {
    // Java imports
    const importMatches = content.match(
      /^import\s+([a-zA-Z_][a-zA-Z0-9_.]*);/gm,
    );
    if (importMatches) {
      dependencies.push(
        ...importMatches.map((match) =>
          match.replace(/^import\s+/, "").replace(/;$/, ""),
        ),
      );
    }
  }

  return dependencies;
}

/**
 * Detect code purpose from filename
 */
export function detectCodePurpose(extension: string): string {
  const filename = extension.replace(".", "");

  if (filename.includes("test") || filename.includes("spec")) return "test";
  if (filename.includes("config") || filename.includes("conf"))
    return "config";
  if (filename.includes("readme") || filename.includes("doc"))
    return "documentation";
  if (filename.includes("dockerfile")) return "container";
  if (filename.includes("gitignore") || filename.includes("gitattributes"))
    return "version-control";
  if (filename.includes("package") || filename.includes("requirements"))
    return "dependencies";

  return "source";
}
