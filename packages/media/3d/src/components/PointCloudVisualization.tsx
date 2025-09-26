import { Component, createSignal, createEffect, onMount, onCleanup, Show, createMemo } from "solid-js";
import type { PointCloudVisualizationProps, Point3D } from "../types";
import { ThreeJSVisualization } from "./ThreeJSVisualization";
import { usePointCloud } from "../composables/usePointCloud";
import { useThreeJSAnimations } from "../composables/useThreeJSAnimations";
import "./PointCloudVisualization.css";
import { Toggle } from "reynard-primitives";

export const PointCloudVisualization: Component<PointCloudVisualizationProps> = props => {
  const animations = useThreeJSAnimations();

  const pointCloud = usePointCloud(
    () => props.points,
    () => props.settings || {},
    () => props.searchIntegration || {}
  );

  // Scene state
  const [scene, setScene] = createSignal<any>(null);
  const [camera, setCamera] = createSignal<any>(null);
  const [renderer, setRenderer] = createSignal<any>(null);
  const [controls, setControls] = createSignal<any>(null);

  // Performance settings state
  const [instancingEnabled, setInstancingEnabled] = createSignal(pointCloud.enableInstancing());
  const [lodEnabled, setLodEnabled] = createSignal(pointCloud.enableLOD());
  const [cullingEnabled, setCullingEnabled] = createSignal(pointCloud.enableCulling());
  const [highlightingEnabled, setHighlightingEnabled] = createSignal(pointCloud.enableHighlighting());

  // Initialize Three.js on mount
  onMount(() => {
    pointCloud.initializeThreeJS();
  });

  /**
   * Handle scene ready callback
   */
  const handleSceneReady = (scene: any, camera: any, renderer: any, controls: any) => {
    setScene(scene);
    setCamera(camera);
    setRenderer(renderer);
    setControls(controls);

    const points = pointCloud.processedPoints();
    if (points.length === 0) return;

    // Clear existing point cloud
    const existingPointCloud = scene.children.find((child: any) => child.userData?.isPointCloud);
    if (existingPointCloud) {
      scene.remove(existingPointCloud);
    }

    // Create point cloud geometry
    const threeJS = pointCloud.threeJS() as any;
    const { BufferGeometry, Float32BufferAttribute, Points, PointsMaterial } = threeJS;

    const geometry = new BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    const colors = new Float32Array(points.length * 3);
    const sizes = new Float32Array(points.length);

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const index = i * 3;

      // Validate position values before setting them
      const x = Number.isFinite(point.position[0]) ? point.position[0] : 0;
      const y = Number.isFinite(point.position[1]) ? point.position[1] : 0;
      const z = Number.isFinite(point.position[2]) ? point.position[2] : 0;

      positions[index] = x;
      positions[index + 1] = y;
      positions[index + 2] = z;

      // Apply highlighting for selected and hovered points
      let color = point.color || [1, 1, 1];
      let size = point.size || pointCloud.pointSize();

      if (pointCloud.enableHighlighting()) {
        const isSelected = pointCloud.selectedPoints().some((p: any) => p.id === point.id);
        const isHovered = pointCloud.hoveredPoint()?.id === point.id;

        if (isSelected || isHovered) {
          color = pointCloud.highlightColor() as [number, number, number];
          size *= pointCloud.highlightSize();
        }
      }

      colors[index] = color[0];
      colors[index + 1] = color[1];
      colors[index + 2] = color[2];

      sizes[i] = size;
    }

    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geometry.setAttribute("size", new Float32BufferAttribute(sizes, 1));

    // Create material with enhanced features
    const material = new PointsMaterial({
      size: pointCloud.pointSize(),
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: 1, // Additive blending for better visual effect
      depthWrite: false,
    });

    // Create points mesh
    const pointsMesh = new Points(geometry, material);
    pointsMesh.userData = {
      isPointCloud: true,
      points: points,
      originalPoints: props.points,
    };

    scene.add(pointsMesh);
    pointCloud.setPointCloud(pointsMesh);

    // Update stats
    pointCloud.setVisiblePoints(points);
    pointCloud.setRenderStats({
      totalPoints: props.points.length,
      visiblePoints: points.length,
      renderedPoints: points.length,
      fps: 60,
      memoryUsage: points.length * 32,
    });

    // Set up interaction handlers
    const handleClick = pointCloud.createPointSelectionHandler(camera, scene);
    const handleMouseMove = pointCloud.createPointHoverHandler(camera, scene);

    // Add event listeners to renderer
    const canvas = renderer.domElement;
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("mousemove", handleMouseMove);

    // Store cleanup function
    pointsMesh.userData.cleanup = () => {
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  };

  /**
   * Custom render function for animations
   */
  const onRender = (scene: any, camera: any, renderer: any, controls: any) => {
    // Update camera info and handle animations
    const currentScene = scene();
    const currentCamera = camera();
    const currentRenderer = renderer();
    const currentControls = controls();

    if (currentScene && currentCamera && currentRenderer && currentControls) {
      // Update point cloud with interpolated positions if animating
      const interpolatedPoints = animations.getInterpolatedPoints(props.points);
      if (interpolatedPoints !== props.points) {
        // Update point cloud geometry with new positions
        const pointCloudMesh = currentScene.children.find((child: any) => child.userData?.isPointCloud);
        if (pointCloudMesh) {
          const positions = pointCloudMesh.geometry.attributes.position.array;
          for (let i = 0; i < interpolatedPoints.length; i++) {
            const point = interpolatedPoints[i];
            const index = i * 3;
            positions[index] = point.position[0];
            positions[index + 1] = point.position[1];
            positions[index + 2] = point.position[2];
          }
          pointCloudMesh.geometry.attributes.position.needsUpdate = true;
        }
      }
    }
  };

  // Update selection callback and refresh highlighting
  createEffect(() => {
    const selected = pointCloud.selectedPoints();
    props.onSelectionChange?.(selected);

    // Trigger re-render to update highlighting
    if (pointCloud.enableHighlighting()) {
      // Force a re-render by updating the scene
      const currentScene = scene();
      if (currentScene) {
        const pointCloudMesh = currentScene.children.find((child: any) => child.userData?.isPointCloud);
        if (pointCloudMesh) {
          // Update colors for highlighting
          const colors = pointCloudMesh.geometry.attributes.color.array;
          const points = pointCloudMesh.userData.points;

          for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const index = i * 3;

            let color = point.color || [1, 1, 1];
            let size = point.size || pointCloud.pointSize();

            if (pointCloud.enableHighlighting()) {
              const isSelected = selected.some((p: any) => p.id === point.id);
              const isHovered = pointCloud.hoveredPoint()?.id === point.id;

              if (isSelected || isHovered) {
                color = pointCloud.highlightColor() as [number, number, number];
                size *= pointCloud.highlightSize();
              }
            }

            colors[index] = color[0];
            colors[index + 1] = color[1];
            colors[index + 2] = color[2];
          }

          pointCloudMesh.geometry.attributes.color.needsUpdate = true;
        }
      }
    }
  });

  // Update highlighting when hover changes
  createEffect(() => {
    if (pointCloud.enableHighlighting() && pointCloud.hoveredPoint()) {
      // Force a re-render to update highlighting
      const currentScene = scene();
      if (currentScene) {
        const pointCloudMesh = currentScene.children.find((child: any) => child.userData?.isPointCloud);
        if (pointCloudMesh) {
          const colors = pointCloudMesh.geometry.attributes.color.array;
          const points = pointCloudMesh.userData.points;

          for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const index = i * 3;

            let color = point.color || [1, 1, 1];

            if (pointCloud.enableHighlighting()) {
              const isSelected = pointCloud.selectedPoints().some((p: any) => p.id === point.id);
              const isHovered = pointCloud.hoveredPoint()?.id === point.id;

              if (isSelected || isHovered) {
                color = pointCloud.highlightColor() as [number, number, number];
              }
            }

            colors[index] = color[0];
            colors[index + 1] = color[1];
            colors[index + 2] = color[2];
          }

          pointCloudMesh.geometry.attributes.color.needsUpdate = true;
        }
      }
    }
  });

  return (
    <div class={`point-cloud-visualization ${props.className || ""}`}>
      <Show when={pointCloud.isLoading()}>
        <div class="point-cloud-loading">
          <div class="loading-spinner"></div>
          <span>Loading point cloud...</span>
        </div>
      </Show>

      <Show when={pointCloud.error()}>
        <div class="point-cloud-error">
          <span>Error: {pointCloud.error()}</span>
          <button onClick={pointCloud.initializeThreeJS}>Retry</button>
        </div>
      </Show>

      <Show when={!pointCloud.isLoading() && !pointCloud.error()}>
        <ThreeJSVisualization
          width={props.width || 800}
          height={props.height || 600}
          backgroundColor={props.backgroundColor || "#1a1a1a"}
          onSceneReady={handleSceneReady}
          onRender={onRender}
          className="point-cloud-canvas"
          enableCameraAnimations={props.animationSettings?.enableAnimations ?? true}
          onCameraAnimationStart={props.animationSettings?.onAnimationStart}
          onCameraAnimationEnd={props.animationSettings?.onAnimationEnd}
        />

        <div class="point-cloud-stats">
          <div class="stat-item">
            <span class="stat-label">Total Points:</span>
            <span class="stat-value">{pointCloud.renderStats().totalPoints.toLocaleString()}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Visible Points:</span>
            <span class="stat-value">{pointCloud.renderStats().visiblePoints.toLocaleString()}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">LOD Level:</span>
            <span class="stat-value">{pointCloud.lodLevel()}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Frustum Culled:</span>
            <span class="stat-value">{pointCloud.frustumCulled().toLocaleString()}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Selected:</span>
            <span class="stat-value">{pointCloud.selectedPoints().length}</span>
          </div>
          <Show when={animations.currentAnimation()}>
            <div class="stat-item">
              <span class="stat-label">Animation:</span>
              <span class="stat-value">{(animations.currentAnimation()?.progress || 0 * 100).toFixed(1)}%</span>
            </div>
          </Show>
        </div>

        <div class="point-cloud-controls">
          <div class="control-group">
            <label class="control-label">Color Mapping:</label>
            <select
              value={props.settings?.colorMapping || "similarity"}
              onChange={e => {
                // This would need to be handled by parent component
                console.log("Color mapping:", e.currentTarget.value);
              }}
              class="control-select"
              title="Select color mapping method"
            >
              <option value="similarity">Similarity</option>
              <option value="cluster">Cluster</option>
              <option value="importance">Importance</option>
              <option value="confidence">Confidence</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div class="control-group">
            <label class="control-label">Size Mapping:</label>
            <select
              value={props.settings?.sizeMapping || "uniform"}
              onChange={e => {
                console.log("Size mapping:", e.currentTarget.value);
              }}
              class="control-select"
              title="Select size mapping method"
            >
              <option value="uniform">Uniform</option>
              <option value="importance">Importance</option>
              <option value="confidence">Confidence</option>
            </select>
          </div>

          <label class="control-item">
            <Toggle
              size="sm"
              checked={instancingEnabled()}
              onChange={checked => {
                console.log("Instancing:", checked);
                setInstancingEnabled(checked);
              }}
            />
            <span>Enable Instancing</span>
          </label>

          <label class="control-item">
            <Toggle
              size="sm"
              checked={lodEnabled()}
              onChange={checked => {
                console.log("LOD:", checked);
                setLodEnabled(checked);
              }}
            />
            <span>Enable LOD</span>
          </label>

          <label class="control-item">
            <Toggle
              size="sm"
              checked={cullingEnabled()}
              onChange={checked => {
                console.log("Culling:", checked);
                setCullingEnabled(checked);
              }}
            />
            <span>Enable Culling</span>
          </label>

          <label class="control-item">
            <Toggle
              size="sm"
              checked={highlightingEnabled()}
              onChange={checked => {
                console.log("Highlighting:", checked);
                setHighlightingEnabled(checked);
              }}
            />
            <span>Enable Highlighting</span>
          </label>
        </div>

        {/* Selection Groups Display */}
        <Show when={pointCloud.selectedPoints().length > 0}>
          <div class="selection-groups">
            <div class="selection-header">
              <strong>Selected Points ({pointCloud.selectedPoints().length})</strong>
              <button class="clear-selection" onClick={() => pointCloud.setSelectedPoints([])} title="Clear selection">
                ×
              </button>
            </div>
            <div class="selection-list">
              {pointCloud.selectedPoints().map((point: any, index: number) => (
                <div class="selection-item">
                  <span class="selection-index">{index + 1}</span>
                  <span class="selection-id">{point.id}</span>
                  <Show when={point.imageThumbnail || point.imageUrl}>
                    <img
                      src={point.imageThumbnail || point.imageUrl}
                      alt="Point thumbnail"
                      class="selection-thumbnail"
                    />
                  </Show>
                  <button
                    class="remove-selection"
                    onClick={() => {
                      pointCloud.setSelectedPoints((prev: any) => prev.filter((p: any) => p.id !== point.id));
                    }}
                    title="Remove from selection"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Show>

        <Show when={pointCloud.hoveredPoint() && pointCloud.tooltipPosition()}>
          <div class="point-tooltip point-tooltip-positioned">
            <div class="tooltip-header">
              <strong>Point: {pointCloud.hoveredPoint()?.id}</strong>
            </div>

            {/* Image thumbnail */}
            <Show when={pointCloud.hoveredPoint()?.imageThumbnail || pointCloud.hoveredPoint()?.imageUrl}>
              <div class="tooltip-image">
                <img
                  src={pointCloud.hoveredPoint()?.imageThumbnail || pointCloud.hoveredPoint()?.imageUrl}
                  alt="Point thumbnail"
                  class="tooltip-thumbnail"
                />
              </div>
            </Show>

            <div class="tooltip-content">
              <div class="tooltip-item">
                <span>Position:</span>
                <span>[{pointCloud.hoveredPoint()?.position.join(", ")}]</span>
              </div>
              <Show when={pointCloud.hoveredPoint()?.importance !== undefined}>
                <div class="tooltip-item">
                  <span>Importance:</span>
                  <span>{(pointCloud.hoveredPoint()?.importance || 0).toFixed(3)}</span>
                </div>
              </Show>
              <Show when={pointCloud.hoveredPoint()?.confidence !== undefined}>
                <div class="tooltip-item">
                  <span>Confidence:</span>
                  <span>{(pointCloud.hoveredPoint()?.confidence || 0).toFixed(3)}</span>
                </div>
              </Show>
              <Show when={pointCloud.hoveredPoint()?.similarity !== undefined}>
                <div class="tooltip-item">
                  <span>Similarity:</span>
                  <span>{(pointCloud.hoveredPoint()?.similarity || 0).toFixed(3)}</span>
                </div>
              </Show>
              <Show when={pointCloud.hoveredPoint()?.clusterId}>
                <div class="tooltip-item">
                  <span>Cluster:</span>
                  <span>{pointCloud.hoveredPoint()?.clusterId}</span>
                </div>
              </Show>

              {/* Additional metadata */}
              <Show
                when={
                  pointCloud.hoveredPoint()?.metadata &&
                  Object.keys(pointCloud.hoveredPoint()?.metadata || {}).length > 0
                }
              >
                <div class="tooltip-metadata">
                  <div class="tooltip-section-title">Metadata:</div>
                  {Object.entries(pointCloud.hoveredPoint()?.metadata || {}).map(([key, value]) => (
                    <div class="tooltip-item">
                      <span>{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </Show>
            </div>
          </div>
        </Show>
      </Show>
    </div>
  );
};
