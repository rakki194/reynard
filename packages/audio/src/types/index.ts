/**
 * Audio Types for Reynard Audio System
 * 
 * TypeScript interfaces and types for audio file handling and processing.
 */

/**
 * Audio item interface for general audio file representation
 */
export interface AudioItem {
  id: string;
  name: string;
  path: string;
  size: number;
  duration?: number;
  sampleRate?: number;
  channels?: number;
  bitrate?: number;
  codec?: string;
  waveform?: string;
  metadata?: {
    artist?: string;
    album?: string;
    title?: string;
    genre?: string;
    year?: number;
  };
}

export interface AudioFile {
  /** Unique identifier */
  id: string;
  /** File name */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  type: string;
  /** File URL or blob URL */
  url: string;
  /** Generated waveform thumbnail blob */
  thumbnail?: Blob;
  /** Extracted metadata */
  metadata?: AudioMetadata;
  /** Upload timestamp */
  uploadedAt: Date;
  /** Last modification timestamp */
  modifiedAt?: Date;
  /** Generated transcription (if any) */
  transcription?: string;
  /** Transcription status */
  transcriptionStatus?: "pending" | "processing" | "completed" | "failed";
}

export interface AudioMetadata {
  /** Duration in seconds */
  duration: number;
  /** Audio format */
  format: string;
  /** Sample rate in Hz */
  sampleRate: number;
  /** Number of channels */
  channels: number;
  /** Bit rate in kbps */
  bitRate: number;
  /** Audio codec */
  codec: string;
  /** Whether audio is lossless */
  lossless: boolean;
  /** Audio tags (if available) */
  tags?: AudioTags;
  /** Waveform data */
  waveform?: WaveformData;
}

export interface AudioTags {
  /** Title */
  title?: string;
  /** Artist */
  artist?: string;
  /** Album */
  album?: string;
  /** Year */
  year?: number;
  /** Genre */
  genre?: string;
  /** Track number */
  track?: number;
  /** Disc number */
  disc?: number;
  /** Comment */
  comment?: string;
}

export interface WaveformData {
  /** Peak values for visualization */
  peaks: number[];
  /** RMS values */
  rms: number[];
  /** Frequency spectrum data */
  spectrum?: number[];
  /** Number of samples */
  sampleCount: number;
}

export interface AudioGridState {
  /** Currently selected audio file */
  selectedAudio: AudioFile | null;
  /** Audio files being processed */
  processingAudio: Set<string>;
  /** Upload progress for each audio file */
  uploadProgress: Record<string, number>;
  /** Error messages for failed audio files */
  errors: Record<string, string>;
  /** Currently playing audio */
  currentlyPlaying?: string;
}

export interface AudioProcessingOptions {
  /** Thumbnail generation options */
  thumbnail?: {
    /** Thumbnail size [width, height] */
    size: [number, number];
    /** Output format */
    format: "webp" | "jpeg" | "png";
    /** Quality (0-100) */
    quality: number;
    /** Waveform style */
    waveformStyle: "bars" | "line" | "filled";
    /** Number of bars for bar style */
    barCount: number;
  };
  /** Metadata extraction options */
  metadata?: {
    /** Extract audio tags */
    extractTags: boolean;
    /** Extract waveform data */
    extractWaveform: boolean;
    /** Extract frequency spectrum */
    extractSpectrum: boolean;
  };
  /** Transcription options */
  transcription?: {
    /** Auto-transcribe audio */
    autoTranscribe: boolean;
    /** Transcription model to use */
    model: string;
    /** Language for transcription */
    language: string;
  };
}

export interface AudioGridProps {
  /** Initial audio files */
  initialFiles?: AudioFile[];
  /** Callback when files are selected */
  onFileSelect?: (file: AudioFile) => void;
  /** Callback when files are removed */
  onFileRemove?: (fileId: string) => void;
  /** Callback when audio analysis is requested */
  onAnalyzeAudio?: (file: AudioFile) => void;
  /** Maximum number of files to display */
  maxFiles?: number;
  /** Whether to show file metadata */
  showMetadata?: boolean;
  /** Whether analysis is in progress */
  isAnalyzing?: boolean;
  /** Custom CSS class */
  class?: string;
}

export interface AudioFileCardProps {
  /** Audio file to display */
  file: AudioFile;
  /** Whether this file is selected */
  isSelected: boolean;
  /** Selection callback */
  onSelect: () => void;
  /** Removal callback */
  onRemove: () => void;
  /** Analysis callback */
  onAnalyze: () => void;
  /** Whether to show metadata */
  showMetadata?: boolean;
  /** Whether analysis is in progress */
  isAnalyzing?: boolean;
}

export interface AudioPlayerModalProps {
  /** Audio file to display */
  file: AudioFile;
  /** Close callback */
  onClose: () => void;
  /** Analysis callback */
  onAnalyze: () => void;
  /** Whether analysis is in progress */
  isAnalyzing?: boolean;
}

export interface AudioAnalysis {
  /** Basic file information */
  fileInfo: {
    name: string;
    size: number;
    duration: number;
    format: string;
  };
  /** Audio quality metrics */
  quality: {
    bitRate: number;
    sampleRate: number;
    channels: number;
    dynamicRange: number;
    signalToNoiseRatio: number;
  };
  /** Frequency analysis */
  frequency: {
    dominantFrequencies: number[];
    frequencyResponse: number[];
    spectralCentroid: number;
    spectralRolloff: number;
  };
  /** Loudness analysis */
  loudness: {
    peakLevel: number;
    rmsLevel: number;
    lufs: number;
    truePeak: number;
  };
  /** Analysis timestamp */
  analyzedAt: Date;
}
