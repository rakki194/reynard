import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createMockFn,
  createMockObject,
  createMockSolidResource,
  mockLocalStorage,
  mockFetch,
  mockWebSocket,
  mockRouter,
  mockContext,
  setupBrowserMocks,
  resetBrowserMocks,
  expectFunctionToBeCalledWith,
  expectFunctionToBeCalled,
} from '../index';

describe('Mock Utilities Integration', () => {
  beforeEach(() => {
    setupBrowserMocks();
  });

  afterEach(() => {
    resetBrowserMocks();
  });

  it('should work with browser mocks', () => {
    setupBrowserMocks();
    
    expect(global.localStorage).toBe(mockLocalStorage);
    expect(global.fetch).toBe(mockFetch);
    expect(global.WebSocket).toBe(mockWebSocket);
    
    resetBrowserMocks();
  });

  it('should work with SolidJS mocks', () => {
    const resource = createMockSolidResource({ id: 1 });
    expect(resource.latest).toEqual({ id: 1 });
    
    expect(mockRouter.location.pathname).toBe('/');
    expect(mockContext.theme.name).toBe('light');
  });

  it('should work with custom mocks', () => {
    const mockFn = createMockFn();
    const mockObj = createMockObject<{ test: () => void }>(['test']);
    
    mockFn('test');
    mockObj.test();
    
    expectFunctionToBeCalledWith(mockFn, 'test');
    expectFunctionToBeCalled(mockObj.test);
  });
});
