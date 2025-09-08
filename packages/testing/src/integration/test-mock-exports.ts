import { it, expect } from 'vitest';
import {
  createMockFn,
  createMockObject,
  createMockResponse,
  createMockFetch,
  createMockWebSocket,
  createMockEventSource,
  createMockFile,
  createMockFileList,
  createMockDataTransfer,
  createMockIntersectionObserver,
  createMockResizeObserver,
  createMockMutationObserver,
  createMockPerformanceObserver,
  createMockCrypto,
  createMockMatchMedia,
  createMockRequestAnimationFrame,
  createMockCancelAnimationFrame,
} from '../index';

export function testMockExports() {
  it('should export all mock utilities', () => {
    expect(createMockFn).toBeDefined();
    expect(createMockObject).toBeDefined();
    expect(createMockResponse).toBeDefined();
    expect(createMockFetch).toBeDefined();
    expect(createMockWebSocket).toBeDefined();
    expect(createMockEventSource).toBeDefined();
    expect(createMockFile).toBeDefined();
    expect(createMockFileList).toBeDefined();
    expect(createMockDataTransfer).toBeDefined();
    expect(createMockIntersectionObserver).toBeDefined();
    expect(createMockResizeObserver).toBeDefined();
    expect(createMockMutationObserver).toBeDefined();
    expect(createMockPerformanceObserver).toBeDefined();
    expect(createMockCrypto).toBeDefined();
    expect(createMockMatchMedia).toBeDefined();
    expect(createMockRequestAnimationFrame).toBeDefined();
    expect(createMockCancelAnimationFrame).toBeDefined();
  });
}
