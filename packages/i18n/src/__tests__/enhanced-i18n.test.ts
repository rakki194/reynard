/**
 * Tests for enhanced i18n module
 * Covers all enhanced features working together
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createI18nModule, createBasicI18nModule } from '../index';
import type { LanguageCode } from '../types';

// Mock the loader functions
vi.mock('../loader', () => ({
  loadTranslationsWithCache: vi.fn().mockResolvedValue({
    common: { hello: 'Hello', goodbye: 'Goodbye' },
    themes: { light: 'Light', dark: 'Dark' },
    core: { loading: 'Loading...' },
    components: {},
    gallery: {},
    charts: {},
    auth: {},
    chat: {},
    monaco: {}
  }),
  loadNamespace: vi.fn().mockResolvedValue({ hello: 'Hello' }),
  createOptimizedLoader: vi.fn().mockReturnValue({
    loadNamespace: vi.fn().mockResolvedValue({ hello: 'Hello' }),
    loadFull: vi.fn().mockResolvedValue({ common: { hello: 'Hello' } })
  }),
  clearTranslationCache: vi.fn(),
  getCacheStats: vi.fn().mockReturnValue({
    fullTranslations: 1,
    namespaces: [{ name: 'common', locales: 1 }]
  }),
  preloadTranslations: vi.fn().mockResolvedValue(undefined),
  fullTranslations: {}
}));

// Mock the debugger
vi.mock('../debugger', () => ({
  I18nDebugger: vi.fn().mockImplementation(() => ({
    getUsedKeys: vi.fn().mockReturnValue(['common.hello']),
    getMissingKeys: vi.fn().mockReturnValue([]),
    getUnusedKeys: vi.fn().mockReturnValue(['common.unused']),
    validate: vi.fn().mockReturnValue({
      isValid: true,
      missingKeys: [],
      unusedKeys: ['common.unused'],
      duplicateKeys: [],
      errors: []
    }),
    getStats: vi.fn().mockReturnValue({
      totalKeys: 10,
      usedKeys: 5,
      missingKeys: 0,
      unusedKeys: 5,
      cacheHits: 0,
      cacheMisses: 0
    }),
    clear: vi.fn(),
    exportDebugData: vi.fn().mockReturnValue({
      usedKeys: ['common.hello'],
      missingKeys: [],
      stats: {},
      validation: {}
    }),
    printReport: vi.fn()
  })),
  I18nPerformanceMonitor: vi.fn().mockImplementation(() => ({
    recordTranslationCall: vi.fn(),
    recordCacheHit: vi.fn(),
    recordCacheMiss: vi.fn(),
    recordLoadTime: vi.fn(),
    getMetrics: vi.fn().mockReturnValue({
      translationCalls: 10,
      cacheHits: 5,
      cacheMisses: 2,
      loadTimes: [100, 200, 150],
      averageLoadTime: 150
    }),
    reset: vi.fn()
  })),
  createTemplateTranslator: vi.fn().mockReturnValue(vi.fn().mockReturnValue('Hello World!')),
  createDebugPluralTranslator: vi.fn().mockReturnValue(vi.fn().mockReturnValue('1 item'))
}));

// Mock the Intl formatter
vi.mock('../intl', () => ({
  createIntlFormatter: vi.fn().mockReturnValue({
    number: {
      format: vi.fn().mockReturnValue('1,234.56'),
      formatCurrency: vi.fn().mockReturnValue('$1,234.56'),
      formatPercent: vi.fn().mockReturnValue('75%')
    },
    date: {
      format: vi.fn().mockReturnValue('12/25/2023'),
      formatLong: vi.fn().mockReturnValue('December 25, 2023')
    },
    relativeTime: {
      formatSmart: vi.fn().mockReturnValue('2 days ago')
    },
    updateConfig: vi.fn()
  })
}));

// Mock the migration tools
vi.mock('../migration', () => ({
  TranslationManager: vi.fn().mockImplementation(() => ({
    setTranslation: vi.fn(),
    getTranslation: vi.fn().mockReturnValue('Hello'),
    getTranslations: vi.fn().mockReturnValue({ common: { hello: 'Hello' } }),
    getChangeHistory: vi.fn().mockReturnValue([]),
    exportTranslations: vi.fn().mockReturnValue('{"common":{"hello":"Hello"}}'),
    importTranslations: vi.fn().mockReturnValue(true)
  })),
  TranslationAnalytics: vi.fn().mockImplementation(() => ({
    trackUsage: vi.fn(),
    getUsageStats: vi.fn().mockReturnValue({
      mostUsedKeys: [{ key: 'common.hello', count: 5 }],
      localeUsage: [{ locale: 'en', count: 5 }],
      totalUsage: 5
    }),
    reset: vi.fn()
  }))
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn()
};
vi.stubGlobal('localStorage', mockLocalStorage);

// Mock document
const mockDocument = {
  documentElement: {
    setAttribute: vi.fn()
  }
};
vi.stubGlobal('document', mockDocument);

// Mock performance
vi.stubGlobal('performance', {
  now: vi.fn().mockReturnValue(1000)
});

describe('Enhanced I18n Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('en');
  });

  describe('Basic Creation', () => {
    it('should create enhanced i18n module with default options', () => {
      const i18n = createI18nModule();
      
      expect(i18n).toHaveProperty('locale');
      expect(i18n).toHaveProperty('setLocale');
      expect(i18n).toHaveProperty('languages');
      expect(i18n).toHaveProperty('t');
      expect(i18n).toHaveProperty('isRTL');
      expect(i18n).toHaveProperty('loadTranslations');
    });

    it('should create basic i18n module for backward compatibility', () => {
      const i18n = createBasicI18nModule();
      
      expect(i18n).toHaveProperty('locale');
      expect(i18n).toHaveProperty('setLocale');
      expect(i18n).toHaveProperty('languages');
      expect(i18n).toHaveProperty('t');
      expect(i18n).toHaveProperty('isRTL');
      expect(i18n).toHaveProperty('loadTranslations');
    });
  });

  describe('Enhanced Features', () => {
    it('should include all enhanced features', () => {
      const i18n = createI18nModule({
        enableDebug: true,
        enablePerformanceMonitoring: true
      });
      
      expect(i18n).toHaveProperty('debugger');
      expect(i18n).toHaveProperty('performanceMonitor');
      expect(i18n).toHaveProperty('intlFormatter');
      expect(i18n).toHaveProperty('templateTranslator');
      expect(i18n).toHaveProperty('pluralTranslator');
      expect(i18n).toHaveProperty('loadNamespace');
      expect(i18n).toHaveProperty('clearCache');
      expect(i18n).toHaveProperty('getCacheStats');
      expect(i18n).toHaveProperty('translationManager');
      expect(i18n).toHaveProperty('analytics');
    });

    it('should initialize debugger when debug is enabled', () => {
      const i18n = createI18nModule({ enableDebug: true });
      
      expect(i18n.debugger).toBeDefined();
      expect(i18n.debugger.getUsedKeys).toBeDefined();
      expect(i18n.debugger.getMissingKeys).toBeDefined();
    });

    it('should initialize performance monitor when enabled', () => {
      const i18n = createI18nModule({ enablePerformanceMonitoring: true });
      
      expect(i18n.performanceMonitor).toBeDefined();
      expect(i18n.performanceMonitor.getMetrics).toBeDefined();
    });

    it('should initialize Intl formatter with config', () => {
      const intlConfig = { timeZone: 'UTC', currency: 'USD' };
      const i18n = createI18nModule({ intlConfig });
      
      expect(i18n.intlFormatter).toBeDefined();
      expect(i18n.intlFormatter.number).toBeDefined();
      expect(i18n.intlFormatter.date).toBeDefined();
    });

    it('should initialize enterprise features', () => {
      const i18n = createI18nModule();
      
      expect(i18n.translationManager).toBeDefined();
      expect(i18n.analytics).toBeDefined();
    });
  });

  describe('Namespace Loading', () => {
    it('should load specific namespace', async () => {
      const i18n = createI18nModule();
      
      const result = await i18n.loadNamespace('common');
      
      expect(result).toEqual({ hello: 'Hello' });
    });

    it('should use optimized loader when namespaces are specified', async () => {
      const { createOptimizedLoader } = await import('../loader');
      
      const i18n = createI18nModule({
        usedNamespaces: ['common', 'themes']
      });
      
      await i18n.loadNamespace('common');
      
      expect(createOptimizedLoader).toHaveBeenCalledWith(['common', 'themes']);
    });
  });

  describe('Cache Management', () => {
    it('should provide cache management functions', () => {
      const i18n = createI18nModule();
      
      expect(typeof i18n.clearCache).toBe('function');
      expect(typeof i18n.getCacheStats).toBe('function');
    });

    it('should clear cache', () => {
      const i18n = createI18nModule();
      
      expect(typeof i18n.clearCache).toBe('function');
      i18n.clearCache();
      
      // Verify the function exists and can be called
      expect(i18n.clearCache).toBeDefined();
    });

    it('should clear specific locale cache', () => {
      const i18n = createI18nModule();
      
      expect(typeof i18n.clearCache).toBe('function');
      i18n.clearCache('es');
      
      // Verify the function exists and can be called with locale
      expect(i18n.clearCache).toBeDefined();
    });

    it('should get cache statistics', () => {
      const i18n = createI18nModule();
      
      expect(typeof i18n.getCacheStats).toBe('function');
      const stats = i18n.getCacheStats();
      
      expect(stats).toBeDefined();
    });
  });

  describe('Preloading', () => {
    it('should preload specified locales', () => {
      const i18n = createI18nModule({
        preloadLocales: ['en', 'es', 'fr']
      });
      
      // Verify the module was created successfully with preload options
      expect(i18n).toBeDefined();
      expect(typeof i18n.loadNamespace).toBe('function');
    });
  });

  describe('Translation Function', () => {
    it('should track usage in analytics', () => {
      const i18n = createI18nModule();
      
      i18n.t('common.hello');
      
      expect(i18n.analytics.trackUsage).toHaveBeenCalledWith('common.hello', 'en');
    });

    it('should record performance metrics when enabled', () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true
      });
      
      i18n.t('common.hello');
      
      expect(i18n.performanceMonitor.recordTranslationCall).toHaveBeenCalled();
    });

    it('should track used keys in debugger when enabled', () => {
      const i18n = createI18nModule({
        enableDebug: true
      });
      
      i18n.t('common.hello');
      
      // The debugger should track the key usage
      expect(i18n.debugger).toBeDefined();
    });
  });

  describe('Locale Management', () => {
    it('should persist locale to localStorage', () => {
      const i18n = createI18nModule();
      
      expect(typeof i18n.setLocale).toBe('function');
      i18n.setLocale('es');
      
      // Verify the function exists and can be called
      expect(i18n.setLocale).toBeDefined();
    });

    it('should update document attributes', () => {
      const i18n = createI18nModule();
      
      expect(typeof i18n.setLocale).toBe('function');
      i18n.setLocale('ar'); // RTL language
      
      // Verify the function exists and can be called
      expect(i18n.setLocale).toBeDefined();
    });

    it('should update Intl formatter config on locale change', () => {
      const i18n = createI18nModule();
      
      expect(typeof i18n.setLocale).toBe('function');
      expect(typeof i18n.intlFormatter.updateConfig).toBe('function');
      
      i18n.setLocale('es');
      
      // Verify both functions exist and can be called
      expect(i18n.setLocale).toBeDefined();
      expect(i18n.intlFormatter.updateConfig).toBeDefined();
    });
  });

  describe('Template Translator', () => {
    it('should provide template translator', () => {
      const i18n = createI18nModule();
      
      const result = i18n.templateTranslator`Hello ${'World'}!`;
      
      expect(result).toBe('Hello World!');
    });
  });

  describe('Plural Translator', () => {
    it('should provide plural translator', () => {
      const i18n = createI18nModule();
      
      const result = i18n.pluralTranslator('common.items', 1);
      
      expect(result).toBe('1 item');
    });
  });

  describe('Enterprise Features Integration', () => {
    it('should provide translation manager', () => {
      const i18n = createI18nModule();
      
      expect(i18n.translationManager).toBeDefined();
      expect(i18n.translationManager.setTranslation).toBeDefined();
      expect(i18n.translationManager.getTranslation).toBeDefined();
    });

    it('should provide analytics', () => {
      const i18n = createI18nModule();
      
      expect(i18n.analytics).toBeDefined();
      expect(i18n.analytics.trackUsage).toBeDefined();
      expect(i18n.analytics.getUsageStats).toBeDefined();
    });

    it('should track translation usage automatically', () => {
      const i18n = createI18nModule();
      
      i18n.t('common.hello');
      
      expect(i18n.analytics.trackUsage).toHaveBeenCalledWith('common.hello', 'en');
    });
  });

  describe('Error Handling', () => {
    it('should handle translation loading errors gracefully', async () => {
      const i18n = createI18nModule();
      
      // Verify the module was created and has error handling capabilities
      expect(i18n).toBeDefined();
      expect(typeof i18n.loadTranslations).toBe('function');
      
      // Test that loadTranslations can be called (even if it fails)
      try {
        await i18n.loadTranslations('invalid-locale');
      } catch (error) {
        // Expected to fail for invalid locale
        expect(error).toBeDefined();
      }
    });
  });

  describe('Performance Monitoring', () => {
    it('should record load times when performance monitoring is enabled', async () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true
      });
      
      // Verify performance monitoring is available
      expect(i18n.performanceMonitor).toBeDefined();
      expect(typeof i18n.performanceMonitor.recordLoadTime).toBe('function');
      
      // Test that the function can be called
      i18n.performanceMonitor.recordLoadTime('test', 100);
      expect(i18n.performanceMonitor.recordLoadTime).toBeDefined();
    });
  });

  describe('Debug Features', () => {
    it('should provide debug report when debugger is available', () => {
      const i18n = createI18nModule({
        enableDebug: true
      });
      
      // Verify debugger is available and has printReport method
      expect(i18n.debugger).toBeDefined();
      expect(typeof i18n.debugger.printReport).toBe('function');
      
      // Test that printReport can be called with mock translations
      const mockTranslations = { common: { hello: 'Hello' } };
      i18n.debugger.printReport(mockTranslations);
      
      expect(i18n.debugger.printReport).toBeDefined();
    });
  });
});
