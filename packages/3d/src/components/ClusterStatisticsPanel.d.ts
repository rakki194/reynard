import { Component } from "solid-js";
import type { ClusterData } from "../types/rendering";
import "./ClusterStatisticsPanel.css";
export interface ClusterStatisticsPanelProps {
    clusters: ClusterData[];
    hoveredClusterId: string | null;
    selectedClusterId?: string;
    onClusterSelect?: (clusterId: string) => void;
}
export declare const ClusterStatisticsPanel: Component<ClusterStatisticsPanelProps>;
