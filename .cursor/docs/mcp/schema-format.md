# MCP Tool Schema Format Guide

## Overview

This document explains the correct format for MCP tool definitions, focusing on the critical difference between `parameters` and `inputSchema` that can cause tools to not register in Cursor.

## Schema Format Requirements

### Correct Format: `inputSchema`

The MCP specification requires tool definitions to use `inputSchema` for parameter definitions:

```json
{
  "name": "my_tool",
  "description": "Description of what the tool does",
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

### Incorrect Format: `parameters`

Using `parameters` instead of `inputSchema` will cause tools to not register in Cursor:

```json
{
  "name": "my_tool",
  "description": "Description of what the tool does",
  "parameters": {
    // ❌ This is incorrect
    "type": "object",
    "properties": {
      "param_name": {
        "type": "string",
        "description": "Parameter description"
      }
    }
  }
}
```

## Complete Tool Definition Example

```json
{
  "name": "agent_startup_sequence",
  "description": "Complete agent initialization with random spirit selection",
  "inputSchema": {
    "type": "object",
    "properties": {
      "agent_id": {
        "type": "string",
        "description": "Unique identifier for the agent",
        "default": "current-session"
      },
      "preferred_style": {
        "type": "string",
        "description": "Preferred naming style",
        "enum": ["foundation", "exo", "hybrid", "cyberpunk", "mythological", "scientific"],
        "default": "foundation"
      }
    }
  }
}
```

## Parameter Types and Constraints

### String Parameters

```json
{
  "param_name": {
    "type": "string",
    "description": "A string parameter",
    "default": "default_value",
    "enum": ["option1", "option2", "option3"]
  }
}
```

### Integer Parameters

```json
{
  "param_name": {
    "type": "integer",
    "description": "An integer parameter",
    "default": 42,
    "minimum": 0,
    "maximum": 100
  }
}
```

### Boolean Parameters

```json
{
  "param_name": {
    "type": "boolean",
    "description": "A boolean parameter",
    "default": true
  }
}
```

### Array Parameters

```json
{
  "param_name": {
    "type": "array",
    "description": "An array parameter",
    "items": {
      "type": "string"
    },
    "default": []
  }
}
```

### Object Parameters

```json
{
  "param_name": {
    "type": "object",
    "description": "An object parameter",
    "properties": {
      "nested_prop": {
        "type": "string",
        "description": "Nested property"
      }
    }
  }
}
```

## Required vs Optional Parameters

### Required Parameters

```json
{
  "inputSchema": {
    "type": "object",
    "properties": {
      "required_param": {
        "type": "string",
        "description": "This parameter is required"
      },
      "optional_param": {
        "type": "string",
        "description": "This parameter is optional"
      }
    },
    "required": ["required_param"]
  }
}
```

### All Optional Parameters

```json
{
  "inputSchema": {
    "type": "object",
    "properties": {
      "param1": {
        "type": "string",
        "description": "Optional parameter 1"
      },
      "param2": {
        "type": "string",
        "description": "Optional parameter 2"
      }
    }
  }
}
```

## Tool Naming Conventions

### Recommended Naming

- Use underscores instead of hyphens: `my_tool_name`
- Use descriptive names: `generate_agent_name`
- Use consistent patterns: `get_*`, `set_*`, `list_*`, `create_*`

### Examples

```json
// ✅ Good naming
{
  "name": "generate_agent_name",
  "name": "get_current_time",
  "name": "list_agent_names",
  "name": "create_ecs_agent"
}

// ❌ Avoid hyphens
{
  "name": "generate-agent-name",  // May cause issues
  "name": "get-current-time",     // May cause issues
}
```

## Validation and Testing

### Schema Validation

Use JSON Schema validation to ensure your tool definitions are correct:

```python
import jsonschema

def validate_tool_definition(tool_def):
    schema = {
        "type": "object",
        "required": ["name", "description", "inputSchema"],
        "properties": {
            "name": {"type": "string"},
            "description": {"type": "string"},
            "inputSchema": {
                "type": "object",
                "required": ["type"],
                "properties": {
                    "type": {"type": "string", "enum": ["object"]},
                    "properties": {"type": "object"},
                    "required": {"type": "array", "items": {"type": "string"}}
                }
            }
        }
    }

    try:
        jsonschema.validate(tool_def, schema)
        return True
    except jsonschema.ValidationError as e:
        print(f"Validation error: {e}")
        return False
```

### Testing Tool Definitions

```python
def test_tool_definitions():
    from main import MCPServer

    server = MCPServer()
    tools_list = server.mcp_handler.handle_tools_list(1)
    tools = tools_list.get('result', {}).get('tools', [])

    for tool in tools:
        # Check for correct schema format
        if 'parameters' in tool:
            print(f"❌ Tool {tool['name']} uses 'parameters' instead of 'inputSchema'")
        elif 'inputSchema' not in tool:
            print(f"❌ Tool {tool['name']} missing 'inputSchema'")
        else:
            print(f"✅ Tool {tool['name']} has correct schema format")

        # Check for problematic naming
        if '-' in tool.get('name', ''):
            print(f"⚠️ Tool {tool['name']} contains hyphens")
```

## Common Mistakes

### 1. Using `parameters` instead of `inputSchema`

```json
// ❌ Wrong
"parameters": { ... }

// ✅ Correct
"inputSchema": { ... }
```

### 2. Missing required fields

```json
// ❌ Missing description
{
  "name": "my_tool",
  "inputSchema": { ... }
}

// ✅ Complete
{
  "name": "my_tool",
  "description": "What this tool does",
  "inputSchema": { ... }
}
```

### 3. Incorrect parameter types

```json
// ❌ Wrong type
{
  "param": {
    "type": "string",
    "default": 123  // String type with integer default
  }
}

// ✅ Correct
{
  "param": {
    "type": "string",
    "default": "123"  // String type with string default
  }
}
```

## Migration Guide

If you have existing tool definitions using `parameters`, here's how to migrate them:

### Before (Incorrect)

```json
{
  "name": "my_tool",
  "description": "My tool",
  "parameters": {
    "type": "object",
    "properties": {
      "input": {
        "type": "string",
        "description": "Input parameter"
      }
    }
  }
}
```

### After (Correct)

```json
{
  "name": "my_tool",
  "description": "My tool",
  "inputSchema": {
    "type": "object",
    "properties": {
      "input": {
        "type": "string",
        "description": "Input parameter"
      }
    }
  }
}
```

### Automated Migration Script

```python
def migrate_tool_definitions(tools_dict):
    """Migrate tool definitions from 'parameters' to 'inputSchema'"""
    for tool_name, tool_def in tools_dict.items():
        if 'parameters' in tool_def:
            tool_def['inputSchema'] = tool_def.pop('parameters')
            print(f"Migrated tool: {tool_name}")
    return tools_dict
```

## Conclusion

The correct use of `inputSchema` in MCP tool definitions is critical for proper tool registration in Cursor. Always use `inputSchema` instead of `parameters`, follow naming conventions, and validate your schemas before deployment.
