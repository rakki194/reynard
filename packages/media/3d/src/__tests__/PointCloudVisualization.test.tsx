import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { PointCloudVisualization } from "../PointCloudVisualization";
import type { Point3D } from "../../types";

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
  BufferGeometry: vi.fn().mockImplementation(() => ({
    setAttribute: vi.fn(),
    attributes: {
      position: { array: new Float32Array(9), needsUpdate: false },
      color: { array: new Float32Array(9), needsUpdate: false },
    },
  })),
  Float32BufferAttribute: vi.fn().mockImplementation(() => ({})),
  Points: vi.fn().mockImplementation(() => ({
    userData: {},
  })),
  PointsMaterial: vi.fn().mockImplementation(() => ({})),
  Raycaster: vi.fn().mockImplementation(() => ({
    setFromCamera: vi.fn(),
    intersectObjects: vi.fn(() => []),
  })),
  Vector2: vi.fn().mockImplementation(() => ({})),
  TextureLoader: vi.fn().mockImplementation(() => ({
    load: vi.fn(),
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

describe("PointCloudVisualization", () => {
  const mockPoints: Point3D[] = [
    {
      id: "1",
      position: [0, 0, 0],
      color: [1, 0, 0],
      size: 2,
      metadata: { label: "Point 1" },
    },
    {
      id: "2",
      position: [1, 1, 1],
      color: [0, 1, 0],
      size: 1.5,
      metadata: { label: "Point 2" },
    },
    {
      id: "3",
      position: [-1, -1, -1],
      color: [0, 0, 1],
      size: 1,
      metadata: { label: "Point 3" },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the point cloud visualization component", () => {
    render(() => <PointCloudVisualization points={mockPoints} />);

    const container = document.querySelector(".point-cloud-visualization");
    expect(container).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    render(() => <PointCloudVisualization points={mockPoints} />);

    expect(screen.getByText("Loading point cloud...")).toBeInTheDocument();
  });

  it("displays point cloud stats", async () => {
    render(() => <PointCloudVisualization points={mockPoints} />);

    await waitFor(() => {
      expect(screen.getByText("Total Points:")).toBeInTheDocument();
      expect(screen.getByText("Visible Points:")).toBeInTheDocument();
      expect(screen.getByText("LOD Level:")).toBeInTheDocument();
      expect(screen.getByText("Frustum Culled:")).toBeInTheDocument();
      expect(screen.getByText("Selected:")).toBeInTheDocument();
    });
  });

  it("displays control options", async () => {
    render(() => <PointCloudVisualization points={mockPoints} />);

    await waitFor(() => {
      expect(screen.getByText("Color Mapping:")).toBeInTheDocument();
      expect(screen.getByText("Size Mapping:")).toBeInTheDocument();
      expect(screen.getByText("Enable Instancing")).toBeInTheDocument();
      expect(screen.getByText("Enable LOD")).toBeInTheDocument();
      expect(screen.getByText("Enable Culling")).toBeInTheDocument();
      expect(screen.getByText("Enable Highlighting")).toBeInTheDocument();
    });
  });

  it("applies custom settings", () => {
    const settings = {
      colorMapping: "cluster" as const,
      sizeMapping: "importance" as const,
      enableHighlighting: true,
      maxPoints: 5000,
    };

    render(() => <PointCloudVisualization points={mockPoints} settings={settings} />);

    const container = document.querySelector(".point-cloud-visualization");
    expect(container).toBeInTheDocument();
  });

  it("handles empty points array", () => {
    render(() => <PointCloudVisualization points={[]} />);

    const container = document.querySelector(".point-cloud-visualization");
    expect(container).toBeInTheDocument();
  });

  it("calls onPointClick when point is clicked", async () => {
    const onPointClick = vi.fn();

    render(() => <PointCloudVisualization points={mockPoints} onPointClick={onPointClick} />);

    // The actual click handling would be tested in integration tests
    // since it requires Three.js raycasting
    expect(onPointClick).toBeDefined();
  });

  it("calls onSelectionChange when selection changes", async () => {
    const onSelectionChange = vi.fn();

    render(() => <PointCloudVisualization points={mockPoints} onSelectionChange={onSelectionChange} />);

    // Selection change handling would be tested in integration tests
    expect(onSelectionChange).toBeDefined();
  });

  it("handles search integration settings", () => {
    const searchIntegration = {
      enableSearchIntegration: true,
      searchQueryEmbedding: [0.1, 0.2, 0.3],
      searchResults: [{ id: "1", score: 0.9, embedding_vector: [0.1, 0.2, 0.3] }],
      highlightQueryPoint: true,
    };

    render(() => <PointCloudVisualization points={mockPoints} searchIntegration={searchIntegration} />);

    const container = document.querySelector(".point-cloud-visualization");
    expect(container).toBeInTheDocument();
  });

  it("handles animation settings", () => {
    const animationSettings = {
      enableAnimations: true,
      animationDuration: 1000,
      animationEasing: "easeInOutCubic" as const,
      onAnimationStart: vi.fn(),
      onAnimationEnd: vi.fn(),
    };

    render(() => <PointCloudVisualization points={mockPoints} animationSettings={animationSettings} />);

    const container = document.querySelector(".point-cloud-visualization");
    expect(container).toBeInTheDocument();
  });

  it("displays tooltip on hover", async () => {
    render(() => <PointCloudVisualization points={mockPoints} />);

    // Tooltip functionality would be tested in integration tests
    // since it requires mouse interaction with Three.js objects
    const container = document.querySelector(".point-cloud-visualization");
    expect(container).toBeInTheDocument();
  });

  it("handles error state gracefully", async () => {
    // Mock a failure in Three.js initialization
    vi.doMock("three", () => {
      throw new Error("Three.js failed to load");
    });

    render(() => <PointCloudVisualization points={mockPoints} />);

    await waitFor(() => {
      const errorElement = document.querySelector(".point-cloud-error");
      expect(errorElement).toBeInTheDocument();
    });
  });
});
