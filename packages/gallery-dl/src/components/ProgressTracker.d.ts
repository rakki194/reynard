/**
 * Progress Tracker Component
 *
 * Real-time progress tracking component for gallery downloads with
 * comprehensive status indicators and visual feedback.
 */
import { Component } from "solid-js";
import type { ProgressState } from "../types";
export interface ProgressTrackerProps {
    /** Download progress state */
    progress: ProgressState;
    /** Download ID */
    downloadId: string;
    /** Download URL */
    url: string;
    /** Callback for cancel action */
    onCancel?: () => void;
    /** Callback for retry action */
    onRetry?: () => void;
    /** Whether to show detailed information */
    showDetails?: boolean;
    /** CSS class */
    class?: string;
}
export declare const ProgressTracker: Component<ProgressTrackerProps>;
