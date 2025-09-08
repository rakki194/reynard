import { it, expect } from 'vitest';
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
} from '../index';

export function testBrowserExports() {
  it('should export all browser mocks', () => {
    expect(mockLocalStorage).toBeDefined();
    expect(mockSessionStorage).toBeDefined();
    expect(mockMatchMedia).toBeDefined();
    expect(mockResizeObserver).toBeDefined();
    expect(mockIntersectionObserver).toBeDefined();
    expect(mockMutationObserver).toBeDefined();
    expect(mockPerformanceObserver).toBeDefined();
    expect(mockRequestAnimationFrame).toBeDefined();
    expect(mockCancelAnimationFrame).toBeDefined();
    expect(mockFetch).toBeDefined();
    expect(mockWebSocket).toBeDefined();
    expect(mockEventSource).toBeDefined();
    expect(mockCrypto).toBeDefined();
    expect(mockPerformance).toBeDefined();
    expect(mockURL).toBeDefined();
    expect(mockURLSearchParams).toBeDefined();
    expect(mockFormData).toBeDefined();
    expect(mockHeaders).toBeDefined();
    expect(mockAbortController).toBeDefined();
    expect(mockAbortSignal).toBeDefined();
    expect(mockNavigator).toBeDefined();
    expect(mockWindow).toBeDefined();
    expect(setupBrowserMocks).toBeDefined();
    expect(resetBrowserMocks).toBeDefined();
  });
}

