# Reynard Chat Demo

A comprehensive demonstration app showcasing both AI assistant and peer-to-peer chat functionality using the Reynard component library.

## Features Demonstrated

### 🤖 AI Assistant Chat

- **Streaming responses** with real-time markdown parsing
- **Thinking sections** showing AI reasoning process
- **Tool integration** with progress tracking and results
- **Advanced markdown** support with code highlighting
- **Conversation management** with history and context

### 👥 Team Chat (P2P)

- **Real-time messaging** with WebSocket connections
- **Room management** (direct messages, group chats, channels)
- **User presence** indicators and status management
- **Typing indicators** and read receipts
- **Message reactions** with emoji support
- **File sharing** with upload progress and previews
- **Message search** and conversation history

### ⚡ Dual Chat Experience

- **Side-by-side** AI assistant and team chat
- **Synchronized workflows** for collaborative AI assistance
- **Flexible layouts** (horizontal/vertical)
- **Shared theming** and consistent design

### ✨ Interactive Features

- **Live demonstrations** of all chat capabilities
- **Feature toggles** to explore different configurations
- **Code examples** showing implementation details
- **Responsive design** working on all screen sizes

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/reynard.git
   cd reynard/examples/chat-demo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3001`

### Mock Backend

The demo includes a comprehensive mock backend service that simulates:

- AI assistant responses with streaming
- Real-time P2P messaging
- User presence and typing indicators
- File upload functionality
- Tool execution simulation

No external services required - everything runs locally!

## Demo Sections

### 1. AI Assistant Demo

Located at the "AI Assistant" tab, this section demonstrates:

- **Streaming Responses**: Watch as AI responses are generated in real-time
- **Thinking Sections**: See the AI's reasoning process before the final response
- **Tool Integration**: Execute tools like calculators, weather APIs, and search
- **Configuration Options**: Toggle features on/off to see their effects
- **Example Prompts**: Pre-built prompts to showcase different capabilities

```tsx
<ChatContainer
  endpoint="/api/assistant"
  config={{
    enableThinking: true,
    enableTools: true,
    showTimestamps: true,
  }}
/>
```

### 2. Team Chat Demo

The "Team Chat" tab showcases P2P messaging features:

- **Multiple Rooms**: Switch between different chat rooms and direct messages
- **Live Presence**: See who's online, away, busy, or offline
- **Real-time Features**: Typing indicators, message reactions, read receipts
- **File Sharing**: Upload and share files with progress tracking
- **Mobile Responsive**: Optimized layouts for different screen sizes

```tsx
<P2PChatContainer
  currentUser={currentUser}
  realtimeEndpoint="ws://localhost:8080/chat"
  config={{
    enableReactions: true,
    enableTypingIndicators: true,
    enableFileUploads: true,
  }}
/>
```

### 3. Dual Chat Experience

The "Dual View" tab demonstrates collaborative workflows:

- **Side-by-Side Chats**: AI assistant and team chat in one interface
- **Layout Options**: Switch between horizontal and vertical layouts
- **Collaborative AI**: Share AI-generated content with your team
- **Synchronized Themes**: Consistent design across both chat types

### 4. Feature Showcase

The "Features" tab provides interactive demonstrations:

- **Streaming Markdown**: Watch markdown parse in real-time
- **AI Thinking**: Visualize the AI's thought process
- **Tool Execution**: See tools run with progress tracking
- **User Presence**: Interactive presence management
- **Message Reactions**: Add and manage emoji reactions
- **File Sharing**: Complete file upload workflow

## Architecture

### Component Structure

```
src/
├── components/           # Demo-specific components
│   ├── Header.tsx       # App header with user controls
│   ├── Navigation.tsx   # Demo section navigation
│   ├── AssistantChatDemo.tsx
│   ├── P2PChatDemo.tsx
│   ├── DualChatDemo.tsx
│   └── FeatureShowcase.tsx
├── services/            # Mock backend services
│   └── mockBackend.ts   # Simulated AI and P2P services
├── styles/              # Demo-specific styles
│   └── app.css         # Main demo styles
└── App.tsx             # Main application component
```

### Technology Stack

- **SolidJS**: Reactive frontend framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Reynard Components**: Chat system components
- **CSS Custom Properties**: Theming and styling

### Mock Services

The demo includes sophisticated mock services that simulate real-world behavior:

#### AI Assistant Service

- **Streaming Responses**: Simulates token-by-token streaming
- **Thinking Sections**: Generates realistic AI reasoning
- **Tool Execution**: Mock implementations of common tools
- **Multiple Personalities**: Different response styles and capabilities

#### P2P Chat Service

- **WebSocket Simulation**: Real-time event handling
- **User Management**: Online/offline status tracking
- **Room Management**: Multiple chat rooms and direct messages
- **Message Features**: Reactions, read receipts, typing indicators

## Configuration

### Environment Variables

Create a `.env` file for customization:

```env
# API Endpoints (for real backend integration)
VITE_ASSISTANT_API=http://localhost:8000/api/assistant
VITE_P2P_API=http://localhost:8080/api/chat
VITE_WEBSOCKET_URL=ws://localhost:8080/chat

# Feature Flags
VITE_ENABLE_MOCK_BACKEND=true
VITE_ENABLE_REAL_STREAMING=false
VITE_ENABLE_TELEMETRY=false

# Demo Configuration
VITE_DEMO_USER_NAME="Demo User"
VITE_DEMO_INITIAL_ROOM="general"
```

### Theming

The demo supports both light and dark themes with CSS custom properties:

```css
:root {
  --color-primary: #3b82f6;
  --color-background: #ffffff;
  --text-primary: #1e293b;
  /* ... more theme variables */
}

[data-theme="dark"] {
  --color-background: #0f172a;
  --text-primary: #f1f5f9;
  /* ... dark theme overrides */
}
```

## Integration Examples

### Real Backend Integration

To connect to real services instead of mocks:

1. **Set up environment variables**

   ```env
   VITE_ENABLE_MOCK_BACKEND=false
   VITE_ASSISTANT_API=https://your-ai-api.com
   VITE_P2P_API=https://your-chat-api.com
   ```

2. **Update API endpoints**

   ```tsx
   <ChatContainer
     endpoint={import.meta.env.VITE_ASSISTANT_API}
     authHeaders={{
       Authorization: `Bearer ${authToken}`,
     }}
   />
   ```

3. **Configure WebSocket connection**

   ```tsx
   <P2PChatContainer
     realtimeEndpoint={import.meta.env.VITE_WEBSOCKET_URL}
     apiEndpoint={import.meta.env.VITE_P2P_API}
   />
   ```

### Custom Components

Extend the demo with your own components:

```tsx
import { ChatContainer, P2PChatContainer } from "@reynard/components";

function CustomChatApp() {
  return (
    <div className="my-chat-app">
      <ChatContainer
        endpoint="/api/my-assistant"
        config={{
          enableThinking: true,
          customTheme: "my-brand",
        }}
        customRenderer={(content, message) => {
          // Custom message rendering logic
          return <MyCustomMessage content={content} />;
        }}
      />
    </div>
  );
}
```

### Mobile Integration

The demo is fully responsive and works great on mobile:

```tsx
<P2PChatContainer
  ui={{
    compact: true, // Compact mode for mobile
    showUserList: false, // Hide user list on small screens
    showRoomList: true, // Keep room list for navigation
  }}
  config={{
    enableFileUploads: true, // Mobile file uploads work great
    maxFileSize: 5 * 1024 * 1024, // 5MB limit for mobile
  }}
/>
```

## Development

### Adding New Features

1. **Create a new demo component**

   ```tsx
   // src/components/NewFeatureDemo.tsx
   export function NewFeatureDemo() {
     return <div>Your new feature demo</div>;
   }
   ```

2. **Add to navigation**

   ```tsx
   // src/components/Navigation.tsx
   const navItems = [
     // ... existing items
     {
       id: "new-feature",
       label: "New Feature",
       icon: "🆕",
       description: "Description of your new feature",
     },
   ];
   ```

3. **Update main app**

   ```tsx
   // src/App.tsx
   <Show when={currentView() === "new-feature"}>
     <NewFeatureDemo />
   </Show>
   ```

### Testing

Run the demo with different configurations:

```bash
# Development mode with hot reload
npm run dev

# Production build testing
npm run build
npm run preview

# Test mobile responsive design
# Resize browser or use device emulation
```

### Debugging

Enable debug logging:

```tsx
<ChatContainer
  config={{
    debug: true, // Enable debug logging
  }}
  onError={(error) => {
    console.error("Chat error:", error);
  }}
  onMessageReceived={(message) => {
    console.log("Message:", message);
  }}
/>
```

## Deployment

### Static Hosting

Build and deploy to any static hosting service:

```bash
# Build for production
npm run build

# Deploy to Netlify, Vercel, etc.
# Upload the dist/ directory
```

### Docker

Use the included Dockerfile:

```bash
# Build container
docker build -t reynard-chat-demo .

# Run container
docker run -p 3001:3001 reynard-chat-demo
```

### Environment-Specific Builds

```bash
# Development build
npm run build:dev

# Staging build
npm run build:staging

# Production build
npm run build:prod
```

## Contributing

We welcome contributions to improve the demo:

1. **Fork the repository**
2. **Create a feature branch**
3. **Add your enhancements**
4. **Test thoroughly**
5. **Submit a pull request**

### Ideas for Contributions

- **New demo sections** showcasing additional features
- **Integration examples** with popular frameworks
- **Performance optimizations** and best practices
- **Accessibility improvements** and testing
- **Mobile-specific features** and optimizations
- **Internationalization** support and examples

## License

This demo is part of the Reynard project and follows the same license terms.

## Support

- **Documentation**: [Reynard Docs](https://reynard-docs.example.com)
- **GitHub Issues**: [Report bugs or request features](https://github.com/your-org/reynard/issues)
- **Discord**: [Join our community](https://discord.gg/reynard)
- **Email**: <support@reynard.example.com>

---

Built with ❤️ using Reynard Components
