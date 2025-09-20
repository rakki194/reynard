# reynard-image

Image processing and display components for Reynard applications.

## Features

- **Image Grid**: Display and manage multiple image files
- **Metadata Extraction**: Extract EXIF data, GPS coordinates, and camera information
- **Thumbnail Generation**: Automatic image thumbnail creation
- **Caption Support**: Integration with caption generation systems
- **Responsive Design**: Mobile-first image components

## Installation

```bash
pnpm install reynard-image
```

## Quick Start

```typescript
import { ImageGrid } from "reynard-image";

// Use in your component
<ImageGrid
  initialFiles={imageFiles}
  onFileSelect={handleFileSelect}
  onGenerateCaption={handleCaptionGeneration}
  showMetadata={true}
/>
```

## Components

### ImageGrid

Display and manage multiple image files in a grid layout with metadata support.

## Types

All TypeScript interfaces are exported for type safety:

- `ImageFile` - Image file representation
- `ImageMetadata` - Image file metadata including EXIF data
- `ImageExifData` - Camera and shooting information
- `ImageProcessingOptions` - Processing configuration

## Dependencies

- `reynard-core` - Core Reynard functionality
- `reynard-components` - Base UI components
- `reynard-file-processing` - File processing utilities
