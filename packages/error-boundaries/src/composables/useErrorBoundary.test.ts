/**
 * useErrorBoundary Hook Tests
 * Test suite for the useErrorBoundary composable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "reynard-testing";
import { useErrorBoundary } from "./useErrorBoundary";
import { ErrorCategory, ErrorSeverity } from "../types/ErrorTypes";
import { RecoveryAction } from "../types/RecoveryTypes";

// Mock recovery strategy
const mockRecoveryStrategy = {
  id: "test-recovery",
  name: "Test Recovery",
  description: "Test recovery strategy",
  canRecover: vi.fn(() => true),
  recover: vi.fn().mockResolvedValue({
    success: true,
    action: "retry" as any,
    message: "Test recovery successful",
  }),
  priority: 1,
};

describe("useErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with no error state", () => {
    const { result } = renderHook(() => useErrorBoundary());

    expect(result.current.error()).toBeNull();
    expect(result.current.errorContext()).toBeNull();
    expect(result.current.isRecovering()).toBe(false);
    expect(result.current.recoveryActions()).toEqual([]);
  });

  it("should handle error and create context", () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useErrorBoundary({ onError }));

    const error = new Error("Test error");
    const errorInfo = { componentStack: "TestComponent" };

    act(() => {
      result.current.handleError(error, errorInfo);
    });

    expect(result.current.error()).toBe(error);
    expect(result.current.errorContext()).toBeDefined();
    expect(result.current.errorContext()?.componentStack).toEqual([
      "TestComponent",
    ]);
    expect(onError).toHaveBeenCalledWith(error, expect.any(Object));
  });

  it("should generate recovery actions from strategies", () => {
    const { result } = renderHook(() =>
      useErrorBoundary({ recoveryStrategies: [mockRecoveryStrategy] }),
    );

    const error = new Error("Test error");
    const errorInfo = { componentStack: "TestComponent" };

    act(() => {
      result.current.handleError(error, errorInfo);
    });

    const recoveryActions = result.current.recoveryActions();
    expect(recoveryActions).toHaveLength(1);
    expect(recoveryActions[0].id).toBe("test-recovery");
    expect(recoveryActions[0].name).toBe("Test Recovery");
  });

  it("should retry and clear error state", () => {
    const { result } = renderHook(() => useErrorBoundary());

    const error = new Error("Test error");
    const errorInfo = { componentStack: "TestComponent" };

    // Set error state
    act(() => {
      result.current.handleError(error, errorInfo);
    });

    expect(result.current.error()).toBe(error);

    // Retry
    act(() => {
      result.current.retry();
    });

    expect(result.current.error()).toBeNull();
    expect(result.current.errorContext()).toBeNull();
    expect(result.current.recoveryActions()).toEqual([]);
  });

  it("should reset and clear error state", () => {
    const { result } = renderHook(() => useErrorBoundary());

    const error = new Error("Test error");
    const errorInfo = { componentStack: "TestComponent" };

    // Set error state
    act(() => {
      result.current.handleError(error, errorInfo);
    });

    expect(result.current.error()).toBe(error);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.error()).toBeNull();
    expect(result.current.errorContext()).toBeNull();
    expect(result.current.recoveryActions()).toEqual([]);
  });

  it("should execute recovery action successfully", async () => {
    const onRecovery = vi.fn();
    const { result } = renderHook(() =>
      useErrorBoundary({
        recoveryStrategies: [mockRecoveryStrategy],
        onRecovery,
      }),
    );

    const error = new Error("Test error");
    const errorInfo = { componentStack: "TestComponent" };

    // Set error state
    act(() => {
      result.current.handleError(error, errorInfo);
    });

    const recoveryAction = result.current.recoveryActions()[0];

    // Execute recovery
    await act(async () => {
      await result.current.executeRecovery(recoveryAction);
    });

    expect(mockRecoveryStrategy.recover).toHaveBeenCalled();
    expect(onRecovery).toHaveBeenCalledWith(recoveryAction);
    expect(result.current.error()).toBeNull(); // Should be cleared after successful recovery
  });

  it("should handle recovery execution failure", async () => {
    const failingStrategy = {
      ...mockRecoveryStrategy,
      recover: vi.fn().mockResolvedValue({
        success: false,
        action: "retry" as any,
        error: new Error("Recovery failed"),
      }),
    };

    const { result } = renderHook(() =>
      useErrorBoundary({ recoveryStrategies: [failingStrategy] }),
    );

    const error = new Error("Test error");
    const errorInfo = { componentStack: "TestComponent" };

    // Set error state
    act(() => {
      result.current.handleError(error, errorInfo);
    });

    const recoveryAction = result.current.recoveryActions()[0];

    // Execute recovery
    await act(async () => {
      await result.current.executeRecovery(recoveryAction);
    });

    expect(failingStrategy.recover).toHaveBeenCalled();
    expect(result.current.error()).toBe(error); // Should still have error after failed recovery
  });

  it("should handle recovery strategy not found", async () => {
    const { result } = renderHook(() => useErrorBoundary());

    const error = new Error("Test error");
    const errorInfo = { componentStack: "TestComponent" };

    // Set error state
    act(() => {
      result.current.handleError(error, errorInfo);
    });

    const fakeRecoveryAction = {
      id: "non-existent",
      name: "Non-existent",
      description: "Non-existent strategy",
      action: "retry" as any,
      priority: 1,
    };

    // Execute recovery with non-existent strategy
    await act(async () => {
      await result.current.executeRecovery(fakeRecoveryAction);
    });

    expect(result.current.error()).toBe(error); // Should still have error
  });

  it("should handle recovery execution error", async () => {
    const errorStrategy = {
      ...mockRecoveryStrategy,
      recover: vi
        .fn()
        .mockRejectedValue(new Error("Strategy execution failed")),
    };

    const { result } = renderHook(() =>
      useErrorBoundary({ recoveryStrategies: [errorStrategy] }),
    );

    const error = new Error("Test error");
    const errorInfo = { componentStack: "TestComponent" };

    // Set error state
    act(() => {
      result.current.handleError(error, errorInfo);
    });

    const recoveryAction = result.current.recoveryActions()[0];

    // Execute recovery
    await act(async () => {
      await result.current.executeRecovery(recoveryAction);
    });

    expect(errorStrategy.recover).toHaveBeenCalled();
    expect(result.current.error()).toBe(error); // Should still have error
  });

  it("should clear error state directly", () => {
    const { result } = renderHook(() => useErrorBoundary());

    const error = new Error("Test error");
    const errorInfo = { componentStack: "TestComponent" };

    // Set error state
    act(() => {
      result.current.handleError(error, errorInfo);
    });

    expect(result.current.error()).toBe(error);

    // Clear error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error()).toBeNull();
    expect(result.current.errorContext()).toBeNull();
    expect(result.current.recoveryActions()).toEqual([]);
    expect(result.current.isRecovering()).toBe(false);
  });

  it("should set recovering state during recovery execution", async () => {
    const slowStrategy = {
      ...mockRecoveryStrategy,
      recover: vi.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  action: "retry" as any,
                }),
              100,
            ),
          ),
      ),
    };

    const { result } = renderHook(() =>
      useErrorBoundary({ recoveryStrategies: [slowStrategy] }),
    );

    const error = new Error("Test error");
    const errorInfo = { componentStack: "TestComponent" };

    // Set error state
    act(() => {
      result.current.handleError(error, errorInfo);
    });

    const recoveryAction = result.current.recoveryActions()[0];

    // Start recovery
    const recoveryPromise = act(async () => {
      await result.current.executeRecovery(recoveryAction);
    });

    // Check that recovering state is set
    expect(result.current.isRecovering()).toBe(true);

    // Wait for recovery to complete
    await recoveryPromise;

    // Check that recovering state is cleared
    expect(result.current.isRecovering()).toBe(false);
  });

  it("should handle global errors when isolate is true", () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useErrorBoundary({ isolate: true, onError }),
    );

    // Simulate global error
    const errorEvent = new ErrorEvent("error", {
      message: "Global error",
      filename: "test.js",
      lineno: 1,
      colno: 1,
    });

    act(() => {
      window.dispatchEvent(errorEvent);
    });

    expect(onError).toHaveBeenCalled();
  });

  it("should handle unhandled promise rejections when isolate is true", () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useErrorBoundary({ isolate: true, onError }),
    );

    // Simulate unhandled promise rejection
    const rejectionEvent = new PromiseRejectionEvent("unhandledrejection", {
      promise: Promise.reject("Test rejection"),
      reason: "Test rejection",
    });

    act(() => {
      window.dispatchEvent(rejectionEvent);
    });

    expect(onError).toHaveBeenCalled();
  });

  it("should not handle global errors when isolate is false", () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useErrorBoundary({ isolate: false, onError }),
    );

    // Simulate global error
    const errorEvent = new ErrorEvent("error", {
      message: "Global error",
      filename: "test.js",
      lineno: 1,
      colno: 1,
    });

    act(() => {
      window.dispatchEvent(errorEvent);
    });

    expect(onError).not.toHaveBeenCalled();
  });
});
