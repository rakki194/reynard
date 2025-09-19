# MCP Tool Development Guide

## Overview

This guide provides comprehensive instructions for developing MCP (Model Context Protocol) tools, based on the Reynard MCP server architecture and best practices discovered through real-world development.

## Architecture Overview

### Modular Design Principles

The Reynard MCP server follows a modular architecture with clear separation of concerns:

```
services/mcp-server/
├── main.py                 # Server entry point
├── tools/                  # Tool implementations
│   ├── __init__.py        # Lazy imports
│   ├── definitions.py     # Tool schema aggregation
│   ├── secrets_tools.py   # Tool implementation
│   └── secrets_definitions.py  # Tool schemas
├── protocol/              # MCP protocol handling
├── middleware/            # Authentication & middleware
└── tool_config.json      # Tool configuration
```

### Key Components

1. **Tool Definitions**: JSON schemas defining tool interfaces
2. **Tool Implementations**: Python classes implementing tool logic
3. **Tool Registry**: Central registry for tool management
4. **Protocol Handler**: MCP protocol request/response handling
5. **Configuration**: Tool enablement and settings

## Development Workflow

### 1. Create Tool Definitions

Start by defining the tool schema in a dedicated definitions file:

```python
# tools/your_tool_definitions.py
from typing import Any

def get_your_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get your tool definitions."""
    return {
        "your_tool_name": {
            "name": "your_tool_name",
            "description": "Clear description of what the tool does",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "parameter_name": {
                        "type": "string",
                        "description": "Parameter description",
                        "enum": ["value1", "value2"]  # Optional
                    },
                    "optional_param": {
                        "type": "boolean",
                        "description": "Optional parameter",
                        "default": True
                    }
                },
                "required": ["parameter_name"]
            }
        }
    }
```

### 2. Implement Tool Logic

Create the tool implementation class:

```python
# tools/your_tool_implementation.py
import logging
from typing import Any

logger = logging.getLogger(__name__)

class YourToolClass:
    """Handles your tool operations."""

    def __init__(self) -> None:
        """Initialize the tool."""
        # Setup any required resources
        pass

    def your_tool_method(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Implement your tool logic."""
        try:
            # Extract parameters
            param = arguments.get("parameter_name")
            optional = arguments.get("optional_param", True)

            # Validate inputs
            if not param:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "Error: parameter_name is required"
                        }
                    ]
                }

            # Implement tool logic
            result = self._process_request(param, optional)

            # Return MCP-compatible response
            return {
                "content": [
                    {
                        "type": "text",
                        "text": result
                    }
                ]
            }

        except Exception as e:
            logger.error(f"Error in your_tool_method: {e}")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error: {str(e)}"
                    }
                ]
            }

    def _process_request(self, param: str, optional: bool) -> str:
        """Internal method to process the request."""
        # Your implementation here
        return f"Processed {param} with optional={optional}"
```

### 3. Add Lazy Import

Update the tools `__init__.py` to include your tool:

```python
# tools/__init__.py
def get_your_tool_class():
    """Lazy import for your tool."""
    from .your_tool_implementation import YourToolClass
    return YourToolClass

__all__ = [
    # ... existing imports ...
    "get_your_tool_class",
]
```

### 4. Register Tool Definitions

Add your tool definitions to the main definitions file:

```python
# tools/definitions.py
from .your_tool_definitions import get_your_tool_definitions

def get_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get all MCP tool definitions."""
    # ... existing tool definitions ...
    your_tools = get_your_tool_definitions()

    return {
        # ... existing tools ...
        **your_tools,
    }
```

### 5. Register Tool Implementation

Add your tool to the main server:

```python
# main.py
from tools import (
    # ... existing imports ...
    get_your_tool_class,
)

class MCPServer:
    def __init__(self) -> None:
        # ... existing initialization ...
        self.your_tool = get_your_tool_class()()

    def _register_all_tools(self) -> None:
        # ... existing tool registrations ...

        # Register your tool
        self.tool_registry.register_tool(
            "your_tool_name",
            self.your_tool.your_tool_method,
            ToolExecutionType.SYNC,  # or ASYNC
            "your_category",
        )
```

### 6. Configure Tool

Add your tool to the configuration:

```json
// tool_config.json
{
  "tools": {
    "your_tool_name": {
      "name": "your_tool_name",
      "category": "your_category",
      "enabled": true,
      "description": "Your tool description",
      "dependencies": [],
      "config": {}
    }
  }
}
```

## Best Practices

### 1. Schema Design

#### Use Descriptive Names

```python
# ✅ Good
"get_user_secret"
"validate_github_token"
"list_available_secrets"

# ❌ Bad
"get_secret"
"validate"
"list"
```

#### Provide Clear Descriptions

```python
# ✅ Good
"description": "Retrieve a user secret by name (e.g., GH_TOKEN for GitHub operations)"

# ❌ Bad
"description": "Gets secret"
```

#### Use Appropriate Parameter Types

```python
# ✅ Good - specific enum values
"secret_name": {
    "type": "string",
    "enum": ["GH_TOKEN", "API_KEY"]
}

# ✅ Good - boolean with default
"mask_output": {
    "type": "boolean",
    "default": True
}

# ✅ Good - optional string
"directory": {
    "type": "string",
    "default": null
}
```

### 2. Error Handling

#### Comprehensive Error Handling

```python
def your_tool_method(self, arguments: dict[str, Any]) -> dict[str, Any]:
    try:
        # Tool logic here
        result = self._process_request(arguments)
        return {
            "content": [
                {
                    "type": "text",
                    "text": result
                }
            ]
        }
    except ValueError as e:
        # Handle validation errors
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Validation error: {str(e)}"
                }
            ]
        }
    except Exception as e:
        # Handle unexpected errors
        logger.error(f"Unexpected error in {self.__class__.__name__}: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Internal error: {str(e)}"
                }
            ]
        }
```

#### Input Validation

```python
def _validate_inputs(self, arguments: dict[str, Any]) -> tuple[bool, str]:
    """Validate tool inputs."""
    required_params = ["param1", "param2"]

    for param in required_params:
        if param not in arguments:
            return False, f"Missing required parameter: {param}"

        if not arguments[param]:
            return False, f"Parameter {param} cannot be empty"

    return True, ""
```

### 3. Logging and Monitoring

#### Structured Logging

```python
import logging

logger = logging.getLogger(__name__)

class YourToolClass:
    def your_tool_method(self, arguments: dict[str, Any]) -> dict[str, Any]:
        logger.info(f"Starting {self.__class__.__name__}.your_tool_method")

        try:
            # Tool logic
            result = self._process_request(arguments)
            logger.info(f"Tool completed successfully")
            return result
        except Exception as e:
            logger.error(f"Tool failed: {e}", exc_info=True)
            raise
```

#### Performance Monitoring

```python
import time
from functools import wraps

def monitor_performance(func):
    """Decorator to monitor tool performance."""
    @wraps(func)
    def wrapper(self, arguments: dict[str, Any]) -> dict[str, Any]:
        start_time = time.time()
        try:
            result = func(self, arguments)
            duration = time.time() - start_time
            logger.info(f"{func.__name__} completed in {duration:.2f}s")
            return result
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"{func.__name__} failed after {duration:.2f}s: {e}")
            raise
    return wrapper

@monitor_performance
def your_tool_method(self, arguments: dict[str, Any]) -> dict[str, Any]:
    # Tool implementation
    pass
```

### 4. Testing

#### Unit Testing

```python
import unittest
from unittest.mock import patch, MagicMock

class TestYourTool(unittest.TestCase):
    def setUp(self):
        self.tool = YourToolClass()

    def test_successful_execution(self):
        """Test successful tool execution."""
        arguments = {
            "parameter_name": "test_value",
            "optional_param": True
        }

        result = self.tool.your_tool_method(arguments)

        self.assertIn("content", result)
        self.assertEqual(len(result["content"]), 1)
        self.assertEqual(result["content"][0]["type"], "text")

    def test_missing_parameter(self):
        """Test handling of missing parameters."""
        arguments = {}

        result = self.tool.your_tool_method(arguments)

        self.assertIn("Error", result["content"][0]["text"])

    @patch('your_tool_module.external_dependency')
    def test_external_dependency_failure(self, mock_dependency):
        """Test handling of external dependency failures."""
        mock_dependency.side_effect = Exception("External service unavailable")

        arguments = {"parameter_name": "test"}
        result = self.tool.your_tool_method(arguments)

        self.assertIn("Error", result["content"][0]["text"])
```

#### Integration Testing

```python
import asyncio
from main import MCPServer

async def test_tool_integration():
    """Test tool integration with MCP server."""
    server = MCPServer()

    # Test tools/list
    request = {
        'method': 'tools/list',
        'params': {},
        'id': 1
    }
    response = await server.handle_request(request)

    tool_names = [tool['name'] for tool in response['result']['tools']]
    assert 'your_tool_name' in tool_names

    # Test tool call
    request = {
        'method': 'tools/call',
        'params': {
            'name': 'your_tool_name',
            'arguments': {'parameter_name': 'test'}
        },
        'id': 2
    }
    response = await server.handle_request(request)

    assert 'result' in response
    assert 'content' in response['result']

# Run integration test
asyncio.run(test_tool_integration())
```

## Advanced Patterns

### 1. Async Tools

For tools that perform I/O operations:

```python
import asyncio
from typing import Any

class AsyncToolClass:
    async def async_tool_method(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Async tool implementation."""
        try:
            # Async operations
            result = await self._async_process_request(arguments)

            return {
                "content": [
                    {
                        "type": "text",
                        "text": result
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error: {str(e)}"
                    }
                ]
            }

    async def _async_process_request(self, arguments: dict[str, Any]) -> str:
        """Async processing logic."""
        # Use asyncio for concurrent operations
        tasks = [
            self._fetch_data(url) for url in arguments.get('urls', [])
        ]
        results = await asyncio.gather(*tasks)
        return f"Processed {len(results)} items"
```

### 2. Caching

Implement caching for expensive operations:

```python
from functools import lru_cache
import time

class CachedToolClass:
    def __init__(self):
        self._cache = {}
        self._cache_ttl = 300  # 5 minutes

    def cached_tool_method(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Tool with caching."""
        cache_key = str(sorted(arguments.items()))

        # Check cache
        if cache_key in self._cache:
            cached_result, timestamp = self._cache[cache_key]
            if time.time() - timestamp < self._cache_ttl:
                return cached_result

        # Compute result
        result = self._expensive_operation(arguments)

        # Cache result
        self._cache[cache_key] = (result, time.time())

        return result
```

### 3. Configuration-Driven Tools

Tools that adapt based on configuration:

```python
class ConfigurableToolClass:
    def __init__(self, config: dict[str, Any]):
        self.config = config
        self._setup_from_config()

    def _setup_from_config(self):
        """Setup tool based on configuration."""
        self.timeout = self.config.get('timeout', 30)
        self.retry_count = self.config.get('retry_count', 3)
        self.endpoints = self.config.get('endpoints', [])

    def configurable_tool_method(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Tool that uses configuration."""
        # Use self.timeout, self.retry_count, etc.
        pass
```

## Deployment Checklist

### Pre-Deployment

- [ ] Tool schema validates against MCP specification
- [ ] All required parameters are documented
- [ ] Error handling covers all edge cases
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Tool is added to `tool_config.json`
- [ ] Tool is registered in main server
- [ ] Documentation is updated

### Post-Deployment

- [ ] Tool appears in `tools/list` response
- [ ] Tool can be called successfully
- [ ] Error responses are user-friendly
- [ ] Performance is acceptable
- [ ] Logs are informative
- [ ] Tool works in Cursor IDE

## Resources

- [MCP Specification](https://modelcontextprotocol.io/docs)
- [JSON Schema Documentation](https://json-schema.org/learn/)
- [Python asyncio Guide](https://docs.python.org/3/library/asyncio.html)
- [Reynard MCP Server](https://github.com/your-org/reynard/tree/main/services/mcp-server)
