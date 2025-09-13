// Cluster raycaster utility functions
// Extracted from useClusterInteractions for modularity

import type { ThreeJSModule } from "../types/threejs";
import type { CameraLike, RendererLike } from "../types/threejs";

// Three.js mesh interface for cluster hulls
interface ThreeMesh {
  id?: string;
  position?: { set: (x: number, y: number, z: number) => void };
  rotation?: { set: (x: number, y: number, z: number) => void };
  scale?: { set: (x: number, y: number, z: number) => void };
  visible?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  geometry?: unknown;
  material?: unknown;
  userData?: Record<string, unknown>;
}

export async function setupClusterRaycaster(
  renderer: RendererLike,
  camera: CameraLike,
  hullMeshes: ThreeMesh[],
  setHoveredCluster: (clusterId: string | null) => void,
  onClusterSelect?: (clusterId: string) => void,
) {
  const THREE = (await import("three")).default as unknown as ThreeJSModule;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const handleMouseMove = (event: MouseEvent) => {
    if (!raycaster || !mouse || !camera || !renderer.domElement) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(hullMeshes);

    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      if (
        intersected.userData?.clusterId &&
        typeof intersected.userData.clusterId === "string"
      ) {
        setHoveredCluster(intersected.userData.clusterId);
      }
    } else {
      setHoveredCluster(null);
    }
  };

  const handleClick = (_event: MouseEvent) => {
    if (!raycaster || !mouse || !camera) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(hullMeshes);

    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      if (
        intersected.userData?.clusterId &&
        typeof intersected.userData.clusterId === "string" &&
        onClusterSelect
      ) {
        onClusterSelect(intersected.userData.clusterId);
      }
    }
  };

  if (!renderer.domElement) {
    throw new Error("Renderer must have a domElement for cluster interactions");
  }

  const canvas = renderer.domElement;
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("click", handleClick);

  return () => {
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("click", handleClick);
  };
}
