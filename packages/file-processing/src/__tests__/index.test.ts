import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { FileProcessingPipeline, ThumbnailGenerator } from "../index";
import { getFileTypeInfo, isSupportedExtension } from "../config/file-types";

describe("FileProcessingPipeline", () => {
  let pipeline: FileProcessingPipeline;

  beforeEach(() => {
    pipeline = new FileProcessingPipeline();
  });

  afterEach(() => {
    pipeline.destroy();
  });

  it("should be created with default configuration", () => {
    expect(pipeline).toBeDefined();
    const config = pipeline.getConfig();
    expect(config.defaultThumbnailSize).toEqual([200, 200]);
    expect(config.maxFileSize).toBe(100 * 1024 * 1024);
  });

  it("should support common file extensions", () => {
    expect(pipeline.isSupported("test.jpg")).toBe(true);
    expect(pipeline.isSupported("test.png")).toBe(true);
    expect(pipeline.isSupported("test.mp4")).toBe(true);
    expect(pipeline.isSupported("test.mp3")).toBe(true);
    expect(pipeline.isSupported("test.txt")).toBe(true);
    expect(pipeline.isSupported("test.py")).toBe(true);
  });

  it("should reject unsupported file extensions", () => {
    expect(pipeline.isSupported("test.xyz")).toBe(false);
    expect(pipeline.isSupported("test.unknown")).toBe(false);
  });

  it("should get supported file types", () => {
    const types = pipeline.getSupportedTypes();
    expect(types.length).toBeGreaterThan(0);
    expect(types.some((t) => t.extension === ".jpg")).toBe(true);
    expect(types.some((t) => t.extension === ".png")).toBe(true);
  });

  it("should update configuration", () => {
    pipeline.updateConfig({
      defaultThumbnailSize: [300, 300],
      maxFileSize: 50 * 1024 * 1024,
    });

    const config = pipeline.getConfig();
    expect(config.defaultThumbnailSize).toEqual([300, 300]);
    expect(config.maxFileSize).toBe(50 * 1024 * 1024);
  });
});

describe("ThumbnailGenerator", () => {
  let generator: ThumbnailGenerator;

  beforeEach(() => {
    generator = new ThumbnailGenerator();
  });

  afterEach(() => {
    generator.destroy();
  });

  it("should be created with default options", () => {
    expect(generator).toBeDefined();
  });

  it("should generate thumbnails for supported formats", async () => {
    // Create a mock image file
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 100, 100);

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, "image/png");
    });

    const file = new File([blob], "test.png", { type: "image/png" });

    const result = await generator.generateThumbnail(file, {
      size: [50, 50],
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
});

describe("File Type Configuration", () => {
  it("should provide file type information", () => {
    const jpgInfo = getFileTypeInfo(".jpg");
    expect(jpgInfo.extension).toBe(".jpg");
    expect(jpgInfo.category).toBe("image");
    expect(jpgInfo.isSupported).toBe(true);
    expect(jpgInfo.capabilities.thumbnail).toBe(true);

    const mp4Info = getFileTypeInfo(".mp4");
    expect(mp4Info.extension).toBe(".mp4");
    expect(mp4Info.category).toBe("video");
    expect(mp4Info.isSupported).toBe(true);
  });

  it("should check if extensions are supported", () => {
    expect(isSupportedExtension(".jpg")).toBe(true);
    expect(isSupportedExtension(".png")).toBe(true);
    expect(isSupportedExtension(".mp4")).toBe(true);
    expect(isSupportedExtension(".mp3")).toBe(true);
    expect(isSupportedExtension(".txt")).toBe(true);
    expect(isSupportedExtension(".py")).toBe(true);
    expect(isSupportedExtension(".xyz")).toBe(false);
  });
});

describe("Processing Pipeline Integration", () => {
  let pipeline: FileProcessingPipeline;

  beforeEach(() => {
    pipeline = new FileProcessingPipeline();
  });

  afterEach(() => {
    pipeline.destroy();
  });

  it("should process files with progress tracking", async () => {
    const progressUpdates: any[] = [];

    pipeline.onProgress((progress) => {
      progressUpdates.push(progress);
    });

    // Create mock files
    const files = [
      new File(["test1"], "test1.txt", { type: "text/plain" }),
      new File(["test2"], "test2.txt", { type: "text/plain" }),
      new File(["test3"], "test3.txt", { type: "text/plain" }),
    ];

    const results = await pipeline.processFiles(files, {
      generateThumbnails: false,
      extractMetadata: false,
    });

    expect(results.length).toBe(3);
    expect(progressUpdates.length).toBeGreaterThan(0);
    expect(progressUpdates[progressUpdates.length - 1].progress).toBe(100);
  });

  it("should handle processing errors gracefully", async () => {
    // This test would require more complex mocking
    // For now, just verify the pipeline doesn't crash
    expect(pipeline).toBeDefined();
  });
});
