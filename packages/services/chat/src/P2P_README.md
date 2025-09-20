# P2P Chat System

A comprehensive peer-to-peer chat system built on top of the Reynard chat foundation,
enabling real-time user-to-user messaging with all the features of modern chat applications.

## Features

### Core Messaging

- **Real-time messaging** via WebSocket connections
- **Room-based conversations** (direct messages, group chats, public/private channels)
- **Message reactions** with emoji support
- **Read receipts** to track message delivery and reading status
- **Typing indicators** to show when users are actively typing
- **Message threads** for organized discussions
- **Message editing and deletion** with edit history
- **File attachments** with progress tracking and previews

### Advanced Features

- **Presence indicators** showing user online/away/busy/offline status
- **Message search** across all conversations
- **Message pinning** for important announcements
- **Priority messaging** (normal, high, urgent)
- **Notification system** with configurable settings
- **Message export/import** for backup and migration
- **Markdown support** with the same powerful parser as assistant chat
- **Code sharing** with syntax highlighting

### Technical Features

- **Shared codebase** with assistant chat for consistency
- **Streaming markdown parser** for real-time content rendering
- **Optimistic updates** for responsive user experience
- **Offline support** with message queuing
- **Connection resilience** with automatic reconnection
- **Mobile-first design** with responsive layouts
- **Accessibility support** (WCAG 2.1 compliant)
- **Theme integration** with Reynard's design system

## Quick Start

### Basic P2P Chat

```tsx
import { P2PChatContainer } from "reynard-components";

function MyApp() {
  const currentUser = {
    id: "user-123",
    name: "John Doe",
    status: "online",
    avatar: "👤",
  };

  return (
    <P2PChatContainer
      currentUser={currentUser}
      realtimeEndpoint="wss://your-server.com/chat"
      apiEndpoint="/api/chat"
      config={{
        enableFileUploads: true,
        enableReactions: true,
        enableTypingIndicators: true,
        enableReadReceipts: true,
      }}
    />
  );
}
```

### Custom P2P Chat with Hooks

```tsx
import { useP2PChat } from "reynard-components";

function CustomChat() {
  const currentUser = {
    id: "user-123",
    name: "John Doe",
    status: "online",
  };

  const p2pChat = useP2PChat({
    currentUser,
    realtimeEndpoint: "wss://your-server.com/chat",
    autoConnect: true,
  });

  const sendMessage = async (content: string) => {
    const activeRoom = p2pChat.activeRoom();
    if (activeRoom) {
      await p2pChat.actions.sendMessageToRoom(activeRoom.id, content);
    }
  };

  return (
    <div>
      <h2>Rooms ({p2pChat.rooms().length})</h2>
      {p2pChat.rooms().map(room => (
        <div key={room.id} onClick={() => p2pChat.actions.switchRoom(room.id)}>
          {room.name}
        </div>
      ))}

      <div>
        {p2pChat.messages().map(message => (
          <div key={message.id}>
            <strong>{message.sender?.name}:</strong> {message.content}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Component Reference

### P2PChatContainer

The main container component for P2P chat functionality.

```tsx
interface P2PChatContainerProps {
  currentUser: ChatUser;
  realtimeEndpoint: string;
  apiEndpoint?: string;
  authHeaders?: Record<string, string>;
  initialRoomId?: string;
  initialRooms?: ChatRoom[];
  config?: P2PChatConfig;
  ui?: UIConfig;
  onRoomJoined?: (room: ChatRoom) => void;
  onMessageReceived?: (message: P2PChatMessage) => void;
  onError?: (error: any) => void;
}
```

### P2PMessage

Individual message component with P2P-specific features.

```tsx
interface P2PMessageProps {
  message: P2PChatMessage;
  currentUser: ChatUser;
  showSender?: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  showReactions?: boolean;
  showReadReceipts?: boolean;
  onMessageAction?: (action: string, message: P2PChatMessage) => void;
  onReaction?: (emoji: string) => void;
}
```

### RoomList

Room/channel management component.

```tsx
interface RoomListProps {
  rooms: ChatRoom[];
  activeRoom?: ChatRoom;
  currentUser: ChatUser;
  onRoomSelect?: (room: ChatRoom) => void;
  onCreateRoom?: () => void;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  compact?: boolean;
}
```

### UserList

User presence and management component.

```tsx
interface UserListProps {
  users: ChatUser[];
  currentUser: ChatUser;
  onUserSelect?: (user: ChatUser) => void;
  showStatus?: boolean;
  showActions?: boolean;
  compact?: boolean;
}
```

## Hook Reference

### useP2PChat

Main composable for P2P chat functionality.

```tsx
interface UseP2PChatOptions {
  currentUser: ChatUser;
  realtimeEndpoint: string;
  apiEndpoint?: string;
  authHeaders?: Record<string, string>;
  initialRoomId?: string;
  initialRooms?: ChatRoom[];
  autoConnect?: boolean;
  config?: P2PChatConfig;
}

interface UseP2PChatReturn extends P2PChatState {
  actions: P2PChatActions;
}
```

#### Key Actions

- `createRoom(name, type, participants)` - Create a new room
- `joinRoom(roomId)` - Join an existing room
- `leaveRoom(roomId)` - Leave a room
- `sendMessageToRoom(roomId, content, options)` - Send a message
- `editMessage(messageId, newContent)` - Edit a message
- `deleteMessage(messageId)` - Delete a message
- `reactToMessage(messageId, emoji)` - Add/remove reaction
- `startTyping(roomId)` - Start typing indicator
- `stopTyping(roomId)` - Stop typing indicator
- `uploadFile(file, roomId)` - Upload file attachment
- `searchMessages(query, roomId?)` - Search messages

## Type Definitions

### Core Types

```tsx
interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "away" | "busy" | "offline";
  lastSeen?: number;
  metadata?: {
    timezone?: string;
    language?: string;
    role?: string;
    customFields?: Record<string, any>;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  type: "direct" | "group" | "public" | "private";
  description?: string;
  participants: ChatUser[];
  metadata?: {
    createdAt: number;
    createdBy: string;
    topic?: string;
    settings?: RoomSettings;
  };
  unreadCount?: number;
  lastMessage?: P2PChatMessage;
}

interface P2PChatMessage extends ChatMessage {
  sender?: ChatUser;
  recipient?: ChatUser;
  roomId: string;
  threadId?: string;
  replyTo?: string;
  reactions?: MessageReaction[];
  readBy?: MessageReadReceipt[];
  attachments?: MessageAttachment[];
  priority?: "low" | "normal" | "high" | "urgent";
  isPinned?: boolean;
  editHistory?: MessageEdit[];
  deliveryStatus?: "sent" | "delivered" | "read" | "failed";
}
```

### Real-time Events

```tsx
type P2PChatEvent =
  | UserJoinedEvent
  | UserLeftEvent
  | UserStatusChangedEvent
  | MessageSentEvent
  | MessageEditedEvent
  | MessageDeletedEvent
  | MessageReactionEvent
  | TypingStartEvent
  | TypingStopEvent
  | RoomCreatedEvent
  | RoomUpdatedEvent
  | ReadReceiptEvent;
```

## Configuration

### Chat Configuration

```tsx
interface P2PChatConfig {
  enableFileUploads?: boolean;
  enableReactions?: boolean;
  enableTypingIndicators?: boolean;
  enableReadReceipts?: boolean;
  enableThreads?: boolean;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  messageRetention?: number;
}
```

### UI Configuration

```tsx
interface UIConfig {
  showUserList?: boolean;
  showRoomList?: boolean;
  compact?: boolean;
  theme?: "light" | "dark" | "auto";
}
```

## Server Integration

### WebSocket Events

The P2P chat system expects the following WebSocket message format:

```json
{
  "type": "message_sent",
  "message": {
    "id": "msg-123",
    "role": "user",
    "content": "Hello World",
    "timestamp": 1640995200000,
    "roomId": "room-456",
    "sender": {
      "id": "user-789",
      "name": "John Doe",
      "status": "online"
    }
  },
  "timestamp": 1640995200000
}
```

### REST API Endpoints

Expected API endpoints:

- `POST /api/chat/rooms` - Create room
- `GET /api/chat/rooms/:id/messages` - Get room messages
- `POST /api/chat/rooms/:id/messages` - Send message
- `PATCH /api/chat/messages/:id` - Edit message
- `DELETE /api/chat/messages/:id` - Delete message
- `POST /api/chat/messages/:id/reactions` - React to message
- `POST /api/chat/upload` - Upload file
- `GET /api/chat/search/messages` - Search messages

## Styling

The P2P chat system uses CSS custom properties for theming:

```css
:root {
  --reynard-chat-bg: #ffffff;
  --reynard-chat-surface: #f8fafc;
  --reynard-chat-border: #e2e8f0;
  --reynard-chat-primary: #3b82f6;
  --reynard-chat-success: #10b981;
  --reynard-chat-warning: #f59e0b;
  --reynard-chat-error: #ef4444;
}
```

Import the styles:

```tsx
import "reynard-components/dist/chat/styles.css";
import "reynard-components/dist/chat/styles/p2p.css";
```

## Examples

See the `examples/` directory for comprehensive usage examples:

- `BasicP2PChat` - Simple P2P chat setup
- `DualChatExample` - Assistant and P2P chat side-by-side
- `CustomP2PChat` - Custom implementation using hooks
- `RealtimeFeaturesDemo` - Showcase of real-time features

## Code Sharing with Assistant Chat

The P2P chat system shares significant code with the assistant chat:

- **Markdown parser** - Same `StreamingMarkdownParser` for consistent rendering
- **Message components** - Shared base components with P2P extensions
- **Styling system** - Consistent design language and theming
- **Type definitions** - Extended from base chat types
- **Utilities** - Shared helper functions and validators

This ensures:

- Consistent user experience across chat types
- Reduced bundle size through code reuse
- Easier maintenance and updates
- Feature parity between chat systems

## Performance Considerations

- **Virtual scrolling** for large message lists
- **Message pagination** to avoid loading too many messages
- **Optimistic updates** for immediate UI feedback
- **Connection pooling** for efficient WebSocket usage
- **File upload chunking** for large files
- **Message caching** for faster loading
- **Tree-shaking support** for minimal bundle size

## Accessibility

- **Keyboard navigation** for all interactive elements
- **Screen reader support** with proper ARIA labels
- **Focus management** for modal dialogs and dropdowns
- **High contrast support** for visual accessibility
- **Reduced motion** options for motion-sensitive users
- **Voice input** compatibility
- **Touch target sizing** for mobile accessibility

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+
- Mobile browsers with WebSocket support

## License

Same as Reynard components package.
