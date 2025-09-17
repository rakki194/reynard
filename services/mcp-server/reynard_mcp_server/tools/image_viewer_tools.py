#!/usr/bin/env python3
"""
Image Viewer Tool Handlers
==========================

Handles image viewing MCP tool calls using imv.
Follows the 100-line axiom and modular architecture principles.
"""

import asyncio
import logging
import os
import subprocess
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class ImageViewerTools:
    """Handles image viewing tool operations."""

    def __init__(self) -> None:
        """Initialize the image viewer tools."""
        self.supported_formats = {
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".bmp",
            ".webp",
            ".tiff",
            ".svg",
        }

    def _expand_path(self, path: str) -> str:
        """Expand tilde and resolve path."""
        return str(Path(path).expanduser().resolve())

    def _is_image_file(self, file_path: str) -> bool:
        """Check if file is a supported image format."""
        return Path(file_path).suffix.lower() in self.supported_formats

    def _check_imv_available(self) -> bool:
        """Check if imv is available on the system."""
        try:
            # Use which to check if imv is in PATH
            result = subprocess.run(["which", "imv"], capture_output=True, check=True)
            return result.returncode == 0
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

    async def open_image(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Open an image file with imv."""
        image_path = self._expand_path(arguments["image_path"])
        background = arguments.get("background", True)
        fullscreen = arguments.get("fullscreen", False)

        # Validate image file
        if not os.path.exists(image_path):
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error: Image file not found: {image_path}",
                    }
                ]
            }

        if not self._is_image_file(image_path):
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error: Unsupported image format: {image_path}",
                    }
                ]
            }

        # Check if imv is available
        if not self._check_imv_available():
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "Error: imv image viewer is not installed or not available in PATH",
                    }
                ]
            }

        # Build imv command
        cmd = ["imv", image_path]
        if fullscreen:
            cmd.append("--fullscreen")

        try:
            if background:
                # Run in background
                subprocess.Popen(
                    cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
                )
                result_text = f"Opened image in background: {image_path}"
            else:
                # Run in foreground (blocking)
                process = await asyncio.create_subprocess_exec(
                    *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await process.communicate()

                if process.returncode == 0:
                    result_text = f"Opened image: {image_path}"
                else:
                    result_text = f"Error opening image: {stderr.decode() if stderr else 'Unknown error'}"

            return {
                "content": [
                    {
                        "type": "text",
                        "text": result_text,
                    }
                ]
            }

        except Exception as e:
            logger.exception("Error opening image: %s", e)
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error opening image: {e!s}",
                    }
                ]
            }

    async def search_images(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Search for image files in a directory."""
        directory = self._expand_path(arguments.get("directory", "~"))
        pattern = arguments.get("pattern", "*.{jpg,jpeg,png,gif,bmp,webp}")
        recursive = arguments.get("recursive", True)
        max_results = arguments.get("max_results", 20)

        if not os.path.exists(directory):
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error: Directory not found: {directory}",
                    }
                ]
            }

        try:
            # Use find command for efficient searching
            find_cmd = ["find", directory]
            if not recursive:
                find_cmd.extend(["-maxdepth", "1"])

            # Add file type filters
            find_cmd.extend(["-type", "f"])

            # Add pattern matching
            if pattern.startswith("*."):
                extensions = pattern[2:].strip("{}").split(",")
                find_cmd.extend(["("])
                for i, ext in enumerate(extensions):
                    if i > 0:
                        find_cmd.extend(["-o"])
                    find_cmd.extend(["-iname", f"*.{ext.strip()}"])
                find_cmd.extend([")"])

            # Execute find command
            result = subprocess.run(
                find_cmd, capture_output=True, text=True, timeout=30, check=False
            )

            if result.returncode != 0:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"Error searching for images: {result.stderr}",
                        }
                    ]
                }

            # Process results
            image_files = [
                line.strip() for line in result.stdout.split("\n") if line.strip()
            ]
            image_files = image_files[:max_results]

            if not image_files:
                result_text = f"No image files found in {directory}"
            else:
                result_text = f"Found {len(image_files)} image files in {directory}:\n"
                for i, img_file in enumerate(image_files, 1):
                    result_text += f"{i}. {img_file}\n"

            return {
                "content": [
                    {
                        "type": "text",
                        "text": result_text,
                    }
                ]
            }

        except subprocess.TimeoutExpired:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "Error: Search timed out (directory too large)",
                    }
                ]
            }
        except Exception as e:
            logger.exception("Error searching for images: %s", e)
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error searching for images: {e!s}",
                    }
                ]
            }

    async def get_image_info(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get information about an image file."""
        image_path = self._expand_path(arguments["image_path"])

        if not os.path.exists(image_path):
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error: Image file not found: {image_path}",
                    }
                ]
            }

        try:
            # Get file stats
            stat = os.stat(image_path)
            file_size = stat.st_size
            modified_time = stat.st_mtime

            # Try to get image dimensions using identify (ImageMagick) if available
            dimensions = "Unknown"
            try:
                result = subprocess.run(
                    ["identify", "-format", "%wx%h", image_path],
                    capture_output=True,
                    text=True,
                    timeout=10,
                    check=False,
                )
                if result.returncode == 0:
                    dimensions = result.stdout.strip()
            except (
                subprocess.CalledProcessError,
                FileNotFoundError,
                subprocess.TimeoutExpired,
            ):
                pass

            # Format file size
            if file_size < 1024:
                size_str = f"{file_size} B"
            elif file_size < 1024**2:
                size_str = f"{file_size / 1024:.1f} KB"
            elif file_size < 1024**3:
                size_str = f"{file_size / (1024**2):.1f} MB"
            else:
                size_str = f"{file_size / (1024**3):.1f} GB"

            # Format modification time
            from datetime import datetime

            mod_time = datetime.fromtimestamp(modified_time).strftime(
                "%Y-%m-%d %H:%M:%S"
            )

            info_text = "Image Information:\n"
            info_text += f"Path: {image_path}\n"
            info_text += f"Size: {size_str}\n"
            info_text += f"Dimensions: {dimensions}\n"
            info_text += f"Modified: {mod_time}\n"
            info_text += f"Format: {Path(image_path).suffix.upper()}"

            return {
                "content": [
                    {
                        "type": "text",
                        "text": info_text,
                    }
                ]
            }

        except Exception as e:
            logger.exception("Error getting image info: %s", e)
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error getting image info: {e!s}",
                    }
                ]
            }
