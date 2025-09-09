/**
 * BackendAnnotationService Generation Tests
 *
 * Tests for caption generation functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BackendAnnotationService, type BackendAnnotationServiceConfig } from '../BackendAnnotationService';
import type { CaptionTask, CaptionResult } from '../../types';

// Mock all dependencies
vi.mock('../../clients', () => ({
  createCaptionApiClient: vi.fn(() => ({})),
}));

vi.mock('../EventManager', () => ({
  SimpleEventManager: vi.fn(() => ({})),
}));

vi.mock('../BatchProcessor', () => ({
  BatchProcessor: vi.fn(() => ({})),
}));

vi.mock('../SingleCaptionProcessor', () => ({
  SingleCaptionProcessor: vi.fn(() => ({})),
}));

vi.mock('../GeneratorManager', () => ({
  GeneratorManager: vi.fn(() => ({})),
}));

vi.mock('../HealthStatsManager', () => ({
  HealthStatsManager: vi.fn(() => ({})),
}));

describe('BackendAnnotationService Generation', () => {
  let service: BackendAnnotationService;
  let config: BackendAnnotationServiceConfig;

  beforeEach(() => {
    config = {
      baseUrl: 'http://localhost:8000',
      timeout: 30000,
      retries: 3,
      apiKey: 'test-api-key',
    };

    service = new BackendAnnotationService(config);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should generate single caption', async () => {
    const mockResult: CaptionResult = {
      success: true,
      caption: 'A test image',
      processingTime: 1.5,
      generator: 'jtp2',
      timestamp: new Date().toISOString(),
    };

    const mockTask: CaptionTask = {
      id: 'test-task-1',
      imagePath: '/test/image.jpg',
      generator: 'jtp2',
      config: {},
      timestamp: new Date().toISOString(),
    };

    const { SingleCaptionProcessor } = require('../SingleCaptionProcessor');
    const mockSingleProcessor = new SingleCaptionProcessor();
    mockSingleProcessor.processSingle.mockResolvedValue(mockResult);

    (service as any).singleProcessor = mockSingleProcessor;

    const result = await service.generateCaption(mockTask);

    expect(result).toEqual(mockResult);
    expect(mockSingleProcessor.processSingle).toHaveBeenCalledWith(mockTask);
  });

  it('should handle single caption generation error', async () => {
    const mockTask: CaptionTask = {
      id: 'test-task-1',
      imagePath: '/test/image.jpg',
      generator: 'jtp2',
      config: {},
      timestamp: new Date().toISOString(),
    };

    const mockError = new Error('Generation failed');

    const { SingleCaptionProcessor } = require('../SingleCaptionProcessor');
    const mockSingleProcessor = new SingleCaptionProcessor();
    mockSingleProcessor.processSingle.mockRejectedValue(mockError);

    (service as any).singleProcessor = mockSingleProcessor;

    await expect(service.generateCaption(mockTask)).rejects.toThrow('Generation failed');
  });

  it('should handle network errors gracefully', async () => {
    const mockTask: CaptionTask = {
      id: 'test-task-1',
      imagePath: '/test/image.jpg',
      generator: 'jtp2',
      config: {},
      timestamp: new Date().toISOString(),
    };

    const networkError = new Error('Network error');

    const { SingleCaptionProcessor } = require('../SingleCaptionProcessor');
    const mockSingleProcessor = new SingleCaptionProcessor();
    mockSingleProcessor.processSingle.mockRejectedValue(networkError);

    (service as any).singleProcessor = mockSingleProcessor;

    await expect(service.generateCaption(mockTask)).rejects.toThrow('Network error');
  });
});
