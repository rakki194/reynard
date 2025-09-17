/**
 * Audio Analysis Dashboard Component
 *
 * Comprehensive audio analysis interface that displays metadata, waveform data,
 * and analysis results. Integrates with the existing audio processing infrastructure
 * to provide detailed insights into audio files.
 *
 * Features:
 * - Audio metadata display
 * - Waveform analysis
 * - Audio statistics
 * - Format information
 * - Quality metrics
 */
import { Component } from "solid-js";
import "./AudioAnalysisDashboard.css";
export interface AudioAnalysisDashboardProps {
    /** Audio file to analyze */
    audioFile: File | string;
    /** Analysis configuration */
    analysisConfig?: {
        /** Show waveform visualizer */
        showWaveform?: boolean;
        /** Show detailed metadata */
        showMetadata?: boolean;
        /** Show audio statistics */
        showStatistics?: boolean;
        /** Show format information */
        showFormatInfo?: boolean;
        /** Show quality metrics */
        showQualityMetrics?: boolean;
    };
    /** Custom CSS class */
    className?: string;
    /** Callback when analysis completes */
    onAnalysisComplete?: (analysis: AudioAnalysis) => void;
    /** Callback when analysis fails */
    onAnalysisError?: (error: Error) => void;
}
export interface AudioAnalysis {
    /** Basic file information */
    fileInfo: {
        name: string;
        size: number;
        type: string;
        lastModified?: Date;
    };
    /** Audio metadata */
    metadata: {
        duration: number;
        sampleRate: number;
        channels: number;
        bitrate: number;
        codec: string;
        format: string;
    };
    /** Audio statistics */
    statistics: {
        averageAmplitude: number;
        peakAmplitude: number;
        rmsAmplitude: number;
        dynamicRange: number;
        frequencyRange: {
            low: number;
            high: number;
        };
    };
    /** Format information */
    formatInfo: {
        container: string;
        codec: string;
        compression: string;
        quality: string;
    };
    /** Quality metrics */
    qualityMetrics: {
        bitDepth: number;
        sampleRate: number;
        bitrate: number;
        compressionRatio: number;
        qualityScore: number;
    };
}
export declare const AudioAnalysisDashboard: Component<AudioAnalysisDashboardProps>;
