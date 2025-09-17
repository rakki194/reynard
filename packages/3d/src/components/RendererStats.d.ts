import { Component } from "solid-js";
interface RendererStatsProps {
    materialStats: {
        cached: number;
    };
    geometryStats: {
        cached: number;
    };
}
export declare const RendererStats: Component<RendererStatsProps>;
export {};
