# Reynard Chat System 🦊💬

A comprehensive, production-ready chat messaging system for SolidJS applications with advanced streaming capabilities, markdown parsing, thinking sections, and tool integration.

## ✨ Features

### 🚀 **Core Capabilities**

- **Real-time Streaming**: Advanced streaming text processing with real-time markdown rendering
- **Thinking Sections**: Support for AI assistant thinking process visualization
- **Tool Integration**: Complete tool calling system with progress tracking
- **Markdown Parsing**: Full markdown support including tables, code blocks, and math
- **TypeScript First**: Complete type safety with excellent IntelliSense

### 🎨 **UI/UX Excellence**

- **Responsive Design**: Mobile-first with adaptive layouts
- **Accessibility**: Full WCAG 2.1 compliance with keyboard navigation
- **Theming**: Seamless integration with Reynard's theming system
- **Animations**: Smooth transitions and engaging micro-interactions
- **Dark Mode**: Built-in dark mode support

### ⚡ **Performance**

- **Optimized Streaming**: Efficient chunk processing and buffering
- **Memory Management**: Smart history limiting and cleanup
- **Lazy Loading**: Progressive content loading
- **Tree Shakable**: Import only what you need

## 📦 Installation

```bash
npm install reynard-components solid-js
```

## 🎯 Quick Start

### Basic Chat Implementation

```tsx
import { ChatContainer } from "reynard-components";
import "reynard-components/styles";

function App() {
  return (
    <ChatContainer
      endpoint="/api/chat"
      height="600px"
      config={{
        enableThinking: true,
        enableTools: true,
        showTimestamps: true,
      }}
      onMessageSent={(message) => console.log("Sent:", message)}
      onMessageReceived={(message) => console.log("Received:", message)}
    />
  );
}
```

### Advanced Usage with Custom Components

```tsx
import {
  ChatContainer,
  ChatMessage,
  MessageInput,
  useChat,
} from "reynard-components";

function CustomChatApp() {
  const chat = useChat({
    endpoint: "/api/chat",
    authHeaders: { Authorization: "Bearer token" },
    tools: [
      {
        name: "calculator",
        description: "Perform mathematical calculations",
        parameters: {
          expression: { type: "string", description: "Math expression" },
        },
      },
    ],
    config: {
      enableThinking: true,
      maxHistoryLength: 50,
      autoScroll: true,
    },
  });

  return (
    <div class="custom-chat">
      <div class="messages">
        <For each={chat.messages()}>
          {(message) => (
            <ChatMessage
              message={message}
              showTimestamp={true}
              showTokenCount={true}
              onToolAction={(action, toolCall) => {
                console.log("Tool action:", action, toolCall);
              }}
            />
          )}
        </For>
      </div>

      <MessageInput
        onSubmit={chat.actions.sendMessage}
        disabled={chat.isStreaming()}
        multiline={true}
        placeholder="Ask me anything..."
      />
    </div>
  );
}
```

## 🧩 Core Components

### ChatContainer

The main orchestrator component that provides a complete chat experience.

```tsx
<ChatContainer
  endpoint="/api/chat"
  authHeaders={{ Authorization: "Bearer token" }}
  height="100vh"
  variant="default" // 'default' | 'compact' | 'detailed'
  config={{
    enableThinking: true,
    enableTools: true,
    autoScroll: true,
    showTimestamps: true,
    showTokenCounts: false,
    maxHistoryLength: 100,
  }}
  tools={[
    {
      name: "search",
      description: "Search the web",
      parameters: {
        query: { type: "string", description: "Search query" },
      },
    },
  ]}
  onMessageSent={(message) => console.log("Sent:", message)}
  onMessageReceived={(message) => console.log("Received:", message)}
  onError={(error) => console.error("Chat error:", error)}
  onStreamingStart={() => console.log("Streaming started")}
  onStreamingEnd={() => console.log("Streaming ended")}
/>
```

### ChatMessage

Individual message display with rich formatting and interactivity.

```tsx
<ChatMessage
  message={message}
  isLatest={true}
  showTimestamp={true}
  showTokenCount={true}
  avatar={<CustomAvatar />}
  customRenderer={(content, message) => <CustomContent content={content} />}
  onToolAction={(action, toolCall) => {
    if (action === "retry") {
      retryTool(toolCall);
    }
  }}
/>
```

### MessageInput

Advanced input component with smart features.

```tsx
<MessageInput
  placeholder="Type your message..."
  multiline={true}
  autoResize={true}
  maxLength={4000}
  showCounter={true}
  variant="default" // 'default' | 'compact'
  onSubmit={(content) => sendMessage(content)}
  onChange={(content) => setDraft(content)}
  submitButton={<CustomButton />}
/>
```

### MarkdownRenderer

Powerful markdown rendering with streaming support.

```tsx
<MarkdownRenderer
  content={markdownContent}
  streaming={isStreaming}
  enableMath={true}
  enableDiagrams={true}
  codeTheme="github-dark"
  onLinkClick={(url, event) => {
    event.preventDefault();
    openExternalLink(url);
  }}
  imageConfig={{
    lazy: true,
    placeholder: "/loading.gif",
    errorFallback: "/error.png",
  }}
/>
```

### ThinkingIndicator

Visualize AI thinking process with smooth animations.

```tsx
<ThinkingIndicator
  content="Let me think about this carefully..."
  isActive={isThinking}
  showContent={showThinkingDetails}
  variant="pulse" // 'dots' | 'pulse' | 'typing'
  label="Analyzing..."
/>
```

## 🔧 Composables

### useChat

Complete state management for chat functionality.

```tsx
const chat = useChat({
  endpoint: "/api/chat",
  authHeaders: { Authorization: "Bearer token" },
  config: {
    enableThinking: true,
    enableTools: true,
    autoScroll: true,
    showTimestamps: true,
    maxHistoryLength: 100,
  },
  tools: [], // Available tools
  initialMessages: [], // Pre-populate conversation
  autoConnect: true,
  reconnection: {
    enabled: true,
    maxAttempts: 3,
    delay: 1000,
    backoff: 2,
  },
});

// State
chat.messages(); // Current conversation
chat.isStreaming(); // Streaming status
chat.isThinking(); // Thinking status
chat.connectionState(); // 'connected' | 'connecting' | 'disconnected' | 'error'
chat.error(); // Current error if any

// Actions
await chat.actions.sendMessage("Hello!");
chat.actions.cancelStreaming();
chat.actions.clearConversation();
await chat.actions.retryLastMessage();
chat.actions.updateConfig({ enableThinking: false });
await chat.actions.connect();
chat.actions.disconnect();

// Export/Import
const json = chat.actions.exportConversation("json");
const markdown = chat.actions.exportConversation("markdown");
const text = chat.actions.exportConversation("txt");
chat.actions.importConversation(jsonData, "json");
```

## 🎨 Theming & Styling

The chat system integrates seamlessly with Reynard's theming system:

```css
:root {
  /* Chat-specific theme variables */
  --reynard-chat-bg: var(--bg-color);
  --reynard-chat-surface: var(--card-bg);
  --reynard-chat-border: var(--border-color);

  /* Message role colors */
  --reynard-chat-user-bg: var(--accent);
  --reynard-chat-assistant-bg: var(--card-bg);
  --reynard-chat-system-bg: #fef3c7;
  --reynard-chat-tool-bg: #ecfdf5;

  /* State colors */
  --reynard-chat-error: #ef4444;
  --reynard-chat-success: #10b981;
  --reynard-chat-warning: #f59e0b;
}
```

### Custom Styling

```css
/* Override specific components */
.reynard-chat-message--user {
  --reynard-chat-user-bg: #your-brand-color;
}

.reynard-chat-container--compact {
  font-size: 0.875rem;
}

/* Custom animations */
.reynard-chat-message {
  animation: custom-slide-in 0.3s ease-out;
}
```

## 🔌 API Integration

### Backend Requirements

Your chat endpoint should support streaming responses:

```javascript
// Express.js example
app.post("/api/chat", async (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Transfer-Encoding", "chunked");

  const { message, conversationHistory, tools } = req.body;

  // Send start chunk
  res.write(`data: ${JSON.stringify({ type: "start" })}\n\n`);

  // Send thinking chunks
  res.write(
    `data: ${JSON.stringify({
      type: "thinking",
      content: "Let me think about this...",
    })}\n\n`,
  );

  // Send content chunks
  for (const chunk of responseChunks) {
    res.write(
      `data: ${JSON.stringify({
        type: "content",
        content: chunk,
      })}\n\n`,
    );
  }

  // Send completion
  res.write(
    `data: ${JSON.stringify({
      type: "complete",
      done: true,
    })}\n\n`,
  );

  res.end();
});
```

### Tool Integration

```javascript
// Tool execution example
const tools = {
  calculator: async (args) => {
    const result = eval(args.expression); // Don't use eval in production!
    return { result, type: "number" };
  },

  search: async (args) => {
    const results = await searchAPI(args.query);
    return { results, type: "search_results" };
  },
};

// During streaming
res.write(
  `data: ${JSON.stringify({
    type: "tool_call",
    toolExecution: {
      toolName: "calculator",
      callId: "tool-123",
      parameters: { expression: "2 + 2" },
      status: "running",
    },
  })}\n\n`,
);

// After execution
res.write(
  `data: ${JSON.stringify({
    type: "tool_result",
    toolExecution: {
      toolName: "calculator",
      callId: "tool-123",
      status: "completed",
      result: 4,
    },
  })}\n\n`,
);
```

## 🧪 Testing

The chat system includes comprehensive tests:

```bash
# Run all tests
npm test

# Run specific test suites
npm test StreamingMarkdownParser
npm test useChat
npm test ChatMessage
```

### Testing Your Implementation

```tsx
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { ChatContainer } from "reynard-components";

test("sends message correctly", async () => {
  const onMessageSent = vi.fn();

  render(() => (
    <ChatContainer endpoint="/api/chat" onMessageSent={onMessageSent} />
  ));

  const input = screen.getByLabelText("Message input");
  const sendButton = screen.getByRole("button", { name: /send/i });

  fireEvent.input(input, { target: { value: "Hello!" } });
  fireEvent.click(sendButton);

  expect(onMessageSent).toHaveBeenCalledWith(
    expect.objectContaining({
      content: "Hello!",
      role: "user",
    }),
  );
});
```

## 🚀 Performance Optimization

### Streaming Optimization

```tsx
// Use batched parsing for large content
import { parseMarkdownBatched } from "reynard-components";

const result = parseMarkdownBatched(largeContent, 1024); // 1KB chunks
```

### Memory Management

```tsx
const chat = useChat({
  config: {
    maxHistoryLength: 50, // Limit conversation history
    autoScroll: true, // Reduce DOM queries
  },
});
```

### Code Splitting

```tsx
// Lazy load chat components
const ChatContainer = lazy(() =>
  import("reynard-components").then((m) => ({
    default: m.ChatContainer,
  })),
);

function App() {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatContainer endpoint="/api/chat" />
    </Suspense>
  );
}
```

## 🔧 Advanced Customization

### Custom Message Types

```tsx
// Extend message types
interface CustomMessage extends ChatMessage {
  customData?: {
    priority: "high" | "normal" | "low";
    tags: string[];
  };
}

// Custom renderer
const CustomMessageRenderer = (props: { message: CustomMessage }) => {
  return (
    <div class={`message priority-${props.message.customData?.priority}`}>
      <ChatMessage message={props.message} />
      <div class="tags">
        <For each={props.message.customData?.tags}>
          {(tag) => <span class="tag">{tag}</span>}
        </For>
      </div>
    </div>
  );
};
```

### Custom Streaming Parser

```tsx
import { StreamingMarkdownParser } from "reynard-components";

class CustomParser extends StreamingMarkdownParser {
  protected processCustomBlock(line: string): boolean {
    // Add custom block processing
    if (line.startsWith(":::")) {
      // Handle custom callout blocks
      return true;
    }
    return false;
  }
}
```

## 📱 Mobile Considerations

The chat system is fully responsive and mobile-optimized:

```css
@media (max-width: 768px) {
  .reynard-chat-container {
    height: 100vh; /* Full viewport on mobile */
    border-radius: 0; /* Remove border radius */
  }

  .reynard-message-input {
    /* Optimize input for mobile keyboards */
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
```

## 🔐 Security Considerations

### Content Sanitization

The markdown renderer automatically sanitizes HTML:

```tsx
// Content is automatically escaped
<MarkdownRenderer content="<script>alert('xss')</script>" />
// Renders as: &lt;script&gt;alert('xss')&lt;/script&gt;
```

### Authentication

```tsx
const chat = useChat({
  authHeaders: {
    Authorization: `Bearer ${getAuthToken()}`,
    "X-CSRF-Token": getCsrfToken(),
  },
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with tests
4. Run the test suite: `npm test`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- 📖 [Documentation](https://reynard-docs.example.com)
- 🐛 [Issue Tracker](https://github.com/reynard/issues)
- 💬 [Community Discord](https://discord.gg/reynard)
- 📧 [Email Support](mailto:support@reynard.dev)

---

**Built with ❤️ using SolidJS and modern web standards** 🦊
