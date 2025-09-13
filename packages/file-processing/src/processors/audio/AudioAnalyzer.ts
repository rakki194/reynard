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
        const { audioContext, analyser, dataArray } = this.setupAudioAnalysis(audio);
        const originalTime = audio.currentTime;
        
        this.sampleAudioData(audio, analyser, dataArray, originalTime)
          .then((samples) => {
            const amplitudes = this.processAudioSamples(samples);
            audioContext.close();
            resolve(amplitudes);
          })
          .catch((error) => {
            audioContext.close();
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Setup audio context and analyser for analysis
   */
  private setupAudioAnalysis(audio: HTMLAudioElement) {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audio);
    const analyser = audioContext.createAnalyser();

    // Configure analyser for better data capture
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.1;

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    return { audioContext, analyser, dataArray };
  }

  /**
   * Sample audio data at multiple time points
   */
  private async sampleAudioData(
    audio: HTMLAudioElement,
    analyser: AnalyserNode,
    dataArray: Uint8Array,
    originalTime: number
  ): Promise<number[][]> {
    return new Promise((resolve, reject) => {
      audio.muted = true;
      const playPromise = audio.play();
      
      if (playPromise === undefined) {
        reject(new Error("Audio play not supported"));
        return;
      }

      playPromise
        .then(() => {
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
              resolve(samples);
            }
          }, 100); // Sample every 100ms
        })
        .catch(reject);
    });
  }

  /**
   * Process and normalize audio samples
   */
  private processAudioSamples(samples: number[][]): number[] {
    if (samples.length === 0) return [];
    
    const bufferLength = samples[0].length;
    const averagedData = new Array(bufferLength).fill(0);
    
    // Average the samples for more stable data
    for (let i = 0; i < bufferLength; i++) {
      for (let j = 0; j < samples.length; j++) {
        averagedData[i] += samples[j][i];
      }
      averagedData[i] /= samples.length;
    }

    // Convert to amplitude values and normalize
    return averagedData.map((value) => Math.min(1, value / 128));
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.audioCache.clear();
  }
}
