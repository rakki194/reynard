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

export class AudioAnalyzer {
  private audioCache = new Map<string, HTMLAudioElement>();

  /**
   * Load audio file with caching
   */
  async loadAudio(file: File | string): Promise<HTMLAudioElement> {
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
   * Analyze audio data to extract waveform information
   */
  async analyzeAudioData(audio: HTMLAudioElement): Promise<number[]> {
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
   * Clean up resources
   */
  destroy(): void {
    this.audioCache.clear();
  }
}
