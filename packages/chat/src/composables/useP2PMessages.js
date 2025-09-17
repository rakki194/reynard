/**
 * P2P Messages Composable for Message Management
 *
 * This module handles message storage, retrieval, and real-time message updates
 * for peer-to-peer chat functionality.
 */
import { createSignal } from "solid-js";
export function useP2PMessages(options) {
    const { initialRooms = [], currentUserId } = options;
    // Messages organized by room ID
    const [messagesByRoom, setMessagesByRoom] = createSignal({});
    // Add message to a specific room
    const addMessageToRoom = (roomId, message) => {
        setMessagesByRoom((prev) => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []), message],
        }));
    };
    // Update an existing message
    const updateMessage = (roomId, messageId, updates) => {
        setMessagesByRoom((prev) => {
            const roomMessages = prev[roomId] || [];
            const updatedMessages = roomMessages.map((msg) => msg.id === messageId ? { ...msg, ...updates } : msg);
            return {
                ...prev,
                [roomId]: updatedMessages,
            };
        });
    };
    // Delete a message
    const deleteMessage = (roomId, messageId) => {
        setMessagesByRoom((prev) => {
            const roomMessages = prev[roomId] || [];
            const filteredMessages = roomMessages.filter((msg) => msg.id !== messageId);
            return {
                ...prev,
                [roomId]: filteredMessages,
            };
        });
    };
    // Get messages for a specific room
    const getRoomMessages = (roomId) => {
        return messagesByRoom()[roomId] || [];
    };
    // Get a specific message by ID
    const getMessageById = (roomId, messageId) => {
        const roomMessages = messagesByRoom()[roomId] || [];
        return roomMessages.find((msg) => msg.id === messageId);
    };
    // Clear all messages for a room
    const clearRoomMessages = (roomId) => {
        setMessagesByRoom((prev) => ({
            ...prev,
            [roomId]: [],
        }));
    };
    // Mark a message as read
    const markMessageAsRead = (roomId, messageId) => {
        updateMessage(roomId, messageId, { read: true, readAt: new Date() });
    };
    // Mark all messages in a room as read
    const markAllMessagesAsRead = (roomId) => {
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
    const getUnreadCount = (roomId) => {
        const roomMessages = messagesByRoom()[roomId] || [];
        return roomMessages.filter((msg) => !msg.read && msg.senderId !== currentUserId).length;
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
