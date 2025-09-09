/**
 * BackendAnnotationService Initialization Tests
 *
 * Tests for service initialization and component setup.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BackendAnnotationService, type BackendAnnotationServiceConfig } from '../BackendAnnotationService';

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

describe('BackendAnnotationService Initialization', () => {
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

  it('should initialize with valid config', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(BackendAnnotationService);
  });

  it('should initialize with minimal config', () => {
    const minimalConfig = { baseUrl: 'http://localhost:8000' };
    const minimalService = new BackendAnnotationService(minimalConfig);
    
    expect(minimalService).toBeDefined();
  });

  it('should initialize all required components', () => {
    const { createCaptionApiClient } = require('../../clients');
    const { SimpleEventManager } = require('../EventManager');
    const { BatchProcessor } = require('../BatchProcessor');
    const { SingleCaptionProcessor } = require('../SingleCaptionProcessor');
    const { GeneratorManager } = require('../GeneratorManager');
    const { HealthStatsManager } = require('../HealthStatsManager');

    expect(createCaptionApiClient).toHaveBeenCalledWith(config);
    expect(SimpleEventManager).toHaveBeenCalled();
    expect(BatchProcessor).toHaveBeenCalled();
    expect(SingleCaptionProcessor).toHaveBeenCalled();
    expect(GeneratorManager).toHaveBeenCalled();
    expect(HealthStatsManager).toHaveBeenCalled();
  });

  it('should handle invalid configuration', () => {
    const invalidConfig = { baseUrl: '' };

    expect(() => {
      new BackendAnnotationService(invalidConfig);
    }).not.toThrow();
  });
});
