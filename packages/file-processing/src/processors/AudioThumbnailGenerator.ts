/**
 * Audio Thumbnail Generator for the Reynard File Processing system.
 *
 * This module provides specialized thumbnail generation for audio files
 * including MP3, WAV, OGG, and other audio formats with waveform visualization.
 */

import { ThumbnailOptions, ProcessingResult } from "../types";

export interface AudioThumbnailGeneratorOptions extends ThumbnailOptions {
  /** Whether to enable Web Workers for background processing */
  useWebWorkers?: boolean;
  /** Maximum thumbnail size in bytes */
  maxThumbnailSize?: number;
  /** Whether to enable progressive loading */
  progressive?: boolean;
  /** Custom background color for audio thumbnails */
  backgroundColor?: string;
  /** Number of waveform bars to display */
  waveformBars?: number;
}

export class AudioThumbnailGenerator {
  private canvas: HTMLCanvasElement | null = null;
  private audioCache = new Map<string, HTMLAudioElement>();

  constructor(
    private options: AudioThumbnailGeneratorOptions = { size: [200, 200] },
  ) {
    this.options = {
      format: "webp",
      quality: 85,
      maintainAspectRatio: true,
      backgroundColor: "#1db954", // Spotify green
      enableAnimation: true,
      animationSlowdown: 2.0,
      useWebWorkers: false,
      maxThumbnailSize: 1024 * 1024, // 1MB
      progressive: true,
      waveformBars: 20,
      ...options,
    };
  }

  /**
   * Generate thumbnail for audio files
   */
  async generateThumbnail(
    file: File | string,
    options?: Partial<ThumbnailOptions>,
  ): Promise<ProcessingResult<Blob>> {
    const startTime = Date.now();
    const mergedOptions = { ...this.options, ...options };

    try {
      const audio = await this.loadAudio(file);
      const canvas = this.getCanvas();
      const ctx = canvas.getContext("2d")!;

      // Set canvas dimensions
      const [targetWidth, targetHeight] = mergedOptions.size;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Clear canvas and set background
      ctx.fillStyle = mergedOptions.backgroundColor || "#1db954";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Draw audio waveform visualization
      await this.drawAudioWaveform(
        ctx,
        targetWidth,
        targetHeight,
        audio,
        mergedOptions,
      );

      // Add small audio icon in corner
      this.drawAudioIcon(ctx, targetWidth, targetHeight, true);

      // Convert to blob
      const blob = await this.canvasToBlob(canvas, mergedOptions);

      return {
        success: true,
        data: blob,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate audio thumbnail",
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Load audio file
   */
  private async loadAudio(file: File | string): Promise<HTMLAudioElement> {
    const key = typeof file === "string" ? file : file.name;

    if (this.audioCache.has(key)) {
      return this.audioCache.get(key)!;
    }

    const audio = new Audio();
    audio.crossOrigin = "anonymous";

    if (typeof file === "string") {
      audio.src = file;
    } else {
      audio.src = URL.createObjectURL(file);
    }

    await new Promise<void>((resolve, reject) => {
      audio.onloadedmetadata = () => resolve();
      audio.onerror = () => reject(new Error("Failed to load audio"));
    });

    this.audioCache.set(key, audio);
    return audio;
  }

  /**
   * Draw audio waveform visualization using real audio data
   */
  private async drawAudioWaveform(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    audio: HTMLAudioElement,
    options: AudioThumbnailGeneratorOptions,
  ): Promise<void> {
    const bars = options.waveformBars || 20;
    const barWidth = width / bars;
    const barSpacing = 2;

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"; // White bars on background

    try {
      // Try to get real audio data using Web Audio API
      const audioData = await this.analyzeAudioData(audio);

      // Check if we got meaningful data
      const hasData = audioData.some((value) => value > 0.01);

      if (hasData) {
        // Draw real audio waveform
        for (let i = 0; i < bars; i++) {
          const dataIndex = Math.floor((i / bars) * audioData.length);
          const amplitude = audioData[dataIndex] || 0;

          const barHeight =
            Math.max(0.1, Math.min(0.9, amplitude)) * height * 0.6;
          const x = i * barWidth + barSpacing;
          const y = (height - barHeight) / 2;

          ctx.fillRect(x, y, barWidth - barSpacing, barHeight);
        }
      } else {
        // No meaningful data, use fallback
        this.drawFallbackWaveform(ctx, width, height, audio, options);
      }
    } catch (error) {
      // Fallback to synthetic waveform if audio analysis fails
      this.drawFallbackWaveform(ctx, width, height, audio, options);
    }
  }

  /**
   * Analyze audio data to extract waveform information
   */
  private async analyzeAudioData(audio: HTMLAudioElement): Promise<number[]> {
    return new Promise((resolve, reject) => {
      try {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const source = audioContext.createMediaElementSource(audio);
        const analyser = audioContext.createAnalyser();

        // Configure analyser for better data capture
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.1;

        source.connect(analyser);
        analyser.connect(audioContext.destination);

        // Get frequency data
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Play audio at different positions to get varied data
        const originalTime = audio.currentTime;
        audio.muted = true;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Sample at multiple time points
              let samples: number[][] = [];
              let sampleCount = 0;
              const maxSamples = 5;

              const sampleInterval = setInterval(() => {
                analyser.getByteFrequencyData(dataArray);
                samples.push(Array.from(dataArray));
                sampleCount++;

                if (sampleCount >= maxSamples) {
                  clearInterval(sampleInterval);
                  audio.pause();
                  audio.currentTime = originalTime;
                  audio.muted = false;

                  // Average the samples for more stable data
                  const averagedData = new Array(bufferLength).fill(0);
                  for (let i = 0; i < bufferLength; i++) {
                    for (let j = 0; j < samples.length; j++) {
                      averagedData[i] += samples[j][i];
                    }
                    averagedData[i] /= samples.length;
                  }

                  // Convert to amplitude values and normalize
                  const amplitudes = averagedData.map((value) =>
                    Math.min(1, value / 128),
                  );

                  audioContext.close();
                  resolve(amplitudes);
                }
              }, 100); // Sample every 100ms
            })
            .catch((error) => {
              audioContext.close();
              reject(error);
            });
        } else {
          reject(new Error("Audio play not supported"));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Fallback waveform when audio analysis fails
   */
  private drawFallbackWaveform(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    audio: HTMLAudioElement,
    options: AudioThumbnailGeneratorOptions,
  ): void {
    const bars = options.waveformBars || 20;
    const barWidth = width / bars;
    const barSpacing = 2;

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"; // White bars

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

      const barHeight =
        Math.max(0.15, Math.min(0.85, combinedAmplitude + noise)) *
        height *
        0.6;
      const x = i * barWidth + barSpacing;
      const y = (height - barHeight) / 2;

      // Ensure we have a visible bar with better positioning
      const finalBarHeight = Math.max(4, barHeight); // Minimum 4px height for visibility
      const finalY = (height - finalBarHeight) / 2;

      // Create gradient for modern look
      const gradient = ctx.createLinearGradient(
        x,
        finalY,
        x,
        finalY + finalBarHeight,
      );
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

  /**
   * Draw audio icon overlay
   */
  private drawAudioIcon(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    smallCorner: boolean = false,
  ): void {
    if (smallCorner) {
      // Draw subtle audio indicator in bottom-right corner
      const size = Math.min(width, height) * 0.12;
      const x = width - size - 8;
      const y = height - size - 8;

      // Draw subtle background circle
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, 2 * Math.PI);
      ctx.fill();

      // Draw audio waves icon
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";

      const centerX = x + size / 2;
      const centerY = y + size / 2;
      const waveRadius = size * 0.15;

      // Draw 3 audio waves
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, waveRadius + i * 2, 0, Math.PI);
        ctx.stroke();
      }
    }
  }

  /**
   * Get canvas for drawing
   */
  private getCanvas(): HTMLCanvasElement {
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
    }
    return this.canvas;
  }

  /**
   * Convert canvas to blob
   */
  private async canvasToBlob(
    canvas: HTMLCanvasElement,
    options: AudioThumbnailGeneratorOptions,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to generate audio thumbnail"));
          }
        },
        `image/${options.format}`,
        (options.quality || 85) / 100,
      );
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Clear cache
    this.audioCache.clear();

    // Clear canvas
    if (this.canvas) {
      this.canvas.width = 0;
      this.canvas.height = 0;
      this.canvas = null;
    }
  }
}
