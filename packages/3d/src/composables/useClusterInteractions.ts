import { createSignal, createEffect, onCleanup } from "solid-js";

export interface ClusterInteractionConfig {
  renderer: any;
  camera: any;
  hullMeshes: any[];
  onClusterSelect?: (clusterId: string) => void;
}

export function useClusterInteractions(config: ClusterInteractionConfig) {
  const [hoveredCluster, setHoveredCluster] = createSignal<string | null>(null);

  let raycaster: any = null;
  let mouse: any = null;

  const handleMouseMove = (event: MouseEvent) => {
    if (!raycaster || !mouse || !config.camera) return;

    // Update mouse position
    const rect = (config.renderer as any).domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast
    raycaster.setFromCamera(mouse, config.camera);
    const intersects = raycaster.intersectObjects(config.hullMeshes);

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
    if (!raycaster || !mouse || !config.camera) return;

    raycaster.setFromCamera(mouse, config.camera);
    const intersects = raycaster.intersectObjects(config.hullMeshes);

    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      if (intersected.userData.clusterId && config.onClusterSelect) {
        config.onClusterSelect(intersected.userData.clusterId);
      }
    }
  };

  createEffect(async () => {
    if (!config.renderer || !config.camera) return;

    // Initialize Three.js if not already done
    let THREE: any = null;
    if (!THREE) {
      THREE = await import("three");
    }

    // Initialize raycaster and mouse
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Add event listeners
    const canvas = (config.renderer as any).domElement;
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    onCleanup(() => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
    });
  });

  return {
    hoveredCluster,
    setHoveredCluster,
  };
}
