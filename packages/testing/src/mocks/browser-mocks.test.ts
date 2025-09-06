import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  mockLocalStorage,
  mockSessionStorage,
  mockMatchMedia,
  mockResizeObserver,
  mockIntersectionObserver,
  mockMutationObserver,
  mockPerformanceObserver,
  mockRequestAnimationFrame,
  mockCancelAnimationFrame,
  mockFetch,
  mockWebSocket,
  mockEventSource,
  mockCrypto,
  mockPerformance,
  mockURL,
  mockURLSearchParams,
  mockFormData,
  mockHeaders,
  mockAbortController,
  mockAbortSignal,
  mockNavigator,
  mockWindow,
  setupBrowserMocks,
  resetBrowserMocks,
} from './browser-mocks';

describe('Browser Mocks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetBrowserMocks();
  });

  describe('Storage Mocks', () => {
    describe('mockLocalStorage', () => {
      it('should provide localStorage methods', () => {
        expect(mockLocalStorage.getItem).toBeDefined();
        expect(mockLocalStorage.setItem).toBeDefined();
        expect(mockLocalStorage.removeItem).toBeDefined();
        expect(mockLocalStorage.clear).toBeDefined();
        expect(mockLocalStorage.key).toBeDefined();
        expect(mockLocalStorage.length).toBe(0);
      });

      it('should be mockable', () => {
        mockLocalStorage.getItem.mockReturnValue('test value');
        expect(mockLocalStorage.getItem('key')).toBe('test value');
      });
    });

    describe('mockSessionStorage', () => {
      it('should provide sessionStorage methods', () => {
        expect(mockSessionStorage.getItem).toBeDefined();
        expect(mockSessionStorage.setItem).toBeDefined();
        expect(mockSessionStorage.removeItem).toBeDefined();
        expect(mockSessionStorage.clear).toBeDefined();
        expect(mockSessionStorage.key).toBeDefined();
        expect(mockSessionStorage.length).toBe(0);
      });

      it('should be mockable', () => {
        mockSessionStorage.setItem.mockImplementation(() => {});
        mockSessionStorage.setItem('key', 'value');
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('key', 'value');
      });
    });
  });

  describe('Media Mocks', () => {
    describe('mockMatchMedia', () => {
      it('should return MediaQueryList-like object', () => {
        const result = mockMatchMedia('(min-width: 768px)');
        
        expect(result.matches).toBe(false);
        expect(result.media).toBe('(min-width: 768px)');
        expect(result.onchange).toBeNull();
        expect(result.addListener).toBeDefined();
        expect(result.removeListener).toBeDefined();
        expect(result.addEventListener).toBeDefined();
        expect(result.removeEventListener).toBeDefined();
        expect(result.dispatchEvent).toBeDefined();
      });

      it('should be mockable', () => {
        mockMatchMedia.mockReturnValue({
          matches: true,
          media: 'test',
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        });
        
        const result = mockMatchMedia('test');
        expect(result.matches).toBe(true);
      });
    });
  });

  describe('Observer Mocks', () => {
    describe('mockResizeObserver', () => {
      it('should create observer with required methods', () => {
        const observer = new mockResizeObserver();
        
        expect(observer.observe).toBeDefined();
        expect(observer.unobserve).toBeDefined();
        expect(observer.disconnect).toBeDefined();
      });

      it('should be callable as constructor', () => {
        expect(() => new mockResizeObserver()).not.toThrow();
      });
    });

    describe('mockIntersectionObserver', () => {
      it('should create observer with required methods', () => {
        const observer = new mockIntersectionObserver(() => {});
        
        expect(observer.observe).toBeDefined();
        expect(observer.unobserve).toBeDefined();
        expect(observer.disconnect).toBeDefined();
      });

      it('should be callable as constructor', () => {
        expect(() => new mockIntersectionObserver(() => {})).not.toThrow();
      });
    });

    describe('mockMutationObserver', () => {
      it('should create observer with required methods', () => {
        const observer = new mockMutationObserver(() => {});
        
        expect(observer.observe).toBeDefined();
        expect(observer.disconnect).toBeDefined();
        expect(observer.takeRecords).toBeDefined();
      });

      it('should return empty records', () => {
        const observer = new mockMutationObserver(() => {});
        expect(observer.takeRecords()).toEqual([]);
      });
    });

    describe('mockPerformanceObserver', () => {
      it('should create observer with required methods', () => {
        const observer = new mockPerformanceObserver(() => {});
        
        expect(observer.observe).toBeDefined();
        expect(observer.disconnect).toBeDefined();
        expect(observer.takeRecords).toBeDefined();
        expect(observer.supportedEntryTypes).toEqual([]);
      });

      it('should return empty records', () => {
        const observer = new mockPerformanceObserver(() => {});
        expect(observer.takeRecords()).toEqual([]);
      });
    });
  });

  describe('Animation Mocks', () => {
    describe('mockRequestAnimationFrame', () => {
    it('should call callback asynchronously', async () => {
      await new Promise<void>((resolve) => {
        mockRequestAnimationFrame((timestamp) => {
          expect(typeof timestamp).toBe('number');
          resolve();
        });
      });
    });

      it('should return a number', () => {
        const id = mockRequestAnimationFrame(() => {});
        expect(typeof id).toBe('number');
      });
    });

    describe('mockCancelAnimationFrame', () => {
      it('should not throw when called', () => {
        expect(() => mockCancelAnimationFrame(1)).not.toThrow();
      });
    });
  });

  describe('Network Mocks', () => {
    describe('mockFetch', () => {
      it('should return a promise that resolves to a response', async () => {
        const response = await mockFetch('/test');
        
        expect(response.ok).toBe(true);
        expect(response.json).toBeDefined();
        expect(response.text).toBeDefined();
        expect(response.blob).toBeDefined();
      });

      it('should be mockable', () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: vi.fn().mockResolvedValue({ error: 'Not found' }),
        });
        
        expect(mockFetch('/test')).resolves.toMatchObject({
          ok: false,
          status: 404,
        });
      });
    });

    describe('mockWebSocket', () => {
      it('should create WebSocket with required properties', () => {
        const ws = new mockWebSocket();
        
        expect(ws.readyState).toBe(WebSocket.CONNECTING);
        expect(ws.close).toBeDefined();
        expect(ws.send).toBeDefined();
        expect(ws.addEventListener).toBeDefined();
        expect(ws.removeEventListener).toBeDefined();
        expect(ws.dispatchEvent).toBeDefined();
      });

      it('should simulate connection', async () => {
        const ws = new mockWebSocket();
        
        await new Promise<void>((resolve) => {
          ws.onopen = (event) => {
            expect(ws.readyState).toBe(WebSocket.OPEN);
            expect(event.type).toBe('open');
            resolve();
          };
        });
      });
    });

    describe('mockEventSource', () => {
      it('should create EventSource with required properties', () => {
        const es = new mockEventSource();
        
        expect(es.readyState).toBe(EventSource.CONNECTING);
        expect(es.close).toBeDefined();
        expect(es.addEventListener).toBeDefined();
        expect(es.removeEventListener).toBeDefined();
        expect(es.dispatchEvent).toBeDefined();
      });

      it('should simulate connection', async () => {
        const es = new mockEventSource();
        
        await new Promise<void>((resolve) => {
          es.onopen = (event) => {
            expect(es.readyState).toBe(EventSource.OPEN);
            expect(event.type).toBe('open');
            resolve();
          };
        });
      });
    });
  });

  describe('Crypto Mocks', () => {
    describe('mockCrypto', () => {
      it('should provide crypto methods', () => {
        expect(mockCrypto.randomUUID).toBeDefined();
        expect(mockCrypto.getRandomValues).toBeDefined();
        expect(mockCrypto.subtle).toBeDefined();
      });

      it('should generate predictable UUID', () => {
        expect(mockCrypto.randomUUID()).toBe('00000000-0000-4000-8000-000000000000');
      });

      it('should fill array with random values', () => {
        const array = new Uint8Array(4);
        const result = mockCrypto.getRandomValues(array);
        
        expect(result).toBe(array);
        expect(array.length).toBe(4);
      });
    });
  });

  describe('Performance Mocks', () => {
    describe('mockPerformance', () => {
      it('should provide performance methods', () => {
        expect(mockPerformance.now).toBeDefined();
        expect(mockPerformance.mark).toBeDefined();
        expect(mockPerformance.measure).toBeDefined();
        expect(mockPerformance.getEntriesByType).toBeDefined();
        expect(mockPerformance.getEntriesByName).toBeDefined();
        expect(mockPerformance.clearMarks).toBeDefined();
        expect(mockPerformance.clearMeasures).toBeDefined();
        expect(mockPerformance.clearResourceTimings).toBeDefined();
        expect(mockPerformance.getEntries).toBeDefined();
        expect(mockPerformance.toJSON).toBeDefined();
      });

      it('should return timestamp from now', () => {
        const timestamp = mockPerformance.now();
        expect(typeof timestamp).toBe('number');
      });

      it('should return empty arrays from getters', () => {
        expect(mockPerformance.getEntriesByType('mark')).toEqual([]);
        expect(mockPerformance.getEntriesByName('test')).toEqual([]);
        expect(mockPerformance.getEntries()).toEqual([]);
      });
    });
  });

  describe('URL Mocks', () => {
    describe('mockURL', () => {
      it('should create URL objects', () => {
        const url = new mockURL('https://example.com/path?query=value');
        
        expect(url.href).toBe('https://example.com/path?query=value');
        expect(url.origin).toBe('https://example.com');
        expect(url.pathname).toBe('/path');
        expect(url.search).toBe('?query=value');
      });

      it('should handle base URLs', () => {
        const url = new mockURL('/path', 'https://example.com');
        
        expect(url.href).toBe('https://example.com/path');
      });
    });

    describe('mockURLSearchParams', () => {
      it('should create URLSearchParams objects', () => {
        const params = new mockURLSearchParams('key=value&other=test');
        
        expect(params.get('key')).toBe('value');
        expect(params.get('other')).toBe('test');
      });

      it('should handle different initialization formats', () => {
        const params1 = new mockURLSearchParams([['key', 'value']]);
        const params2 = new mockURLSearchParams({ key: 'value' });
        
        expect(params1.get('key')).toBe('value');
        expect(params2.get('key')).toBe('value');
      });
    });
  });

  describe('Form Mocks', () => {
    describe('mockFormData', () => {
      it('should create FormData-like objects', () => {
        const formData = new mockFormData();
        
        expect(formData.append).toBeDefined();
        expect(formData.delete).toBeDefined();
        expect(formData.get).toBeDefined();
        expect(formData.getAll).toBeDefined();
        expect(formData.has).toBeDefined();
        expect(formData.set).toBeDefined();
        expect(formData.entries).toBeDefined();
        expect(formData.keys).toBeDefined();
        expect(formData.values).toBeDefined();
        expect(formData.forEach).toBeDefined();
      });
    });

    describe('mockHeaders', () => {
      it('should create Headers-like objects', () => {
        const headers = new mockHeaders();
        
        expect(headers.append).toBeDefined();
        expect(headers.delete).toBeDefined();
        expect(headers.get).toBeDefined();
        expect(headers.has).toBeDefined();
        expect(headers.set).toBeDefined();
        expect(headers.entries).toBeDefined();
        expect(headers.keys).toBeDefined();
        expect(headers.values).toBeDefined();
        expect(headers.forEach).toBeDefined();
      });

      it('should handle initialization', () => {
        const headers = new mockHeaders({ 'Content-Type': 'application/json' });
        
        expect(headers.get('Content-Type')).toBe('application/json');
      });
    });
  });

  describe('Abort Mocks', () => {
    describe('mockAbortController', () => {
      it('should create AbortController-like objects', () => {
        const controller = new mockAbortController();
        
        expect(controller.abort).toBeDefined();
        expect(controller.signal).toBeDefined();
        expect(controller.signal.addEventListener).toBeDefined();
        expect(controller.signal.removeEventListener).toBeDefined();
        expect(controller.signal.dispatchEvent).toBeDefined();
      });
    });

    describe('mockAbortSignal', () => {
      it('should create AbortSignal-like objects', () => {
        const signal = new mockAbortSignal();
        
        expect(signal.addEventListener).toBeDefined();
        expect(signal.removeEventListener).toBeDefined();
        expect(signal.dispatchEvent).toBeDefined();
      });
    });
  });

  describe('Navigator Mocks', () => {
    describe('mockNavigator', () => {
      it('should provide navigator properties', () => {
        expect(mockNavigator.userAgent).toBe('Mozilla/5.0 (Test Browser)');
        expect(mockNavigator.language).toBe('en-US');
        expect(mockNavigator.languages).toEqual(['en-US', 'en']);
        expect(mockNavigator.platform).toBe('Test Platform');
        expect(mockNavigator.onLine).toBe(true);
        expect(mockNavigator.cookieEnabled).toBe(true);
        expect(mockNavigator.doNotTrack).toBe('1');
        expect(mockNavigator.maxTouchPoints).toBe(0);
        expect(mockNavigator.hardwareConcurrency).toBe(4);
        expect(mockNavigator.deviceMemory).toBe(8);
      });

      it('should provide connection information', () => {
        expect(mockNavigator.connection.effectiveType).toBe('4g');
        expect(mockNavigator.connection.downlink).toBe(10);
        expect(mockNavigator.connection.rtt).toBe(50);
      });

      it('should provide geolocation API', () => {
        expect(mockNavigator.geolocation.getCurrentPosition).toBeDefined();
        expect(mockNavigator.geolocation.watchPosition).toBeDefined();
        expect(mockNavigator.geolocation.clearWatch).toBeDefined();
      });

      it('should provide media devices API', () => {
        expect(mockNavigator.mediaDevices.getUserMedia).toBeDefined();
        expect(mockNavigator.mediaDevices.enumerateDevices).toBeDefined();
      });

      it('should provide clipboard API', () => {
        expect(mockNavigator.clipboard.readText).toBeDefined();
        expect(mockNavigator.clipboard.writeText).toBeDefined();
        expect(mockNavigator.clipboard.read).toBeDefined();
        expect(mockNavigator.clipboard.write).toBeDefined();
      });

      it('should provide permissions API', () => {
        expect(mockNavigator.permissions.query).toBeDefined();
        expect(mockNavigator.permissions.request).toBeDefined();
      });

      it('should provide service worker API', () => {
        expect(mockNavigator.serviceWorker.register).toBeDefined();
        expect(mockNavigator.serviceWorker.getRegistration).toBeDefined();
        expect(mockNavigator.serviceWorker.getRegistrations).toBeDefined();
      });
    });
  });

  describe('Window Mocks', () => {
    describe('mockWindow', () => {
      it('should provide window properties', () => {
        expect(mockWindow.innerWidth).toBe(1024);
        expect(mockWindow.innerHeight).toBe(768);
        expect(mockWindow.outerWidth).toBe(1024);
        expect(mockWindow.outerHeight).toBe(768);
        expect(mockWindow.devicePixelRatio).toBe(1);
      });

      it('should provide screen information', () => {
        expect(mockWindow.screen.width).toBe(1024);
        expect(mockWindow.screen.height).toBe(768);
        expect(mockWindow.screen.availWidth).toBe(1024);
        expect(mockWindow.screen.availHeight).toBe(768);
        expect(mockWindow.screen.colorDepth).toBe(24);
        expect(mockWindow.screen.pixelDepth).toBe(24);
      });

      it('should provide location information', () => {
        expect(mockWindow.location.href).toBe('http://localhost:3000/');
        expect(mockWindow.location.origin).toBe('http://localhost:3000');
        expect(mockWindow.location.protocol).toBe('http:');
        expect(mockWindow.location.host).toBe('localhost:3000');
        expect(mockWindow.location.hostname).toBe('localhost');
        expect(mockWindow.location.port).toBe('3000');
        expect(mockWindow.location.pathname).toBe('/');
        expect(mockWindow.location.search).toBe('');
        expect(mockWindow.location.hash).toBe('');
      });

      it('should provide location methods', () => {
        expect(mockWindow.location.assign).toBeDefined();
        expect(mockWindow.location.replace).toBeDefined();
        expect(mockWindow.location.reload).toBeDefined();
      });

      it('should provide history information', () => {
        expect(mockWindow.history.length).toBe(1);
        expect(mockWindow.history.state).toBeNull();
      });

      it('should provide history methods', () => {
        expect(mockWindow.history.back).toBeDefined();
        expect(mockWindow.history.forward).toBeDefined();
        expect(mockWindow.history.go).toBeDefined();
        expect(mockWindow.history.pushState).toBeDefined();
        expect(mockWindow.history.replaceState).toBeDefined();
      });

      it('should provide document information', () => {
        expect(mockWindow.document.title).toBe('Test Document');
        expect(mockWindow.document.body.scrollTop).toBe(0);
        expect(mockWindow.document.body.scrollLeft).toBe(0);
        expect(mockWindow.document.documentElement.scrollTop).toBe(0);
        expect(mockWindow.document.documentElement.scrollLeft).toBe(0);
      });

      it('should provide window methods', () => {
        expect(mockWindow.addEventListener).toBeDefined();
        expect(mockWindow.removeEventListener).toBeDefined();
        expect(mockWindow.dispatchEvent).toBeDefined();
        expect(mockWindow.open).toBeDefined();
        expect(mockWindow.close).toBeDefined();
        expect(mockWindow.focus).toBeDefined();
        expect(mockWindow.blur).toBeDefined();
        expect(mockWindow.scroll).toBeDefined();
        expect(mockWindow.scrollTo).toBeDefined();
        expect(mockWindow.scrollBy).toBeDefined();
        expect(mockWindow.alert).toBeDefined();
        expect(mockWindow.confirm).toBeDefined();
        expect(mockWindow.prompt).toBeDefined();
        expect(mockWindow.setTimeout).toBeDefined();
        expect(mockWindow.clearTimeout).toBeDefined();
        expect(mockWindow.setInterval).toBeDefined();
        expect(mockWindow.clearInterval).toBeDefined();
      });

      it('should provide global objects', () => {
        expect(mockWindow.requestAnimationFrame).toBe(mockRequestAnimationFrame);
        expect(mockWindow.cancelAnimationFrame).toBe(mockCancelAnimationFrame);
        expect(mockWindow.fetch).toBe(mockFetch);
        expect(mockWindow.WebSocket).toBe(mockWebSocket);
        expect(mockWindow.EventSource).toBe(mockEventSource);
        expect(mockWindow.crypto).toBe(mockCrypto);
        expect(mockWindow.performance).toBe(mockPerformance);
        expect(mockWindow.URL).toBe(mockURL);
        expect(mockWindow.URLSearchParams).toBe(mockURLSearchParams);
        expect(mockWindow.FormData).toBe(mockFormData);
        expect(mockWindow.Headers).toBe(mockHeaders);
        expect(mockWindow.AbortController).toBe(mockAbortController);
        expect(mockWindow.AbortSignal).toBe(mockAbortSignal);
        expect(mockWindow.navigator).toBe(mockNavigator);
        expect(mockWindow.localStorage).toBe(mockLocalStorage);
        expect(mockWindow.sessionStorage).toBe(mockSessionStorage);
        expect(mockWindow.matchMedia).toBe(mockMatchMedia);
        expect(mockWindow.ResizeObserver).toBe(mockResizeObserver);
        expect(mockWindow.IntersectionObserver).toBe(mockIntersectionObserver);
        expect(mockWindow.MutationObserver).toBe(mockMutationObserver);
        expect(mockWindow.PerformanceObserver).toBe(mockPerformanceObserver);
      });
    });
  });

  describe('setupBrowserMocks', () => {
    it('should set up global mocks', () => {
      setupBrowserMocks();
      
      expect(global.window).toBe(mockWindow);
      expect(global.document).toBe(mockWindow.document);
      expect(global.navigator).toBe(mockNavigator);
      expect(global.localStorage).toBe(mockLocalStorage);
      expect(global.sessionStorage).toBe(mockSessionStorage);
      expect(global.matchMedia).toBe(mockMatchMedia);
      expect(global.fetch).toBe(mockFetch);
      expect(global.WebSocket).toBe(mockWebSocket);
      expect(global.EventSource).toBe(mockEventSource);
      expect(global.crypto).toBe(mockCrypto);
      expect(global.performance).toBe(mockPerformance);
      expect(global.URL).toBe(mockURL);
      expect(global.URLSearchParams).toBe(mockURLSearchParams);
      expect(global.FormData).toBe(mockFormData);
      expect(global.Headers).toBe(mockHeaders);
      expect(global.AbortController).toBe(mockAbortController);
      expect(global.AbortSignal).toBe(mockAbortSignal);
      expect(global.ResizeObserver).toBe(mockResizeObserver);
      expect(global.IntersectionObserver).toBe(mockIntersectionObserver);
      expect(global.MutationObserver).toBe(mockMutationObserver);
      expect(global.PerformanceObserver).toBe(mockPerformanceObserver);
      expect(global.requestAnimationFrame).toBe(mockRequestAnimationFrame);
      expect(global.cancelAnimationFrame).toBe(mockCancelAnimationFrame);
    });
  });

  describe('resetBrowserMocks', () => {
    it('should clear all mocks and reset values', () => {
      // Set up some mock values
      mockLocalStorage.getItem.mockReturnValue('test');
      mockSessionStorage.getItem.mockReturnValue('test');
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: 'test',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });
      
      resetBrowserMocks();
      
      expect(mockLocalStorage.getItem()).toBeNull();
      expect(mockSessionStorage.getItem()).toBeNull();
      expect(mockMatchMedia('test').matches).toBe(false);
    });
  });
});
