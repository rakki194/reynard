# Cursor IDE MCP Integration Guide

## Overview

This document covers the specific requirements and considerations for integrating MCP servers with Cursor IDE, based on real-world debugging experiences and research findings.

## Cursor-Specific Requirements

### 1. Agent Mode Requirement

**Critical:** MCP tools only work in Cursor's Agent Mode (Composer), not in regular chat.

- ✅ **Agent Mode/Composer**: MCP tools are available
- ❌ **Regular Chat**: MCP tools are not available

**How to Use:**

1. Open Cursor IDE
2. Use the Agent Mode/Composer feature (not regular chat)
3. MCP tools will be available for the AI to use

### 2. Configuration File Location

Cursor looks for MCP configuration in:

- **Global**: `~/.cursor/mcp.json`
- **Project-specific**: `.cursor/mcp.json` (in project root)

### 3. Configuration Format

```json
{
  "mcpServers": {
    "server-name": {
      "command": "bash",
      "args": ["-c", "source ~/venv/bin/activate && cd /path/to/server && python3 main.py"],
      "env": {
        "PYTHONPATH": "/path/to/server"
      }
    }
  }
}
```

## Common Cursor Integration Issues

### 1. Tools Not Appearing (0 Tools)

**Symptoms:**

- MCP server starts successfully
- Server responds to protocol requests
- Cursor shows "0 tools" or no tools available

**Solutions:**

#### A. Check Agent Mode

- Ensure you're using Agent Mode/Composer, not regular chat
- MCP tools are only available in Agent Mode

#### B. Verify Tool Schema Format

- Use `inputSchema` instead of `parameters` in tool definitions
- See [Schema Format Guide](./schema-format.md) for details

#### C. Check Tool Naming

- Avoid hyphens in tool names
- Use underscores: `my_tool_name` instead of `my-tool-name`

### 2. Server Connection Issues

**Symptoms:**

- Cursor can't connect to MCP server
- Connection timeout errors
- Server not found errors

**Solutions:**

#### A. Verify Server Path

```bash
# Test if server can be started manually
cd /path/to/mcp/server
python3 main.py
```

#### B. Check Environment Variables

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

#### C. Test Server Independently

```python
# Test server with MCP protocol
import asyncio
import json

async def test_server():
    # Start server process
    process = await asyncio.create_subprocess_exec(
        "python3", "main.py",
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE
    )

    # Test initialize
    init_request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "cursor", "version": "1.0.0"}
        }
    }

    process.stdin.write((json.dumps(init_request) + "\n").encode())
    await process.stdin.drain()

    # Read response
    response_line = await asyncio.wait_for(process.stdout.readline(), timeout=10.0)
    if response_line:
        response = json.loads(response_line.decode().strip())
        print("✅ Server responds correctly")

    process.terminate()
    await process.wait()
```

## Cursor MCP Logs

### Accessing Logs

1. Open Cursor IDE
2. Go to `View` → `Output` (or `Ctrl+Shift+U`)
3. Select "MCP Logs" from the dropdown
4. Look for connection errors or authentication issues

### Common Log Messages

#### Successful Connection

```
[INFO] MCP server connected successfully
[INFO] 37 tools registered
```

#### Connection Errors

```
[ERROR] Failed to connect to MCP server
[ERROR] Server not responding
[ERROR] Invalid JSON response
```

#### Tool Registration Issues

```
[WARN] 0 tools found in server response
[ERROR] Tool definition validation failed
```

## Best Practices for Cursor Integration

### 1. Server Startup

```python
# Ensure proper MCP protocol implementation
class MCPServer:
    def __init__(self):
        # Initialize all components
        self.tool_registry = ToolRegistry()
        self.mcp_handler = MCPHandler(self.tool_registry)

    async def run(self):
        """Run the MCP server with proper protocol handling."""
        while True:
            try:
                line = await asyncio.get_event_loop().run_in_executor(
                    None, sys.stdin.readline
                )
                if not line:
                    break

                request = json.loads(line.strip())
                response = await self.handle_request(request)

                if response is not None:
                    sys.stdout.write(json.dumps(response) + "\n")
                    sys.stdout.flush()

            except json.JSONDecodeError:
                logger.exception("Invalid JSON received")
            except Exception:
                logger.exception("Unexpected error")
```

### 2. Proper Capabilities Declaration

```python
def handle_initialize(self, request_id: Any) -> dict[str, Any]:
    """Handle MCP initialization request."""
    return {
        "jsonrpc": "2.0",
        "id": request_id,
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

### 3. Tool Definition Standards

```python
def get_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get properly formatted tool definitions."""
    return {
        "my_tool": {
            "name": "my_tool",
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
    }
```

## Testing Cursor Integration

### 1. Manual Testing

```bash
# Test server startup
cd /path/to/mcp/server
python3 main.py

# In another terminal, test protocol
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "cursor", "version": "1.0.0"}}}' | python3 main.py
```

### 2. Automated Testing

```python
import asyncio
import json
import subprocess

async def test_cursor_integration():
    """Test MCP server with Cursor-compatible protocol."""

    # Start server
    process = await asyncio.create_subprocess_exec(
        "python3", "main.py",
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    try:
        # Test 1: Initialize
        init_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "cursor", "version": "1.0.0"}
            }
        }

        process.stdin.write((json.dumps(init_request) + "\n").encode())
        await process.stdin.drain()

        response_line = await asyncio.wait_for(process.stdout.readline(), timeout=10.0)
        if response_line:
            response = json.loads(response_line.decode().strip())
            print("✅ Initialize successful")
            print(f"Capabilities: {response.get('result', {}).get('capabilities', {})}")

        # Test 2: Tools list
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
            tools = response.get('result', {}).get('tools', [])
            print(f"✅ Found {len(tools)} tools")

            # Check for proper schema format
            for tool in tools:
                if 'inputSchema' in tool:
                    print(f"✅ Tool {tool['name']} has correct schema")
                elif 'parameters' in tool:
                    print(f"❌ Tool {tool['name']} uses incorrect 'parameters' format")

    except Exception as e:
        print(f"❌ Test failed: {e}")
    finally:
        process.terminate()
        await process.wait()

if __name__ == "__main__":
    asyncio.run(test_cursor_integration())
```

## Troubleshooting Checklist

### Before Reporting Issues

1. ✅ **Agent Mode**: Are you using Agent Mode/Composer?
2. ✅ **Schema Format**: Are tools using `inputSchema` instead of `parameters`?
3. ✅ **Tool Names**: Do tool names use underscores instead of hyphens?
4. ✅ **Server Running**: Is the MCP server running and responding?
5. ✅ **Configuration**: Is the `mcp.json` file correctly configured?
6. ✅ **Logs**: Have you checked Cursor's MCP logs for errors?

### Common Solutions

1. **Restart Cursor** completely to clear cached connections
2. **Check MCP logs** in Cursor's Output panel
3. **Test server independently** with protocol requests
4. **Verify configuration** file format and paths
5. **Update Cursor** to the latest version

## Resources

- [Cursor MCP Documentation](https://docs.cursor.com/advanced/model-context-protocol)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Cursor Community Forums](https://forum.cursor.com/)

## Conclusion

Successful Cursor MCP integration requires:

- Using Agent Mode/Composer
- Proper tool schema format (`inputSchema`)
- Correct naming conventions
- Valid MCP protocol implementation
- Proper configuration file setup

Following these guidelines will ensure your MCP tools work correctly with Cursor IDE.
