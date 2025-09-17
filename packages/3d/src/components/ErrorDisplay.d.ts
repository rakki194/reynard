import { Component } from "solid-js";
export interface ErrorDisplayProps {
    error: string;
    onRetry: () => void;
}
export declare const ErrorDisplay: Component<ErrorDisplayProps>;
