/**
 * Gallery WebSocket Composable
 *
 * Provides real-time WebSocket connection for gallery download progress updates.
 * Handles connection management, subscription to downloads, and message processing.
 */
export interface WebSocketMessage {
    type: string;
    data: any;
}
export interface ProgressUpdate {
    download_id: string;
    url: string;
    status: string;
    percentage: number;
    current_file?: string;
    total_files: number;
    downloaded_files: number;
    total_bytes: number;
    downloaded_bytes: number;
    speed: number;
    estimated_time?: number;
    message?: string;
    error?: string;
    timestamp: string;
}
export interface DownloadEvent {
    download_id: string;
    url: string;
    timestamp: string;
    result?: any;
    error?: string;
}
export interface WebSocketState {
    connected: boolean;
    connecting: boolean;
    error: string | null;
    subscribedDownloads: Set<string>;
}
export interface WebSocketActions {
    connect: () => Promise<void>;
    disconnect: () => void;
    subscribe: (downloadId: string) => void;
    unsubscribe: (downloadId: string) => void;
    sendMessage: (message: any) => void;
    ping: () => void;
}
export declare function useGalleryWebSocket(baseUrl?: string): {
    connected: () => boolean;
    connecting: () => boolean;
    error: () => string | null;
    subscribedDownloads: () => Set<string>;
    progressUpdates: import("solid-js").Accessor<Map<string, ProgressUpdate>>;
    downloadEvents: import("solid-js").Accessor<Map<string, DownloadEvent[]>>;
    connect: () => Promise<void>;
    disconnect: () => void;
    subscribe: (downloadId: string) => void;
    unsubscribe: (downloadId: string) => void;
    sendMessage: (message: any) => void;
    ping: () => void;
    getProgress: (downloadId: string) => ProgressUpdate | undefined;
    getEvents: (downloadId: string) => DownloadEvent[];
    getActiveDownloads: () => ProgressUpdate[];
};
