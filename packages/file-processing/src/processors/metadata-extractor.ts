/**
 * Metadata Extractor for the Reynard File Processing system.
 *
 * This module provides unified metadata extraction for various file types
 * using a factory pattern with specialized extractors.
 */

import {
  ProcessingResult,
  TextMetadata,
  CodeMetadata,
  LoraMetadata,
  FileMetadata,
} from "../types";
import { getFileTypeInfo, getFileCategory } from "../config/file-types";
import {
  MetadataExtractorFactory,
  MetadataExtractionOptions,
} from "./extractors";

export type { MetadataExtractionOptions };

export class MetadataExtractor {
  constructor(private options: MetadataExtractionOptions = {}) {
    this.options = {
      extractExif: true,
      analyzeContent: true,
      detectLanguage: true,
      extractEmbedded: true,
      maxContentLength: 1024 * 1024, // 1MB
      ...options,
    };
  }

  /**
   * Extract metadata from any supported file type
   */
  async extractMetadata(
    file: File | string,
    options?: Partial<MetadataExtractionOptions>,
  ): Promise<ProcessingResult<FileMetadata>> {
    const startTime = Date.now();
    const mergedOptions = { ...this.options, ...options };

    try {
      // Get file information
      const fileInfo = await this.getFileInfo(file);
      if (!fileInfo.success) {
        return {
          success: false,
          error: fileInfo.error,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        };
      }

      const { name } = fileInfo.data!;
      const extension = this.getFileExtension(name);
      const fileTypeInfo = getFileTypeInfo(extension);
      const category = getFileCategory(extension);

      // Check if file type supports metadata extraction
      if (!fileTypeInfo.capabilities.metadata) {
        return {
          success: false,
          error: `File type ${extension} does not support metadata extraction`,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        };
      }

      // Extract metadata based on file type
      let metadata: FileMetadata;

      switch (category) {
        case "image":
        case "video":
        case "audio":
        case "document":
          // Use factory-created extractors for these types
          const extractor = MetadataExtractorFactory.createExtractor(
            name,
            mergedOptions,
          );
          metadata = await extractor.extractMetadata(file, mergedOptions);
          break;
        case "text":
          metadata = await this.extractTextMetadata(file, mergedOptions);
          break;
        case "code":
          metadata = await this.extractCodeMetadata(file);
          break;
        case "lora":
          metadata = await this.extractLoraMetadata(file, mergedOptions);
          break;
        default:
          return {
            success: false,
            error: `Unsupported file category: ${category}`,
            duration: Date.now() - startTime,
            timestamp: new Date(),
          };
      }

      return {
        success: true,
        data: metadata,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Extract metadata from text files
   */
  private async extractTextMetadata(
    file: File | string,
    options: MetadataExtractionOptions,
  ): Promise<TextMetadata> {
    const text = await this.loadText(file);
    const basicInfo = await this.getBasicFileInfo(file);

    const metadata: TextMetadata = {
      ...basicInfo,
      lineCount: text.split("\n").length,
      characterCount: text.length,
      wordCount: text.split(/\s+/).filter((word) => word.length > 0).length,
      encoding: "UTF-8", // Default assumption
      isStructured: this.detectStructuredData(text),
    };

    // Detect language if enabled
    if (options.detectLanguage) {
      try {
        metadata.language = await this.detectLanguage(text);
      } catch (error) {
        console.warn("Language detection failed:", error);
      }
    }

    // Analyze content if enabled
    if (options.analyzeContent) {
      try {
        const contentAnalysis = await this.analyzeTextContent();
        if (contentAnalysis) {
          metadata.encoding = contentAnalysis.encoding || metadata.encoding;
        }
      } catch (error) {
        console.warn("Content analysis failed:", error);
      }
    }

    return metadata;
  }

  /**
   * Extract metadata from code files
   */
  private async extractCodeMetadata(
    file: File | string,
  ): Promise<CodeMetadata> {
    const text = await this.loadText(file);
    const basicInfo = await this.getBasicFileInfo(file);
    const extension = this.getFileExtension(basicInfo.name);

    const metadata: CodeMetadata = {
      ...basicInfo,
      language: this.detectProgrammingLanguage(extension),
      lineCount: text.split("\n").length,
      characterCount: text.length,
      hasSyntaxErrors: false, // Would need syntax checking
      dependencies: this.extractDependencies(text, extension),
      purpose: this.detectCodePurpose(extension),
    };

    return metadata;
  }

  /**
   * Extract metadata from LoRA model files
   */
  private async extractLoraMetadata(
    file: File | string,
    options: MetadataExtractionOptions,
  ): Promise<LoraMetadata> {
    const basicInfo = await this.getBasicFileInfo(file);
    const extension = this.getFileExtension(basicInfo.name);

    const metadata: LoraMetadata = {
      ...basicInfo,
      modelName: basicInfo.name.replace(extension, ""),
      version: "1.0", // Default assumption
      description: "", // Would need to extract from file content
      baseModel: "unknown", // Would need to extract from file content
      trainingData: "", // Would need to extract from file content
      tags: [], // Would need to extract from file content
      parameters: {}, // Would need to extract from file content
    };

    // Try to extract model information from file content
    if (options.extractEmbedded) {
      try {
        const modelInfo = await this.extractLoraModelInfo();
        if (modelInfo) {
          metadata.description = modelInfo.description || metadata.description;
          metadata.baseModel = modelInfo.baseModel || metadata.baseModel;
          metadata.trainingData =
            modelInfo.trainingData || metadata.trainingData;
          metadata.tags = modelInfo.tags || metadata.tags;
          metadata.parameters = modelInfo.parameters || metadata.parameters;
        }
      } catch (error) {
        console.warn("LoRA model info extraction failed:", error);
      }
    }

    return metadata;
  }

  // Helper methods for remaining extractors

  private async getFileInfo(
    file: File | string,
  ): Promise<ProcessingResult<{ name: string; size: number; type: string }>> {
    try {
      if (typeof file === "string") {
        return {
          success: true,
          data: {
            name: file.split("/").pop() || "unknown",
            size: 0,
            type: "unknown",
          },
          duration: 0,
          timestamp: new Date(),
        };
      } else {
        return {
          success: true,
          data: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
          duration: 0,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get file info",
        duration: 0,
        timestamp: new Date(),
      };
    }
  }

  private async getBasicFileInfo(file: File | string): Promise<FileMetadata> {
    const fileInfo = await this.getFileInfo(file);
    if (!fileInfo.success) {
      throw new Error(fileInfo.error);
    }

    const { name, size, type } = fileInfo.data!;
    const extension = this.getFileExtension(name);
    const fullPath = typeof file === "string" ? file : file.name;
    const path = fullPath.split("/").slice(0, -1).join("/") || ".";

    return {
      name,
      size,
      mime: type,
      mtime: new Date(),
      path,
      fullPath,
      extension,
      isHidden: name.startsWith("."),
      isDirectory: false,
    };
  }

  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf(".");
    return lastDotIndex !== -1
      ? filename.substring(lastDotIndex).toLowerCase()
      : "";
  }

  private async loadText(file: File | string): Promise<string> {
    if (typeof file === "string") {
      const response = await fetch(file);
      return await response.text();
    } else {
      return await file.text();
    }
  }

  private detectStructuredData(text: string): boolean {
    // Simple detection of structured data formats
    const trimmed = text.trim();
    return (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) || // JSON
      (trimmed.startsWith("<") && trimmed.endsWith(">")) || // XML
      trimmed.includes("\t") || // TSV
      (trimmed.includes(",") && trimmed.includes("\n")) // CSV
    );
  }

  private async detectLanguage(text: string): Promise<string> {
    // Simple language detection based on common patterns
    // This is a very basic implementation
    const sample = text.substring(0, Math.min(1000, text.length)).toLowerCase();

    if (sample.includes("the") && sample.includes("and")) return "en";
    if (sample.includes("der") && sample.includes("die")) return "de";
    if (sample.includes("le") && sample.includes("la")) return "fr";
    if (sample.includes("el") && sample.includes("la")) return "es";
    if (sample.includes("il") && sample.includes("la")) return "it";

    return "unknown";
  }

  private async analyzeTextContent(): Promise<{ encoding: string } | null> {
    // Simple encoding detection
    // This is a very basic implementation
    return { encoding: "UTF-8" };
  }

  private detectProgrammingLanguage(extension: string): string {
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

  private extractDependencies(content: string, extension: string): string[] {
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

  private detectCodePurpose(extension: string): string {
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

  private async extractLoraModelInfo(): Promise<{
    description: string;
    baseModel: string;
    trainingData: string;
    tags: string[];
    parameters: Record<string, string | number | boolean>;
  } | null> {
    // This would require parsing the actual LoRA file format
    // For now, return null
    return null;
  }

  private async extractDocumentInfo(): Promise<{
    pageCount: number;
    title: string;
    author: string;
    subject: string;
    keywords: string[];
    hasText: boolean;
    ocrConfidence: number;
  } | null> {
    // This would require parsing the actual document format
    // For now, return null
    return null;
  }
}
