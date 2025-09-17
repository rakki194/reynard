/**
 * Audio Waveform Visualizer Component
 *
 * Interactive waveform visualization for audio files with playback controls,
 * zoom functionality, and real-time progress tracking. Built on top of
 * the existing AudioThumbnailGenerator infrastructure.
 *
 * Features:
 * - Real-time waveform rendering
 * - Interactive playback controls
 * - Zoom and pan functionality
 * - Progress tracking and seeking
 * - Customizable waveform appearance
 */
import { Component } from "solid-js";
import "./AudioWaveformVisualizer.css";
export interface AudioWaveformVisualizerProps {
    /** Audio file or URL */
    audioSrc: File | string;
    /** Waveform configuration */
    waveformConfig?: {
        /** Number of waveform bars */
        bars?: number;
        /** Waveform color */
        color?: string;
        /** Background color */
        backgroundColor?: string;
        /** Bar width */
        barWidth?: number;
        /** Bar spacing */
        barSpacing?: number;
        /** Waveform height */
        height?: number;
    };
    /** Playback configuration */
    playbackConfig?: {
        /** Auto-play on load */
        autoPlay?: boolean;
        /** Loop playback */
        loop?: boolean;
        /** Initial volume (0-1) */
        volume?: number;
        /** Show playback controls */
        showControls?: boolean;
    };
    /** Interaction configuration */
    interactionConfig?: {
        /** Enable zoom */
        enableZoom?: boolean;
        /** Enable pan */
        enablePan?: boolean;
        /** Enable seeking by clicking */
        enableSeeking?: boolean;
        /** Show progress indicator */
        showProgress?: boolean;
    };
    /** Custom CSS class */
    className?: string;
    /** Callback when playback starts */
    onPlay?: () => void;
    /** Callback when playback pauses */
    onPause?: () => void;
    /** Callback when playback ends */
    onEnded?: () => void;
    /** Callback when time updates */
    onTimeUpdate?: (currentTime: number, duration: number) => void;
}
export interface WaveformData {
    /** Array of amplitude values */
    amplitudes: number[];
    /** Duration in seconds */
    duration: number;
    /** Sample rate */
    sampleRate: number;
}
export declare const AudioWaveformVisualizer: Component<AudioWaveformVisualizerProps>;
