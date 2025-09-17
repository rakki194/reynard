import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { ThreeJSVisualization } from "../ThreeJSVisualization";

// Mock Three.js
vi.mock("three", () => ({
  Scene: vi.fn().mockImplementation(() => ({
    background: null,
    add: vi.fn(),
    children: [],
  })),
  PerspectiveCamera: vi.fn().mockImplementation(() => ({
    position: { set: vi.fn(), clone: vi.fn() },
    lookAt: vi.fn(),
    aspect: 1,
    updateProjectionMatrix: vi.fn(),
  })),
  WebGLRenderer: vi.fn().mockImplementation(() => ({
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    shadowMap: { enabled: false, type: 1 },
    toneMapping: 1,
    toneMappingExposure: 1,
    outputColorSpace: 1,
    domElement: document.createElement("canvas"),
    render: vi.fn(),
    dispose: vi.fn(),
  })),
  AmbientLight: vi.fn().mockImplementation(() => ({})),
  DirectionalLight: vi.fn().mockImplementation(() => ({
    position: { set: vi.fn() },
    castShadow: false,
    shadow: {
      mapSize: { width: 2048, height: 2048 },
      camera: {
        near: 0.5,
        far: 50,
        left: -10,
        right: 10,
        top: 10,
        bottom: -10,
      },
    },
  })),
  PointLight: vi.fn().mockImplementation(() => ({
    position: { set: vi.fn() },
    castShadow: false,
  })),
  Color: vi.fn().mockImplementation(() => ({})),
  Vector3: vi.fn().mockImplementation(() => ({
    set: vi.fn(),
    lerpVectors: vi.fn(),
  })),
  Clock: vi.fn().mockImplementation(() => ({
    getDelta: vi.fn(() => 0.016),
  })),
  PCFSoftShadowMap: 1,
  ACESFilmicToneMapping: 1,
  SRGBColorSpace: 1,
}));

// Mock OrbitControls
vi.mock("three/examples/jsm/controls/OrbitControls.js", () => ({
  OrbitControls: vi.fn().mockImplementation(() => ({
    enableDamping: false,
    dampingFactor: 0.05,
    enableZoom: true,
    enablePan: true,
    enableRotate: true,
    minDistance: 0.1,
    maxDistance: 1000,
    maxPolarAngle: Math.PI,
    autoRotate: false,
    autoRotateSpeed: 2.0,
    zoomSpeed: 1.0,
    rotateSpeed: 1.0,
    panSpeed: 1.0,
    target: { set: vi.fn(), clone: vi.fn(), lerpVectors: vi.fn() },
    update: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispose: vi.fn(),
    enabled: true,
  })),
}));

describe("ThreeJSVisualization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the visualization component", () => {
    render(() => <ThreeJSVisualization />);

    const container = document.querySelector(".threejs-visualization");
    expect(container).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    render(() => <ThreeJSVisualization />);

    expect(screen.getByText("Loading 3D visualization...")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(() => <ThreeJSVisualization className="custom-class" />);

    const container = document.querySelector(".threejs-visualization.custom-class");
    expect(container).toBeInTheDocument();
  });

  it("sets custom dimensions", () => {
    render(() => <ThreeJSVisualization width={1200} height={800} />);

    const container = document.querySelector(".threejs-visualization");
    expect(container).toHaveStyle({
      width: "1200px",
      height: "800px",
    });
  });

  it("sets custom background color", () => {
    render(() => <ThreeJSVisualization backgroundColor="#ff0000" />);

    const container = document.querySelector(".threejs-visualization");
    expect(container).toHaveStyle({
      "background-color": "#ff0000",
    });
  });

  it("calls onSceneReady when scene is initialized", async () => {
    const onSceneReady = vi.fn();

    render(() => <ThreeJSVisualization onSceneReady={onSceneReady} />);

    // Wait for the scene to be initialized
    await waitFor(
      () => {
        expect(onSceneReady).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );
  });

  it("handles error state", async () => {
    // Mock a failure in Three.js initialization
    vi.doMock("three", () => {
      throw new Error("Three.js failed to load");
    });

    render(() => <ThreeJSVisualization />);

    // The component should handle the error gracefully
    await waitFor(() => {
      const errorElement = document.querySelector(".threejs-error");
      expect(errorElement).toBeInTheDocument();
    });
  });

  it("provides retry functionality on error", async () => {
    // Mock a failure in Three.js initialization
    vi.doMock("three", () => {
      throw new Error("Three.js failed to load");
    });

    render(() => <ThreeJSVisualization />);

    await waitFor(() => {
      const retryButton = screen.getByText("Retry");
      expect(retryButton).toBeInTheDocument();
    });
  });
});
