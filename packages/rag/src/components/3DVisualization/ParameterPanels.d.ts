/**
 * Parameter Panels Component
 *
 * Renders algorithm-specific parameter controls for 3D visualization
 */
import { Component } from "solid-js";
import type { TsneParams, UmapParams, PcaParams } from "../../composables/use3DVisualizationParams";
interface ParameterPanelsProps {
    reductionMethod: "tsne" | "umap" | "pca";
    tsneParams: TsneParams;
    setTsneParams: (updater: (prev: TsneParams) => TsneParams) => void;
    umapParams: UmapParams;
    setUmapParams: (updater: (prev: UmapParams) => UmapParams) => void;
    pcaParams: PcaParams;
    setPcaParams: (updater: (prev: PcaParams) => PcaParams) => void;
}
export declare const ParameterPanels: Component<ParameterPanelsProps>;
export {};
