/**
 * P2P Chat Message and Attachment Types
 *
 * Defines enhanced message structures, attachments, reactions, and read receipts
 * for peer-to-peer communication.
 */

import type { ChatUser } from "./user";
import type { ChatMessage } from "../../types";

// Enhanced message types for P2P
export interface P2PChatMessage extends ChatMessage {
  /** Message sender (for group chats) */
  sender?: ChatUser;
  /** Sender ID (for compatibility) */
  senderId?: string;
  /** Whether message has been read */
  read?: boolean;
  /** Read timestamp */
  readAt?: Date;
  /** Message recipient (for direct messages) */
  recipient?: ChatUser;
  /** Room/channel ID */
  roomId: string;
  /** Message thread ID (for threaded conversations) */
  threadId?: string;
  /** Message reply to another message */
  replyTo?: string;
  /** Message reactions */
  reactions?: MessageReaction[];
  /** Message read receipts */
  readBy?: MessageReadReceipt[];
  /** Message attachments */
  attachments?: MessageAttachment[];
  /** Message priority */
  priority?: "low" | "normal" | "high" | "urgent";
  /** Whether message is pinned */
  isPinned?: boolean;
  /** Message edit history */
  editHistory?: MessageEdit[];
  /** Message delivery status */
  deliveryStatus?: "sent" | "delivered" | "read" | "failed";
}

export interface MessageReaction {
  /** Reaction emoji */
  emoji: string;
  /** Users who reacted */
  users: ChatUser[];
  /** Reaction count */
  count: number;
}

export interface MessageReadReceipt {
  /** User who read the message */
  user: ChatUser;
  /** Read timestamp */
  readAt: number;
}

export interface MessageAttachment {
  /** Attachment ID */
  id: string;
  /** File name */
  name: string;
  /** File type/MIME type */
  type: string;
  /** File size in bytes */
  size: number;
  /** Download URL */
  url: string;
  /** Thumbnail URL (for images/videos) */
  thumbnailUrl?: string;
  /** Upload progress (0-100) */
  uploadProgress?: number;
  /** Upload timestamp */
  uploadedAt?: Date;
  /** Upload status */
  uploadStatus?: "uploading" | "completed" | "failed";
}

export interface MessageEdit {
  /** Edit timestamp */
  editedAt: number;
  /** Previous content */
  previousContent: string;
  /** Edit reason */
  reason?: string;
}
