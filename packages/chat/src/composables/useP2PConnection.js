/**
 * P2P Connection Composable for WebSocket Management
 *
 * This module handles WebSocket connections, reconnection logic, and connection state
 * management for peer-to-peer chat functionality.
 */
import { createSignal, batch, onCleanup } from "solid-js";
export function useP2PConnection(options) {
    const { realtimeEndpoint, reconnection = {
        enabled: true,
        maxAttempts: 5,
        delay: 1000,
        backoff: 1.5,
    }, autoConnect = true, } = options;
    // Connection state
    const [p2pConnection, setP2pConnection] = createSignal({
        status: "disconnected",
        lastConnected: undefined,
        reconnectAttempts: 0,
        protocol: "websocket",
    });
    // WebSocket connection
    const [websocket, setWebSocket] = createSignal(null);
    const [reconnectTimer, setReconnectTimer] = createSignal(null);
    // Connect to WebSocket
    const connectWebSocket = async () => {
        if (websocket()?.readyState === WebSocket.OPEN) {
            return;
        }
        try {
            setP2pConnection((prev) => ({ ...prev, status: "connecting" }));
            const ws = new WebSocket(realtimeEndpoint);
            ws.onopen = () => {
                batch(() => {
                    setWebSocket(ws);
                    setP2pConnection({
                        status: "connected",
                        lastConnected: Date.now(),
                        reconnectAttempts: 0,
                        protocol: "websocket",
                    });
                });
            };
            ws.onclose = (event) => {
                setWebSocket(null);
                if (!event.wasClean && reconnection.enabled) {
                    scheduleReconnect();
                }
                else {
                    setP2pConnection((prev) => ({ ...prev, status: "disconnected" }));
                }
            };
            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                setP2pConnection((prev) => ({ ...prev, status: "error" }));
            };
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleWebSocketMessage(data);
                }
                catch (error) {
                    console.error("Failed to parse WebSocket message:", error);
                }
            };
        }
        catch (error) {
            console.error("Failed to connect to WebSocket:", error);
            setP2pConnection((prev) => ({ ...prev, status: "error" }));
        }
    };
    // Handle incoming WebSocket messages
    const handleWebSocketMessage = (data) => {
        // This will be handled by the message composable
        // For now, just log the message
        console.log("WebSocket message received:", data);
    };
    // Schedule reconnection
    const scheduleReconnect = () => {
        const attempts = p2pConnection().reconnectAttempts;
        if (attempts >= reconnection.maxAttempts) {
            setP2pConnection((prev) => ({ ...prev, status: "error" }));
            return;
        }
        setP2pConnection((prev) => ({
            ...prev,
            status: "reconnecting",
            reconnectAttempts: attempts + 1,
        }));
        const delay = reconnection.delay * Math.pow(reconnection.backoff, attempts);
        const timer = setTimeout(() => {
            connectWebSocket();
        }, delay);
        setReconnectTimer(timer);
    };
    // Connect function
    const connect = async () => {
        await connectWebSocket();
    };
    // Disconnect function
    const disconnect = () => {
        const timer = reconnectTimer();
        if (timer) {
            clearTimeout(timer);
            setReconnectTimer(null);
        }
        const ws = websocket();
        if (ws) {
            ws.close();
            setWebSocket(null);
        }
        setP2pConnection((prev) => ({ ...prev, status: "disconnected" }));
    };
    // Reconnect function
    const reconnect = async () => {
        disconnect();
        await connect();
    };
    // Computed properties
    const isConnected = () => p2pConnection().status === "connected";
    const isConnecting = () => p2pConnection().status === "connecting";
    const isReconnecting = () => p2pConnection().status === "reconnecting";
    // Auto-connect on mount
    if (autoConnect) {
        connect();
    }
    // Cleanup on unmount
    onCleanup(() => {
        disconnect();
    });
    return {
        connectionState: p2pConnection,
        websocket,
        connect,
        disconnect,
        reconnect,
        isConnected,
        isConnecting,
        isReconnecting,
    };
}
