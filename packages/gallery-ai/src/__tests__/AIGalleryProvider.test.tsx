/**
 * AI Gallery Provider Tests
 *
 * Tests for the AIGalleryProvider component and useGalleryAI composable.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { AIGalleryProvider, useGalleryAI } from "../index";

// Mock the annotation service
vi.mock("reynard-annotating-core", () => ({
  getAnnotationServiceRegistry: () => ({
    getAnnotationService: () => null,
  }),
  createDefaultAnnotationService: () => ({
    start: vi.fn().mockResolvedValue(undefined),
    isInitialized: false,
    getAvailableGenerators: vi
      .fn()
      .mockResolvedValue([{ name: "jtp2" }, { name: "wdv3" }]),
  }),
}));

// Test component that uses the AI gallery context
const TestComponent = () => {
  const ai = useGalleryAI();

  return (
    <div>
      <span data-testid="ai-enabled">
        {ai.aiState().aiEnabled ? "enabled" : "disabled"}
      </span>
      <span data-testid="selected-generator">
        {ai.aiState().selectedGenerator}
      </span>
      <span data-testid="available-generators">
        {ai.getAvailableGenerators().join(",")}
      </span>
    </div>
  );
};

describe("AIGalleryProvider", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it("renders children with AI context", () => {
    render(() => (
      <AIGalleryProvider>
        <TestComponent />
      </AIGalleryProvider>
    ));

    expect(screen.getByTestId("ai-enabled")).toHaveTextContent("enabled");
    expect(screen.getByTestId("selected-generator")).toHaveTextContent("jtp2");
  });

  it("uses custom initial configuration", () => {
    render(() => (
      <AIGalleryProvider
        initialConfig={{
          defaultGenerator: "wdv3",
          aiEnabled: false,
        }}
      >
        <TestComponent />
      </AIGalleryProvider>
    ));

    expect(screen.getByTestId("ai-enabled")).toHaveTextContent("disabled");
    expect(screen.getByTestId("selected-generator")).toHaveTextContent("wdv3");
  });

  it("persists state to localStorage", () => {
    render(() => (
      <AIGalleryProvider persistState={true} storageKey="test-gallery">
        <TestComponent />
      </AIGalleryProvider>
    ));

    // Check that state was persisted
    const persistedState = localStorage.getItem(
      "test-gallery-selectedGenerator",
    );
    expect(persistedState).toBe('"jtp2"');
  });

  it("does not persist state when persistState is false", () => {
    render(() => (
      <AIGalleryProvider persistState={false} storageKey="test-gallery">
        <TestComponent />
      </AIGalleryProvider>
    ));

    // Check that state was not persisted
    const persistedState = localStorage.getItem(
      "test-gallery-selectedGenerator",
    );
    expect(persistedState).toBeNull();
  });
});

describe("useGalleryAI", () => {
  it("throws error when used outside provider", () => {
    expect(() => {
      render(() => <TestComponent />);
    }).toThrow("useAIGalleryContext must be used within an AIGalleryProvider");
  });
});
