import { describe, it, expect, vi } from "vitest";
import { throttle, debounce } from "../../performance/throttle";

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should throttle function calls", () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    // Call multiple times rapidly
    throttledFn();
    throttledFn();
    throttledFn();

    // Only first call should execute immediately
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Fast forward time
    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(2);

    // Call again after throttle period
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it("should pass arguments to throttled function", () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn("arg1", "arg2");
    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("should maintain context (this)", () => {
    const obj = {
      value: 42,
      method: function () {
        return this.value;
      },
    };

    const throttledMethod = throttle(obj.method.bind(obj), 100);
    const result = throttledMethod();
    expect(result).toBe(42);
  });

  it("should handle immediate execution option", () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100, {
      leading: true,
      trailing: false,
    });

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    throttledFn();
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should handle trailing execution option", () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100, {
      leading: false,
      trailing: true,
    });

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(0);

    throttledFn();
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should debounce function calls", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    // Call multiple times rapidly
    debouncedFn();
    debouncedFn();
    debouncedFn();

    // Function should not be called yet
    expect(mockFn).toHaveBeenCalledTimes(0);

    // Fast forward time
    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should pass arguments to debounced function", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn("arg1", "arg2");
    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("should maintain context (this)", () => {
    const obj = {
      value: 42,
      method: vi.fn(function () {
        return this.value;
      }),
    };

    const debouncedMethod = debounce(obj.method.bind(obj), 100);
    debouncedMethod();
    vi.advanceTimersByTime(100);
    expect(obj.method).toHaveBeenCalled();
  });

  it("should handle immediate execution option", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100, {
      leading: true,
      trailing: false,
    });

    debouncedFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    debouncedFn();
    debouncedFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should handle trailing execution option", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100, {
      leading: false,
      trailing: true,
    });

    debouncedFn();
    expect(mockFn).toHaveBeenCalledTimes(0);

    debouncedFn();
    debouncedFn();
    expect(mockFn).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should cancel previous calls when new call is made", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    vi.advanceTimersByTime(50);

    debouncedFn(); // This should cancel the previous call
    vi.advanceTimersByTime(50);
    expect(mockFn).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(50);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
