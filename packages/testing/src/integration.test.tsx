import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  // Configuration
  createBaseVitestConfig,
  createComponentTestConfig,
  createIntegrationTestConfig,
  createMockFn,
  createMockFunction,
  createMockObject,
  createUtilityTestConfig,
  mockAbortController,
  mockAbortSignal,
  mockCancelAnimationFrame,
  mockCrypto,
  mockEventSource,
  mockFetch,
  mockFormData,
  mockHeaders,
  mockIntersectionObserver,
  // Mock utilities
  mockLocalStorage,
  mockMatchMedia,
  mockMutationObserver,
  mockNavigator,
  mockPerformance,
  mockPerformanceObserver,
  mockRequestAnimationFrame,
  mockResizeObserver,
  mockSessionStorage,
  mockURL,
  mockURLSearchParams,
  mockWebSocket,
  mockWindow,
  // Test utilities
  renderWithAppContext,
  renderWithProviders,
  renderWithRouter,
  // Render utilities
  renderWithTheme,
  resetBrowserMocks,
  setupBrowserMocks,
  useTestAppContext,
} from "./index";

describe("reynard-testing Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBrowserMocks();
  });

  afterEach(() => {
    resetBrowserMocks();
  });

  describe("Package Exports", () => {
    it("should export all configuration utilities", () => {
      expect(createBaseVitestConfig).toBeDefined();
      expect(createComponentTestConfig).toBeDefined();
      expect(createUtilityTestConfig).toBeDefined();
      expect(createIntegrationTestConfig).toBeDefined();
    });

    it("should export all test utilities", () => {
      expect(renderWithAppContext).toBeDefined();
      expect(useTestAppContext).toBeDefined();
      expect(createMockFunction).toBeDefined();
      expect(createMockFn).toBeDefined();
      expect(createMockObject).toBeDefined();
    });

    it("should export all render utilities", () => {
      expect(renderWithTheme).toBeDefined();
      expect(renderWithRouter).toBeDefined();
      expect(renderWithProviders).toBeDefined();
    });

    it("should export all browser mocks", () => {
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
  });

  describe("Configuration Integration", () => {
    it("should create different config types with appropriate coverage thresholds", () => {
      const baseConfig = createBaseVitestConfig({ packageName: "test" });
      const componentConfig = createComponentTestConfig("test");
      const utilityConfig = createUtilityTestConfig("test");
      const integrationConfig = createIntegrationTestConfig("test");

      // Component config should have higher thresholds than base
      expect(
        (componentConfig.test?.coverage as any)?.thresholds?.global?.functions,
      ).toBeGreaterThan(
        (baseConfig.test?.coverage as any)?.thresholds?.global?.functions,
      );

      // Utility config should have highest thresholds
      expect(
        (utilityConfig.test?.coverage as any)?.thresholds?.global?.functions,
      ).toBeGreaterThan(
        (componentConfig.test?.coverage as any)?.thresholds?.global?.functions,
      );

      // Integration config should have lower or equal thresholds
      expect(
        (integrationConfig.test?.coverage as any)?.thresholds?.global
          ?.functions,
      ).toBeLessThanOrEqual(
        (baseConfig.test?.coverage as any)?.thresholds?.global?.functions,
      );
    });
  });

  describe("Mock Utilities Integration", () => {
    it("should work with browser mocks", () => {
      setupBrowserMocks();

      expect(global.localStorage).toBe(mockLocalStorage);
      expect(global.fetch).toBe(mockFetch);
      expect(global.WebSocket).toBe(mockWebSocket);

      resetBrowserMocks();
    });

    it("should work with custom mock functions", () => {
      const mockFn = createMockFn();
      mockFn("test");
      expect(mockFn).toHaveBeenCalledWith("test");
    });

    it("should work with mock objects", () => {
      const mockObj = createMockObject<{ test: () => string }>(["test"]);
      mockObj.test.mockReturnValue("mocked");

      const result = mockObj.test();
      expect(result).toBe("mocked");
      expect(mockObj.test).toHaveBeenCalled();
    });

    it("should work with enhanced mock functions", () => {
      const mockFn = createMockFunction();
      mockFn.mockReturnValue("test result");

      const result = mockFn();
      expect(result).toBe("test result");
      expect(mockFn).toHaveBeenCalled();
    });
  });

  describe("Type Safety", () => {
    it("should maintain type safety across all utilities", () => {
      // This test ensures that all utilities maintain their type safety
      // when used together

      const mockFn = createMockFn((x: number) => x * 2);
      expect(mockFn(5)).toBe(10);

      const mockObj = createMockObject<{ test: (x: string) => string }>([
        "test",
      ]);
      mockObj.test.mockReturnValue("mocked");
      expect(mockObj.test("input")).toBe("mocked");
    });
  });

  describe("Browser Mock Integration", () => {
    it("should properly setup and reset browser mocks", () => {
      // Test that mocks are properly set up
      setupBrowserMocks();

      expect(global.localStorage).toBe(mockLocalStorage);
      expect(global.fetch).toBe(mockFetch);
      expect(global.WebSocket).toBe(mockWebSocket);
      expect(global.crypto).toBe(mockCrypto);
      expect(global.performance).toBe(mockPerformance);

      // Test that mocks can be reset
      resetBrowserMocks();

      // After reset, the mocks should still be available but cleared
      expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(0);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    it("should work with fetch mocking", async () => {
      setupBrowserMocks();

      // Mock a successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: "test" }),
      } as any);

      const response = await fetch("/api/test");
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toEqual({ data: "test" });
      expect(mockFetch).toHaveBeenCalledWith("/api/test");

      resetBrowserMocks();
    });

    it("should work with localStorage mocking", () => {
      setupBrowserMocks();

      mockLocalStorage.getItem.mockReturnValue("test-value");
      mockLocalStorage.setItem.mockImplementation(() => {});

      const value = localStorage.getItem("test-key");
      localStorage.setItem("test-key", "test-value");

      expect(value).toBe("test-value");
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("test-key");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "test-key",
        "test-value",
      );

      resetBrowserMocks();
    });
  });
});
