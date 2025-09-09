/**
 * P2P Messages Composable for Message Management
 *
 * This module handles message storage, retrieval, and real-time message updates
 * for peer-to-peer chat functionality.
 */

import { createSignal, createMemo } from "solid-js";
import type { P2PChatMessage, ChatRoom, MessageAttachment } from "../types/p2p";

export interface P2PMessagesOptions {
  /** Initial rooms */
  initialRooms?: ChatRoom[];
  /** Current user ID */
  currentUserId: string;
}

export interface P2PMessagesReturn {
  messagesByRoom: () => Record<string, P2PChatMessage[]>;
  addMessageToRoom: (roomId: string, message: P2PChatMessage) => void;
  updateMessage: (
    roomId: string,
    messageId: string,
    updates: Partial<P2PChatMessage>,
  ) => void;
  deleteMessage: (roomId: string, messageId: string) => void;
  getRoomMessages: (roomId: string) => P2PChatMessage[];
  getMessageById: (
    roomId: string,
    messageId: string,
  ) => P2PChatMessage | undefined;
  clearRoomMessages: (roomId: string) => void;
  markMessageAsRead: (roomId: string, messageId: string) => void;
  markAllMessagesAsRead: (roomId: string) => void;
  getUnreadCount: (roomId: string) => number;
}

export function useP2PMessages(options: P2PMessagesOptions): P2PMessagesReturn {
  const { initialRooms = [], currentUserId } = options;

  // Messages organized by room ID
  const [messagesByRoom, setMessagesByRoom] = createSignal<
    Record<string, P2PChatMessage[]>
  >({});

  // Add message to a specific room
  const addMessageToRoom = (roomId: string, message: P2PChatMessage) => {
    setMessagesByRoom((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), message],
    }));
  };

  // Update an existing message
  const updateMessage = (
    roomId: string,
    messageId: string,
    updates: Partial<P2PChatMessage>,
  ) => {
    setMessagesByRoom((prev) => {
      const roomMessages = prev[roomId] || [];
      const updatedMessages = roomMessages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg,
      );
      return {
        ...prev,
        [roomId]: updatedMessages,
      };
    });
  };

  // Delete a message
  const deleteMessage = (roomId: string, messageId: string) => {
    setMessagesByRoom((prev) => {
      const roomMessages = prev[roomId] || [];
      const filteredMessages = roomMessages.filter(
        (msg) => msg.id !== messageId,
      );
      return {
        ...prev,
        [roomId]: filteredMessages,
      };
    });
  };

  // Get messages for a specific room
  const getRoomMessages = (roomId: string): P2PChatMessage[] => {
    return messagesByRoom()[roomId] || [];
  };

  // Get a specific message by ID
  const getMessageById = (
    roomId: string,
    messageId: string,
  ): P2PChatMessage | undefined => {
    const roomMessages = messagesByRoom()[roomId] || [];
    return roomMessages.find((msg) => msg.id === messageId);
  };

  // Clear all messages for a room
  const clearRoomMessages = (roomId: string) => {
    setMessagesByRoom((prev) => ({
      ...prev,
      [roomId]: [],
    }));
  };

  // Mark a message as read
  const markMessageAsRead = (roomId: string, messageId: string) => {
    updateMessage(roomId, messageId, { read: true, readAt: new Date() });
  };

  // Mark all messages in a room as read
  const markAllMessagesAsRead = (roomId: string) => {
    const roomMessages = messagesByRoom()[roomId] || [];
    const now = new Date();

    setMessagesByRoom((prev) => ({
      ...prev,
      [roomId]: roomMessages.map((msg) => ({
        ...msg,
        read: true,
        readAt: now,
      })),
    }));
  };

  // Get unread message count for a room
  const getUnreadCount = (roomId: string): number => {
    const roomMessages = messagesByRoom()[roomId] || [];
    return roomMessages.filter(
      (msg) => !msg.read && msg.senderId !== currentUserId,
    ).length;
  };

  return {
    messagesByRoom,
    addMessageToRoom,
    updateMessage,
    deleteMessage,
    getRoomMessages,
    getMessageById,
    clearRoomMessages,
    markMessageAsRead,
    markAllMessagesAsRead,
    getUnreadCount,
  };
}
