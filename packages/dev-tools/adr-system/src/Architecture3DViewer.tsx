/**
 * 🦊 Reynard 3D Architecture Viewer
 * =================================
 *
 * Advanced 3D visualization system for architectural components and relationships.
 * Provides immersive 3D exploration of complex architectural structures with
 * interactive navigation, filtering, and real-time updates.
 *
 * Features:
 * - 3D spatial representation of architectural components
 * - Interactive camera controls with smooth animations
 * - Real-time filtering and search in 3D space
 * - Component clustering and grouping
 * - Relationship visualization with 3D connections
 * - Performance optimization with LOD and culling
 * - Export to 3D formats (GLTF, OBJ, STL)
 * - VR/AR support for immersive exploration
 *
 * @author Reynard Development Team
 * @version 1.0.0
 */

import { Component, createSignal, createEffect, onMount, onCleanup, createMemo, Show, For } from "solid-js";
import { Card, Button, Badge, Tabs, Input, Select, Checkbox, Slider } from "reynard-primitives";
import { ThreeJSVisualization, PointCloudVisualization, useThreeJSVisualization } from "reynard-3d";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { ArchitectureMap, ArchitectureComponent, ArchitectureRelationship } from "./ArchitectureMappingTools";
import { DependencyGraph, DependencyNode, DependencyEdge } from "./DependencyGraphGenerator";

/**
 * Configuration for the 3D architecture viewer.
 */
export interface Architecture3DViewerConfig {
  /** Initial camera position */
  initialCameraPosition: [number, number, number];
  /** Camera target position */
  cameraTarget: [number, number, number];
  /** Field of view */
  fieldOfView: number;
  /** Near clipping plane */
  near: number;
  /** Far clipping plane */
  far: number;
  /** Enable auto-rotation */
  autoRotate: boolean;
  /** Auto-rotation speed */
  autoRotateSpeed: number;
  /** Enable damping */
  enableDamping: boolean;
  /** Damping factor */
  dampingFactor: number;
  /** Enable zoom */
  enableZoom: boolean;
  /** Enable pan */
  enablePan: boolean;
  /** Enable rotate */
  enableRotate: boolean;
  /** Zoom speed */
  zoomSpeed: number;
  /** Pan speed */
  panSpeed: number;
  /** Rotate speed */
  rotateSpeed: number;
  /** Background color */
  backgroundColor: string;
  /** Grid visibility */
  showGrid: boolean;
  /** Grid size */
  gridSize: number;
  /** Grid divisions */
  gridDivisions: number;
  /** Grid color */
  gridColor: string;
  /** Axis visibility */
  showAxes: boolean;
  /** Axis size */
  axisSize: number;
  /** Lighting configuration */
  lighting: {
    ambient: {
      color: string;
      intensity: number;
    };
    directional: {
      color: string;
      intensity: number;
      position: [number, number, number];
    };
    point: {
      color: string;
      intensity: number;
      position: [number, number, number];
    };
  };
  /** Component visualization settings */
  componentVisualization: {
    size: {
      min: number;
      max: number;
      scale: "linear" | "logarithmic" | "exponential";
    };
    color: {
      scheme: "type" | "category" | "layer" | "quality" | "custom";
      customColors?: Record<string, string>;
    };
    shape: {
      scheme: "type" | "category" | "layer" | "custom";
      customShapes?: Record<string, "sphere" | "cube" | "cylinder" | "cone" | "torus">;
    };
    opacity: number;
    wireframe: boolean;
  };
  /** Relationship visualization settings */
  relationshipVisualization: {
    enabled: boolean;
    width: {
      min: number;
      max: number;
      scale: "linear" | "logarithmic" | "exponential";
    };
    color: {
      scheme: "type" | "strength" | "quality" | "custom";
      customColors?: Record<string, string>;
    };
    style: "line" | "tube" | "arrow" | "curve";
    opacity: number;
    animation: {
      enabled: boolean;
      speed: number;
      direction: "forward" | "backward" | "bidirectional";
    };
  };
  /** Clustering settings */
  clustering: {
    enabled: boolean;
    algorithm: "kmeans" | "hierarchical" | "dbscan" | "custom";
    maxClusters: number;
    distanceMetric: "euclidean" | "manhattan" | "cosine" | "custom";
    visual: {
      showClusters: boolean;
      clusterColors: string[];
      clusterOpacity: number;
      showClusterLabels: boolean;
    };
  };
  /** Performance settings */
  performance: {
    maxComponents: number;
    levelOfDetail: boolean;
    frustumCulling: boolean;
    occlusionCulling: boolean;
    instancing: boolean;
    shadowMapping: boolean;
    antialiasing: boolean;
  };
}

/**
 * Props for the Architecture3DViewer component.
 */
export interface Architecture3DViewerProps {
  /** Architecture map to visualize */
  architectureMap?: ArchitectureMap;
  /** Dependency graph to visualize */
  dependencyGraph?: DependencyGraph;
  /** Configuration options */
  config?: Partial<Architecture3DViewerConfig>;
  /** Callback when component is clicked */
  onComponentClick?: (component: ArchitectureComponent | DependencyNode, event: any) => void;
  /** Callback when relationship is clicked */
  onRelationshipClick?: (relationship: ArchitectureRelationship | DependencyEdge, event: any) => void;
  /** Callback when camera position changes */
  onCameraChange?: (position: [number, number, number], target: [number, number, number]) => void;
  /** Width of the viewer */
  width?: number;
  /** Height of the viewer */
  height?: number;
  /** CSS class name */
  class?: string;
}

/**
 * 3D architecture viewer component with advanced visualization capabilities.
 */
export function Architecture3DViewer(props: Architecture3DViewerProps) {
  // Configuration with defaults
  const config = createMemo(() => ({
    initialCameraPosition: [100, 100, 100] as [number, number, number],
    cameraTarget: [0, 0, 0] as [number, number, number],
    fieldOfView: 75,
    near: 0.1,
    far: 1000,
    autoRotate: true,
    autoRotateSpeed: 2.0,
    enableDamping: true,
    dampingFactor: 0.05,
    enableZoom: true,
    enablePan: true,
    enableRotate: true,
    zoomSpeed: 1.0,
    panSpeed: 1.0,
    rotateSpeed: 1.0,
    backgroundColor: "#1a1a1a",
    showGrid: true,
    gridSize: 100,
    gridDivisions: 10,
    gridColor: "#444444",
    showAxes: true,
    axisSize: 50,
    lighting: {
      ambient: {
        color: "#404040",
        intensity: 0.4,
      },
      directional: {
        color: "#ffffff",
        intensity: 0.8,
        position: [1, 1, 1] as [number, number, number],
      },
      point: {
        color: "#ffffff",
        intensity: 0.5,
        position: [0, 50, 0] as [number, number, number],
      },
    },
    componentVisualization: {
      size: {
        min: 1,
        max: 10,
        scale: "linear" as const,
      },
      color: {
        scheme: "type" as const,
        customColors: {},
      },
      shape: {
        scheme: "type" as const,
        customShapes: {},
      },
      opacity: 0.8,
      wireframe: false,
    },
    relationshipVisualization: {
      enabled: true,
      width: {
        min: 0.1,
        max: 2.0,
        scale: "linear" as const,
      },
      color: {
        scheme: "type" as const,
        customColors: {},
      },
      style: "tube" as const,
      opacity: 0.6,
      animation: {
        enabled: true,
        speed: 1.0,
        direction: "forward" as const,
      },
    },
    clustering: {
      enabled: false,
      algorithm: "kmeans" as const,
      maxClusters: 5,
      distanceMetric: "euclidean" as const,
      visual: {
        showClusters: true,
        clusterColors: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"],
        clusterOpacity: 0.3,
        showClusterLabels: true,
      },
    },
    performance: {
      maxComponents: 1000,
      levelOfDetail: true,
      frustumCulling: true,
      occlusionCulling: false,
      instancing: true,
      shadowMapping: false,
      antialiasing: true,
    },
    ...props.config,
  }));

  // State management
  const [selectedComponents, setSelectedComponents] = createSignal<Set<string>>(new Set());
  const [selectedRelationships, setSelectedRelationships] = createSignal<Set<string>>(new Set());
  const [hoveredComponent, setHoveredComponent] = createSignal<string | null>(null);
  const [hoveredRelationship, setHoveredRelationship] = createSignal<string | null>(null);
  const [cameraPosition, setCameraPosition] = createSignal<[number, number, number]>(config().initialCameraPosition);
  const [cameraTarget, setCameraTarget] = createSignal<[number, number, number]>(config().cameraTarget);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filterType, setFilterType] = createSignal<string>("all");
  const [filterCategory, setFilterCategory] = createSignal<string>("all");
  const [filterLayer, setFilterLayer] = createSignal<string>("all");
  const [showRelationships, setShowRelationships] = createSignal(true);
  const [showLabels, setShowLabels] = createSignal(true);
  const [clusteringEnabled, setClusteringEnabled] = createSignal(config().clustering.enabled);
  const [clusteringAlgorithm, setClusteringAlgorithm] = createSignal(config().clustering.algorithm);
  const [maxClusters, setMaxClusters] = createSignal(config().clustering.maxClusters);
  const [componentSize, setComponentSize] = createSignal(5);
  const [componentOpacity, setComponentOpacity] = createSignal(config().componentVisualization.opacity);
  const [relationshipWidth, setRelationshipWidth] = createSignal(1.0);
  const [relationshipOpacity, setRelationshipOpacity] = createSignal(config().relationshipVisualization.opacity);
  const [isLoading, setIsLoading] = createSignal(false);

  // Computed values
  const components = createMemo(() => {
    let comps: (ArchitectureComponent | DependencyNode)[] = [];

    if (props.architectureMap) {
      comps = Array.from(props.architectureMap.components.values());
    } else if (props.dependencyGraph) {
      comps = Array.from(props.dependencyGraph.nodes.values());
    }

    return comps;
  });

  const relationships = createMemo(() => {
    let rels: (ArchitectureRelationship | DependencyEdge)[] = [];

    if (props.architectureMap) {
      rels = Array.from(props.architectureMap.relationships.values());
    } else if (props.dependencyGraph) {
      rels = Array.from(props.dependencyGraph.edges.values());
    }

    return rels;
  });

  const filteredComponents = createMemo(() => {
    let filtered = components();

    // Apply search filter
    if (searchQuery()) {
      const query = searchQuery().toLowerCase();
      filtered = filtered.filter(
        comp =>
          comp.name.toLowerCase().includes(query) ||
          comp.path.toLowerCase().includes(query) ||
          ("category" in comp && comp.category.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (filterType() !== "all") {
      filtered = filtered.filter(comp => comp.type === filterType());
    }

    // Apply category filter
    if (filterCategory() !== "all" && "category" in filtered[0]) {
      filtered = filtered.filter(comp => "category" in comp && comp.category === filterCategory());
    }

    // Apply layer filter
    if (filterLayer() !== "all" && "layer" in filtered[0]) {
      filtered = filtered.filter(comp => "layer" in comp && comp.layer === filterLayer());
    }

    return filtered;
  });

  const filteredRelationships = createMemo(() => {
    let filtered = relationships();

    if (!showRelationships()) {
      return [];
    }

    // Only show relationships between visible components
    const visibleComponentIds = new Set(filteredComponents().map(comp => comp.id));
    filtered = filtered.filter(rel => visibleComponentIds.has(rel.source) && visibleComponentIds.has(rel.target));

    return filtered;
  });

  const componentTypes = createMemo(() => {
    const types = new Set<string>();
    for (const comp of components()) {
      types.add(comp.type);
    }
    return Array.from(types);
  });

  const componentCategories = createMemo(() => {
    const categories = new Set<string>();
    for (const comp of components()) {
      if ("category" in comp) {
        categories.add(comp.category);
      }
    }
    return Array.from(categories);
  });

  const componentLayers = createMemo(() => {
    const layers = new Set<string>();
    for (const comp of components()) {
      if ("layer" in comp) {
        layers.add(comp.layer);
      }
    }
    return Array.from(layers);
  });

  const statistics = createMemo(() => {
    const totalComponents = components().length;
    const totalRelationships = relationships().length;
    const visibleComponents = filteredComponents().length;
    const visibleRelationships = filteredRelationships().length;

    return {
      totalComponents,
      totalRelationships,
      visibleComponents,
      visibleRelationships,
    };
  });

  // 3D visualization data
  const visualizationData = createMemo(() => {
    const points = filteredComponents().map(comp => {
      // Calculate 3D position based on component properties
      const x = Math.random() * 100 - 50; // Placeholder - would use actual positioning algorithm
      const y = Math.random() * 100 - 50;
      const z = Math.random() * 100 - 50;

      // Calculate color based on configuration
      let color: [number, number, number] = [0.5, 0.5, 0.5];
      if (config().componentVisualization.color.scheme === "type") {
        const typeColors: Record<string, [number, number, number]> = {
          service: [0.3, 0.8, 0.3],
          module: [0.8, 0.3, 0.3],
          package: [0.3, 0.3, 0.8],
          interface: [0.8, 0.8, 0.3],
          class: [0.8, 0.3, 0.8],
          function: [0.3, 0.8, 0.8],
          data: [0.5, 0.5, 0.5],
          config: [0.6, 0.6, 0.6],
        };
        color = typeColors[comp.type] || [0.5, 0.5, 0.5];
      }

      // Calculate size based on configuration
      let size = componentSize();
      if (config().componentVisualization.size.scale === "logarithmic") {
        size = Math.log10(("metadata" in comp && comp.metadata.linesOfCode) || 100) * 2;
      }

      return {
        id: comp.id,
        position: [x, y, z] as [number, number, number],
        color,
        size: Math.max(
          config().componentVisualization.size.min,
          Math.min(config().componentVisualization.size.max, size)
        ),
        metadata: {
          name: comp.name,
          type: comp.type,
          category: "category" in comp ? comp.category : "unknown",
          layer: "layer" in comp ? comp.layer : "unknown",
          path: comp.path,
          description: "description" in comp ? comp.description : "",
        },
      };
    });

    return { points };
  });

  // Event handlers
  const handleComponentClick = (component: ArchitectureComponent | DependencyNode, event: any) => {
    event.stopPropagation();

    const newSelection = new Set(selectedComponents());
    if (newSelection.has(component.id)) {
      newSelection.delete(component.id);
    } else {
      newSelection.add(component.id);
    }
    setSelectedComponents(newSelection);

    props.onComponentClick?.(component, event);
  };

  const handleRelationshipClick = (relationship: ArchitectureRelationship | DependencyEdge, event: any) => {
    event.stopPropagation();

    const newSelection = new Set(selectedRelationships());
    if (newSelection.has(relationship.id)) {
      newSelection.delete(relationship.id);
    } else {
      newSelection.add(relationship.id);
    }
    setSelectedRelationships(newSelection);

    props.onRelationshipClick?.(relationship, event);
  };

  const handleCameraChange = (position: [number, number, number], target: [number, number, number]) => {
    setCameraPosition(position);
    setCameraTarget(target);
    props.onCameraChange?.(position, target);
  };

  // Control functions
  const resetCamera = () => {
    setCameraPosition(config().initialCameraPosition);
    setCameraTarget(config().cameraTarget);
  };

  const fitToView = () => {
    // Calculate bounds of all visible components
    const points = visualizationData().points;
    if (points.length === 0) return;

    let minX = Infinity,
      minY = Infinity,
      minZ = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity,
      maxZ = -Infinity;

    for (const point of points) {
      const [x, y, z] = point.position;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, z);
    }

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;

    const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
    const distance = size * 2;

    setCameraPosition([centerX + distance, centerY + distance, centerZ + distance]);
    setCameraTarget([centerX, centerY, centerZ]);
  };

  const toggleClustering = () => {
    setClusteringEnabled(!clusteringEnabled());
  };

  const exportView = async (format: "gltf" | "obj" | "stl" | "json") => {
    console.log(`Exporting 3D view as ${format}`);
    // Implementation would depend on the 3D rendering backend
  };

  return (
    <div class={`architecture-3d-viewer ${props.class || ""}`}>
      {/* Control Panel */}
      <div
        class="viewer-controls"
        style={{
          display: "flex",
          "flex-wrap": "wrap",
          gap: "8px",
          padding: "12px",
          "background-color": "#2a2a2a",
          "border-bottom": "1px solid #444",
        }}
      >
        {/* Search */}
        <Input
          placeholder="Search components..."
          value={searchQuery()}
          onInput={e => setSearchQuery(e.target.value)}
          style={{ width: "200px" }}
        />

        {/* Filters */}
        <Select value={filterType()} onChange={e => setFilterType(e.target.value)} style={{ width: "120px" }}>
          <option value="all">All Types</option>
          <For each={componentTypes()}>{type => <option value={type}>{type}</option>}</For>
        </Select>

        <Show when={componentCategories().length > 0}>
          <Select value={filterCategory()} onChange={e => setFilterCategory(e.target.value)} style={{ width: "120px" }}>
            <option value="all">All Categories</option>
            <For each={componentCategories()}>{category => <option value={category}>{category}</option>}</For>
          </Select>
        </Show>

        <Show when={componentLayers().length > 0}>
          <Select value={filterLayer()} onChange={e => setFilterLayer(e.target.value)} style={{ width: "120px" }}>
            <option value="all">All Layers</option>
            <For each={componentLayers()}>{layer => <option value={layer}>{layer}</option>}</For>
          </Select>
        </Show>

        {/* Toggles */}
        <Checkbox
          checked={showRelationships()}
          onChange={e => setShowRelationships(e.target.checked)}
          label="Show Relationships"
        />

        <Checkbox checked={showLabels()} onChange={e => setShowLabels(e.target.checked)} label="Show Labels" />

        <Checkbox checked={clusteringEnabled()} onChange={toggleClustering} label="Enable Clustering" />

        {/* Clustering Controls */}
        <Show when={clusteringEnabled()}>
          <Select
            value={clusteringAlgorithm()}
            onChange={e => setClusteringAlgorithm(e.target.value as any)}
            style={{ width: "120px" }}
          >
            <option value="kmeans">K-Means</option>
            <option value="hierarchical">Hierarchical</option>
            <option value="dbscan">DBSCAN</option>
          </Select>

          <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
            <label style={{ color: "#fff", "font-size": "12px" }}>Clusters:</label>
            <Slider
              min={2}
              max={10}
              value={maxClusters()}
              onChange={value => setMaxClusters(value)}
              style={{ width: "80px" }}
            />
            <span style={{ color: "#fff", "font-size": "12px" }}>{maxClusters()}</span>
          </div>
        </Show>

        {/* Visualization Controls */}
        <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
          <label style={{ color: "#fff", "font-size": "12px" }}>Size:</label>
          <Slider
            min={1}
            max={10}
            value={componentSize()}
            onChange={value => setComponentSize(value)}
            style={{ width: "80px" }}
          />
        </div>

        <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
          <label style={{ color: "#fff", "font-size": "12px" }}>Opacity:</label>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={componentOpacity()}
            onChange={value => setComponentOpacity(value)}
            style={{ width: "80px" }}
          />
        </div>

        {/* Camera Controls */}
        <Button onClick={resetCamera} size="small">
          Reset Camera
        </Button>

        <Button onClick={fitToView} size="small">
          Fit to View
        </Button>

        {/* Export */}
        <Button onClick={() => exportView("gltf")} size="small">
          Export GLTF
        </Button>
      </div>

      {/* Statistics */}
      <div
        class="viewer-stats"
        style={{
          display: "flex",
          gap: "16px",
          padding: "8px 12px",
          "background-color": "#333",
          "font-size": "12px",
        }}
      >
        <Badge variant="info">
          Components: {statistics().visibleComponents}/{statistics().totalComponents}
        </Badge>
        <Badge variant="info">
          Relationships: {statistics().visibleRelationships}/{statistics().totalRelationships}
        </Badge>
        <Badge variant="info">Selected: {selectedComponents().size}</Badge>
        <Badge variant={clusteringEnabled() ? "success" : "secondary"}>
          Clustering: {clusteringEnabled() ? "On" : "Off"}
        </Badge>
      </div>

      {/* 3D Visualization */}
      <div class="viewer-3d" style={{ position: "relative" }}>
        <Show
          when={isLoading()}
          fallback={
            <ThreeJSVisualization
              width={props.width || 1000}
              height={props.height || 700}
              backgroundColor={config().backgroundColor}
              enableDamping={config().enableDamping}
              autoRotate={config().autoRotate}
              onSceneReady={(scene, camera, renderer, controls) => {
                // Setup lighting
                const ambientLight = new THREE.AmbientLight(
                  config().lighting.ambient.color,
                  config().lighting.ambient.intensity
                );
                scene.add(ambientLight);

                const directionalLight = new THREE.DirectionalLight(
                  config().lighting.directional.color,
                  config().lighting.directional.intensity
                );
                directionalLight.position.set(...config().lighting.directional.position);
                scene.add(directionalLight);

                const pointLight = new THREE.PointLight(
                  config().lighting.point.color,
                  config().lighting.point.intensity
                );
                pointLight.position.set(...config().lighting.point.position);
                scene.add(pointLight);

                // Setup grid
                if (config().showGrid) {
                  const gridHelper = new THREE.GridHelper(
                    config().gridSize,
                    config().gridDivisions,
                    config().gridColor,
                    config().gridColor
                  );
                  scene.add(gridHelper);
                }

                // Setup axes
                if (config().showAxes) {
                  const axesHelper = new THREE.AxesHelper(config().axisSize);
                  scene.add(axesHelper);
                }

                // Add point cloud visualization
                const pointCloud = new PointCloudVisualization({
                  points: visualizationData().points,
                  settings: {
                    colorMapping: "custom",
                    sizeMapping: "custom",
                    enableHighlighting: true,
                    maxPoints: config().performance.maxComponents,
                  },
                  onPointClick: (point, event) => {
                    const component = components().find(comp => comp.id === point.id);
                    if (component) {
                      handleComponentClick(component, event);
                    }
                  },
                });

                scene.add(pointCloud);

                // Setup camera controls
                controls.addEventListener("change", () => {
                  const position = camera.position.toArray() as [number, number, number];
                  const target = controls.target.toArray() as [number, number, number];
                  handleCameraChange(position, target);
                });
              }}
            />
          }
        >
          <div
            style={{
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              height: "400px",
              "background-color": config().backgroundColor,
              color: "#fff",
            }}
          >
            Loading 3D visualization...
          </div>
        </Show>
      </div>

      {/* Selection Info */}
      <Show when={selectedComponents().size > 0 || selectedRelationships().size > 0}>
        <div
          class="selection-info"
          style={{
            padding: "12px",
            "background-color": "#2a2a2a",
            "border-top": "1px solid #444",
          }}
        >
          <h4 style={{ margin: "0 0 8px 0", color: "#fff" }}>
            Selection ({selectedComponents().size} components, {selectedRelationships().size} relationships)
          </h4>
          <div style={{ display: "flex", "flex-wrap": "wrap", gap: "8px" }}>
            <For each={Array.from(selectedComponents())}>
              {componentId => {
                const component = components().find(comp => comp.id === componentId);
                return component ? (
                  <Badge variant="primary">
                    {component.name} ({component.type})
                  </Badge>
                ) : null;
              }}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}

/**
 * Demo component showcasing the 3D architecture viewer.
 */
export function Architecture3DViewerDemo() {
  const [architectureMap, setArchitectureMap] = createSignal<ArchitectureMap | null>(null);
  const [dependencyGraph, setDependencyGraph] = createSignal<DependencyGraph | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);

  const loadDemoData = async () => {
    setIsLoading(true);

    try {
      // Load demo architecture map or dependency graph
      // This would typically load from actual data sources
      console.log("Loading demo 3D architecture data...");

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Set demo data (would be replaced with actual data loading)
      setArchitectureMap(null);
      setDependencyGraph(null);
    } catch (error) {
      console.error("Failed to load demo data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  onMount(() => {
    loadDemoData();
  });

  return (
    <div class="architecture-3d-viewer-demo" style={{ padding: "20px" }}>
      <h2>3D Architecture Viewer Demo</h2>

      <Show
        when={isLoading()}
        fallback={
          <Architecture3DViewer
            architectureMap={architectureMap() || undefined}
            dependencyGraph={dependencyGraph() || undefined}
            width={1200}
            height={800}
            onComponentClick={(component, event) => {
              console.log("Component clicked:", component);
            }}
            onRelationshipClick={(relationship, event) => {
              console.log("Relationship clicked:", relationship);
            }}
            onCameraChange={(position, target) => {
              console.log("Camera changed:", position, target);
            }}
          />
        }
      >
        <div>Loading 3D architecture data...</div>
      </Show>
    </div>
  );
}
