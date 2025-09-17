/**
 * Custom Tag Generator Component
 * Interactive tag color generation with custom inputs
 */
import { Component } from "solid-js";
interface CustomTagGeneratorProps {
    availableThemes: string[];
    customTag: string;
    tagIntensity: number;
    onTagChange: (tag: string) => void;
    onIntensityChange: (intensity: number) => void;
}
export declare const CustomTagGenerator: Component<CustomTagGeneratorProps>;
export {};
