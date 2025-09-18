# MCP Schema Format Reference

## Overview

The Model Context Protocol (MCP) uses a specific schema format for defining tools. Understanding this format is crucial
for developing MCP tools that work correctly with clients like Cursor.

## Core Schema Structure

### Tool Definition Format

```json
{
  "name": "tool_name",
  "description": "Tool description",
  "inputSchema": {
    "type": "object",
    "properties": {
      "parameter_name": {
        "type": "string",
        "description": "Parameter description",
        "enum": ["value1", "value2"]
      }
    },
    "required": ["parameter_name"]
  }
}
```

### Key Schema Properties

#### Required Properties

- **`name`**: Unique identifier for the tool
- **`description`**: Human-readable description of what the tool does
- **`inputSchema`**: JSON Schema defining the tool's parameters

#### Input Schema Structure

- **`type`**: Must be `"object"` for tool parameters
- **`properties`**: Object defining each parameter
- **`required`**: Array of required parameter names

#### Parameter Properties

- **`type`**: Data type (`string`, `boolean`, `number`, `array`, `object`)
- **`description`**: Parameter description
- **`enum`**: Array of allowed values (optional)
- **`default`**: Default value (optional)

## Common Schema Patterns

### Simple Tool (No Parameters)

```json
{
  "name": "get_current_time",
  "description": "Get current date and time",
  "inputSchema": {
    "type": "object",
    "properties": {}
  }
}
```

### Tool with Required String Parameter

```json
{
  "name": "get_secret",
  "description": "Retrieve a user secret by name",
  "inputSchema": {
    "type": "object",
    "properties": {
      "secret_name": {
        "type": "string",
        "description": "Name of the secret to retrieve",
        "enum": ["GH_TOKEN"]
      }
    },
    "required": ["secret_name"]
  }
}
```

### Tool with Optional Parameters

```json
{
  "name": "list_available_secrets",
  "description": "List all available secrets",
  "inputSchema": {
    "type": "object",
    "properties": {
      "include_descriptions": {
        "type": "boolean",
        "description": "Whether to include descriptions",
        "default": true
      }
    },
    "required": []
  }
}
```

### Tool with Multiple Parameters

```json
{
  "name": "search_files",
  "description": "Search for files by name pattern",
  "inputSchema": {
    "type": "object",
    "properties": {
      "pattern": {
        "type": "string",
        "description": "File name pattern to search for"
      },
      "directory": {
        "type": "string",
        "description": "Directory to search in",
        "default": null
      },
      "recursive": {
        "type": "boolean",
        "description": "Whether to search recursively",
        "default": true
      }
    },
    "required": ["pattern"]
  }
}
```

## Schema Validation Rules

### Required Fields

1. **`name`**: Must be a valid identifier (alphanumeric + underscores)
2. **`description`**: Must be a non-empty string
3. **`inputSchema`**: Must be a valid JSON Schema object

### Input Schema Requirements

1. **`type`**: Must be exactly `"object"`
2. **`properties`**: Must be an object (can be empty)
3. **`required`**: Must be an array of strings (can be empty)

### Parameter Validation

1. **`type`**: Must be a valid JSON Schema type
2. **`description`**: Should be descriptive and helpful
3. **`enum`**: If provided, must be a non-empty array
4. **`default`**: Must match the parameter type

## Common Schema Mistakes

### ❌ Wrong: Using `parameters` instead of `inputSchema`

```json
{
  "name": "tool_name",
  "description": "Tool description",
  "parameters": {
    // ❌ Wrong property name
    "type": "object",
    "properties": {}
  }
}
```

### ✅ Correct: Using `inputSchema`

```json
{
  "name": "tool_name",
  "description": "Tool description",
  "inputSchema": {
    // ✅ Correct property name
    "type": "object",
    "properties": {}
  }
}
```

### ❌ Wrong: Missing `type: "object"`

```json
{
  "inputSchema": {
    "properties": {
      // ❌ Missing type
      "param": { "type": "string" }
    }
  }
}
```

### ✅ Correct: Including `type: "object"`

```json
{
  "inputSchema": {
    "type": "object", // ✅ Required
    "properties": {
      "param": { "type": "string" }
    }
  }
}
```

## Schema Testing

### Validation Checklist

- [ ] Tool has `name`, `description`, and `inputSchema`
- [ ] `inputSchema.type` is `"object"`
- [ ] All parameters have valid types
- [ ] Required parameters are listed in `required` array
- [ ] Default values match parameter types
- [ ] Enum values are valid for the parameter type

### Testing Tools

```python
import json
from jsonschema import validate, Draft7Validator

def validate_tool_schema(tool_def):
    """Validate a tool definition against MCP schema requirements."""
    required_fields = ["name", "description", "inputSchema"]

    # Check required fields
    for field in required_fields:
        if field not in tool_def:
            return False, f"Missing required field: {field}"

    # Check inputSchema structure
    input_schema = tool_def["inputSchema"]
    if input_schema.get("type") != "object":
        return False, "inputSchema.type must be 'object'"

    # Validate JSON Schema
    try:
        Draft7Validator.check_schema(input_schema)
        return True, "Valid schema"
    except Exception as e:
        return False, f"Invalid JSON Schema: {e}"
```

## Best Practices

### Naming Conventions

- Use snake_case for tool names
- Use descriptive, action-oriented names
- Prefix related tools (e.g., `get_`, `list_`, `validate_`)

### Parameter Design

- Keep parameter names clear and consistent
- Provide helpful descriptions
- Use enums for limited value sets
- Set sensible defaults for optional parameters

### Documentation

- Write clear, concise descriptions
- Explain what the tool does, not how it works
- Include usage examples in descriptions
- Document any special requirements or limitations

## References

- [MCP Specification](https://modelcontextprotocol.io/docs)
- [JSON Schema Draft 7](https://json-schema.org/draft/2019-09/schema)
- [Cursor MCP Integration](https://cursor.sh/docs/mcp)
