/**
 * Waveform rendering utilities for audio thumbnails.
 *
 * This module handles drawing audio waveforms on canvas, including both
 * real audio data visualization and fallback synthetic patterns.
 */
export interface WaveformOptions {
    waveformBars?: number;
    backgroundColor?: string;
}
export declare class WaveformRenderer {
    /**
     * Draw audio waveform visualization using real audio data
     */
    drawAudioWaveform(ctx: CanvasRenderingContext2D, width: number, height: number, audioData: number[] | null, audio: HTMLAudioElement, options: WaveformOptions): Promise<void>;
    /**
     * Draw real audio waveform from analyzed data
     */
    private drawRealWaveform;
    /**
     * Fallback waveform when audio analysis fails
     */
    private drawFallbackWaveform;
}
