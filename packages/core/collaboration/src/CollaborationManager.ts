/**
 * Core Collaboration Manager for Reynard
 *
 * Manages real-time collaboration sessions, document synchronization,
 * user presence, and WebSocket connections using Yjs and the existing
 * Reynard connection infrastructure.
 */

import { createSignal } from "solid-js";
import { Doc as YDoc } from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import { Awareness } from "y-protocols/awareness";
import {
  CollaborationConfig,
  CollaborationState,
  CollaborationRoom,
  CollaborationDocument,
  CollaborationUser,
  UserPresence,
  CollaborationEvent,
  CollaborationEventType,
  CollaborationError,
  CollaborationErrorCode,
  DocumentType,
  UserRole,
} from "./types";
import { ConnectionHealth } from "reynard-connection";
// Note: WebSocketConnection will be imported when available in the main export

export class CollaborationManager {
  private config: CollaborationConfig;
  // private connectionManager: ConnectionManager;
  // private wsConnection?: any; // WebSocketConnection - will be properly typed when available
  private yjsDoc?: YDoc;
  private yjsProvider?: WebsocketProvider;
  private indexeddbPersistence?: IndexeddbPersistence;
  private awareness?: Awareness;

  // State signals
  private stateSignal = createSignal<CollaborationState>({
    isConnected: false,
    isSyncing: false,
    isOnline: navigator.onLine,
    users: new Map(),
    presence: new Map(),
    metrics: {
      connectionLatency: 0,
      connectionUptime: 0,
      reconnectionCount: 0,
      documentSize: 0,
      changeCount: 0,
      conflictCount: 0,
      syncTime: 0,
      activeUsers: 0,
      totalUsers: 0,
      userActivity: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      networkUsage: 0,
    },
  });

  // Event handlers
  private eventHandlers = new Map<CollaborationEventType, Set<Function>>();

  // Internal state
  private currentRoom?: CollaborationRoom;
  private currentDocument?: CollaborationDocument;
  private currentUser?: CollaborationUser;
  // private reconnectAttempts = 0;
  // private maxReconnectAttempts = 5;
  // private reconnectTimeout?: number;
  // private heartbeatInterval?: number;
  private metricsInterval?: number;

  constructor(config: CollaborationConfig) {
    this.config = config;
    // this.connectionManager = new ConnectionManager();

    this.initializeConnection();
    this.setupEventListeners();
    this.startMetricsCollection();
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Get the current collaboration state
   */
  get state(): CollaborationState {
    return this.stateSignal[0]();
  }

  /**
   * Get the current room
   */
  get room(): CollaborationRoom | undefined {
    return this.currentRoom;
  }

  /**
   * Get the current document
   */
  get document(): CollaborationDocument | undefined {
    return this.currentDocument;
  }

  /**
   * Get the current user
   */
  get user(): CollaborationUser | undefined {
    return this.currentUser;
  }

  /**
   * Check if connected to collaboration server
   */
  get isConnected(): boolean {
    return this.state.isConnected;
  }

  /**
   * Check if currently syncing
   */
  get isSyncing(): boolean {
    return this.state.isSyncing;
  }

  /**
   * Join a collaboration room
   */
  async joinRoom(roomId: string, userId: string, userInfo: Partial<CollaborationUser>): Promise<void> {
    try {
      this.currentUser = {
        id: userId,
        name: userInfo.name || "Anonymous",
        email: userInfo.email,
        avatar: userInfo.avatar,
        color: userInfo.color || this.generateUserColor(),
        isOnline: true,
        permissions: {
          role: userInfo.permissions?.role || UserRole.VIEWER,
          canEdit: userInfo.permissions?.canEdit || false,
          canComment: userInfo.permissions?.canComment || false,
          canInvite: userInfo.permissions?.canInvite || false,
          canManage: userInfo.permissions?.canManage || false,
        },
      };

      // Connect to WebSocket if not already connected
      if (!this.isConnected) {
        await this.connect();
      }

      // Create or join Yjs document
      await this.createYjsDocument(roomId);

      // Set up awareness
      this.setupAwareness();

      // Set current room
      this.currentRoom = {
        id: roomId,
        name: `Room ${roomId}`,
        documentId: `doc-${roomId}`,
        users: new Map([[userId, this.currentUser]]),
        permissions: {
          isPublic: false,
          allowGuests: false,
          requireAuth: true,
          maxUsers: 10,
        },
        settings: {
          enableVideoChat: false,
          enableScreenShare: false,
          enableRecording: false,
          enableTranscription: false,
          enableComments: true,
          enableSuggestions: true,
          autoSave: true,
          saveInterval: 30,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Update state
      this.stateSignal[1](prev => ({
        ...prev,
        currentUser: this.currentUser,
        currentRoom: this.currentRoom,
        isConnected: true,
      }));

      this.emitEvent(CollaborationEventType.USER_JOINED, {
        userId,
        roomId,
        timestamp: Date.now(),
      });
    } catch (error) {
      throw new CollaborationError(
        `Failed to join room ${roomId}: ${error instanceof Error ? error.message : String(error)}`,
        CollaborationErrorCode.CONNECTION_FAILED,
        { roomId, userId, error }
      );
    }
  }

  /**
   * Leave the current room
   */
  async leaveRoom(): Promise<void> {
    try {
      if (this.currentUser && this.currentRoom) {
        this.emitEvent(CollaborationEventType.USER_LEFT, {
          userId: this.currentUser.id,
          roomId: this.currentRoom.id,
          timestamp: Date.now(),
        });
      }

      // Clean up Yjs resources
      await this.cleanupYjsDocument();

      // Update state
      this.stateSignal[1](prev => ({
        ...prev,
        currentRoom: undefined,
        currentDocument: undefined,
        currentUser: undefined,
        users: new Map(),
        presence: new Map(),
        isConnected: false,
      }));

      this.currentRoom = undefined;
      this.currentDocument = undefined;
      this.currentUser = undefined;
    } catch (error) {
      throw new CollaborationError(
        `Failed to leave room: ${error instanceof Error ? error.message : String(error)}`,
        CollaborationErrorCode.UNKNOWN_ERROR,
        { error }
      );
    }
  }

  /**
   * Create a new document
   */
  async createDocument(
    name: string,
    type: DocumentType,
    content: string = "",
    metadata: Record<string, unknown> = {}
  ): Promise<CollaborationDocument> {
    try {
      const document: CollaborationDocument = {
        id: this.generateDocumentId(),
        name,
        type,
        content,
        metadata: {
          language: this.getLanguageFromType(type),
          encoding: "utf-8",
          lineEnding: "lf",
          tabSize: 2,
          insertSpaces: true,
          wordWrap: true,
          readOnly: false,
          ...metadata,
        },
        permissions: {
          canRead: true,
          canWrite: true,
          canShare: true,
          canDelete: true,
          canManage: true,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      };

      this.currentDocument = document;

      this.stateSignal[1](prev => ({
        ...prev,
        currentDocument: document,
      }));

      this.emitEvent(CollaborationEventType.DOCUMENT_CREATED, {
        documentId: document.id,
        documentName: document.name,
        documentType: document.type,
        timestamp: Date.now(),
      });

      return document;
    } catch (error) {
      throw new CollaborationError(
        `Failed to create document: ${error instanceof Error ? error.message : String(error)}`,
        CollaborationErrorCode.UNKNOWN_ERROR,
        { name, type, error }
      );
    }
  }

  /**
   * Update user presence (cursor position, selection, etc.)
   */
  updatePresence(presence: Partial<UserPresence>): void {
    if (!this.currentUser || !this.awareness) return;

    const currentPresence: UserPresence = {
      userId: this.currentUser.id,
      documentId: this.currentDocument?.id || "",
      isTyping: false,
      lastActivity: Date.now(),
      connectionHealth: ConnectionHealth.HEALTHY,
      ...presence,
    };

    // Update Yjs awareness
    this.awareness.setLocalStateField("user", {
      name: this.currentUser.name,
      color: this.currentUser.color,
      cursor: currentPresence.cursor,
      selection: currentPresence.selection,
      isTyping: currentPresence.isTyping,
    });

    // Update local state
    this.stateSignal[1](prev => ({
      ...prev,
      presence: new Map(prev.presence.set(this.currentUser!.id, currentPresence)),
    }));

    this.emitEvent(CollaborationEventType.USER_PRESENCE_UPDATED, {
      userId: this.currentUser.id,
      presence: currentPresence,
      timestamp: Date.now(),
    });
  }

  /**
   * Add event listener
   */
  addEventListener<T = unknown>(
    eventType: CollaborationEventType,
    handler: (event: CollaborationEvent & { data: T }) => void
  ): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType: CollaborationEventType, handler: Function): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Add an event handler for collaboration events (alias for addEventListener)
   * @param eventType The type of event to listen for
   * @param handler The callback function
   */
  addEventHandler(eventType: CollaborationEventType, handler: (event: CollaborationEvent) => void): void {
    this.addEventListener(eventType, handler);
  }

  /**
   * Remove an event handler (alias for removeEventListener)
   * @param eventType The type of event
   * @param handler The callback function to remove
   */
  removeEventHandler(eventType: CollaborationEventType, handler: (event: CollaborationEvent) => void): void {
    this.removeEventListener(eventType, handler);
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    try {
      await this.leaveRoom();
      await this.cleanup();
    } catch (error) {
      console.error("Error during disconnect:", error);
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async initializeConnection(): Promise<void> {
    // TODO: Initialize WebSocket connection when WebSocketConnection is available
    // const wsConfig: ConnectionConfig = {
    //   name: "collaboration-websocket",
    //   connectionType: ConnectionType.WEBSOCKET,
    //   url: this.config.connection.url,
    //   timeout: this.config.connection.timeout,
    //   retryCount: this.config.connection.retryCount,
    //   retryDelay: this.config.connection.retryDelay,
    //   autoReconnect: true,
    //   recoveryStrategy: "reconnect_backoff" as any,
    // };
    // this.wsConnection = new WebSocketConnection(wsConfig);
    // this.connectionManager.addConnection(this.wsConnection, "collaboration");
  }

  private async connect(): Promise<void> {
    // TODO: Implement WebSocket connection when WebSocketConnection is available
    // For now, we'll use Yjs provider directly
    this.stateSignal[1](prev => ({
      ...prev,
      isConnected: true,
    }));
  }

  private async createYjsDocument(roomId: string): Promise<void> {
    this.yjsDoc = new YDoc();

    // Set up WebSocket provider
    this.yjsProvider = new WebsocketProvider(this.config.connection.url, roomId, this.yjsDoc, {
      awareness: this.awareness,
    });

    // Set up IndexedDB persistence
    this.indexeddbPersistence = new IndexeddbPersistence(roomId, this.yjsDoc);

    // Wait for initial sync
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Yjs sync timeout"));
      }, 10000);

      this.yjsProvider!.on("status", (event: any) => {
        if (event.status === "connected") {
          clearTimeout(timeout);
          resolve();
        }
      });

      this.yjsProvider!.on("connection-error", (error: any) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    this.stateSignal[1](prev => ({
      ...prev,
      isSyncing: false,
    }));
  }

  private setupAwareness(): void {
    if (!this.yjsProvider) return;

    this.awareness = this.yjsProvider.awareness;

    this.awareness.on("change", () => {
      const states = this.awareness!.getStates();
      const users = new Map<string, CollaborationUser>();
      const presence = new Map<string, UserPresence>();

      states.forEach((state, clientId) => {
        if (state.user) {
          const user: CollaborationUser = {
            id: clientId.toString(),
            name: state.user.name,
            color: state.user.color,
            isOnline: true,
            permissions: {
              role: UserRole.VIEWER,
              canEdit: false,
              canComment: false,
              canInvite: false,
              canManage: false,
            },
          };

          const userPresence: UserPresence = {
            userId: clientId.toString(),
            documentId: this.currentDocument?.id || "",
            cursor: state.user.cursor,
            selection: state.user.selection,
            isTyping: state.user.isTyping || false,
            lastActivity: Date.now(),
            connectionHealth: ConnectionHealth.HEALTHY,
          };

          users.set(clientId.toString(), user);
          presence.set(clientId.toString(), userPresence);
        }
      });

      this.stateSignal[1](prev => ({
        ...prev,
        users,
        presence,
        metrics: {
          ...prev.metrics,
          activeUsers: users.size,
        },
      }));
    });
  }

  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener("online", () => {
      this.stateSignal[1](prev => ({ ...prev, isOnline: true }));
    });

    window.addEventListener("offline", () => {
      this.stateSignal[1](prev => ({ ...prev, isOnline: false }));
    });

    // Cleanup on page unload
    window.addEventListener("beforeunload", () => {
      this.disconnect();
    });
  }

  // private startHeartbeat(): void {
  //   // TODO: Implement heartbeat when WebSocket connection is available
  //   // this.heartbeatInterval = window.setInterval(() => {
  //   //   if (this.wsConnection && this.isConnected) {
  //   //     this.wsConnection.send({ type: "ping", timestamp: Date.now() });
  //   //   }
  //   // }, this.config.connection.heartbeatInterval);
  // }

  private startMetricsCollection(): void {
    this.metricsInterval = window.setInterval(() => {
      this.updateMetrics();
    }, 5000); // Update every 5 seconds
  }

  private updateMetrics(): void {
    this.stateSignal[1](prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        connectionUptime: Date.now() - (prev.metrics.connectionUptime || Date.now()),
        memoryUsage: this.getMemoryUsage(),
        networkUsage: this.getNetworkUsage(),
      },
    }));
  }

  private async cleanupYjsDocument(): Promise<void> {
    if (this.yjsProvider) {
      this.yjsProvider.destroy();
      this.yjsProvider = undefined;
    }

    if (this.indexeddbPersistence) {
      this.indexeddbPersistence.destroy();
      this.indexeddbPersistence = undefined;
    }

    if (this.yjsDoc) {
      this.yjsDoc.destroy();
      this.yjsDoc = undefined;
    }

    this.awareness = undefined;
  }

  private async cleanup(): Promise<void> {
    // if (this.heartbeatInterval) {
    //   clearInterval(this.heartbeatInterval);
    //   this.heartbeatInterval = undefined;
    // }

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = undefined;
    }

    // if (this.reconnectTimeout) {
    //   clearTimeout(this.reconnectTimeout);
    //   this.reconnectTimeout = undefined;
    // }

    await this.cleanupYjsDocument();

    // TODO: Disconnect WebSocket when available
    // if (this.wsConnection) {
    //   await this.wsConnection.disconnect();
    //   this.wsConnection = undefined;
    // }

    this.stateSignal[1](prev => ({
      ...prev,
      isConnected: false,
      isSyncing: false,
    }));
  }

  private emitEvent<T = unknown>(type: CollaborationEventType, data: T): void {
    const event: CollaborationEvent = {
      type,
      timestamp: Date.now(),
      userId: this.currentUser?.id || "",
      documentId: this.currentDocument?.id || "",
      roomId: this.currentRoom?.id || "",
      data,
    };

    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${type}:`, error);
        }
      });
    }
  }

  private generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUserColor(): string {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getLanguageFromType(type: DocumentType): string {
    const languageMap: Record<DocumentType, string> = {
      [DocumentType.TEXT]: "plaintext",
      [DocumentType.CODE]: "javascript",
      [DocumentType.MARKDOWN]: "markdown",
      [DocumentType.JSON]: "json",
      [DocumentType.YAML]: "yaml",
      [DocumentType.XML]: "xml",
      [DocumentType.HTML]: "html",
      [DocumentType.CSS]: "css",
      [DocumentType.JAVASCRIPT]: "javascript",
      [DocumentType.TYPESCRIPT]: "typescript",
      [DocumentType.PYTHON]: "python",
      [DocumentType.SQL]: "sql",
    };
    return languageMap[type] || "plaintext";
  }

  private getMemoryUsage(): number {
    if ("memory" in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private getNetworkUsage(): number {
    // This would need to be implemented with actual network monitoring
    return 0;
  }
}
