# reynard-audio

Audio processing and playback components for Reynard applications.

## Features

- **Audio Grid**: Display and manage multiple audio files
- **Audio Player**: Full-featured audio playback with controls
- **Waveform Visualization**: Real-time audio waveform display
- **Audio Analysis**: Comprehensive audio analysis dashboard
- **Metadata Extraction**: Extract audio tags, duration, and technical details
- **Transcription Support**: Audio transcription capabilities

## Installation

```bash
pnpm install reynard-audio
```

## Quick Start

```typescript
import { AudioGrid, AudioPlayer } from "reynard-audio";

// Use in your component
<AudioGrid
  initialFiles={audioFiles}
  onFileSelect={handleFileSelect}
  onAnalyzeAudio={handleAnalysis}
/>
```

## Components

### AudioGrid

Display and manage multiple audio files in a grid layout.

### AudioPlayer

Full-featured audio player with playback controls, waveform visualization, and analysis tools.

### AudioAnalysisDashboard

Comprehensive audio analysis interface with quality metrics, frequency analysis, and loudness measurements.

### AudioWaveformVisualizer

Real-time waveform visualization component for audio files.

## Types

All TypeScript interfaces are exported for type safety:

- `AudioFile` - Audio file representation
- `AudioMetadata` - Audio file metadata
- `AudioAnalysis` - Audio analysis results
- `AudioProcessingOptions` - Processing configuration

## Dependencies

- `reynard-core` - Core Reynard functionality
- `reynard-components` - Base UI components
- `reynard-file-processing` - File processing utilities
