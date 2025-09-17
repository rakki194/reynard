# reynard-tools

Development and runtime tools for Reynard applications with a comprehensive tool calling system, validation, and
execution management.

## Features

- **Tool Calling Framework**: BaseTool, ToolRegistry, and ToolExecutor
- **Development Tools**: File operations, system utilities, and debugging tools
- **Runtime Tools**: Performance monitoring, debugging, and profiling
- **AI Integration**: Tool calling for AI systems and NLWeb integration
- **Validation**: Comprehensive parameter validation and error handling
- **Security**: Permission-based tool execution and audit logging
- **Extensibility**: Decorator-based tool creation and plugin system

## Installation

```bash
npm install reynard-tools
```

## Quick Start

### Basic Tool Usage

```typescript
import { ToolRegistry, ToolExecutor, BaseTool, ToolDefinition, ParameterType } from "reynard-tools";

// Create a custom tool
class GreetTool extends BaseTool {
  constructor() {
    const definition: ToolDefinition = {
      name: "greet",
      description: "Greet a person",
      parameters: [
        {
          name: "name",
          type: ParameterType.STRING,
          description: "Name of the person to greet",
          required: true,
        },
        {
          name: "language",
          type: ParameterType.STRING,
          description: "Language for the greeting",
          required: false,
          default: "en",
          enum: ["en", "es", "fr", "de"],
        },
      ],
      category: "utility",
      tags: ["greeting", "hello"],
    };
    super(definition);
  }

  protected async executeImpl(parameters: Record<string, any>): Promise<any> {
    const { name, language = "en" } = parameters;

    const greetings = {
      en: `Hello, ${name}!`,
      es: `¡Hola, ${name}!`,
      fr: `Bonjour, ${name}!`,
      de: `Hallo, ${name}!`,
    };

    return {
      greeting: greetings[language as keyof typeof greetings],
      name,
      language,
    };
  }
}

// Register and use the tool
const registry = new ToolRegistry();
const executor = new ToolExecutor();

const greetTool = new GreetTool();
registry.registerTool(greetTool);
executor.addTool(greetTool);

// Execute the tool
const result = await executor.executeTool(
  "greet",
  {
    name: "Alice",
    language: "en",
  },
  {
    permissions: [],
    metadata: {},
  }
);

console.log(result.data.greeting); // "Hello, Alice!"
```

### Development Tools

```typescript
import { ReadFileTool, WriteFileTool, ListDirectoryTool } from "reynard-tools";

const registry = new ToolRegistry();
const executor = new ToolExecutor();

// Register development tools
registry.registerTool(new ReadFileTool());
registry.registerTool(new WriteFileTool());
registry.registerTool(new ListDirectoryTool());

// Read a file
const fileResult = await executor.executeTool(
  "read_file",
  {
    path: "/path/to/file.txt",
    encoding: "utf8",
  },
  {
    permissions: ["file.read"],
    metadata: {},
  }
);

// Write a file
const writeResult = await executor.executeTool(
  "write_file",
  {
    path: "/path/to/output.txt",
    content: "Hello, World!",
    createDirectories: true,
  },
  {
    permissions: ["file.write"],
    metadata: {},
  }
);

// List directory contents
const listResult = await executor.executeTool(
  "list_directory",
  {
    path: "/path/to/directory",
    recursive: true,
    includeHidden: false,
  },
  {
    permissions: ["file.read"],
    metadata: {},
  }
);
```

### Parallel Tool Execution

```typescript
// Execute multiple tools in parallel
const results = await executor.executeToolsParallel(
  [
    {
      toolName: "read_file",
      parameters: { path: "/file1.txt" },
    },
    {
      toolName: "read_file",
      parameters: { path: "/file2.txt" },
    },
    {
      toolName: "list_directory",
      parameters: { path: "/directory" },
    },
  ],
  {
    permissions: ["file.read"],
    metadata: {},
  }
);

console.log(
  "All tools completed:",
  results.every(r => r.success)
);
```

### Sequential Tool Execution

```typescript
// Execute tools sequentially (useful when output of one tool is input to another)
const results = await executor.executeToolsSequential(
  [
    {
      toolName: "list_directory",
      parameters: { path: "/source" },
    },
    {
      toolName: "read_file",
      parameters: { path: "/source/config.json" },
    },
    {
      toolName: "write_file",
      parameters: {
        path: "/destination/config.json",
        content: '{"processed": true}',
      },
    },
  ],
  {
    permissions: ["file.read", "file.write"],
    metadata: { continueOnFailure: false },
  }
);
```

### Tool Execution with Dependencies

```typescript
// Execute tools with dependency resolution
const results = await executor.executeToolsWithDependencies(
  [
    {
      toolName: "read_config",
      parameters: { path: "/config.json" },
    },
    {
      toolName: "process_data",
      parameters: { input: "data.txt" },
      dependsOn: ["read_config"],
    },
    {
      toolName: "write_output",
      parameters: { path: "/output.txt" },
      dependsOn: ["process_data"],
    },
  ],
  {
    permissions: ["file.read", "file.write"],
    metadata: {},
  }
);

// Results are returned as a Map with tool names as keys
console.log("Config:", results.get("read_config")?.data);
console.log("Processed:", results.get("process_data")?.data);
console.log("Output:", results.get("write_output")?.data);
```

## Tool Definition

### Parameter Types

```typescript
enum ParameterType {
  STRING = "string",
  INTEGER = "integer",
  NUMBER = "number",
  BOOLEAN = "boolean",
  ARRAY = "array",
  OBJECT = "object",
}
```

### Parameter Validation

```typescript
const definition: ToolDefinition = {
  name: "validate_example",
  description: "Example with various parameter validations",
  parameters: [
    {
      name: "username",
      type: ParameterType.STRING,
      description: "Username",
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: "^[a-zA-Z0-9_]+$",
    },
    {
      name: "age",
      type: ParameterType.INTEGER,
      description: "Age in years",
      required: true,
      minimum: 0,
      maximum: 150,
    },
    {
      name: "role",
      type: ParameterType.STRING,
      description: "User role",
      required: false,
      default: "user",
      enum: ["admin", "user", "guest"],
    },
    {
      name: "preferences",
      type: ParameterType.OBJECT,
      description: "User preferences",
      required: false,
      properties: {
        theme: {
          name: "theme",
          type: ParameterType.STRING,
          description: "UI theme",
          required: false,
          default: "light",
          enum: ["light", "dark"],
        },
        notifications: {
          name: "notifications",
          type: ParameterType.BOOLEAN,
          description: "Enable notifications",
          required: false,
          default: true,
        },
      },
    },
  ],
  category: "user",
  tags: ["validation", "user"],
};
```

## Security and Permissions

### Permission-Based Execution

```typescript
// Tools can require specific permissions
const definition: ToolDefinition = {
  name: "admin_tool",
  description: "Admin-only tool",
  parameters: [],
  category: "admin",
  tags: ["admin"],
  permissions: ["admin.access", "system.modify"],
};

// Execution context must include required permissions
const result = await executor.executeTool(
  "admin_tool",
  {},
  {
    permissions: ["admin.access", "system.modify", "user.read"],
    metadata: { userId: "admin123" },
  }
);
```

### Audit Logging

```typescript
// All tool executions are automatically logged
const history = executor.getExecutionHistory("admin_tool");
console.log("Execution history:", history);

// Get all execution history
const allHistory = executor.getAllExecutionHistory();
for (const [toolName, executions] of allHistory) {
  console.log(`${toolName}: ${executions.length} executions`);
}
```

## Error Handling

### Tool Errors

```typescript
try {
  const result = await executor.executeTool(
    "invalid_tool",
    {},
    {
      permissions: [],
      metadata: {},
    }
  );
} catch (error) {
  if (error.message.includes("not found")) {
    console.log("Tool not found");
  } else if (error.message.includes("Permission")) {
    console.log("Insufficient permissions");
  } else {
    console.log("Execution error:", error.message);
  }
}
```

### Retry and Timeout

```typescript
// Tools can specify retry and timeout behavior
const definition: ToolDefinition = {
  name: "network_tool",
  description: "Tool that makes network requests",
  parameters: [],
  category: "network",
  tags: ["network"],
  timeout: 10000, // 10 seconds
  retryCount: 3, // Retry up to 3 times
};

// Execution context can override defaults
const result = await executor.executeTool(
  "network_tool",
  {},
  {
    permissions: [],
    metadata: {},
    timeout: 5000, // Override to 5 seconds
    retryCount: 5, // Override to 5 retries
  }
);
```

## Tool Registry Management

### Registry Operations

```typescript
const registry = new ToolRegistry();

// Register tools
registry.registerTool(new GreetTool());
registry.registerTool(new ReadFileTool());

// Get tools by category
const devTools = registry.getToolsByCategory("development");

// Get tools by tag
const fileTools = registry.getToolsByTag("file");

// Search tools
const searchResults = registry.searchTools("file");

// Get registry statistics
const stats = registry.getStats();
console.log("Total tools:", stats.totalTools);
console.log("Total calls:", stats.totalCalls);
console.log("Error rate:", stats.errorRate);
```

### Tool Discovery

```typescript
// Get all available tools
const allTools = registry.getAllTools();

// Get tools as JSON schema for AI integration
const toolsSchema = registry.getToolsAsJSONSchema();

// Check if tool exists
if (registry.hasTool("greet")) {
  console.log("Greet tool is available");
}
```

## Best Practices

### 1. Tool Design

```typescript
// Good: Clear, focused tool with proper validation
class GoodTool extends BaseTool {
  constructor() {
    const definition: ToolDefinition = {
      name: "calculate_total",
      description: "Calculate total from array of numbers",
      parameters: [
        {
          name: "numbers",
          type: ParameterType.ARRAY,
          description: "Array of numbers to sum",
          required: true,
          items: {
            name: "number",
            type: ParameterType.NUMBER,
            description: "A number",
            required: true,
          },
        },
      ],
      category: "math",
      tags: ["calculation", "sum"],
    };
    super(definition);
  }

  protected async executeImpl(parameters: Record<string, any>): Promise<any> {
    const { numbers } = parameters;
    const total = numbers.reduce((sum: number, num: number) => sum + num, 0);
    return { total, count: numbers.length };
  }
}
```

### 2. Error Handling

```typescript
// Good: Proper error handling in tool implementation
protected async executeImpl(parameters: Record<string, any>): Promise<any> {
  try {
    const { path } = parameters;

    // Validate file exists
    if (!await this.fileExists(path)) {
      throw new Error(`File not found: ${path}`);
    }

    // Perform operation
    return await this.performOperation(path);
  } catch (error) {
    // Log error for debugging
    console.error(`Tool execution failed:`, error);
    throw error;
  }
}
```

### 3. Performance Considerations

```typescript
// Good: Use parallel execution for independent operations
const results = await executor.executeToolsParallel(
  [
    { toolName: "tool1", parameters: {} },
    { toolName: "tool2", parameters: {} },
    { toolName: "tool3", parameters: {} },
  ],
  context
);

// Good: Use sequential execution for dependent operations
const results = await executor.executeToolsSequential(
  [
    { toolName: "read_data", parameters: {} },
    { toolName: "process_data", parameters: {} },
    { toolName: "write_result", parameters: {} },
  ],
  context
);
```

### 4. Security

```typescript
// Good: Always check permissions
const definition: ToolDefinition = {
  name: 'sensitive_operation',
  description: 'Operation requiring special permissions',
  parameters: [],
  category: 'security',
  tags: ['sensitive'],
  permissions: ['admin.access', 'sensitive.operation'],
};

// Good: Validate user context
protected async executeImpl(parameters: Record<string, any>, context: ToolExecutionContext): Promise<any> {
  // Additional security checks
  if (!context.userId) {
    throw new Error('User ID is required');
  }

  if (!context.metadata.allowedOperations?.includes('sensitive_operation')) {
    throw new Error('Operation not allowed for this user');
  }

  // Perform operation
  return await this.performSensitiveOperation(parameters, context);
}
```

## API Reference

### BaseTool

Abstract base class for all tools.

- `name`: Tool name
- `description`: Tool description
- `category`: Tool category
- `tags`: Tool tags
- `parameters`: Tool parameters
- `permissions`: Required permissions
- `timeout`: Execution timeout
- `retryCount`: Retry count
- `metrics`: Tool execution metrics
- `execute(parameters, context)`: Execute the tool
- `toJSONSchema()`: Get tool as JSON schema

### ToolRegistry

Central registry for managing tools.

- `registerTool(tool)`: Register a tool
- `unregisterTool(name)`: Unregister a tool
- `getTool(name)`: Get tool by name
- `getAllTools()`: Get all tools
- `getToolsByCategory(category)`: Get tools by category
- `getToolsByTag(tag)`: Get tools by tag
- `searchTools(query)`: Search tools
- `executeTool(name, parameters, context)`: Execute tool
- `getStats()`: Get registry statistics

### ToolExecutor

Advanced tool executor with retry, timeout, and parallel execution.

- `addTool(tool)`: Add tool to executor
- `removeTool(name)`: Remove tool from executor
- `executeTool(name, parameters, context)`: Execute single tool
- `executeToolsParallel(executions, context)`: Execute tools in parallel
- `executeToolsSequential(executions, context)`: Execute tools sequentially
- `executeToolsWithDependencies(executions, context)`: Execute with dependencies
- `getExecutionHistory(name)`: Get execution history
- `getActiveExecutionsCount()`: Get active executions count

## Troubleshooting

### Common Issues

1. **Tool not found**: Ensure tool is registered before execution
2. **Permission denied**: Check user permissions match tool requirements
3. **Parameter validation failed**: Verify parameter types and constraints
4. **Timeout errors**: Increase timeout or optimize tool performance
5. **Circular dependencies**: Check tool dependency chains

### Debug Mode

```typescript
// Enable debug logging
const executor = new ToolExecutor();
executor.addTool(new MyTool());

// Check execution history
const history = executor.getExecutionHistory("my_tool");
console.log("Execution history:", history);

// Monitor active executions
console.log("Active executions:", executor.getActiveExecutionsCount());
```
