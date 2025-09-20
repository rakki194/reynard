/**
 * P2P Chat User and Presence Types
 *
 * Defines user identity, presence, and status management for peer-to-peer chat.
 */

// User identity and presence
export interface ChatUser {
  /** Unique user identifier */
  id: string;
  /** Display name */
  name: string;
  /** Avatar URL or emoji */
  avatar?: string;
  /** Current online status */
  status: "online" | "away" | "busy" | "offline";
  /** Last seen timestamp */
  lastSeen?: number;
  /** User metadata */
  metadata?: {
    timezone?: string;
    language?: string;
    role?: string;
    customFields?: Record<string, unknown>;
  };
}

// Typing indicators
export interface TypingIndicator {
  /** Room ID */
  roomId: string;
  /** User who is typing */
  user: ChatUser;
  /** Typing started timestamp */
  startedAt: number;
  /** Typing timeout (auto-clear after this time) */
  timeout?: number;
}
