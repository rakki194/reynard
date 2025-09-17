/**
 * Tag Display Component
 * Shows a single tag with dynamic styling
 */
import { Component, Accessor } from "solid-js";
import "./TagComponents.css";
interface TagDisplayProps {
    tagName: Accessor<string>;
    intensity: Accessor<number>;
}
export declare const TagDisplay: Component<TagDisplayProps>;
export {};
