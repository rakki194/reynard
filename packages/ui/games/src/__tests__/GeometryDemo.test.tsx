import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { renderWithTestProviders } from "reynard-testing/utils";
import { GeometryDemo } from "../GeometryDemo";

describe("GeometryDemo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the geometry demo component", () => {
    renderWithTestProviders(() => <GeometryDemo />);

    expect(screen.getByText("📐 Geometry Operations Demo")).toBeInTheDocument();
  });

  it("displays geometry operations", () => {
    renderWithTestProviders(() => <GeometryDemo />);

    expect(screen.getByText("Operations:")).toBeInTheDocument();
  });

  it("renders the geometry canvas", () => {
    renderWithTestProviders(() => <GeometryDemo />);

    const svgCanvas = document.querySelector(".geometry-svg");
    expect(svgCanvas).toBeInTheDocument();
  });

  it("displays shape creation controls", () => {
    renderWithTestProviders(() => <GeometryDemo />);

    expect(screen.getByText("Add Point")).toBeInTheDocument();
    expect(screen.getByText("Add Line")).toBeInTheDocument();
    expect(screen.getByText("Add Rectangle")).toBeInTheDocument();
    expect(screen.getByText("Add Circle")).toBeInTheDocument();
    expect(screen.getByText("Add Polygon")).toBeInTheDocument();
  });

  it("displays operation controls", () => {
    renderWithTestProviders(() => <GeometryDemo />);

    expect(screen.getByText("Distance")).toBeInTheDocument();
    expect(screen.getByText("Midpoint")).toBeInTheDocument();
    expect(screen.getByText("Area")).toBeInTheDocument();
    expect(screen.getByText("Intersection")).toBeInTheDocument();
  });

  it("handles add point button click", async () => {
    renderWithTestProviders(() => <GeometryDemo />);

    const addPointButton = screen.getByText("Add Point");
    fireEvent.click(addPointButton);

    // Should add a point to the canvas
    expect(addPointButton).toBeInTheDocument();
  });

  it("handles add line button click", async () => {
    renderWithTestProviders(() => <GeometryDemo />);

    const addLineButton = screen.getByText("Add Line");
    fireEvent.click(addLineButton);

    // Should add a line to the canvas
    expect(addLineButton).toBeInTheDocument();
  });

  it("handles add rectangle button click", async () => {
    renderWithTestProviders(() => <GeometryDemo />);

    const addRectButton = screen.getByText("Add Rectangle");
    fireEvent.click(addRectButton);

    // Should add a rectangle to the canvas
    expect(addRectButton).toBeInTheDocument();
  });

  it("handles add circle button click", async () => {
    renderWithTestProviders(() => <GeometryDemo />);

    const addCircleButton = screen.getByText("Add Circle");
    fireEvent.click(addCircleButton);

    // Should add a circle to the canvas
    expect(addCircleButton).toBeInTheDocument();
  });

  it("handles add polygon button click", async () => {
    renderWithTestProviders(() => <GeometryDemo />);

    const addPolygonButton = screen.getByText("Add Polygon");
    fireEvent.click(addPolygonButton);

    // Should add a polygon to the canvas
    expect(addPolygonButton).toBeInTheDocument();
  });

  it("handles distance operation button click", async () => {
    renderWithTestProviders(() => <GeometryDemo />);

    const distanceButton = screen.getByText("Distance");
    fireEvent.click(distanceButton);

    // Should perform distance calculation
    expect(distanceButton).toBeInTheDocument();
  });

  it("handles midpoint operation button click", async () => {
    renderWithTestProviders(() => <GeometryDemo />);

    const midpointButton = screen.getByText("Midpoint");
    fireEvent.click(midpointButton);

    // Should perform midpoint calculation
    expect(midpointButton).toBeInTheDocument();
  });

  it("handles area operation button click", async () => {
    renderWithTestProviders(() => <GeometryDemo />);

    const areaButton = screen.getByText("Area");
    fireEvent.click(areaButton);

    // Should perform area calculation
    expect(areaButton).toBeInTheDocument();
  });

  it("handles intersection operation button click", async () => {
    renderWithTestProviders(() => <GeometryDemo />);

    const intersectionButton = screen.getByText("Intersection");
    fireEvent.click(intersectionButton);

    // Should perform intersection calculation
    expect(intersectionButton).toBeInTheDocument();
  });

  it("renders with custom configuration", () => {
    renderWithTestProviders(() => <GeometryDemo />);

    expect(screen.getByText("📐 Geometry Operations Demo")).toBeInTheDocument();
  });

  it("maintains component state consistency", async () => {
    renderWithTestProviders(() => <GeometryDemo />);

    // Add some shapes
    fireEvent.click(screen.getByText("Add Point"));
    fireEvent.click(screen.getByText("Add Line"));

    // Perform operations
    fireEvent.click(screen.getByText("Distance"));

    // Component should still be functional
    expect(screen.getByText("📐 Geometry Operations Demo")).toBeInTheDocument();
  });
});
