import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Component, createSignal } from 'solid-js';
import { screen } from '@solidjs/testing-library';
import {
  renderWithTestProviders,
  useTestAppContext,
  createMockTestResource,
  createMockFn,
  renderWithErrorBoundary,
  renderWithPerformanceMonitoring,
  setupBrowserMocks,
  resetBrowserMocks,
  expectPromiseToResolve,
  expectFunctionToBeCalledWith,
} from '../index';

describe('End-to-End Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBrowserMocks();
  });

  afterEach(() => {
    resetBrowserMocks();
  });

  it('should work together in a complete test scenario', async () => {
    // Setup browser mocks
    setupBrowserMocks();
    
    // Create a test component that uses context and mocks
    const TestComponent: Component = () => {
      const context = useTestAppContext();
      const [count, setCount] = createSignal(0);
      
      return (
        <div>
          <div data-testid="theme">{context.theme}</div>
          <div data-testid="count">{count()}</div>
          <button 
            data-testid="increment" 
            onClick={() => setCount(count() + 1)}
          >
            Increment
          </button>
        </div>
      );
    };
    
    // Render with test providers
    renderWithTestProviders(() => <TestComponent />);
    
    // Test initial state
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    
    // Test interaction
    const button = screen.getByTestId('increment');
    button.click();
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    
    // Test with mocks
    const mockFn = createMockFn();
    mockFn('test');
    expectFunctionToBeCalledWith(mockFn, 'test');
    
    // Test with resources
    const resource = createMockTestResource({ data: 'test' });
    expect(resource.latest.data).toBe('test');
    
    // Test with promises
    const promise = Promise.resolve('success');
    await expectPromiseToResolve(promise, 'success');
    
    // Cleanup
    resetBrowserMocks();
  });

  it('should work with error handling', () => {
    const onError = vi.fn();
    const ErrorComponent: Component = () => {
      throw new Error('Test error');
    };
    
    renderWithErrorBoundary(() => <ErrorComponent />, onError);
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should work with performance monitoring', async () => {
    const onRender = vi.fn();
    const TestComponent: Component = () => <div>Performance Test</div>;
    
    renderWithPerformanceMonitoring(() => <TestComponent />, onRender);
    
    // Wait for the setTimeout to execute
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(onRender).toHaveBeenCalledWith(expect.any(Number));
  });
});
