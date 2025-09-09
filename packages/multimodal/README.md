# reynard-multimodal

Multimodal media gallery and management components for Reynard applications.

## Features

- **Unified Gallery**: Display audio, video, image, and text files in a single interface
- **Multiple Views**: Grid, list, and timeline view modes
- **File Management**: Upload, organize, and manage different media types
- **Metadata Display**: Show file information and processing status
- **Responsive Design**: Mobile-first multimodal components

## Installation

```bash
pnpm install reynard-multimodal
```

## Quick Start

```typescript
import { MultiModalGallery } from "reynard-multimodal";

// Use in your component
<MultiModalGallery
  files={allMediaFiles}
  view="grid"
  onFileSelect={handleFileSelect}
  onViewChange={handleViewChange}
/>
```

## Components

### MultiModalGallery

Main gallery component that orchestrates all media types.

### MultiModalGrid

Grid view for displaying files in a responsive grid layout.

### MultiModalList

List view for displaying files in a compact list format.

### MultiModalTimeline

Timeline view for displaying files chronologically.

### MultiModalFileCard

Individual file card component that adapts to different media types.

## Types

All TypeScript interfaces are exported for type safety:

- `MultiModalFile` - Unified file representation
- `MediaType` - Supported media types
- `GalleryView` - Available view modes
- `FileCounts` - File count statistics

## Dependencies

- `reynard-core` - Core Reynard functionality
- `reynard-components` - Base UI components
- `reynard-audio` - Audio components
- `reynard-video` - Video components
- `reynard-image` - Image components
- `reynard-file-processing` - File processing utilities
