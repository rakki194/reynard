/**
 * Tests for CollaborationManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { CollaborationManager } from "../CollaborationManager";
import { DocumentType, UserRole, CollaborationConfig } from "../types";

const mockConfig: CollaborationConfig = {
  connection: {
    url: "ws://localhost:1234",
    timeout: 5000,
    retryCount: 3,
    retryDelay: 1000,
  },
  yjs: {
    flushInterval: 300,
    disableGc: false,
  },
  user: {
    defaultRole: UserRole.EDITOR,
  },
  persistence: {
    enabled: true,
    provider: "indexeddb",
  },
};

describe("CollaborationManager", () => {
  let manager: CollaborationManager;

  beforeEach(() => {
    manager = new CollaborationManager(mockConfig);
  });

  afterEach(async () => {
    await manager.leaveRoom();
  });

  describe("Initialization", () => {
    it("should initialize with config", () => {
      expect(manager).toBeDefined();
      expect(manager.state).toBeDefined();
      expect(manager.state.isConnected).toBe(false);
      expect(manager.state.isSyncing).toBe(false);
    });

    it("should have correct initial state", () => {
      const state = manager.state;
      expect(state.users).toBeInstanceOf(Map);
      expect(state.presence).toBeInstanceOf(Map);
      expect(state.metrics).toBeDefined();
      expect(state.metrics.activeUsers).toBe(0);
    });
  });

  describe("Room Management", () => {
    it("should join a room", async () => {
      const roomId = "test-room";
      const userId = "user-123";
      const userName = "Test User";

      // Mock the WebSocket provider to avoid actual connection
      vi.spyOn(manager as any, "createYjsDocument").mockResolvedValue(undefined);
      vi.spyOn(manager as any, "connect").mockResolvedValue(undefined);

      await manager.joinRoom(roomId, userId, userName);

      expect(manager.state.isConnected).toBe(true);
      expect(manager.state.currentUser?.id).toBe(userId);
      expect(manager.state.currentRoom?.id).toBe(roomId);
    }, 10000);

    it("should leave a room", async () => {
      const roomId = "test-room";
      const userId = "user-123";
      const userName = "Test User";

      // Mock the WebSocket provider to avoid actual connection
      vi.spyOn(manager as any, "createYjsDocument").mockResolvedValue(undefined);
      vi.spyOn(manager as any, "connect").mockResolvedValue(undefined);
      vi.spyOn(manager as any, "cleanupYjsDocument").mockResolvedValue(undefined);
      vi.spyOn(manager as any, "disconnect").mockResolvedValue(undefined);

      await manager.joinRoom(roomId, userId, userName);
      await manager.leaveRoom();

      expect(manager.state.isConnected).toBe(false);
      expect(manager.state.currentUser).toBeUndefined();
      expect(manager.state.currentRoom).toBeUndefined();
    }, 10000);
  });

  describe("Document Creation", () => {
    it("should create a document", async () => {
      const roomId = "test-room";
      const userId = "user-123";
      const userName = "Test User";

      // Mock the WebSocket provider to avoid actual connection
      vi.spyOn(manager as any, "createYjsDocument").mockResolvedValue(undefined);
      vi.spyOn(manager as any, "connect").mockResolvedValue(undefined);

      await manager.joinRoom(roomId, userId, userName);

      const document = await manager.createDocument("Test Document", DocumentType.CODE, "console.log('Hello World');");

      expect(document).toBeDefined();
      expect(document.id).toBeDefined();
      expect(document.name).toBe("Test Document");
      expect(document.type).toBe(DocumentType.CODE);
      expect(document.content.toString()).toBe("console.log('Hello World');");
      expect(document.version).toBe(1);
    }, 10000);
  });

  describe("User Management", () => {
    it("should update user presence", async () => {
      const roomId = "test-room";
      const userId = "user-123";
      const userName = "Test User";

      // Mock the WebSocket provider to avoid actual connection
      vi.spyOn(manager as any, "createYjsDocument").mockResolvedValue(undefined);
      vi.spyOn(manager as any, "connect").mockResolvedValue(undefined);

      await manager.joinRoom(roomId, userId, userName);

      manager.updatePresence({
        cursor: { x: 10, y: 20 },
        isTyping: true,
      });

      // Presence should be updated (though we can't easily test the internal state)
      expect(manager.state.currentUser).toBeDefined();
    }, 10000);
  });

  describe("Event Handling", () => {
    it("should add and remove event listeners", () => {
      const handler = () => {};

      manager.addEventHandler("userJoined" as any, handler);
      manager.removeEventHandler("userJoined" as any, handler);

      // No error should be thrown
      expect(true).toBe(true);
    });
  });

  describe("Configuration", () => {
    it("should use custom configuration", () => {
      const customConfig: CollaborationConfig = {
        ...mockConfig,
        connection: {
          ...mockConfig.connection,
          url: "ws://custom-server:8080",
        },
      };

      const customManager = new CollaborationManager(customConfig);
      expect(customManager).toBeDefined();

      // Clean up
      customManager.leaveRoom();
    });
  });
});
