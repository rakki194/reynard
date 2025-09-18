# MCP Troubleshooting Guide

## Overview

This guide covers common issues encountered when developing and deploying MCP (Model Context Protocol) servers,
particularly when integrating with Cursor IDE. Based on real-world troubleshooting experiences and web research.

## Common Issues and Solutions

### 1. Tools Not Appearing in Cursor

#### Symptoms

- MCP server shows tools are registered
- Cursor shows no tools or fewer tools than expected
- Tools work when tested directly but not in Cursor

#### Root Causes

1. **Schema Format Issues**: Using `parameters` instead of `inputSchema`
2. **Connection Problems**: Cursor not properly connected to MCP server
3. **Authentication Blocking**: Middleware blocking requests
4. **Tool Configuration**: Tools disabled in `tool_config.json`

#### Solutions

##### Schema Format Fix

```python
# ❌ Wrong - using 'parameters'
{
    "name": "tool_name",
    "description": "Tool description",
    "parameters": {  # Wrong property name
    "type": "object",
        "properties": {}
    }
}

# ✅ Correct - using 'inputSchema'
{
    "name": "tool_name",
    "description": "Tool description",
    "inputSchema": {  # Correct property name
    "type": "object",
        "properties": {}
  }
}
```

##### Connection Troubleshooting

1. **Restart Cursor's MCP Connection**:
   - Command Palette: `Ctrl+Shift+P` (Linux/Windows) or `Cmd+Shift+P` (Mac)
   - Search: "MCP" or "Restart MCP Server"
   - Select: "MCP: Restart Server" or "MCP: Reload Configuration"

2. **Restart Cursor Completely**:
   - Close Cursor entirely
   - Reopen Cursor
   - MCP server should reconnect automatically

3. **Check MCP Server Status**:
   - Look for MCP server status in Cursor's bottom status bar
   - Check for error messages in Cursor's developer console

##### Authentication Issues

```python
# Check if authentication is blocking requests
from middleware.auth_middleware import mcp_auth_middleware

test_request = {
    'method': 'tools/list',
    'params': {},
    'id': 1
}

token_payload = mcp_auth_middleware.authenticate_request(test_request)
if token_payload is None:
    print("❌ Authentication is blocking requests!")
```

##### Tool Configuration Check

```python
# Verify tools are enabled in tool_config.json
import json

with open('tool_config.json', 'r') as f:
    config = json.load(f)

tools_config = config.get('tools', {})
enabled_tools = [name for name, tool in tools_config.items()
                if tool.get('enabled', False)]
print(f'Enabled tools: {len(enabled_tools)}')
```

### 2. MCP Server Startup Issues

#### Symptoms

- Server fails to start
- Import errors during startup
- Missing dependencies

#### Solutions

##### Virtual Environment Issues

```bash
# Ensure virtual environment is activated
source ~/venv/bin/activate

# Install missing dependencies
pip install -r requirements.txt

# Test server startup
python3 main.py
```

##### Import Path Issues

```python
# Add MCP directory to Python path
import sys
sys.path.insert(0, '/path/to/mcp/directory')

# Test imports
from main import MCPServer
```

##### Dependency Issues

```bash
# Check for missing packages
python3 -c "import jwt, asyncio, json"

# Install specific missing packages
pip install PyJWT asyncio
```

### 3. Tool Registration Problems

#### Symptoms

- Tools not appearing in registry
- "Tool not found" errors
- Inconsistent tool counts

#### Solutions

##### Check Tool Registration

```python
# Verify tool registration
server = MCPServer()
all_tools = server.tool_registry.list_all_tools()
print(f'Registered tools: {len(all_tools)}')

# Check specific tools
secrets_tools = [name for name in all_tools if 'secret' in name.lower()]
print(f'Secrets tools: {secrets_tools}')
```

##### Verify Tool Definitions

```python
# Check tool definitions are loaded
from tools.definitions import get_tool_definitions
tool_defs = get_tool_definitions()
print(f'Tool definitions: {len(tool_defs)}')

# Check specific tool definition
if 'get_secret' in tool_defs:
    print("✅ get_secret definition found")
else:
    print("❌ get_secret definition missing")
```

### 4. Authentication and Authorization Issues

#### Symptoms

- "Authentication required" errors
- "Access denied" messages
- Tools work for some users but not others

#### Solutions

##### Check Authentication Requirements

```python
# Verify which tools require authentication
def _requires_auth(self, tool_name: str) -> bool:
    management_tools = {
        "get_tool_configs",
        "get_tool_status",
        "enable_tool",
        "disable_tool",
        "toggle_tool",
        "get_tools_by_category",
        "update_tool_config",
        "reload_config",
    }
    return tool_name in management_tools
```

##### Bypass Authentication for Testing

```python
# Temporarily disable authentication for testing
# (Only for development, not production)
class MCPAuthMiddleware:
    def authenticate_request(self, request):
        # Return a dummy token for testing
        return {"user_id": "test", "permissions": ["*"]}
```

### 5. Performance and Resource Issues

#### Symptoms

- Slow tool responses
- High memory usage
- Server timeouts

#### Solutions

##### Optimize Tool Execution

```python
# Use async/await for I/O operations
async def handle_tool_call(self, tool_name: str, arguments: dict):
    # Use asyncio for concurrent operations
    results = await asyncio.gather(*[
        self.process_item(item) for item in items
    ])
    return results
```

##### Implement Caching

```python
# Cache expensive operations
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_operation(self, param: str):
    # Expensive computation here
    return result
```

##### Monitor Resource Usage

```python
import psutil
import os

def monitor_resources():
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    cpu_percent = process.cpu_percent()

    print(f"Memory: {memory_info.rss / 1024 / 1024:.2f} MB")
    print(f"CPU: {cpu_percent:.2f}%")
```

## Diagnostic Commands

### Server Health Check

```bash
# Check if MCP server is running
ps aux | grep "python3 main.py" | grep -v grep

# Test server connectivity
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/list", "params": {}, "id": 1}'
```

### Tool Testing

```python
# Test individual tools
import asyncio
from main import MCPServer

async def test_tool():
    server = MCPServer()

    # Test tools/list
    request = {
        'method': 'tools/list',
        'params': {},
        'id': 1
    }
    response = await server.handle_request(request)
    print(f"Tools: {len(response['result']['tools'])}")

    # Test specific tool
    request = {
        'method': 'tools/call',
        'params': {
            'name': 'get_current_time',
            'arguments': {}
        },
        'id': 2
    }
    response = await server.handle_request(request)
    print(f"Response: {response}")

asyncio.run(test_tool())
```

### Configuration Validation

```python
# Validate tool configuration
import json

def validate_tool_config():
    with open('tool_config.json', 'r') as f:
        config = json.load(f)

    # Check structure
    assert 'tools' in config, "Missing 'tools' key"
    assert 'version' in config, "Missing 'version' key"

    # Check each tool
    for tool_name, tool_config in config['tools'].items():
        assert 'enabled' in tool_config, f"Missing 'enabled' for {tool_name}"
        assert 'category' in tool_config, f"Missing 'category' for {tool_name}"

    print("✅ Tool configuration is valid")

validate_tool_config()
```

## Prevention Strategies

### 1. Schema Validation

- Always use `inputSchema` instead of `parameters`
- Validate schemas before deployment
- Test tool definitions with MCP clients

### 2. Configuration Management

- Keep `tool_config.json` in version control
- Document tool categories and dependencies
- Use consistent naming conventions

### 3. Error Handling

- Implement comprehensive error handling
- Log errors with context
- Provide helpful error messages

### 4. Testing

- Test tools individually
- Test MCP protocol compliance
- Test with different clients (Cursor, CLI tools)

## Emergency Recovery

### Quick Fixes

1. **Restart MCP Server**: `pkill -f "python3 main.py" && python3 main.py`
2. **Reset Configuration**: Restore `tool_config.json` from backup
3. **Clear Cache**: Remove any cached tool definitions
4. **Reinstall Dependencies**: `pip install -r requirements.txt --force-reinstall`

### Full Recovery

1. **Backup Current State**: Save logs and configuration
2. **Restore from Git**: `git checkout HEAD -- tool_config.json`
3. **Recreate Virtual Environment**: `rm -rf venv && python -m venv venv`
4. **Reinstall Everything**: `pip install -r requirements.txt`

## Resources

- [MCP Specification](https://modelcontextprotocol.io/docs)
- [Cursor MCP Integration](https://cursor.sh/docs/mcp)
- [JSON Schema Validation](https://json-schema.org/learn/)
- [Python asyncio Documentation](https://docs.python.org/3/library/asyncio.html)
