/**
 * Text-to-Speech (TTS) Types
 * 
 * Defines types for text-to-speech operations, voice management,
 * and audio generation within the Reynard framework.
 */

export interface TTSOptions {
  voice?: string
  speed?: number
  pitch?: number
  volume?: number
  format?: 'wav' | 'mp3' | 'ogg'
  quality?: 'low' | 'medium' | 'high'
}

export interface Voice {
  id: string
  name: string
  language: string
  gender: 'male' | 'female' | 'neutral'
  age: 'child' | 'young' | 'adult' | 'elderly'
  description: string
  previewUrl?: string
}

export interface VoiceInfo {
  voice: Voice
  isAvailable: boolean
  sampleRate: number
  bitRate: number
  channels: number
}
