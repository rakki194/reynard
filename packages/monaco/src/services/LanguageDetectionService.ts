import type { NaturalLanguageDetectionResult } from "../types";
import { useI18n } from "reynard-i18n";

export type { NaturalLanguageDetectionResult };

/**
 * Language detection service for both natural and programming languages
 */
export class LanguageDetectionService {
  private isNaturalLanguageDetectionAvailableFlag = false;
  private isProgrammingLanguageDetectionAvailableFlag = true; // Always available via file extension
  private isLoadingFlag = false;

  constructor() {
    // Initialize the service
    this.initialize();
  }

  private async initialize() {
    // Check if natural language detection is available
    // This could be enhanced to check for actual ML models or services
    this.isNaturalLanguageDetectionAvailableFlag = true;
  }

  /**
   * Check if natural language detection is available
   */
  isNaturalLanguageDetectionAvailable(): boolean {
    return this.isNaturalLanguageDetectionAvailableFlag;
  }

  /**
   * Check if programming language detection is available
   */
  isProgrammingLanguageDetectionAvailable(): boolean {
    return this.isProgrammingLanguageDetectionAvailableFlag;
  }

  /**
   * Check if the service is currently loading
   */
  isLoading(): boolean {
    return this.isLoadingFlag;
  }

  /**
   * Detect natural language from text content
   */
  async detectNaturalLanguage(text: string): Promise<NaturalLanguageDetectionResult> {
    const { t } = useI18n();
    
    if (!this.isNaturalLanguageDetectionAvailable()) {
      return {
        success: false,
        naturalLanguage: "unknown",
        confidence: 0,
        error: t("monaco.errors.naturalLanguageDetectionNotAvailable"),
      };
    }

    this.isLoadingFlag = true;

    try {
      // Simple heuristic-based detection for common languages
      const result = this.heuristicLanguageDetection(text);

      this.isLoadingFlag = false;
      return {
        success: true,
        naturalLanguage: result.language,
        confidence: result.confidence,
      };
    } catch (error) {
      this.isLoadingFlag = false;
      return {
        success: false,
        naturalLanguage: "unknown",
        confidence: 0,
        error: error instanceof Error ? error.message : t("monaco.errors.detectionFailed"),
      };
    }
  }

  /**
   * Detect programming language from file name/extension
   */
  detectProgrammingLanguageFromFile(fileName: string): string {
    if (!fileName) return "unknown";

    const extension = fileName.split(".").pop()?.toLowerCase();

    const languageMap: Record<string, string> = {
      // JavaScript/TypeScript
      js: "javascript",
      ts: "typescript",
      jsx: "javascript",
      tsx: "typescript",

      // Web Technologies
      html: "html",
      htm: "html",
      css: "css",
      scss: "scss",
      sass: "sass",
      less: "less",

      // Programming Languages
      py: "python",
      java: "java",
      cpp: "cpp",
      cc: "cpp",
      cxx: "cpp",
      c: "c",
      cs: "csharp",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
      swift: "swift",
      kt: "kotlin",
      scala: "scala",
      r: "r",
      julia: "julia",
      matlab: "matlab",

      // Data Formats
      sql: "sql",
      json: "json",
      xml: "xml",
      yaml: "yaml",
      yml: "yaml",
      toml: "toml",

      // Documentation
      md: "markdown",
      markdown: "markdown",

      // Shell Scripts
      sh: "shell",
      bash: "shell",
      zsh: "shell",
      fish: "shell",
      ps1: "powershell",

      // Configuration Files
      dockerfile: "dockerfile",
      gitignore: "plaintext",
      gitattributes: "plaintext",
      dockerignore: "plaintext",
      editorconfig: "plaintext",
      eslintrc: "json",
      prettierrc: "json",
      babelrc: "json",

      // Package Managers
      "package.json": "json",
      "requirements.txt": "plaintext",
      "setup.py": "python",
      "pyproject.toml": "toml",
      "cargo.toml": "toml",
      "go.mod": "go",
      "composer.json": "json",
      gemfile: "ruby",
      rakefile: "ruby",

      // Build Systems
      makefile: "makefile",
      cmake: "cmake",
      gradle: "groovy",
      "pom.xml": "xml",
      "build.xml": "xml",
      "build.sbt": "scala",

      // Plain Text Files
      txt: "plaintext",
      log: "plaintext",
      cfg: "ini",
      conf: "ini",
      ini: "ini",
      properties: "properties",
      env: "shell",
      csv: "plaintext",
      tsv: "plaintext",
    };

    return languageMap[extension || ""] || "plaintext";
  }

  /**
   * Simple heuristic-based natural language detection
   */
  private heuristicLanguageDetection(text: string): {
    language: string;
    confidence: number;
  } {
    const sample = text.toLowerCase().substring(0, 1000);

    // English patterns
    const englishPatterns = [
      /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/g,
      /\b(is|are|was|were|be|been|being)\b/g,
      /\b(this|that|these|those)\b/g,
      /\b(a|an|some|any|all|every|each)\b/g,
    ];

    // Spanish patterns
    const spanishPatterns = [
      /\b(el|la|los|las|un|una|de|del|en|con|por|para)\b/g,
      /\b(es|son|era|eran|ser|estar)\b/g,
      /\b(que|como|cuando|donde|porque)\b/g,
      /\b(yo|tu|el|ella|nosotros|vosotros|ellos)\b/g,
    ];

    // French patterns
    const frenchPatterns = [
      /\b(le|la|les|un|une|de|du|des|en|avec|pour|par)\b/g,
      /\b(est|sont|était|étaient|être|avoir)\b/g,
      /\b(que|comme|quand|où|pourquoi)\b/g,
      /\b(je|tu|il|elle|nous|vous|ils)\b/g,
    ];

    // German patterns
    const germanPatterns = [
      /\b(der|die|das|ein|eine|und|oder|aber|in|auf|mit|von|zu|für)\b/g,
      /\b(ist|sind|war|waren|sein|haben)\b/g,
      /\b(dass|wie|wann|wo|warum)\b/g,
      /\b(ich|du|er|sie|wir|ihr|sie)\b/g,
    ];

    const languages = [
      { name: "english", patterns: englishPatterns },
      { name: "spanish", patterns: spanishPatterns },
      { name: "french", patterns: frenchPatterns },
      { name: "german", patterns: germanPatterns },
    ];

    let bestMatch = { language: "english", confidence: 0.1 };

    for (const lang of languages) {
      let matchCount = 0;
      for (const pattern of lang.patterns) {
        const matches = sample.match(pattern);
        if (matches) {
          matchCount += matches.length;
        }
      }

      const confidence = Math.min(matchCount / (sample.length / 100), 0.9);

      if (confidence > bestMatch.confidence) {
        bestMatch = { language: lang.name, confidence };
      }
    }

    return bestMatch;
  }
}

// Export singleton instance
export const languageDetectionService = new LanguageDetectionService();
