# MCP Server Troubleshooting Guide

## Overview

This document covers common issues encountered when setting up and debugging MCP (Model Context Protocol) servers with Cursor IDE, based on real-world debugging experiences.

## Common Issues and Solutions

### 1. Tools Not Registering in Cursor (0 Tools Shown)

**Symptoms:**

- MCP server starts successfully
- Server responds to protocol requests correctly
- Cursor shows "0 tools" or no tools available
- Server logs show tools are registered and working

**Root Causes:**

#### A. Incorrect Tool Schema Format

**Problem:** Using `"parameters"` instead of `"inputSchema"` in tool definitions.

**Solution:**

```json
// ❌ Incorrect format
{
  "name": "my_tool",
  "description": "My tool",
  "parameters": {
    "type": "object",
    "properties": { ... }
  }
}

// ✅ Correct format
{
  "name": "my_tool",
  "description": "My tool",
  "inputSchema": {
    "type": "object",
    "properties": { ... }
  }
}
```

#### B. Agent Mode Requirement

**Problem:** MCP tools only work in Cursor's Agent Mode (Composer), not in regular chat.

**Solution:**

- Use Cursor's Agent Mode/Composer feature
- MCP tools are not available in standard chat interface

#### C. Tool Naming Issues

**Problem:** Tools with hyphens in names may be ignored by Cursor.

**Solution:**

- Use underscores instead of hyphens in tool names
- Example: `my-cool-tool` → `my_cool_tool`

### 2. MCP Server Startup Failures

**Symptoms:**

- Server fails to start
- Import errors or missing dependencies
- Process exits immediately

**Common Causes:**

#### A. Missing Imports

**Problem:** Missing import statements in tool modules.

**Example Error:**

```
NameError: name 'VersionService' is not defined
```

**Solution:**

```python
# Add missing imports
from services.version_service import VersionService
```

#### B. Path Issues

**Problem:** Python path not set correctly for MCP server.

**Solution:**

```bash
# Ensure PYTHONPATH includes MCP server directory
PYTHONPATH='/path/to/mcp/server:$PYTHONPATH' python3 main.py
```

### 3. Protocol Communication Issues

**Symptoms:**

- Server starts but doesn't respond to requests
- Timeout errors
- Invalid JSON responses

**Solutions:**

#### A. Proper MCP Protocol Implementation

```python
# Ensure proper JSON-RPC 2.0 format
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

#### B. Correct Capabilities Declaration

```python
# Proper capabilities in initialize response
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {
        "listChanged": True
      }
    },
    "serverInfo": {
      "name": "my-mcp-server",
      "version": "1.0.0"
    }
  }
}
```

## Debugging Techniques

### 1. Test MCP Server Independently

Create a test script to verify server functionality:

```python
#!/usr/bin/env python3
import asyncio
import json
import subprocess

async def test_mcp_server():
    # Start server process
    process = await asyncio.create_subprocess_exec(
        "python3", "main.py",
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    # Test initialize
    init_request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "test", "version": "1.0.0"}
        }
    }

    process.stdin.write((json.dumps(init_request) + "\n").encode())
    await process.stdin.drain()

    # Read response
    response_line = await asyncio.wait_for(process.stdout.readline(), timeout=10.0)
    if response_line:
        response = json.loads(response_line.decode().strip())
        print("✅ Initialize successful!")
        print("Capabilities:", response.get("result", {}).get("capabilities", {}))

    # Test tools/list
    tools_request = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/list"
    }

    process.stdin.write((json.dumps(tools_request) + "\n").encode())
    await process.stdin.drain()

    response_line = await asyncio.wait_for(process.stdout.readline(), timeout=10.0)
    if response_line:
        response = json.loads(response_line.decode().strip())
        tools = response.get("result", {}).get("tools", [])
        print(f"✅ Found {len(tools)} tools")

    process.terminate()
    await process.wait()

if __name__ == "__main__":
    asyncio.run(test_mcp_server())
```

### 2. Check Tool Definitions

Verify tool definitions are properly formatted:

```python
from main import MCPServer
import json

server = MCPServer()
tools_list = server.mcp_handler.handle_tools_list(1)
tools = tools_list.get('result', {}).get('tools', [])

# Check for problematic tool names
hyphen_tools = [tool for tool in tools if '-' in tool.get('name', '')]
if hyphen_tools:
    print("⚠️ Tools with hyphens found:")
    for tool in hyphen_tools:
        print(f"  - {tool['name']}")

# Verify schema format
for tool in tools:
    if 'parameters' in tool:
        print(f"❌ Tool {tool['name']} uses 'parameters' instead of 'inputSchema'")
    elif 'inputSchema' in tool:
        print(f"✅ Tool {tool['name']} uses correct 'inputSchema' format")
```

### 3. Monitor Cursor Logs

Check Cursor's MCP logs for errors:

1. Open Cursor
2. Go to `View` → `Output`
3. Select "MCP Logs" from the dropdown
4. Look for connection errors or authentication issues

## Best Practices

### 1. Tool Definition Standards

```json
{
  "name": "tool_name_with_underscores",
  "description": "Clear description of what the tool does",
  "inputSchema": {
    "type": "object",
    "properties": {
      "param_name": {
        "type": "string",
        "description": "Parameter description",
        "default": "default_value"
      }
    },
    "required": ["param_name"]
  }
}
```

### 2. Error Handling

```python
async def handle_tool_call(self, tool_name: str, arguments: dict, request_id: Any):
    try:
        # Tool execution logic
        result = await self.execute_tool(tool_name, arguments)
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {"content": [{"type": "text", "text": result}]}
        }
    except Exception as e:
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "error": {
                "code": -32603,
                "message": f"Tool execution failed: {str(e)}"
            }
        }
```

### 3. Configuration Management

```json
{
  "mcpServers": {
    "my-server": {
      "command": "bash",
      "args": ["-c", "source ~/venv/bin/activate && cd /path/to/server && python3 main.py"],
      "env": {
        "PYTHONPATH": "/path/to/server"
      }
    }
  }
}
```

## Common Error Messages

### "0 tools registered"

- Check tool schema format (`inputSchema` vs `parameters`)
- Verify Agent Mode is enabled in Cursor
- Check for tool naming issues (hyphens)

### "Server not responding"

- Verify server is running
- Check Python path configuration
- Test server independently

### "Invalid JSON"

- Ensure proper JSON-RPC 2.0 format
- Check for encoding issues
- Validate request/response structure

## Resources

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Cursor MCP Documentation](https://docs.cursor.com/advanced/model-context-protocol)
- [MCP Server Examples](https://github.com/modelcontextprotocol/servers)

## Conclusion

MCP server debugging requires attention to protocol compliance, proper schema formatting, and understanding Cursor's specific requirements. The most common issue is using incorrect tool definition schemas, followed by not using Agent Mode in Cursor.
