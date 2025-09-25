/**
 * Core types and interfaces for the Reynard Collaboration system
 */

import type { Doc as YDoc, Map as YMap, Array as YArray, Text as YText } from "yjs";
import type { ConnectionType, ConnectionHealth } from "reynard-connection";

// ============================================================================
// Document and Room Types
// ============================================================================

export interface CollaborationDocument {
  id: string;
  name: string;
  type: DocumentType;
  content: string;
  metadata: DocumentMetadata;
  permissions: DocumentPermissions;
  createdAt: number;
  updatedAt: number;
  version: number;
}

export enum DocumentType {
  TEXT = "text",
  CODE = "code",
  MARKDOWN = "markdown",
  JSON = "json",
  YAML = "yaml",
  XML = "xml",
  HTML = "html",
  CSS = "css",
  JAVASCRIPT = "javascript",
  TYPESCRIPT = "typescript",
  PYTHON = "python",
  SQL = "sql",
}

export interface DocumentMetadata {
  language?: string;
  encoding?: string;
  lineEnding?: "lf" | "crlf" | "cr";
  tabSize?: number;
  insertSpaces?: boolean;
  wordWrap?: boolean;
  readOnly?: boolean;
  [key: string]: unknown;
}

export interface DocumentPermissions {
  canRead: boolean;
  canWrite: boolean;
  canShare: boolean;
  canDelete: boolean;
  canManage: boolean;
}

// ============================================================================
// User and Presence Types
// ============================================================================

export interface CollaborationUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color: string;
  isOnline: boolean;
  lastSeen?: number;
  permissions: UserPermissions;
}

export interface UserPermissions {
  role: UserRole;
  canEdit: boolean;
  canComment: boolean;
  canInvite: boolean;
  canManage: boolean;
}

export enum UserRole {
  OWNER = "owner",
  EDITOR = "editor",
  VIEWER = "viewer",
  COMMENTOR = "commentor",
}

export interface UserPresence {
  userId: string;
  documentId: string;
  cursor?: CursorPosition;
  selection?: SelectionRange;
  isTyping: boolean;
  lastActivity: number;
  connectionHealth: ConnectionHealth;
}

export interface CursorPosition {
  line: number;
  column: number;
  offset: number;
}

export interface SelectionRange {
  start: CursorPosition;
  end: CursorPosition;
  isReversed: boolean;
}

// ============================================================================
// Room and Session Types
// ============================================================================

export interface CollaborationRoom {
  id: string;
  name: string;
  documentId: string;
  users: Map<string, CollaborationUser>;
  permissions: RoomPermissions;
  settings: RoomSettings;
  createdAt: number;
  updatedAt: number;
}

export interface RoomPermissions {
  isPublic: boolean;
  allowGuests: boolean;
  requireAuth: boolean;
  maxUsers: number;
  allowedDomains?: string[];
}

export interface RoomSettings {
  enableVideoChat: boolean;
  enableScreenShare: boolean;
  enableRecording: boolean;
  enableTranscription: boolean;
  enableComments: boolean;
  enableSuggestions: boolean;
  autoSave: boolean;
  saveInterval: number; // seconds
}

export interface CollaborationSession {
  id: string;
  userId: string;
  roomId: string;
  documentId: string;
  connectionId: string;
  startTime: number;
  lastActivity: number;
  isActive: boolean;
  metadata: SessionMetadata;
}

export interface SessionMetadata {
  userAgent: string;
  ipAddress?: string;
  timezone: string;
  language: string;
  [key: string]: unknown;
}

// ============================================================================
// Yjs Integration Types
// ============================================================================

export interface YjsDocument {
  ydoc: YDoc;
  ytext: YText;
  ymap: YMap<unknown>;
  yarray: YArray<unknown>;
  awareness: any; // Yjs Awareness type
  provider: any; // Yjs Provider type
}

export interface YjsProviderConfig {
  type: ProviderType;
  url?: string;
  room: string;
  token?: string;
  awareness: boolean;
  maxConns: number;
  filterBcConns: boolean;
  peerOpts?: Record<string, unknown>;
}

export enum ProviderType {
  WEBSOCKET = "websocket",
  WEBRTC = "webrtc",
  INDEXEDDB = "indexeddb",
  MEMORY = "memory",
}

// ============================================================================
// Event Types
// ============================================================================

export interface CollaborationEvent {
  type: CollaborationEventType;
  timestamp: number;
  userId: string;
  documentId: string;
  roomId: string;
  data: unknown;
  metadata?: Record<string, unknown>;
}

export enum CollaborationEventType {
  // Document events
  DOCUMENT_CREATED = "document_created",
  DOCUMENT_UPDATED = "document_updated",
  DOCUMENT_DELETED = "document_deleted",
  DOCUMENT_SHARED = "document_shared",

  // User events
  USER_JOINED = "user_joined",
  USER_LEFT = "user_left",
  USER_PRESENCE_UPDATED = "user_presence_updated",
  USER_PERMISSIONS_CHANGED = "user_permissions_changed",

  // Room events
  ROOM_CREATED = "room_created",
  ROOM_UPDATED = "room_updated",
  ROOM_DELETED = "room_deleted",

  // Session events
  SESSION_STARTED = "session_started",
  SESSION_ENDED = "session_ended",
  SESSION_RECONNECTED = "session_reconnected",

  // Content events
  CONTENT_INSERTED = "content_inserted",
  CONTENT_DELETED = "content_deleted",
  CONTENT_FORMATTED = "content_formatted",
  CURSOR_MOVED = "cursor_moved",
  SELECTION_CHANGED = "selection_changed",

  // Comment events
  COMMENT_ADDED = "comment_added",
  COMMENT_UPDATED = "comment_updated",
  COMMENT_DELETED = "comment_deleted",
  COMMENT_RESOLVED = "comment_resolved",

  // Suggestion events
  SUGGESTION_ADDED = "suggestion_added",
  SUGGESTION_ACCEPTED = "suggestion_accepted",
  SUGGESTION_REJECTED = "suggestion_rejected",

  // Connection events
  CONNECTION_ESTABLISHED = "connection_established",
  CONNECTION_LOST = "connection_lost",
  CONNECTION_RESTORED = "connection_restored",

  // Error events
  ERROR_OCCURRED = "error_occurred",
  WARNING_OCCURRED = "warning_occurred",
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface CollaborationConfig {
  // Connection settings
  connection: {
    type: ConnectionType;
    url: string;
    timeout: number;
    retryCount: number;
    retryDelay: number;
    heartbeatInterval: number;
  };

  // Yjs settings
  yjs: {
    provider: YjsProviderConfig;
    awareness: boolean;
    maxConns: number;
    filterBcConns: boolean;
  };

  // Document settings
  document: {
    autoSave: boolean;
    saveInterval: number;
    maxHistorySize: number;
    compressionEnabled: boolean;
  };

  // User settings
  user: {
    showPresence: boolean;
    showCursors: boolean;
    showSelections: boolean;
    enableTypingIndicators: boolean;
    cursorColor: string;
  };

  // Room settings
  room: {
    maxUsers: number;
    allowGuests: boolean;
    requireAuth: boolean;
    enableVideoChat: boolean;
    enableScreenShare: boolean;
    enableRecording: boolean;
  };

  // Performance settings
  performance: {
    debounceMs: number;
    throttleMs: number;
    batchSize: number;
    maxRetries: number;
  };
}

// ============================================================================
// Error Types
// ============================================================================

export class CollaborationError extends Error {
  constructor(
    message: string,
    public code: CollaborationErrorCode,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "CollaborationError";
  }
}

export enum CollaborationErrorCode {
  // Connection errors
  CONNECTION_FAILED = "CONNECTION_FAILED",
  CONNECTION_LOST = "CONNECTION_LOST",
  CONNECTION_TIMEOUT = "CONNECTION_TIMEOUT",
  CONNECTION_REFUSED = "CONNECTION_REFUSED",

  // Authentication errors
  AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",
  AUTHORIZATION_DENIED = "AUTHORIZATION_DENIED",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",

  // Document errors
  DOCUMENT_NOT_FOUND = "DOCUMENT_NOT_FOUND",
  DOCUMENT_LOCKED = "DOCUMENT_LOCKED",
  DOCUMENT_CORRUPTED = "DOCUMENT_CORRUPTED",
  DOCUMENT_TOO_LARGE = "DOCUMENT_TOO_LARGE",

  // Room errors
  ROOM_NOT_FOUND = "ROOM_NOT_FOUND",
  ROOM_FULL = "ROOM_FULL",
  ROOM_ACCESS_DENIED = "ROOM_ACCESS_DENIED",
  ROOM_DISABLED = "ROOM_DISABLED",

  // User errors
  USER_NOT_FOUND = "USER_NOT_FOUND",
  USER_BLOCKED = "USER_BLOCKED",
  USER_OFFLINE = "USER_OFFLINE",
  USER_PERMISSION_DENIED = "USER_PERMISSION_DENIED",

  // Yjs errors
  YJS_SYNC_FAILED = "YJS_SYNC_FAILED",
  YJS_AWARENESS_FAILED = "YJS_AWARENESS_FAILED",
  YJS_PROVIDER_FAILED = "YJS_PROVIDER_FAILED",

  // General errors
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
}

// ============================================================================
// Utility Types
// ============================================================================

export type CollaborationEventHandler<T = unknown> = (event: CollaborationEvent & { data: T }) => void;

export interface CollaborationMetrics {
  // Connection metrics
  connectionLatency: number;
  connectionUptime: number;
  reconnectionCount: number;

  // Document metrics
  documentSize: number;
  changeCount: number;
  conflictCount: number;
  syncTime: number;

  // User metrics
  activeUsers: number;
  totalUsers: number;
  userActivity: number;

  // Performance metrics
  memoryUsage: number;
  cpuUsage: number;
  networkUsage: number;
}

export interface CollaborationState {
  isConnected: boolean;
  isSyncing: boolean;
  isOnline: boolean;
  currentRoom?: CollaborationRoom;
  currentDocument?: CollaborationDocument;
  currentUser?: CollaborationUser;
  users: Map<string, CollaborationUser>;
  presence: Map<string, UserPresence>;
  metrics: CollaborationMetrics;
  lastError?: CollaborationError;
}
