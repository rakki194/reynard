/**
 * P2P Connection Composable for WebSocket Management
 *
 * This module handles WebSocket connections, reconnection logic, and connection state
 * management for peer-to-peer chat functionality.
 */
export interface P2PConnectionState {
    status: "disconnected" | "connecting" | "connected" | "reconnecting" | "error";
    lastConnected: number | undefined;
    reconnectAttempts: number;
    protocol: "websocket" | "webrtc" | "sse";
}
export interface P2PConnectionOptions {
    /** WebSocket/SSE endpoint for real-time communication */
    realtimeEndpoint: string;
    /** Reconnection options */
    reconnection?: {
        enabled: boolean;
        maxAttempts: number;
        delay: number;
        backoff: number;
    };
    /** Auto-connect on mount */
    autoConnect?: boolean;
}
export interface P2PConnectionReturn {
    connectionState: () => P2PConnectionState;
    websocket: () => WebSocket | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    reconnect: () => Promise<void>;
    isConnected: () => boolean;
    isConnecting: () => boolean;
    isReconnecting: () => boolean;
}
export declare function useP2PConnection(options: P2PConnectionOptions): P2PConnectionReturn;
