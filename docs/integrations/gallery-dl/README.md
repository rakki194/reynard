# Gallery-dl Integration Guide

> **The Ultimate Media Download Solution for Reynard** 🦊

The Reynard Gallery-dl integration provides a comprehensive, enterprise-grade solution for downloading media from hundreds of websites. Built on the powerful gallery-dl framework, it offers advanced features, AI-enhanced metadata extraction, and seamless integration with the Reynard ecosystem.

## ✨ Features

### 🌐 **Universal Media Download**

- **500+ Supported Sites**: Instagram, Twitter, Reddit, DeviantArt, and many more
- **Multiple Formats**: Images, videos, GIFs, and other media types
- **Batch Downloads**: Download entire galleries with a single click
- **Smart Extraction**: Automatic detection of media content and metadata

### 🎯 **Advanced Download Management**

- **Concurrent Downloads**: Configurable parallel download processing
- **Progress Tracking**: Real-time progress monitoring with WebSocket updates
- **Retry Logic**: Intelligent retry mechanisms for failed downloads
- **Queue Management**: Priority-based download queuing system

### 🤖 **AI-Enhanced Features**

- **Metadata Extraction**: AI-powered content analysis and tagging
- **Content Organization**: Intelligent categorization and file organization
- **Duplicate Detection**: Smart duplicate file detection and handling
- **Quality Assessment**: Automatic quality scoring and filtering

### 🔧 **Enterprise Features**

- **User Authentication**: Secure, role-based access control
- **Rate Limiting**: Configurable download rate limits per user
- **Audit Logging**: Comprehensive activity logging and monitoring
- **API Integration**: RESTful API for programmatic access

## 🚀 Quick Start

### Installation

The gallery-dl integration is included with Reynard by default. No additional installation is required.

### Basic Usage

```typescript
import { GalleryService } from "reynard-gallery-dl";

// Initialize the service
const galleryService = new GalleryService({
  name: "my-gallery-service",
  baseUrl: "http://localhost:8000",
  timeout: 30000,
});

// Download a gallery
const result = await galleryService.downloadGallery(
  "https://www.instagram.com/p/example/",
  {
    outputDirectory: "./downloads",
    maxConcurrent: 3,
    retries: 3
  }
);

console.log(`Downloaded ${result.files.length} files`);
```

### React Component Usage

```tsx
import React from "react";
import { DownloadManager } from "reynard-gallery-dl";

function MyApp() {
  return (
    <div>
      <h1>Media Downloader</h1>
      <DownloadManager
        onDownloadComplete={(result) => {
          console.log("Download completed:", result);
        }}
        onError={(error) => {
          console.error("Download failed:", error);
        }}
      />
    </div>
  );
}
```

## 📖 API Reference

### GalleryService

The main service class for gallery-dl operations.

#### Constructor

```typescript
new GalleryService(config: GalleryServiceConfig)
```

**Parameters:**

- `config`: Service configuration object

#### Methods

##### `downloadGallery(url: string, options?: DownloadOptions): Promise<DownloadResult>`

Download media from a URL.

**Parameters:**

- `url`: The URL to download from
- `options`: Optional download configuration

**Returns:** Promise resolving to download result

**Example:**

```typescript
const result = await galleryService.downloadGallery(
  "https://example.com/gallery",
  {
    outputDirectory: "./downloads",
    maxConcurrent: 5,
    retries: 3,
    timeout: 60
  }
);
```

##### `validateUrl(url: string): Promise<ValidationResult>`

Validate a URL and detect the appropriate extractor.

**Parameters:**

- `url`: The URL to validate

**Returns:** Promise resolving to validation result

**Example:**

```typescript
const validation = await galleryService.validateUrl("https://example.com/gallery");
if (validation.isValid) {
  console.log("Extractor:", validation.extractor.name);
}
```

##### `getExtractors(): Promise<ExtractorInfo[]>`

Get list of available extractors.

**Returns:** Promise resolving to array of extractor information

**Example:**

```typescript
const extractors = await galleryService.getExtractors();
console.log(`Found ${extractors.length} extractors`);
```

##### `getDownloadProgress(downloadId: string): Promise<ProgressState>`

Get progress information for an active download.

**Parameters:**

- `downloadId`: The download ID

**Returns:** Promise resolving to progress state

**Example:**

```typescript
const progress = await galleryService.getDownloadProgress("download-123");
console.log(`Progress: ${progress.percentage}%`);
```

### React Components

#### DownloadManager

Main component for download management.

**Props:**

- `onDownloadComplete?: (result: DownloadResult) => void`
- `onError?: (error: Error) => void`
- `className?: string`

#### ProgressTracker

Component for displaying download progress.

**Props:**

- `download: Download`
- `showDetails?: boolean`
- `className?: string`

#### UrlValidator

Component for URL validation and extractor detection.

**Props:**

- `url: string`
- `onValidation?: (result: ValidationResult) => void`
- `className?: string`

#### ConfigurationPanel

Component for managing download configuration.

**Props:**

- `onConfigChange?: (config: GalleryConfig) => void`
- `initialConfig?: GalleryConfig`
- `className?: string`

#### FileList

Component for displaying downloaded files.

**Props:**

- `files: FileItem[]`
- `onFileSelect?: (file: FileItem) => void`
- `onFileRemove?: (fileId: string) => void`
- `className?: string`

#### ResultsDisplay

Component for displaying download results and statistics.

**Props:**

- `results: DownloadResult[]`
- `onExport?: (format: "json" | "csv" | "zip") => void`
- `onRefresh?: () => void`
- `className?: string`

## ⚙️ Configuration

### Settings Integration

The gallery-dl integration uses Reynard's centralized settings system. Configure options through the settings panel or programmatically:

```typescript
import { useSettings } from "reynard-settings";

function MyComponent() {
  const { getSetting, updateSetting } = useSettings();
  
  // Get current configuration
  const config = await getSetting("gallery-dl-config");
  
  // Update configuration
  await updateSetting("gallery-dl-config", {
    ...config,
    maxConcurrent: 5,
    defaultRetries: 3
  });
}
```

### Available Settings

#### Download Settings

- `defaultOutputDirectory`: Default download directory
- `maxConcurrentDownloads`: Maximum concurrent downloads
- `defaultRetries`: Default retry count
- `defaultTimeout`: Default timeout in seconds
- `sleepBetweenDownloads`: Sleep time between downloads

#### File Settings

- `filenameFormat`: Filename format template
- `minFileSize`: Minimum file size filter
- `maxFileSize`: Maximum file size filter
- `createSubdirectories`: Create subdirectories
- `skipExistingFiles`: Skip existing files

#### Extractor Settings

- `enableCustomExtractors`: Enable Reynard custom extractors
- `extractorOptions`: Extractor-specific options
- `allowedExtractors`: List of allowed extractors
- `blockedExtractors`: List of blocked extractors

#### Postprocessor Settings

- `defaultPostprocessors`: Default postprocessors
- `generateThumbnails`: Generate thumbnails
- `thumbnailSize`: Thumbnail size in pixels
- `extractMetadata`: Extract file metadata

#### Advanced Settings

- `userAgent`: User agent string
- `customHeaders`: Custom HTTP headers
- `enableLogging`: Enable detailed logging
- `logLevel`: Logging level

#### AI Integration Settings

- `enableAIMetadata`: Enable AI metadata extraction
- `aiMetadataProvider`: AI provider selection
- `aiMetadataConfidence`: Confidence threshold
- `autoTagImages`: Auto-generate tags
- `autoCategorize`: Auto-categorize content

#### Security Settings

- `requireAuthentication`: Require user authentication
- `allowedDomains`: Allowed domains list
- `blockedDomains`: Blocked domains list
- `maxDownloadSize`: Maximum download size
- `rateLimitPerMinute`: Rate limit per minute

## 🔧 Advanced Usage

### Custom Extractors

Create custom extractors for Reynard-specific content:

```python
# backend/app/extractors/reynard_content.py
from gallery_dl.extractor.common import Extractor, Message

class ReynardContentExtractor(Extractor):
    """Extractor for Reynard internal content"""
    category = "reynard"
    subcategory = "content"
    pattern = r"reynard://content/(\d+)"

    def items(self):
        content_id = self.groups[0]
        content = self._get_reynard_content(content_id)

        yield Message.Directory, {
            "title": content.title,
            "author": content.author,
            "category": content.category
        }

        for media in content.media_files:
            yield Message.Url, media.url, {
                "filename": media.filename,
                "extension": media.extension,
                "reynard_id": media.id
            }
```

### Batch Downloads

Process multiple URLs efficiently:

```typescript
const urls = [
  "https://example.com/gallery1",
  "https://example.com/gallery2",
  "https://example.com/gallery3"
];

const batchResult = await galleryService.createBatchDownload(urls, {
  maxConcurrent: 3,
  retries: 2,
  outputDirectory: "./batch-downloads"
});

console.log(`Batch download ID: ${batchResult.batchId}`);
```

### Progress Monitoring

Monitor download progress in real-time:

```typescript
// Start download
const result = await galleryService.downloadGallery(url, options);

// Monitor progress
const progressInterval = setInterval(async () => {
  const progress = await galleryService.getDownloadProgress(result.downloadId);
  console.log(`Progress: ${progress.percentage}%`);
  
  if (progress.status === "completed" || progress.status === "error") {
    clearInterval(progressInterval);
  }
}, 1000);
```

### Error Handling

Comprehensive error handling:

```typescript
try {
  const result = await galleryService.downloadGallery(url, options);
  
  if (!result.success) {
    console.error("Download failed:", result.error);
    return;
  }
  
  console.log("Download successful:", result.files.length, "files");
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Invalid URL:", error.message);
  } else if (error instanceof NetworkError) {
    console.error("Network error:", error.message);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## 🧪 Testing

### Unit Tests

```typescript
import { describe, it, expect, vi } from "vitest";
import { GalleryService } from "../services/GalleryService";

describe("GalleryService", () => {
  it("should download gallery successfully", async () => {
    const service = new GalleryService({
      name: "test-service",
      baseUrl: "http://localhost:8000",
      timeout: 30000,
    });
    
    const result = await service.downloadGallery("https://example.com/gallery", {});
    
    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(5);
  });
});
```

### Integration Tests

```typescript
import { test, expect } from "@playwright/test";

test("should download gallery from URL", async ({ page }) => {
  await page.goto("/gallery-dl");
  
  await page.fill('[data-testid="url-input"]', "https://example.com/gallery");
  await page.click('[data-testid="download-button"]');
  
  await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
  await expect(page.locator('[data-testid="download-complete"]')).toBeVisible({ timeout: 30000 });
});
```

## 🔒 Security Considerations

### Authentication

All gallery-dl operations require user authentication:

```typescript
// The service automatically includes authentication headers
const service = new GalleryService({
  name: "secure-service",
  baseUrl: "http://localhost:8000",
  token: "your-auth-token"
});
```

### Rate Limiting

Configure rate limits to prevent abuse:

```typescript
// In settings
{
  "rateLimitPerMinute": 60,
  "maxDownloadSize": 1073741824, // 1GB
  "allowedDomains": ["example.com", "instagram.com"]
}
```

### Content Filtering

Filter content based on your requirements:

```typescript
const options = {
  minFileSize: 1024, // 1KB minimum
  maxFileSize: 10485760, // 10MB maximum
  allowedTypes: ["image/jpeg", "image/png", "video/mp4"]
};
```

## 🚀 Performance Optimization

### Concurrent Downloads

Optimize download performance:

```typescript
// Adjust based on your system capabilities
const options = {
  maxConcurrent: 5, // Increase for faster downloads
  timeout: 30, // Adjust based on network speed
  retries: 3 // Balance between reliability and speed
};
```

### Caching

Enable caching for better performance:

```typescript
const service = new GalleryService({
  name: "cached-service",
  baseUrl: "http://localhost:8000",
  enableCache: true,
  cacheSize: 100 // MB
});
```

### Memory Management

Monitor memory usage for large downloads:

```typescript
// Use streaming for large files
const options = {
  streamLargeFiles: true,
  maxMemoryUsage: 512 * 1024 * 1024 // 512MB
};
```

## 🐛 Troubleshooting

### Common Issues

#### Download Failures

**Problem**: Downloads fail with network errors
**Solution**: Check network connectivity and increase timeout:

```typescript
const options = {
  timeout: 60, // Increase timeout
  retries: 5, // Increase retries
  sleep: 2 // Add delay between requests
};
```

#### Authentication Errors

**Problem**: 401 Unauthorized errors
**Solution**: Verify authentication token:

```typescript
const service = new GalleryService({
  name: "auth-service",
  baseUrl: "http://localhost:8000",
  token: "valid-auth-token" // Ensure token is valid
});
```

#### Memory Issues

**Problem**: High memory usage during downloads
**Solution**: Reduce concurrent downloads and enable streaming:

```typescript
const options = {
  maxConcurrent: 2, // Reduce concurrent downloads
  streamLargeFiles: true, // Enable streaming
  maxMemoryUsage: 256 * 1024 * 1024 // Limit memory usage
};
```

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
const service = new GalleryService({
  name: "debug-service",
  baseUrl: "http://localhost:8000",
  debug: true,
  logLevel: "debug"
});
```

## 📚 Examples

### Complete Download Application

```tsx
import React, { useState } from "react";
import { 
  DownloadManager, 
  ProgressTracker, 
  ResultsDisplay,
  ConfigurationPanel 
} from "reynard-gallery-dl";

function GalleryDownloadApp() {
  const [downloads, setDownloads] = useState([]);
  const [config, setConfig] = useState({});
  const [results, setResults] = useState([]);

  const handleDownloadComplete = (result) => {
    setResults(prev => [...prev, result]);
  };

  const handleConfigChange = (newConfig) => {
    setConfig(newConfig);
  };

  return (
    <div className="gallery-download-app">
      <h1>Gallery Downloader</h1>
      
      <div className="app-layout">
        <div className="sidebar">
          <ConfigurationPanel
            onConfigChange={handleConfigChange}
            initialConfig={config}
          />
        </div>
        
        <div className="main-content">
          <DownloadManager
            onDownloadComplete={handleDownloadComplete}
            config={config}
          />
          
          <ResultsDisplay
            results={results}
            onExport={(format) => {
              console.log(`Exporting as ${format}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

### Custom Download Hook

```typescript
import { useState, useCallback } from "react";
import { GalleryService } from "reynard-gallery-dl";

export function useGalleryDownload() {
  const [downloads, setDownloads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const downloadGallery = useCallback(async (url: string, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const service = new GalleryService({
        name: "hook-service",
        baseUrl: "http://localhost:8000",
        timeout: 30000,
      });

      const result = await service.downloadGallery(url, options);
      
      setDownloads(prev => [...prev, result]);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDownloadProgress = useCallback(async (downloadId: string) => {
    const service = new GalleryService({
      name: "hook-service",
      baseUrl: "http://localhost:8000",
      timeout: 30000,
    });

    return await service.getDownloadProgress(downloadId);
  }, []);

  return {
    downloads,
    isLoading,
    error,
    downloadGallery,
    getDownloadProgress
  };
}
```

## 🤝 Contributing

We welcome contributions to the gallery-dl integration! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

### Development Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Start the development server: `pnpm dev`
4. Run tests: `pnpm test`

### Adding New Extractors

1. Create extractor in `backend/app/extractors/`
2. Register in `backend/app/extractors/registry.py`
3. Add tests in `backend/tests/test_extractors/`
4. Update documentation

## 📄 License

This integration is part of the Reynard project and is licensed under the MIT License. See [LICENSE](../../LICENSE) for details.

## 🆘 Support

- **Documentation**: [docs.reynard.dev](https://docs.reynard.dev)
- **Issues**: [GitHub Issues](https://github.com/reynard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/reynard/discussions)
- **Discord**: [Reynard Discord](https://discord.gg/reynard)

---

*Built with ❤️ by the Reynard team*
