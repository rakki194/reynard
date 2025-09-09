/**
 * ErrorBoundary Component Tests
 * Comprehensive test suite for the ErrorBoundary component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "reynard-testing";
import { ErrorBoundary, withErrorBoundary } from "./ErrorBoundary";
import { builtInRecoveryStrategies } from "../utils/RecoveryStrategies";

// Mock component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

// Mock component that throws async error
const ThrowAsyncError = () => {
  throw new Error("Async error");
};

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

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render children when no error occurs", () => {
    render(() => (
      <ErrorBoundary>
        <div>No error content</div>
      </ErrorBoundary>
    ));

    expect(screen.getByText("No error content")).toBeInTheDocument();
  });

  it("should catch and display errors", () => {
    render(() => (
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    ));

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("should call onError callback when error occurs", () => {
    const onError = vi.fn();

    render(() => (
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    ));

    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object));
  });

  it("should display recovery actions when available", () => {
    render(() => (
      <ErrorBoundary recoveryStrategies={[mockRecoveryStrategy]}>
        <ThrowError />
      </ErrorBoundary>
    ));

    expect(screen.getByText("Recovery Options")).toBeInTheDocument();
    expect(screen.getByText("Test Recovery")).toBeInTheDocument();
  });

  it("should execute recovery action when clicked", async () => {
    const onRecovery = vi.fn();

    render(() => (
      <ErrorBoundary
        recoveryStrategies={[mockRecoveryStrategy]}
        onRecovery={onRecovery}
      >
        <ThrowError />
      </ErrorBoundary>
    ));

    const recoveryButton = screen.getByText("Test Recovery");
    fireEvent.click(recoveryButton);

    await waitFor(() => {
      expect(mockRecoveryStrategy.recover).toHaveBeenCalled();
      expect(onRecovery).toHaveBeenCalled();
    });
  });

  it("should retry when retry button is clicked", () => {
    render(() => (
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    ));

    // Initially shows error
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Click retry
    const retryButton = screen.getByText("Try Again");
    fireEvent.click(retryButton);

    // Should show children again (no error)
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("should reset when reset button is clicked", () => {
    render(() => (
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    ));

    // Initially shows error
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Click reset
    const resetButton = screen.getByText("Reset");
    fireEvent.click(resetButton);

    // Should show children again (no error)
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("should show technical details when expanded", () => {
    render(() => (
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    ));

    const detailsSummary = screen.getByText("Technical Details");
    fireEvent.click(detailsSummary);

    expect(screen.getByText("Error Information")).toBeInTheDocument();
    expect(screen.getByText("Name:")).toBeInTheDocument();
    expect(screen.getByText("Message:")).toBeInTheDocument();
  });

  it("should handle user report submission", () => {
    render(() => (
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    ));

    const textarea = screen.getByPlaceholderText(
      "Describe what you were doing when this error occurred...",
    );
    const reportButton = screen.getByText("Send Report");

    // Initially disabled
    expect(reportButton).toBeDisabled();

    // Type in textarea
    fireEvent.input(textarea, { target: { value: "Test user report" } });

    // Should be enabled now
    expect(reportButton).not.toBeDisabled();

    // Click report button
    fireEvent.click(reportButton);
  });

  it("should use custom fallback component when provided", () => {
    const CustomFallback = ({ error }: { error: Error }) => (
      <div>Custom error: {error.message}</div>
    );

    render(() => (
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError />
      </ErrorBoundary>
    ));

    expect(screen.getByText("Custom error: Test error")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("should handle global errors when isolate is true", () => {
    const onError = vi.fn();

    render(() => (
      <ErrorBoundary isolate={true} onError={onError}>
        <div>No error</div>
      </ErrorBoundary>
    ));

    // Simulate global error
    const errorEvent = new ErrorEvent("error", {
      message: "Global error",
      filename: "test.js",
      lineno: 1,
      colno: 1,
    });

    window.dispatchEvent(errorEvent);

    expect(onError).toHaveBeenCalled();
  });

  it("should handle unhandled promise rejections when isolate is true", () => {
    const onError = vi.fn();

    render(() => (
      <ErrorBoundary isolate={true} onError={onError}>
        <div>No error</div>
      </ErrorBoundary>
    ));

    // Simulate unhandled promise rejection
    const rejectionEvent = new PromiseRejectionEvent("unhandledrejection", {
      promise: Promise.reject("Test rejection"),
      reason: "Test rejection",
    });

    window.dispatchEvent(rejectionEvent);

    expect(onError).toHaveBeenCalled();
  });
});

describe("withErrorBoundary HOC", () => {
  it("should wrap component with error boundary", () => {
    const WrappedComponent = withErrorBoundary(ThrowError, {
      onError: vi.fn(),
    });

    render(() => <WrappedComponent />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should pass props to wrapped component", () => {
    const WrappedComponent = withErrorBoundary(ThrowError, {
      onError: vi.fn(),
    });

    render(() => <WrappedComponent shouldThrow={false} />);

    expect(screen.getByText("No error")).toBeInTheDocument();
  });
});

describe("Error Boundary with Built-in Strategies", () => {
  it("should use built-in recovery strategies", () => {
    render(() => (
      <ErrorBoundary recoveryStrategies={builtInRecoveryStrategies}>
        <ThrowError />
      </ErrorBoundary>
    ));

    expect(screen.getByText("Recovery Options")).toBeInTheDocument();
    expect(screen.getByText("Retry Operation")).toBeInTheDocument();
  });

  it("should filter applicable strategies based on error type", () => {
    // Mock a network error
    const NetworkError = () => {
      const error = new Error("Network error");
      error.name = "NetworkError";
      throw error;
    };

    render(() => (
      <ErrorBoundary recoveryStrategies={builtInRecoveryStrategies}>
        <NetworkError />
      </ErrorBoundary>
    ));

    expect(screen.getByText("Recovery Options")).toBeInTheDocument();
    // Should show retry strategy for network errors
    expect(screen.getByText("Retry Operation")).toBeInTheDocument();
  });
});
