/**
 * P2P Rooms Composable for Room Management
 *
 * This module handles chat room creation, joining, leaving, and room state management
 * for peer-to-peer chat functionality.
 */

import { createSignal, createMemo } from "solid-js";
import type { ChatRoom, ChatUser } from "../types/p2p";

export interface P2PRoomsOptions {
  /** Initial rooms */
  initialRooms?: ChatRoom[];
  /** Current user */
  currentUser: ChatUser;
  /** Initial room to join */
  initialRoomId?: string;
}

export interface P2PRoomsReturn {
  rooms: () => ChatRoom[];
  activeRoom: () => ChatRoom | null;
  setActiveRoom: (room: ChatRoom | null) => void;
  addRoom: (room: ChatRoom) => void;
  removeRoom: (roomId: string) => void;
  updateRoom: (roomId: string, updates: Partial<ChatRoom>) => void;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  createRoom: (roomData: Omit<ChatRoom, "id" | "createdAt" | "updatedAt">) => Promise<ChatRoom>;
  getRoomById: (roomId: string) => ChatRoom | undefined;
  isUserInRoom: (roomId: string, userId: string) => boolean;
  addUserToRoom: (roomId: string, user: ChatUser) => void;
  removeUserFromRoom: (roomId: string, userId: string) => void;
  updateRoomLastMessage: (roomId: string, message: { content: string; timestamp: Date }) => void;
}

export function useP2PRooms(options: P2PRoomsOptions): P2PRoomsReturn {
  const { initialRooms = [], currentUser, initialRoomId } = options;

  // Rooms state
  const [rooms, setRooms] = createSignal<ChatRoom[]>(initialRooms);
  const [activeRoom, setActiveRoom] = createSignal<ChatRoom | null>(null);

  // Initialize active room if specified
  if (initialRoomId) {
    const room = initialRooms.find(r => r.id === initialRoomId);
    if (room) {
      setActiveRoom(room);
    }
  }

  // Add a new room
  const addRoom = (room: ChatRoom) => {
    setRooms(prev => [...prev.filter(r => r.id !== room.id), room]);
  };

  // Remove a room
  const removeRoom = (roomId: string) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));

    // Clear active room if it was removed
    if (activeRoom()?.id === roomId) {
      setActiveRoom(null);
    }
  };

  // Update room properties
  const updateRoom = (roomId: string, updates: Partial<ChatRoom>) => {
    setRooms(prev => prev.map(room => (room.id === roomId ? { ...room, ...updates, updatedAt: new Date() } : room)));

    // Update active room if it's the one being updated
    if (activeRoom()?.id === roomId) {
      setActiveRoom(prev => (prev ? { ...prev, ...updates, updatedAt: new Date() } : null));
    }
  };

  // Join a room
  const joinRoom = async (roomId: string): Promise<void> => {
    const room = rooms().find(r => r.id === roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }

    // Add current user to room if not already present
    if (!isUserInRoom(roomId, currentUser.id)) {
      addUserToRoom(roomId, currentUser);
    }

    // Set as active room
    setActiveRoom(room);

    // Update room's last activity
    updateRoom(roomId, { lastActivity: new Date() });
  };

  // Leave a room
  const leaveRoom = async (roomId: string): Promise<void> => {
    // Remove current user from room
    removeUserFromRoom(roomId, currentUser.id);

    // Clear active room if it's the one being left
    if (activeRoom()?.id === roomId) {
      setActiveRoom(null);
    }

    // Update room's last activity
    updateRoom(roomId, { lastActivity: new Date() });
  };

  // Create a new room
  const createRoom = async (roomData: Omit<ChatRoom, "id" | "createdAt" | "updatedAt">): Promise<ChatRoom> => {
    const newRoom: ChatRoom = {
      ...roomData,
      id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
    };

    // Add current user as a member
    newRoom.members = [...(newRoom.members || []), currentUser];

    addRoom(newRoom);
    return newRoom;
  };

  // Get room by ID
  const getRoomById = (roomId: string): ChatRoom | undefined => {
    return rooms().find(r => r.id === roomId);
  };

  // Check if user is in a room
  const isUserInRoom = (roomId: string, userId: string): boolean => {
    const room = getRoomById(roomId);
    return room?.members?.some(member => member.id === userId) || false;
  };

  // Add user to room
  const addUserToRoom = (roomId: string, user: ChatUser) => {
    updateRoom(roomId, {
      members: [...(getRoomById(roomId)?.members || []), user],
    });
  };

  // Remove user from room
  const removeUserFromRoom = (roomId: string, userId: string) => {
    const room = getRoomById(roomId);
    if (room) {
      updateRoom(roomId, {
        members: room.members?.filter(member => member.id !== userId) || [],
      });
    }
  };

  // Update room's last message
  const updateRoomLastMessage = (roomId: string, message: { content: string; timestamp: Date }) => {
    updateRoom(roomId, {
      lastMessage: {
        id: `msg-${Date.now()}`,
        role: "user",
        content: message.content,
        timestamp: message.timestamp.getTime(),
      },
      lastMessageAt: message.timestamp,
      lastActivity: message.timestamp,
    });
  };

  return {
    rooms,
    activeRoom,
    setActiveRoom,
    addRoom,
    removeRoom,
    updateRoom,
    joinRoom,
    leaveRoom,
    createRoom,
    getRoomById,
    isUserInRoom,
    addUserToRoom,
    removeUserFromRoom,
    updateRoomLastMessage,
  };
}
