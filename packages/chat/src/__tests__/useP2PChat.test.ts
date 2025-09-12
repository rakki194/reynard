/**
 * Tests for useP2PChat composable
 */

import { describe, it, expect, beforeEach, vi, MockedFunction } from "vitest";
import { createRoot } from "solid-js";
import { useP2PChat } from "../../composables/useP2PChat";
import type {
  ChatUser,
  ChatRoom,
  P2PChatMessage,
  P2PChatEvent,
} from "../../types/p2p";

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  public readyState = MockWebSocket.CONNECTING;
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;

  private eventQueue: any[] = [];

  constructor(public url: string) {
    // Simulate connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event("open"));
    }, 10);
  }

  send(data: string) {
    // Store sent data for testing
    this.eventQueue.push(JSON.parse(data));
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent("close"));
  }

  // Test helper to simulate receiving messages
  simulateMessage(data: any) {
    const event = new MessageEvent("message", {
      data: JSON.stringify(data),
    });
    this.onmessage?.(event);
  }

  getSentMessages() {
    return this.eventQueue;
  }
}

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;
global.WebSocket = MockWebSocket as any;

describe("useP2PChat", () => {
  let mockCurrentUser: ChatUser;
  let mockRoom: ChatRoom;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCurrentUser = {
      id: "user-1",
      name: "Test User",
      status: "online",
    };

    mockRoom = {
      id: "room-1",
      name: "Test Room",
      type: "group",
      participants: [mockCurrentUser],
    };
  });

  it("should initialize with default state", () => {
    createRoot((dispose) => {
      const p2pChat = useP2PChat({
        currentUser: mockCurrentUser,
        realtimeEndpoint: "ws://localhost:8080",
        autoConnect: false,
      });

      expect(p2pChat.rooms()).toHaveLength(0);
      expect(p2pChat.activeRoom()).toBeUndefined();
      expect(p2pChat.currentUser()).toBe(mockCurrentUser);
      expect(p2pChat.p2pConnection().status).toBe("disconnected");

      dispose();
    });
  });

  it("should initialize with provided rooms", () => {
    createRoot((dispose) => {
      const p2pChat = useP2PChat({
        currentUser: mockCurrentUser,
        realtimeEndpoint: "ws://localhost:8080",
        initialRooms: [mockRoom],
        autoConnect: false,
      });

      expect(p2pChat.rooms()).toHaveLength(1);
      expect(p2pChat.rooms()[0]).toBe(mockRoom);

      dispose();
    });
  });

  it("should connect to WebSocket automatically", async () => {
    await createRoot(async (dispose) => {
      const p2pChat = useP2PChat({
        currentUser: mockCurrentUser,
        realtimeEndpoint: "ws://localhost:8080",
        autoConnect: true,
      });

      // Wait for connection
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(p2pChat.p2pConnection().status).toBe("connected");

      dispose();
    });
  });

  it("should create a new room", async () => {
    const newRoom = { ...mockRoom, id: "room-2", name: "New Room" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newRoom,
    });

    await createRoot(async (dispose) => {
      const p2pChat = useP2PChat({
        currentUser: mockCurrentUser,
        realtimeEndpoint: "ws://localhost:8080",
        autoConnect: false,
      });

      const createdRoom = await p2pChat.actions.createRoom("New Room", "group");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/chat/rooms",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "New Room",
            type: "group",
            participants: [],
          }),
        }),
      );

      expect(createdRoom).toEqual(newRoom);
      expect(p2pChat.rooms()).toContain(newRoom);

      dispose();
    });
  });

  it("should send message to room", async () => {
    const message: P2PChatMessage = {
      id: "msg-1",
      role: "user",
      content: "Hello World",
      timestamp: Date.now(),
      roomId: mockRoom.id,
      sender: mockCurrentUser,
      deliveryStatus: "sent",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => message,
    });

    await createRoot(async (dispose) => {
      const p2pChat = useP2PChat({
        currentUser: mockCurrentUser,
        realtimeEndpoint: "ws://localhost:8080",
        initialRooms: [mockRoom],
        autoConnect: false,
      });

      await p2pChat.actions.sendMessageToRoom(mockRoom.id, "Hello World");

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/chat/rooms/${mockRoom.id}/messages`,
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("Hello World"),
        }),
      );

      dispose();
    });
  });

  it("should handle real-time message events", async () => {
    await createRoot(async (dispose) => {
      const p2pChat = useP2PChat({
        currentUser: mockCurrentUser,
        realtimeEndpoint: "ws://localhost:8080",
        initialRooms: [mockRoom],
        autoConnect: true,
      });

      // Wait for connection
      await new Promise((resolve) => setTimeout(resolve, 20));

      const messageEvent: P2PChatEvent = {
        type: "message_sent",
        message: {
          id: "msg-1",
          role: "user",
          content: "Hello from WebSocket",
          timestamp: Date.now(),
          roomId: mockRoom.id,
          sender: { id: "user-2", name: "Other User", status: "online" },
          deliveryStatus: "sent",
        },
        timestamp: Date.now(),
      };

      // Get WebSocket instance and simulate message
      const ws = (global.WebSocket as any).mock.instances[0] as MockWebSocket;
      ws.simulateMessage(messageEvent);

      // Wait for message processing
      await new Promise((resolve) => setTimeout(resolve, 10));

      const roomMessages = p2pChat.messagesByRoom()[mockRoom.id];
      expect(roomMessages).toHaveLength(1);
      expect(roomMessages[0].content).toBe("Hello from WebSocket");

      dispose();
    });
  });

  it("should handle typing indicators", async () => {
    await createRoot(async (dispose) => {
      const p2pChat = useP2PChat({
        currentUser: mockCurrentUser,
        realtimeEndpoint: "ws://localhost:8080",
        initialRooms: [mockRoom],
        autoConnect: true,
      });

      // Wait for connection
      await new Promise((resolve) => setTimeout(resolve, 20));

      const typingEvent: P2PChatEvent = {
        type: "typing_start",
        roomId: mockRoom.id,
        user: { id: "user-2", name: "Other User", status: "online" },
        timestamp: Date.now(),
      };

      // Simulate typing event
      const ws = (global.WebSocket as any).mock.instances[0] as MockWebSocket;
      ws.simulateMessage(typingEvent);

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 10));

      const typingIndicators = p2pChat.typingIndicators()[mockRoom.id];
      expect(typingIndicators).toHaveLength(1);
      expect(typingIndicators[0].user.id).toBe("user-2");

      dispose();
    });
  });

  it("should start and stop typing", async () => {
    await createRoot(async (dispose) => {
      const p2pChat = useP2PChat({
        currentUser: mockCurrentUser,
        realtimeEndpoint: "ws://localhost:8080",
        autoConnect: true,
      });

      // Wait for connection
      await new Promise((resolve) => setTimeout(resolve, 20));

      p2pChat.actions.startTyping(mockRoom.id);

      const ws = (global.WebSocket as any).mock.instances[0] as MockWebSocket;
      const sentMessages = ws.getSentMessages();

      expect(sentMessages).toContainEqual(
        expect.objectContaining({
          type: "typing_start",
          roomId: mockRoom.id,
        }),
      );

      p2pChat.actions.stopTyping(mockRoom.id);

      expect(sentMessages).toContainEqual(
        expect.objectContaining({
          type: "typing_stop",
          roomId: mockRoom.id,
        }),
      );

      dispose();
    });
  });

  it("should join and leave rooms", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await createRoot(async (dispose) => {
      const p2pChat = useP2PChat({
        currentUser: mockCurrentUser,
        realtimeEndpoint: "ws://localhost:8080",
        initialRooms: [mockRoom],
        autoConnect: true,
      });

      // Wait for connection
      await new Promise((resolve) => setTimeout(resolve, 20));

      await p2pChat.actions.joinRoom(mockRoom.id);

      const ws = (global.WebSocket as any).mock.instances[0] as MockWebSocket;
      const sentMessages = ws.getSentMessages();

      expect(sentMessages).toContainEqual(
        expect.objectContaining({
          type: "join_room",
          roomId: mockRoom.id,
        }),
      );

      expect(p2pChat.activeRoom()).toBe(mockRoom);

      await p2pChat.actions.leaveRoom(mockRoom.id);

      expect(sentMessages).toContainEqual(
        expect.objectContaining({
          type: "leave_room",
          roomId: mockRoom.id,
        }),
      );

      expect(p2pChat.activeRoom()).toBeUndefined();

      dispose();
    });
  });

  it("should handle user status changes", async () => {
    await createRoot(async (dispose) => {
      const p2pChat = useP2PChat({
        currentUser: mockCurrentUser,
        realtimeEndpoint: "ws://localhost:8080",
        initialRooms: [mockRoom],
        autoConnect: true,
      });

      // Wait for connection
      await new Promise((resolve) => setTimeout(resolve, 20));

      const statusEvent: P2PChatEvent = {
        type: "user_status_changed",
        user: { ...mockCurrentUser, status: "away" },
        previousStatus: "online",
        timestamp: Date.now(),
      };

      const ws = (global.WebSocket as any).mock.instances[0] as MockWebSocket;
      ws.simulateMessage(statusEvent);

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatedRoom = p2pChat.rooms().find((r) => r.id === mockRoom.id);
      const updatedUser = updatedRoom?.participants.find(
        (p) => p.id === mockCurrentUser.id,
      );
      expect(updatedUser?.status).toBe("away");

      dispose();
    });
  });

  it("should handle file uploads", async () => {
    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });
    const mockAttachment = {
      id: "attachment-1",
      name: "test.txt",
      type: "text/plain",
      size: 12,
      url: "https://example.com/test.txt",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAttachment,
    });

    await createRoot(async (dispose) => {
      const p2pChat = useP2PChat({
        currentUser: mockCurrentUser,
        realtimeEndpoint: "ws://localhost:8080",
        config: { enableFileUploads: true, maxFileSize: 1024 * 1024 },
      });

      const result = await p2pChat.actions.uploadFile(mockFile, mockRoom.id);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/chat/upload",
        expect.objectContaining({
          method: "POST",
        }),
      );

      expect(result.name).toBe("test.txt");
      expect(result.url).toBe("https://example.com/test.txt");

      dispose();
    });
  });

  it("should search messages", async () => {
    const searchResults = [
      {
        id: "msg-1",
        role: "user" as const,
        content: "Found message",
        timestamp: Date.now(),
        roomId: mockRoom.id,
        sender: mockCurrentUser,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => searchResults,
    });

    await createRoot(async (dispose) => {
      const p2pChat = useP2PChat({
        currentUser: mockCurrentUser,
        realtimeEndpoint: "ws://localhost:8080",
      });

      const results = await p2pChat.actions.searchMessages(
        "test query",
        mockRoom.id,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "/api/chat/search/messages?q=test+query&roomId=room-1",
        ),
        expect.any(Object),
      );

      expect(results).toEqual(searchResults);

      dispose();
    });
  });

  it("should handle reconnection", async () => {
    await createRoot(async (dispose) => {
      const p2pChat = useP2PChat({
        currentUser: mockCurrentUser,
        realtimeEndpoint: "ws://localhost:8080",
        autoConnect: true,
        reconnection: {
          enabled: true,
          maxAttempts: 2,
          delay: 100,
          backoff: 1,
        },
      });

      // Wait for initial connection
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(p2pChat.p2pConnection().status).toBe("connected");

      // Simulate disconnect
      const ws = (global.WebSocket as any).mock.instances[0] as MockWebSocket;
      ws.close();

      // Wait for reconnection attempt
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(p2pChat.p2pConnection().status).toBe("connected");

      dispose();
    });
  });
});
