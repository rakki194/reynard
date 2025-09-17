/**
 * Download Manager Component
 *
 * Main orchestrator component for gallery downloads with comprehensive
 * state management, progress tracking, and batch processing capabilities.
 */
import { Component } from "solid-js";
import type { BatchDownload, DownloadOptions, DownloadResult, ProgressState } from "../types";
export interface DownloadManagerProps {
    /** Service configuration */
    serviceConfig?: {
        baseUrl?: string;
        timeout?: number;
        token?: string;
    };
    /** Initial download options */
    defaultOptions?: DownloadOptions;
    /** Callback for download completion */
    onDownloadComplete?: (result: DownloadResult) => void;
    /** Callback for batch completion */
    onBatchComplete?: (batch: BatchDownload) => void;
    /** CSS class */
    class?: string;
}
export interface Download {
    id: string;
    url: string;
    options: DownloadOptions;
    status: "pending" | "downloading" | "completed" | "error" | "cancelled";
    progress: ProgressState;
    result?: DownloadResult;
    error?: string;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}
export interface DownloadQueue {
    id: string;
    downloads: Download[];
    status: "active" | "paused" | "stopped";
    maxConcurrent: number;
    createdAt: Date;
}
export declare const DownloadManager: Component<DownloadManagerProps>;
