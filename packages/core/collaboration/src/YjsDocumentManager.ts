/**
 * Yjs Document Manager for Reynard Collaboration
 *
 * Manages Yjs documents, synchronization, persistence, and awareness
 * for real-time collaborative editing.
 */

import { Doc as YDoc, Text as YText, Map as YMap, Array as YArray, XmlFragment as YXmlFragment } from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import { Awareness } from "y-protocols/awareness";
import { YjsProviderConfig, ProviderType, UserPresence } from "./types";

export class YjsDocumentManager {
  private ydoc: YDoc;
  private ytext: YText;
  private ymap: YMap<unknown>;
  private yarray: YArray<unknown>;
  private yxml: YXmlFragment;
  private awareness: Awareness;
  private provider?: WebsocketProvider;
  private persistence?: IndexeddbPersistence;
  private config: YjsProviderConfig;

  constructor(config: YjsProviderConfig) {
    this.config = config;

    // Initialize Yjs document
    this.ydoc = new YDoc();

    // Create shared data structures
    this.ytext = this.ydoc.getText("content");
    this.ymap = this.ydoc.getMap("metadata");
    this.yarray = this.ydoc.getArray("history");
    this.yxml = this.ydoc.getXmlFragment("structure");

    // Initialize awareness
    this.awareness = new Awareness(this.ydoc);

    this.setupEventListeners();
  }

  // ============================================================================
  // Public API Methods
  // ============================================================================

  /**
   * Get the Yjs document
   */
  getDocument(): YDoc {
    return this.ydoc;
  }

  /**
   * Get the shared text content
   */
  getText(): YText {
    return this.ytext;
  }

  /**
   * Get a shared map by name
   */
  getMap(name: string): YMap<unknown> {
    return this.ydoc.getMap(name);
  }

  /**
   * Get a shared array by name
   */
  getArray(name: string): YArray<unknown> {
    return this.ydoc.getArray(name);
  }

  /**
   * Get the awareness instance
   */
  getAwareness(): Awareness {
    return this.awareness;
  }

  /**
   * Set local user presence
   */
  setLocalUserPresence(user: any, presence: Partial<UserPresence>): void {
    this.awareness.setLocalState({
      userId: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      color: user.color,
      role: user.role,
      lastActive: Date.now(),
      ...presence,
    });
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Get the Yjs document
   */
  get document(): YDoc {
    return this.ydoc;
  }

  /**
   * Get the text content
   */
  get text(): YText {
    return this.ytext;
  }

  /**
   * Get the metadata map
   */
  get metadata(): YMap<unknown> {
    return this.ymap;
  }

  /**
   * Get the history array
   */
  get history(): YArray<unknown> {
    return this.yarray;
  }

  /**
   * Get the XML structure
   */
  get structure(): YXmlFragment {
    return this.yxml;
  }

  /**
   * Get the awareness instance
   */
  get awarenessInstance(): Awareness {
    return this.awareness;
  }

  /**
   * Get the provider
   */
  get providerInstance(): WebsocketProvider | undefined {
    return this.provider;
  }

  /**
   * Connect to the collaboration server
   */
  async connect(): Promise<void> {
    if (this.provider) {
      throw new Error("Already connected to provider");
    }

    try {
      // Create WebSocket provider
      this.provider = new WebsocketProvider(this.config.url!, this.config.room, this.ydoc, {
        awareness: this.awareness,
        connect: true,
        ...this.config.peerOpts,
      });

      // Set up persistence if enabled
      if (this.config.type === ProviderType.INDEXEDDB) {
        this.persistence = new IndexeddbPersistence(this.config.room, this.ydoc);
      }

      // Wait for connection
      await this.waitForConnection();
    } catch (error) {
      throw new Error(`Failed to connect to Yjs provider: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Disconnect from the collaboration server
   */
  async disconnect(): Promise<void> {
    if (this.provider) {
      this.provider.destroy();
      this.provider = undefined;
    }

    if (this.persistence) {
      this.persistence.destroy();
      this.persistence = undefined;
    }
  }

  /**
   * Update document content
   */
  updateContent(content: string): void {
    this.ytext.delete(0, this.ytext.length);
    this.ytext.insert(0, content);
  }

  /**
   * Insert text at position
   */
  insertText(position: number, text: string): void {
    this.ytext.insert(position, text);
  }

  /**
   * Delete text at position
   */
  deleteText(position: number, length: number): void {
    this.ytext.delete(position, length);
  }

  /**
   * Update document metadata
   */
  updateMetadata(metadata: Record<string, unknown>): void {
    Object.entries(metadata).forEach(([key, value]) => {
      this.ymap.set(key, value);
    });
  }

  /**
   * Get document metadata
   */
  getMetadata(): Record<string, unknown> {
    const metadata: Record<string, unknown> = {};
    this.ymap.forEach((value, key) => {
      metadata[key] = value;
    });
    return metadata;
  }

  /**
   * Update user presence
   */
  updatePresence(presence: Partial<UserPresence>): void {
    const currentState = this.awareness.getLocalState() || {};

    this.awareness.setLocalStateField("user", {
      ...currentState.user,
      cursor: presence.cursor,
      selection: presence.selection,
      isTyping: presence.isTyping,
      lastActivity: presence.lastActivity || Date.now(),
    });
  }

  /**
   * Get all user presence states
   */
  getPresenceStates(): Map<number, UserPresence> {
    const states = new Map<number, UserPresence>();

    this.awareness.getStates().forEach((state, clientId) => {
      if (state.user) {
        states.set(clientId, {
          userId: clientId.toString(),
          documentId: (this.getMetadata().documentId as string) || "",
          cursor: state.user.cursor,
          selection: state.user.selection,
          isTyping: state.user.isTyping || false,
          lastActivity: state.user.lastActivity || Date.now(),
          connectionHealth: "healthy" as any,
        });
      }
    });

    return states;
  }

  /**
   * Get document content as string
   */
  getContent(): string {
    return this.ytext.toString();
  }

  /**
   * Get document length
   */
  getLength(): number {
    return this.ytext.length;
  }

  /**
   * Check if document is synced
   */
  isSynced(): boolean {
    return this.ydoc.isSynced;
  }

  /**
   * Get document state vector
   */
  getStateVector(): Uint8Array {
    // TODO: Implement when Yjs version supports this method
    return new Uint8Array();
  }

  /**
   * Apply document update
   */
  applyUpdate(update: Uint8Array): void {
    // TODO: Implement when Yjs version supports this method
    console.log("Applying update:", update);
  }

  /**
   * Get document update
   */
  getUpdate(): Uint8Array {
    // TODO: Implement when Yjs version supports this method
    return new Uint8Array();
  }

  /**
   * Get document update from state vector
   */
  getUpdateFromStateVector(_stateVector: Uint8Array): Uint8Array {
    // TODO: Implement when Yjs version supports this method
    return new Uint8Array();
  }

  /**
   * Create a snapshot of the document
   */
  createSnapshot(): {
    content: string;
    metadata: Record<string, unknown>;
    stateVector: Uint8Array;
    timestamp: number;
  } {
    return {
      content: this.getContent(),
      metadata: this.getMetadata(),
      stateVector: this.getStateVector(),
      timestamp: Date.now(),
    };
  }

  /**
   * Restore document from snapshot
   */
  restoreFromSnapshot(snapshot: {
    content: string;
    metadata: Record<string, unknown>;
    stateVector: Uint8Array;
    timestamp: number;
  }): void {
    // Clear current content
    this.ytext.delete(0, this.ytext.length);

    // Restore content
    this.ytext.insert(0, snapshot.content);

    // Restore metadata
    this.ymap.clear();
    Object.entries(snapshot.metadata).forEach(([key, value]) => {
      this.ymap.set(key, value);
    });
  }

  /**
   * Add change listener
   */
  addChangeListener(listener: (event: any) => void): void {
    this.ytext.observe(listener);
  }

  /**
   * Remove change listener
   */
  removeChangeListener(listener: (event: any) => void): void {
    this.ytext.unobserve(listener);
  }

  /**
   * Add awareness change listener
   */
  addAwarenessListener(listener: (event: any) => void): void {
    this.awareness.on("change", listener);
  }

  /**
   * Remove awareness change listener
   */
  removeAwarenessListener(listener: (event: any) => void): void {
    this.awareness.off("change", listener);
  }

  /**
   * Add document update listener
   */
  addUpdateListener(listener: (update: Uint8Array, origin: any) => void): void {
    this.ydoc.on("update", listener);
  }

  /**
   * Remove document update listener
   */
  removeUpdateListener(listener: (update: Uint8Array, origin: any) => void): void {
    this.ydoc.off("update", listener);
  }

  /**
   * Destroy the document manager
   */
  destroy(): void {
    this.disconnect();
    this.ydoc.destroy();
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private setupEventListeners(): void {
    // Document update events
    this.ydoc.on("update", (update: Uint8Array, origin: any) => {
      // Handle document updates
      this.handleDocumentUpdate(update, origin);
    });

    // Text change events
    this.ytext.observe((event: any) => {
      // Handle text changes
      this.handleTextChange(event);
    });

    // Metadata change events
    this.ymap.observe((event: any) => {
      // Handle metadata changes
      this.handleMetadataChange(event);
    });

    // Awareness change events
    this.awareness.on("change", (event: any) => {
      // Handle awareness changes
      this.handleAwarenessChange(event);
    });
  }

  private async waitForConnection(): Promise<void> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Connection timeout"));
      }, 10000);

      this.provider!.on("status", (event: any) => {
        if (event.status === "connected") {
          clearTimeout(timeout);
          resolve();
        }
      });

      this.provider!.on("connection-error", (error: any) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  private handleDocumentUpdate(update: Uint8Array, origin: any): void {
    // Emit custom event for document updates
    const event = new CustomEvent("yjs-document-update", {
      detail: { update, origin, timestamp: Date.now() },
    });
    window.dispatchEvent(event);
  }

  private handleTextChange(event: any): void {
    // Emit custom event for text changes
    const customEvent = new CustomEvent("yjs-text-change", {
      detail: {
        event,
        content: this.getContent(),
        length: this.getLength(),
        timestamp: Date.now(),
      },
    });
    window.dispatchEvent(customEvent);
  }

  private handleMetadataChange(event: any): void {
    // Emit custom event for metadata changes
    const customEvent = new CustomEvent("yjs-metadata-change", {
      detail: {
        event,
        metadata: this.getMetadata(),
        timestamp: Date.now(),
      },
    });
    window.dispatchEvent(customEvent);
  }

  private handleAwarenessChange(event: any): void {
    // Emit custom event for awareness changes
    const customEvent = new CustomEvent("yjs-awareness-change", {
      detail: {
        event,
        states: this.getPresenceStates(),
        timestamp: Date.now(),
      },
    });
    window.dispatchEvent(customEvent);
  }
}
