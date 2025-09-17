/**
 * Video Types for Reynard Video System
 *
 * Type definitions for video processing components,
 * leveraging existing VideoMetadata from reynard-file-processing.
 */
/**
 * Video item interface for general video file representation
 */
export interface VideoItem {
    id: string;
    name: string;
    path: string;
    size: number;
    duration?: number;
    thumbnail?: string;
    metadata?: {
        width?: number;
        height?: number;
        fps?: number;
        codec?: string;
    };
}
import { VideoMetadata } from "reynard-file-processing";
export interface VideoFile {
    /** Unique identifier for the video file */
    id: string;
    /** Original filename */
    name: string;
    /** File size in bytes */
    size: number;
    /** MIME type */
    type: string;
    /** URL for video playback */
    url: string;
    /** Generated thumbnail blob */
    thumbnail: Blob;
    /** Extracted video metadata */
    metadata: VideoMetadata;
    /** Upload timestamp */
    uploadedAt: Date;
}
export interface VideoPlayerState {
    /** Whether video is currently playing */
    isPlaying: boolean;
    /** Current playback time in seconds */
    currentTime: number;
    /** Total duration in seconds */
    duration: number;
    /** Playback volume (0-1) */
    volume: number;
    /** Whether video is muted */
    muted: boolean;
    /** Playback speed multiplier */
    playbackRate: number;
}
export interface VideoProcessingOptions {
    /** Thumbnail generation options */
    thumbnail?: {
        /** Capture time in seconds */
        captureTime?: number;
        /** Thumbnail dimensions */
        size?: [number, number];
        /** Output format */
        format?: "webp" | "png" | "jpg";
        /** Quality (0-100) */
        quality?: number;
    };
    /** Metadata extraction options */
    metadata?: {
        /** Whether to extract detailed codec info */
        extractCodecInfo?: boolean;
        /** Whether to extract frame data */
        extractFrameData?: boolean;
        /** Whether to extract audio track info */
        extractAudioInfo?: boolean;
    };
}
export interface VideoGridState {
    /** Currently selected video file */
    selectedFile: VideoFile | null;
    /** List of all video files */
    files: VideoFile[];
    /** Whether processing is in progress */
    isLoading: boolean;
    /** Current error message */
    error: string | null;
    /** Upload progress for batch operations */
    uploadProgress: Record<string, number>;
}
export interface VideoGridProps {
    /** Initial video files to display */
    initialFiles?: VideoFile[];
    /** Callback when files are selected */
    onFileSelect?: (file: VideoFile) => void;
    /** Callback when files are removed */
    onFileRemove?: (fileId: string) => void;
    /** Maximum number of files to display */
    maxFiles?: number;
    /** Whether to show file metadata */
    showMetadata?: boolean;
    /** Custom CSS class */
    class?: string;
}
export interface VideoGridContentProps {
    class?: string;
    videoFiles: () => VideoFile[];
    selectedFile: () => VideoFile | null;
    isLoading: () => boolean;
    error: () => string | null;
    showMetadata?: boolean;
    onFileUpload: (event: Event) => void;
    onFileSelect: (file: VideoFile) => void;
    onFileRemove: (fileId: string) => void;
    onClosePlayer: () => void;
}
export interface VideoFileCardProps {
    file: VideoFile;
    isSelected: boolean;
    onSelect: () => void;
    onRemove: () => void;
    showMetadata?: boolean;
}
export interface VideoPlayerProps {
    file: VideoFile;
    onClose: () => void;
}
