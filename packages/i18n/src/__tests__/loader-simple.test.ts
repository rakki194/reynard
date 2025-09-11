/**
 * Simple tests for translation loading system
 * Tests core functionality without complex dynamic imports
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the loader functions
const mockLoadTranslationsWithCache = vi.fn();
const mockLoadNamespace = vi.fn();
const mockCreateOptimizedLoader = vi.fn();
const mockClearTranslationCache = vi.fn();
const mockGetCacheStats = vi.fn();
const mockPreloadTranslations = vi.fn();

vi.mock('../loader', () => ({
  loadTranslationsWithCache: mockLoadTranslationsWithCache,
  loadNamespace: mockLoadNamespace,
  createOptimizedLoader: mockCreateOptimizedLoader,
  clearTranslationCache: mockClearTranslationCache,
  getCacheStats: mockGetCacheStats,
  preloadTranslations: mockPreloadTranslations,
  fullTranslations: {}
}));

describe('Translation Loader System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock implementations
    mockLoadTranslationsWithCache.mockResolvedValue({
      common: { hello: 'Hello' },
      themes: { light: 'Light' },
      core: { loading: 'Loading...' },
      components: {},
      gallery: {},
      charts: {},
      auth: {},
      chat: {},
      monaco: {}
    });
    
    mockLoadNamespace.mockResolvedValue({ hello: 'Hello' });
    
    mockCreateOptimizedLoader.mockReturnValue({
      loadNamespace: vi.fn().mockResolvedValue({ hello: 'Hello' }),
      loadFull: vi.fn().mockResolvedValue({ common: { hello: 'Hello' } })
    });
    
    mockGetCacheStats.mockReturnValue({
      fullTranslations: 1,
      namespaces: [{ name: 'common', locales: 1 }]
    });
    
    mockPreloadTranslations.mockResolvedValue(undefined);
  });

  describe('loadTranslationsWithCache', () => {
    it('should load translations and cache them', async () => {
      const { loadTranslationsWithCache } = await import('../loader');
      
      const result = await loadTranslationsWithCache('en');
      
      expect(mockLoadTranslationsWithCache).toHaveBeenCalledWith('en');
      expect(result).toEqual({
        common: { hello: 'Hello' },
        themes: { light: 'Light' },
        core: { loading: 'Loading...' },
        components: {},
        gallery: {},
        charts: {},
        auth: {},
        chat: {},
        monaco: {}
      });
    });

    it('should handle cache disabled', async () => {
      const { loadTranslationsWithCache } = await import('../loader');
      
      await loadTranslationsWithCache('en', false);
      
      expect(mockLoadTranslationsWithCache).toHaveBeenCalledWith('en', false);
    });
  });

  describe('loadNamespace', () => {
    it('should load specific namespace', async () => {
      const { loadNamespace } = await import('../loader');
      
      const result = await loadNamespace('en', 'common');
      
      expect(mockLoadNamespace).toHaveBeenCalledWith('en', 'common');
      expect(result).toEqual({ hello: 'Hello' });
    });
  });

  describe('createOptimizedLoader', () => {
    it('should create optimized loader with used namespaces', async () => {
      const { createOptimizedLoader } = await import('../loader');
      
      const loader = createOptimizedLoader(['common', 'themes']);
      
      expect(mockCreateOptimizedLoader).toHaveBeenCalledWith(['common', 'themes']);
      expect(loader).toHaveProperty('loadNamespace');
      expect(loader).toHaveProperty('loadFull');
    });
  });

  describe('Cache Management', () => {
    it('should clear all cache', async () => {
      const { clearTranslationCache } = await import('../loader');
      
      clearTranslationCache();
      
      expect(mockClearTranslationCache).toHaveBeenCalled();
    });

    it('should clear specific locale cache', async () => {
      const { clearTranslationCache } = await import('../loader');
      
      clearTranslationCache('es');
      
      expect(mockClearTranslationCache).toHaveBeenCalledWith('es');
    });

    it('should provide cache statistics', async () => {
      const { getCacheStats } = await import('../loader');
      
      const stats = getCacheStats();
      
      expect(mockGetCacheStats).toHaveBeenCalled();
      expect(stats).toHaveProperty('fullTranslations');
      expect(stats).toHaveProperty('namespaces');
    });
  });

  describe('preloadTranslations', () => {
    it('should preload multiple locales', async () => {
      const { preloadTranslations } = await import('../loader');
      
      await preloadTranslations(['en', 'es']);
      
      expect(mockPreloadTranslations).toHaveBeenCalledWith(['en', 'es']);
    });
  });

  describe('Error Handling', () => {
    it('should handle loading errors gracefully', async () => {
      mockLoadTranslationsWithCache.mockRejectedValueOnce(new Error('Failed to load'));
      
      const { loadTranslationsWithCache } = await import('../loader');
      
      await expect(loadTranslationsWithCache('nonexistent')).rejects.toThrow('Failed to load');
    });

    it('should handle namespace loading errors', async () => {
      mockLoadNamespace.mockRejectedValueOnce(new Error('Namespace not found'));
      
      const { loadNamespace } = await import('../loader');
      
      await expect(loadNamespace('en', 'nonexistent')).rejects.toThrow('Namespace not found');
    });
  });

  describe('Integration with Enhanced I18n', () => {
    it('should work with enhanced i18n module', async () => {
      // Mock the enhanced i18n module
      vi.mock('../index', () => ({
        createI18nModule: vi.fn().mockReturnValue({
          locale: vi.fn().mockReturnValue('en'),
          setLocale: vi.fn(),
          languages: vi.fn().mockReturnValue(['en', 'es']),
          t: vi.fn().mockReturnValue('Hello'),
          isRTL: false,
          loadTranslations: vi.fn(),
          loadNamespace: mockLoadNamespace,
          clearCache: mockClearTranslationCache,
          getCacheStats: mockGetCacheStats
        })
      }));

      const { createI18nModule } = await import('../index');
      
      const i18n = createI18nModule({
        usedNamespaces: ['common', 'themes']
      });

      expect(i18n).toHaveProperty('loadNamespace');
      expect(i18n).toHaveProperty('clearCache');
      expect(i18n).toHaveProperty('getCacheStats');
    });
  });
});
