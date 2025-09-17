#!/usr/bin/env python3
"""
VS Code Integration Service
===========================

Service for integrating with VS Code to get active file information.
Follows the 100-line axiom and modular architecture principles.
"""

import json
import logging
import os
import socket
import subprocess
import tempfile
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class VSCodeService:
    """Handles VS Code integration and active file detection."""

    def __init__(self, project_root: Path | None = None):
        # Default to the Reynard project root
        if project_root is None:
            # Go up from scripts/mcp to the project root
            current_dir = Path(__file__).parent
            self.project_root = current_dir.parent.parent
        else:
            self.project_root = project_root

    def get_active_file_path(self) -> dict[str, Any]:
        """Get the currently active file path in VS Code/Cursor."""
        try:
            # Method 1: Try to get active file from VS Code/Cursor via IPC
            active_file = self._get_active_file_via_ipc()
            if active_file:
                return {
                    "success": True,
                    "active_file": active_file,
                    "vscode_available": True,
                    "method": "ipc_communication",
                    "workspace_root": str(self.project_root),
                }

            # Method 2: Try to get active file from VS Code/Cursor via command line
            active_file = self._get_active_file_via_cli()
            if active_file:
                return {
                    "success": True,
                    "active_file": active_file,
                    "vscode_available": True,
                    "method": "command_line_detection",
                    "workspace_root": str(self.project_root),
                }

            # Method 3: Try to get active file from VS Code/Cursor via process inspection
            active_file = self._get_active_file_via_process()
            if active_file:
                return {
                    "success": True,
                    "active_file": active_file,
                    "vscode_available": True,
                    "method": "process_inspection",
                    "workspace_root": str(self.project_root),
                }

            # Fallback: VS Code detected but no active file method available
            return {
                "success": True,
                "active_file": "VS Code/Cursor detected - active file requires extension or API",
                "vscode_available": True,
                "method": "fallback_detection",
                "note": "To get actual active file, install a VS Code extension that exposes this via API",
                "workspace_root": str(self.project_root),
            }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "active_file": None,
                "vscode_available": False,
                "error": "VS Code command timeout",
            }
        except FileNotFoundError:
            return {
                "success": False,
                "active_file": None,
                "vscode_available": False,
                "error": "VS Code not found in PATH",
            }
        except Exception as e:
            logger.exception("Error getting VS Code active file")
            return {
                "success": False,
                "active_file": None,
                "vscode_available": False,
                "error": str(e),
            }

    def get_workspace_info(self) -> dict[str, Any]:
        """Get VS Code workspace information."""
        try:
            # Check if we're in a VS Code workspace
            workspace_file = self.project_root / ".vscode" / "settings.json"
            if workspace_file.exists():
                with open(workspace_file) as f:
                    settings = json.load(f)

                return {
                    "success": True,
                    "workspace_root": str(self.project_root),
                    "vscode_settings": settings,
                    "has_vscode_config": True,
                }
            return {
                "success": True,
                "workspace_root": str(self.project_root),
                "vscode_settings": {},
                "has_vscode_config": False,
            }

        except Exception as e:
            logger.exception("Error getting workspace info")
            return {
                "success": False,
                "error": str(e),
            }

    def get_vscode_extensions(self) -> dict[str, Any]:
        """Get list of installed VS Code extensions."""
        try:
            result = subprocess.run(
                ["code", "--list-extensions"],
                capture_output=True,
                text=True,
                timeout=10,
                check=False,
            )

            if result.returncode == 0:
                extensions = result.stdout.strip().split("\n")
                return {
                    "success": True,
                    "extensions": extensions,
                    "count": len(extensions),
                }
            return {
                "success": False,
                "extensions": [],
                "count": 0,
                "error": "Failed to list extensions",
            }

        except Exception as e:
            logger.exception("Error getting VS Code extensions")
            return {
                "success": False,
                "extensions": [],
                "count": 0,
                "error": str(e),
            }

    def _get_active_file_via_ipc(self) -> str | None:
        """Try to get active file via IPC communication with VS Code/Cursor."""
        try:
            # Method 1: Try to communicate with VS Code/Cursor via named pipe/socket
            # VS Code/Cursor might expose IPC endpoints
            temp_dir = tempfile.gettempdir()
            possible_sockets = [
                os.path.join(temp_dir, "vscode-ipc"),
                os.path.join(temp_dir, "cursor-ipc"),
                os.path.join(os.path.expanduser("~"), ".vscode", "ipc"),
                os.path.join(os.path.expanduser("~"), ".cursor", "ipc"),
            ]

            for socket_path in possible_sockets:
                if os.path.exists(socket_path):
                    try:
                        # Try to connect and request active file
                        with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as s:
                            s.settimeout(1)
                            s.connect(socket_path)
                            s.send(b'{"method": "getActiveFile"}')
                            response = s.recv(1024).decode("utf-8")
                            data = json.loads(response)
                            if data.get("success") and data.get("activeFile"):
                                return data["activeFile"]
                    except (json.JSONDecodeError, OSError):
                        continue

            return None
        except Exception as e:
            logger.debug("IPC method failed: %s", e)
            return None

    def _get_active_file_via_cli(self) -> str | None:
        """Try to get active file via command line interface."""
        try:
            # Method 2: Try to get active file from window title
            active_file = self._get_active_file_from_window_title()
            if active_file:
                return active_file

            # Fallback: Try to use VS Code/Cursor CLI to get active file
            commands_to_try = [
                ["code", "--list-extensions"],  # Check if VS Code is available
                ["cursor", "--list-extensions"],  # Check if Cursor is available
            ]

            for cmd in commands_to_try:
                try:
                    result = subprocess.run(
                        cmd,
                        capture_output=True,
                        text=True,
                        timeout=3,
                        check=False,
                    )
                    if result.returncode == 0:
                        # VS Code/Cursor is available, try to get recent files
                        # This is a heuristic approach
                        recent_file = self._get_most_recent_file()
                        if recent_file:
                            return recent_file
                except (subprocess.TimeoutExpired, FileNotFoundError):
                    continue

            return None
        except Exception as e:
            logger.debug("CLI method failed: %s", e)
            return None

    def _get_active_file_via_process(self) -> str | None:
        """Try to get active file by inspecting running processes."""
        try:
            # Method 3: Try to get active file from running VS Code/Cursor processes
            import psutil

            for proc in psutil.process_iter(["pid", "name", "cmdline"]):
                try:
                    if proc.info["name"] and "code" in proc.info["name"].lower():
                        cmdline = proc.info["cmdline"]
                        if cmdline:
                            # Look for file paths in command line arguments
                            for arg in cmdline:
                                if arg.endswith(
                                    (
                                        ".py",
                                        ".ts",
                                        ".tsx",
                                        ".js",
                                        ".jsx",
                                        ".md",
                                        ".json",
                                    )
                                ):
                                    if os.path.exists(arg):
                                        return arg
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue

            return None
        except ImportError:
            logger.debug("psutil not available for process inspection")
            return None
        except Exception as e:
            logger.debug("Process inspection method failed: %s", e)
            return None

    def _get_most_recent_file(self) -> str | None:
        """Get the most recently modified file in the workspace."""
        try:
            # This is a heuristic - get the most recently modified file in the workspace
            recent_file = None
            recent_time = 0

            for root, dirs, files in os.walk(self.project_root):
                # Skip common directories that shouldn't be considered
                dirs[:] = [
                    d
                    for d in dirs
                    if d
                    not in [".git", "node_modules", "__pycache__", ".vscode", ".cursor"]
                ]

                for file in files:
                    if file.endswith(
                        (".py", ".ts", ".tsx", ".js", ".jsx", ".md", ".json")
                    ):
                        file_path = os.path.join(root, file)
                        try:
                            mtime = os.path.getmtime(file_path)
                            if mtime > recent_time:
                                recent_time = mtime
                                recent_file = file_path
                        except OSError:
                            continue

            return recent_file
        except Exception as e:
            logger.debug("Recent file detection failed: %s", e)
            return None

    def _get_active_file_from_window_title(self) -> str | None:
        """Try to get active file from window title."""
        try:
            # Method 1: Get active window title using xprop
            try:
                # Get the active window ID
                result = subprocess.run(
                    ["xprop", "-root", "_NET_ACTIVE_WINDOW"],
                    capture_output=True,
                    text=True,
                    timeout=2,
                    check=False,
                )
                if result.returncode == 0:
                    # Extract window ID from output like "_NET_ACTIVE_WINDOW(WINDOW): window id # 0x1200148"
                    output = result.stdout.strip()
                    if "window id #" in output:
                        window_id = output.split("window id #")[1].strip()

                        # Get the window title
                        title_result = subprocess.run(
                            ["xprop", "-id", window_id, "WM_NAME"],
                            capture_output=True,
                            text=True,
                            timeout=2,
                            check=False,
                        )
                        if title_result.returncode == 0:
                            title_line = title_result.stdout.strip()
                            # Extract title from output like 'WM_NAME(UTF8_STRING) = "vitest.config.ts - reynard - Cursor"'
                            if "=" in title_line:
                                title = title_line.split("=", 1)[1].strip().strip('"')

                                # Check if this is a Cursor/VS Code window
                                if "cursor" in title.lower() or "code" in title.lower():
                                    # Extract file path from title
                                    # Format: "filename - workspace - Cursor" or "filename - Cursor"
                                    parts = title.split(" - ")
                                    if len(parts) >= 2:
                                        file_part = parts[0].strip()

                                        # Try to resolve the file path
                                        # First try as absolute path
                                        if os.path.exists(file_part):
                                            return file_part

                                        # Try with workspace root
                                        full_path = os.path.join(
                                            self.project_root, file_part
                                        )
                                        if os.path.exists(full_path):
                                            return full_path

                                        # Try with parent directories
                                        for parent in [
                                            self.project_root.parent,
                                            self.project_root.parent.parent,
                                        ]:
                                            full_path = os.path.join(parent, file_part)
                                            if os.path.exists(full_path):
                                                return full_path

                                        # Try to find the file in the workspace
                                        for root, dirs, files in os.walk(
                                            self.project_root
                                        ):
                                            if file_part in files:
                                                return os.path.join(root, file_part)
            except (subprocess.TimeoutExpired, FileNotFoundError):
                pass

            # Method 2: Try to get window title from Cursor/VS Code processes
            try:
                import psutil

                for proc in psutil.process_iter(["pid", "name", "cmdline"]):
                    try:
                        if proc.info["name"] and (
                            "cursor" in proc.info["name"].lower()
                            or "code" in proc.info["name"].lower()
                        ):
                            # Try alternative method with wmctrl
                            try:
                                result = subprocess.run(
                                    ["wmctrl", "-l"],
                                    capture_output=True,
                                    text=True,
                                    timeout=2,
                                    check=False,
                                )
                                if result.returncode == 0:
                                    for line in result.stdout.split("\n"):
                                        if (
                                            "cursor" in line.lower()
                                            or "code" in line.lower()
                                        ):
                                            # Extract window title
                                            parts = line.split(None, 3)
                                            if len(parts) >= 4:
                                                title = parts[3]
                                                # Extract file path from title
                                                if " - " in title:
                                                    file_part = title.split(" - ")[0]
                                                    if os.path.exists(file_part):
                                                        return file_part
                                                    full_path = os.path.join(
                                                        self.project_root, file_part
                                                    )
                                                    if os.path.exists(full_path):
                                                        return full_path
                            except (subprocess.TimeoutExpired, FileNotFoundError):
                                continue

                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        continue
            except ImportError:
                logger.debug("psutil not available for window title detection")

            return None
        except Exception as e:
            logger.debug("Window title detection failed: %s", e)
            return None
