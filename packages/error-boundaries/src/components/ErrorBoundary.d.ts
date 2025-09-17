/**
 * Main Error Boundary Component
 * Comprehensive error boundary with recovery and reporting capabilities
 */
import { Component, JSX } from "solid-js";
import { ErrorBoundaryConfig } from "../types/ErrorTypes";
export declare const ErrorBoundary: Component<ErrorBoundaryConfig & {
    children: JSX.Element;
}>;
export declare const withErrorBoundary: <P extends object>(Component: Component<P>, errorBoundaryProps?: Partial<ErrorBoundaryConfig>) => (props: P) => any;
