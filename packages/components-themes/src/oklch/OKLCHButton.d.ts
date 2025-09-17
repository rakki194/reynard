/**
 * OKLCH Button Component
 * Example component demonstrating OKLCH color usage
 */
import { Component, JSX } from "solid-js";
import "./OKLCHButton.css";
interface OKLCHButtonProps {
    children: JSX.Element;
    variant?: "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "info";
    size?: "small" | "medium" | "large";
    disabled?: boolean;
    onClick?: () => void;
    class?: string;
}
export declare const OKLCHButton: Component<OKLCHButtonProps>;
export {};
