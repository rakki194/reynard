#!/usr/bin/env python3
"""
Version Service
===============

Service for detecting and reporting versions of development tools and languages.
Follows the 100-line axiom and modular architecture principles.
"""

import asyncio
import logging
import subprocess
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class VersionService:
    """Handles version detection for various development tools and languages."""

    NOT_AVAILABLE = "Not available"

    def __init__(self, project_root: Path | None = None):
        # Default to the Reynard project root
        if project_root is None:
            # Go up from services/mcp-server to the project root
            current_dir = Path(__file__).parent
            self.project_root = current_dir.parent.parent
        else:
            self.project_root = project_root

    async def run_command(
        self, command: list[str], cwd: Path | None = None
    ) -> dict[str, Any]:
        """Execute a command and return structured results."""
        working_dir = cwd or self.project_root

        try:
            logger.info("Running command: %s", " ".join(command))
            result = await asyncio.create_subprocess_exec(
                *command,
                cwd=working_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )

            stdout_bytes, stderr_bytes = await result.communicate()
            stdout = stdout_bytes.decode("utf-8")
            stderr = stderr_bytes.decode("utf-8")

            return {
                "success": result.returncode == 0,
                "returncode": result.returncode,
                "stdout": stdout.strip(),
                "stderr": stderr.strip(),
                "command": " ".join(command),
            }

        except Exception as e:
            logger.exception("Command execution failed")
            return {
                "success": False,
                "returncode": -1,
                "stdout": "",
                "stderr": str(e),
                "command": " ".join(command),
            }

    async def get_python_version(self) -> dict[str, Any]:
        """Get Python version information."""
        result = await self.run_command(["python3", "--version"])
        if result["success"]:
            return {"version": result["stdout"], "available": True}
        return {"version": self.NOT_AVAILABLE, "available": False}

    async def get_node_version(self) -> dict[str, Any]:
        """Get Node.js version information."""
        result = await self.run_command(["node", "--version"])
        if result["success"]:
            return {"version": result["stdout"], "available": True}
        return {"version": self.NOT_AVAILABLE, "available": False}

    async def get_npm_version(self) -> dict[str, Any]:
        """Get npm version information."""
        result = await self.run_command(["npm", "--version"])
        if result["success"]:
            return {"version": result["stdout"], "available": True}
        return {"version": self.NOT_AVAILABLE, "available": False}

    async def get_pnpm_version(self) -> dict[str, Any]:
        """Get pnpm version information."""
        result = await self.run_command(["pnpm", "--version"])
        if result["success"]:
            return {"version": result["stdout"], "available": True}
        return {"version": self.NOT_AVAILABLE, "available": False}

    async def get_typescript_version(self) -> dict[str, Any]:
        """Get TypeScript version information."""
        result = await self.run_command(["npx", "tsc", "--version"])
        if result["success"]:
            return {"version": result["stdout"], "available": True}
        return {"version": self.NOT_AVAILABLE, "available": False}

    async def get_all_versions(self) -> dict[str, Any]:
        """Get all available version information."""
        versions = {}

        # Get all versions in parallel
        version_tasks = [
            ("python", self.get_python_version()),
            ("node", self.get_node_version()),
            ("npm", self.get_npm_version()),
            ("pnpm", self.get_pnpm_version()),
            ("typescript", self.get_typescript_version()),
        ]

        for name, task in version_tasks:
            versions[name] = await task

        return {
            "success": True,
            "versions": versions,
            "summary": self._generate_version_summary(versions),
        }

    async def get_versions(self) -> dict[str, Any]:
        """Get all available version information."""
        return await self.get_all_versions()

    def _generate_version_summary(self, versions: dict[str, Any]) -> str:
        """Generate a summary of available versions."""
        available = [
            name for name, info in versions.items() if info.get("available", False)
        ]
        unavailable = [
            name for name, info in versions.items() if not info.get("available", False)
        ]

        summary = f"Available: {', '.join(available)}"
        if unavailable:
            summary += f" | Unavailable: {', '.join(unavailable)}"

        return summary
