/**
 * Reynard Collaboration Package
 *
 * Real-time collaboration system for Reynard applications with Yjs, Monaco Editor,
 * and WebRTC integration. Provides document synchronization, user presence,
 * and collaborative editing capabilities.
 */

// Core classes
export { CollaborationManager } from "./CollaborationManager";
export { YjsDocumentManager } from "./YjsDocumentManager";

// Import types for use in this file
import type { CollaborationConfig, YjsProviderConfig } from "./types";
import { ProviderType } from "./types";
import { CollaborationManager } from "./CollaborationManager";
import { YjsDocumentManager } from "./YjsDocumentManager";

// Types and interfaces
export type {
  // Document types
  CollaborationDocument,
  DocumentMetadata,
  DocumentPermissions,

  // User types
  CollaborationUser,
  UserPermissions,
  UserPresence,
  CursorPosition,
  SelectionRange,

  // Room types
  CollaborationRoom,
  RoomPermissions,
  RoomSettings,
  CollaborationSession,
  SessionMetadata,

  // Yjs types
  YjsDocument,
  YjsProviderConfig,

  // Event types
  CollaborationEvent,
  CollaborationEventHandler,

  // Configuration types
  CollaborationConfig,

  // Error types
  CollaborationError,

  // Utility types
  CollaborationMetrics,
  CollaborationState,
} from "./types";

export {
  // Enums
  DocumentType,
  UserRole,
  ProviderType,
  CollaborationEventType,
  CollaborationErrorCode,
} from "./types";

// Re-export Yjs types for convenience
export type { Doc as YDoc, Text as YText, Map as YMap, Array as YArray, XmlFragment as YXmlFragment } from "yjs";
export { WebsocketProvider } from "y-websocket";
export { IndexeddbPersistence } from "y-indexeddb";
export { Awareness } from "y-protocols/awareness";

// Re-export connection types
export type { ConnectionType, ConnectionHealth, ConnectionConfig } from "reynard-connection";

// Default configuration
export const DEFAULT_COLLABORATION_CONFIG: CollaborationConfig = {
  connection: {
    type: "WEBSOCKET" as any,
    url: "ws://localhost:8080",
    timeout: 30000,
    retryCount: 5,
    retryDelay: 1000,
    heartbeatInterval: 30000,
  },
  yjs: {
    provider: {
      type: ProviderType.WEBSOCKET,
      url: "ws://localhost:8080",
      room: "default-room",
      awareness: true,
      maxConns: 20,
      filterBcConns: true,
    },
    awareness: true,
    maxConns: 20,
    filterBcConns: true,
  },
  document: {
    autoSave: true,
    saveInterval: 5000,
    maxHistorySize: 100,
    compressionEnabled: true,
  },
  user: {
    showPresence: true,
    showCursors: true,
    showSelections: true,
    enableTypingIndicators: true,
    cursorColor: "#FF6B6B",
  },
  room: {
    maxUsers: 50,
    allowGuests: false,
    requireAuth: true,
    enableVideoChat: false,
    enableScreenShare: false,
    enableRecording: false,
  },
  performance: {
    debounceMs: 100,
    throttleMs: 50,
    batchSize: 100,
    maxRetries: 3,
  },
};

// Utility functions
export const createCollaborationManager = (config: Partial<CollaborationConfig> = {}) => {
  const mergedConfig = {
    ...DEFAULT_COLLABORATION_CONFIG,
    ...config,
    connection: {
      ...DEFAULT_COLLABORATION_CONFIG.connection,
      ...config.connection,
    },
    yjs: {
      ...DEFAULT_COLLABORATION_CONFIG.yjs,
      ...config.yjs,
      provider: {
        ...DEFAULT_COLLABORATION_CONFIG.yjs.provider,
        ...config.yjs?.provider,
      },
    },
    document: {
      ...DEFAULT_COLLABORATION_CONFIG.document,
      ...config.document,
    },
    user: {
      ...DEFAULT_COLLABORATION_CONFIG.user,
      ...config.user,
    },
    room: {
      ...DEFAULT_COLLABORATION_CONFIG.room,
      ...config.room,
    },
    performance: {
      ...DEFAULT_COLLABORATION_CONFIG.performance,
      ...config.performance,
    },
  };

  return new CollaborationManager(mergedConfig);
};

export const createYjsDocumentManager = (config: YjsProviderConfig) => {
  return new YjsDocumentManager(config);
};

// Version information
export const VERSION = "0.1.0";
export const PACKAGE_NAME = "reynard-collaboration";
