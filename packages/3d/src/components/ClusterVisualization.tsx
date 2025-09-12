import { Component, createEffect, onCleanup, createMemo, createSignal } from "solid-js";
import type { ClusterVisualizationProps } from "../types/rendering";
import { ClusterStatisticsPanel } from "./ClusterStatisticsPanel";
import { useClusterInteractions } from "../composables/useClusterInteractions";
import { ClusterRenderer } from "../utils/clusterRenderer";

export const ClusterVisualization: Component<ClusterVisualizationProps> = (
  props,
) => {
  const [hoveredCluster, setHoveredCluster] = createSignal<string | null>(null);

  // Create cluster renderer
  const clusterRenderer = createMemo(() => 
    new ClusterRenderer({
      scene: props.scene,
      renderer: props.renderer,
      camera: props.camera,
    })
  );

  // Set up cluster interactions
  createEffect(() => {
    useClusterInteractions({
      renderer: props.renderer,
      camera: props.camera,
      hullMeshes: clusterRenderer().getHullMeshes(),
      onClusterSelect: props.onClusterSelect,
    });
  });

  // Render clusters when they change
  createEffect(() => {
    if (!props.scene || !props.clusters) return;
    
    // Use setTimeout to handle async operations outside of reactive scope
    setTimeout(async () => {
      await clusterRenderer().renderClusters(
        props.clusters,
        (clusterId) => {
          setHoveredCluster(clusterId || null);
        }
      );
    }, 0);
  });

  onCleanup(() => {
    clusterRenderer().dispose();
  });

  return (
    <ClusterStatisticsPanel
      clusters={props.clusters}
      hoveredClusterId={hoveredCluster()}
      selectedClusterId={props.selectedClusterId}
      onClusterSelect={props.onClusterSelect}
    />
  );
};
