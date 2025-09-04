# @reynard/file-processing

Advanced file processing, thumbnail generation, and media analysis for SolidJS applications.

## Features

- **Multi-format Support**: Images, videos, audio, text, code, documents, and LoRA models
- **Thumbnail Generation**: Automatic thumbnail creation for all supported file types
- **Metadata Extraction**: Comprehensive metadata extraction and analysis
- **Content Analysis**: Text analysis, language detection, and content processing
- **Progress Tracking**: Real-time progress updates and callbacks
- **Configurable Processing**: Flexible options for different use cases
- **Web Worker Support**: Background processing for better performance
- **Modern Web APIs**: Built with Canvas API, Web Audio API, and other modern standards

## Installation

```bash
npm install @reynard/file-processing
```

## Quick Start

```typescript
import {
  FileProcessingPipeline,
  ThumbnailGenerator,
} from "@reynard/file-processing";

// Create a processing pipeline
const pipeline = new FileProcessingPipeline({
  defaultThumbnailSize: [300, 300],
  maxFileSize: 50 * 1024 * 1024, // 50MB
});

// Process a single file
const result = await pipeline.processFile(file, {
  generateThumbnails: true,
  extractMetadata: true,
  analyzeContent: true,
});

// Generate a thumbnail
const thumbnailGenerator = new ThumbnailGenerator({
  size: [200, 200],
  format: "webp",
  quality: 85,
});

const thumbnail = await thumbnailGenerator.generateThumbnail(file);
```

## Supported File Types

### Images

- **Raster**: JPG, PNG, GIF, WebP, BMP, TIFF
- **Modern**: JXL, AVIF, HEIC, HEIF, JP2
- **Vector**: SVG, EPS, AI, CDR
- **Raw**: RAW, CR2, NEF, ARW, DNG

### Videos

- **Common**: MP4, AVI, MOV, MKV, WebM, FLV, WMV
- **High Quality**: MPG, MPEG, TS, MTS, M2TS
- **Professional**: ProRes, DNxHD, Cine, R3D, BRAW

### Audio

- **Lossy**: MP3, AAC, OGG, WMA, Opus
- **Lossless**: WAV, FLAC, ALAC, APE, WV
- **High Resolution**: DSD, DFF, DSF

### Text & Code

- **Plain Text**: TXT, MD, RST, TEX, LOG
- **Data**: JSON, XML, YAML, TOML, CSV, TSV
- **Scientific**: Parquet, Arrow, Feather, HDF5, NumPy
- **Programming**: Python, JavaScript, TypeScript, Java, C++, Rust, Go, and many more

### Documents

- **Office**: PDF, DOCX, PPTX, XLSX, ODT, ODP, ODS
- **E-books**: EPUB, MOBI, AZW3, KFX
- **Rich Text**: RTF, Pages, Key, Numbers

### LoRA Models

- **Formats**: SafeTensors, Checkpoint, PyTorch, ONNX, Bin

## API Reference

### FileProcessingPipeline

The main class that orchestrates all file processing operations.

#### Constructor

```typescript
new FileProcessingPipeline(config?: Partial<ProcessingConfig>)
```

#### Methods

- `processFile(file, options?)`: Process a single file
- `processFiles(files, options?)`: Process multiple files
- `generateThumbnail(file, options)`: Generate a thumbnail
- `extractMetadata(file)`: Extract metadata
- `scanDirectory(path, options?)`: Scan directory contents
- `getSupportedTypes()`: Get list of supported file types
- `isSupported(file)`: Check if file type is supported

#### Configuration

```typescript
interface ProcessingConfig {
  defaultThumbnailSize: [number, number];
  defaultPreviewSize: [number, number];
  supportedExtensions: string[];
  maxFileSize: number;
  timeout: number;
  cache: {
    enabled: boolean;
    maxSize: number;
    ttl: number;
  };
  threading: {
    maxWorkers: number;
    thumbnailWorkers: number;
    metadataWorkers: number;
  };
}
```

### ThumbnailGenerator

Specialized class for generating thumbnails from various file types.

#### Constructor

```typescript
new ThumbnailGenerator(options?: ThumbnailGeneratorOptions)
```

#### Methods

- `generateThumbnail(file, options?)`: Generate a thumbnail
- `destroy()`: Clean up resources

#### Options

```typescript
interface ThumbnailGeneratorOptions {
  size: [number, number];
  format?: "webp" | "png" | "jpeg";
  quality?: number;
  maintainAspectRatio?: boolean;
  backgroundColor?: string;
  enableAnimation?: boolean;
  animationSlowdown?: number;
  useWebWorkers?: boolean;
  maxThumbnailSize?: number;
  progressive?: boolean;
}
```

## Usage Examples

### Basic File Processing

```typescript
import { FileProcessingPipeline } from "@reynard/file-processing";

const pipeline = new FileProcessingPipeline();

// Process a file with default options
const result = await pipeline.processFile(file);

if (result.success) {
  console.log("Processing completed:", result.data);
} else {
  console.error("Processing failed:", result.error);
}
```

### Custom Thumbnail Generation

```typescript
import { ThumbnailGenerator } from "@reynard/file-processing";

const generator = new ThumbnailGenerator({
  size: [400, 400],
  format: "webp",
  quality: 90,
  maintainAspectRatio: true,
  backgroundColor: "#f0f0f0",
});

const thumbnail = await generator.generateThumbnail(file, {
  size: [200, 200],
  format: "png",
});
```

### Batch Processing with Progress

```typescript
import { FileProcessingPipeline } from "@reynard/file-processing";

const pipeline = new FileProcessingPipeline();

// Track progress
pipeline.onProgress((progress) => {
  console.log(`${progress.operation}: ${progress.progress.toFixed(1)}%`);
  console.log(`Processing: ${progress.currentFile}`);
});

// Process multiple files
const results = await pipeline.processFiles(files, {
  generateThumbnails: true,
  extractMetadata: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
});

console.log(`Processed ${results.length} files`);
```

### File Type Detection

```typescript
import {
  getFileTypeInfo,
  isSupportedExtension,
} from "@reynard/file-processing";

const fileInfo = getFileTypeInfo(".jpg");
console.log(fileInfo);
// {
//   extension: '.jpg',
//   mimeType: 'image/jpeg',
//   category: 'image',
//   isSupported: true,
//   capabilities: { thumbnail: true, metadata: true, content: true, ocr: true }
// }

const isSupported = isSupportedExtension(".xyz");
console.log(isSupported); // false
```

### Directory Scanning

```typescript
import { FileProcessingPipeline } from "@reynard/file-processing";

const pipeline = new FileProcessingPipeline();

const listing = await pipeline.scanDirectory("/path/to/directory", {
  generateThumbnails: false,
  extractMetadata: true,
});

if (listing.success) {
  console.log(`Directory: ${listing.data.path}`);
  console.log(`Files: ${listing.data.files.length}`);
  console.log(`Directories: ${listing.data.directories.length}`);
}
```

## Advanced Features

### Web Worker Support

```typescript
const generator = new ThumbnailGenerator({
  useWebWorkers: true,
  maxThumbnailSize: 2 * 1024 * 1024, // 2MB
});
```

### Custom Processing Options

```typescript
const result = await pipeline.processFile(file, {
  generateThumbnails: true,
  extractMetadata: true,
  performOCR: true,
  analyzeContent: true,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  timeout: 60000, // 60 seconds
});
```

### Error Handling

```typescript
try {
  const result = await pipeline.processFile(file);

  if (!result.success) {
    console.error("Processing failed:", result.error);
    console.error("Duration:", result.duration);
    console.error("Timestamp:", result.timestamp);
    return;
  }

  console.log("Processing successful:", result.data);
} catch (error) {
  console.error("Unexpected error:", error);
}
```

## Performance Considerations

- **Thumbnail Caching**: Enable caching for better performance
- **Web Workers**: Use background processing for large files
- **Batch Processing**: Process multiple files together
- **Progress Tracking**: Monitor processing to optimize workflows
- **Resource Cleanup**: Call `destroy()` when done

## Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **Required APIs**: Canvas API, Web Audio API, File API, Fetch API
- **Optional APIs**: OffscreenCanvas, Web Workers, WebAssembly

## Contributing

Contributions are welcome! Please see our contributing guidelines for details.

## License

MIT License - see LICENSE file for details.

## Related Packages

- `@reynard/core` - Core framework utilities
- `@reynard/gallery` - File gallery components
- `@reynard/ui` - UI components and themes
