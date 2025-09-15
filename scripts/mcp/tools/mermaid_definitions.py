#!/usr/bin/env python3
"""
Mermaid Tool Definitions
========================

Defines mermaid diagram-related MCP tools and their schemas.
Follows the 100-line axiom and modular architecture principles.
"""

from typing import Any


def get_mermaid_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get mermaid diagram MCP tool definitions."""

    return {
        "validate_mermaid_diagram": {
            "name": "validate_mermaid_diagram",
            "description": "Validate mermaid diagram syntax and check for errors",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "diagram_content": {
                        "type": "string",
                        "description": "The mermaid diagram content to validate",
                    }
                },
                "required": ["diagram_content"],
            },
        },
        "render_mermaid_to_svg": {
            "name": "render_mermaid_to_svg",
            "description": "Render mermaid diagram to SVG format",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "diagram_content": {
                        "type": "string",
                        "description": "The mermaid diagram content to render",
                    }
                },
                "required": ["diagram_content"],
            },
        },
        "render_mermaid_to_png": {
            "name": "render_mermaid_to_png",
            "description": "Render mermaid diagram to PNG format",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "diagram_content": {
                        "type": "string",
                        "description": "The mermaid diagram content to render",
                    }
                },
                "required": ["diagram_content"],
            },
        },
        "get_mermaid_diagram_stats": {
            "name": "get_mermaid_diagram_stats",
            "description": "Get statistics and analysis of a mermaid diagram",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "diagram_content": {
                        "type": "string",
                        "description": "The mermaid diagram content to analyze",
                    }
                },
                "required": ["diagram_content"],
            },
        },
        "test_mermaid_render": {
            "name": "test_mermaid_render",
            "description": "Test mermaid diagram rendering with a simple example",
            "inputSchema": {"type": "object", "properties": {}},
        },
    }
