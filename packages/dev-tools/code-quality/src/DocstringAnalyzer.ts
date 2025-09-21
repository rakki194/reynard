/**
 * 🦦 Reynard Docstring Analyzer
 *
 * *splashes with thoroughness* Analyzes docstring coverage and quality
 * with otter-like attention to detail. Detects missing, sparse, or
 * low-quality docstrings in Python and TypeScript code.
 */

import { readFileSync, existsSync } from "fs";
import { QualityIssue, IssueType, IssueSeverity } from "./types";

export interface DocstringMetrics {
  totalFunctions: number;
  documentedFunctions: number;
  totalClasses: number;
  documentedClasses: number;
  totalModules: number;
  documentedModules: number;
  coveragePercentage: number;
  averageDocstringLength: number;
  qualityScore: number; // 0-100
}

export interface DocstringAnalysis {
  file: string;
  language: string;
  metrics: DocstringMetrics;
  issues: QualityIssue[];
  functions: FunctionDocstring[];
  classes: ClassDocstring[];
  modules: ModuleDocstring[];
}

export interface FunctionDocstring {
  name: string;
  line: number;
  hasDocstring: boolean;
  docstringLength: number;
  quality: "excellent" | "good" | "poor" | "missing";
  issues: string[];
}

export interface ClassDocstring {
  name: string;
  line: number;
  hasDocstring: boolean;
  docstringLength: number;
  quality: "excellent" | "good" | "poor" | "missing";
  issues: string[];
}

export interface ModuleDocstring {
  line: number;
  hasDocstring: boolean;
  docstringLength: number;
  quality: "excellent" | "good" | "poor" | "missing";
  issues: string[];
}

export class DocstringAnalyzer {
  // private readonly minDocstringLength = 20; // Minimum characters for a meaningful docstring
  private readonly minFunctionDocstringLength = 10;
  private readonly minClassDocstringLength = 15;
  private readonly minModuleDocstringLength = 30;

  /**
   * 🦦 Analyze docstring coverage for a single file
   */
  async analyzeFile(filePath: string): Promise<DocstringAnalysis> {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = readFileSync(filePath, "utf-8");
    const language = this.detectLanguage(filePath);

    if (language === "python") {
      return this.analyzePythonFile(filePath, content);
    } else if (language === "typescript") {
      return this.analyzeTypeScriptFile(filePath, content);
    } else {
      throw new Error(`Unsupported language for docstring analysis: ${language}`);
    }
  }

  /**
   * 🦦 Analyze multiple files for docstring coverage
   */
  async analyzeFiles(filePaths: string[]): Promise<DocstringAnalysis[]> {
    const analyses: DocstringAnalysis[] = [];

    for (const filePath of filePaths) {
      try {
        const analysis = await this.analyzeFile(filePath);
        analyses.push(analysis);
      } catch (error) {
        console.warn(`⚠️ Failed to analyze ${filePath}:`, error);
      }
    }

    return analyses;
  }

  /**
   * 🦦 Get overall docstring metrics across all files
   */
  getOverallMetrics(analyses: DocstringAnalysis[]): DocstringMetrics {
    let totalFunctions = 0;
    let documentedFunctions = 0;
    let totalClasses = 0;
    let documentedClasses = 0;
    let totalModules = 0;
    let documentedModules = 0;
    let totalDocstringLength = 0;
    let docstringCount = 0;

    for (const analysis of analyses) {
      totalFunctions += analysis.metrics.totalFunctions;
      documentedFunctions += analysis.metrics.documentedFunctions;
      totalClasses += analysis.metrics.totalClasses;
      documentedClasses += analysis.metrics.documentedClasses;
      totalModules += analysis.metrics.totalModules;
      documentedModules += analysis.metrics.documentedModules;

      // Calculate average docstring length
      for (const func of analysis.functions) {
        if (func.hasDocstring) {
          totalDocstringLength += func.docstringLength;
          docstringCount++;
        }
      }
      for (const cls of analysis.classes) {
        if (cls.hasDocstring) {
          totalDocstringLength += cls.docstringLength;
          docstringCount++;
        }
      }
      if (analysis.modules.length > 0 && analysis.modules[0].hasDocstring) {
        totalDocstringLength += analysis.modules[0].docstringLength;
        docstringCount++;
      }
    }

    const totalDocumentable = totalFunctions + totalClasses + totalModules;
    const totalDocumented = documentedFunctions + documentedClasses + documentedModules;
    const coveragePercentage = totalDocumentable > 0 ? (totalDocumented / totalDocumentable) * 100 : 100;
    const averageDocstringLength = docstringCount > 0 ? totalDocstringLength / docstringCount : 0;

    // Calculate quality score based on coverage and average length
    const lengthScore = Math.min(averageDocstringLength / 50, 1) * 50; // Max 50 points for length
    const coverageScore = coveragePercentage; // Max 50 points for coverage
    const qualityScore = Math.round(lengthScore + coverageScore);

    return {
      totalFunctions,
      documentedFunctions,
      totalClasses,
      documentedClasses,
      totalModules,
      documentedModules,
      coveragePercentage: Math.round(coveragePercentage * 100) / 100,
      averageDocstringLength: Math.round(averageDocstringLength * 100) / 100,
      qualityScore,
    };
  }

  private detectLanguage(filePath: string): string {
    if (filePath.endsWith(".py")) return "python";
    if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) return "typescript";
    throw new Error(`Cannot detect language for file: ${filePath}`);
  }

  private analyzePythonFile(filePath: string, content: string): DocstringAnalysis {
    const lines = content.split("\n");
    const functions: FunctionDocstring[] = [];
    const classes: ClassDocstring[] = [];
    const modules: ModuleDocstring[] = [];
    const issues: QualityIssue[] = [];

    // Check module docstring (first statement)
    const moduleDocstring = this.extractPythonModuleDocstring(lines);
    modules.push(moduleDocstring);

    // Find all functions and classes
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Function definition
      if (line.startsWith("def ")) {
        const funcName = this.extractPythonFunctionName(line);
        const funcDocstring = this.extractPythonFunctionDocstring(lines, i);
        functions.push(funcDocstring);

        // Create issues for missing or poor docstrings
        if (!funcDocstring.hasDocstring) {
          issues.push(this.createMissingDocstringIssue(filePath, i + 1, "function", funcName));
        } else if (funcDocstring.quality === "poor") {
          issues.push(this.createPoorDocstringIssue(filePath, i + 1, "function", funcName, funcDocstring.issues));
        }
      }

      // Class definition
      if (line.startsWith("class ")) {
        const className = this.extractPythonClassName(line);
        const classDocstring = this.extractPythonClassDocstring(lines, i);
        classes.push(classDocstring);

        // Create issues for missing or poor docstrings
        if (!classDocstring.hasDocstring) {
          issues.push(this.createMissingDocstringIssue(filePath, i + 1, "class", className));
        } else if (classDocstring.quality === "poor") {
          issues.push(this.createPoorDocstringIssue(filePath, i + 1, "class", className, classDocstring.issues));
        }
      }
    }

    // Create issue for missing module docstring
    if (!moduleDocstring.hasDocstring) {
      issues.push(this.createMissingDocstringIssue(filePath, 1, "module", "module"));
    } else if (moduleDocstring.quality === "poor") {
      issues.push(this.createPoorDocstringIssue(filePath, 1, "module", "module", moduleDocstring.issues));
    }

    const metrics: DocstringMetrics = {
      totalFunctions: functions.length,
      documentedFunctions: functions.filter(f => f.hasDocstring).length,
      totalClasses: classes.length,
      documentedClasses: classes.filter(c => c.hasDocstring).length,
      totalModules: 1,
      documentedModules: moduleDocstring.hasDocstring ? 1 : 0,
      coveragePercentage: 0, // Will be calculated
      averageDocstringLength: 0, // Will be calculated
      qualityScore: 0, // Will be calculated
    };

    return {
      file: filePath,
      language: "python",
      metrics,
      issues,
      functions,
      classes,
      modules,
    };
  }

  private analyzeTypeScriptFile(filePath: string, content: string): DocstringAnalysis {
    const lines = content.split("\n");
    const functions: FunctionDocstring[] = [];
    const classes: ClassDocstring[] = [];
    const modules: ModuleDocstring[] = [];
    const issues: QualityIssue[] = [];

    // Check module docstring (JSDoc at top)
    const moduleDocstring = this.extractTypeScriptModuleDocstring(lines);
    modules.push(moduleDocstring);

    // Find all functions and classes
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Function definition (various patterns)
      if (this.isTypeScriptFunction(line)) {
        const funcName = this.extractTypeScriptFunctionName(line);
        const funcDocstring = this.extractTypeScriptFunctionDocstring(lines, i);
        functions.push(funcDocstring);

        // Create issues for missing or poor docstrings
        if (!funcDocstring.hasDocstring) {
          issues.push(this.createMissingDocstringIssue(filePath, i + 1, "function", funcName));
        } else if (funcDocstring.quality === "poor") {
          issues.push(this.createPoorDocstringIssue(filePath, i + 1, "function", funcName, funcDocstring.issues));
        }
      }

      // Class definition (skip comment lines)
      if (
        (line.startsWith("class ") || line.includes(" class ")) &&
        !line.trim().startsWith("//") &&
        !line.trim().startsWith("*") &&
        !line.trim().startsWith("/*")
      ) {
        const className = this.extractTypeScriptClassName(line);
        const classDocstring = this.extractTypeScriptClassDocstring(lines, i);
        classes.push(classDocstring);

        // Create issues for missing or poor docstrings
        if (!classDocstring.hasDocstring) {
          issues.push(this.createMissingDocstringIssue(filePath, i + 1, "class", className));
        } else if (classDocstring.quality === "poor") {
          issues.push(this.createPoorDocstringIssue(filePath, i + 1, "class", className, classDocstring.issues));
        }
      }
    }

    // Create issue for missing module docstring
    if (!moduleDocstring.hasDocstring) {
      issues.push(this.createMissingDocstringIssue(filePath, 1, "module", "module"));
    } else if (moduleDocstring.quality === "poor") {
      issues.push(this.createPoorDocstringIssue(filePath, 1, "module", "module", moduleDocstring.issues));
    }

    const metrics: DocstringMetrics = {
      totalFunctions: functions.length,
      documentedFunctions: functions.filter(f => f.hasDocstring).length,
      totalClasses: classes.length,
      documentedClasses: classes.filter(c => c.hasDocstring).length,
      totalModules: 1,
      documentedModules: moduleDocstring.hasDocstring ? 1 : 0,
      coveragePercentage: 0, // Will be calculated
      averageDocstringLength: 0, // Will be calculated
      qualityScore: 0, // Will be calculated
    };

    return {
      file: filePath,
      language: "typescript",
      metrics,
      issues,
      functions,
      classes,
      modules,
    };
  }

  // Python-specific extraction methods
  private extractPythonModuleDocstring(lines: string[]): ModuleDocstring {
    // Look for docstring at the beginning of the file
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('"""') || line.startsWith("'''")) {
        const docstring = this.extractPythonDocstring(lines, i);
        return {
          line: i + 1,
          hasDocstring: true,
          docstringLength: docstring.length,
          quality: this.assessDocstringQuality(docstring, this.minModuleDocstringLength, "module"),
          issues: this.identifyDocstringIssues(docstring, this.minModuleDocstringLength, "module"),
        };
      }
      if (line && !line.startsWith("#") && !line.startsWith("import") && !line.startsWith("from")) {
        break; // Found non-comment, non-import code without docstring
      }
    }

    return {
      line: 1,
      hasDocstring: false,
      docstringLength: 0,
      quality: "missing",
      issues: ["Missing module docstring"],
    };
  }

  private extractPythonFunctionDocstring(lines: string[], funcLine: number): FunctionDocstring {
    const funcName = this.extractPythonFunctionName(lines[funcLine]);

    // Look for docstring in the function body
    for (let i = funcLine + 1; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and comments
      if (!line || line.startsWith("#")) continue;

      // Check for docstring
      if (line.startsWith('"""') || line.startsWith("'''")) {
        const docstring = this.extractPythonDocstring(lines, i);
        return {
          name: funcName,
          line: funcLine + 1,
          hasDocstring: true,
          docstringLength: docstring.length,
          quality: this.assessDocstringQuality(docstring, this.minFunctionDocstringLength, "function"),
          issues: this.identifyDocstringIssues(docstring, this.minFunctionDocstringLength, "function"),
        };
      }

      // If we hit non-empty, non-comment code, no docstring
      if (line && !line.startsWith("#")) {
        break;
      }
    }

    return {
      name: funcName,
      line: funcLine + 1,
      hasDocstring: false,
      docstringLength: 0,
      quality: "missing",
      issues: ["Missing function docstring"],
    };
  }

  private extractPythonClassDocstring(lines: string[], classLine: number): ClassDocstring {
    const className = this.extractPythonClassName(lines[classLine]);

    // Look for docstring in the class body
    for (let i = classLine + 1; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and comments
      if (!line || line.startsWith("#")) continue;

      // Check for docstring
      if (line.startsWith('"""') || line.startsWith("'''")) {
        const docstring = this.extractPythonDocstring(lines, i);
        return {
          name: className,
          line: classLine + 1,
          hasDocstring: true,
          docstringLength: docstring.length,
          quality: this.assessDocstringQuality(docstring, this.minClassDocstringLength, "class"),
          issues: this.identifyDocstringIssues(docstring, this.minClassDocstringLength, "class"),
        };
      }

      // If we hit non-empty, non-comment code, no docstring
      if (line && !line.startsWith("#")) {
        break;
      }
    }

    return {
      name: className,
      line: classLine + 1,
      hasDocstring: false,
      docstringLength: 0,
      quality: "missing",
      issues: ["Missing class docstring"],
    };
  }

  private extractPythonDocstring(lines: string[], startLine: number): string {
    const startLineContent = lines[startLine].trim();
    const isTripleQuote = startLineContent.startsWith('"""');
    const quoteType = isTripleQuote ? '"""' : "'''";

    // Single line docstring
    if (startLineContent.endsWith(quoteType) && startLineContent.length > 6) {
      return startLineContent.slice(3, -3).trim();
    }

    // Multi-line docstring
    let docstring = startLineContent.slice(3).trim();
    for (let i = startLine + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(quoteType)) {
        const endIndex = line.indexOf(quoteType);
        docstring += "\n" + line.slice(0, endIndex).trim();
        break;
      }
      docstring += "\n" + line.trim();
    }

    return docstring.trim();
  }

  private extractPythonFunctionName(line: string): string {
    const match = line.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
    return match ? match[1] : "unknown";
  }

  private extractPythonClassName(line: string): string {
    const match = line.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
    return match ? match[1] : "unknown";
  }

  // TypeScript-specific extraction methods
  private extractTypeScriptModuleDocstring(lines: string[]): ModuleDocstring {
    // Look for JSDoc at the beginning of the file
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("/**")) {
        const docstring = this.extractTypeScriptDocstring(lines, i);
        return {
          line: i + 1,
          hasDocstring: true,
          docstringLength: docstring.length,
          quality: this.assessDocstringQuality(docstring, this.minModuleDocstringLength, "module"),
          issues: this.identifyDocstringIssues(docstring, this.minModuleDocstringLength, "module"),
        };
      }
      if (line && !line.startsWith("//") && !line.startsWith("import") && !line.startsWith("export")) {
        break; // Found non-comment, non-import code without docstring
      }
    }

    return {
      line: 1,
      hasDocstring: false,
      docstringLength: 0,
      quality: "missing",
      issues: ["Missing module JSDoc"],
    };
  }

  private extractTypeScriptFunctionDocstring(lines: string[], funcLine: number): FunctionDocstring {
    const funcName = this.extractTypeScriptFunctionName(lines[funcLine]);

    // Look for JSDoc before the function
    for (let i = funcLine - 1; i >= 0; i--) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Check for JSDoc
      if (line.startsWith("/**")) {
        const docstring = this.extractTypeScriptDocstring(lines, i);
        return {
          name: funcName,
          line: funcLine + 1,
          hasDocstring: true,
          docstringLength: docstring.length,
          quality: this.assessDocstringQuality(docstring, this.minFunctionDocstringLength, "function"),
          issues: this.identifyDocstringIssues(docstring, this.minFunctionDocstringLength, "function"),
        };
      }

      // If we hit non-empty, non-comment code, no docstring
      if (line && !line.startsWith("//") && !line.startsWith("*")) {
        break;
      }
    }

    return {
      name: funcName,
      line: funcLine + 1,
      hasDocstring: false,
      docstringLength: 0,
      quality: "missing",
      issues: ["Missing function JSDoc"],
    };
  }

  private extractTypeScriptClassDocstring(lines: string[], classLine: number): ClassDocstring {
    const className = this.extractTypeScriptClassName(lines[classLine]);

    // Look for JSDoc before the class
    for (let i = classLine - 1; i >= 0; i--) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Check for JSDoc
      if (line.startsWith("/**")) {
        const docstring = this.extractTypeScriptDocstring(lines, i);
        return {
          name: className,
          line: classLine + 1,
          hasDocstring: true,
          docstringLength: docstring.length,
          quality: this.assessDocstringQuality(docstring, this.minClassDocstringLength, "class"),
          issues: this.identifyDocstringIssues(docstring, this.minClassDocstringLength, "class"),
        };
      }

      // If we hit non-empty, non-comment code, no docstring
      if (line && !line.startsWith("//") && !line.startsWith("*")) {
        break;
      }
    }

    return {
      name: className,
      line: classLine + 1,
      hasDocstring: false,
      docstringLength: 0,
      quality: "missing",
      issues: ["Missing class JSDoc"],
    };
  }

  private extractTypeScriptDocstring(lines: string[], startLine: number): string {
    let docstring = "";

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("/**")) {
        docstring += line.slice(3).trim();
      } else if (line.startsWith("*")) {
        docstring += "\n" + line.slice(1).trim();
      } else if (line.includes("*/")) {
        const endIndex = line.indexOf("*/");
        docstring += "\n" + line.slice(0, endIndex).trim();
        break;
      }
    }

    return docstring.trim();
  }

  private isTypeScriptFunction(line: string): boolean {
    // Skip comment lines
    if (line.trim().startsWith("//") || line.trim().startsWith("*") || line.trim().startsWith("/*")) {
      return false;
    }

    return (
      line.includes("function ") ||
      line.includes("=>") ||
      !!line.match(/^\s*(export\s+)?(async\s+)?(function|const|let|var)\s+\w+/) ||
      !!line.match(/^\s*(export\s+)?(async\s+)?\w+\s*\(/)
    );
  }

  private extractTypeScriptFunctionName(line: string): string {
    // Try various function patterns
    let match = line.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (match) return match[1];

    match = line.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=:]/);
    if (match) return match[1];

    match = line.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
    if (match) return match[1];

    return "unknown";
  }

  private extractTypeScriptClassName(line: string): string {
    const match = line.match(/class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    return match ? match[1] : "unknown";
  }

  // Quality assessment methods
  private assessDocstringQuality(
    docstring: string,
    minLength: number,
    context: "function" | "class" | "module" = "function"
  ): "excellent" | "good" | "poor" | "missing" {
    if (!docstring) return "missing";

    if (docstring.length < minLength) return "poor";

    // Check for common quality indicators
    const hasDescription = docstring.length > minLength;
    const hasParameters =
      docstring.includes("@param") || docstring.includes("Parameters:") || docstring.includes("Args:");
    const hasReturns =
      docstring.includes("@return") || docstring.includes("Returns:") || docstring.includes("@returns");
    const hasExamples = docstring.includes("@example") || docstring.includes("Example:");

    // For functions, use all quality indicators
    if (context === "function") {
      const qualityScore =
        (hasDescription ? 1 : 0) + (hasParameters ? 1 : 0) + (hasReturns ? 1 : 0) + (hasExamples ? 1 : 0);

      if (qualityScore >= 3) return "excellent";
      if (qualityScore >= 2) return "good";
      return "poor";
    }

    // For classes and modules, be more lenient - just need a good description
    if (context === "class" || context === "module") {
      if (hasDescription && docstring.length >= minLength * 1.5) return "excellent";
      if (hasDescription) return "good";
      return "poor";
    }

    return "poor";
  }

  private identifyDocstringIssues(
    docstring: string,
    minLength: number,
    context: "function" | "class" | "module" = "function"
  ): string[] {
    const issues: string[] = [];

    if (!docstring) {
      issues.push("Missing docstring");
      return issues;
    }

    if (docstring.length < minLength) {
      issues.push(`Docstring too short (${docstring.length} chars, minimum ${minLength})`);
    }

    // Only check for parameter documentation for functions
    if (
      context === "function" &&
      !docstring.includes("@param") &&
      !docstring.includes("Parameters:") &&
      !docstring.includes("Args:")
    ) {
      issues.push("Missing parameter documentation");
    }

    // Only check for return value documentation for functions
    if (
      context === "function" &&
      !docstring.includes("@return") &&
      !docstring.includes("Returns:") &&
      !docstring.includes("@returns")
    ) {
      issues.push("Missing return value documentation");
    }

    // Only check for usage examples for functions
    if (context === "function" && !docstring.includes("@example") && !docstring.includes("Example:")) {
      issues.push("Missing usage examples");
    }

    return issues;
  }

  // Issue creation methods
  private createMissingDocstringIssue(file: string, line: number, type: string, name: string): QualityIssue {
    return {
      id: `docstring-missing-${file}:${line}`,
      type: "CODE_SMELL" as IssueType,
      severity: "MAJOR" as IssueSeverity,
      message: `Missing ${type} docstring for '${name}'`,
      file,
      line,
      rule: "docstring-missing",
      effort: 15, // 15 minutes to add a basic docstring
      tags: ["docstring", "documentation", type],
      createdAt: new Date(),
    };
  }

  private createPoorDocstringIssue(
    file: string,
    line: number,
    type: string,
    name: string,
    issues: string[]
  ): QualityIssue {
    return {
      id: `docstring-poor-${file}:${line}`,
      type: "CODE_SMELL" as IssueType,
      severity: "MINOR" as IssueSeverity,
      message: `Poor quality ${type} docstring for '${name}': ${issues.join(", ")}`,
      file,
      line,
      rule: "docstring-quality",
      effort: 10, // 10 minutes to improve docstring
      tags: ["docstring", "documentation", type, "quality"],
      createdAt: new Date(),
    };
  }
}
