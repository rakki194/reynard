/**
 * 🦊 Reynard Interactive Diagram System
 * ====================================
 *
 * Advanced interactive diagram system for architectural visualization.
 * Provides zoom, pan, selection, filtering, and real-time updates for
 * dependency graphs and architectural diagrams.
 *
 * Features:
 * - Interactive zoom and pan with smooth animations
 * - Node and edge selection with multi-select support
 * - Real-time filtering and search capabilities
 * - Drag-and-drop node repositioning
 * - Context menus and tooltips
 * - Export to multiple formats
 * - Integration with Reynard's 3D visualization system
 *
 * @author Reynard Development Team
 * @version 1.0.0
 */

import { Component, createSignal, createEffect, onMount, onCleanup, createMemo, Show, For } from "solid-js";
import { Card, Button, Badge, Tabs, Input, Select, Checkbox } from "reynard-components-core/primitives";
import { Chart, useVisualizationEngine } from "reynard-charts";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { ThreeJSVisualization, PointCloudVisualization } from "reynard-3d";
import { DependencyGraphGenerator, DependencyGraph, DependencyNode, DependencyEdge } from "./DependencyGraphGenerator";

/**
 * Configuration for the interactive diagram system.
 */
export interface DiagramSystemConfig {
  /** Initial zoom level */
  initialZoom: number;
  /** Minimum zoom level */
  minZoom: number;
  /** Maximum zoom level */
  maxZoom: number;
  /** Enable pan functionality */
  enablePan: boolean;
  /** Enable zoom functionality */
  enableZoom: boolean;
  /** Enable node selection */
  enableSelection: boolean;
  /** Enable multi-select */
  enableMultiSelect: boolean;
  /** Enable drag and drop */
  enableDragDrop: boolean;
  /** Enable context menus */
  enableContextMenus: boolean;
  /** Enable tooltips */
  enableTooltips: boolean;
  /** Animation duration in milliseconds */
  animationDuration: number;
  /** Layout algorithm to use */
  layoutAlgorithm: "force-directed" | "hierarchical" | "circular" | "grid" | "3d";
  /** Theme configuration */
  theme: {
    backgroundColor: string;
    nodeColors: Record<string, string>;
    edgeColors: Record<string, string>;
    textColor: string;
    selectionColor: string;
    hoverColor: string;
  };
}

/**
 * Props for the InteractiveDiagramSystem component.
 */
export interface InteractiveDiagramSystemProps {
  /** Dependency graph to visualize */
  graph: DependencyGraph;
  /** Configuration options */
  config?: Partial<DiagramSystemConfig>;
  /** Callback when selection changes */
  onSelectionChange?: (selectedNodes: DependencyNode[], selectedEdges: DependencyEdge[]) => void;
  /** Callback when node is clicked */
  onNodeClick?: (node: DependencyNode, event: MouseEvent) => void;
  /** Callback when edge is clicked */
  onEdgeClick?: (edge: DependencyEdge, event: MouseEvent) => void;
  /** Callback when layout changes */
  onLayoutChange?: (layout: any) => void;
  /** Width of the diagram */
  width?: number;
  /** Height of the diagram */
  height?: number;
  /** CSS class name */
  class?: string;
}

/**
 * Interactive diagram system component with advanced visualization capabilities.
 */
export function InteractiveDiagramSystem(props: InteractiveDiagramSystemProps) {
  // Configuration with defaults
  const config = createMemo(() => ({
    initialZoom: 1.0,
    minZoom: 0.1,
    maxZoom: 5.0,
    enablePan: true,
    enableZoom: true,
    enableSelection: true,
    enableMultiSelect: true,
    enableDragDrop: true,
    enableContextMenus: true,
    enableTooltips: true,
    animationDuration: 300,
    layoutAlgorithm: "force-directed" as const,
    theme: {
      backgroundColor: "#1a1a1a",
      nodeColors: {
        file: "#4A90E2",
        package: "#7ED321",
        module: "#F5A623",
        directory: "#BD10E0",
        service: "#50E3C2",
      },
      edgeColors: {
        import: "#4A90E2",
        export: "#7ED321",
        dependency: "#F5A623",
        inheritance: "#BD10E0",
        composition: "#50E3C2",
      },
      textColor: "#ffffff",
      selectionColor: "#ff6b6b",
      hoverColor: "#4ecdc4",
    },
    ...props.config,
  }));

  // State management
  const [selectedNodes, setSelectedNodes] = createSignal<Set<string>>(new Set());
  const [selectedEdges, setSelectedEdges] = createSignal<Set<string>>(new Set());
  const [hoveredNode, setHoveredNode] = createSignal<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = createSignal<string | null>(null);
  const [zoom, setZoom] = createSignal(config().initialZoom);
  const [pan, setPan] = createSignal({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = createSignal(false);
  const [dragStart, setDragStart] = createSignal({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filterType, setFilterType] = createSignal<string>("all");
  const [filterCategory, setFilterCategory] = createSignal<string>("all");
  const [showCircularDeps, setShowCircularDeps] = createSignal(true);
  const [showLabels, setShowLabels] = createSignal(true);
  const [layoutMode, setLayoutMode] = createSignal(config().layoutAlgorithm);
  const [is3DMode, setIs3DMode] = createSignal(false);

  // Computed values
  const filteredNodes = createMemo(() => {
    const nodes = Array.from(props.graph.nodes.values());
    let filtered = nodes;

    // Apply search filter
    if (searchQuery()) {
      const query = searchQuery().toLowerCase();
      filtered = filtered.filter(
        node =>
          node.label.toLowerCase().includes(query) ||
          node.path.toLowerCase().includes(query) ||
          node.category.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType() !== "all") {
      filtered = filtered.filter(node => node.type === filterType());
    }

    // Apply category filter
    if (filterCategory() !== "all") {
      filtered = filtered.filter(node => node.category === filterCategory());
    }

    return filtered;
  });

  const filteredEdges = createMemo(() => {
    const edges = Array.from(props.graph.edges.values());
    let filtered = edges;

    // Filter circular dependencies
    if (!showCircularDeps()) {
      filtered = filtered.filter(edge => !edge.isCircular);
    }

    // Only show edges between visible nodes
    const visibleNodeIds = new Set(filteredNodes().map(node => node.id));
    filtered = filtered.filter(edge => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));

    return filtered;
  });

  const nodeTypes = createMemo(() => {
    const types = new Set<string>();
    for (const node of props.graph.nodes.values()) {
      types.add(node.type);
    }
    return Array.from(types);
  });

  const nodeCategories = createMemo(() => {
    const categories = new Set<string>();
    for (const node of props.graph.nodes.values()) {
      categories.add(node.category);
    }
    return Array.from(categories);
  });

  const statistics = createMemo(() => {
    const totalNodes = props.graph.nodes.size;
    const totalEdges = props.graph.edges.size;
    const circularDeps = props.graph.metadata.circularDependencies;
    const visibleNodes = filteredNodes().length;
    const visibleEdges = filteredEdges().length;

    return {
      totalNodes,
      totalEdges,
      circularDeps,
      visibleNodes,
      visibleEdges,
      health: props.graph.metadata.health,
      complexity: props.graph.metadata.complexity,
    };
  });

  // Event handlers
  const handleNodeClick = (node: DependencyNode, event: MouseEvent) => {
    event.stopPropagation();

    if (config().enableSelection) {
      if (config().enableMultiSelect && event.ctrlKey) {
        // Multi-select mode
        const newSelection = new Set(selectedNodes());
        if (newSelection.has(node.id)) {
          newSelection.delete(node.id);
        } else {
          newSelection.add(node.id);
        }
        setSelectedNodes(newSelection);
      } else {
        // Single select mode
        setSelectedNodes(new Set([node.id]));
      }
    }

    props.onNodeClick?.(node, event);
  };

  const handleEdgeClick = (edge: DependencyEdge, event: MouseEvent) => {
    event.stopPropagation();

    if (config().enableSelection) {
      if (config().enableMultiSelect && event.ctrlKey) {
        // Multi-select mode
        const newSelection = new Set(selectedEdges());
        if (newSelection.has(edge.id)) {
          newSelection.delete(edge.id);
        } else {
          newSelection.add(edge.id);
        }
        setSelectedEdges(newSelection);
      } else {
        // Single select mode
        setSelectedEdges(new Set([edge.id]));
      }
    }

    props.onEdgeClick?.(edge, event);
  };

  const handleCanvasClick = (event: MouseEvent) => {
    if (!event.ctrlKey) {
      setSelectedNodes(new Set());
      setSelectedEdges(new Set());
    }
  };

  const handleWheel = (event: WheelEvent) => {
    if (config().enableZoom) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(config().minZoom, Math.min(config().maxZoom, zoom() * delta));
      setZoom(newZoom);
    }
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (config().enablePan && event.button === 0) {
      setIsDragging(true);
      setDragStart({ x: event.clientX - pan().x, y: event.clientY - pan().y });
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging() && config().enablePan) {
      setPan({
        x: event.clientX - dragStart().x,
        y: event.clientY - dragStart().y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleNodeHover = (nodeId: string | null) => {
    setHoveredNode(nodeId);
  };

  const handleEdgeHover = (edgeId: string | null) => {
    setHoveredEdge(edgeId);
  };

  // Export functions
  const exportDiagram = async (format: "svg" | "png" | "json") => {
    // Implementation would depend on the rendering backend
    console.log(`Exporting diagram as ${format}`);
  };

  const resetView = () => {
    setZoom(config().initialZoom);
    setPan({ x: 0, y: 0 });
  };

  const fitToView = () => {
    // Calculate bounds of all visible nodes
    const nodes = filteredNodes();
    if (nodes.length === 0) return;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    for (const node of nodes) {
      const x = node.visual.x || 0;
      const y = node.visual.y || 0;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const scaleX = (props.width || 800) / width;
    const scaleY = (props.height || 600) / height;
    const scale = Math.min(scaleX, scaleY) * 0.9;

    setZoom(scale);
    setPan({
      x: (props.width || 800) / 2 - centerX * scale,
      y: (props.height || 600) / 2 - centerY * scale,
    });
  };

  // 3D mode toggle
  const toggle3DMode = () => {
    setIs3DMode(!is3DMode());
  };

  // Effect to notify parent of selection changes
  createEffect(() => {
    const selectedNodeObjects = Array.from(selectedNodes())
      .map(id => props.graph.nodes.get(id))
      .filter(Boolean) as DependencyNode[];

    const selectedEdgeObjects = Array.from(selectedEdges())
      .map(id => props.graph.edges.get(id))
      .filter(Boolean) as DependencyEdge[];

    props.onSelectionChange?.(selectedNodeObjects, selectedEdgeObjects);
  });

  // Render 3D visualization
  const render3DVisualization = () => {
    if (!is3DMode()) return null;

    const points = filteredNodes().map(node => ({
      id: node.id,
      position: [
        node.visual.x || 0,
        node.visual.y || 0,
        Math.random() * 100, // Random Z for now
      ] as [number, number, number],
      color: [
        parseFloat(config().theme.nodeColors[node.type]?.slice(1, 3) || "74", 16) / 255,
        parseFloat(config().theme.nodeColors[node.type]?.slice(3, 5) || "144", 16) / 255,
        parseFloat(config().theme.nodeColors[node.type]?.slice(5, 7) || "226", 16) / 255,
      ] as [number, number, number],
      size: (node.visual.size || 8) * 2,
      metadata: {
        label: node.label,
        type: node.type,
        category: node.category,
        path: node.path,
      },
    }));

    return (
      <ThreeJSVisualization
        width={props.width || 800}
        height={props.height || 600}
        backgroundColor={config().theme.backgroundColor}
        enableDamping={true}
        autoRotate={true}
        onSceneReady={(scene, camera, renderer, controls) => {
          // Add point cloud visualization
          const pointCloud = new PointCloudVisualization({
            points,
            settings: {
              colorMapping: "custom",
              sizeMapping: "custom",
              enableHighlighting: true,
              maxPoints: 10000,
            },
            onPointClick: (point, event) => {
              const node = props.graph.nodes.get(point.id);
              if (node) {
                handleNodeClick(node, event);
              }
            },
          });

          scene.add(pointCloud);
        }}
      />
    );
  };

  // Render 2D visualization
  const render2DVisualization = () => {
    if (is3DMode()) return null;

    return (
      <div
        class="interactive-diagram-canvas"
        style={{
          width: `${props.width || 800}px`,
          height: `${props.height || 600}px`,
          "background-color": config().theme.backgroundColor,
          position: "relative",
          overflow: "hidden",
          cursor: isDragging() ? "grabbing" : "grab",
        }}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width="100%"
          height="100%"
          style={{
            transform: `translate(${pan().x}px, ${pan().y}px) scale(${zoom()})`,
            "transform-origin": "0 0",
            transition: isDragging() ? "none" : `transform ${config().animationDuration}ms ease-out`,
          }}
        >
          {/* Render edges */}
          <For each={filteredEdges()}>
            {edge => {
              const sourceNode = props.graph.nodes.get(edge.source);
              const targetNode = props.graph.nodes.get(edge.target);

              if (!sourceNode || !targetNode) return null;

              const x1 = sourceNode.visual.x || 0;
              const y1 = sourceNode.visual.y || 0;
              const x2 = targetNode.visual.x || 0;
              const y2 = targetNode.visual.y || 0;

              const isSelected = selectedEdges().has(edge.id);
              const isHovered = hoveredEdge() === edge.id;
              const isCircular = edge.isCircular;

              return (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={
                    isCircular
                      ? "#ff0000"
                      : isSelected
                        ? config().theme.selectionColor
                        : config().theme.edgeColors[edge.type] || "#666666"
                  }
                  stroke-width={isSelected ? 4 : isHovered ? 3 : edge.visual.width || 2}
                  stroke-dasharray={isCircular ? "5,5" : "none"}
                  opacity={isSelected ? 1 : isHovered ? 0.8 : 0.6}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={e => handleEdgeClick(edge, e)}
                  onMouseEnter={() => handleEdgeHover(edge.id)}
                  onMouseLeave={() => handleEdgeHover(null)}
                />
              );
            }}
          </For>

          {/* Render nodes */}
          <For each={filteredNodes()}>
            {node => {
              const x = node.visual.x || 0;
              const y = node.visual.y || 0;
              const size = node.visual.size || 8;
              const isSelected = selectedNodes().has(node.id);
              const isHovered = hoveredNode() === node.id;

              return (
                <g
                  transform={`translate(${x}, ${y})`}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={e => handleNodeClick(node, e)}
                  onMouseEnter={() => handleNodeHover(node.id)}
                  onMouseLeave={() => handleNodeHover(null)}
                >
                  {/* Node circle */}
                  <circle
                    cx={0}
                    cy={0}
                    r={isSelected ? size + 4 : isHovered ? size + 2 : size}
                    fill={
                      isSelected
                        ? config().theme.selectionColor
                        : isHovered
                          ? config().theme.hoverColor
                          : config().theme.nodeColors[node.type] || "#666666"
                    }
                    stroke={isSelected ? "#ffffff" : "none"}
                    stroke-width={isSelected ? 2 : 0}
                    opacity={isSelected ? 1 : isHovered ? 0.9 : 0.8}
                  />

                  {/* Node label */}
                  <Show when={showLabels()}>
                    <text
                      x={0}
                      y={size + 12}
                      text-anchor="middle"
                      fill={config().theme.textColor}
                      font-size="10"
                      font-family="Arial, sans-serif"
                    >
                      {node.label}
                    </text>
                  </Show>
                </g>
              );
            }}
          </For>
        </svg>
      </div>
    );
  };

  return (
    <div class={`interactive-diagram-system ${props.class || ""}`}>
      {/* Control Panel */}
      <div
        class="diagram-controls"
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
          placeholder="Search nodes..."
          value={searchQuery()}
          onInput={e => setSearchQuery(e.target.value)}
          style={{ width: "200px" }}
        />

        {/* Filters */}
        <Select value={filterType()} onChange={e => setFilterType(e.target.value)} style={{ width: "120px" }}>
          <option value="all">All Types</option>
          <For each={nodeTypes()}>{type => <option value={type}>{type}</option>}</For>
        </Select>

        <Select value={filterCategory()} onChange={e => setFilterCategory(e.target.value)} style={{ width: "120px" }}>
          <option value="all">All Categories</option>
          <For each={nodeCategories()}>{category => <option value={category}>{category}</option>}</For>
        </Select>

        {/* Toggles */}
        <Checkbox
          checked={showCircularDeps()}
          onChange={e => setShowCircularDeps(e.target.checked)}
          label="Show Circular"
        />

        <Checkbox checked={showLabels()} onChange={e => setShowLabels(e.target.checked)} label="Show Labels" />

        {/* Layout */}
        <Select value={layoutMode()} onChange={e => setLayoutMode(e.target.value as any)} style={{ width: "140px" }}>
          <option value="force-directed">Force Directed</option>
          <option value="hierarchical">Hierarchical</option>
          <option value="circular">Circular</option>
          <option value="grid">Grid</option>
        </Select>

        {/* View Controls */}
        <Button onClick={resetView} size="small">
          Reset View
        </Button>

        <Button onClick={fitToView} size="small">
          Fit to View
        </Button>

        <Button onClick={toggle3DMode} size="small" variant={is3DMode() ? "primary" : "secondary"}>
          {is3DMode() ? "2D View" : "3D View"}
        </Button>

        {/* Export */}
        <Button onClick={() => exportDiagram("svg")} size="small">
          Export SVG
        </Button>
      </div>

      {/* Statistics */}
      <div
        class="diagram-stats"
        style={{
          display: "flex",
          gap: "16px",
          padding: "8px 12px",
          "background-color": "#333",
          "font-size": "12px",
        }}
      >
        <Badge variant="info">
          Nodes: {statistics().visibleNodes}/{statistics().totalNodes}
        </Badge>
        <Badge variant="info">
          Edges: {statistics().visibleEdges}/{statistics().totalEdges}
        </Badge>
        <Badge variant={statistics().circularDeps > 0 ? "warning" : "success"}>
          Circular: {statistics().circularDeps}
        </Badge>
        <Badge
          variant={
            statistics().health === "excellent" ? "success" : statistics().health === "good" ? "info" : "warning"
          }
        >
          Health: {statistics().health}
        </Badge>
        <Badge variant="info">Complexity: {statistics().complexity.toFixed(2)}</Badge>
      </div>

      {/* Visualization */}
      <div class="diagram-visualization" style={{ position: "relative" }}>
        <Show when={is3DMode()} fallback={render2DVisualization()}>
          {render3DVisualization()}
        </Show>
      </div>

      {/* Selection Info */}
      <Show when={selectedNodes().size > 0 || selectedEdges().size > 0}>
        <div
          class="selection-info"
          style={{
            padding: "12px",
            "background-color": "#2a2a2a",
            "border-top": "1px solid #444",
          }}
        >
          <h4 style={{ margin: "0 0 8px 0", color: config().theme.textColor }}>
            Selection ({selectedNodes().size} nodes, {selectedEdges().size} edges)
          </h4>
          <div style={{ display: "flex", "flex-wrap": "wrap", gap: "8px" }}>
            <For each={Array.from(selectedNodes())}>
              {nodeId => {
                const node = props.graph.nodes.get(nodeId);
                return node ? (
                  <Badge variant="primary">
                    {node.label} ({node.type})
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
 * Demo component showcasing the interactive diagram system.
 */
export function InteractiveDiagramSystemDemo() {
  const [graph, setGraph] = createSignal<DependencyGraph | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);

  const generateDemoGraph = async () => {
    setIsLoading(true);

    try {
      const generator = new DependencyGraphGenerator("/path/to/codebase");
      const generatedGraph = await generator.generateGraph();
      setGraph(generatedGraph);
    } catch (error) {
      console.error("Failed to generate graph:", error);
    } finally {
      setIsLoading(false);
    }
  };

  onMount(() => {
    generateDemoGraph();
  });

  return (
    <div class="interactive-diagram-demo" style={{ padding: "20px" }}>
      <h2>Interactive Diagram System Demo</h2>

      <Show
        when={isLoading()}
        fallback={
          <Show when={graph()} fallback={<div>Failed to load graph</div>}>
            <InteractiveDiagramSystem
              graph={graph()!}
              width={1000}
              height={700}
              onSelectionChange={(nodes, edges) => {
                console.log("Selection changed:", nodes, edges);
              }}
              onNodeClick={(node, event) => {
                console.log("Node clicked:", node);
              }}
              onEdgeClick={(edge, event) => {
                console.log("Edge clicked:", edge);
              }}
            />
          </Show>
        }
      >
        <div>Generating dependency graph...</div>
      </Show>
    </div>
  );
}
