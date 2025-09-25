# Reynard Collaboration Package

> **Real-time collaboration system for Reynard applications** 🦊

The Reynard Collaboration package provides comprehensive real-time collaboration capabilities using Yjs, WebSocket connections, and the existing Reynard infrastructure. It enables multiple users to collaborate on documents simultaneously with features like live editing, user presence, cursor tracking, and conflict resolution.

## Features

### 🚀 **Core Collaboration**

- **Real-time Document Sync**: Yjs-based operational transformation for conflict-free collaboration
- **User Presence**: Live cursor tracking, selection ranges, and typing indicators
- **Document Management**: Create, update, and manage collaborative documents
- **Room Management**: Join/leave collaboration rooms with user permissions

### 🔗 **Connection Management**

- **WebSocket Integration**: Built on Reynard's existing connection infrastructure
- **Automatic Reconnection**: Robust connection handling with exponential backoff
- **Connection Pooling**: Efficient resource management for multiple connections
- **Health Monitoring**: Real-time connection health and metrics tracking

### 📝 **Document Types**

- **Text Documents**: Plain text, markdown, and structured content
- **Code Documents**: Syntax-highlighted code with language detection
- **Rich Content**: Support for various document formats and metadata

### 👥 **User Management**

- **Role-based Access**: Owner, editor, viewer, and commentor roles
- **Permission System**: Granular permissions for reading, writing, sharing, and managing
- **User Presence**: Real-time user status and activity tracking
- **Invitation System**: Secure user invitation and room sharing

## Installation

```bash
npm install reynard-collaboration
```

## Quick Start

### 1. Basic Setup

```typescript
import { createCollaborationManager, DEFAULT_COLLABORATION_CONFIG } from "reynard-collaboration";

// Create collaboration manager with default config
const collaborationManager = createCollaborationManager({
  connection: {
    url: "ws://localhost:8080",
  },
  yjs: {
    provider: {
      room: "my-document-room",
    },
  },
});
```

### 2. Join a Collaboration Room

```typescript
// Join a room with user information
await collaborationManager.joinRoom("room-123", "user-456", {
  name: "John Doe",
  email: "john@example.com",
  color: "#FF6B6B",
  permissions: {
    role: "editor",
    canEdit: true,
    canComment: true,
    canInvite: false,
    canManage: false,
  },
});
```

### 3. Create and Manage Documents

```typescript
// Create a new document
const document = await collaborationManager.createDocument(
  "My Collaborative Document",
  "markdown",
  "# Hello World\n\nThis is a collaborative document!",
  {
    language: "markdown",
    tabSize: 2,
    insertSpaces: true,
  }
);

// Get current document
const currentDoc = collaborationManager.document;
console.log("Document content:", currentDoc?.content);
```

### 4. Update User Presence

```typescript
// Update cursor position and selection
collaborationManager.updatePresence({
  cursor: { line: 10, column: 5, offset: 150 },
  selection: {
    start: { line: 10, column: 5, offset: 150 },
    end: { line: 12, column: 10, offset: 200 },
    isReversed: false,
  },
  isTyping: true,
});
```

### 5. Listen to Events

```typescript
// Listen for user events
collaborationManager.addEventListener("user_joined", event => {
  console.log("User joined:", event.data);
});

// Listen for document events
collaborationManager.addEventListener("document_updated", event => {
  console.log("Document updated:", event.data);
});

// Listen for presence events
collaborationManager.addEventListener("user_presence_updated", event => {
  console.log("User presence updated:", event.data);
});
```

## Advanced Usage

### Custom Configuration

```typescript
import { CollaborationManager, CollaborationConfig } from "reynard-collaboration";

const config: CollaborationConfig = {
  connection: {
    type: "WEBSOCKET",
    url: "wss://collaboration.example.com",
    timeout: 30000,
    retryCount: 5,
    retryDelay: 1000,
    heartbeatInterval: 30000,
  },
  yjs: {
    provider: {
      type: "WEBSOCKET",
      url: "wss://collaboration.example.com",
      room: "my-room",
      awareness: true,
      maxConns: 20,
      filterBcConns: true,
    },
    awareness: true,
    maxConns: 20,
    filterBcConns: true,
  },
  document: {
    autoSave: true,
    saveInterval: 5000,
    maxHistorySize: 100,
    compressionEnabled: true,
  },
  user: {
    showPresence: true,
    showCursors: true,
    showSelections: true,
    enableTypingIndicators: true,
    cursorColor: "#FF6B6B",
  },
  room: {
    maxUsers: 50,
    allowGuests: false,
    requireAuth: true,
    enableVideoChat: false,
    enableScreenShare: false,
    enableRecording: false,
  },
  performance: {
    debounceMs: 100,
    throttleMs: 50,
    batchSize: 100,
    maxRetries: 3,
  },
};

const manager = new CollaborationManager(config);
```

### Yjs Document Management

```typescript
import { YjsDocumentManager, ProviderType } from "reynard-collaboration";

// Create Yjs document manager
const yjsManager = new YjsDocumentManager({
  type: ProviderType.WEBSOCKET,
  url: "ws://localhost:8080",
  room: "document-room",
  awareness: true,
  maxConns: 20,
  filterBcConns: true,
});

// Connect to collaboration server
await yjsManager.connect();

// Get document content
const content = yjsManager.getContent();

// Update content
yjsManager.updateContent("New document content");

// Insert text at position
yjsManager.insertText(10, "inserted text");

// Delete text
yjsManager.deleteText(10, 5);

// Update metadata
yjsManager.updateMetadata({
  title: "My Document",
  author: "John Doe",
  lastModified: Date.now(),
});

// Listen for changes
yjsManager.addChangeListener(event => {
  console.log("Document changed:", event);
});

// Listen for awareness changes
yjsManager.addAwarenessListener(event => {
  console.log("Awareness changed:", event);
});
```

## API Reference

### CollaborationManager

The main class for managing collaboration sessions.

#### Methods

- `joinRoom(roomId: string, userId: string, userInfo: Partial<CollaborationUser>): Promise<void>`
- `leaveRoom(): Promise<void>`
- `createDocument(name: string, type: DocumentType, content?: string, metadata?: Record<string, unknown>): Promise<CollaborationDocument>`
- `updatePresence(presence: Partial<UserPresence>): void`
- `addEventListener<T>(eventType: CollaborationEventType, handler: (event: CollaborationEvent & { data: T }) => void): void`
- `removeEventListener(eventType: CollaborationEventType, handler: Function): void`
- `disconnect(): Promise<void>`

#### Properties

- `state: CollaborationState` - Current collaboration state
- `room: CollaborationRoom | undefined` - Current room
- `document: CollaborationDocument | undefined` - Current document
- `user: CollaborationUser | undefined` - Current user
- `isConnected: boolean` - Connection status
- `isSyncing: boolean` - Sync status

### YjsDocumentManager

Manages Yjs documents and synchronization.

#### Methods

- `connect(): Promise<void>`
- `disconnect(): Promise<void>`
- `updateContent(content: string): void`
- `insertText(position: number, text: string): void`
- `deleteText(position: number, length: number): void`
- `updateMetadata(metadata: Record<string, unknown>): void`
- `getMetadata(): Record<string, unknown>`
- `updatePresence(presence: Partial<UserPresence>): void`
- `getPresenceStates(): Map<number, UserPresence>`
- `getContent(): string`
- `getLength(): number`
- `isSynced(): boolean`
- `createSnapshot(): Snapshot`
- `restoreFromSnapshot(snapshot: Snapshot): void`

## Event Types

The collaboration system emits various events for different activities:

### Document Events

- `document_created` - Document was created
- `document_updated` - Document content was updated
- `document_deleted` - Document was deleted
- `document_shared` - Document was shared

### User Events

- `user_joined` - User joined the room
- `user_left` - User left the room
- `user_presence_updated` - User presence was updated
- `user_permissions_changed` - User permissions were changed

### Content Events

- `content_inserted` - Content was inserted
- `content_deleted` - Content was deleted
- `content_formatted` - Content was formatted
- `cursor_moved` - Cursor position changed
- `selection_changed` - Selection range changed

### Connection Events

- `connection_established` - Connection was established
- `connection_lost` - Connection was lost
- `connection_restored` - Connection was restored

## Error Handling

The package provides comprehensive error handling with specific error codes:

```typescript
import { CollaborationError, CollaborationErrorCode } from "reynard-collaboration";

try {
  await collaborationManager.joinRoom("room-123", "user-456", userInfo);
} catch (error) {
  if (error instanceof CollaborationError) {
    switch (error.code) {
      case CollaborationErrorCode.CONNECTION_FAILED:
        console.error("Failed to connect to collaboration server");
        break;
      case CollaborationErrorCode.ROOM_NOT_FOUND:
        console.error("Room not found");
        break;
      case CollaborationErrorCode.ROOM_FULL:
        console.error("Room is full");
        break;
      default:
        console.error("Collaboration error:", error.message);
    }
  }
}
```

## Performance Considerations

### Optimization Settings

```typescript
const config = {
  performance: {
    debounceMs: 100, // Debounce document updates
    throttleMs: 50, // Throttle presence updates
    batchSize: 100, // Batch operations
    maxRetries: 3, // Maximum retry attempts
  },
  document: {
    autoSave: true, // Enable auto-save
    saveInterval: 5000, // Save every 5 seconds
    maxHistorySize: 100, // Limit history size
    compressionEnabled: true, // Enable compression
  },
};
```

### Memory Management

The package automatically manages memory usage by:

- Limiting document history size
- Compressing document updates
- Cleaning up unused connections
- Garbage collecting old awareness states

## Integration with Reynard

This package integrates seamlessly with other Reynard packages:

- **reynard-connection**: Uses existing WebSocket infrastructure
- **reynard-monaco**: Monaco Editor integration (coming soon)
- **reynard-auth**: User authentication and permissions
- **reynard-validation**: Input validation and error handling

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
npm run test:coverage
```

### Development Mode

```bash
npm run dev
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

---

_Built with 🦊 by the Reynard team_
