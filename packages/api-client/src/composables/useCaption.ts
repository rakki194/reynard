/**
 * Caption generation composable for Reynard API
 */

import { createSignal } from 'solid-js';
import type { CaptionRequest, CaptionResponse, GeneratorInfo } from '../generated/index.js';

export interface UseCaptionOptions {
  basePath?: string;
}

export function useCaption(options: UseCaptionOptions = {}) {
  const [isGenerating, setIsGenerating] = createSignal(false);

  const generateCaption = async (request: CaptionRequest): Promise<CaptionResponse> => {
    setIsGenerating(true);
    try {
      // Stub implementation
      console.log('Generating caption for:', request);
      return { caption: 'Generated caption', confidence: 0.95 };
    } finally {
      setIsGenerating(false);
    }
  };

  const getGenerators = async (): Promise<GeneratorInfo[]> => {
    // Stub implementation
    return [
      { name: 'florence2', description: 'Microsoft Florence2', supported_formats: ['jpg', 'png'] },
      { name: 'blip2', description: 'BLIP-2', supported_formats: ['jpg', 'png'] }
    ];
  };

  return {
    isGenerating,
    generateCaption,
    getGenerators
  };
}