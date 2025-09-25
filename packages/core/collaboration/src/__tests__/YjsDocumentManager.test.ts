/**
 * Tests for YjsDocumentManager
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { YjsDocumentManager } from "../YjsDocumentManager";
import { ProviderType, CollaborationConfig } from "../types";

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
    defaultRole: "editor" as any,
  },
  persistence: {
    enabled: true,
    provider: ProviderType.INDEXEDDB,
  },
};

describe("YjsDocumentManager", () => {
  let manager: YjsDocumentManager;

  beforeEach(() => {
    manager = new YjsDocumentManager("test-room", mockConfig);
  });

  afterEach(async () => {
    await manager.destroy();
  });

  describe("Initialization", () => {
    it("should initialize with config", () => {
      expect(manager).toBeDefined();
      expect(manager.getDocument()).toBeDefined();
      expect(manager.getText()).toBeDefined();
      expect(manager.getAwareness()).toBeDefined();
    });

    it("should have empty initial content", () => {
      const text = manager.getText();
      expect(text.toString()).toBe("");
      expect(text.length).toBe(0);
    });
  });

  describe("Content Management", () => {
    it("should update content", () => {
      const content = "Hello, World!";
      const text = manager.getText();
      text.insert(0, content);
      expect(text.toString()).toBe(content);
      expect(text.length).toBe(content.length);
    });

    it("should insert text at position", () => {
      const text = manager.getText();
      text.insert(0, "Hello World!");
      text.insert(5, ", ");
      expect(text.toString()).toBe("Hello,  World!");
    });

    it("should delete text at position", () => {
      const text = manager.getText();
      text.insert(0, "Hello, World!");
      text.delete(5, 2);
      expect(text.toString()).toBe("HelloWorld!");
    });
  });

  describe("Metadata Management", () => {
    it("should update metadata", () => {
      const metadata = manager.getMap("metadata");
      const testData = {
        title: "Test Document",
        author: "Test Author",
        created: Date.now(),
      };

      metadata.set("title", testData.title);
      metadata.set("author", testData.author);
      metadata.set("created", testData.created);

      expect(metadata.get("title")).toBe(testData.title);
      expect(metadata.get("author")).toBe(testData.author);
      expect(metadata.get("created")).toBe(testData.created);
    });

    it("should handle empty metadata", () => {
      const metadata = manager.getMap("metadata");
      expect(metadata).toBeDefined();
      expect(typeof metadata).toBe("object");
    });
  });

  describe("Presence Management", () => {
    it("should update presence", () => {
      const user = {
        id: "user-123",
        name: "Test User",
        role: "editor" as any,
        lastActive: Date.now(),
      };

      const presence = {
        cursor: { x: 10, y: 20 },
        isTyping: true,
      };

      manager.setLocalUserPresence(user, presence);
      const awareness = manager.getAwareness();
      const localState = awareness.getLocalState();

      expect(localState).toBeDefined();
      expect(localState?.userId).toBe(user.id);
      expect(localState?.cursor).toEqual(presence.cursor);
      expect(localState?.isTyping).toBe(presence.isTyping);
    });

    it("should get awareness states", () => {
      const awareness = manager.getAwareness();
      const states = awareness.getStates();
      expect(states).toBeInstanceOf(Map);
    });
  });

  describe("Document State", () => {
    it("should get document", () => {
      const doc = manager.getDocument();
      expect(doc).toBeDefined();
    });

    it("should get text", () => {
      const text = manager.getText();
      expect(text).toBeDefined();
    });

    it("should get map", () => {
      const map = manager.getMap("test");
      expect(map).toBeDefined();
    });

    it("should get array", () => {
      const array = manager.getArray("test");
      expect(array).toBeDefined();
    });
  });
});
