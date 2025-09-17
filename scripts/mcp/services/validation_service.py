#!/usr/bin/env python3
"""
Validation Service
==================

Core service for orchestrating custom validation scripts and operations.
Follows the 100-line axiom and modular architecture principles.
"""

import asyncio
import logging
import subprocess
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class ValidationService:
    """Handles all custom validation operations and scripts."""

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
            logger.exception("Command execution failed: %s", e)
            return {
                "success": False,
                "returncode": -1,
                "stdout": "",
                "stderr": str(e),
                "command": " ".join(command),
            }

    async def validate_markdown_toc(self, fix: bool = False) -> dict[str, Any]:
        """Validate markdown table of contents."""
        command = ["pnpm", "run", "markdown:toc:fix" if fix else "markdown:toc:check"]
        return await self.run_command(command)

    async def validate_markdown_links(self, check_all: bool = False) -> dict[str, Any]:
        """Validate markdown links."""
        command = [
            "pnpm",
            "run",
            "markdown:links:check:all" if check_all else "markdown:links:check",
        ]
        return await self.run_command(command)

    async def validate_markdown_sentences(self, fix: bool = False) -> dict[str, Any]:
        """Validate markdown sentence length."""
        command = [
            "pnpm",
            "run",
            "markdown:sentence:fix" if fix else "markdown:sentence:check",
        ]
        return await self.run_command(command)

    async def validate_css_variables(self) -> dict[str, Any]:
        """Validate CSS custom properties usage."""
        return await self.run_command(
            ["node", "scripts/validation/css/validate-css-variables.js"]
        )

    async def validate_python_lines(self) -> dict[str, Any]:
        """Validate Python file line counts."""
        return await self.run_command(["pnpm", "run", "python:linecheck"])

    async def run_comprehensive_validation(self, fix: bool = False) -> dict[str, Any]:
        """Run all validation scripts comprehensively."""
        results = {}

        # Run all validation operations
        results["markdown_toc"] = await self.validate_markdown_toc(fix)
        results["markdown_links"] = await self.validate_markdown_links(True)
        results["markdown_sentences"] = await self.validate_markdown_sentences(fix)
        results["css_variables"] = await self.validate_css_variables()
        results["python_lines"] = await self.validate_python_lines()

        # Determine overall success
        overall_success = all(
            result.get("success", False) for result in results.values()
        )

        return {
            "success": overall_success,
            "results": results,
            "summary": self._generate_summary(results),
        }

    def _generate_summary(self, results: dict[str, Any]) -> str:
        """Generate a summary of validation results."""
        total = len(results)
        passed = sum(1 for result in results.values() if result.get("success", False))
        failed = total - passed

        return f"Validation Summary: {passed}/{total} passed, {failed} failed"
