# reynard-api-client

Auto-generated TypeScript API client for Reynard backend. This package provides type-safe access to all backend endpoints with SolidJS composables.

## Features

- **Auto-generated Types**: TypeScript types generated from FastAPI OpenAPI schema
- **Type-safe API Calls**: Full IntelliSense and compile-time validation
- **SolidJS Composables**: Reactive composables for common API patterns
- **Error Handling**: Comprehensive error handling with typed errors
- **Authentication**: Built-in support for JWT authentication

## Installation

```bash
pnpm add reynard-api-client
```

## Usage

### Basic Setup

```typescript
import { createReynardApiClient } from 'reynard-api-client';

const apiClient = createReynardApiClient({
  basePath: 'http://localhost:8000',
  authFetch: myAuthFetch // Optional authenticated fetch function
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

## Type Safety

This package provides complete type safety between your frontend and backend:

- ✅ Request/response types match exactly
- ✅ Compile-time validation of API calls
- ✅ IntelliSense for all endpoints
- ✅ Automatic updates when backend changes
