/**
 * Tests for the CacheManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheManager } from '../src/utils/CacheManager';
import type { EnumData } from '../src/types';

describe('CacheManager', () => {
  let cacheManager: CacheManager;
  let mockData: EnumData;

  beforeEach(() => {
    cacheManager = new CacheManager({
      ttl: 1000, // 1 second
      maxAge: 2000, // 2 seconds
      cleanupInterval: 500 // 0.5 seconds
    });

    mockData = {
      fox: {
        value: 'fox',
        weight: 0.4,
        metadata: { emoji: '🦊' }
      },
      wolf: {
        value: 'wolf',
        weight: 0.25,
        metadata: { emoji: '🐺' }
      }
    };
  });

  describe('Basic Operations', () => {
    it('should set and get cached data', () => {
      cacheManager.set('spirits', mockData);
      
      const retrieved = cacheManager.get<EnumData>('spirits');
      expect(retrieved).toEqual(mockData);
    });

    it('should return null for non-existent key', () => {
      const result = cacheManager.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should check if key exists', () => {
      expect(cacheManager.has('spirits')).toBe(false);
      
      cacheManager.set('spirits', mockData);
      expect(cacheManager.has('spirits')).toBe(true);
    });

    it('should delete cached data', () => {
      cacheManager.set('spirits', mockData);
      expect(cacheManager.has('spirits')).toBe(true);
      
      const deleted = cacheManager.delete('spirits');
      expect(deleted).toBe(true);
      expect(cacheManager.has('spirits')).toBe(false);
    });

    it('should clear all cached data', () => {
      cacheManager.set('spirits', mockData);
      cacheManager.set('styles', { foundation: { value: 'foundation', weight: 1.0 } });
      
      expect(cacheManager.getSize()).toBe(2);
      
      cacheManager.clear();
      expect(cacheManager.getSize()).toBe(0);
    });
  });

  describe('TTL and Expiration', () => {
    it('should expire entries after TTL', async () => {
      cacheManager.set('spirits', mockData);
      expect(cacheManager.has('spirits')).toBe(true);
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(cacheManager.has('spirits')).toBe(false);
      expect(cacheManager.get('spirits')).toBeNull();
    });

    it('should update access time on get', async () => {
      cacheManager.set('spirits', mockData);
      
      // Access the data
      const result = cacheManager.get('spirits');
      expect(result).toEqual(mockData);
      
      // Check that access time was updated
      const info = cacheManager.getEntryInfo('spirits');
      expect(info?.accessCount).toBe(1);
      expect(info?.isExpired).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('should track cache statistics', () => {
      cacheManager.set('spirits', mockData);
      cacheManager.get('spirits'); // Access it
      cacheManager.get('spirits'); // Access it again
      
      const stats = cacheManager.getStats();
      
      expect(stats.size).toBe(1);
      expect(stats.totalAccesses).toBe(2);
      expect(stats.hitRate).toBe(2);
    });

    it('should provide entry information', () => {
      cacheManager.set('spirits', mockData);
      
      const info = cacheManager.getEntryInfo('spirits');
      
      expect(info).not.toBeNull();
      expect(info?.exists).toBe(true);
      expect(info?.accessCount).toBe(0);
      expect(info?.isExpired).toBe(false);
    });

    it('should return null for non-existent entry info', () => {
      const info = cacheManager.getEntryInfo('nonexistent');
      expect(info).toBeNull();
    });
  });

  describe('Cleanup', () => {
    it('should clean up expired entries', async () => {
      cacheManager.set('spirits', mockData);
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Manually trigger cleanup
      cacheManager.cleanup();
      
      expect(cacheManager.has('spirits')).toBe(false);
    });

    it('should clean up old entries based on maxAge', async () => {
      cacheManager.set('spirits', mockData);
      
      // Wait for maxAge to expire
      await new Promise(resolve => setTimeout(resolve, 2100));
      
      // Manually trigger cleanup
      cacheManager.cleanup();
      
      expect(cacheManager.has('spirits')).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const newConfig = {
        ttl: 2000,
        maxAge: 4000,
        cleanupInterval: 1000
      };
      
      cacheManager.updateConfig(newConfig);
      
      const config = cacheManager.getConfig();
      expect(config.ttl).toBe(2000);
      expect(config.maxAge).toBe(4000);
      expect(config.cleanupInterval).toBe(1000);
    });

    it('should get current configuration', () => {
      const config = cacheManager.getConfig();
      
      expect(config.ttl).toBe(1000);
      expect(config.maxAge).toBe(2000);
      expect(config.cleanupInterval).toBe(500);
    });
  });

  describe('Utility Methods', () => {
    it('should get all keys', () => {
      cacheManager.set('spirits', mockData);
      cacheManager.set('styles', { foundation: { value: 'foundation', weight: 1.0 } });
      
      const keys = cacheManager.getKeys();
      expect(keys).toContain('spirits');
      expect(keys).toContain('styles');
      expect(keys).toHaveLength(2);
    });

    it('should get cache size', () => {
      expect(cacheManager.getSize()).toBe(0);
      
      cacheManager.set('spirits', mockData);
      expect(cacheManager.getSize()).toBe(1);
      
      cacheManager.set('styles', { foundation: { value: 'foundation', weight: 1.0 } });
      expect(cacheManager.getSize()).toBe(2);
    });

    it('should check if cache is empty', () => {
      expect(cacheManager.isEmpty()).toBe(true);
      
      cacheManager.set('spirits', mockData);
      expect(cacheManager.isEmpty()).toBe(false);
    });
  });

  describe('Lifecycle', () => {
    it('should destroy cache manager', () => {
      cacheManager.set('spirits', mockData);
      expect(cacheManager.getSize()).toBe(1);
      
      cacheManager.destroy();
      expect(cacheManager.getSize()).toBe(0);
    });

    it('should stop cleanup on destroy', () => {
      const stopCleanupSpy = vi.spyOn(cacheManager, 'stopCleanup');
      
      cacheManager.destroy();
      
      expect(stopCleanupSpy).toHaveBeenCalled();
    });
  });
});
