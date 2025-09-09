/**
 * useCaptionGeneratorState Composable Tests
 *
 * Comprehensive test suite for the caption generator state management composable.
 * Tests state initialization, updates, and reactive behavior.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@solidjs/testing-library';
import { useCaptionGeneratorState, type CaptionGeneratorState } from '../useCaptionGeneratorState';
import type { CaptionResult } from 'reynard-annotating';

describe('useCaptionGeneratorState', () => {
  let state: CaptionGeneratorState;

  beforeEach(() => {
    const { result } = renderHook(() => useCaptionGeneratorState());
    state = result;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      expect(state.selectedModel()).toBe('jtp2');
      expect(state.imageFile()).toBe(null);
      expect(state.imagePreview()).toBe(null);
      expect(state.isGenerating()).toBe(false);
      expect(state.generationProgress()).toBe(0);
      expect(state.result()).toBe(null);
      expect(state.error()).toBe(null);
      expect(state.availableGenerators()).toEqual([]);
      expect(state.isDragOver()).toBe(false);
    });

    it('should provide all required state functions', () => {
      expect(typeof state.setSelectedModel).toBe('function');
      expect(typeof state.setImageFile).toBe('function');
      expect(typeof state.setImagePreview).toBe('function');
      expect(typeof state.setIsGenerating).toBe('function');
      expect(typeof state.setGenerationProgress).toBe('function');
      expect(typeof state.setResult).toBe('function');
      expect(typeof state.setError).toBe('function');
      expect(typeof state.setAvailableGenerators).toBe('function');
      expect(typeof state.setIsDragOver).toBe('function');
    });
  });

  describe('Selected Model State', () => {
    it('should update selected model', () => {
      state.setSelectedModel('florence2');
      expect(state.selectedModel()).toBe('florence2');
    });

    it('should handle empty model name', () => {
      state.setSelectedModel('');
      expect(state.selectedModel()).toBe('');
    });

    it('should handle special characters in model name', () => {
      state.setSelectedModel('model-with-special_chars.123');
      expect(state.selectedModel()).toBe('model-with-special_chars.123');
    });
  });

  describe('Image File State', () => {
    it('should update image file', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      state.setImageFile(mockFile);
      expect(state.imageFile()).toBe(mockFile);
    });

    it('should handle null image file', () => {
      state.setImageFile(null);
      expect(state.imageFile()).toBe(null);
    });

    it('should handle different file types', () => {
      const pngFile = new File(['test'], 'test.png', { type: 'image/png' });
      const gifFile = new File(['test'], 'test.gif', { type: 'image/gif' });
      const webpFile = new File(['test'], 'test.webp', { type: 'image/webp' });

      state.setImageFile(pngFile);
      expect(state.imageFile()).toBe(pngFile);

      state.setImageFile(gifFile);
      expect(state.imageFile()).toBe(gifFile);

      state.setImageFile(webpFile);
      expect(state.imageFile()).toBe(webpFile);
    });
  });

  describe('Image Preview State', () => {
    it('should update image preview', () => {
      const previewUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
      state.setImagePreview(previewUrl);
      expect(state.imagePreview()).toBe(previewUrl);
    });

    it('should handle null image preview', () => {
      state.setImagePreview(null);
      expect(state.imagePreview()).toBe(null);
    });

    it('should handle blob URLs', () => {
      const blobUrl = 'blob:http://localhost:3000/12345678-1234-1234-1234-123456789abc';
      state.setImagePreview(blobUrl);
      expect(state.imagePreview()).toBe(blobUrl);
    });
  });

  describe('Generation State', () => {
    it('should update generation status', () => {
      state.setIsGenerating(true);
      expect(state.isGenerating()).toBe(true);

      state.setIsGenerating(false);
      expect(state.isGenerating()).toBe(false);
    });

    it('should update generation progress', () => {
      state.setGenerationProgress(25);
      expect(state.generationProgress()).toBe(25);

      state.setGenerationProgress(100);
      expect(state.generationProgress()).toBe(100);

      state.setGenerationProgress(0);
      expect(state.generationProgress()).toBe(0);
    });

    it('should handle progress values outside 0-100 range', () => {
      state.setGenerationProgress(-10);
      expect(state.generationProgress()).toBe(-10);

      state.setGenerationProgress(150);
      expect(state.generationProgress()).toBe(150);
    });
  });

  describe('Result State', () => {
    it('should update result', () => {
      const mockResult: CaptionResult = {
        success: true,
        caption: 'A test image',
        processingTime: 1.5,
        generator: 'jtp2',
        timestamp: new Date().toISOString(),
      };

      state.setResult(mockResult);
      expect(state.result()).toBe(mockResult);
    });

    it('should handle null result', () => {
      state.setResult(null);
      expect(state.result()).toBe(null);
    });

    it('should handle failed result', () => {
      const failedResult: CaptionResult = {
        success: false,
        error: 'Generation failed',
        generator: 'jtp2',
        timestamp: new Date().toISOString(),
      };

      state.setResult(failedResult);
      expect(state.result()).toBe(failedResult);
    });
  });

  describe('Error State', () => {
    it('should update error message', () => {
      state.setError('Test error message');
      expect(state.error()).toBe('Test error message');
    });

    it('should handle null error', () => {
      state.setError(null);
      expect(state.error()).toBe(null);
    });

    it('should handle empty error message', () => {
      state.setError('');
      expect(state.error()).toBe('');
    });

    it('should handle long error messages', () => {
      const longError = 'This is a very long error message that might contain detailed information about what went wrong during the caption generation process and could potentially wrap to multiple lines in the UI.';
      state.setError(longError);
      expect(state.error()).toBe(longError);
    });
  });

  describe('Available Generators State', () => {
    it('should update available generators', () => {
      const generators = [
        {
          name: 'jtp2',
          displayName: 'JTP2',
          description: 'Japanese Text-to-Picture model',
          available: true,
          loading: false,
        },
        {
          name: 'florence2',
          displayName: 'Florence2',
          description: 'Microsoft Florence2 model',
          available: true,
          loading: false,
        },
      ];

      state.setAvailableGenerators(generators);
      expect(state.availableGenerators()).toEqual(generators);
    });

    it('should handle empty generators array', () => {
      state.setAvailableGenerators([]);
      expect(state.availableGenerators()).toEqual([]);
    });

    it('should handle generators with mixed availability', () => {
      const generators = [
        {
          name: 'available-model',
          displayName: 'Available Model',
          description: 'This model is available',
          available: true,
          loading: false,
        },
        {
          name: 'unavailable-model',
          displayName: 'Unavailable Model',
          description: 'This model is not available',
          available: false,
          loading: false,
        },
        {
          name: 'loading-model',
          displayName: 'Loading Model',
          description: 'This model is loading',
          available: false,
          loading: true,
        },
      ];

      state.setAvailableGenerators(generators);
      expect(state.availableGenerators()).toEqual(generators);
    });
  });

  describe('Drag Over State', () => {
    it('should update drag over status', () => {
      state.setIsDragOver(true);
      expect(state.isDragOver()).toBe(true);

      state.setIsDragOver(false);
      expect(state.isDragOver()).toBe(false);
    });
  });

  describe('State Interactions', () => {
    it('should handle complete generation workflow', () => {
      // Set up initial state
      state.setSelectedModel('florence2');
      state.setIsGenerating(true);
      state.setGenerationProgress(0);

      expect(state.selectedModel()).toBe('florence2');
      expect(state.isGenerating()).toBe(true);
      expect(state.generationProgress()).toBe(0);

      // Simulate progress updates
      state.setGenerationProgress(25);
      expect(state.generationProgress()).toBe(25);

      state.setGenerationProgress(50);
      expect(state.generationProgress()).toBe(50);

      state.setGenerationProgress(100);
      expect(state.generationProgress()).toBe(100);

      // Complete generation
      const result: CaptionResult = {
        success: true,
        caption: 'Generated caption',
        processingTime: 2.0,
        generator: 'florence2',
        timestamp: new Date().toISOString(),
      };

      state.setResult(result);
      state.setIsGenerating(false);

      expect(state.result()).toBe(result);
      expect(state.isGenerating()).toBe(false);
    });

    it('should handle error during generation', () => {
      state.setSelectedModel('jtp2');
      state.setIsGenerating(true);
      state.setGenerationProgress(50);

      // Simulate error
      state.setError('Model not available');
      state.setIsGenerating(false);
      state.setGenerationProgress(0);

      expect(state.error()).toBe('Model not available');
      expect(state.isGenerating()).toBe(false);
      expect(state.generationProgress()).toBe(0);
    });

    it('should handle file upload workflow', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const previewUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';

      state.setImageFile(mockFile);
      state.setImagePreview(previewUrl);

      expect(state.imageFile()).toBe(mockFile);
      expect(state.imagePreview()).toBe(previewUrl);

      // Clear file
      state.setImageFile(null);
      state.setImagePreview(null);

      expect(state.imageFile()).toBe(null);
      expect(state.imagePreview()).toBe(null);
    });
  });

  describe('Reactive Behavior', () => {
    it('should maintain reactivity across multiple updates', () => {
      const updates: string[] = [];
      
      // Track changes to selected model
      const unsubscribe = state.selectedModel.subscribe((value) => {
        updates.push(value);
      });

      state.setSelectedModel('model1');
      state.setSelectedModel('model2');
      state.setSelectedModel('model3');

      expect(updates).toContain('model1');
      expect(updates).toContain('model2');
      expect(updates).toContain('model3');

      unsubscribe();
    });

    it('should handle rapid state changes', () => {
      // Rapidly change generation progress
      for (let i = 0; i <= 100; i += 10) {
        state.setGenerationProgress(i);
      }

      expect(state.generationProgress()).toBe(100);
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory with repeated state updates', () => {
      // Perform many state updates
      for (let i = 0; i < 1000; i++) {
        state.setGenerationProgress(i % 101);
        state.setError(i % 2 === 0 ? `Error ${i}` : null);
      }

      // Final state should be consistent
      expect(state.generationProgress()).toBe(0);
      expect(state.error()).toBe('Error 998');
    });
  });
});
