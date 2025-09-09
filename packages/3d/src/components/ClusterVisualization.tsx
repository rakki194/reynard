import {
  Component,
  createSignal,
  createEffect,
  onCleanup,
  Show,
} from "solid-js";
import type { ClusterVisualizationProps } from "../types/rendering";
import "./ClusterVisualization.css";

// Three.js will be dynamically imported
let THREE: any = null;

export const ClusterVisualization: Component<ClusterVisualizationProps> = (
  props,
) => {
  const [hoveredCluster, setHoveredCluster] = createSignal<string | null>(null);
  const [showStatistics, setShowStatistics] = createSignal(true);

  let hullMeshes: any[] = [];
  let textSprites: any[] = [];
  let raycaster: any = null;
  let mouse: any = null;

  createEffect(async () => {
    if (!props.scene || !props.clusters) return;

    // Initialize Three.js if not already done
    if (!THREE) {
      THREE = await import("three");
    }

    // Clear existing cluster visualizations
    clearClusterVisualizations();

    // Create new cluster visualizations
    props.clusters.forEach((cluster) => {
      createConvexHull(cluster);
      createClusterLabel(cluster);
    });

    // Update scene
    props.renderer.render(props.scene, props.camera);
  });

  const clearClusterVisualizations = () => {
    // Remove hull meshes
    hullMeshes.forEach((mesh) => {
      props.scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    });
    hullMeshes = [];

    // Remove text sprites
    textSprites.forEach((sprite) => {
      props.scene.remove(sprite);
      if (sprite.material) sprite.material.dispose();
    });
    textSprites = [];
  };

  const createConvexHull = (cluster: any) => {
    if (!cluster.points || cluster.points.length < 3 || !THREE) return;

    // Create convex hull geometry
    const geometry = new THREE.ConvexGeometry(cluster.points);
    const material = new THREE.MeshBasicMaterial({
      color: cluster.color,
      transparent: true,
      opacity: 0.3,
      wireframe: false,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { clusterId: cluster.id, type: "clusterHull" };

    // Add hover effect
    mesh.onHover = () => setHoveredCluster(cluster.id);
    mesh.onLeave = () => setHoveredCluster(null);

    props.scene.add(mesh);
    hullMeshes.push(mesh);
  };

  const createClusterLabel = (cluster: any) => {
    if (!cluster.label || !THREE) return;

    // Create text sprite
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = 256;
    canvas.height = 64;

    // Draw text
    context.fillStyle = "rgba(0, 0, 0, 0.8)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "white";
    context.font = "24px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(cluster.label, canvas.width / 2, canvas.height / 2);

    // Create texture and sprite
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);

    sprite.position.copy(cluster.centroid);
    sprite.position.y += 0.5; // Offset above centroid
    sprite.scale.set(2, 0.5, 1);
    sprite.userData = { clusterId: cluster.id, type: "clusterLabel" };

    props.scene.add(sprite);
    textSprites.push(sprite);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!raycaster || !mouse || !props.camera) return;

    // Update mouse position
    const rect = (props.renderer as any).domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast
    raycaster.setFromCamera(mouse, props.camera);
    const intersects = raycaster.intersectObjects(hullMeshes);

    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      if (intersected.userData.clusterId) {
        setHoveredCluster(intersected.userData.clusterId);
      }
    } else {
      setHoveredCluster(null);
    }
  };

  const handleClick = (_event: MouseEvent) => {
    if (!raycaster || !mouse || !props.camera) return;

    raycaster.setFromCamera(mouse, props.camera);
    const intersects = raycaster.intersectObjects(hullMeshes);

    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      if (intersected.userData.clusterId && props.onClusterSelect) {
        props.onClusterSelect(intersected.userData.clusterId);
      }
    }
  };

  createEffect(async () => {
    if (!props.renderer || !props.camera) return;

    // Initialize Three.js if not already done
    if (!THREE) {
      THREE = await import("three");
    }

    // Initialize raycaster and mouse
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Add event listeners
    const canvas = (props.renderer as any).domElement;
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    onCleanup(() => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
    });
  });

  onCleanup(() => {
    clearClusterVisualizations();
  });

  return (
    <div class="cluster-visualization">
      <Show when={showStatistics()}>
        <div class="cluster-stats">
          <h3>Cluster Statistics</h3>
          <div class="stats-grid">
            {props.clusters.map((cluster) => (
              <div
                class={`stat-item ${hoveredCluster() === cluster.id ? "hovered" : ""} ${props.selectedClusterId === cluster.id ? "selected" : ""}`}
                onClick={() => props.onClusterSelect?.(cluster.id)}
              >
                <div class="stat-header">
                  <span class="cluster-name">{cluster.label}</span>
                  <span class="cluster-size">
                    {cluster.statistics.size} points
                  </span>
                </div>
                <div class="stat-details">
                  <div class="stat-row">
                    <span>Density:</span>
                    <span>{cluster.statistics.density.toFixed(2)}</span>
                  </div>
                  <div class="stat-row">
                    <span>Variance:</span>
                    <span>{cluster.statistics.variance.toFixed(2)}</span>
                  </div>
                  <div class="stat-row">
                    <span>Avg Similarity:</span>
                    <span>
                      {cluster.statistics.averageSimilarity.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Show>

      <div class="cluster-controls">
        <button
          onClick={() => setShowStatistics(!showStatistics())}
          class="toggle-stats"
        >
          {showStatistics() ? "Hide" : "Show"} Statistics
        </button>
      </div>
    </div>
  );
};
