// Cluster interactions composable for SolidJS
// Orchestrates modular cluster interaction functionality

import { createSignal, createEffect, onCleanup } from "solid-js";
import { setupClusterRaycaster } from "./useClusterRaycasterUtils";

import type { RendererLike, CameraLike } from "../types/threejs";

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

export interface ClusterInteractionConfig {
  renderer: RendererLike;
  camera: CameraLike;
  hullMeshes: ThreeMesh[];
  onClusterSelect?: (clusterId: string) => void;
}

export function useClusterInteractions(config: ClusterInteractionConfig) {
  const [hoveredCluster, setHoveredCluster] = createSignal<string | null>(null);

  // Setup raycaster and event listeners
  createEffect(async () => {
    if (!config.renderer || !config.camera) return;

    const cleanup = await setupClusterRaycaster(
      config.renderer,
      config.camera,
      config.hullMeshes,
      setHoveredCluster,
      config.onClusterSelect
    );

    onCleanup(cleanup);
  });

  return {
    hoveredCluster,
    setHoveredCluster,
  };
}
