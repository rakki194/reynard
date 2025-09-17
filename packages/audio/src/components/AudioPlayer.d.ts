/**
 * Audio Player Component
 *
 * Comprehensive audio player with advanced controls, playlist support,
 * and integration with the AudioWaveformVisualizer. Built on top of
 * the existing audio processing infrastructure.
 *
 * Features:
 * - Advanced playback controls
 * - Playlist management
 * - Audio visualization
 * - Keyboard shortcuts
 * - Customizable interface
 */
import { Component } from "solid-js";
import "./AudioPlayer.css";
export interface AudioPlayerProps {
    /** Audio files or URLs */
    audioFiles: (File | string)[];
    /** Initial track index */
    initialTrack?: number;
    /** Player configuration */
    playerConfig?: {
        /** Auto-play next track */
        autoPlayNext?: boolean;
        /** Loop playlist */
        loopPlaylist?: boolean;
        /** Loop current track */
        loopTrack?: boolean;
        /** Shuffle mode */
        shuffle?: boolean;
        /** Initial volume (0-1) */
        volume?: number;
        /** Show waveform visualizer */
        showWaveform?: boolean;
        /** Show playlist */
        showPlaylist?: boolean;
    };
    /** Custom CSS class */
    className?: string;
    /** Callback when track changes */
    onTrackChange?: (trackIndex: number, track: File | string) => void;
    /** Callback when playback state changes */
    onPlaybackStateChange?: (isPlaying: boolean) => void;
    /** Callback when playlist ends */
    onPlaylistEnd?: () => void;
}
export interface TrackInfo {
    /** Track index */
    index: number;
    /** Track name */
    name: string;
    /** Track duration */
    duration: number;
    /** Track file or URL */
    file: File | string;
    /** Whether track is currently playing */
    isPlaying: boolean;
    /** Whether track is currently selected */
    isSelected: boolean;
}
export declare const AudioPlayer: Component<AudioPlayerProps>;
