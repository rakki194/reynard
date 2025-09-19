#!/usr/bin/env python3
"""
Image Viewer Tool Handlers
==========================

Handles image viewing MCP tool calls using imv.
Now uses the new @register_tool decorator system for automatic registration.

Follows the 140-line axiom and modular architecture principles.
"""

import asyncio
import logging
import os
import subprocess
from pathlib import Path
from typing import Any

from protocol.tool_registry import register_tool

logger = logging.getLogger(__name__)

# Supported image formats
SUPPORTED_FORMATS = {
    ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff", ".svg"
}


def _expand_path(path: str) -> str:
    """Expand tilde and resolve path."""
    return str(Path(path).expanduser().resolve())


def _is_image_file(file_path: str) -> bool:
    """Check if file is a supported image format."""
    return Path(file_path).suffix.lower() in SUPPORTED_FORMATS


def _check_imv_available() -> bool:
    """Check if imv is available on the system."""
    try:
        result = subprocess.run(["which", "imv"], capture_output=True, check=True)
        return result.returncode == 0
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


@register_tool(
    name="open_image",
    category="visualization",
    description="Open an image file with the imv image viewer",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def open_image(**kwargs) -> dict[str, Any]:
    """Open an image file with the imv image viewer."""
    arguments = kwargs.get("arguments", {})
    image_path = arguments.get("image_path")
    background = arguments.get("background", True)
    fullscreen = arguments.get("fullscreen", False)
    
    if not image_path:
        return {
            "content": [
                {
                    "type": "text",
                    "text": "❌ Image path is required"
                }
            ]
        }
    
    # Expand and validate path
    expanded_path = _expand_path(image_path)
    
    if not os.path.exists(expanded_path):
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Image file not found: {expanded_path}"
                }
            ]
        }
    
    if not _is_image_file(expanded_path):
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Unsupported image format: {Path(expanded_path).suffix}"
                }
            ]
        }
    
    # Check if imv is available
    if not _check_imv_available():
        return {
            "content": [
                {
                    "type": "text",
                    "text": "❌ imv image viewer not found. Please install imv package."
                }
            ]
        }
    
    try:
        # Build imv command
        cmd = ["imv", expanded_path]
        
        if fullscreen:
            cmd.append("-f")
        
        # Execute imv
        if background:
            # Run in background
            subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"✅ Image opened in background: {expanded_path}"
                    }
                ]
            }
        else:
            # Run in foreground
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"✅ Image opened successfully: {expanded_path}"
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Failed to open image: {result.stderr}"
                        }
                    ]
                }
    
    except subprocess.TimeoutExpired:
        return {
            "content": [
                {
                    "type": "text",
                    "text": "❌ Image viewer timed out"
                }
            ]
        }
    except Exception as e:
        logger.exception("Error opening image: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error opening image: {e!s}"
                }
            ]
        }