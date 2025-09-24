#!/usr/bin/env python3
"""
MCP Tool Creation Template
==========================

Template for creating new MCP tools with proper schema validation.
Copy this template and modify for your new tool.

Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any

from protocol.tool_registry import register_tool


@register_tool(
    name="your_tool_name",
    category="your_category",
    description="Description of what your tool does",
    input_schema={
        "type": "object",
        "properties": {
            "param1": {"type": "string", "description": "Description of param1"},
            "param2": {
                "type": "integer",
                "description": "Description of param2",
                "default": 42,
            },
            "param3": {
                "type": "boolean",
                "description": "Description of param3",
                "default": True,
            },
        },
        "required": ["param1"],
    },
)
def your_tool_function(arguments: dict[str, Any]) -> dict[str, Any]:
    """
    Your tool implementation.

    Args:
        arguments: Dictionary containing tool arguments

    Returns:
        Dictionary with tool result

    Raises:
        ValueError: If required parameters are missing
        RuntimeError: If tool execution fails
    """
    # Extract parameters
    param1 = arguments.get("param1")
    param2 = arguments.get("param2", 42)
    param3 = arguments.get("param3", True)

    # Validate required parameters
    if not param1:
        raise ValueError("param1 is required")

    # Your tool logic here
    try:
        # Example: Process the parameters
        result = f"Processed {param1} with {param2} and {param3}"

        return {"type": "text", "text": result}
    except Exception as e:
        raise RuntimeError(f"Tool execution failed: {e}")


# Example of a tool with no parameters
@register_tool(
    name="simple_tool",
    category="utility",
    description="A simple tool with no parameters",
)
def simple_tool_function(arguments: dict[str, Any]) -> dict[str, Any]:
    """Simple tool that returns a message."""
    return {"type": "text", "text": "Hello from the simple tool!"}


# Example of an async tool
@register_tool(
    name="async_tool",
    category="async",
    description="An async tool example",
    execution_type="async",
    input_schema={
        "type": "object",
        "properties": {"url": {"type": "string", "description": "URL to process"}},
        "required": ["url"],
    },
)
async def async_tool_function(arguments: dict[str, Any]) -> dict[str, Any]:
    """Async tool example."""
    import asyncio

    url = arguments.get("url")
    if not url:
        raise ValueError("url is required")

    # Simulate async work
    await asyncio.sleep(0.1)

    return {"type": "text", "text": f"Processed URL: {url}"}
