/**
 * Visualization Controls Component
 *
 * Main control panel for 3D visualization settings
 */
import { Component } from "solid-js";
import type { TsneParams, UmapParams, PcaParams, VisualizationSettings } from "../../composables/use3DVisualizationParams";
interface VisualizationControlsProps {
    reductionMethod: "tsne" | "umap" | "pca";
    setReductionMethod: (method: "tsne" | "umap" | "pca") => void;
    settings: VisualizationSettings;
    setPointSize: (size: number) => void;
    setEnableHighlighting: (enabled: boolean) => void;
    setShowSimilarityPaths: (show: boolean) => void;
    setShowSimilarityRadius: (show: boolean) => void;
    setRadiusThreshold: (threshold: number) => void;
    showParameterControls: boolean;
    setShowParameterControls: (show: boolean) => void;
    tsneParams: TsneParams;
    setTsneParams: (updater: (prev: TsneParams) => TsneParams) => void;
    umapParams: UmapParams;
    setUmapParams: (updater: (prev: UmapParams) => UmapParams) => void;
    pcaParams: PcaParams;
    setPcaParams: (updater: (prev: PcaParams) => PcaParams) => void;
    onRefresh: () => void;
    isLoading: boolean;
}
export declare const VisualizationControls: Component<VisualizationControlsProps>;
export {};
