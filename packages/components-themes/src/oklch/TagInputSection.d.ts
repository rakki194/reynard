/**
 * Tag Input Section Component
 * Handles tag name input and intensity control
 */
import { Component, Accessor, Setter } from "solid-js";
import "./TagComponents.css";
interface TagInputSectionProps {
    tagInput: Accessor<string>;
    setTagInput: Setter<string>;
    intensity: Accessor<number>;
    setIntensity: Setter<number>;
}
export declare const TagInputSection: Component<TagInputSectionProps>;
export {};
