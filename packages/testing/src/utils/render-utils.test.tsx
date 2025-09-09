/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Component, createSignal } from "solid-js";
import { render, screen } from "@solidjs/testing-library";
import { setupBrowserMocks, resetBrowserMocks } from "../mocks/browser-mocks";
import {
  renderWithTheme,
  renderWithRouter,
  renderWithNotifications,
  renderWithAllProviders,
  renderWithWrapper,
  renderWithProviders,
  renderWithErrorBoundary,
  renderWithSuspense,
  renderWithPerformanceMonitoring,
} from "./render-utils";

describe("Render Utilities", () => {
  const TestComponent: Component = () => (
    <div data-testid="test-component">Hello World</div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    setupBrowserMocks();
  });

  afterEach(() => {
    resetBrowserMocks();
  });

  describe("renderWithTheme", () => {
    it("should render component with theme provider", () => {
      const theme = { name: "dark", colors: { primary: "#000" } };

      renderWithTheme(() => <TestComponent />, theme);

      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should use default theme when none provided", () => {
      renderWithTheme(() => <TestComponent />);

      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should accept render options", () => {
      const theme = { name: "light", colors: {} };

      const result = renderWithTheme(() => <TestComponent />, theme, {
        container: document.createElement("div"),
      });

      expect(result.container).toBeInTheDocument();
    });
  });

  describe("renderWithRouter", () => {
    it("should render component with router context", () => {
      renderWithRouter(() => <TestComponent />);

      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should use custom initial URL", () => {
      renderWithRouter(() => <TestComponent />, "/custom-path");

      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should accept render options", () => {
      const result = renderWithRouter(() => <TestComponent />, "/", {
        container: document.createElement("div"),
      });

      expect(result.container).toBeInTheDocument();
    });
  });

  describe("renderWithNotifications", () => {
    it("should render component with notifications provider", () => {
      renderWithNotifications(() => <TestComponent />);

      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should accept render options", () => {
      const result = renderWithNotifications(() => <TestComponent />, {
        container: document.createElement("div"),
      });

      expect(result.container).toBeInTheDocument();
    });
  });

  describe("renderWithAllProviders", () => {
    it("should render component with all providers", () => {
      renderWithAllProviders(() => <TestComponent />);

      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should use custom options", () => {
      const theme = { name: "dark", colors: { primary: "#000" } };
      const notifications = { addNotification: vi.fn() };

      renderWithAllProviders(() => <TestComponent />, {
        theme,
        initialUrl: "/custom",
        notifications,
      });

      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should use default options when none provided", () => {
      renderWithAllProviders(() => <TestComponent />);

      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should accept render options", () => {
      const result = renderWithAllProviders(
        () => <TestComponent />,
        {},
        {
          container: document.createElement("div"),
        },
      );

      expect(result.container).toBeInTheDocument();
    });
  });

  describe("renderWithWrapper", () => {
    it("should render component with custom wrapper", () => {
      const CustomWrapper: Component<{ children: any; customProp?: string }> = (
        props,
      ) => (
        <div data-testid="wrapper" data-custom={props.customProp}>
          {props.children}
        </div>
      );

      renderWithWrapper(() => <TestComponent />, CustomWrapper, {
        customProp: "test",
      });

      expect(screen.getByTestId("wrapper")).toHaveAttribute(
        "data-custom",
        "test",
      );
      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should work with empty wrapper props", () => {
      const CustomWrapper: Component<{ children: any }> = (props) => (
        <div data-testid="wrapper">{props.children}</div>
      );

      renderWithWrapper(() => <TestComponent />, CustomWrapper);

      expect(screen.getByTestId("wrapper")).toBeInTheDocument();
      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should accept render options", () => {
      const CustomWrapper: Component<{ children: any }> = (props) => (
        <div>{props.children}</div>
      );

      const result = renderWithWrapper(
        () => <TestComponent />,
        CustomWrapper,
        {},
        {
          container: document.createElement("div"),
        },
      );

      expect(result.container).toBeInTheDocument();
    });
  });

  describe("renderWithProviders", () => {
    it("should render component with multiple providers", () => {
      const Provider1: Component<{ children: any }> = (props) => (
        <div data-testid="provider1">{props.children}</div>
      );
      const Provider2: Component<{ children: any }> = (props) => (
        <div data-testid="provider2">{props.children}</div>
      );

      renderWithProviders(() => <TestComponent />, [Provider1, Provider2]);

      expect(screen.getByTestId("provider1")).toBeInTheDocument();
      expect(screen.getByTestId("provider2")).toBeInTheDocument();
      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should work with single provider", () => {
      const Provider: Component<{ children: any }> = (props) => (
        <div data-testid="provider">{props.children}</div>
      );

      renderWithProviders(() => <TestComponent />, [Provider]);

      expect(screen.getByTestId("provider")).toBeInTheDocument();
      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should work with empty providers array", () => {
      renderWithProviders(() => <TestComponent />, []);

      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should accept render options", () => {
      const Provider: Component<{ children: any }> = (props) => (
        <div>{props.children}</div>
      );

      const result = renderWithProviders(() => <TestComponent />, [Provider], {
        container: document.createElement("div"),
      });

      expect(result.container).toBeInTheDocument();
    });
  });

  describe("renderWithErrorBoundary", () => {
    it("should render component with error boundary", () => {
      const onError = vi.fn();

      renderWithErrorBoundary(() => <TestComponent />, onError);

      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
      expect(onError).not.toHaveBeenCalled();
    });

    it("should call error handler when component throws", () => {
      const onError = vi.fn();
      const ErrorComponent: Component = () => {
        throw new Error("Test error");
      };

      renderWithErrorBoundary(() => <ErrorComponent />, onError);

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should use default error handler", () => {
      const ErrorComponent: Component = () => {
        throw new Error("Test error");
      };

      expect(() => {
        renderWithErrorBoundary(() => <ErrorComponent />);
      }).not.toThrow();
    });

    it("should accept render options", () => {
      const onError = vi.fn();

      const result = renderWithErrorBoundary(() => <TestComponent />, onError, {
        container: document.createElement("div"),
      });

      expect(result.container).toBeInTheDocument();
    });
  });

  describe("renderWithSuspense", () => {
    it("should render component with suspense provider", () => {
      renderWithSuspense(() => <TestComponent />);

      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should use custom fallback", () => {
      const customFallback = (
        <div data-testid="custom-fallback">Loading...</div>
      );

      renderWithSuspense(() => <TestComponent />, customFallback);

      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should use default fallback", () => {
      renderWithSuspense(() => <TestComponent />);

      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should accept render options", () => {
      const result = renderWithSuspense(() => <TestComponent />, undefined, {
        container: document.createElement("div"),
      });

      expect(result.container).toBeInTheDocument();
    });
  });

  describe("renderWithPerformanceMonitoring", () => {
    it("should render component with performance monitoring", () => {
      const onRender = vi.fn();

      renderWithPerformanceMonitoring(() => <TestComponent />, onRender);

      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should call onRender callback", async () => {
      const onRender = vi.fn();

      renderWithPerformanceMonitoring(() => <TestComponent />, onRender);

      // Wait for the setTimeout to execute
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(onRender).toHaveBeenCalledWith(expect.any(Number));
    });

    it("should use default onRender callback", () => {
      renderWithPerformanceMonitoring(() => <TestComponent />);

      expect(screen.getByTestId("test-component")).toHaveTextContent(
        "Hello World",
      );
    });

    it("should accept render options", () => {
      const onRender = vi.fn();

      const result = renderWithPerformanceMonitoring(
        () => <TestComponent />,
        onRender,
        {
          container: document.createElement("div"),
        },
      );

      expect(result.container).toBeInTheDocument();
    });
  });

  describe("integration tests", () => {
    it("should work with reactive components", () => {
      const ReactiveComponent: Component = () => {
        const [count, setCount] = createSignal(0);
        return (
          <div>
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

      renderWithAllProviders(() => <ReactiveComponent />);

      expect(screen.getByTestId("count")).toHaveTextContent("0");

      const button = screen.getByTestId("increment");
      button.click();

      expect(screen.getByTestId("count")).toHaveTextContent("1");
    });

    it("should work with nested providers", () => {
      const NestedComponent: Component = () => (
        <div data-testid="nested">Nested</div>
      );

      const Provider1: Component<{ children: any }> = (props) => (
        <div data-testid="outer">{props.children}</div>
      );
      const Provider2: Component<{ children: any }> = (props) => (
        <div data-testid="inner">{props.children}</div>
      );

      renderWithProviders(() => <NestedComponent />, [Provider1, Provider2]);

      expect(screen.getByTestId("outer")).toBeInTheDocument();
      expect(screen.getByTestId("inner")).toBeInTheDocument();
      expect(screen.getByTestId("nested")).toHaveTextContent("Nested");
    });
  });
});
