/**
 * Audio Components Barrel Export
 * 
 * Provides clean API boundaries for all audio-related components.
 */

// Core Audio Components
export { AudioGrid } from "./AudioGrid";
export { AudioPlayer } from "./AudioPlayer";
export { AudioAnalysisDashboard } from "./AudioAnalysisDashboard";
export { AudioWaveformVisualizer } from "./AudioWaveformVisualizer";
export { AudioWaveformComponents } from "./AudioWaveformComponents";

// Re-export types for convenience
export type {
  AudioFile,
  AudioMetadata,
  AudioTags,
  WaveformData,
  AudioGridState,
  AudioProcessingOptions,
  AudioGridProps,
  AudioFileCardProps,
  AudioPlayerModalProps,
  AudioAnalysis
} from "../types";
