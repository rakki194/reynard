# reynard-api-client

Auto-generated TypeScript API client for Reynard backend. This package provides type-safe access to
all backend endpoints with SolidJS composables and features an **evergreen automation system** that automatically keeps your client synchronized with backend changes.

## Features

- **🌲 Evergreen System**: Automatically synchronizes with backend changes
- **Auto-generated Types**: TypeScript types generated from FastAPI OpenAPI schema
- **Type-safe API Calls**: Full IntelliSense and compile-time validation
- **SolidJS Composables**: Reactive composables for common API patterns
- **Error Handling**: Comprehensive error handling with typed errors
- **Authentication**: Built-in support for JWT authentication
- **New Services**: Email, ECS World Simulation, and MCP Management

## Installation

```bash
pnpm add reynard-api-client
```

## 🌲 Evergreen System

The Reynard API Client features an **evergreen automation system** that automatically keeps your client synchronized with backend changes. This ensures your API client is always up-to-date with the latest endpoints, models, and features.

### Quick Start

#### Manual Update

```bash
# Update the API client to match the latest backend
pnpm run update
```

#### Watch Mode (Development)

```bash
# Automatically update when backend changes are detected
pnpm run evergreen:watch
```

#### One-time Evergreen Check

```bash
# Check and update if needed
pnpm run evergreen
```

### How It Works

1. **Change Detection**: Monitors the backend OpenAPI specification for changes
2. **Automatic Regeneration**: Fetches latest spec, regenerates types, and builds client
3. **Smart Caching**: Caches specifications to avoid unnecessary regeneration

### Available Scripts

| Script                     | Description                               |
| -------------------------- | ----------------------------------------- |
| `pnpm run evergreen`       | Check for changes and update if needed    |
| `pnpm run evergreen:watch` | Watch backend for changes and auto-update |
| `pnpm run update`          | Force update and build                    |
| `pnpm run generate`        | Regenerate from current OpenAPI spec      |
| `pnpm run generate:watch`  | Watch and regenerate on backend changes   |

## Usage

### Basic Setup

```typescript
import { createReynardApiClient } from "reynard-api-client";

const apiClient = createReynardApiClient({
  basePath: "http://localhost:8000",
  authFetch: myAuthFetch, // Optional authenticated fetch function
});
```

### RAG Search

```typescript
import { useRAG } from 'reynard-api-client';

function RAGSearch() {
  const rag = useRAG({
    apiClient,
    defaultModel: 'embeddinggemma:latest',
    maxResults: 10
  });

  const handleSearch = (query: string) => {
    rag.search(query);
  };

  return (
    <div>
      <input onInput={(e) => handleSearch(e.target.value)} />
      <For each={rag.results()}>
        {(result) => <div>{result.chunk_text}</div>}
      </For>
    </div>
  );
}
```

### Caption Generation

```typescript
import { useCaption } from 'reynard-api-client';

function CaptionGenerator() {
  const caption = useCaption({
    apiClient,
    defaultGenerator: 'florence2'
  });

  const generateCaption = async (imagePath: string) => {
    try {
      const result = await caption.generateCaption(imagePath);
      console.log('Generated caption:', result.caption);
    } catch (error) {
      console.error('Caption generation failed:', error);
    }
  };

  return (
    <div>
      <button onClick={() => generateCaption('/path/to/image.jpg')}>
        Generate Caption
      </button>
      {caption.isGenerating() && <div>Generating...</div>}
    </div>
  );
}
```

### Chat

```typescript
import { useChat } from 'reynard-api-client';

function ChatInterface() {
  const chat = useChat({
    apiClient,
    defaultModel: 'llama3.1'
  });

  const sendMessage = async (message: string) => {
    try {
      await chat.sendMessage(message);
    } catch (error) {
      console.error('Chat failed:', error);
    }
  };

  return (
    <div>
      <For each={chat.messages()}>
        {(message) => (
          <div class={message.role}>
            {message.content}
          </div>
        )}
      </For>
      <input
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            sendMessage(e.target.value);
            e.target.value = '';
          }
        }}
      />
    </div>
  );
}
```

### Authentication

```typescript
import { useAuth } from 'reynard-api-client';

function AuthComponent() {
  const auth = useAuth({ apiClient });

  const handleLogin = async (username: string, password: string) => {
    try {
      await auth.login({ username, password });
      console.log('Logged in as:', auth.user());
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {auth.isAuthenticated() ? (
        <div>Welcome, {auth.user()?.username}!</div>
      ) : (
        <button onClick={() => handleLogin('user', 'pass')}>
          Login
        </button>
      )}
    </div>
  );
}
```

### New Service Integrations

The evergreen system now supports your new ecosystem features:

#### 📧 Email Services

```typescript
import { createReynardApiClient } from "reynard-api-client";

const client = createReynardApiClient();

// Send emails
await client.email.sendSimpleEmail("user@example.com", "Test Subject", "Hello from Reynard!");

// Bulk email sending
await client.email.sendBulkEmail({
  to_emails: ["user1@example.com", "user2@example.com"],
  subject: "Bulk Email",
  body: "Bulk message content",
  batch_size: 10,
  delay_between_batches: 1000,
});

// Check email service status
const status = await client.email.getEmailStatus();
```

#### 🌍 ECS World Simulation

```typescript
// Get world status
const worldStatus = await client.ecs.getWorldStatus();

// Create agents
const agent = await client.ecs.createAgent({
  agent_id: "my-agent-123",
  spirit: "fox",
  style: "foundation",
});

// Move agents
await client.ecs.moveAgent("my-agent-123", { x: 100, y: 200 });

// Send chat messages between agents
await client.ecs.sendChatMessage("agent-1", {
  receiver_id: "agent-2",
  message: "Hello from the ECS world!",
  interaction_type: "communication",
});

// Get nearby agents
const nearby = await client.ecs.getNearbyAgents("my-agent-123", 150.0);
```

#### 🔧 MCP Management

```typescript
// Generate MCP tokens
const token = await client.mcp.generateToken({
  client_id: "my-mcp-client",
  additional_permissions: ["mcp:admin"],
});

// List MCP clients
const clients = await client.mcp.listClients();

// Get MCP statistics
const stats = await client.mcp.getStats();

// Validate tokens
const validation = await client.mcp.validateToken();
```

## API Reference

### Client Factory

- `createReynardApiClient(config?)` - Creates a configured API client

### Composables

- `useRAG(options)` - RAG search functionality
- `useCaption(options)` - Caption generation
- `useChat(options)` - Chat with LLM models
- `useAuth(options)` - Authentication management

### Generated Types

All backend Pydantic models are automatically generated as TypeScript interfaces:

- `RAGQueryRequest`, `RAGQueryResponse`
- `CaptionRequest`, `CaptionResponse`
- `OllamaChatRequest`, `OllamaChatResponse`
- `LoginRequest`, `RegisterRequest`, `User`
- And many more...

## Development

### Regenerating Types

```bash
# Generate types from running backend
pnpm run generate

# Watch for backend changes
pnpm run generate:watch
```

### Building

```bash
pnpm run build
```

## 🔄 Integration with Development Workflow

### Backend Development

When you add new endpoints to your backend:

1. **Start the evergreen watcher**:

   ```bash
   cd packages/api-client
   pnpm run evergreen:watch
   ```

2. **Develop your backend** - the watcher will automatically detect changes

3. **The client updates automatically** - no manual intervention needed

### CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Update API Client
  run: |
    cd packages/api-client
    pnpm run evergreen
    pnpm run build
    pnpm run typecheck
```

### Pre-commit Hooks

Ensure the client is always up-to-date:

```bash
# Add to your pre-commit hook
cd packages/api-client && pnpm run evergreen
```

## 🛠️ Configuration

### Environment Variables

```bash
# Backend URL (default: http://localhost:8000)
REYNARD_BACKEND_URL=http://localhost:8000

# OpenAPI spec URL (default: ${BACKEND_URL}/openapi.json)
REYNARD_OPENAPI_URL=http://localhost:8000/openapi.json
```

### Custom Configuration

The evergreen system can be customized by modifying `scripts/evergreen-update.js`:

- **Change detection logic**: Modify `hasSpecChanged()` method
- **Update triggers**: Customize what constitutes a "change"
- **Build process**: Modify `regenerateClient()` method
- **Caching strategy**: Adjust caching behavior

## 🚨 Troubleshooting

### Common Issues

**Backend not running**:

```text
❌ Failed to fetch OpenAPI specification: fetch failed
```

**Solution**: Ensure your backend is running on the configured URL

**Generation fails**:

```text
❌ Failed to regenerate API client: Command failed
```

**Solution**: Check that all dependencies are installed and the backend is accessible

**Type errors after update**:

```text
❌ TypeScript compilation failed
```

**Solution**: The generated types may have breaking changes - review and update your code

### Debug Mode

Enable verbose logging:

```bash
DEBUG=evergreen pnpm run evergreen
```

## Type Safety

This package provides complete type safety between your frontend and backend:

- ✅ Request/response types match exactly
- ✅ Compile-time validation of API calls
- ✅ IntelliSense for all endpoints
- ✅ Automatic updates when backend changes

## 🎯 Best Practices

### 1. **Regular Updates**

- Run `pnpm run evergreen` before major development sessions
- Use `pnpm run evergreen:watch` during active backend development
- Include evergreen checks in your CI/CD pipeline

### 2. **Version Management**

- The system automatically tracks backend versions
- Version information is available in `src/version.ts`
- Use version info for compatibility checks

### 3. **Error Handling**

- Always handle API errors gracefully in your applications
- The new services include proper error handling and loading states
- Use TypeScript types for compile-time safety

### 4. **Testing**

- Test your applications after evergreen updates
- The system maintains backward compatibility where possible
- Review generated types for breaking changes

## 🔮 Future Enhancements

The evergreen system is designed to be extensible:

- **Custom change detectors**: Add domain-specific change detection
- **Selective updates**: Update only specific services or endpoints
- **Rollback support**: Revert to previous client versions
- **Integration testing**: Automatic testing after updates
- **Notification system**: Alert when updates are available

---

_The evergreen system ensures your Reynard API client stays synchronized with your evolving backend, providing a seamless development experience and reducing manual maintenance overhead._
