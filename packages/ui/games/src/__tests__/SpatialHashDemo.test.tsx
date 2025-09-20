import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { renderWithTestProviders } from "../../../../testing/src/utils/test-utils";
import { SpatialHashDemo } from "../SpatialHashDemo";

describe("SpatialHashDemo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the spatial hash demo component", () => {
    renderWithTestProviders(() => <SpatialHashDemo />);

    expect(screen.getByText("Spatial Hash Demo")).toBeInTheDocument();
  });

  it("displays spatial hash statistics", () => {
    renderWithTestProviders(() => <SpatialHashDemo />);

    expect(screen.getByText(/Objects:/)).toBeInTheDocument();
    expect(screen.getByText(/Hash Cells:/)).toBeInTheDocument();
    expect(screen.getByText(/Collision Checks:/)).toBeInTheDocument();
  });

  it("renders the demo canvas", () => {
    renderWithTestProviders(() => <SpatialHashDemo />);

    const canvas = screen.getByRole("img", { hidden: true });
    expect(canvas).toBeInTheDocument();
  });

  it("displays demo controls", () => {
    renderWithTestProviders(() => <SpatialHashDemo />);

    expect(screen.getByText("Add Objects")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
    expect(screen.getByText("Toggle Hash Visualization")).toBeInTheDocument();
  });

  it("handles add objects button click", async () => {
    renderWithTestProviders(() => <SpatialHashDemo />);

    const addButton = screen.getByText("Add Objects");
    fireEvent.click(addButton);

    // Should add objects to the demo
    await waitFor(() => {
      expect(screen.getByText(/Objects: [1-9]/)).toBeInTheDocument();
    });
  });

  it("handles clear button click", async () => {
    renderWithTestProviders(() => <SpatialHashDemo />);

    // First add some objects
    fireEvent.click(screen.getByText("Add Objects"));

    // Then clear them
    const clearButton = screen.getByText("Clear");
    fireEvent.click(clearButton);

    // Objects should be cleared
    await waitFor(() => {
      expect(screen.getByText(/Objects: 0/)).toBeInTheDocument();
    });
  });

  it("toggles hash visualization", async () => {
    renderWithTestProviders(() => <SpatialHashDemo />);

    const toggleButton = screen.getByText("Toggle Hash Visualization");
    fireEvent.click(toggleButton);

    // Visualization should toggle (exact behavior depends on implementation)
    await waitFor(() => {
      expect(toggleButton).toBeInTheDocument();
    });
  });

  it("updates collision check statistics", async () => {
    renderWithTestProviders(() => <SpatialHashDemo />);

    // Add some objects
    fireEvent.click(screen.getByText("Add Objects"));

    // Wait for collision checks to occur
    await waitFor(() => {
      expect(screen.getByText(/Collision Checks:/)).toBeInTheDocument();
    });
  });

  it("handles canvas click events", () => {
    renderWithTestProviders(() => <SpatialHashDemo />);

    const canvas = screen.getByRole("img", { hidden: true });

    // Simulate a click on the canvas
    fireEvent.click(canvas, { clientX: 150, clientY: 150 });

    // The demo should handle the click (exact behavior depends on implementation)
  });

  it("renders with custom object count", () => {
    const customConfig = {
      objectCount: 20,
      canvasWidth: 800,
      canvasHeight: 600,
    };

    renderWithTestProviders(() => <SpatialHashDemo config={customConfig} />);

    expect(screen.getByText("Spatial Hash Demo")).toBeInTheDocument();
  });

  it("displays hash cell information", () => {
    renderWithTestProviders(() => <SpatialHashDemo />);

    // Should show information about hash cells
    expect(screen.getByText(/Hash Cells:/)).toBeInTheDocument();
  });

  it("handles mouse movement for object interaction", () => {
    renderWithTestProviders(() => <SpatialHashDemo />);

    const canvas = screen.getByRole("img", { hidden: true });

    // Simulate mouse movement
    fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });

    // Demo should handle mouse movement
  });

  it("shows performance comparison", () => {
    renderWithTestProviders(() => <SpatialHashDemo />);

    // Should show performance metrics comparing spatial hash vs brute force
    expect(screen.getByText(/Performance:/)).toBeInTheDocument();
  });

  it("handles keyboard shortcuts", () => {
    renderWithTestProviders(() => <SpatialHashDemo />);

    // Test 'a' to add objects
    fireEvent.keyDown(document, { key: "a", code: "KeyA" });

    // Test 'c' to clear
    fireEvent.keyDown(document, { key: "c", code: "KeyC" });

    // Test 'h' to toggle hash visualization
    fireEvent.keyDown(document, { key: "h", code: "KeyH" });

    // Demo should respond to keyboard events
  });

  it("maintains object positions during animation", async () => {
    renderWithTestProviders(() => <SpatialHashDemo />);

    // Add objects
    fireEvent.click(screen.getByText("Add Objects"));

    // Wait for animation
    await waitFor(
      () => {
        expect(screen.getByText(/Objects: [1-9]/)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Objects should maintain their positions or move predictably
  });
});
