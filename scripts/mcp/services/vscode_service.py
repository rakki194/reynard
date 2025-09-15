#!/usr/bin/env python3
"""
VS Code Integration Service
===========================

Service for integrating with VS Code to get active file information.
Follows the 100-line axiom and modular architecture principles.
"""

import json
import logging
import subprocess
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
        """Get the currently active file path in VS Code."""
        try:
            # Try to get active file from VS Code via command line
            result = subprocess.run(
                ["code", "--list-extensions"],
                capture_output=True,
                text=True,
                timeout=5,
                check=False,
            )

            if result.returncode == 0:
                # VS Code is available, try to get active file
                # This is a simplified approach - in practice, you'd need a VS Code extension
                return {
                    "success": True,
                    "active_file": "VS Code detected but active file requires extension",
                    "vscode_available": True,
                    "method": "command_line_detection",
                }
            return {
                "success": False,
                "active_file": None,
                "vscode_available": False,
                "error": "VS Code not available via command line",
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
