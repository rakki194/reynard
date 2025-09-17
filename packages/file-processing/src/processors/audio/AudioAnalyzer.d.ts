/**
 * Audio Analysis utilities for extracting waveform data from audio files.
 *
 * This module provides Web Audio API integration for analyzing audio content
 * and extracting frequency/amplitude data for visualization.
 */
export interface AudioAnalysisResult {
    amplitudes: number[];
    duration: number;
    sampleRate: number;
}
export declare class AudioAnalyzer {
    private audioCache;
    /**
     * Load audio file with caching
     */
    loadAudio(file: File | string): Promise<HTMLAudioElement>;
    /**
     * Analyze audio data to extract waveform information
     */
    analyzeAudioData(audio: HTMLAudioElement): Promise<number[]>;
    /**
     * Setup audio context and analyser for analysis
     */
    private setupAudioAnalysis;
    /**
     * Sample audio data at multiple time points
     */
    private sampleAudioData;
    /**
     * Process and normalize audio samples
     */
    private processAudioSamples;
    /**
     * Clean up resources
     */
    destroy(): void;
}
