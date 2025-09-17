/**
 * Label Selector Component
 *
 * Provides label selection and management for bounding box annotations
 */
import type { Component } from "solid-js";
export interface LabelSelectorProps {
    availableLabels: string[];
    selectedLabel: string;
    onLabelChange: (label: string) => void;
    onAddLabel?: (label: string) => void;
    className?: string;
}
export declare const LabelSelector: Component<LabelSelectorProps>;
