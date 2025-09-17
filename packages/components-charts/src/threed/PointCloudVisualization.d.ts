/**
 * Point Cloud 3D Visualization
 * Interactive point cloud with theme-aware colors
 */
import { Component } from "solid-js";
interface PointCloudVisualizationProps {
    width?: number;
    height?: number;
    theme: string;
    pointCount?: number;
}
export declare const PointCloudVisualization: Component<PointCloudVisualizationProps>;
export {};
