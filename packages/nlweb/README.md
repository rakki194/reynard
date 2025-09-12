# Reynard NLWeb

Intelligent assistant tooling and routing system for Reynard applications. Provides natural language query processing, tool suggestion, and context-aware routing.

## Features

- **Intelligent Tool Suggestion**: Analyzes natural language queries and suggests appropriate tools with parameters
- **Context-Aware Routing**: Considers current path, git status, selected items, and user preferences
- **Performance Monitoring**: Built-in caching, rate limiting, and performance statistics
- **Dynamic Tool Registry**: Register and unregister tools at runtime
- **Health Monitoring**: Comprehensive health checks and status reporting
- **Configuration Management**: Flexible configuration with hot-reloading
- **Emergency Rollback**: Quick rollback mechanism for production issues

## Installation

```bash
npm install reynard-nlweb
```

## Quick Start

### Basic Usage

```typescript
import {
  NLWebService,
  createDefaultNLWebConfiguration,
  SimpleEventEmitter,
} from "reynard-nlweb";

// Create configuration
const config = createDefaultNLWebConfiguration();

// Create event emitter
const eventEmitter = new SimpleEventEmitter();

// Create and initialize service
const nlwebService = new NLWebService(config, eventEmitter);
await nlwebService.initialize();

// Get tool suggestions
const response = await nlwebService.getRouter().suggest({
  query: {
    text: "list files in current directory",
    context: {
      currentPath: "/home/user/project",
      gitStatus: {
        isRepository: true,
        branch: "main",
        isDirty: false,
      },
    },
  },
});

console.log("Suggestions:", response.suggestions);
```

### Frontend Integration

```typescript
import { useNLWeb } from 'reynard-nlweb/composables';

function MyComponent() {
  const nlweb = useNLWeb({
    baseUrl: '/api/nlweb',
    defaultContext: {
      currentPath: '/home/user/project'
    }
  });

  const handleQuery = async (query: string) => {
    try {
      const suggestions = await nlweb.suggest(query);
      console.log('Tool suggestions:', suggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  return (
    <div>
      <button onClick={() => handleQuery('git status')}>
        Get Git Status
      </button>
      {nlweb.loading() && <div>Loading...</div>}
      {nlweb.error() && <div>Error: {nlweb.error()}</div>}
    </div>
  );
}
```

## API Reference

### NLWebService

Main service class that orchestrates the NLWeb system.

```typescript
class NLWebService {
  // Initialize the service
  async initialize(): Promise<void>;

  // Get the router instance
  getRouter(): NLWebRouter;

  // Get the tool registry
  getToolRegistry(): NLWebToolRegistry;

  // Get service configuration
  getConfiguration(): NLWebConfiguration;

  // Update service configuration
  async updateConfiguration(config: Partial<NLWebConfiguration>): Promise<void>;

  // Get service health status
  async getHealthStatus(): Promise<NLWebHealthStatus>;

  // Shutdown the service
  async shutdown(): Promise<void>;
}
```

### NLWebRouter

Intelligent tool suggestion and routing system.

```typescript
class NLWebRouter {
  // Initialize the router
  async initialize(): Promise<void>;

  // Get tool suggestions for a query
  async suggest(
    request: NLWebSuggestionRequest,
  ): Promise<NLWebSuggestionResponse>;

  // Get router health status
  async getHealthStatus(): Promise<NLWebHealthStatus>;

  // Get performance statistics
  getPerformanceStats(): NLWebPerformanceStats;

  // Force a health check
  async forceHealthCheck(): Promise<NLWebHealthStatus>;

  // Shutdown the router
  async shutdown(): Promise<void>;
}
```

### NLWebToolRegistry

Manages tool registration and discovery.

```typescript
class NLWebToolRegistry {
  // Register a new tool
  register(tool: NLWebTool): void;

  // Unregister a tool
  unregister(toolName: string): void;

  // Get all registered tools
  getAllTools(): NLWebTool[];

  // Get tools by category
  getToolsByCategory(category: string): NLWebTool[];

  // Get tools by tags
  getToolsByTags(tags: string[]): NLWebTool[];

  // Get a specific tool by name
  getTool(toolName: string): NLWebTool | undefined;

  // Check if a tool is registered
  hasTool(toolName: string): boolean;

  // Get tool statistics
  getStats(): ToolStats;
}
```

## Tool Definition

Tools are defined using the `NLWebTool` interface:

```typescript
interface NLWebTool {
  name: string; // Unique identifier
  description: string; // Human-readable description
  category: string; // Tool category
  tags: string[]; // Search tags
  path: string; // Execution endpoint
  method: "GET" | "POST" | "PUT" | "DELETE";
  parameters: NLWebToolParameter[]; // Tool parameters
  examples: string[]; // Example queries
  enabled: boolean; // Whether tool is enabled
  priority: number; // Selection priority (0-100)
  timeout: number; // Execution timeout (ms)
}
```

### Example Tool Definition

```typescript
const gitStatusTool: NLWebTool = {
  name: "git_status",
  description: "Check the status of a git repository",
  category: "git",
  tags: ["git", "status", "repository"],
  path: "/api/tools/git_status",
  method: "POST",
  parameters: [
    {
      name: "dataset_path",
      type: "string",
      description: "Directory path to inspect",
      required: true,
    },
  ],
  examples: ["git status", "check repository status", "what files are changed"],
  enabled: true,
  priority: 80,
  timeout: 5000,
};
```

## Configuration

The NLWeb system can be configured using the `NLWebConfiguration` interface:

```typescript
interface NLWebConfiguration {
  enabled: boolean; // Whether NLWeb is enabled
  configDir: string; // Configuration directory
  baseUrl?: string; // External NLWeb server URL
  cache: {
    ttl: number; // Cache TTL in seconds
    maxEntries: number; // Maximum cache entries
    allowStaleOnError: boolean; // Allow stale cache on errors
  };
  performance: {
    enabled: boolean; // Performance monitoring
    suggestionTimeout: number; // Suggestion timeout (ms)
    maxSuggestions: number; // Maximum suggestions
    minScore: number; // Minimum confidence score
  };
  rateLimit: {
    requestsPerMinute: number; // Rate limit
    windowSeconds: number; // Rate limit window
  };
  canary: {
    enabled: boolean; // Canary rollout
    percentage: number; // Canary percentage
  };
  rollback: {
    enabled: boolean; // Emergency rollback
    reason?: string; // Rollback reason
  };
}
```

## HTTP API

The NLWeb system provides REST API endpoints:

### Tool Suggestions

```http
POST /api/nlweb/suggest
Content-Type: application/json

{
  "query": "list files in current directory",
  "context": {
    "currentPath": "/home/user/project",
    "gitStatus": {
      "isRepository": true,
      "branch": "main",
      "isDirty": false
    }
  },
  "maxSuggestions": 3,
  "minScore": 30,
  "includeReasoning": true
}
```

### Health Status

```http
GET /api/nlweb/health
```

### Service Status

```http
GET /api/nlweb/status
```

### Tool Management

```http
# Get all tools
GET /api/nlweb/tools

# Get tools by category
GET /api/nlweb/tools?category=git

# Get tools by tags
GET /api/nlweb/tools?tags=git,status

# Register a tool
POST /api/nlweb/tools
Content-Type: application/json

{
  "name": "my_tool",
  "description": "My custom tool",
  "category": "custom",
  "tags": ["custom", "utility"],
  "path": "/api/my-tool",
  "method": "POST",
  "parameters": [],
  "examples": ["use my tool"],
  "enabled": true,
  "priority": 50,
  "timeout": 5000
}

# Unregister a tool
DELETE /api/nlweb/tools/my_tool
```

### Performance Monitoring

```http
GET /api/nlweb/performance
```

### Emergency Rollback

```http
POST /api/nlweb/rollback
Content-Type: application/json

{
  "enable": true,
  "reason": "Performance issues detected"
}
```

## Context-Aware Routing

The NLWeb system considers various context factors when suggesting tools:

### Current Path Context

```typescript
const context: NLWebContext = {
  currentPath: "/home/user/project",
  // ... other context
};
```

### Git Status Context

```typescript
const context: NLWebContext = {
  gitStatus: {
    isRepository: true,
    branch: "main",
    isDirty: true,
    modifiedFiles: ["src/app.ts"],
    stagedFiles: ["README.md"],
    untrackedFiles: ["new-file.txt"],
  },
};
```

### Selected Items Context

```typescript
const context: NLWebContext = {
  selectedItems: ["image1.jpg", "image2.jpg", "image3.jpg"],
};
```

### User Preferences Context

```typescript
const context: NLWebContext = {
  userPreferences: {
    preferredCategory: "ai",
    preferredGenerator: "jtp2",
  },
};
```

## Performance Monitoring

The NLWeb system provides comprehensive performance monitoring:

```typescript
const stats = nlwebService.getRouter().getPerformanceStats();
console.log("Performance Stats:", {
  totalRequests: stats.totalRequests,
  avgProcessingTime: stats.avgProcessingTime,
  p95ProcessingTime: stats.p95ProcessingTime,
  cacheHitRate: stats.cacheHitRate,
  cacheSize: stats.cacheSize,
});
```

## Error Handling

The NLWeb system provides comprehensive error handling:

```typescript
try {
  const suggestions = await nlwebService.getRouter().suggest(request);
  // Handle suggestions
} catch (error) {
  if (error.message.includes("timeout")) {
    // Handle timeout
  } else if (error.message.includes("cache")) {
    // Handle cache error
  } else {
    // Handle other errors
  }
}
```

## Best Practices

1. **Tool Naming**: Use descriptive, consistent names for tools
2. **Tagging**: Use relevant tags for better searchability
3. **Examples**: Provide diverse example queries for each tool
4. **Context**: Leverage context information for better suggestions
5. **Performance**: Monitor performance metrics and adjust configuration
6. **Error Handling**: Implement proper error handling and fallbacks
7. **Testing**: Test tool suggestions with various query types

## Troubleshooting Guide

### Common Issues

1. **No Suggestions**: Check if tools are registered and enabled
2. **Slow Performance**: Review cache configuration and performance stats
3. **Context Issues**: Verify context data is properly formatted
4. **Tool Registration**: Ensure tool definitions are valid

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
const config = createDefaultNLWebConfiguration();
config.performance.enabled = true; // Enable performance monitoring
```

## License

MIT License - see LICENSE file for details.
