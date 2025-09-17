/**
 * Gradient Demo Component
 * Shows OKLCH gradient examples
 */
import { Component } from "solid-js";
interface GradientDemoItem {
    name: string;
    gradient: string;
}
interface GradientDemoProps {
    gradientDemos?: GradientDemoItem[];
}
export declare const GradientDemo: Component<GradientDemoProps>;
export {};
