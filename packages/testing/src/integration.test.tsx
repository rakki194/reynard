import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Component, createSignal } from 'solid-js';
import { render, screen } from '@solidjs/testing-library';
import {
  // Configuration
  createBaseVitestConfig,
  createComponentTestConfig,
  createUtilityTestConfig,
  createIntegrationTestConfig,
  
  // Test utilities
  renderWithTestProviders,
  useTestAppContext,
  createMockTestResource,
  mockFns,
  mockAppContext,
  
  // Render utilities
  renderWithTheme,
  renderWithRouter,
  renderWithNotifications,
  renderWithAllProviders,
  renderWithWrapper,
  renderWithProviders,
  renderWithErrorBoundary,
  renderWithSuspense,
  renderWithPerformanceMonitoring,
  
  // Assertion utilities
  expectComponentToRender,
  expectComponentToThrow,
  expectPromiseToResolve,
  expectPromiseToReject,
  expectFunctionToBeCalledWith,
  expectFunctionToBeCalledTimes,
  expectFunctionNotToBeCalled,
  expectFunctionToBeCalled,
  expectValueToBeInRange,
  expectValueToBeApproximately,
  expectArrayToContain,
  expectArrayToHaveLength,
  expectObjectToHaveProperties,
  expectObjectToHaveValues,
  expectStringToMatch,
  expectStringToContain,
  expectElementToHaveAttributes,
  expectElementToHaveClasses,
  expectElementToHaveTextContent,
  expectElementToBeVisible,
  expectElementToBeHidden,
  expectElementToBeInTheDocument,
  expectElementNotToBeInTheDocument,
  expectElementToBeDisabled,
  expectElementToBeEnabled,
  expectElementToBeRequired,
  expectElementNotToBeRequired,
  expectElementToBeValid,
  expectElementToBeInvalid,
  expectElementToHaveFocus,
  expectElementNotToHaveFocus,
  expectElementToBeChecked,
  expectElementNotToBeChecked,
  expectElementToBePartiallyChecked,
  expectElementToHaveRole,
  expectElementToHaveAccessibleName,
  expectElementToHaveAccessibleDescription,
  
  // Mock utilities
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
  
  // Browser mocks
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
  
  // SolidJS mocks
  mockRouter,
  mockContext,
  createMockSolidResource,
} from './index';

describe('reynard-testing Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBrowserMocks();
  });

  afterEach(() => {
    resetBrowserMocks();
  });

  describe('Package Exports', () => {
    it('should export all configuration utilities', () => {
      expect(createBaseVitestConfig).toBeDefined();
      expect(createComponentTestConfig).toBeDefined();
      expect(createUtilityTestConfig).toBeDefined();
      expect(createIntegrationTestConfig).toBeDefined();
    });

    it('should export all test utilities', () => {
      expect(renderWithTestProviders).toBeDefined();
      expect(useTestAppContext).toBeDefined();
      expect(createMockTestResource).toBeDefined();
      expect(mockFns).toBeDefined();
      expect(mockAppContext).toBeDefined();
    });

    it('should export all render utilities', () => {
      expect(renderWithTheme).toBeDefined();
      expect(renderWithRouter).toBeDefined();
      expect(renderWithNotifications).toBeDefined();
      expect(renderWithAllProviders).toBeDefined();
      expect(renderWithWrapper).toBeDefined();
      expect(renderWithProviders).toBeDefined();
      expect(renderWithErrorBoundary).toBeDefined();
      expect(renderWithSuspense).toBeDefined();
      expect(renderWithPerformanceMonitoring).toBeDefined();
    });

    it('should export all assertion utilities', () => {
      expect(expectComponentToRender).toBeDefined();
      expect(expectComponentToThrow).toBeDefined();
      expect(expectPromiseToResolve).toBeDefined();
      expect(expectPromiseToReject).toBeDefined();
      expect(expectFunctionToBeCalledWith).toBeDefined();
      expect(expectFunctionToBeCalledTimes).toBeDefined();
      expect(expectFunctionNotToBeCalled).toBeDefined();
      expect(expectFunctionToBeCalled).toBeDefined();
      expect(expectValueToBeInRange).toBeDefined();
      expect(expectValueToBeApproximately).toBeDefined();
      expect(expectArrayToContain).toBeDefined();
      expect(expectArrayToHaveLength).toBeDefined();
      expect(expectObjectToHaveProperties).toBeDefined();
      expect(expectObjectToHaveValues).toBeDefined();
      expect(expectStringToMatch).toBeDefined();
      expect(expectStringToContain).toBeDefined();
      expect(expectElementToHaveAttributes).toBeDefined();
      expect(expectElementToHaveClasses).toBeDefined();
      expect(expectElementToHaveTextContent).toBeDefined();
      expect(expectElementToBeVisible).toBeDefined();
      expect(expectElementToBeHidden).toBeDefined();
      expect(expectElementToBeInTheDocument).toBeDefined();
      expect(expectElementNotToBeInTheDocument).toBeDefined();
      expect(expectElementToBeDisabled).toBeDefined();
      expect(expectElementToBeEnabled).toBeDefined();
      expect(expectElementToBeRequired).toBeDefined();
      expect(expectElementNotToBeRequired).toBeDefined();
      expect(expectElementToBeValid).toBeDefined();
      expect(expectElementToBeInvalid).toBeDefined();
      expect(expectElementToHaveFocus).toBeDefined();
      expect(expectElementNotToHaveFocus).toBeDefined();
      expect(expectElementToBeChecked).toBeDefined();
      expect(expectElementNotToBeChecked).toBeDefined();
      expect(expectElementToBePartiallyChecked).toBeDefined();
      expect(expectElementToHaveRole).toBeDefined();
      expect(expectElementToHaveAccessibleName).toBeDefined();
      expect(expectElementToHaveAccessibleDescription).toBeDefined();
    });

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

    it('should export all SolidJS mocks', () => {
      expect(mockRouter).toBeDefined();
      expect(mockContext).toBeDefined();
      expect(createMockSolidResource).toBeDefined();
    });
  });

  describe('Configuration Integration', () => {
    it('should create different config types with appropriate coverage thresholds', () => {
      const baseConfig = createBaseVitestConfig({ packageName: 'test' });
      const componentConfig = createComponentTestConfig('test');
      const utilityConfig = createUtilityTestConfig('test');
      const integrationConfig = createIntegrationTestConfig('test');
      
      // Component config should have higher thresholds than base
      expect((componentConfig.test?.coverage as any)?.thresholds?.global?.functions).toBeGreaterThan(
        (baseConfig.test?.coverage as any)?.thresholds?.global?.functions
      );
      
      // Utility config should have highest thresholds
      expect((utilityConfig.test?.coverage as any)?.thresholds?.global?.functions).toBeGreaterThan(
        (componentConfig.test?.coverage as any)?.thresholds?.global?.functions
      );
      
      // Integration config should have lower thresholds
      expect((integrationConfig.test?.coverage as any)?.thresholds?.global?.functions).toBeLessThan(
        (baseConfig.test?.coverage as any)?.thresholds?.global?.functions
      );
    });
  });

  describe('Test Utilities Integration', () => {
    it('should work together with render utilities', () => {
      const TestComponent: Component = () => {
        const context = useTestAppContext();
        return <div data-testid="test">{context.theme}</div>;
      };
      
      renderWithTestProviders(() => <TestComponent />);
      expect(screen.getByTestId('test')).toHaveTextContent('light');
    });

    it('should work with mock resources', () => {
      const testData = { id: 1, name: 'Test' };
      const resource = createMockTestResource(testData);
      
      expect(resource()).toEqual(testData);
      expect(resource.loading).toBe(false);
      expect(resource.state).toBe('ready');
    });

    it('should work with mock functions', async () => {
      const response = await mockFns.saveCaption();
      expect(response).toBeInstanceOf(Response);
    });
  });

  describe('Render Utilities Integration', () => {
    it('should work with multiple providers', () => {
      const TestComponent: Component = () => <div data-testid="test">Hello</div>;
      
      const Provider1: Component<{ children: any }> = (props) => (
        <div data-testid="provider1">{props.children}</div>
      );
      const Provider2: Component<{ children: any }> = (props) => (
        <div data-testid="provider2">{props.children}</div>
      );
      
      renderWithProviders(() => <TestComponent />, [Provider1, Provider2]);
      
      expect(screen.getByTestId('provider1')).toBeInTheDocument();
      expect(screen.getByTestId('provider2')).toBeInTheDocument();
      expect(screen.getByTestId('test')).toHaveTextContent('Hello');
    });

    it('should work with error boundaries', () => {
      const onError = vi.fn();
      const ErrorComponent: Component = () => {
        throw new Error('Test error');
      };
      
      renderWithErrorBoundary(() => <ErrorComponent />, onError);
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should work with performance monitoring', async () => {
      const onRender = vi.fn();
      const TestComponent: Component = () => <div>Test</div>;
      
      renderWithPerformanceMonitoring(() => <TestComponent />, onRender);
      
      // Wait for the setTimeout to execute
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(onRender).toHaveBeenCalledWith(expect.any(Number));
    });
  });

  describe('Assertion Utilities Integration', () => {
    it('should work with component testing', () => {
      const TestComponent: Component = () => <div>Hello World</div>;
      const ErrorComponent: Component = () => {
        throw new Error('Component error');
      };
      
      expectComponentToRender(() => TestComponent);
      expectComponentToThrow(() => ErrorComponent, 'Component error');
    });

    it('should work with promise testing', async () => {
      const successPromise = Promise.resolve('success');
      const errorPromise = Promise.reject(new Error('error'));
      
      await expectPromiseToResolve(successPromise, 'success');
      await expectPromiseToReject(errorPromise, 'error');
    });

    it('should work with function testing', () => {
      const mockFn = vi.fn();
      mockFn('arg1', 'arg2');
      
      expectFunctionToBeCalledWith(mockFn, 'arg1', 'arg2');
      expectFunctionToBeCalledTimes(mockFn, 1);
      expectFunctionToBeCalled(mockFn);
    });

    it('should work with value testing', () => {
      expectValueToBeInRange(5, 1, 10);
      expectValueToBeApproximately(1.234, 1.235, 2);
    });

    it('should work with array testing', () => {
      const array = [1, 2, 3, 4, 5];
      expectArrayToContain(array, 2, 4);
      expectArrayToHaveLength(array, 5);
    });

    it('should work with object testing', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expectObjectToHaveProperties(obj, 'a', 'b');
      expectObjectToHaveValues(obj, { a: 1, b: 2 });
    });

    it('should work with string testing', () => {
      const str = 'Hello World';
      expectStringToMatch(str, 'Hello');
      expectStringToContain(str, 'World');
    });

    it('should work with DOM element testing', () => {
      const element = document.createElement('div');
      element.setAttribute('id', 'test');
      element.className = 'test-class';
      element.textContent = 'Hello World';
      document.body.appendChild(element);
      
      expectElementToHaveAttributes(element, { id: 'test' });
      expectElementToHaveClasses(element, 'test-class');
      expectElementToHaveTextContent(element, 'Hello World');
      expectElementToBeInTheDocument(element);
      expectElementToBeVisible(element);
    });
  });

  describe('Mock Utilities Integration', () => {
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

  describe('End-to-End Integration', () => {
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

  describe('Type Safety', () => {
    it('should maintain type safety across all utilities', () => {
      // This test ensures that all utilities maintain their type safety
      // when used together
      
      const mockFn = createMockFn((x: number) => x * 2);
      expect(mockFn(5)).toBe(10);
      
      const mockObj = createMockObject<{ test: (x: string) => string }>(['test']);
      mockObj.test.mockReturnValue('mocked');
      expect(mockObj.test('input')).toBe('mocked');
      
      const resource = createMockSolidResource<{ id: number; name: string }>({
        id: 1,
        name: 'Test',
      });
      expect(resource.latest.id).toBe(1);
      expect(resource.latest.name).toBe('Test');
    });
  });
});
