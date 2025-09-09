import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Component } from "solid-js";
import { screen } from "@solidjs/testing-library";
import {
  renderWithProviders,
  renderWithErrorBoundary,
  renderWithPerformanceMonitoring,
  setupBrowserMocks,
  resetBrowserMocks,
} from "../index";

describe("Render Utilities Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBrowserMocks();
  });

  afterEach(() => {
    resetBrowserMocks();
  });

  it("should work with multiple providers", () => {
    const TestComponent: Component = () => <div data-testid="test">Hello</div>;

    const Provider1: Component<{ children: any }> = (props) => (
      <div data-testid="provider1">{props.children}</div>
    );
    const Provider2: Component<{ children: any }> = (props) => (
      <div data-testid="provider2">{props.children}</div>
    );

    renderWithProviders(() => <TestComponent />, [Provider1, Provider2]);

    expect(screen.getByTestId("provider1")).toBeInTheDocument();
    expect(screen.getByTestId("provider2")).toBeInTheDocument();
    expect(screen.getByTestId("test")).toHaveTextContent("Hello");
  });

  it("should work with error boundaries", () => {
    const onError = vi.fn();
    const ErrorComponent: Component = () => {
      throw new Error("Test error");
    };

    renderWithErrorBoundary(() => <ErrorComponent />, onError);
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should work with performance monitoring", async () => {
    const onRender = vi.fn();
    const TestComponent: Component = () => <div>Test</div>;

    renderWithPerformanceMonitoring(() => <TestComponent />, onRender);

    // Wait for the setTimeout to execute
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onRender).toHaveBeenCalledWith(expect.any(Number));
  });
});
