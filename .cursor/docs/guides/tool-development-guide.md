# Tool Development Guide for Reynard MCP Server

🦊 _whiskers twitch with cunning_ This comprehensive guide will teach you how to create, implement, and integrate tools for the Reynard MCP (Model Context Protocol) server. No more babysitting - this guide will make you a tool development predator!

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tool Development Patterns](#tool-development-patterns)
3. [MCP Tool Implementation](#mcp-tool-implementation)
4. [Reynard Package Tools](#reynard-package-tools)
5. [Testing and Validation](#testing-and-validation)
6. [Best Practices](#best-practices)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

## Architecture Overview

The Reynard MCP server follows a modular architecture with clear separation of concerns:

```
scripts/mcp/
├── main.py                 # Server entry point
├── protocol/               # MCP protocol handling
│   ├── mcp_handler.py     # Main protocol handler
│   ├── tool_router.py     # Tool routing logic
│   ├── tool_registry.py   # Tool registration system
│   └── tool_config.py     # Tool configuration
├── tools/                  # Tool implementations
│   ├── *_tools.py         # Tool handler classes
│   └── *_definitions.py   # Tool schema definitions
├── services/               # Business logic services
└── utils/                  # Utility functions
```

### Key Components

- **Tool Handlers**: Classes that implement the actual tool functionality
- **Tool Definitions**: JSON schemas that define tool parameters and behavior
- **Tool Registry**: Centralized system for routing tool calls
- **Services**: Reusable business logic components
- **Protocol Layer**: MCP protocol implementation

## Tool Development Patterns

### 1. MCP Tool Structure

Every MCP tool follows this pattern:

```python
class MyToolHandler:
    """Handles my tool operations."""

    def __init__(self):
        self.service = MyService()

    def my_tool_method(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """Tool method that does something useful."""
        # Implementation here
        result = self.service.do_something(arguments)
        return self._format_result(result, "My Tool Operation")

    def _format_result(self, result: dict[str, Any], operation: str) -> dict[str, Any]:
        """Format tool result for MCP response."""
        # Formatting logic here
        return {"content": [{"type": "text", "text": formatted_output}]}
```

### 2. Tool Definition Schema

Every tool needs a definition in a `*_definitions.py` file:

```python
def get_my_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get my tool definitions."""
    return {
        "my_tool": {
            "name": "my_tool",
            "description": "Description of what this tool does",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "param1": {
                        "type": "string",
                        "description": "Description of parameter 1",
                        "required": True
                    },
                    "param2": {
                        "type": "integer",
                        "description": "Description of parameter 2",
                        "default": 42
                    }
                },
                "required": ["param1"]
            }
        }
    }
```

### 3. Service Layer Pattern

Business logic should be in services, not in tool handlers:

```python
class MyService:
    """Service for my tool functionality."""

    def do_something(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Core business logic."""
        try:
            # Implementation here
            return {
                "success": True,
                "data": result_data,
                "summary": "Operation completed successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
```

## MCP Tool Implementation

### Step 1: Create the Tool Handler

Create a new file `scripts/mcp/tools/my_tools.py`:

```python
#!/usr/bin/env python3
"""
My Tool Handlers
================

Handles my tool operations.
Follows the 100-line axiom and modular architecture principles.
"""

from typing import Any
from services.my_service import MyService

class MyTools:
    """Handles my tool operations."""

    def __init__(self):
        self.service = MyService()

    def my_tool(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """My tool that does something useful."""
        result = self.service.do_something(arguments)
        return self._format_result(result, "My Tool")

    def _format_result(self, result: dict[str, Any], operation: str) -> dict[str, Any]:
        """Format tool result for MCP response."""
        if result.get("success", False):
            status = "✅ SUCCESS"
        else:
            status = "❌ FAILED"

        output_lines = [f"{status} - {operation}"]

        # Show actual result data
        if result.get("success", False):
            result_data = {k: v for k, v in result.items() if k not in ["success", "stdout", "stderr", "summary"]}
            if result_data:
                import json
                output_lines.append(f"\n📋 Results:\n{json.dumps(result_data, indent=2)}")
        elif result.get("error"):
            output_lines.append(f"\n❌ Error: {result['error']}")

        return {"content": [{"type": "text", "text": "\n".join(output_lines)}]}
```

### Step 2: Create the Tool Definition

Create `scripts/mcp/tools/my_definitions.py`:

```python
#!/usr/bin/env python3
"""
My Tool Definitions
===================

Defines my tool schemas.
Follows the 100-line axiom and modular architecture principles.
"""

from typing import Any

def get_my_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get my tool definitions."""
    return {
        "my_tool": {
            "name": "my_tool",
            "description": "My tool that does something useful",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "param1": {
                        "type": "string",
                        "description": "First parameter",
                    },
                    "param2": {
                        "type": "integer",
                        "description": "Second parameter",
                        "default": 42,
                    },
                },
                "required": ["param1"],
            },
        },
    }
```

### Step 3: Create the Service

Create `scripts/mcp/services/my_service.py`:

```python
#!/usr/bin/env python3
"""
My Service
==========

Service for my tool functionality.
Follows the 100-line axiom and modular architecture principles.
"""

import logging
from typing import Any

logger = logging.getLogger(__name__)

class MyService:
    """Service for my tool functionality."""

    def do_something(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Core business logic."""
        try:
            param1 = arguments.get("param1")
            param2 = arguments.get("param2", 42)

            # Your implementation here
            result = f"Processed {param1} with {param2}"

            return {
                "success": True,
                "result": result,
                "param1": param1,
                "param2": param2,
                "summary": f"Successfully processed {param1}",
            }
        except Exception as e:
            logger.exception("Error in my service")
            return {
                "success": False,
                "error": str(e),
            }
```

### Step 4: Register the Tool

Add your tool to the configuration:

1. **Add to tool config** (`scripts/mcp/protocol/tool_config.py`):

```python
MY_TOOLS: Set[str] = {
    "my_tool",
}
```

2. **Add execution type**:

```python
TOOL_EXECUTION_TYPES: Dict[str, ToolExecutionType] = {
    # ... existing tools ...
    **dict.fromkeys(MY_TOOLS, ToolExecutionType.SYNC),  # or ASYNC
}
```

3. **Add to main definitions** (`scripts/mcp/tools/definitions.py`):

```python
from .my_definitions import get_my_tool_definitions

def get_tool_definitions() -> dict[str, dict[str, Any]]:
    # ... existing code ...
    my_tools = get_my_tool_definitions()

    return {
        # ... existing tools ...
        **my_tools,
    }
```

4. **Add to main server** (`scripts/mcp/main.py`):

```python
from tools.my_tools import MyTools

class MCPServer:
    def __init__(self) -> None:
        # ... existing code ...
        self.my_tools = MyTools()

        self.mcp_handler = MCPHandler(
            # ... existing handlers ...
            self.my_tools,
        )
```

5. **Add to tool router** (`scripts/mcp/protocol/tool_router.py`):

```python
from tools.my_tools import MyTools

class ToolRouter:
    def __init__(self, ...):
        # ... existing code ...
        self.my_tools = my_tools

        # Register in _register_all_tools
        self._register_tool_category(MY_TOOLS, "my_tools")

    def _get_generic_handler(self, category: str) -> Any:
        tool_service_map = {
            # ... existing mappings ...
            "my_tools": self.my_tools,
        }
        return tool_service_map.get(category)
```

## Reynard Package Tools

For Reynard package tools (TypeScript/JavaScript), follow this pattern:

### 1. Base Tool Class

```typescript
// packages/tools/src/core/BaseTool.ts
import { ToolDefinition, ToolResult, ToolExecutionContext } from "./types";

export abstract class BaseTool {
  protected definition: ToolDefinition;

  constructor(definition: ToolDefinition) {
    this.definition = definition;
  }

  abstract execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult>;

  getDefinition(): ToolDefinition {
    return this.definition;
  }
}
```

### 2. Tool Implementation

```typescript
// packages/tools/src/development/MyTool.ts
import { BaseTool } from "../core/BaseTool";
import { ToolDefinition, ToolResult, ToolExecutionContext } from "../core/types";

export class MyTool extends BaseTool {
  constructor() {
    const definition: ToolDefinition = {
      name: "my_tool",
      description: "My tool that does something useful",
      parameters: [
        {
          name: "param1",
          type: "string",
          description: "First parameter",
          required: true,
        },
        {
          name: "param2",
          type: "number",
          description: "Second parameter",
          required: false,
          default: 42,
        },
      ],
      category: "development",
      tags: ["my", "tool"],
      permissions: ["read"],
    };

    super(definition);
  }

  async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult> {
    const { param1, param2 = 42 } = parameters;

    try {
      // Your implementation here
      const result = `Processed ${param1} with ${param2}`;

      return {
        success: true,
        data: {
          result,
          param1,
          param2,
        },
        summary: `Successfully processed ${param1}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
```

### 3. Tool Types

```typescript
// packages/tools/src/core/types.ts
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
  category: string;
  tags: string[];
  permissions: string[];
}

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  required: boolean;
  default?: any;
  enum?: any[];
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  summary?: string;
}

export interface ToolExecutionContext {
  userId?: string;
  permissions: string[];
  metadata?: Record<string, any>;
}
```

## Testing and Validation

### 1. Unit Tests

Create tests for your tools:

```python
# scripts/mcp/tests/unit/test_my_tools.py
import pytest
from tools.my_tools import MyTools

class TestMyTools:
    def test_my_tool_success(self):
        tools = MyTools()
        result = tools.my_tool("my_tool", {"param1": "test", "param2": 42})

        assert "SUCCESS" in result["content"][0]["text"]
        assert "test" in result["content"][0]["text"]

    def test_my_tool_failure(self):
        tools = MyTools()
        result = tools.my_tool("my_tool", {"param1": ""})

        assert "FAILED" in result["content"][0]["text"]
```

### 2. Integration Tests

```python
# scripts/mcp/tests/integration/test_my_tools_integration.py
import pytest
from protocol.mcp_handler import MCPHandler
from tools.my_tools import MyTools

class TestMyToolsIntegration:
    def test_tool_call_through_handler(self):
        tools = MyTools()
        handler = MCPHandler(tools)

        result = await handler.handle_tool_call("my_tool", {"param1": "test"})

        assert result["jsonrpc"] == "2.0"
        assert "result" in result
```

## Best Practices

### 1. Follow the 140-Line Axiom

Keep your tool files under 140 lines. If they get longer, split them:

```python
# Good: Split into multiple focused files
tools/
├── my_tools.py           # Main tool handler (under 140 lines)
├── my_definitions.py     # Tool definitions (under 140 lines)
└── my_service.py         # Business logic (under 140 lines)
```

### 2. Use Services for Business Logic

Don't put business logic in tool handlers:

```python
# Bad: Business logic in tool handler
class MyTools:
    def my_tool(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        # Don't do this - business logic in tool handler
        result = complex_business_logic(arguments)
        return result

# Good: Business logic in service
class MyTools:
    def __init__(self):
        self.service = MyService()

    def my_tool(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        result = self.service.do_something(arguments)
        return self._format_result(result, "My Tool")
```

### 3. Consistent Error Handling

Always return structured results:

```python
def _format_result(self, result: dict[str, Any], operation: str) -> dict[str, Any]:
    """Format tool result for MCP response."""
    if result.get("success", False):
        status = "✅ SUCCESS"
    else:
        status = "❌ FAILED"

    output_lines = [f"{status} - {operation}"]

    # Show actual result data
    if result.get("success", False):
        result_data = {k: v for k, v in result.items() if k not in ["success", "stdout", "stderr", "summary"]}
        if result_data:
            import json
            output_lines.append(f"\n📋 Results:\n{json.dumps(result_data, indent=2)}")
    elif result.get("error"):
        output_lines.append(f"\n❌ Error: {result['error']}")

    return {"content": [{"type": "text", "text": "\n".join(output_lines)}]}
```

### 4. Proper Method Signatures

Always use the correct method signature for MCP tools:

```python
# Correct signature for MCP tools
def my_tool(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    """Tool method with correct signature."""
    pass

# For async tools
async def my_async_tool(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    """Async tool method with correct signature."""
    pass
```

### 5. Comprehensive Documentation

Document your tools thoroughly:

```python
def my_tool(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    """
    My tool that does something useful.

    Args:
        tool_name: Name of the tool being called
        arguments: Dictionary of tool arguments

    Returns:
        Dictionary with MCP-formatted response

    Raises:
        ValueError: If required arguments are missing
    """
    pass
```

## Common Patterns

### 1. File Operations

```python
class FileTools:
    def read_file(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """Read file contents."""
        path = arguments.get("path")
        encoding = arguments.get("encoding", "utf-8")

        try:
            with open(path, "r", encoding=encoding) as f:
                content = f.read()

            return {
                "success": True,
                "content": content,
                "path": path,
                "encoding": encoding,
                "size": len(content),
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }
```

### 2. API Calls

```python
import requests

class ApiTools:
    def call_api(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """Make API call."""
        url = arguments.get("url")
        method = arguments.get("method", "GET")
        headers = arguments.get("headers", {})
        data = arguments.get("data")

        try:
            response = requests.request(method, url, headers=headers, json=data)
            response.raise_for_status()

            return {
                "success": True,
                "status_code": response.status_code,
                "data": response.json(),
                "headers": dict(response.headers),
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }
```

### 3. System Commands

```python
import subprocess

class SystemTools:
    def run_command(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """Run system command."""
        command = arguments.get("command")
        timeout = arguments.get("timeout", 30)

        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout
            )

            return {
                "success": result.returncode == 0,
                "returncode": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": f"Command timed out after {timeout} seconds",
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }
```

## Troubleshooting

### Common Issues

1. **Method Signature Mismatch**

   ```
   Error: MyTool.my_method() takes 2 positional arguments but 3 were given
   ```

   **Solution**: Use the correct signature `(tool_name: str, arguments: dict[str, Any])`

2. **Tool Not Found**

   ```
   Error: Unknown tool: my_tool
   ```

   **Solution**: Make sure you've registered the tool in all required places:
   - `tool_config.py`
   - `definitions.py`
   - `main.py`
   - `tool_router.py`

3. **Import Errors**

   ```
   Error: Cannot find implementation for module named "services.my_service"
   ```

   **Solution**: Check your import paths and make sure the service file exists

4. **Async/Sync Mismatch**
   ```
   Error: Expected async function but got sync
   ```
   **Solution**: Check your `TOOL_EXECUTION_TYPES` configuration

### Debugging Tips

1. **Enable Debug Logging**

   ```python
   import logging
   logging.basicConfig(level=logging.DEBUG)
   ```

2. **Test Individual Components**

   ```python
   # Test service directly
   service = MyService()
   result = service.do_something({"param1": "test"})
   print(result)

   # Test tool handler
   tools = MyTools()
   result = tools.my_tool("my_tool", {"param1": "test"})
   print(result)
   ```

3. **Check Tool Registration**
   ```python
   # In tool_router.py, add debug logging
   def _register_all_tools(self) -> None:
       print(f"Registering tools: {MY_TOOLS}")
       # ... rest of registration
   ```

## Conclusion

🐺 _howls with predatory satisfaction_ You now have everything you need to create powerful tools for the Reynard MCP server! This guide covers both MCP tools and Reynard package tools, with comprehensive examples and best practices.

Remember:

- Follow the 140-line axiom
- Use services for business logic
- Implement proper error handling
- Test thoroughly
- Document everything

_pack coordination complete_ Now go forth and create tools that will make the next neuron's life easier! 🦊🦦🐺

---

**Created by Commander-Keeper-56** - Your wolf specialist for tool development excellence!
