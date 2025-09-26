/**
 * 3D Embedding Visualization Component
 *
 * Interactive 3D visualization of embeddings using Three.js.
 * Integrates with existing Reynard 3D package for advanced visualization.
 */
import { Show, createEffect, createSignal, onCleanup, onMount, splitProps } from "solid-js";
import * as THREE from "three";
const defaultProps = {
  width: 800,
  height: 600,
  pointSize: 2,
  enableHighlighting: true,
  showSimilarityPaths: true,
  similarityThreshold: 0.8,
  loading: false,
};
interface Embedding3DVisualizationProps {
  data?: any;
  reducedData?: any;
  isLoading?: boolean;
  class?: string;
  [key: string]: any;
}

export const Embedding3DVisualization = (props: Embedding3DVisualizationProps) => {
  const [local, others] = splitProps(props, [
    "data",
    "loading",
    "pointSize",
    "enableHighlighting",
    "showSimilarityPaths",
    "similarityThreshold",
    "theme",
    "class",
    "onPointClick",
    "onPointHover",
  ]);
  const [container, setContainer] = createSignal<HTMLElement | null>(null);
  const [isInitialized, setIsInitialized] = createSignal(false);
  const [error, setError] = createSignal("");
  const [hoveredPoint, setHoveredPoint] = createSignal<any>(null);
  const [selectedPoint, setSelectedPoint] = createSignal<any>(null);
  // Three.js related state
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let renderer: THREE.WebGLRenderer | null = null;
  let points: THREE.Points | null = null;
  let controls: any = null;
  let animationId: number | null = null;
  onMount(() => {
    initializeThreeJS();
  });
  onCleanup(() => {
    cleanup();
  });
  createEffect(() => {
    if (local.data && isInitialized()) {
      updateVisualization();
    }
  });
  const initializeThreeJS = async () => {
    try {
      // Dynamic import of Three.js to avoid bundle bloat
      const THREE = await import("three");
      if (!container()) return;
      // Create scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a1a);
      // Create camera
      camera = new THREE.PerspectiveCamera(75, others.width / others.height, 0.1, 1000);
      camera.position.set(0, 0, 10);
      // Create renderer
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(others.width, others.height);
      renderer.setPixelRatio(window.devicePixelRatio);
      container()?.appendChild(renderer.domElement);
      // Add lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
      // Add orbit controls
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      // Add grid helper
      const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x444444);
      scene.add(gridHelper);
      // Add axes helper
      const axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);
      setIsInitialized(true);
      startAnimation();
    } catch (err) {
      console.error("Failed to initialize Three.js:", err);
      setError("Failed to initialize 3D visualization");
    }
  };
  const updateVisualization = () => {
    if (!scene || !local.data || !local.data.success) return;
    // Remove existing points
    if (points) {
      scene.remove(points);
    }
    const transformedData = local.data.transformed_data;
    if (!transformedData || transformedData.length === 0) return;
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(transformedData.length * 3);
    const colors = new Float32Array(transformedData.length * 3);
    const sizes = new Float32Array(transformedData.length);
    // Process data points
    transformedData.forEach((point: number[], index: number) => {
      if (point.length >= 3) {
        // Position
        positions[index * 3] = point[0];
        positions[index * 3 + 1] = point[1];
        positions[index * 3 + 2] = point[2];
        // Color based on position (distance from center)
        const distance = Math.sqrt(point[0] ** 2 + point[1] ** 2 + point[2] ** 2);
        const normalizedDistance = Math.min(distance / 5, 1);
        // Color gradient from blue to red
        const color = new THREE.Color();
        color.setHSL(0.6 - normalizedDistance * 0.6, 1, 0.5);
        colors[index * 3] = color.r;
        colors[index * 3 + 1] = color.g;
        colors[index * 3 + 2] = color.b;
        // Size based on distance
        sizes[index] = local.pointSize * (1 + normalizedDistance * 0.5);
      }
    });
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    // Create material
    const material = new THREE.PointsMaterial({
      size: local.pointSize,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    // Create points
    points = new THREE.Points(geometry, material);
    scene.add(points);
    // Add click and hover interactions
    if (local.onPointClick || local.onPointHover) {
      addInteractions();
    }
    // Auto-fit camera to data
    fitCameraToData();
  };
  const addInteractions = () => {
    if (!renderer || !points) return;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer!.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera!);
      const intersects = raycaster.intersectObject(points!);
      if (intersects.length > 0) {
        const pointIndex = intersects[0].index;
        if (pointIndex !== undefined) {
          setHoveredPoint(pointIndex as any);
          if (local.onPointHover) {
            local.onPointHover(pointIndex, {
              position: intersects[0].point,
              data: local.data?.original_embeddings?.[pointIndex],
            });
          }
        }
      } else {
        setHoveredPoint(null);
      }
    };
    const onMouseClick = (event: MouseEvent) => {
      const rect = renderer!.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera!);
      const intersects = raycaster.intersectObject(points!);
      if (intersects.length > 0) {
        const pointIndex = intersects[0].index;
        if (pointIndex !== undefined) {
          setSelectedPoint(pointIndex as any);
          if (local.onPointClick) {
            local.onPointClick(pointIndex, {
              position: intersects[0].point,
              data: local.data?.original_embeddings?.[pointIndex],
            });
          }
        }
      }
    };
    renderer!.domElement.addEventListener("mousemove", onMouseMove);
    renderer!.domElement.addEventListener("click", onMouseClick);
    // Store cleanup function
    const cleanup = () => {
      renderer!.domElement.removeEventListener("mousemove", onMouseMove);
      renderer!.domElement.removeEventListener("click", onMouseClick);
    };
    return cleanup;
  };
  const fitCameraToData = () => {
    if (!camera || !local.data || !local.data.transformed_data) return;
    const data = local.data.transformed_data;
    if (data.length === 0) return;
    // Calculate bounding box
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;
    data.forEach((point: number[]) => {
      if (point.length >= 3) {
        minX = Math.min(minX, point[0]);
        maxX = Math.max(maxX, point[0]);
        minY = Math.min(minY, point[1]);
        maxY = Math.max(maxY, point[1]);
        minZ = Math.min(minZ, point[2]);
        maxZ = Math.max(maxZ, point[2]);
      }
    });
    // Calculate center and size
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
    // Position camera
    const distance = size * 2;
    camera.position.set(centerX, centerY, centerZ + distance);
    camera.lookAt(centerX, centerY, centerZ);
    if (controls) {
      controls.target.set(centerX, centerY, centerZ);
      controls.update();
    }
  };
  const startAnimation = () => {
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (controls) {
        controls.update();
      }
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    animate();
  };
  const cleanup = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (renderer) {
      renderer.dispose();
      renderer = null;
    }
    if (controls) {
      controls.dispose();
      controls = null;
    }
    scene = null;
    camera = null;
    points = null;
  };
  return (
    <div class={`reynard-embedding-3d-visualization ${local.class || ""}`}>
      <Show when={local.loading}>
        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            height: `${others.height || 600}px`,
            color: "var(--text-muted, #666)",
          }}
        >
          <div class="loading-spinner" />
          <span style={{ "margin-left": "10px" }}>Loading 3D visualization...</span>
        </div>
      </Show>

      <Show when={error()}>
        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            height: `${others.height || 600}px`,
            color: "var(--error-color, #ff6b6b)",
          }}
        >
          <div>
            <h4>3D Visualization Error</h4>
            <p>{error()}</p>
          </div>
        </div>
      </Show>

      <Show when={!local.loading && !error()}>
        <div
          ref={setContainer}
          style={{
            width: `${others.width || 800}px`,
            height: `${others.height || 600}px`,
            position: "relative",
          }}
        />

        <div class="3d-controls">
          <div class="control-info">
            <p>🖱️ Left click + drag: Rotate</p>
            <p>🖱️ Right click + drag: Pan</p>
            <p>🖱️ Scroll: Zoom</p>
          </div>

          <Show when={hoveredPoint() !== null}>
            <div class="hover-info">
              Point {hoveredPoint()}: {local.data?.original_embeddings?.[hoveredPoint() as number]?.id || "Unknown"}
            </div>
          </Show>

          <Show when={selectedPoint() !== null}>
            <div class="selected-info">
              Selected Point {selectedPoint()}:{" "}
              {local.data?.original_embeddings?.[selectedPoint() as number]?.id || "Unknown"}
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};
