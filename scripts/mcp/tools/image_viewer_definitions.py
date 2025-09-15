#!/usr/bin/env python3
"""
Image Viewer Tool Definitions
=============================

Defines image viewing MCP tools and their schemas.
Follows the 100-line axiom and modular architecture principles.
"""

from typing import Any


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
