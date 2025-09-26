#!/usr/bin/env python3
"""
Visualization Tool Definitions
==============================

Combined definitions for all visualization-related MCP tools.
Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any

from ..development.testing.playwright_definitions import get_playwright_tool_definitions


def get_mermaid_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get mermaid tool definitions."""
    return {
        "validate_mermaid_diagram": {
            "name": "validate_mermaid_diagram",
            "description": "Validate mermaid diagram syntax and check for errors",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "diagram_content": {
                        "type": "string",
                        "description": "Mermaid diagram content to validate",
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
                        "description": "Mermaid diagram content to render",
                    },
                    "output_path": {
                        "type": "string",
                        "description": "Output path for SVG file",
                    },
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
                        "description": "Mermaid diagram content to render",
                    },
                    "output_path": {
                        "type": "string",
                        "description": "Output path for PNG file",
                    },
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
                        "description": "Mermaid diagram content to analyze",
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


def get_image_viewer_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get image viewer tool definitions."""
    return {
        "open_image": {
            "name": "open_image",
            "description": "Open an image file with the imv image viewer",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "image_path": {
                        "type": "string",
                        "description": "Path to the image file to open",
                    },
                    "background": {
                        "type": "boolean",
                        "description": "Run imv in background (non-blocking)",
                        "default": True,
                    },
                    "fullscreen": {
                        "type": "boolean",
                        "description": "Open image in fullscreen mode",
                        "default": False,
                    },
                },
                "required": ["image_path"],
            },
        },
        "search_images": {
            "name": "search_images",
            "description": "Search for image files in a directory",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "directory": {
                        "type": "string",
                        "description": "Directory to search in (defaults to home directory)",
                        "default": "~",
                    },
                    "pattern": {
                        "type": "string",
                        "description": "File pattern to search for (e.g., '*.jpg', '*.png')",
                        "default": "*.{jpg,jpeg,png,gif,bmp,webp}",
                    },
                    "recursive": {
                        "type": "boolean",
                        "description": "Search recursively in subdirectories",
                        "default": True,
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of results to return",
                        "default": 20,
                    },
                },
            },
        },
        "get_image_info": {
            "name": "get_image_info",
            "description": "Get information about an image file",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "image_path": {
                        "type": "string",
                        "description": "Path to the image file",
                    },
                },
                "required": ["image_path"],
            },
        },
    }


def get_visualization_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get all visualization tool definitions."""
    definitions = {}

    # Add mermaid tools
    definitions.update(get_mermaid_tool_definitions())

    # Add image viewer tools
    definitions.update(get_image_viewer_tool_definitions())

    # Add playwright tools
    definitions.update(get_playwright_tool_definitions())

    return definitions
