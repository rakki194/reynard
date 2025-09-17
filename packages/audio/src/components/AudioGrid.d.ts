/**
 * Audio Grid Component for Reynard Caption System
 *
 * Leverages existing AudioPlayer, AudioWaveformVisualizer, and AudioThumbnailGenerator
 * infrastructure for comprehensive audio file handling and display.
 */
import { Component } from "solid-js";
import { AudioFile } from "./types/AudioTypes";
export interface AudioGridProps {
    /** Initial audio files to display */
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
export declare const AudioGrid: Component<AudioGridProps>;
