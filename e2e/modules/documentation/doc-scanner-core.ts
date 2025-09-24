/**
 * Core Documentation Scanner Utilities
 *
 * Core functionality for scanning and analyzing documentation files.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

/**
 * Code Example Interface
 */
export interface ICodeExample {
  id: string;
  source: string;
  language: string;
  content: string;
  lineNumber: number;
  context: string;
  type: "bash" | "typescript" | "json" | "yaml" | "python" | "dockerfile" | "markdown" | "other";
  isExecutable: boolean;
  dependencies?: string[];
  expectedOutput?: string;
  validationRules?: ValidationRule[];
}

/**
 * Validation Rule Interface
 */
export interface ValidationRule {
  type: "syntax" | "import" | "runtime" | "output" | "dependency";
  rule: string;
  severity: "error" | "warning" | "info";
}

/**
 * Core Documentation Scanner Class
 */
export class DocumentationScannerCore {
  protected projectRoot: string;
  protected scannedFiles: Set<string> = new Set();
  protected codeExamples: ICodeExample[] = [];

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Scan a specific file for code examples
   */
  async scanFile(filePath: string): Promise<ICodeExample[]> {
    const fullPath = join(this.projectRoot, filePath);
    
    if (!this.isDocumentationFile(fullPath)) {
      return [];
    }

    try {
      const content = readFileSync(fullPath, "utf-8");
      const examples = this.extractCodeExamples(content, filePath);
      
      this.scannedFiles.add(filePath);
      this.codeExamples.push(...examples);
      
      return examples;
    } catch (error) {
      console.warn(`⚠️  Failed to scan file ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Extract code examples from markdown content
   */
  protected extractCodeExamples(content: string, filePath: string): ICodeExample[] {
    const examples: ICodeExample[] = [];
    const lines = content.split("\n");
    
    let inCodeBlock = false;
    let currentLanguage = "";
    let currentContent: string[] = [];
    let startLine = 0;
    let context = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for code block start
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          // End of code block
          const example = this.createCodeExample(
            currentContent.join("\n"),
            currentLanguage,
            filePath,
            startLine,
            context,
            examples.length
          );
          if (example) {
            examples.push(example);
          }
          
          inCodeBlock = false;
          currentContent = [];
          currentLanguage = "";
        } else {
          // Start of code block
          inCodeBlock = true;
          currentLanguage = line.slice(3).trim() || "text";
          startLine = i + 1;
          context = this.extractContext(lines, i);
        }
      } else if (inCodeBlock) {
        currentContent.push(line);
      }
    }

    return examples;
  }

  /**
   * Create a code example object
   */
  protected createCodeExample(
    content: string,
    language: string,
    filePath: string,
    lineNumber: number,
    context: string,
    index: number
  ): ICodeExample | null {
    if (!content.trim()) {
      return null;
    }

    const type = this.determineCodeType(language, content);
    const isExecutable = this.isExecutableCode(type, content);
    const dependencies = this.extractDependencies(content, type);
    const validationRules = this.generateValidationRules(type, content);

    return {
      id: `${filePath.replace(/[^a-zA-Z0-9]/g, "_")}_${index}`,
      source: filePath,
      language,
      content: content.trim(),
      lineNumber,
      context,
      type,
      isExecutable,
      dependencies,
      validationRules
    };
  }

  /**
   * Determine the code type from language and content
   */
  protected determineCodeType(language: string, content: string): ICodeExample["type"] {
    const lang = language.toLowerCase();
    
    if (lang === "bash" || lang === "sh" || lang === "shell") return "bash";
    if (lang === "typescript" || lang === "ts" || lang === "tsx") return "typescript";
    if (lang === "json") return "json";
    if (lang === "yaml" || lang === "yml") return "yaml";
    if (lang === "python" || lang === "py") return "python";
    if (lang === "dockerfile") return "dockerfile";
    if (lang === "markdown" || lang === "md") return "markdown";
    
    // Try to detect from content
    if (content.includes("pnpm") || content.includes("npm") || content.includes("yarn")) return "bash";
    if (content.includes("import ") || content.includes("from ")) return "typescript";
    if (content.startsWith("{") || content.startsWith("[")) return "json";
    
    return "other";
  }

  /**
   * Check if code is executable
   */
  protected isExecutableCode(type: ICodeExample["type"], content: string): boolean {
    switch (type) {
      case "bash":
        return content.includes("pnpm") || content.includes("npm") || content.includes("yarn") || 
               content.includes("git") || content.includes("cd") || content.includes("mkdir");
      case "typescript":
        return content.includes("import ") || content.includes("export ") || 
               content.includes("function ") || content.includes("const ") || content.includes("class ");
      case "json":
        return content.includes("package.json") || content.includes("tsconfig") || 
               content.includes("playwright.config");
      case "python":
        return content.includes("import ") || content.includes("def ") || content.includes("class ");
      case "dockerfile":
        return content.includes("FROM ") || content.includes("RUN ") || content.includes("COPY ");
      default:
        return false;
    }
  }

  /**
   * Extract dependencies from code content
   */
  protected extractDependencies(content: string, type: ICodeExample["type"]): string[] {
    const dependencies: string[] = [];
    
    if (type === "bash") {
      // Extract package names from install commands
      const installMatches = content.match(/(?:pnpm|npm|yarn)\s+(?:add|install)\s+([^\s\n]+)/g);
      if (installMatches) {
        installMatches.forEach(match => {
          const packages = match.split(/\s+/).slice(2);
          dependencies.push(...packages);
        });
      }
    } else if (type === "typescript") {
      // Extract import statements
      const importMatches = content.match(/import\s+.*?\s+from\s+["']([^"']+)["']/g);
      if (importMatches) {
        importMatches.forEach(match => {
          const packageMatch = match.match(/from\s+["']([^"']+)["']/);
          if (packageMatch) {
            dependencies.push(packageMatch[1]);
          }
        });
      }
    }
    
    return [...new Set(dependencies)]; // Remove duplicates
  }

  /**
   * Generate validation rules for code examples
   */
  protected generateValidationRules(type: ICodeExample["type"], content: string): ValidationRule[] {
    const rules: ValidationRule[] = [];
    
    if (type === "bash") {
      if (content.includes("pnpm")) {
        rules.push({
          type: "dependency",
          rule: "pnpm must be available",
          severity: "error"
        });
      }
      if (content.includes("cd ")) {
        rules.push({
          type: "runtime",
          rule: "Directory must exist",
          severity: "error"
        });
      }
    } else if (type === "typescript") {
      if (content.includes("import ")) {
        rules.push({
          type: "syntax",
          rule: "TypeScript syntax must be valid",
          severity: "error"
        });
        rules.push({
          type: "import",
          rule: "All imports must be resolvable",
          severity: "error"
        });
      }
    } else if (type === "json") {
      rules.push({
        type: "syntax",
        rule: "JSON must be valid",
        severity: "error"
      });
    }
    
    return rules;
  }

  /**
   * Extract context around a code block
   */
  protected extractContext(lines: string[], lineIndex: number): string {
    const contextLines: string[] = [];
    const start = Math.max(0, lineIndex - 3);
    const end = Math.min(lines.length, lineIndex + 1);
    
    for (let i = start; i < end; i++) {
      if (i !== lineIndex) {
        contextLines.push(lines[i]);
      }
    }
    
    return contextLines.join("\n").trim();
  }

  /**
   * Check if file is a documentation file
   */
  protected isDocumentationFile(fileName: string): boolean {
    const ext = extname(fileName).toLowerCase();
    const name = fileName.toLowerCase();
    
    return (
      ext === ".md" ||
      name === "readme" ||
      name === "changelog" ||
      name === "contributing" ||
      name === "license" ||
      name.includes("readme") ||
      name.includes("changelog") ||
      name.includes("contributing")
    );
  }

  /**
   * Get all scanned code examples
   */
  getCodeExamples(): ICodeExample[] {
    return [...this.codeExamples];
  }

  /**
   * Get code examples by type
   */
  getCodeExamplesByType(type: ICodeExample["type"]): ICodeExample[] {
    return this.codeExamples.filter(example => example.type === type);
  }

  /**
   * Get executable code examples
   */
  getExecutableExamples(): ICodeExample[] {
    return this.codeExamples.filter(example => example.isExecutable);
  }

  /**
   * Get code examples by source file
   */
  getCodeExamplesBySource(source: string): ICodeExample[] {
    return this.codeExamples.filter(example => example.source === source);
  }

  /**
   * Clear all scanned data
   */
  clear(): void {
    this.scannedFiles.clear();
    this.codeExamples = [];
  }
}

