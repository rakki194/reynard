/**
 * Batch Download Manager Component
 *
 * Manages batch downloads with priority queues, progress tracking, and real-time updates.
 * Provides interface for creating, monitoring, and controlling batch downloads.
 */
export interface BatchDownload {
    batch_id: string;
    name: string;
    total_items: number;
    status: string;
    created_at: string;
    completed_items?: number;
    failed_items?: number;
}
export interface BatchDownloadItem {
    id: string;
    url: string;
    status: string;
    priority: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
    error?: string;
    retry_count: number;
}
export interface BatchDownloadRequest {
    name: string;
    urls: string[];
    options?: Record<string, any>;
    priority?: string;
    settings?: Record<string, any>;
}
export declare function BatchDownloadManager(): any;
