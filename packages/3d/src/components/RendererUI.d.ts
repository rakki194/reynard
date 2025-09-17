import { Component } from "solid-js";
import type { BasePointCloudRendererProps } from "../types/rendering";
interface RendererUIProps {
    props: BasePointCloudRendererProps;
    pointCloudRenderer: any;
    onConfigChange: (newConfig: any) => void;
}
export declare const RendererUI: Component<RendererUIProps>;
export {};
