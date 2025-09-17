/**
 * Audio Waveform Sub-components
 *
 * Sub-components for the Audio Waveform Visualizer to keep the main component
 * under the 140-line limit.
 */
import { Component } from "solid-js";
import type { WaveformData } from "./AudioWaveformVisualizer";
export declare const LoadingState: Component;
export declare const ErrorState: Component<{
    error: string;
}>;
export declare const WaveformCanvas: Component<{
    waveformData: WaveformData | null;
    waveformConfig: () => any;
    interactionConfig: () => any;
    currentTime: () => number;
    duration: () => number;
    onWaveformClick: (event: MouseEvent) => void;
    canvasRef: HTMLCanvasElement | undefined;
}>;
export declare const PlaybackControls: Component<{
    playbackConfig: () => any;
    isPlaying: () => boolean;
    currentTime: () => number;
    duration: () => number;
    volume: number;
    onTogglePlayback: () => void;
    onVolumeChange: (volume: number) => void;
    waveformData: WaveformData | null;
}>;
