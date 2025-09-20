# reynard-video

Video processing and playback components for Reynard applications.

## Features

- **Video Grid**: Display and manage multiple video files
- **Video Player**: Full-featured video playback with controls
- **Thumbnail Generation**: Automatic video thumbnail creation
- **Metadata Extraction**: Extract video codec, duration, and technical details
- **Responsive Design**: Mobile-first video components

## Installation

```bash
pnpm install reynard-video
```

## Quick Start

```typescript
import { VideoGrid, VideoPlayer } from "reynard-video";

// Use in your component
<VideoGrid
  initialFiles={videoFiles}
  onFileSelect={handleFileSelect}
  showMetadata={true}
/>
```

## Components

### VideoGrid

Display and manage multiple video files in a grid layout.

### VideoPlayer

Full-featured video player with playback controls and metadata display.

### VideoFileCard

Individual video file card component with thumbnail and metadata.

## Types

All TypeScript interfaces are exported for type safety:

- `VideoFile` - Video file representation
- `VideoMetadata` - Video file metadata (from reynard-file-processing)
- `VideoPlayerState` - Player state management
- `VideoProcessingOptions` - Processing configuration

## Dependencies

- `reynard-core` - Core Reynard functionality
- `reynard-components` - Base UI components
- `reynard-file-processing` - File processing utilities
