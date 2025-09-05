/**
 * Metadata Extractor for the Reynard File Processing system.
 *
 * This module provides unified metadata extraction for various file types
 * including images, videos, audio, text, code, and documents.
 */

import {
  ProcessingResult,
  ImageMetadata,
  VideoMetadata,
  AudioMetadata,
  TextMetadata,
  CodeMetadata,
  LoraMetadata,
  DocumentMetadata,
  FileMetadata,
  ExifData,
} from "../types";
import { getFileTypeInfo, getFileCategory } from "../config/file-types";

export interface MetadataExtractionOptions {
  /** Whether to extract EXIF data from images */
  extractExif?: boolean;
  /** Whether to perform content analysis */
  analyzeContent?: boolean;
  /** Whether to detect language for text files */
  detectLanguage?: boolean;
  /** Whether to extract embedded metadata */
  extractEmbedded?: boolean;
  /** Maximum content length to analyze */
  maxContentLength?: number;
}

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
          metadata = await this.extractImageMetadata(file, mergedOptions);
          break;
        case "video":
          metadata = await this.extractVideoMetadata(file);
          break;
        case "audio":
          metadata = await this.extractAudioMetadata(file);
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
        case "document":
          metadata = await this.extractDocumentMetadata(file, mergedOptions);
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
   * Extract metadata from image files
   */
  private async extractImageMetadata(
    file: File | string,
    options: MetadataExtractionOptions,
  ): Promise<ImageMetadata> {
    const image = await this.loadImage(file);
    const basicInfo = await this.getBasicFileInfo(file);

    const metadata: ImageMetadata = {
      ...basicInfo,
      width: image.naturalWidth,
      height: image.naturalHeight,
      isAnimated: await this.detectImageAnimation(file),
      frameCount: 1, // Default for static images
      duration: 0, // Default for static images
      colorSpace: "sRGB", // Default assumption
      bitDepth: 8, // Default assumption
    };

    // Extract EXIF data if enabled
    if (options.extractExif) {
      try {
        const exif = await this.extractExifData();
        if (exif) {
          metadata.exif = exif;
          // Update metadata with EXIF information
          if (exif.XResolution) metadata.width = exif.XResolution;
          if (exif.YResolution) metadata.height = exif.YResolution;
          if (exif.ISOSpeedRatings) metadata.bitDepth = exif.ISOSpeedRatings;
          if (exif.ColorSpace) metadata.colorSpace = exif.ColorSpace.toString();
        }
      } catch (error) {
        // EXIF extraction failed, continue without it
        console.warn("EXIF extraction failed:", error);
      }
    }

    // Detect animation for GIF and WebP
    if (metadata.isAnimated) {
      const animationInfo = await this.extractAnimationInfo();
      if (animationInfo) {
        metadata.frameCount = animationInfo.frameCount;
        metadata.duration = animationInfo.duration;
      }
    }

    return metadata;
  }

  /**
   * Extract metadata from video files
   */
  private async extractVideoMetadata(
    file: File | string,
  ): Promise<VideoMetadata> {
    const video = await this.loadVideo(file);
    const basicInfo = await this.getBasicFileInfo(file);

    const metadata: VideoMetadata = {
      ...basicInfo,
      width: video.videoWidth,
      height: video.videoHeight,
      duration: video.duration,
      fps: 30, // Default assumption
      bitrate: 0, // Would need more complex analysis
      codec: "unknown", // Would need more complex analysis
      frameCount: Math.floor(video.duration * 30), // Estimate based on default FPS
    };

    // Try to extract more detailed video information
    try {
      const videoInfo = await this.extractVideoInfo();
      if (videoInfo) {
        metadata.fps = videoInfo.fps || metadata.fps;
        metadata.bitrate = videoInfo.bitrate || metadata.bitrate;
        metadata.codec = videoInfo.codec || metadata.codec;
        metadata.frameCount = videoInfo.frameCount || metadata.frameCount;
        metadata.audioCodec = videoInfo.audioCodec;
        metadata.audioBitrate = videoInfo.audioBitrate;
      }
    } catch (error) {
      console.warn("Detailed video info extraction failed:", error);
    }

    return metadata;
  }

  /**
   * Extract metadata from audio files
   */
  private async extractAudioMetadata(
    file: File | string,
  ): Promise<AudioMetadata> {
    const audio = await this.loadAudio(file);
    const basicInfo = await this.getBasicFileInfo(file);

    const metadata: AudioMetadata = {
      ...basicInfo,
      duration: audio.duration,
      sampleRate: 44100, // Default assumption
      channels: 2, // Default assumption
      bitrate: 0, // Would need more complex analysis
      codec: "unknown", // Would need more complex analysis
      format: this.getFileExtension(basicInfo.name).substring(1).toUpperCase(),
    };

    // Try to extract more detailed audio information
    try {
      const audioInfo = await this.extractAudioInfo();
      if (audioInfo) {
        metadata.sampleRate = audioInfo.sampleRate || metadata.sampleRate;
        metadata.channels = audioInfo.channels || metadata.channels;
        metadata.bitrate = audioInfo.bitrate || metadata.bitrate;
        metadata.codec = audioInfo.codec || metadata.codec;
      }
    } catch (error) {
      console.warn("Detailed audio info extraction failed:", error);
    }

    return metadata;
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

  /**
   * Extract metadata from document files
   */
  private async extractDocumentMetadata(
    file: File | string,
    options: MetadataExtractionOptions,
  ): Promise<DocumentMetadata> {
    const basicInfo = await this.getBasicFileInfo(file);
    const extension = this.getFileExtension(basicInfo.name);

    const metadata: DocumentMetadata = {
      ...basicInfo,
      documentType: extension.substring(1).toUpperCase(),
      pageCount: 1, // Default assumption
      title: "", // Would need to extract from file content
      author: "", // Would need to extract from file content
      subject: "", // Would need to extract from file content
      keywords: [], // Would need to extract from file content
      hasText: true, // Default assumption
      ocrConfidence: 0, // Default assumption
    };

    // Try to extract document information
    if (options.extractEmbedded) {
      try {
        const docInfo = await this.extractDocumentInfo();
        if (docInfo) {
          metadata.pageCount = docInfo.pageCount || metadata.pageCount;
          metadata.title = docInfo.title || metadata.title;
          metadata.author = docInfo.author || metadata.author;
          metadata.subject = docInfo.subject || metadata.subject;
          metadata.keywords = docInfo.keywords || metadata.keywords;
          metadata.hasText = docInfo.hasText ?? metadata.hasText;
          metadata.ocrConfidence =
            docInfo.ocrConfidence || metadata.ocrConfidence;
        }
      } catch (error) {
        console.warn("Document info extraction failed:", error);
      }
    }

    return metadata;
  }

  // Helper methods

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

  private async loadImage(file: File | string): Promise<HTMLImageElement> {
    const image = new Image();
    image.crossOrigin = "anonymous";

    if (typeof file === "string") {
      image.src = file;
    } else {
      image.src = URL.createObjectURL(file);
    }

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Failed to load image"));
    });

    return image;
  }

  private async loadVideo(file: File | string): Promise<HTMLVideoElement> {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;

    if (typeof file === "string") {
      video.src = file;
    } else {
      video.src = URL.createObjectURL(file);
    }

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Failed to load video"));
    });

    return video;
  }

  private async loadAudio(file: File | string): Promise<HTMLAudioElement> {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";

    if (typeof file === "string") {
      audio.src = file;
    } else {
      audio.src = URL.createObjectURL(file);
    }

    await new Promise<void>((resolve, reject) => {
      audio.onloadedmetadata = () => resolve();
      audio.onerror = () => reject(new Error("Failed to load audio"));
    });

    return audio;
  }

  private async loadText(file: File | string): Promise<string> {
    if (typeof file === "string") {
      const response = await fetch(file);
      return await response.text();
    } else {
      return await file.text();
    }
  }

  private async detectImageAnimation(file: File | string): Promise<boolean> {
    // Simple detection based on file extension
    const extension = this.getFileExtension(
      typeof file === "string" ? file : file.name,
    );
    return extension === ".gif" || extension === ".webp";
  }

  private async extractExifData(): Promise<ExifData | null> {
    // This would require a proper EXIF library
    // For now, return null
    return null;
  }

  private async extractAnimationInfo(): Promise<{
    frameCount: number;
    duration: number;
  } | null> {
    // This would require parsing the actual file format
    // For now, return null
    return null;
  }

  private async extractVideoInfo(): Promise<{
    fps: number;
    bitrate: number;
    codec: string;
    frameCount: number;
    audioCodec?: string;
    audioBitrate?: number;
  } | null> {
    // This would require more complex video analysis
    // For now, return null
    return null;
  }

  private async extractAudioInfo(): Promise<{
    sampleRate: number;
    channels: number;
    bitrate: number;
    codec: string;
  } | null> {
    // This would require more complex audio analysis
    // For now, return null
    return null;
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
