#!/usr/bin/env python3
"""
Formatting Service
==================

Core service for orchestrating all code formatting operations.
Follows the 100-line axiom and modular architecture principles.
"""

import asyncio
import logging
import subprocess
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class FormattingService:
    """Handles all code formatting operations across different languages."""

    def __init__(self, project_root: Path | None = None):
        # Default to the Reynard project root
        if project_root is None:
            # Go up from scripts/mcp to the project root
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

    async def format_frontend(self, check_only: bool = False) -> dict[str, Any]:
        """Run Prettier on frontend code."""
        command = ["pnpm", "run", "format:check" if check_only else "format"]
        return await self.run_command(command)

    async def format_python(self, check_only: bool = False) -> dict[str, Any]:
        """Run Python formatting tools (Black + isort)."""
        command = [
            "pnpm",
            "run",
            "python:format:check" if check_only else "python:format",
        ]
        return await self.run_command(command)

    async def format_all(self, check_only: bool = False) -> dict[str, Any]:
        """Format all code in the project."""
        results = {}

        # Run all formatting operations
        results["frontend"] = await self.format_frontend(check_only)
        results["python"] = await self.format_python(check_only)

        # Determine overall success
        overall_success = all(
            result.get("success", False) for result in results.values()
        )

        return {
            "success": overall_success,
            "results": results,
            "summary": self._generate_summary(results, check_only),
        }

    def _generate_summary(self, results: dict[str, Any], check_only: bool) -> str:
        """Generate a summary of formatting results."""
        total = len(results)
        passed = sum(1 for result in results.values() if result.get("success", False))
        failed = total - passed

        action = "Formatting check" if check_only else "Formatting"
        return f"{action} Summary: {passed}/{total} passed, {failed} failed"
