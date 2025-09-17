/**
 * Status Display Component
 * Renders individual status items with consistent styling
 */
import { Component } from "solid-js";
interface StatusItemProps {
    label: string;
    value: string;
    statusClass?: string;
}
export declare const StatusItem: Component<StatusItemProps>;
export { StatusItem as StatusDisplay };
