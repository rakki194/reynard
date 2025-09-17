/**
 * Waveform rendering utilities for audio thumbnails.
 *
 * This module handles drawing audio waveforms on canvas, including both
 * real audio data visualization and fallback synthetic patterns.
 */
export class WaveformRenderer {
    /**
     * Draw audio waveform visualization using real audio data
     */
    async drawAudioWaveform(ctx, width, height, audioData, audio, options) {
        const bars = options.waveformBars || 20;
        const barWidth = width / bars;
        const barSpacing = 2;
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)"; // White bars on background
        try {
            // Check if we got meaningful data
            const hasData = audioData && audioData.some((value) => value > 0.01);
            if (hasData) {
                // Draw real audio waveform
                this.drawRealWaveform(ctx, width, height, audioData, bars, barWidth, barSpacing);
            }
            else {
                // No meaningful data, use fallback
                this.drawFallbackWaveform(ctx, width, height, audio, bars, barWidth, barSpacing);
            }
        }
        catch (error) {
            // Fallback to synthetic waveform if audio analysis fails
            this.drawFallbackWaveform(ctx, width, height, audio, bars, barWidth, barSpacing);
        }
    }
    /**
     * Draw real audio waveform from analyzed data
     */
    drawRealWaveform(ctx, width, height, audioData, bars, barWidth, barSpacing) {
        for (let i = 0; i < bars; i++) {
            const dataIndex = Math.floor((i / bars) * audioData.length);
            const amplitude = audioData[dataIndex] || 0;
            const barHeight = Math.max(0.1, Math.min(0.9, amplitude)) * height * 0.6;
            const x = i * barWidth + barSpacing;
            const y = (height - barHeight) / 2;
            ctx.fillRect(x, y, barWidth - barSpacing, barHeight);
        }
    }
    /**
     * Fallback waveform when audio analysis fails
     */
    drawFallbackWaveform(ctx, width, height, audio, bars, barWidth, barSpacing) {
        const duration = audio.duration || 0;
        const baseAmplitude = Math.min(1, Math.max(0.3, duration / 5));
        // Create a more interesting pattern based on duration
        for (let i = 0; i < bars; i++) {
            const position = i / bars;
            // Create multiple frequency components for more realistic look
            const freq1 = 1 + position * 2;
            const freq2 = 3 + position * 4;
            const freq3 = 0.5 + position * 1.5;
            const amp1 = Math.sin(position * Math.PI * 2 * freq1) * 0.4;
            const amp2 = Math.sin(position * Math.PI * 2 * freq2) * 0.3;
            const amp3 = Math.sin(position * Math.PI * 2 * freq3) * 0.3;
            const combinedAmplitude = baseAmplitude * (0.2 + amp1 + amp2 + amp3);
            const noise = (Math.random() - 0.5) * 0.2;
            const barHeight = Math.max(0.15, Math.min(0.85, combinedAmplitude + noise)) *
                height *
                0.6;
            const x = i * barWidth + barSpacing;
            // Ensure we have a visible bar with better positioning
            const finalBarHeight = Math.max(4, barHeight); // Minimum 4px height for visibility
            const finalY = (height - finalBarHeight) / 2;
            // Create gradient for modern look
            const gradient = ctx.createLinearGradient(x, finalY, x, finalY + finalBarHeight);
            gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
            gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.7)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0.5)");
            ctx.fillStyle = gradient;
            // Draw rounded rectangle for modern look
            const radius = 2;
            ctx.beginPath();
            ctx.roundRect(x, finalY, barWidth - barSpacing, finalBarHeight, radius);
            ctx.fill();
        }
    }
}
