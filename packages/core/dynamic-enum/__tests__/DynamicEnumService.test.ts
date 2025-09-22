/**
 * Tests for the DynamicEnumService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DynamicEnumService } from '../src/DynamicEnumService';
import { SpiritEnumProvider } from '../src/providers/SpiritEnumProvider';
import type { EnumData, EnumValue } from '../src/types';

describe('DynamicEnumService', () => {
  let service: DynamicEnumService;
  let mockSpiritData: EnumData;

  beforeEach(() => {
    service = new DynamicEnumService({
      enableCaching: false,
      enableMetrics: true
    });

    mockSpiritData = {
      fox: {
        value: 'fox',
        weight: 0.4,
        metadata: {
          emoji: '🦊',
          description: 'Strategic and cunning',
          category: 'canine'
        }
      },
      wolf: {
        value: 'wolf',
        weight: 0.25,
        metadata: {
          emoji: '🐺',
          description: 'Pack-oriented and loyal',
          category: 'canine'
        }
      },
      otter: {
        value: 'otter',
        weight: 0.35,
        metadata: {
          emoji: '🦦',
          description: 'Playful and thorough',
          category: 'aquatic'
        }
      }
    };

    // Set fallback data
    service.setFallbackData('spirits', mockSpiritData);
    service.setDefaultFallback('spirits', 'fox');
  });

  describe('Provider Management', () => {
    it('should register a provider', () => {
      const provider = new SpiritEnumProvider({
        enumType: 'spirits',
        fallbackData: mockSpiritData,
        defaultFallback: 'fox'
      });

      service.registerProvider('spirits', provider);
      
      expect(service.hasProvider('spirits')).toBe(true);
      expect(service.getRegisteredTypes()).toContain('spirits');
    });

    it('should create and register a provider', () => {
      service.createAndRegisterProvider('spirits', {
        enumType: 'spirits',
        fallbackData: mockSpiritData,
        defaultFallback: 'fox'
      });

      expect(service.hasProvider('spirits')).toBe(true);
    });

    it('should unregister a provider', () => {
      const provider = new SpiritEnumProvider({
        enumType: 'spirits',
        fallbackData: mockSpiritData,
        defaultFallback: 'fox'
      });

      service.registerProvider('spirits', provider);
      expect(service.hasProvider('spirits')).toBe(true);

      service.unregisterProvider('spirits');
      expect(service.hasProvider('spirits')).toBe(false);
    });
  });

  describe('Enum Data Operations', () => {
    beforeEach(() => {
      const provider = new SpiritEnumProvider({
        enumType: 'spirits',
        fallbackData: mockSpiritData,
        defaultFallback: 'fox'
      });
      service.registerProvider('spirits', provider);
    });

    it('should get enum data', async () => {
      const data = await service.getEnumData('spirits');
      
      expect(data).toEqual(mockSpiritData);
      expect(Object.keys(data)).toContain('fox');
      expect(Object.keys(data)).toContain('wolf');
      expect(Object.keys(data)).toContain('otter');
    });

    it('should get a specific enum value', async () => {
      const value = await service.getEnumValue('spirits', 'fox');
      
      expect(value).toEqual(mockSpiritData.fox);
      expect(value?.value).toBe('fox');
      expect(value?.weight).toBe(0.4);
    });

    it('should return null for non-existent enum value', async () => {
      const value = await service.getEnumValue('spirits', 'nonexistent');
      
      expect(value).toBeNull();
    });

    it('should get metadata for an enum value', async () => {
      const metadata = await service.getMetadata('spirits', 'fox');
      
      expect(metadata).toEqual(mockSpiritData.fox.metadata);
      expect(metadata?.emoji).toBe('🦊');
      expect(metadata?.description).toBe('Strategic and cunning');
    });

    it('should validate enum values', () => {
      const validResult = service.validateValue('spirits', 'fox');
      expect(validResult.isValid).toBe(true);
      expect(validResult.value).toBe('fox');

      const invalidResult = service.validateValue('spirits', 'invalid');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('not valid');
    });

    it('should get random enum values', async () => {
      const result = await service.getRandomValue('spirits');
      
      expect(result.value).toBeDefined();
      expect(['fox', 'wolf', 'otter']).toContain(result.value);
    });

    it('should get multiple random enum values', async () => {
      const results = await service.getRandomValues('spirits', 3);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(['fox', 'wolf', 'otter']).toContain(result.value);
      });
    });

    it('should check if a value exists', async () => {
      const exists = await service.hasValue('spirits', 'fox');
      expect(exists).toBe(true);

      const notExists = await service.hasValue('spirits', 'invalid');
      expect(notExists).toBe(false);
    });

    it('should get all keys', async () => {
      const keys = await service.getKeys('spirits');
      
      expect(keys).toContain('fox');
      expect(keys).toContain('wolf');
      expect(keys).toContain('otter');
      expect(keys).toHaveLength(3);
    });

    it('should get count of enum values', async () => {
      const count = await service.getCount('spirits');
      expect(count).toBe(3);
    });
  });

  describe('Fallback Handling', () => {
    it('should use fallback data when no provider is registered', async () => {
      const data = await service.getEnumData('spirits');
      
      expect(data).toEqual(mockSpiritData);
      expect(Object.keys(data)).toHaveLength(3);
    });

    it('should use default fallback for random values when no provider is registered', async () => {
      const result = await service.getRandomValue('spirits');
      
      expect(result.value).toBe('fox');
      expect(result.isFallback).toBe(true);
    });
  });

  describe('Metrics', () => {
    beforeEach(() => {
      const provider = new SpiritEnumProvider({
        enumType: 'spirits',
        fallbackData: mockSpiritData,
        defaultFallback: 'fox'
      });
      service.registerProvider('spirits', provider);
    });

    it('should track metrics', async () => {
      await service.getEnumData('spirits');
      await service.validateValue('spirits', 'fox');
      await service.getRandomValue('spirits');
      await service.getMetadata('spirits', 'fox');

      const metrics = service.getMetrics();
      
      expect(metrics.requests).toBeGreaterThan(0);
      expect(metrics.validations).toBeGreaterThan(0);
      expect(metrics.randomSelections).toBeGreaterThan(0);
      expect(metrics.metadataRequests).toBeGreaterThan(0);
      expect(metrics.providerCount).toBe(1);
    });

    it('should track cache hits and misses', async () => {
      const serviceWithCache = new DynamicEnumService({
        enableCaching: true,
        cacheTimeout: 1000
      });

      const provider = new SpiritEnumProvider({
        enumType: 'spirits',
        fallbackData: mockSpiritData,
        defaultFallback: 'fox'
      });
      serviceWithCache.registerProvider('spirits', provider);

      // First request should be a cache miss
      await serviceWithCache.getEnumData('spirits');
      
      // Second request should be a cache hit
      await serviceWithCache.getEnumData('spirits');

      const metrics = serviceWithCache.getMetrics();
      expect(metrics.cacheHits).toBeGreaterThan(0);
      expect(metrics.cacheMisses).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing provider gracefully', async () => {
      const data = await service.getEnumData('nonexistent');
      
      expect(data).toEqual({});
    });

    it('should handle validation errors gracefully', () => {
      const result = service.validateValue('nonexistent', 'value');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('No provider registered');
    });
  });

  describe('Service Lifecycle', () => {
    it('should destroy service properly', () => {
      const provider = new SpiritEnumProvider({
        enumType: 'spirits',
        fallbackData: mockSpiritData,
        defaultFallback: 'fox'
      });
      service.registerProvider('spirits', provider);

      expect(service.hasProvider('spirits')).toBe(true);
      
      service.destroy();
      
      expect(service.hasProvider('spirits')).toBe(false);
    });
  });
});
