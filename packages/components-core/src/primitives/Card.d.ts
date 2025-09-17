/**
 * Card Component
 * A flexible container component with consistent styling
 */
import { Component, JSX } from "solid-js";
export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /** Card variant */
    variant?: "default" | "elevated" | "outlined" | "filled";
    /** Padding size */
    padding?: "none" | "sm" | "md" | "lg";
    /** Whether the card is interactive */
    interactive?: boolean;
    /** Whether the card is selected */
    selected?: boolean;
    /** Header content */
    header?: JSX.Element;
    /** Footer content */
    footer?: JSX.Element;
    /** Children content */
    children?: JSX.Element;
}
export declare const Card: Component<CardProps>;
