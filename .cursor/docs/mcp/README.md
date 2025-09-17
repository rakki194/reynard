# MCP Server Documentation

## Overview

This directory contains comprehensive documentation for MCP (Model Context Protocol) server development, debugging, and integration with Cursor IDE. The documentation is based on real-world debugging experiences and provides practical guidance for common issues.

## Documentation Structure

### 📋 [Troubleshooting Guide](./troubleshooting.md)

Comprehensive guide covering common MCP server issues and their solutions:

- Tools not registering in Cursor (0 tools shown)
- Server startup failures
- Protocol communication issues
- Best practices and error handling

### 🔧 [Schema Format Guide](./schema-format.md)

Detailed explanation of correct MCP tool definition formats:

- `inputSchema` vs `parameters` (critical difference)
- Parameter types and constraints
- Tool naming conventions
- Migration guide from incorrect formats

### 🎯 [Cursor Integration Guide](./cursor-integration.md)

Cursor-specific requirements and integration considerations:

- Agent Mode requirement (critical for tool availability)
- Configuration file setup
- Common Cursor integration issues
- Testing and validation procedures

### 🔍 [Debugging Methodology](./debugging-methodology.md)

Systematic approach to debugging MCP server issues:

- Step-by-step debugging process
- Component isolation techniques
- Root cause analysis methods
- Solution implementation strategies

## Quick Start

### 1. Common Issues Checklist

If your MCP tools aren't showing in Cursor:

- [ ] **Agent Mode**: Are you using Cursor's Agent Mode/Composer? (MCP tools don't work in regular chat)
- [ ] **Schema Format**: Are tools using `inputSchema` instead of `parameters`?
- [ ] **Tool Names**: Do tool names use underscores instead of hyphens?
- [ ] **Server Running**: Is the MCP server running and responding?
- [ ] **Configuration**: Is the `mcp.json` file correctly configured?

### 2. Quick Fixes

#### Fix Schema Format

```json
// ❌ Incorrect
{
  "name": "my_tool",
  "parameters": { ... }
}

// ✅ Correct
{
  "name": "my_tool",
  "inputSchema": { ... }
}
```

#### Fix Tool Naming

```json
// ❌ Avoid hyphens
"name": "my-cool-tool"

// ✅ Use underscores
"name": "my_cool_tool"
```

#### Enable Agent Mode

- Use Cursor's Agent Mode/Composer feature
- MCP tools are not available in regular chat

### 3. Testing Your Server

```python
# Quick server test
import asyncio
import json

async def test_server():
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

    # Test tools/list
    tools_request = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/list"
    }

    # Send requests and check responses
    # (See debugging-methodology.md for complete implementation)
```

## Key Learnings

### Critical Issues Discovered

1. **Schema Format**: Using `parameters` instead of `inputSchema` causes tools to not register
2. **Agent Mode**: MCP tools only work in Cursor's Agent Mode, not regular chat
3. **Tool Naming**: Hyphens in tool names can cause registration issues
4. **Import Errors**: Missing imports can prevent server startup

### Most Common Solutions

1. **Change `parameters` to `inputSchema`** in all tool definitions
2. **Use Agent Mode** in Cursor for MCP tool access
3. **Replace hyphens with underscores** in tool names
4. **Add missing imports** to prevent startup failures

## Configuration Examples

### Basic MCP Configuration

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

### Tool Definition Template

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

## Resources

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Cursor MCP Documentation](https://docs.cursor.com/advanced/model-context-protocol)
- [Cursor Community Forums](https://forum.cursor.com/)

## Contributing

When adding new documentation:

1. Follow the established structure and format
2. Include practical examples and code snippets
3. Test all examples before documenting
4. Update this README with new sections
5. Cross-reference related documentation

## Support

For issues not covered in this documentation:

1. Check the troubleshooting guide first
2. Review Cursor's MCP logs (`View` → `Output` → "MCP Logs")
3. Test your server independently
4. Consult the Cursor community forums
5. Create an issue with detailed debugging information

---

_This documentation is based on real-world debugging experiences and provides practical solutions to common MCP server issues._
