import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Component, createSignal, createContext, useContext } from "solid-js";
import { render, screen } from "@solidjs/testing-library";
import { setupBrowserMocks, resetBrowserMocks } from "../mocks/browser-mocks";
import {
  renderWithTestProviders,
  useTestAppContext,
  createMockTestResource,
  mockFns,
  mockAppContext,
} from "./test-utils";

describe("Test Utilities", () => {
  describe("TestAppProvider and useTestAppContext", () => {
    it("should provide test app context to children", () => {
      const TestComponent: Component = () => {
        const context = useTestAppContext();
        return <div data-testid="context-test">{context.theme}</div>;
      };

      renderWithTestProviders(() => <TestComponent />);

      expect(screen.getByTestId("context-test")).toHaveTextContent("light");
    });

    it("should throw error when useTestAppContext is used outside provider", () => {
      const TestComponent: Component = () => {
        useTestAppContext();
        return <div>Test</div>;
      };

      expect(() => {
        render(() => <TestComponent />);
      }).toThrow("useTestAppContext must be used within TestAppProvider");
    });

    it("should provide all required context properties", () => {
      const TestComponent: Component = () => {
        const context = useTestAppContext();
        return (
          <div>
            <div data-testid="theme">{context.theme}</div>
            <div data-testid="locale">{context.locale}</div>
            <div data-testid="instant-delete">
              {context.instantDelete.toString()}
            </div>
            <div data-testid="disable-animations">
              {context.disableAnimations.toString()}
            </div>
          </div>
        );
      };

      renderWithTestProviders(() => <TestComponent />);

      expect(screen.getByTestId("theme")).toHaveTextContent("light");
      expect(screen.getByTestId("locale")).toHaveTextContent("en");
      expect(screen.getByTestId("instant-delete")).toHaveTextContent("false");
      expect(screen.getByTestId("disable-animations")).toHaveTextContent(
        "false",
      );
    });

    it("should provide translation function", () => {
      const TestComponent: Component = () => {
        const context = useTestAppContext();
        return <div data-testid="translation">{context.t("tools.undo")}</div>;
      };

      renderWithTestProviders(() => <TestComponent />);

      expect(screen.getByTestId("translation")).toHaveTextContent("Undo");
    });

    it("should provide fallback for unknown translation keys", () => {
      const TestComponent: Component = () => {
        const context = useTestAppContext();
        return <div data-testid="fallback">{context.t("unknown.key")}</div>;
      };

      renderWithTestProviders(() => <TestComponent />);

      expect(screen.getByTestId("fallback")).toHaveTextContent("unknown.key");
    });
  });

  describe("renderWithTestProviders", () => {
    it("should render component with test providers", () => {
      const TestComponent: Component = () => (
        <div data-testid="test">Hello World</div>
      );

      const result = renderWithTestProviders(() => <TestComponent />);

      expect(result.container).toBeInTheDocument();
      expect(screen.getByTestId("test")).toHaveTextContent("Hello World");
    });

    it("should accept render options", () => {
      const TestComponent: Component = () => (
        <div data-testid="test">Hello World</div>
      );

      const result = renderWithTestProviders(() => <TestComponent />, {
        container: document.createElement("div"),
      });

      expect(result.container).toBeInTheDocument();
    });
  });

  describe("createMockTestResource", () => {
    it("should create a mock resource with provided data", () => {
      const testData = { id: 1, name: "Test" };
      const resource = createMockTestResource(testData);

      expect(resource()).toEqual(testData);
      expect(resource.loading).toBe(false);
      expect(resource.error).toBeUndefined();
      expect(resource.latest).toEqual(testData);
      expect(resource.state).toBe("ready");
    });

    it("should create a mock resource with different data types", () => {
      const stringData = "test string";
      const resource = createMockTestResource(stringData);

      expect(resource()).toBe(stringData);
      expect(resource.latest).toBe(stringData);
    });

    it("should create a mock resource with array data", () => {
      const arrayData = [1, 2, 3];
      const resource = createMockTestResource(arrayData);

      expect(resource()).toEqual(arrayData);
      expect(resource.latest).toEqual(arrayData);
    });
  });

  describe("mockFns", () => {
    it("should provide mock functions for common operations", () => {
      expect(mockFns.saveCaption).toBeDefined();
      expect(mockFns.deleteCaption).toBeDefined();
      expect(mockFns.saveWithHistory).toBeDefined();
      expect(mockFns.undo).toBeDefined();
    });

    it("should have mockClear methods", () => {
      expect(mockFns.saveCaption.mockClear).toBeDefined();
      expect(mockFns.deleteCaption.mockClear).toBeDefined();
      expect(mockFns.saveWithHistory.mockClear).toBeDefined();
      expect(mockFns.undo.mockClear).toBeDefined();
    });

    it("should return Response objects when called", async () => {
      const response = await mockFns.saveCaption();
      expect(response).toBeInstanceOf(Response);
    });
  });

  describe("mockAppContext", () => {
    it("should provide translation function", () => {
      expect(mockAppContext.t("tools.undo")).toBe("Undo");
      expect(mockAppContext.t("unknown.key")).toBe("unknown.key");
    });

    it("should provide default theme", () => {
      expect(mockAppContext.theme).toBe("light");
    });

    it("should provide default settings", () => {
      expect(mockAppContext.preserveLatents).toBe(false);
      expect(mockAppContext.preserveTxt).toBe(false);
      expect(mockAppContext.enableZoom).toBe(true);
      expect(mockAppContext.enableMinimap).toBe(true);
    });

    it("should provide mock functions for setters", () => {
      expect(mockAppContext.setTheme).toBeDefined();
      expect(mockAppContext.setPreserveLatents).toBeDefined();
      expect(mockAppContext.setPreserveTxt).toBeDefined();
      expect(mockAppContext.setEnableZoom).toBeDefined();
      expect(mockAppContext.setEnableMinimap).toBeDefined();
    });

    it("should provide auth-related properties", () => {
      expect(mockAppContext.isLoggedIn).toBe(false);
      expect(mockAppContext.userRole).toBeNull();
      expect(mockAppContext.login).toBeDefined();
      expect(mockAppContext.logout).toBeDefined();
    });

    it("should provide notification functions", () => {
      expect(mockAppContext.createNotification).toBeDefined();
      expect(mockAppContext.notify).toBeDefined();
    });

    it("should provide jtp2 configuration", () => {
      expect(mockAppContext.jtp2.threshold).toBe(0.5);
      expect(mockAppContext.jtp2.forceCpu).toBe(false);
      expect(mockAppContext.jtp2.setThreshold).toBeDefined();
      expect(mockAppContext.jtp2.setForceCpu).toBeDefined();
    });

    it("should provide wdv3 configuration", () => {
      expect(mockAppContext.wdv3.modelName).toBe("");
      expect(mockAppContext.wdv3.genThreshold).toBe(0.5);
      expect(mockAppContext.wdv3.charThreshold).toBe(0.5);
      expect(mockAppContext.wdv3.forceCpu).toBe(false);
    });

    it("should provide tag bubble configuration", () => {
      expect(mockAppContext.tagBubbleFontSize).toBe(12);
      expect(mockAppContext.tagBubbleColorIntensity).toBe(0.5);
      expect(mockAppContext.tagBubbleBorderRadius).toBe(4);
      expect(mockAppContext.tagBubblePadding).toBe(4);
      expect(mockAppContext.tagBubbleSpacing).toBe(4);
      expect(mockAppContext.enableTagBubbleAnimations).toBe(true);
      expect(mockAppContext.enableTagBubbleShadows).toBe(true);
    });

    it("should provide bounding box configuration", () => {
      expect(mockAppContext.boundingBoxExportFormat).toBe("yolo");
      expect(mockAppContext.boundingBoxShowLabels).toBe(true);
      expect(mockAppContext.boundingBoxLabelFontSize).toBe(12);
      expect(mockAppContext.boundingBoxOpacity).toBe(0.5);
      expect(mockAppContext.boundingBoxBorderWidth).toBe(2);
      expect(mockAppContext.boundingBoxColorCodedLabels).toBe(false);
      expect(mockAppContext.boundingBoxAutoSave).toBe(true);
      expect(mockAppContext.boundingBoxConfirmDelete).toBe(true);
    });

    it("should provide system configuration", () => {
      expect(mockAppContext.thumbnailThreads).toBe(4);
      expect(mockAppContext.imageInfoThreads).toBe(4);
      expect(mockAppContext.maxCpuCores).toBe(4);
      expect(mockAppContext.fastIndexingMode).toBe(false);
      expect(mockAppContext.indexingEnabled).toBe(true);
    });

    it("should provide git configuration", () => {
      expect(mockAppContext.defaultGitignore).toBe("");
      expect(mockAppContext.gitLfsEnabled).toBe(false);
      expect(mockAppContext.gitLfsPatterns).toEqual([]);
      expect(mockAppContext.gitAuthorName).toBe("");
      expect(mockAppContext.gitAuthorEmail).toBe("");
    });
  });
});
